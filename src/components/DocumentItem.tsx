import React, { useState } from 'react';
import { FileText, FileCode2, Trash2, Clock } from 'lucide-react';
import { DocumentRecord } from '../types';

interface DocumentItemProps {
    document: DocumentRecord;
    isActive: boolean;
    onClick: () => void;
    onDelete: () => void;
    onRename: (newName: string) => void;
}

const DocumentItem: React.FC<DocumentItemProps> = ({
    document,
    isActive,
    onClick,
    onDelete,
    onRename,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(document.name);

    const handleDoubleClick = () => {
        setIsEditing(true);
        setEditName(document.name);
    };

    const handleSave = () => {
        if (editName.trim()) {
            onRename(editName.trim());
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setIsEditing(false);
            setEditName(document.name);
        }
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // 避免觸發 onClick
        if (confirm(`確定要刪除「${document.name}」嗎？`)) {
            onDelete();
        }
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return '剛剛';
        if (minutes < 60) return `${minutes} 分鐘前`;
        if (hours < 24) return `${hours} 小時前`;
        if (days < 7) return `${days} 天前`;
        return date.toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' });
    };

    return (
        <div
            onClick={onClick}
            onDoubleClick={handleDoubleClick}
            className={`
        group relative px-3 py-2.5 mx-2 rounded-2xl cursor-pointer transition-all
        ${isActive
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800'
                    : 'hover:bg-slate-100 dark:hover:bg-white/10 border border-transparent'
                }
      `}
        >
            <div className="flex items-start gap-2">
                {/* 模式圖示 */}
                <div className={`mt-0.5 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-600'}`}>
                    {document.mode === 'mermaid' ? <FileCode2 size={16} /> : <FileText size={16} />}
                </div>

                {/* 文檔名稱 */}
                <div className="flex-1 min-w-0">
                    {isEditing ? (
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onBlur={handleSave}
                            onKeyDown={handleKeyDown}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-2 py-0.5 text-sm font-medium bg-white dark:bg-slate-700 border border-indigo-300 dark:border-indigo-700 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
                            autoFocus
                        />
                    ) : (
                        <div
                            className={`text-sm font-medium truncate ${isActive
                                ? 'text-indigo-700 dark:text-indigo-300'
                                : 'text-slate-700 dark:text-slate-300'
                                }`}
                            title={document.name}
                        >
                            {document.name}
                        </div>
                    )}

                    {/* 時間標記與模式標籤 */}
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-400 dark:text-slate-600">
                        <div className="flex items-center gap-1">
                            <Clock size={10} />
                            <span>{formatTime(document.updatedAt)}</span>
                        </div>
                        <span className="text-slate-300 dark:text-slate-700">·</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${document.mode === 'mermaid'
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            : 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            }`}>
                            {document.mode === 'mermaid' ? '美人魚' : '標記掉落'}
                        </span>
                    </div>
                </div>

                {/* 刪除按鈕 */}
                <button
                    onClick={handleDeleteClick}
                    className="md-ripple-root opacity-0 group-hover:opacity-100 shrink-0 p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-all [&_.md-ripple-wave]:text-red-600/20"
                    title="刪除文檔"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );
};

export default DocumentItem;
