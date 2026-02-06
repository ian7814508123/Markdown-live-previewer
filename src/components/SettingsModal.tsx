import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw, AlertCircle, Check } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentMacros: Record<string, string | [string, number]>;
    onSaveMacros: (macros: Record<string, string | [string, number]>) => void;
    onRestoreDefaults: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    currentMacros,
    onSaveMacros,
    onRestoreDefaults
}) => {
    const [jsonInput, setJsonInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setJsonInput(JSON.stringify(currentMacros, null, 4));
            setError(null);
            setSuccess(false);
        }
    }, [isOpen, currentMacros]);

    const handleSave = () => {
        try {
            const parsed = JSON.parse(jsonInput);
            if (typeof parsed !== 'object' || parsed === null) {
                throw new Error('Root must be an object');
            }
            onSaveMacros(parsed);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Invalid JSON format');
            setSuccess(false);
        }
    };

    const handleRestore = () => {
        if (confirm('確定要還原預設巨集設定嗎?')) {
            onRestoreDefaults();
            // The useEffect will update the input when currentMacros changes
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 p-6 flex flex-col gap-6 animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">設定</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">MathJax 自定義巨集 (JSON 格式)</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Editor */}
                <div className="relative flex-1">
                    <textarea
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        className={`w-full h-64 p-4 font-mono text-sm bg-slate-50 dark:bg-slate-950 border rounded-xl resize-none focus:outline-none focus:ring-2 transition-all
                            ${error
                                ? 'border-red-300 focus:ring-red-200 dark:border-red-900/50'
                                : 'border-slate-200 dark:border-slate-800 focus:ring-indigo-100 dark:focus:ring-indigo-900'
                            }
                            text-slate-700 dark:text-slate-300 custom-scrollbar
                        `}
                        spellCheck={false}
                    />
                    {error && (
                        <div className="absolute bottom-4 right-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-xs px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-800/50 flex items-center gap-2 animate-in slide-in-from-bottom-2">
                            <AlertCircle size={14} />
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2">
                    <button
                        onClick={handleRestore}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                    >
                        <RotateCcw size={16} />
                        還原預設
                    </button>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all font-medium"
                        >
                            取消
                        </button>
                        <button
                            onClick={handleSave}
                            className={`flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all text-sm font-semibold shadow-md active:scale-95
                                ${success ? 'bg-green-600 hover:bg-green-700' : ''}
                            `}
                        >
                            {success ? <Check size={18} /> : <Save size={18} />}
                            {success ? '已儲存' : '儲存變更'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SettingsModal;
