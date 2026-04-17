import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { MathJax } from 'better-react-mathjax';
import rehypeRaw from 'rehype-raw';
import mermaid from 'mermaid';
import embed from 'vega-embed';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import SmilesDrawer from 'smiles-drawer';
import { useImageStorage } from '../hooks/useImageStorage';
import { WrapText } from 'lucide-react';

interface MarkdownPreviewProps {
    content: string;
    theme?: 'default' | 'neutral' | 'dark' | 'forest';
    isDarkMode: boolean;
    documents?: any[];
    onSelectDocument?: (docId: string) => void;
    onCreateMissing?: (name: string) => void;
    currentDocId?: string | null;
    isPrinting?: boolean;
    showPrintPreview?: boolean;
    printSessionId?: number;
}

// ─── 輔助函式：簡單的字串雜湊 ──────────────────────────────────────────────────
// 用於生成基於內容的穩定 Key，防止 React 在內容未變時重新掛載組件
export const hashString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
};

// ─── 持久化 Hook：用於記憶圖表縮放、寬度與高度 ──────────────────────────────────────
export function usePersistentCanvasSettings(storageKey: string, initialWidth: string = '100%', initialScale: number = 1) {
    const [settings, setSettings] = useState(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            return saved ? JSON.parse(saved) : { width: initialWidth, height: 'auto', scale: initialScale };
        } catch {
            return { width: initialWidth, height: 'auto', scale: initialScale };
        }
    });

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(settings));
    }, [settings, storageKey]);

    const updateWidth = useCallback((w: string) => setSettings((s: any) => ({ ...s, width: w })), []);
    const updateHeight = useCallback((h: string) => setSettings((s: any) => ({ ...s, height: h })), []);
    const updateScale = useCallback((sc: number) => setSettings((s: any) => ({ ...s, scale: sc })), []);
    const reset = useCallback(() => setSettings({ width: initialWidth, height: 'auto', scale: initialScale }), [initialWidth, initialScale]);

    return { ...settings, updateWidth, updateHeight, updateScale, reset };
}

// ─── 通用防抖 Hook：用於延遲重型渲染 ──────────────────────────────────────────────
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
}

