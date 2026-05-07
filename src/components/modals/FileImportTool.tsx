import React, { useState } from 'react';
import { FileUp, Info, Check } from 'lucide-react';
import RippleButton from '../ui/RippleButton';

interface FileImportToolProps {
    /** 觸發檔案導入的回呼 */
    onImportFile?: () => void;
}

/**
 * 檔案導入工具組件
 * 提供 Markdown, Excel, CSV 等檔案的導入功能
 */
const FileImportTool: React.FC<FileImportToolProps> = ({ onImportFile }) => {
    const [isImported, setIsImported] = useState(false);

    const handleImport = () => {
        onImportFile?.();
        setIsImported(true);
        setTimeout(() => setIsImported(false), 2000);
    };
    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* ── 標題 ── */}
            <div className="px-4 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-2.5 mb-1">
                    <div className="w-8 h-8 bg-brand-secondary dark:bg-brand-primary/20 text-brand-primary rounded-xl flex items-center justify-center">
                        <FileUp size={16} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">檔案導入工具</h3>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide font-semibold">
                            IMPORT EXTERNAL FILES
                        </p>
                    </div>
                </div>
            </div>

            {/* ── 內容區域 ── */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-500">

                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-3">準備導入新檔案？</h4>

                <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-[240px] leading-relaxed">
                    您可以將現有的文檔整合進來，系統將自動處理格式並顯示預覽。
                </p>

                {/* 支援格式卡片 */}
                <div className="w-full max-w-[280px] mb-8 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 flex items-start gap-3 text-left">
                    <div className="mt-0.5 text-indigo-500 dark:text-indigo-400">
                        <Info size={14} />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-1">支援的檔案格式</p>
                        <div className="flex flex-wrap gap-1">
                            {['.md', '.txt', '.xlsx', '.csv'].map(ext => (
                                <span key={ext} className="px-1.5 py-0.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-[9px] font-mono text-slate-600 dark:text-slate-300">
                                    {ext}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <RippleButton
                    variant="filled"
                    onClick={handleImport}
                    className={[
                        'w-full max-w-[240px] justify-center text-[11px] h-8 gap-1.5 transition-all shrink-0',
                        isImported
                            ? 'bg-emerald-500 hover:bg-emerald-500'
                            : 'bg-brand-primary hover:bg-brand-primary/90',
                    ].join(' ')}
                >
                    {isImported ? (
                        <><Check size={13} />正在導入檔案</>
                    ) : (
                        <><FileUp size={13} />選擇檔案並導入</>
                    )}
                </RippleButton>
            </div>

            {/* ── 底部提示 ── */}
            <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 shrink-0 text-center">
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    提示：導入 Excel 時會自動轉換為 Markdown 表格格式
                </p>
            </div>
        </div>
    );
};

export default FileImportTool;
