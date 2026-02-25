import React, { useState } from 'react';
import { X, Plus, FolderOpen, FileText, Image as ImageIcon, Wrench } from 'lucide-react';
import { DocumentRecord } from '../types';
import DocumentItem from './DocumentItem';
import ToolsModal from './ToolsModal';
import RippleButton from './RippleButton';

interface HistorySidebarProps {
    isOpen: boolean;
    onClose: () => void;
    documents: DocumentRecord[];
    currentDocId: string | null;
    currentDocContent: string;
    currentDocMode: 'markdown' | 'mermaid';
    onInsertIntoDoc: (text: string) => void;
    onSelectDocument: (docId: string) => void;
    onCreateDocument: (mode: 'markdown' | 'mermaid') => void;
    onDeleteDocument: (docId: string) => void;
    onRenameDocument: (docId: string, newName: string) => void;
    storageUsage: number;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({
    isOpen,
    onClose,
    documents,
    currentDocId,
    currentDocContent,
    currentDocMode,
    onInsertIntoDoc,
    onSelectDocument,
    onCreateDocument,
    onDeleteDocument,
    onRenameDocument,
    storageUsage,
}) => {
    const [isCreating, setIsCreating] = useState(false);
    const [isToolsOpen, setIsToolsOpen] = useState(false);

    return (
        <>
            {/* 背景遮罩（僅手機版） */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-30 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* 側邊欄 */}
            <aside
                className={`
          fixed lg:relative
          inset-y-0 left-0
          z-40 h-full
          w-[280px]
          bg-white dark:bg-slate-900
          border-r border-slate-200 dark:border-slate-800
          shadow-2xl lg:shadow-none
          flex flex-col
          transition-transform duration-300 [transition-timing-function:var(--m3-easing-standard)]
          ${isOpen ? 'translate-x-0 animate-in slide-in-from-left duration-300' : '-translate-x-full lg:hidden'}
          shrink-0
        `}
            >
                {/* 標題列 */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-2">
                        <FolderOpen size={18} className="text-indigo-500" />
                        <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300">我的文檔</h2>
                    </div>
                    <RippleButton
                        variant="icon"
                        onClick={onClose}
                        className="w-8 h-8 text-slate-500 dark:text-slate-400"
                        title="關閉側邊欄"
                    >
                        <X size={18} />
                    </RippleButton>
                </div>

                {/* 新增按鈕 */}
                <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                    {!isCreating ? (
                        <RippleButton
                            variant="filled"
                            onClick={() => setIsCreating(true)}
                            className="w-full justify-center text-sm"
                        >
                            <Plus size={16} />
                            <span>新增文檔</span>
                        </RippleButton>
                    ) : (
                        <div className="flex flex-col gap-2 animate-in slide-in-from-top-2 duration-200">
                            <RippleButton
                                variant="tonal"
                                onClick={() => { onCreateDocument('markdown'); setIsCreating(false); }}
                                className="w-full justify-start text-sm text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                            >
                                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg">
                                    <FileText size={16} />
                                </div>
                                新增 標記掉落
                            </RippleButton>
                            <RippleButton
                                variant="tonal"
                                onClick={() => { onCreateDocument('mermaid'); setIsCreating(false); }}
                                className="w-full justify-start text-sm text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                            >
                                <div className="p-1.5 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-lg">
                                    <ImageIcon size={16} />
                                </div>
                                新增 美人魚
                            </RippleButton>
                            <button
                                onClick={() => setIsCreating(false)}
                                className="md-press w-full text-center text-xs text-slate-400 hover:text-slate-500 py-1 rounded-lg"
                            >
                                取消
                            </button>
                        </div>
                    )}
                </div>

                {/* 文檔列表 */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {documents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full px-4 text-center">
                            <FolderOpen size={48} className="text-slate-300 dark:text-slate-700 mb-3" />
                            <p className="text-sm text-slate-400 dark:text-slate-600">尚無文檔</p>
                            <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">點擊上方按鈕建立新文檔</p>
                        </div>
                    ) : (
                        <div className="py-2 space-y-1">
                            {documents
                                .sort((a, b) => b.updatedAt - a.updatedAt)
                                .map(doc => (
                                    <DocumentItem
                                        key={doc.id}
                                        document={doc}
                                        isActive={doc.id === currentDocId}
                                        onClick={() => onSelectDocument(doc.id)}
                                        onDelete={() => onDeleteDocument(doc.id)}
                                        onRename={(newName) => onRenameDocument(doc.id, newName)}
                                    />
                                ))}
                        </div>
                    )}
                </div>

                {/* ── 更多工具按鈕（開啟 Modal） ── */}
                <div className="border-t border-slate-200 dark:border-slate-800">
                    <button
                        onClick={() => setIsToolsOpen(true)}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-600 dark:hover:text-violet-400 transition-colors group"
                    >
                        <Wrench size={14} className="text-violet-400 group-hover:text-violet-500 transition-colors" />
                        <span className="text-xs font-bold tracking-wide">更多工具</span>
                    </button>
                </div>

                {/* 底部容量統計 */}
                <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 text-center">
                            <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mb-0.5">文檔數</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{documents.length} / 50</p>
                        </div>
                        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
                        <div className="flex-1 text-center">
                            <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mb-0.5">預存空間</p>
                            <div className="flex flex-col items-center">
                                <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-1">
                                    <div
                                        className={`h-full transition-all duration-500 ${storageUsage > 80 ? 'bg-red-500' : storageUsage > 50 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                                        style={{ width: `${storageUsage}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">{storageUsage}%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* 更多工具 Modal */}
            <ToolsModal
                isOpen={isToolsOpen}
                onClose={() => setIsToolsOpen(false)}
                currentDocContent={currentDocContent}
                currentDocMode={currentDocMode}
                onInsertIntoDoc={onInsertIntoDoc}
            />
        </>
    );
};

export default HistorySidebar;
