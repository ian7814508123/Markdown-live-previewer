import React from 'react';

interface LayoutSplitterProps {
    onMouseDown: (e: React.MouseEvent) => void;
    isResizing: boolean;
    isDarkMode: boolean;
}

const LayoutSplitter: React.FC<LayoutSplitterProps> = ({ onMouseDown, isResizing, isDarkMode }) => {
    return (
        <div
            className={`group relative w-1 hover:w-1.5 transition-all cursor-col-resize z-50 flex items-center justify-center ${isResizing ? 'w-1.5' : ''
                }`}
            onMouseDown={onMouseDown}
        >
            {/* 拖動線本體 */}
            <div
                className={`w-full h-full transition-colors duration-200 ${isResizing
                        ? 'bg-indigo-500'
                        : isDarkMode
                            ? 'bg-slate-800 group-hover:bg-indigo-500/50'
                            : 'bg-slate-200 group-hover:bg-indigo-500/50'
                    }`}
            />

            {/* 拖動手柄 */}
            <div
                className={`absolute top-1/2 -translate-y-1/2 w-4 h-12 rounded-full border shadow-lg transition-all flex items-center justify-center pointer-events-none ${isResizing
                        ? 'scale-110 opacity-100 bg-indigo-500 border-indigo-400 text-white'
                        : isDarkMode
                            ? 'opacity-0 group-hover:opacity-100 bg-slate-800 border-slate-700 text-slate-400'
                            : 'opacity-0 group-hover:opacity-100 bg-white border-slate-200 text-slate-400'
                    }`}
            >
                <div className="flex gap-0.5">
                    <div className="w-0.5 h-4 bg-currentColor rounded-full opacity-40" />
                    <div className="w-0.5 h-4 bg-currentColor rounded-full opacity-40" />
                </div>
            </div>

            {/* 隱形擴大點擊區域 */}
            <div className="absolute inset-y-0 -left-1 -right-1 cursor-col-resize" />
        </div>
    );
};

export default LayoutSplitter;
