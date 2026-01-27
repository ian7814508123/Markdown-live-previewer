import React from 'react';
import { X, Plus, FolderOpen } from 'lucide-react';
import { DocumentRecord } from '../types';
import DocumentItem from './DocumentItem';

interface HistorySidebarProps {
    isOpen: boolean;
    onClose: () => void;
    documents: DocumentRecord[];
    currentDocId: string | null;
    onSelectDocument: (docId: string) => void;
    onCreateDocument: () => void;
    onDeleteDocument: (docId: string) => void;
    onRenameDocument: (docId: string, newName: string) => void;
    storageUsage: number;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({
    isOpen,
    onClose,
    documents,
    currentDocId,
    onSelectDocument,
    onCreateDocument,
    onDeleteDocument,
    onRenameDocument,
    storageUsage,
}) => {
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
          h-full
          w-[280px]
          bg-white dark:bg-slate-900
          border-r border-slate-200 dark:border-slate-800
          shadow-xl lg:shadow-none
          transition-all duration-300 ease-in-out
          ${isOpen ? 'flex' : 'hidden'}
          flex-col
          shrink-0
        `}
            >
                {/* 標題列 */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-2">
                        <FolderOpen size={18} className="text-indigo-500" />
                        <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300">我的文檔</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-all text-slate-500 dark:text-slate-400"
                        title="關閉側邊欄"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* 新增按鈕 */}
                <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                    <button
                        onClick={onCreateDocument}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all text-sm font-semibold shadow-sm active:scale-95"
                    >
                        <Plus size={16} />
                        <span>新增文檔</span>
                    </button>
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
                                .sort((a, b) => b.updatedAt - a.updatedAt) // 最新的在最上面
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

                {/* 底部提示與容量 */}
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
                                        className={`h-full transition-all duration-500 ${storageUsage > 80 ? 'bg-red-500' : storageUsage > 50 ? 'bg-amber-500' : 'bg-indigo-500'
                                            }`}
                                        style={{ width: `${storageUsage}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">{storageUsage}%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default HistorySidebar;
