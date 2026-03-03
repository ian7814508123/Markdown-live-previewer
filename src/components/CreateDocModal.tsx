import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, FileText, Image as ImageIcon } from 'lucide-react';
import RippleButton from './RippleButton';

interface CreateDocModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (mode: 'markdown' | 'mermaid', name: string) => void;
    initialName?: string;
}

const CreateDocModal: React.FC<CreateDocModalProps> = ({ isOpen, onClose, onCreate, initialName = '' }) => {
    const [name, setName] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Reset when opening
    useEffect(() => {
        if (isOpen) {
            setName(initialName);
            // Focus after animation
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    // Handle Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleSubmit = (mode: 'markdown' | 'mermaid') => {
        onCreate(mode, name.trim());
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in m3-fade-in duration-300"
            onClick={onClose}
        >
            <div
                className="relative flex flex-col w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl ring-1 ring-black/10 dark:ring-white/10 animate-in m3-slide-up duration-400"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center shadow-sm">
                            <Plus size={20} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">新增文檔</h2>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">建立新的編輯空間</p>
                        </div>
                    </div>
                    <RippleButton
                        variant="icon"
                        onClick={onClose}
                        className="w-9 h-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title="關閉"
                    >
                        <X size={20} />
                    </RippleButton>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col gap-6">
                    {/* Name Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">文檔名稱</label>
                        <input
                            ref={inputRef}
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="輸入名稱 (選填)"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSubmit('markdown');
                            }}
                        />
                    </div>

                    {/* Mode Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => handleSubmit('markdown')}
                            className="flex flex-col items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 rounded-3xl transition-all group"
                        >
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FileText size={24} />
                            </div>
                            <div className="text-center">
                                <span className="block text-sm font-bold text-slate-700 dark:text-slate-200">標記掉落</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-medium">Markdown</span>
                            </div>
                        </button>

                        <button
                            onClick={() => handleSubmit('mermaid')}
                            className="flex flex-col items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-slate-200 dark:border-slate-700 hover:border-purple-200 dark:hover:border-purple-800 rounded-3xl transition-all group"
                        >
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <ImageIcon size={24} />
                            </div>
                            <div className="text-center">
                                <span className="block text-sm font-bold text-slate-700 dark:text-slate-200">美人魚</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-medium">Mermaid</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Footer Tip */}
                <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-b-3xl border-t border-slate-100 dark:border-slate-800/50">
                    <p className="text-[10px] text-center text-slate-400 dark:text-slate-500">
                        提示：按下 <kbd className="font-sans px-1.5 py-0.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded shadow-sm">Enter</kbd> 可快速建立 Markdown 文檔
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CreateDocModal;
