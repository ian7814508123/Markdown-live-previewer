import React from 'react';

/**
 * ResizableWrapper: 可調整寬度與高度的容器組件
 * 提供交互式的縮放工具面板，支持主題切換與列印自動調整
 */
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

            {/* 調整大小的 UI 面板 - 懸浮顯示 (列印時隱藏) */}
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

export default ResizableWrapper;
