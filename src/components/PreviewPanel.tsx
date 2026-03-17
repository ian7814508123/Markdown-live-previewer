import React, { forwardRef, useState, useEffect, useRef, useMemo } from 'react';
import { AlertCircle, Trash2, RefreshCw, Sparkles, ZoomIn, ZoomOut, Maximize, Hand } from 'lucide-react';
import MarkdownPreview from './MarkdownPreview';

/** ── PageBreaksOverlay ──────────────────────────────────────────────────
 * 根據內容高度與每頁可用高度，動態計算並繪製分頁線
 */
const PageBreaksOverlay: React.FC<{
    contentHeight: number;
    pageHeightPx: number;
    isVisible: boolean;
}> = ({ contentHeight, pageHeightPx, isVisible }) => {
    if (!isVisible || contentHeight <= pageHeightPx) return null;

    const pageCount = Math.floor(contentHeight / pageHeightPx);
    const indicators = Array.from({ length: pageCount }, (_, i) => i + 1);

    return (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            {indicators.map(page => (
                <div
                    key={page}
                    className="page-break-indicator absolute left-0 right-0"
                    style={{ top: `${page * pageHeightPx}px` }}
                />
            ))}
        </div>
    );
};

// ── MarkdownPreviewSection ──────────────────────────────────────────────────
// 導入独立元件避免在 forwardRef 內部的條件分支中呼叫 hooks（違反 Rules of Hooks）
// activatedDocIds 追蹤「已被用戶訪問過的 tab」，尚未訪問的 tab 不會在背景被渲染
// 這就消除了 MathJax 在 display:none 容器中渲染時發生的 null DOM 錯誤
interface MarkdownPreviewSectionProps {
    markdownDocIds: string[];
    currentDocId?: string | null;
    documents?: any[];
    theme: any;
    isDarkMode: boolean;
    code: string;
    onSelectDocument?: (docId: string) => void;
    onCreateMissing?: (name: string) => void;
    onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    scrollRef: React.Ref<HTMLDivElement>;
    printSettings: any;
}