// ─── 輔助組件：可調整寬度與高度的容器 ────────────────────────────────────────────────
export const ResizableWrapper: React.FC<{
    children: React.ReactNode;
    width: string;
    height: string;
    scale: number;
    onWidthChange: (width: string) => void;
    onHeightChange: (height: string) => void;
    onScaleChange: (scale: number) => void;
    onReset: () => void;
    isDarkMode: boolean;
}> = ({ children, width, height, scale, onWidthChange, onHeightChange, onScaleChange, onReset, isDarkMode }) => {
    return (
        <div className="relative group/resizable my-8 print:my-4 print:p-0">
            <div
                className="mx-auto transition-all duration-300 ease-in-out relative flex justify-center"
                style={{
                    width,
                    maxHeight: height === 'auto' ? 'none' : height,
                    overflow: height === 'auto' ? 'visible' : 'hidden'
                }}
            >
                <div
                    className="print:![transform:none] print:![zoom:var(--print-scale)] w-full"
                    style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center',
                        display: 'flex',
                        justifyContent: 'center',
                        '--print-scale': scale
                    } as any}
                >
                    {children}
                </div>
            </div>

            {/* 調整大小的 UI 面板 - 懸浮於上方 (列印時隱藏) */}
            <div className={`absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/resizable:opacity-100 transition-all duration-300 z-30 pointer-events-none group-hover/resizable:translate-y-0 translate-y-2 print:hidden`}>
                <div className={`pointer-events-auto flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border shadow-2xl backdrop-blur-xl ${isDarkMode
                    ? 'bg-slate-800/95 border-slate-700 text-slate-200'
                    : 'bg-white/95 border-slate-200 text-slate-600'
                    }`}>
                    {/* Width Control */}
                    <div className="flex items-center gap-1.5 border-r border-slate-200/20 pr-2.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider select-none opacity-50">W</span>
                        <input
                            type="range" min="30" max="100" step="5"
                            value={parseInt(width)}
                            onChange={(e) => onWidthChange(`${e.target.value}%`)}
                            className={`w-16 h-1 rounded-lg appearance-none cursor-pointer accent-brand-primary bg-slate-200 dark:bg-slate-700`}
                        />
                        <span className="text-[10px] font-mono min-w-[2.2rem] opacity-70">{width}</span>
                    </div>

                    {/* Height Control */}
                    <div className="flex items-center gap-1.5 border-r border-slate-200/20 pr-2.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider select-none opacity-50">H</span>
                        <input
                            type="range" min="150" max="800" step="10"
                            value={height === 'auto' ? 800 : parseInt(height)}
                            onChange={(e) => onHeightChange(`${e.target.value}px`)}
                            className={`w-16 h-1 rounded-lg appearance-none cursor-pointer accent-teal-500 bg-slate-200 dark:bg-slate-700`}
                        />
                        <span className="text-[10px] font-mono min-w-[2.2rem] opacity-70">{height === 'auto' ? 'Auto' : height}</span>
                    </div>

                    {/* Scale Control */}
                    <div className="flex items-center gap-1.5 border-r border-slate-200/20 pr-2.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider select-none opacity-50">S</span>
                        <input
                            type="range" min="0.5" max="2" step="0.1"
                            value={scale}
                            onChange={(e) => onScaleChange(parseFloat(e.target.value))}
                            className={`w-16 h-1 rounded-lg appearance-none cursor-pointer accent-amber-500 bg-slate-200 dark:bg-slate-700`}
                        />
                        <span className="text-[10px] font-mono min-w-[2.2rem] opacity-70">{scale.toFixed(1)}x</span>
                    </div>

                    {/* Reset Button */}
                    <button
                        onClick={onReset}
                        className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-brand-primary hover:text-white transition-colors duration-200`}
                    >
                        RESET
                    </button>
                </div>
            </div>
        </div>
    );
};

// 初始化 Mermaid 配置，防止其在語法出錯時顯示預設的錯誤 UI
mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    // @ts-ignore - 部分版本類型定義可能未包含此屬性
    suppressError: true, // 關鍵：抑制預設錯誤提示
});

/** 
 * 淨化 Mermaid 生成的 SVG 字串
 * 移除固定的 width 和 height 屬性，改由 CSS 控制，以實現自適應縮放
 */
const cleanMermaidSvg = (svgHtml: string) => {
    return svgHtml
        .replace(/width=".*?"/i, 'width="100%"')
        .replace(/height=".*?"/i, 'height="auto"')
        .replace(/style="max-width:.*?"/i, 'style="max-width: 100%"');
};

const MermaidBlock: React.FC<{ code: string; isDarkMode: boolean; isPrinting?: boolean; showPrintPreview?: boolean; printSessionId?: number }> = React.memo(({ code, isDarkMode, isPrinting, showPrintPreview, printSessionId = 0 }) => {
    const isDark = isDarkMode && !isPrinting && !showPrintPreview;
    const [svg, setSvg] = useState('');
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isMounted = useRef(true);

    // 從程式碼註解中讀取初始設定
    const initialWidth = useMemo(() => {
        const widthMatch = code.match(/%%\s*width:\s*(\d+)%/i);
        return widthMatch ? `${widthMatch[1]}%` : '100%';
    }, [code]);

    const initialScale = useMemo(() => {
        const scaleMatch = code.match(/%%\s*scale:\s*([\d.]+)/i);
        return scaleMatch ? parseFloat(scaleMatch[1]) : 1;
    }, [code]);

    const storageKey = useMemo(() => `chart-size-mermaid:${hashString(code)}`, [code]);
    const { width, height, scale, updateWidth, updateHeight, updateScale, reset } = usePersistentCanvasSettings(
        storageKey, 
        initialWidth, 
        initialScale
    );

    // 套用通用的 Debounce (300ms)
    const debouncedCode = useDebounce(code, 300);
    const renderCode = isPrinting ? code : debouncedCode;

    const notifyMermaidReady = useCallback(() => {
        window.dispatchEvent(new CustomEvent('content-layout-ready'));
        window.dispatchEvent(new CustomEvent('mermaid-render-complete', {
            detail: { blockId: storageKey, printSessionId }
        }));
    }, [storageKey, printSessionId]);

    useEffect(() => {
        if (!renderCode) {
            setSvg('');
            return;
        }

        isMounted.current = true;
        setIsPending(true);
        const timer = setTimeout(async () => {
            try {
                // 恢復標準主題（避免 var() 語法錯誤），後續由 CSS 同步覆蓋
                const isDark = isDarkMode && !isPrinting && !showPrintPreview;
                mermaid.initialize({ 
                    theme: isDark ? 'dark' : 'neutral',
                    fontFamily: 'Inter, system-ui, sans-serif'
                });

                const id = `mermaid-${hashString(renderCode)}`;
                const { svg: renderedSvg } = await mermaid.render(id, renderCode);

                if (isMounted.current) {
                    // 對 SVG 進行處理，確保其能自適應 ResizableWrapper 的寬度
                    setSvg(cleanMermaidSvg(renderedSvg));
                    setError(null);
                    // 通知佈局已就緒（用於列印同步）
                    notifyMermaidReady();
                }
            } catch (err: any) {
                console.error('Mermaid render error:', err);
                if (isMounted.current) {
                    setError(err.message || 'Syntax Error');
                    // 即使出錯也通知，避免列印瑣死
                    notifyMermaidReady();
                }
            } finally {
                if (isMounted.current) {
                    setIsPending(false);
                }
            }
        }, 50); // 內部的渲染延時縮短，主要由外部 useDebounce 控制
    
        return () => {
            isMounted.current = false;
            clearTimeout(timer);
        };
    }, [renderCode, isDark, isDarkMode, isPrinting, showPrintPreview, notifyMermaidReady]);

    const handleReset = () => {
        reset();
    };

    if (!svg && error) {
        return (
            <div className="my-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-mono whitespace-pre-wrap">
                <div className="font-bold mb-2">Mermaid Syntax Error</div>
                {error}
            </div>
        );
    }

    // 列印模式：扁平化，拿掉所有裝飾，讓 SVG 直接適應頁面寬度
    if (isPrinting || showPrintPreview) {
        return (
            <div
                data-mermaid-block="true"
                data-mermaid-block-id={storageKey}
                style={{
                    width: '100%',
                    margin: '1rem 0',
                    display: 'flex',
                    justifyContent: 'center',
                }}
                dangerouslySetInnerHTML={{ __html: svg }}
            />
        );
    }

    // 正常螢幕模式：保留完整互動畫布
    return (
        <ResizableWrapper
            width={width}
            height={height}
            scale={scale}
            onWidthChange={updateWidth}
            onHeightChange={updateHeight}
            onScaleChange={updateScale}
            onReset={handleReset}
            isDarkMode={isDarkMode}
        >
            <div
                data-mermaid-block="true"
                data-mermaid-block-id={storageKey}
                className={`diagram-block-container flex justify-center p-6 rounded-2xl shadow-sm border overflow-auto transition-opacity duration-300 ${isDark ? 'border-slate-700/50' : 'border-slate-200/50'} ${isPending ? 'opacity-50' : 'opacity-100'}`}
                style={{ width: '100%', height: 'auto', backgroundColor: 'var(--code-bg)' }}
                dangerouslySetInnerHTML={{ __html: svg }}
            />
            {isPending && !error && (
                <div className="absolute top-2 right-2">
                    <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                </div>
            )}
            {error && (
                <div className="absolute top-0 left-0 right-0 -mt-3 flex justify-center z-10 pointer-events-none">
                    <div className="bg-red-100 dark:bg-red-900/80 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-200 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-2 backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        Syntax Error - Showing last valid version
                    </div>
                </div>
            )}
        </ResizableWrapper>
    );
});

const VegaBlock: React.FC<{ code: string; isDarkMode: boolean; isPrinting?: boolean; showPrintPreview?: boolean }> = React.memo(({ code, isDarkMode, isPrinting, showPrintPreview }) => {
    const isDark = isDarkMode && !isPrinting && !showPrintPreview;
    const ref = useRef<HTMLDivElement>(null);
    const [isPending, setIsPending] = useState(false);
    const storageKey = useMemo(() => `chart-size-vega:${hashString(code)}`, [code]);
    const { width, height, scale, updateWidth, updateHeight, updateScale, reset } = usePersistentCanvasSettings(storageKey);

    const debouncedCode = useDebounce(code, 400);

    useEffect(() => {
        if (!debouncedCode) return;
        setIsPending(true);
        const timer = setTimeout(async () => {
            if (!ref.current) return;
            try {
                const spec = JSON.parse(debouncedCode);
                await embed(ref.current, spec, { actions: false, theme: isDark ? 'dark' : 'vox' });
            } catch (err) {
                console.error('Vega render error:', err);
            } finally {
                setIsPending(false);
                // 通知佈局已就緒
                window.dispatchEvent(new CustomEvent('content-layout-ready'));
            }
        }, 50);
        return () => clearTimeout(timer);
    }, [debouncedCode, isDark]);

    // 列印模式：扁平化，讓 Vega 容器直接適應頁面寬度
    if (isPrinting || showPrintPreview) {
        return (
            <div
                ref={ref}
                style={{ width: '100%', margin: '1rem 0', minHeight: '200px' }}
            />
        );
    }

    // 正常螢幕模式：保留完整互動畫布
    return (
        <ResizableWrapper
            width={width}
            height={height}
            scale={scale}
            onWidthChange={updateWidth}
            onHeightChange={updateHeight}
            onScaleChange={updateScale}
            onReset={reset}
            isDarkMode={isDarkMode}
        >
            <div
                ref={ref}
                className={`diagram-block-container overflow-auto p-6 rounded-2xl shadow-sm border transition-opacity duration-300 ${isDark ? 'border-slate-700/50' : 'border-slate-200/50'} ${isPending ? 'opacity-50' : 'opacity-100'}`}
                style={{ width: '100%', height: 'auto', backgroundColor: 'var(--code-bg)' }}
            />
            {isPending && (
                <div className="absolute top-2 right-2">
                    <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                </div>
            )}
        </ResizableWrapper>
    );
});

const SmilesBlock: React.FC<{ code: string; isDarkMode: boolean; isPrinting?: boolean; showPrintPreview?: boolean }> = React.memo(({ code, isDarkMode, isPrinting, showPrintPreview }) => {
    const isDark = isDarkMode && !isPrinting && !showPrintPreview;
    const svgRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);
    const storageKey = useMemo(() => `chart-size-smiles:${hashString(code)}`, [code]);
    const { width, height, scale, updateWidth, updateHeight, updateScale, reset } = usePersistentCanvasSettings(storageKey);

    const debouncedCode = useDebounce(code, 500);

    useEffect(() => {
        if (!debouncedCode) return;
        setIsPending(true);
        setError(null);
        const timer = setTimeout(() => {
            if (!svgRef.current) return;
            try {
                const drawer = new SmilesDrawer.SvgDrawer({
                    width: 200,
                    height: 100,
                    padding: 20,
                    bondThickness: 1.2,
                    bondLength: 15,
                    shortBondLength: 0.85,
                    bondSpacing: 4,
                    compactDrawing: true,
                    fontFamily: 'Inter, Arial, sans-serif',
                    terminalCarbons: false,
                    explicitHydrogens: false,
                });

                SmilesDrawer.parse(
                    debouncedCode.trim(),
                    (tree: any) => {
                        if (!svgRef.current) return;
                        // 僅在準備好繪製時才清除舊內容，減少閃爍
                        svgRef.current.innerHTML = '';
                        const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                        svgEl.setAttribute('width', '100%');
                        svgEl.setAttribute('height', 'auto');
                        svgEl.setAttribute('viewBox', '0 0 200 100');
                        svgEl.style.maxHeight = '100%';
                        svgRef.current.appendChild(svgEl);
                        drawer.draw(tree, svgEl, isDark ? 'dark' : 'light');
                        setError(null);
                    },
                    (err: any) => {
                        console.error('SMILES parse error:', err);
                        setError(typeof err === 'string' ? err : (err?.message || 'SMILES 解析失敗'));
                    }
                );
            } catch (err: any) {
                console.error('SMILES render error:', err);
                setError(err?.message || '渲染失敗');
            } finally {
                setIsPending(false);
                // 通知佈局已就緒
                window.dispatchEvent(new CustomEvent('content-layout-ready'));
            }
        }, 50);
        return () => clearTimeout(timer);
    }, [debouncedCode, isDark]);

    if (error) {
        return (
            <div className="my-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-mono whitespace-pre-wrap">
                <div className="font-bold mb-2">⚗️ SMILES 語法錯誤</div>
                {error}
            </div>
        );
    }

    // 列印模式：扁平化，讓 SMILES SVG 直接適應頁面寬度
    if (isPrinting || showPrintPreview) {
        return (
            <div
                ref={svgRef}
                style={{
                    width: '100%',
                    margin: '1rem 0',
                    minHeight: '150px',
                    display: 'flex',
                    justifyContent: 'center',
                }}
            />
        );
    }

    // 正常螢幕模式：保留完整互動畫布
    return (
        <ResizableWrapper
            width={width}
            height={height}
            scale={scale}
            onWidthChange={updateWidth}
            onHeightChange={updateHeight}
            onScaleChange={updateScale}
            onReset={reset}
            isDarkMode={isDarkMode}
        >
            <div
                ref={svgRef}
                className={`diagram-block-container flex justify-center items-center min-h-[200px] p-4 rounded-2xl shadow-sm border overflow-auto transition-opacity duration-300 ${isDark ? 'border-slate-700/50' : 'border-slate-200/50'} ${isPending ? 'opacity-50' : 'opacity-100'}`}
                style={{ width: '100%', height: 'auto', backgroundColor: 'var(--code-bg)' }}
            />
            <div className="absolute bottom-2 right-3 text-[10px] text-slate-400 dark:text-slate-600 font-mono select-none">
                SMILES
            </div>
            {isPending && (
                <div className="absolute top-2 right-2">
                    <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                </div>
            )}
        </ResizableWrapper>
    );
});

const AbcBlock = React.lazy(() => import('./AbcBlock'));

// ─── 本地圖片元件：非同步從 IndexedDB 讀取 Data URL 並顯示 (按需載入) ──────────────────────
interface LocalImageProps {
    id: string;
    alt?: string;
    className?: string;
}

// 建立一個輕量的記憶體快取，避免每次 markdown re-render 時都產生非同步讀取的落差(bounce)
const memoryImageCache = new Map<string, string>();

const LocalImage: React.FC<LocalImageProps & { getImage: (id: string) => Promise<string | null> }> = React.memo(({ id, alt, className, getImage }) => {
    const cached = memoryImageCache.get(id);
    const [src, setSrc] = useState<string | null>(cached || null);
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(cached ? 'loaded' : 'loading');

    useEffect(() => {
        if (cached) {
            window.dispatchEvent(new CustomEvent('content-layout-ready'));
            return;
        }

        let cancelled = false;
        setStatus('loading');
        getImage(id).then(dataUrl => {
            if (cancelled) return;
            if (dataUrl) {
                memoryImageCache.set(id, dataUrl);
                setSrc(dataUrl);
                setStatus('loaded');
            } else {
                setStatus('error');
            }
            // 通知佈局已就緒
            window.dispatchEvent(new CustomEvent('content-layout-ready'));
        }).catch(() => {
            if (!cancelled) {
                setStatus('error');
                window.dispatchEvent(new CustomEvent('content-layout-ready'));
            }
        });
        return () => { cancelled = true; };
    }, [id, getImage]);

    if (status === 'loading') {
        return (
            <div className={`flex flex-col items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/50 animate-pulse w-full min-h-[150px] ${className || ''}`}>
                <span className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs">
                    <span className="w-3 h-3 rounded-full border-2 border-slate-400 border-t-transparent animate-spin inline-block" />
                    載入圖片中…
                </span>
            </div>
        );
    }

    if (status === 'error' || !src) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-500 text-xs">
                ⚠️ 圖片不存在或已到期: {alt || id}
            </span>
        );
    }

    return <img src={src ?? undefined} alt={alt ?? ''} className={className ?? 'rounded-xl max-w-full h-auto'} />;

});

// ─── 可縮放圖片元件：整合 ResizableWrapper ───────────────────────────────────────────
interface ResizableImageProps {
    src: string;
    alt?: string;
    getImage: (id: string) => Promise<string | null>;
    isDarkMode: boolean;
}

const ResizableImage: React.FC<ResizableImageProps> = ({ src, alt, getImage, isDarkMode }) => {
    // ─── 狀態持久化：從 LocalStorage 讀取初始設定 ───────────────────────────────────────
    const storageKey = useMemo(() => `chart-size-img:${src}`, [src]);
    const { width, height, scale, updateWidth, updateHeight, updateScale, reset } = usePersistentCanvasSettings(storageKey);

    const isLocal = src?.startsWith('img-local://');
    const imgId = isLocal ? src.replace('img-local://', '') : '';

    return (
        <ResizableWrapper
            width={width}
            height={height}
            scale={scale}
            onWidthChange={updateWidth}
            onHeightChange={updateHeight}
            onScaleChange={updateScale}
            onReset={reset}
            isDarkMode={isDarkMode}
        >
            {isLocal ? (
                <LocalImage id={imgId} alt={alt} getImage={getImage} />
            ) : (
                <img src={src} alt={alt} className="rounded-xl max-w-full h-auto" />
            )}
            <div className="absolute bottom-2 right-3 text-[10px] text-slate-400 dark:text-slate-600 font-mono select-none pointer-events-none opacity-0 group-hover/resizable:opacity-100 transition-opacity">
                {isLocal ? 'LOCAL IMAGE' : 'IMAGE'}
            </div>
        </ResizableWrapper>
    );
};

// ─── WikiLink 元件（模組層級，確保 React.memo 真正生效）──────────────────────────────
interface WikiLinkProps {
    name: string;
    children: React.ReactNode;
    documents: any[];
    currentDocId?: string | null;
    onSelectDocument?: (docId: string) => void;
    onCreateMissing?: (name: string) => void;
}

const WikiLink: React.FC<WikiLinkProps> = React.memo(({ name, children, documents, currentDocId, onSelectDocument, onCreateMissing }) => {
    const decodedName = decodeURIComponent(name);
    const currentDoc = documents.find((d: any) => d.id === currentDocId);
    const isInVault = !!currentDoc?.folderId;
    if (!isInVault) return <span>[[{children}]]</span>;

    const targetDoc = documents.find((doc: any) => doc.name === decodedName && doc.folderId === currentDoc.folderId);
    const exists = !!targetDoc;

    return (
        <a
            href={`#wikilink-${encodeURIComponent(decodedName)}`}
            onClick={(e) => {
                // 如果在目前的「列印預覽模式」或「PDF」中，不攔截預設跳轉（讓它實現頁面內移動）
                // 但為了瀏覽器內的使用者體驗，如果是正常模式，依然執行切換文件
                if (window.location.hash.includes('wikilink-') || document.querySelector('.show-print-preview')) {
                    // 讓瀏覽器自然跳轉
                } else {
                    e.preventDefault();
                    if (exists && onSelectDocument && targetDoc) {
                        onSelectDocument(targetDoc.id);
                    } else if (!exists && onCreateMissing) {
                        onCreateMissing(name);
                    }
                }
            }}
            className={`px-1 py-0.5 rounded-md transition-all duration-200 ${exists ? 'text-brand-primary bg-brand-secondary/50 dark:bg-brand-primary/20 hover:bg-brand-secondary dark:hover:bg-brand-primary/40 border-b border-brand-primary/30 dark:border-brand-primary/70' : 'text-slate-400 dark:text-slate-500 bg-slate-100/50 dark:bg-slate-800/20 hover:bg-slate-200 dark:hover:bg-slate-800 border-b border-dashed border-slate-300 dark:border-slate-700 italic cursor-help'}`}
            title={exists ? `跳轉至: ${name}` : `文件不存在: ${name} (在目前資料夾中)`}
        >
            {children}
        </a>
    );
});

