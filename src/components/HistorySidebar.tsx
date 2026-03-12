import React, { useState } from 'react';
import { X, Plus, FolderOpen, FileText, Wrench, ChevronDown, ChevronRight, Files, FolderPlus } from 'lucide-react';
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
    onCreateDocument: (folderId: string | null) => void;
    onDeleteDocument: (docId: string) => void;
    onRenameDocument: (docId: string, newName: string) => void;
    storageUsage: number;
    getBacklinks: (docName: string) => DocumentRecord[];
    folders: any[];
    onCreateFolder: (name: string) => void;
    onDeleteFolder: (folderId: string) => void;
    onRenameFolder: (folderId: string, newName: string) => void;
    onMoveDocument: (docId: string, folderId: string | null) => void;
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
    getBacklinks,
    folders,
    onCreateFolder,
    onDeleteFolder,
    onRenameFolder,
    onMoveDocument,
}) => {
    const [isToolsOpen, setIsToolsOpen] = useState(false);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
    const [editFolderName, setEditFolderName] = useState('');

    const toggleFolder = (folderId: string) => {
        setExpandedFolders(prev => {
            const next = new Set(prev);
            if (next.has(folderId)) next.delete(folderId);
            else next.add(folderId);
            return next;
        });
    };

    const handleFolderDoubleClick = (e: React.MouseEvent, folder: any) => {
        e.stopPropagation();
        setEditingFolderId(folder.id);
        setEditFolderName(folder.name);
    };

    const handleFolderRenameSave = (folderId: string) => {
        if (editFolderName.trim() && editFolderName !== folders.find(f => f.id === folderId)?.name) {
            onRenameFolder(folderId, editFolderName.trim());
        }
        setEditingFolderId(null);
    };

    const currentDoc = documents.find(d => d.id === currentDocId);
    const backlinks = currentDoc ? getBacklinks(currentDoc.name) : [];


    return (
        <>
            {/* 背景遮罩 (Overlay) */}
            <div
                className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* 側邊欄 */}
            <aside
                className={`
                    fixed inset-y-0 left-0
                    z-[60] h-full
                    w-[320px]
                    bg-white dark:bg-slate-900
                    border-r border-slate-200 dark:border-slate-800
                    shadow-2xl
                    flex flex-col
                    transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    shrink-0 print:hidden
                    rounded-r-[2rem] overflow-hidden
                `}
            >
                {/* 標題列 (高度與主 Header 貼齊) */}
                <div className="flex items-center justify-between px-6 h-16 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-2">
                        <Files size={18} className="text-indigo-500 opacity-80" />
                        <h2 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">我的文檔</h2>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                        <RippleButton
                            variant="filled"
                            onClick={() => {
                                let targetFolderId: string | null = null;
                                if (expandedFolders.size > 0) {
                                    if (currentDoc?.folderId && expandedFolders.has(currentDoc.folderId)) {
                                        targetFolderId = currentDoc.folderId;
                                    } else {
                                        targetFolderId = Array.from(expandedFolders).pop() || null;
                                    }
                                }
                                onCreateDocument(targetFolderId);
                            }}
                            className="text-[9px] h-[23px] px-0 justify-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-none rounded-full min-w-[60px]"
                            title="新建文檔"
                        >
                            <FileText size={12} />
                            <span className="whitespace-nowrap">文檔</span>
                        </RippleButton>

                        <RippleButton
                            variant="filled"
                            onClick={() => onCreateFolder('')}
                            className="text-[9px] h-[23px] px-0 justify-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-none rounded-full min-w-[60px]"
                            title="新建資料夾"
                        >
                            <FolderPlus size={12} />
                            <span className="whitespace-nowrap">資料夾</span>
                        </RippleButton>
                    </div>
                </div>

                {/* 文檔列表 */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {documents.length === 0 && folders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full px-4 text-center">
                            <FolderOpen size={48} className="text-slate-300 dark:text-slate-700 mb-3" />
                            <p className="text-sm text-slate-400 dark:text-slate-600">尚無內容</p>
                            <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">建立檔案或資料夾開始</p>
                        </div>
                    ) : (
                        <div className="py-2 space-y-4">
                            {/* 資料夾區域 (儲存庫) */}
                            {folders.length > 0 && (
                                <div className="space-y-1">
                                    <div className="px-4 py-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">儲存庫 (Vaults)</span>
                                    </div>
                                    {folders.map(folder => {
                                        const isExpanded = expandedFolders.has(folder.id);
                                        const folderDocs = documents.filter(d => d.folderId === folder.id);
                                        return (
                                            <div
                                                key={folder.id}
                                                className="space-y-0.5"
                                                onDragOver={(e) => {
                                                    e.preventDefault();
                                                    e.currentTarget.classList.add('bg-indigo-50/50', 'dark:bg-indigo-900/10');
                                                }}
                                                onDragLeave={(e) => {
                                                    e.currentTarget.classList.remove('bg-indigo-50/50', 'dark:bg-indigo-900/10');
                                                }}
                                                onDrop={(e) => {
                                                    e.preventDefault();
                                                    e.currentTarget.classList.remove('bg-indigo-50/50', 'dark:bg-indigo-900/10');
                                                    const docId = e.dataTransfer.getData('text/plain');
                                                    if (docId) onMoveDocument(docId, folder.id);
                                                }}
                                            >
                                                <div
                                                    className="group flex items-center justify-between px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                                                    onClick={() => toggleFolder(folder.id)}
                                                    onDoubleClick={(e) => handleFolderDoubleClick(e, folder)}
                                                >
                                                    <div className="flex items-center gap-2 overflow-hidden flex-1">
                                                        {isExpanded ? <ChevronDown size={14} className="text-indigo-500 shrink-0" /> : <ChevronRight size={14} className="text-slate-400 shrink-0" />}
                                                        <FolderOpen size={16} className={`${isExpanded ? 'text-indigo-500' : 'text-slate-400'} shrink-0`} />
                                                        {editingFolderId === folder.id ? (
                                                            <input
                                                                type="text"
                                                                value={editFolderName}
                                                                onChange={(e) => setEditFolderName(e.target.value)}
                                                                onBlur={() => handleFolderRenameSave(folder.id)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') handleFolderRenameSave(folder.id);
                                                                    if (e.key === 'Escape') setEditingFolderId(null);
                                                                }}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="flex-1 px-1 py-0 text-xs font-bold bg-white dark:bg-slate-700 border border-indigo-300 dark:border-indigo-700 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <span className={`text-xs font-bold truncate ${isExpanded ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}>
                                                                {folder.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (confirm("建立在資料夾內的『點擊建檔』與『雙向連結』僅限於該資料夾內有效。\n確定要刪除整個資料夾嗎？")) {
                                                                    onDeleteFolder(folder.id);
                                                                }
                                                            }}
                                                            className="p-1 hover:text-red-500 text-slate-400"
                                                            title="刪除"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* CSS Grid 彈性展開動畫：內容常駐提高渲染額費，不再条件淡入 */}
                                                <div style={{
                                                    display: 'grid',
                                                    gridTemplateRows: isExpanded ? '1fr' : '0fr',
                                                    transition: 'grid-template-rows 0.35s cubic-bezier(0.4,0,0.2,1)',
                                                    overflow: 'hidden',
                                                }}>
                                                    <div style={{
                                                        minHeight: 0,
                                                        opacity: isExpanded ? 1 : 0,
                                                        transform: isExpanded ? 'translateY(0)' : 'translateY(-8px)',
                                                        transition: isExpanded
                                                            ? 'opacity 0.3s ease 0.05s, transform 0.3s ease 0.05s'
                                                            : 'opacity 0.18s ease, transform 0.18s ease',
                                                    }}>
                                                        <div className="pl-4 space-y-0.5 border-l-2 border-indigo-100/50 dark:border-indigo-900/30 ml-6 mb-2">
                                                            {folderDocs.length === 0 ? (
                                                                <p className="px-4 py-2 text-[10px] text-slate-400 dark:text-slate-600 italic">無文件</p>
                                                            ) : (
                                                                folderDocs.map(doc => (
                                                                    <DocumentItem
                                                                        key={doc.id}
                                                                        document={doc}
                                                                        isActive={doc.id === currentDocId}
                                                                        onClick={() => onSelectDocument(doc.id)}
                                                                        onDelete={() => onDeleteDocument(doc.id)}
                                                                        onRename={(newName) => onRenameDocument(doc.id, newName)}
                                                                        onMove={(fId) => onMoveDocument(doc.id, fId)}
                                                                        onSelectDocument={onSelectDocument}
                                                                        folders={folders}
                                                                        backlinks={getBacklinks(doc.name)}
                                                                    />
                                                                ))
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* 獨立文件區域 */}
                            <div
                                className="space-y-1"
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.classList.add('bg-slate-100/50', 'dark:bg-slate-800/30');
                                }}
                                onDragLeave={(e) => {
                                    e.currentTarget.classList.remove('bg-slate-100/50', 'dark:bg-slate-800/30');
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.classList.remove('bg-slate-100/50', 'dark:bg-slate-800/30');
                                    const docId = e.dataTransfer.getData('text/plain');
                                    if (docId) onMoveDocument(docId, null);
                                }}
                            >
                                <div className="px-4 py-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">獨立文件</span>
                                </div>
                                {documents.filter(d => !d.folderId).length === 0 ? (
                                    <p className="px-8 py-2 text-[10px] text-slate-400 dark:text-slate-600 italic">尚無獨立文件</p>
                                ) : (
                                    documents.filter(d => !d.folderId).map(doc => (
                                        <DocumentItem
                                            key={doc.id}
                                            document={doc}
                                            isActive={doc.id === currentDocId}
                                            onClick={() => onSelectDocument(doc.id)}
                                            onDelete={() => onDeleteDocument(doc.id)}
                                            onRename={(newName) => onRenameDocument(doc.id, newName)}
                                            onMove={(fId) => onMoveDocument(doc.id, fId)}
                                            onSelectDocument={onSelectDocument}
                                            folders={folders}
                                            backlinks={getBacklinks(doc.name)}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                </div>

                {/* 底部按鈕與統計區域 */}
                <div className="mt-auto border-t border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                    <button
                        onClick={() => setIsToolsOpen(true)}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
                    >
                        <Wrench size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                        <span className="text-xs font-bold tracking-wide">更多工具</span>
                    </button>

                    <div className="px-4 py-3 bg-slate-50/50 dark:bg-slate-800/50">
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
