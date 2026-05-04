import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { hashString } from '../../utils';
import { usePersistentCanvasSettings } from '../../hooks/usePersistentCanvasSettings';
import { useDebounce } from '../../hooks/useDebounce';
import { ResizableWrapper } from '../ui/ResizableWrapper';

interface DiagramBlockProps {
    code: string;
    type: string;
    isDarkMode: boolean;
    isPrinting?: boolean;
    showPrintPreview?: boolean;
    printSessionId?: number;
    /** 渲染函數：由具體圖表類型提供 */
    render: (container: HTMLDivElement, code: string, isDark: boolean) => Promise<void> | void;
    /** 錯誤訊息標題 */
    errorTitle?: string;
    /** 容器類名 (可選) */
    containerClassName?: string;
}

/**
 * DiagramBlock: 統一的圖表容器組件
 * 封裝了縮放、持久化、主題切換與防抖邏輯
 */
const DiagramBlock: React.FC<DiagramBlockProps> = React.memo(({
    code,
    type,
    isDarkMode,
    isPrinting,
    showPrintPreview,
    printSessionId = 0,
    render,
    errorTitle = 'Rendering Error',
    containerClassName = ''
}) => {
    // 1. 統一的主題判斷邏輯：優先使用 Props 傳入的狀態，避免依賴可能延遲的 DOM 查詢
    const isActuallyPrinting = !!isPrinting || !!showPrintPreview;
    const isDark = isDarkMode && !isActuallyPrinting;

    const containerRef = useRef<HTMLDivElement>(null);
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // 使用 Ref 儲存最後有效的 HTML，避免更新 state 觸發無限迴圈
    const lastValidHtml = useRef<string | null>(null);
    const isMounted = useRef(true);

    // 2. 從代碼註解中讀取初始設定 (通用支持)
    const initialWidth = useMemo(() => {
        const widthMatch = code.match(/%%\s*width:\s*(\d+)%/i);
        return widthMatch ? `${widthMatch[1]}%` : '100%';
    }, [code]);

    const initialScale = useMemo(() => {
        const scaleMatch = code.match(/%%\s*scale:\s*([\d.]+)/i);
        return scaleMatch ? parseFloat(scaleMatch[1]) : 1;
    }, [code]);

    // 3. 統一的持久化 Key 生成
    const storageKey = useMemo(() => `chart-size-${type}:${hashString(code)}`, [type, code]);
    const { width, height, scale, updateWidth, updateHeight, updateScale, reset } = usePersistentCanvasSettings(
        storageKey,
        initialWidth,
        initialScale
    );

    // 4. 統一標準防抖時間：400ms
    const debouncedCode = useDebounce(code, 400);
    const renderCode = isPrinting ? code : debouncedCode;

    // 用 ref 追蹤最新值，讓 notifyReady 不需要列入依賴陣列
    // 解決：code 變 → storageKey 變 → notifyReady 重建 → useEffect 重跑 的問題
    const storageKeyRef = useRef(storageKey);
    storageKeyRef.current = storageKey;
    const printSessionIdRef = useRef(printSessionId);
    printSessionIdRef.current = printSessionId;

    // 零依賴：函式引用永遠穩定，不會觸發 useEffect 重跑
    const notifyReady = useCallback(() => {
        window.dispatchEvent(new CustomEvent('content-layout-ready'));
        window.dispatchEvent(new CustomEvent('diagram-render-complete', {
            detail: { blockId: storageKeyRef.current, printSessionId: printSessionIdRef.current }
        }));
    }, []);

    useEffect(() => {
        if (!renderCode) return;

        setIsPending(true);
        setError(null);

        const timer = setTimeout(async () => {
            if (!containerRef.current) return;
            // 每次 effect 重新執行（包含列印結束後），重設掛載標誌
            isMounted.current = true;
            try {
                // 調用外部傳入的專屬渲染邏輯
                await render(containerRef.current, renderCode, isDark);
                
                if (isMounted.current) {
                    lastValidHtml.current = containerRef.current.innerHTML;
                    setError(null);
                    notifyReady();
                }
            } catch (err: any) {
                console.error(`${type} render error:`, err);
                if (isMounted.current) {
                    setError(err.message || 'Syntax Error');
                    // 如果渲染過程清空了容器 (例如 Vega)，則恢復最後一次有效的內容
                    if (containerRef.current && containerRef.current.innerHTML === '' && lastValidHtml.current) {
                        containerRef.current.innerHTML = lastValidHtml.current;
                    }
                    notifyReady();
                }
            } finally {
                if (isMounted.current) {
                    setIsPending(false);
                }
            }
        }, 50);

        return () => {
            isMounted.current = false;
            clearTimeout(timer);
        };
    // isActuallyPrinting 加入依賴：列印結束後 containerRef 換了新 DOM，需強制重新渲染
    // lastValidHtml 使用 Ref，不放入依賴陣列，避免觸發無限迴圈
    }, [renderCode, isDark, render, type, notifyReady, isActuallyPrinting]);

    // 渲染邏輯保持不變，但我們不再因為 error 就回傳完全不同的組件
    // 這樣可以保留 containerRef 裡的內容 (上一次成功的渲染)

    // 列印模式：套用使用者調整的 width 與 scale，確保列印結果與預覽一致
    if (isPrinting || showPrintPreview) {
        return (
            <div
                data-diagram-type={type}
                data-diagram-id={storageKey}
                className={`diagram-block-container ${containerClassName}`}
                style={{
                    width,                    // 套用使用者調整的寬度 (e.g., "80%")
                    margin: '1rem auto',
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                {/* 套用使用者調整的 scale，使用 zoom 而非 transform 確保列印不裁切 */}
                <div
                    className="w-full flex justify-center"
                    style={{
                        zoom: scale !== 1 ? scale : undefined,
                    }}
                >
                    <div ref={containerRef} className="w-full flex justify-center" />
                </div>
            </div>
        );
    }


    return (
        <div className="group/diagram-wrapper w-full">
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
                    data-diagram-type={type}
                    data-diagram-id={storageKey}
                    className={`diagram-block-container flex justify-center p-6 rounded-2xl shadow-sm border overflow-auto transition-opacity duration-300 ${isDark ? 'border-slate-700/50' : 'border-slate-200/50'} ${isPending ? 'opacity-50' : 'opacity-100'} ${containerClassName}`}
                    style={{ width: '100%', height: 'auto', backgroundColor: 'var(--code-bg)' }}
                >
                    <div ref={containerRef} className="w-full flex justify-center" />
                </div>
                {isPending && (
                    <div className="absolute top-2 right-2">
                        <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </ResizableWrapper>

            {/* 語法錯誤提醒：in-flow 元素，緊接在 ResizableWrapper 下方，不遮蓋任何內容 */}
            {error && !isActuallyPrinting && (
                <div className="-mt-4 mx-4 mb-2 p-3 bg-red-50/95 dark:bg-red-900/60 backdrop-blur-md rounded-xl border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-[11px] font-mono shadow-xl animate-in fade-in slide-in-from-top-1 duration-300">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="font-bold uppercase tracking-wider">{errorTitle}</span>
                    </div>
                    <div className="opacity-90 line-clamp-3 hover:line-clamp-none transition-all cursor-default">
                        {error}
                    </div>
                </div>
            )}
        </div>
    );
});

export default DiagramBlock;
