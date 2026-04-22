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

    const notifyReady = useCallback(() => {
        window.dispatchEvent(new CustomEvent('content-layout-ready'));
        window.dispatchEvent(new CustomEvent('diagram-render-complete', {
            detail: { blockId: storageKey, printSessionId }
        }));
    }, [storageKey, printSessionId]);

    useEffect(() => {
        if (!renderCode) return;

        isMounted.current = true;
        setIsPending(true);
        setError(null);

        const timer = setTimeout(async () => {
            if (!containerRef.current) return;
            try {
                // 調用外部傳入的專屬渲染邏輯
                await render(containerRef.current, renderCode, isDark);
                
                if (isMounted.current) {
                    setError(null);
                    notifyReady();
                }
            } catch (err: any) {
                console.error(`${type} render error:`, err);
                if (isMounted.current) {
                    setError(err.message || 'Syntax Error');
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
    }, [renderCode, isDark, render, type, notifyReady]);

    if (error) {
        return (
            <div className="my-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-mono whitespace-pre-wrap">
                <div className="font-bold mb-2">{errorTitle}</div>
                {error}
            </div>
        );
    }

    // 列印模式簡化
    if (isPrinting || showPrintPreview) {
        return (
            <div
                data-diagram-type={type}
                data-diagram-id={storageKey}
                className={`diagram-block-container ${containerClassName}`}
                style={{
                    width: '100%',
                    margin: '1rem 0',
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                <div ref={containerRef} className="w-full flex justify-center" />
            </div>
        );
    }

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
    );
});

export default DiagramBlock;