// ─── 數學與化學元件 (Memoized) ────────────────────────────────────────────────
interface MemoizedMathJaxProps {
    content: string;
    inline?: boolean;
    isDarkMode: boolean;
}

const MemoizedMathJax: React.FC<MemoizedMathJaxProps> = React.memo(({ content, inline, isDarkMode }) => {
    // 為數學公式加入內部 Debounce，避免公式隨著打字不斷抖動
    const debouncedContent = useDebounce(content, 300);
    const [isPending, setIsPending] = useState(false);

    useEffect(() => {
        if (content !== debouncedContent) {
            setIsPending(true);
        } else {
            setIsPending(false);
        }
    }, [content, debouncedContent]);

    const Wrapper = inline ? 'span' : 'div';

    return (
        <Wrapper className={`transition-opacity duration-300 ${isPending ? 'opacity-40' : 'opacity-100'}`}>
            <MathJax inline={inline} dynamic hideUntilTypeset="every">
                {inline ? `\\(${debouncedContent}\\)` : `\\[${debouncedContent}\\]`}
            </MathJax>
        </Wrapper>
    );
});

// ─── 增強型程式碼區塊 (智能斷行、懸掛縮排與列印控制) ────────────────────────────────────────────────
interface EnhancedCodeBlockProps {
    language: string;
    codeString: string;
    stableKey: string;
    syntaxStyle: any;
    isActuallyPrinting: boolean;
    shouldShowDark: boolean;
}

