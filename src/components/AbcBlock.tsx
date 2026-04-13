import React, { useEffect, useRef, useState, useMemo } from 'react';
import abcjs from 'abcjs';
import { usePersistentCanvasSettings } from '../hooks/usePersistentCanvasSettings';
import { ResizableWrapper } from './MarkdownPreview';
import { useDebounce } from '../hooks/useDebounce';
import { hashString } from '../utils';

interface AbcBlockProps {
    code: string;
    isDarkMode: boolean;
    isPrinting?: boolean;
    showPrintPreview?: boolean;
}

const AbcBlock: React.FC<AbcBlockProps> = React.memo(({ code, isDarkMode, isPrinting, showPrintPreview }) => {
    // 判斷是否為「實際深色模式」(若在列印或列印預覽狀態，則視為淺色)
    const isDark = isDarkMode && !isPrinting && !showPrintPreview;

    const paperRef = useRef<HTMLDivElement>(null);
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 從註解提取預設寬高/縮放比例
    const initialWidth = useMemo(() => {
        const widthMatch = code.match(/%%\s*width:\s*(\d+)%/i);
        return widthMatch ? `${widthMatch[1]}%` : '100%';
    }, [code]);

    const initialScale = useMemo(() => {
        const scaleMatch = code.match(/%%\s*scale:\s*([\d.]+)/i);
        return scaleMatch ? parseFloat(scaleMatch[1]) : 1;
    }, [code]);

    const storageKey = useMemo(() => `chart-size-abc:${hashString(code)}`, [code]);
    const { width, height, scale, updateWidth, updateHeight, updateScale, reset } = usePersistentCanvasSettings(storageKey, initialWidth, initialScale);

    // 通用 Debounce (400ms)
    const debouncedCode = useDebounce(code, 400);

    useEffect(() => {
        if (!debouncedCode) return;
        setIsPending(true);
        setError(null);
        const timer = setTimeout(() => {
            if (!paperRef.current) return;
            try {
                // 設定 responsive: 'resize' 以便自動填滿容器寬度
                // 外層會交由 ResizableWrapper 縮放
                abcjs.renderAbc(paperRef.current, debouncedCode, {
                    responsive: 'resize'
                });
                setError(null);
            } catch (err: any) {
                console.error('Abc rendering error:', err);
                setError(err?.message || '樂譜語法解析失敗');
            } finally {
                setIsPending(false);
                // 通知外層預覽區佈局可能改變，可重新計算滾動或 PDF 列印位置
                window.dispatchEvent(new CustomEvent('content-layout-ready'));
            }
        }, 50); // 縮短內部延時

        return () => clearTimeout(timer);
    }, [debouncedCode, isDark]);

    if (error) {
        return (
            <div className="my-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-mono whitespace-pre-wrap">
                <div className="font-bold mb-2">🎵 Abc Notation 語法錯誤</div>
                {error}
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
                className={`diagram-block-container abcjs-wrapper overflow-auto p-4 rounded-2xl shadow-sm border transition-opacity duration-300 flex justify-center ${isDark ? 'border-slate-700/50 text-slate-200' : 'border-slate-200/50 text-slate-800'} ${isPending ? 'opacity-50' : 'opacity-100'}`}
                style={{ width: '100%', height: 'auto', backgroundColor: 'var(--code-bg)' }}
            >
                {/* 套用自定義樣式讓深色模式與列印時顏色能變化 */}
                <div ref={paperRef} className="w-full abcjs-inner-container" />
            </div>
            {isPending && (
                <div className="absolute top-2 right-2">
                    <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                </div>
            )}
        </ResizableWrapper>
    );
});

export default AbcBlock;