const MarkdownPreviewSection: React.FC<MarkdownPreviewSectionProps> = ({
    markdownDocIds,
    currentDocId,
    documents,
    theme,
    isDarkMode,
    code,
    onSelectDocument,
    onCreateMissing,
    onScroll,
    onMouseEnter,
    onMouseLeave,
    scrollRef,
    printSettings,
}) => {
    // 當前文件物件
    const currentDoc = documents?.find((d: any) => d.id === currentDocId);
    const { showPrintPreview, mergeVaultOnPdfExport, paperSize, orientation, margin, scale } = printSettings;

    // 動態縮放邏輯 (用於 Fit 模式)
    const containerRef = useRef<HTMLDivElement>(null);
    const [fitScale, setFitScale] = useState(1);

    // 內容高度監測 (用於分頁線)
    const [contentHeight, setContentHeight] = useState(0);

    useEffect(() => {
        if (!showPrintPreview || scale !== 'fit') return;

        const calculateScale = () => {
            if (!containerRef.current) return;
            // 獲取容器實際可用寬度 (考慮到 padding)
            const style = window.getComputedStyle(containerRef.current);
            const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
            const containerWidth = containerRef.current.clientWidth - paddingX - 16; // 額外減去 16px 作為緩衝，避免邊界閃爍

            // 紙張基準寬度 (mm)
            let baseWidthMm = 210;
            if (paperSize === 'A4') baseWidthMm = 210;
            else if (paperSize === 'A3') baseWidthMm = 297;
            else if (paperSize === 'Letter') baseWidthMm = 215.9;

            if (orientation === 'landscape') {
                if (paperSize === 'A4') baseWidthMm = 297;
                else if (paperSize === 'A3') baseWidthMm = 420;
                else if (paperSize === 'Letter') baseWidthMm = 279.4;
            }

            // 轉 px (1mm ≈ 3.7795px at 96dpi)
            const baseWidthPx = baseWidthMm * 3.7795;
            const ratio = Math.min(1, containerWidth / baseWidthPx);
            setFitScale(ratio);
        };

        calculateScale();
        // 使用 ResizeObserver 代替 window resize 以便更精確捕捉面板尺寸變化
        const observer = new ResizeObserver(calculateScale);
        if (containerRef.current) observer.observe(containerRef.current);

        return () => observer.disconnect();
    }, [showPrintPreview, scale, paperSize, orientation]);

    const activeScale = scale === 'fit' ? fitScale : (typeof scale === 'number' ? scale / 100 : 1);

    // 計算紙張的原始寬高 (px)
    const getPaperSizePx = () => {
        let w = 210, h = 297;
        if (paperSize === 'A3') { w = 297; h = 420; }
        else if (paperSize === 'Letter') { w = 215.9; h = 279.4; }

        if (orientation === 'landscape') [w, h] = [h, w];
        return { w: w * 3.7795, h: h * 3.7795 };
    };
    const paperPx = getPaperSizePx();

    // 監控內容高度 (包裹在單個分頁佈局中的情況下)
    useEffect(() => {
        if (!showPrintPreview) return;

        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                setContentHeight(entry.contentRect.height);
            }
        });

        // 監控 prose-container 的高度
        const elements = document.querySelectorAll('.prose-container');
        elements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, [showPrintPreview, documents, code]); // 依賴項包含內容異動

    // 「已啟動 docId」：記錄曾被訪問過的 tab，只為它們渲染 MarkdownPreview
    const [activatedDocIds, setActivatedDocIds] = useState<Set<string>>(() => {
        const init = new Set<string>();
        if (currentDocId) init.add(currentDocId);
        return init;
    });

    useEffect(() => {
        if (!currentDocId) return;
        setActivatedDocIds(prev => {
            if (prev.has(currentDocId)) return prev;
            const next = new Set(prev);
            next.add(currentDocId);
            return next;
        });
    }, [currentDocId]);

    // 決定要渲染的文件列表
    const docsToRenderIds = useMemo(() => {
        // 如果開啟了「合併儲存庫 (PDF)」或「列印預覽」且當前文件在資料夾中
        if ((mergeVaultOnPdfExport || showPrintPreview) && currentDoc?.folderId) {
            return (documents ?? [])
                .filter((d: any) => d.folderId === currentDoc.folderId && d.mode === 'markdown')
                .map((d: any) => d.id);
        }
        // 否則，只渲染已啟動的分頁
        return markdownDocIds.filter(id => activatedDocIds.has(id));
    }, [mergeVaultOnPdfExport, showPrintPreview, currentDoc?.folderId, documents, markdownDocIds, activatedDocIds]);

    return (
        <section
            className={`flex-1 flex flex-col bg-slate-100 dark:bg-slate-950 relative overflow-hidden group/preview transition-colors duration-200 preview-panel ${showPrintPreview ? 'show-print-preview' : ''}`}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className={`flex-1 relative ${showPrintPreview ? 'overflow-auto custom-scrollbar p-12' : 'overflow-hidden'}`} ref={showPrintPreview ? (node => { containerRef.current = node; if (typeof scrollRef === 'function') scrollRef(node); else if (scrollRef) (scrollRef as any).current = node; }) : undefined} onScroll={showPrintPreview ? onScroll : undefined}>
                <div
                    className={`mx-auto transition-all duration-300 origin-top-left ${showPrintPreview ? 'print-outer-wrapper' : 'max-w-[850px] relative h-full flex flex-col gap-8'}`}
                    style={showPrintPreview ? {
                        width: paperPx.w * activeScale,
                        height: 'auto',
                        minHeight: paperPx.h * activeScale * docsToRenderIds.length
                    } : {}}
                >
                    <div
                        className={showPrintPreview ? 'print-preview-container origin-top-left flex flex-col gap-8' : 'w-full h-full flex flex-col gap-8'}
                        style={showPrintPreview ? {
                            transform: `scale(${activeScale})`,
                            width: paperPx.w,
                        } : {}}
                    >
                        {docsToRenderIds.map(docId => {
                            const doc = documents?.find((d: any) => d.id === docId);
                            const docContent = doc?.content ?? '';
                            const isActive = docId === currentDocId;

                            // 在「列印預覽」或「合併列印」模式下，所有被選中的文件都是 block；否則只有 isActive 是 block
                            const isVisible = (mergeVaultOnPdfExport || showPrintPreview) && currentDoc?.folderId ? true : isActive;

                            return (
                                <div
                                    key={docId}
                                    id={`wikilink-${encodeURIComponent(doc?.name || '')}`}
                                    ref={!showPrintPreview && isActive ? (scrollRef as React.Ref<HTMLDivElement>) : undefined}
                                    onScroll={!showPrintPreview && isActive ? onScroll : undefined}
                                    className={`${showPrintPreview ? 'print-paper paper-' + paperSize.toLowerCase() + ' paper-' + orientation + ' margin-' + margin : 'absolute inset-0 overflow-auto custom-scrollbar p-8 bg-white dark:bg-slate-900'} transition-all duration-300 print:max-w-none print:w-full print:shadow-none print:p-0 print:border-none print:rounded-none ${isVisible ? 'block' : 'hidden'} ${!isActive && !showPrintPreview ? 'tab-inactive' : ''}`}
                                    style={!showPrintPreview ? { display: isVisible ? 'block' : 'none' } : {}}
                                >
                                    <div className={showPrintPreview ? 'prose-container relative' : 'max-w-[850px] mx-auto min-h-full bg-white dark:bg-slate-900 p-12 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-none dark:border dark:border-slate-800 rounded-sm'}>
                                        <MarkdownPreview
                                            content={docContent}
                                            theme={theme}
                                            isDarkMode={isDarkMode}
                                            documents={documents}
                                            onSelectDocument={onSelectDocument}
                                            onCreateMissing={onCreateMissing}
                                            currentDocId={docId}
                                        />
                                        {/* 覆蓋層顯示分頁指示線 */}
                                        {showPrintPreview && (
                                            <PageBreaksOverlay
                                                contentHeight={contentHeight}
                                                pageHeightPx={paperPx.h}
                                                isVisible={showPrintPreview}
                                            />
                                        )}
                                    </div>
                                    {showPrintPreview && <div className="page-break-indicator fixed-bottom-0 opacity-0 pointer-events-none" />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

interface PreviewPanelProps {
    mode: 'mermaid' | 'markdown';
    error: string | null;
    setError: (error: string | null) => void;
    svgContent: string;
    zoom: number;
    position: { x: number; y: number };
    isDragging: boolean;
    onZoom: (delta: number) => void;
    onSetZoom: (zoom: number) => void;
    onResetNav: () => void;
    // Mouse event handlers passed from parent hook
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseUp: () => void;
    onWheel: (e: React.WheelEvent) => void;
    code: string;
    theme: any; // Needed for markdown
    onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
    isDarkMode: boolean;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    documents?: any[];
    onSelectDocument?: (docId: string) => void;
    onCreateMissing?: (name: string) => void;
    currentDocId?: string | null;
    // CSS 快取渲染用：所有已開啟分頁的 id 列表
    openDocIds?: string[];
    printSettings: any;
}

const PreviewPanel = forwardRef<HTMLDivElement, PreviewPanelProps>(({
    mode,
    error,
    setError,
    svgContent,
    zoom,
    position,
    isDragging,
    onZoom,
    onSetZoom,
    onResetNav,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onWheel,
    code,
    theme,
    onScroll,
    isDarkMode,
    onMouseEnter,
    onMouseLeave,
    documents,
    onSelectDocument,
    onCreateMissing,
    currentDocId,
    openDocIds,
    printSettings,
}, ref) => {

    // DIFFERENT LAYOUT STRATEGY BASED ON MODE
    if (mode === 'markdown') {
        const markdownDocIds = (openDocIds ?? [currentDocId].filter(Boolean) as string[])
            .filter(id => {
                const doc = documents?.find((d: any) => d.id === id);
                return doc?.mode === 'markdown';
            });

        return (
            <MarkdownPreviewSection
                markdownDocIds={markdownDocIds}
                currentDocId={currentDocId}
                documents={documents}
                theme={theme}
                isDarkMode={isDarkMode}
                code={code}
                onSelectDocument={onSelectDocument}
                onCreateMissing={onCreateMissing}
                onScroll={onScroll}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                scrollRef={ref}
                printSettings={printSettings}
            />
        );
    }

    return (
        <section
            className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-950 relative overflow-hidden group/preview transition-colors duration-200 preview-panel"
            onWheel={onWheel}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {error && (
                <div className="absolute top-6 left-6 right-6 z-40 flex flex-col gap-3 p-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl text-red-800 dark:text-red-200 shadow-2xl animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-red-100 rounded-lg text-red-600"><AlertCircle size={20} /></div>
                        <div className="text-xs flex-1">
                            <p className="font-black text-sm mb-1 uppercase tracking-tight">Syntax Error Detected</p>
                            <p className="opacity-80 leading-relaxed font-mono whitespace-pre-wrap break-all">{error}</p>
                        </div>
                        <button onClick={() => setError(null)} className="shrink-0 text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                    </div>
                </div>
            )}

            {/* Floating Controls */}
            <div className="absolute bottom-16 right-8 z-30 flex flex-col gap-3 opacity-0 group-hover/preview:opacity-100 transition-all duration-500 translate-y-4 group-hover/preview:translate-y-0">
                <button onClick={() => onZoom(25)} className="p-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all active:scale-90 ring-1 ring-black/5" title="放大"><ZoomIn size={22} /></button>
                <button onClick={() => onZoom(-25)} className="p-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all active:scale-90 ring-1 ring-black/5" title="缩小"><ZoomOut size={22} /></button>
                <button onClick={onResetNav} className="p-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all active:scale-90 ring-1 ring-black/5" title="居中"><Maximize size={22} /></button>
            </div>

            {/* Main Viewport */}
            <div
                className={`flex-1 overflow-hidden relative ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                style={{
                    backgroundImage: isDarkMode ? 'radial-gradient(circle, #475569 1.5px, transparent 1.5px)' : 'radial-gradient(circle, #cbd5e1 1.5px, transparent 1.5px)',
                    backgroundSize: '32px 32px'
                }}
            >
                <div
                    ref={ref}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px)`,
                        transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                    }}
                >
                    {/* Mermaid Preview */}
                    {svgContent ? (
                        <div
                            className="bg-white dark:bg-slate-800 p-16 rounded-[2.5rem] shadow-2xl border border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 ease-out pointer-events-auto"
                            style={{ transform: `scale(${zoom / 100})` }}
                            dangerouslySetInnerHTML={{ __html: svgContent }}
                        />
                    ) : !error && (
                        <div className="text-slate-400 text-center flex flex-col items-center">
                            <div className="relative mb-6">
                                <RefreshCw size={64} className="opacity-10 animate-spin duration-[3s]" />
                                <Sparkles size={32} className="absolute inset-0 m-auto text-indigo-400/30 animate-pulse" />
                            </div>
                            <p className="text-sm font-bold uppercase tracking-[0.3em] opacity-40">編譯圖表</p>
                        </div>
                    )}

                    {error && !svgContent && (
                        <div className="text-slate-300 text-center flex flex-col items-center max-w-sm">
                            <AlertCircle size={80} className="mb-6 opacity-20" />
                            <p className="text-sm font-bold uppercase tracking-[0.2em] opacity-40">Awaiting Valid Syntax</p>
                            <p className="text-xs mt-2 font-medium opacity-30">The editor will refresh automatically once errors are resolved.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Status Bar */}
            <div className="h-10 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.2em] shrink-0 z-30 transition-colors duration-200">
                <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full border-2 ${error ? 'bg-red-500 border-red-200' : 'bg-green-500 border-green-200 animate-pulse'}`} />
                    <span className={error ? 'text-red-500' : 'text-slate-500'}>{error ? '批判的 語法' : '引擎 準備'}</span>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="opacity-50 text-[9px]">縮放</span>
                        <div className="relative group/zoom">
                            <input
                                type="text"
                                value={`${Math.round(zoom)}%`}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    if (val) onSetZoom(Math.min(Math.max(parseInt(val), 5), 1000));
                                }}
                                className="w-14 text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md tabular-nums border-none outline-none focus:ring-1 focus:ring-indigo-300 text-center transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="opacity-50">位置</span>
                        <span className="text-slate-600 tabular-nums">{Math.round(position.x)}, {Math.round(position.y)}</span>
                    </div>

                </div>
            </div>
        </section>
    );
});

export default PreviewPanel;