const EnhancedCodeBlock: React.FC<EnhancedCodeBlockProps> = ({
    language,
    codeString,
    stableKey,
    syntaxStyle,
    isActuallyPrinting,
    shouldShowDark
}) => {
    // 預設需要換行的語言
    const defaultWrapLanguages = ['text', 'log', 'json', 'bash', 'sh', 'yaml', 'plaintext', 'markdown'];
    const [isWrapped, setIsWrapped] = useState(defaultWrapLanguages.includes(language));

    // 列印模式為了防截斷，強制換行
    const effectiveWrapped = isActuallyPrinting || isWrapped;

    // 當斷行狀態改變或初次渲染時，通知預覽器重新計算佈局高度（列印同步用）
    useEffect(() => {
        window.dispatchEvent(new CustomEvent('content-layout-ready'));
    }, [effectiveWrapped]);

    return (
        <div className="relative group/codeblock w-full">
            {/* 切換換行的按鈕 (不給列印時顯示) */}
            {!isActuallyPrinting && (
                <button
                    className={`absolute top-2 right-2 p-1.5 rounded-md transition-all duration-200 z-10 opacity-0 group-hover/codeblock:opacity-100 
                        ${isWrapped 
                            ? 'bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/30 dark:text-brand-primary font-semibold' 
                            : 'bg-slate-100 text-slate-400 hover:text-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
                    onClick={() => setIsWrapped(!isWrapped)}
                    title={isWrapped ? "禁用自動換行" : "啟用自動換行"}
                    aria-label="Toggle Word Wrap"
                >
                    <WrapText size={16} />
                </button>
            )}
            
            <div 
                className={`enhanced-codeblock ${effectiveWrapped ? 'code-block-wrap' : 'code-block-scroll'}`}
                data-theme-style={(isActuallyPrinting || !shouldShowDark) ? 'light' : 'dark'}
            >
                <SyntaxHighlighter
                    key={stableKey}
                    language={language || 'text'}
                    style={syntaxStyle}
                    customStyle={{ 
                        margin: '1.5rem 0',
                        padding: '1rem',
                        fontSize: '0.875rem', 
                        lineHeight: '1.5',
                        backgroundColor: 'var(--code-bg)',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--code-border)',
                        overflowX: effectiveWrapped ? 'hidden' : 'auto',
                        tabSize: '2',
                        filter: 'invert(0)',
                    }}
                    showLineNumbers={false} /* 關閉原生的缺陷行號 */
                    wrapLines={true} /* 強制每一行編織成 span，作為 css counter 基準 */
                    lineProps={{
                        className: 'code-line'
                    }}
                >
                    {codeString}
                </SyntaxHighlighter>
            </div>
        </div>
    );
};

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, theme, isDarkMode, documents = [], onSelectDocument, onCreateMissing, currentDocId, isPrinting, showPrintPreview, printSessionId = 0 }) => {
    // 關鍵修正：判斷當前是否處於「需要白色底」的狀態
    const isActuallyPrinting = isPrinting || !!document.querySelector('.show-print-preview');
    const shouldShowDark = isDarkMode && !isActuallyPrinting;
    const processedContent = useMemo(() => content.replace(/\[\[(.*?)\]\]/g, '[$1](#wikilink-$1)'), [content]);
    const debouncedContent = useDebounce(processedContent, 200);
    // 在 MarkdownPreview 頂層呼叫一次，避免每個 LocalImage 獨立開啟 DB 連線
    const { getImage } = useImageStorage();

    const renderContextRef = useRef({
        documents,
        currentDocId,
        onSelectDocument,
        onCreateMissing,
        shouldShowDark,
        isActuallyPrinting,
        isDarkMode,
        isPrinting,
        showPrintPreview,
        printSessionId,
        getImage
    });

    useEffect(() => {
        renderContextRef.current = {
            documents,
            currentDocId,
            onSelectDocument,
            onCreateMissing,
            shouldShowDark,
            isActuallyPrinting,
            isDarkMode,
            isPrinting,
            showPrintPreview,
            printSessionId,
            getImage
        };
    }, [documents, currentDocId, onSelectDocument, onCreateMissing, shouldShowDark, isActuallyPrinting, isDarkMode, isPrinting, showPrintPreview, printSessionId, getImage]);

    // ─── URI 轉換：允許自定義協定通過 react-markdown 的過濾 ───────────────────────────
    const urlTransform = useCallback((uri: string) => {
        // 放行我們的本地圖片協定
        if (uri.startsWith('img-local://')) return uri;

        // 其他常見的安全協定
        const protocols = ['http', 'https', 'mailto', 'tel', '#'];
        for (const protocol of protocols) {
            if (uri.toLowerCase().startsWith(protocol)) return uri;
        }

        // 相對路徑也放行
        if (uri.startsWith('/') || uri.startsWith('./') || uri.startsWith('../')) return uri;

        return `about:blank`; // 過濾掉潛在不安全的連結
    }, []);


    const remarkRehypeOptions = useMemo(() => ({
        handlers: {
            math: (h: any, node: any) => ({
                type: 'element' as const,
                tagName: 'div',
                properties: { className: ['math-display'] },
                children: [{ type: 'text' as const, value: node.value }]
            }),
            inlineMath: (h: any, node: any) => ({
                type: 'element' as const,
                tagName: 'span',
                properties: { className: ['math-inline'] },
                children: [{ type: 'text' as const, value: node.value }]
            })
        }
    }), []);

    const components = useMemo(() => ({
        pre: ({ children }: any) => <>{children}</>, // 移除外層 pre，消除雙層容器基礎
        code({ node, inline, className, children, ...props }: any) {
            const ctx = renderContextRef.current;
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const codeString = String(children).replace(/\n$/, '');
            const stableKey = hashString(codeString);
            const line = node?.position?.start?.line;

            // 核心修正：明確定義列印時要使用的樣式物件
            // 只要正在列印或開啟列印預覽，無視深色模式，強制使用淺色主題 (vs)
            const syntaxStyle = ctx.isActuallyPrinting ? vs : (ctx.shouldShowDark ? vscDarkPlus : vs);

            if (!inline) {
                if (language === 'mermaid') return <div data-line={line}><MermaidBlock key={stableKey} code={codeString} isDarkMode={ctx.isDarkMode} isPrinting={ctx.isPrinting} showPrintPreview={ctx.showPrintPreview} printSessionId={ctx.printSessionId} /></div>;
                if (language === 'vega' || language === 'vega-lite') return <div data-line={line}><VegaBlock key={stableKey} code={codeString} isDarkMode={ctx.isDarkMode} isPrinting={ctx.isPrinting} showPrintPreview={ctx.showPrintPreview} /></div>;
                if (language === 'smiles') return <div data-line={line}><SmilesBlock key={stableKey} code={codeString} isDarkMode={ctx.isDarkMode} isPrinting={ctx.isPrinting} showPrintPreview={ctx.showPrintPreview} /></div>;
                if (language === 'abc') return <React.Suspense fallback={<div className="p-4 flex justify-center items-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs">樂譜加載中...</div>}><div data-line={line}><AbcBlock key={stableKey} code={codeString} isDarkMode={ctx.isDarkMode} isPrinting={ctx.isPrinting} showPrintPreview={ctx.showPrintPreview} /></div></React.Suspense>;

                return (
                    <div data-line={line} className="code-block-wrapper">
                         <EnhancedCodeBlock 
                             language={language}
                             codeString={codeString}
                             stableKey={stableKey}
                             syntaxStyle={syntaxStyle}
                             isActuallyPrinting={ctx.isActuallyPrinting}
                             shouldShowDark={ctx.shouldShowDark}
                         />
                    </div>
                );
            }
            return <code className={className} {...props} data-line={line}>{children}</code>;
        },
        // ─── 注入 Line Number 以實現精準同步捲動 ───────────────────────────────────
        p: ({ node, ...props }: any) => <p data-line={node?.position?.start?.line} {...props} />,
        h1: ({ node, ...props }: any) => <h1 data-line={node?.position?.start?.line} {...props} />,
        h2: ({ node, ...props }: any) => <h2 data-line={node?.position?.start?.line} {...props} />,
        h3: ({ node, ...props }: any) => <h3 data-line={node?.position?.start?.line} {...props} />,
        h4: ({ node, ...props }: any) => <h4 data-line={node?.position?.start?.line} {...props} />,
        h5: ({ node, ...props }: any) => <h5 data-line={node?.position?.start?.line} {...props} />,
        h6: ({ node, ...props }: any) => <h6 data-line={node?.position?.start?.line} {...props} />,
        ul: ({ node, ...props }: any) => <ul data-line={node?.position?.start?.line} {...props} />,
        ol: ({ node, ...props }: any) => <ol data-line={node?.position?.start?.line} {...props} />,
        li: ({ node, ...props }: any) => <li data-line={node?.position?.start?.line} {...props} />,
        blockquote: ({ node, ...props }: any) => <blockquote data-line={node?.position?.start?.line} {...props} />,
        table: ({ node, ...props }: any) => <table data-line={node?.position?.start?.line} {...props} />,
        // ─────────────────────────────────────────────────────────────────────────
        div: ({ node, className, children, ...props }: any) => {
            if (className?.includes('math-display')) {
                const ctx = renderContextRef.current;
                const mathContent = String(children);
                const stableKey = hashString(mathContent);
                return (
                    <div key={stableKey} className="my-4 overflow-x-auto" style={{ whiteSpace: 'nowrap' }} data-line={node?.position?.start?.line}>
                        <MemoizedMathJax content={mathContent} isDarkMode={ctx.shouldShowDark} />
                    </div>
                );
            }
            return <div className={className} {...props} data-line={node?.position?.start?.line}>{children}</div>;
        },
        span: ({ node, className, children, ...props }: any) => {
            if (className?.includes('math-inline')) {
                const ctx = renderContextRef.current;
                const mathContent = String(children);
                const stableKey = hashString(mathContent);
                return (
                    <span key={stableKey} className="math-inline" style={{ whiteSpace: 'nowrap' }} data-line={node?.position?.start?.line}>
                        <MemoizedMathJax content={mathContent} inline isDarkMode={ctx.shouldShowDark} />
                    </span>
                );
            }
            return <span className={className} {...props} data-line={node?.position?.start?.line}>{children}</span>;
        },
        a: ({ node, href, children, ...props }: any) => {
            if (href?.startsWith('#wikilink-')) {
                const ctx = renderContextRef.current;
                const name = decodeURIComponent(href.replace('#wikilink-', ''));
                return (
                    <WikiLink
                        name={name}
                        documents={ctx.documents}
                        currentDocId={ctx.currentDocId}
                        onSelectDocument={ctx.onSelectDocument}
                        onCreateMissing={ctx.onCreateMissing}
                    >
                        {children}
                    </WikiLink>
                );
            }
            return <a href={href} {...props} target="_blank" rel="noopener noreferrer" data-line={node?.position?.start?.line}>{children}</a>;
        },
        // ─── 圖片解析：支援本地與遠端，並提供縮放工具 ──────────────────────────────────────────
        img: ({ node, src, alt, ...props }: any) => {
            if (!src) return null;
            const ctx = renderContextRef.current;
            return (
                <ResizableImage
                    key={src}
                    src={src}
                    alt={alt}
                    getImage={ctx.getImage}
                    isDarkMode={ctx.shouldShowDark}
                />
            );
        },
    }), []);

    // 監聽圖片載入完成，若有必要可觸發同步刷新
    useEffect(() => {
        const container = document.querySelector('.prose');
        if (!container) return;

        const handleImageLoad = () => {
            // 圖片載入後高度會變，這可能會導致同步偏差。
            // 這裡可以觸發一個自定義事件或回調，讓 App.tsx 重新對齊
            window.dispatchEvent(new CustomEvent('preview-content-height-change'));
        };

        container.addEventListener('load', handleImageLoad, true);
        return () => container.removeEventListener('load', handleImageLoad, true);
    }, [debouncedContent]);

    return (
        <div className={`prose max-w-none p-8 select-text ${shouldShowDark ? 'prose-invert' : 'prose-slate'} prose-headings:font-bold prose-a:text-brand-primary prose-img:rounded-xl prose-table:border-collapse prose-th:border prose-th:border-slate-300 dark:prose-th:border-slate-700 prose-th:p-2 prose-td:border prose-td:border-slate-300 dark:prose-td:border-slate-700 prose-td:p-2 print:p-0 print:max-w-none print:bg-white`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeRaw]}
                remarkRehypeOptions={remarkRehypeOptions}
                components={components}
                urlTransform={urlTransform}
            >
                {debouncedContent}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownPreview;
