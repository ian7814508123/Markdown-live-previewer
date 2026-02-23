import React, { useState, useEffect } from 'react';
import { X, Wrench, FileText } from 'lucide-react';
import PdfMergeTool from './PdfMergeTool';
import RippleButton from './RippleButton';

interface ToolsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type ToolId = 'pdf-merge';

const TOOLS: { id: ToolId; label: string; desc: string }[] = [
    { id: 'pdf-merge', label: 'PDF 合併', desc: '合併 PDF 與圖片為單一 PDF' },
];

const ToolsModal: React.FC<ToolsModalProps> = ({ isOpen, onClose }) => {
    const [activeTool, setActiveTool] = useState<ToolId>('pdf-merge');

    // 按 Escape 關閉
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        /* 背景遮罩 + 霧化 */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={onClose}
        >
            {/* Modal 本體 */}
            <div
                className="relative flex flex-col w-full max-w-lg max-h-[82vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl ring-1 ring-black/10 dark:ring-white/10 animate-in zoom-in-95 duration-150"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 rounded-xl flex items-center justify-center">
                            <Wrench size={16} />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">更多工具</h2>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">輔助工具列表</p>
                        </div>
                    </div>
                    <RippleButton
                        variant="icon"
                        onClick={onClose}
                        className="w-8 h-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title="關閉"
                    >
                        <X size={18} />
                    </RippleButton>
                </div>

                {/* Body：左側工具導覽 + 右側內容 */}
                <div className="flex flex-1 min-h-0">
                    {/* 工具導覽側欄 */}
                    <nav className="w-32 shrink-0 border-r border-slate-100 dark:border-slate-800 py-3 flex flex-col gap-0.5">
                        {TOOLS.map(tool => (
                            <button
                                key={tool.id}
                                onClick={() => setActiveTool(tool.id)}
                                className={`md-ripple-root w-full flex flex-col items-start px-3 py-2.5 text-left transition-colors
                                    ${activeTool === tool.id
                                        ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border-r-2 border-violet-500'
                                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/8'
                                    } [&_.md-ripple-wave]:text-violet-600/15`}
                            >
                                <div className={`mb-1 p-1.5 rounded-xl ${activeTool === tool.id ? 'bg-violet-100 dark:bg-violet-800/50' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                    <FileText size={13} />
                                </div>
                                <span className="text-[11px] font-semibold leading-tight">{tool.label}</span>
                                <span className="text-[9px] text-slate-400 dark:text-slate-500 leading-tight mt-0.5">{tool.desc}</span>
                            </button>
                        ))}
                    </nav>

                    {/* 工具內容區（可捲動） */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {activeTool === 'pdf-merge' && <PdfMergeTool />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ToolsModal;
