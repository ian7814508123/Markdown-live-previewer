
import React, { forwardRef, useState } from 'react';
import { FileCode, Check, Copy, RefreshCw, Trash2, Menu, X, FileText, FileSearch } from 'lucide-react';
import RippleButton from './RippleButton';
import CodeMirrorEditor from './CodeMirrorEditor';
import { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import IntroModal from './IntroModal';

interface EditorProps {
    mode: 'mermaid' | 'markdown';
    code: string;
    setCode: (code: string) => void;
    onCopy: () => void;
    onReset: () => void;
    onClear: () => void;
    copied: boolean;
    onScroll?: (e: any) => void;
    isDarkMode: boolean;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onToggleSidebar?: () => void;
    // Tab 相關
    openDocIds?: string[];
    currentDocId?: string | null;
    documents?: any[]; // 用來取得標題與模式
    onSwitchTab?: (docId: string) => void;
    onCloseTab?: (docId: string, e: React.MouseEvent) => void;
}

const Editor = forwardRef<ReactCodeMirrorRef, EditorProps>(({
    mode,
    code,
    setCode,
    onCopy,
    onReset,
    onClear,
    copied,
    onScroll,
    isDarkMode,
    onMouseEnter,
    onMouseLeave,
    onToggleSidebar,
    openDocIds = [],
    currentDocId,
    documents = [],
    onSwitchTab,
    onCloseTab,
}, ref) => {

    const [isIntroOpen, setIsIntroOpen] = useState(false);

    const handleSearch = () => {
        if (ref && 'current' in ref && ref.current?.view) {
            import('@codemirror/search').then(({ openSearchPanel }) => {
                openSearchPanel(ref.current!.view!);
            });
        }
    };

    return (
        <section
            className="w-[400px] lg:w-[480px] flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-20 shadow-xl transition-colors duration-200 print:hidden"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {/* 整合後的 Tab Bar + 工具列 (精緻瀏覽器風格) */}
            <div className="flex items-end border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 pl-0 pr-1 pt-1.5 sticky top-0 z-30 select-none overflow-hidden" onMouseEnter={onMouseEnter}>
                {/* 左側漢堡選單 (圓角按鈕風格) - 稍微左移以與分頁對齊 */}
                <div className="flex flex-nowrap items-end flex-1 min-w-0">
                    {/* 使用 -mb-px 讓底部邊框與 header 對齊 */}
                    <div className="flex items-center gap-1 px-2 mb-1">
                        <RippleButton
                            variant="icon"
                            onClick={onToggleSidebar}
                            aria-label="我的文檔"
                            title="我的文檔"
                            className="w-8 h-8 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full"
                        >
                            <Menu size={18} />
                        </RippleButton>
                    </div>

                    {/* 分頁區域 */}
                    {openDocIds.map(id => {
                        const doc = documents.find(d => d.id === id);
                        if (!doc) return null;
                        const isActive = id === currentDocId;
                        return (
                            <div
                                key={id}
                                onClick={() => onSwitchTab?.(id)}
                                className={`
                                    flex items-center gap-2 px-2.5 py-2 text-[10px] font-medium cursor-pointer transition-all relative group
                                    ${isActive
                                        ? 'bg-white dark:bg-slate-900 text-brand-primary rounded-t-xl shadow-[0_-8px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_-8px_20px_rgba(0,0,0,0.15)] z-10 flex-[2_2_0%]'
                                        : 'text-slate-500 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 bg-slate-200/50 dark:bg-slate-800/30 rounded-t-lg mb-0.5 mx-0.5 flex-1'
                                    }
                                `}
                                style={{ minWidth: isActive ? '120px' : '44px', maxWidth: '180px' }}
                            >
                                {doc.mode === 'mermaid' ? <FileCode size={12} className={isActive ? 'text-brand-primary' : 'opacity-60'} /> : <FileText size={12} className={isActive ? 'text-brand-primary' : 'opacity-60'} />}
                                <span className={`truncate flex-1 ${isActive ? 'font-bold' : ''}`}>{doc.name}</span>
                                <button
                                    onClick={(e) => onCloseTab?.(id, e)}
                                    aria-label="關閉此分頁"
                                    className={`
                                        p-0.5 rounded-full transition-all flex items-center justify-center
                                        ${isActive
                                            ? 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600'
                                            : 'opacity-0 group-hover:opacity-100 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-500'
                                        }
                                    `}
                                >
                                    <X size={12} />
                                </button>

                                {/* 瀏覽器風格的側邊圓角過渡 (Active state only) */}
                                {isActive && (
                                    <>
                                        {/* 瀏覽器風格的側邊圓角過渡 - 增加 z-index 並微調位置以消除渲染瑕疵 */}
                                        <div className="absolute -left-2 bottom-0 w-2 h-2 bg-white dark:bg-slate-900 pointer-events-none z-20">
                                            <div className="w-2 h-2 rounded-br-xl bg-slate-100 dark:bg-slate-950" />
                                        </div>
                                        <div className="absolute -right-2 bottom-0 w-2 h-2 bg-white dark:bg-slate-900 pointer-events-none z-20">
                                            <div className="w-2 h-2 rounded-bl-xl bg-slate-100 dark:bg-slate-950" />
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* 右側操作按鈕 */}
                <div className="flex items-center gap-1 px-2 mb-1">
                    <RippleButton variant="icon" onClick={handleSearch}
                        aria-label="搜尋與取代 (Ctrl+F)"
                        title="搜尋 (Ctrl+F)" className="w-8 h-8 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800">
                        <FileSearch size={14} />
                    </RippleButton>
                    <RippleButton variant="icon" onClick={onCopy}
                        aria-label="複製內容"
                        title="複製" className="w-8 h-8 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800">
                        {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                    </RippleButton>
                    <RippleButton variant="icon" onClick={onReset}
                        aria-label="還原初始內容"
                        title="重置" className="w-8 h-8 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800">
                        <RefreshCw size={14} />
                    </RippleButton>
                    <RippleButton variant="icon" onClick={onClear}
                        aria-label="清空編輯器"
                        title="清除" className="w-8 h-8 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <Trash2 size={14} />
                    </RippleButton>
                </div>
            </div>

            {/* 編輯區域 */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900 transition-colors duration-200 relative">
                {/* 核心編輯器 */}
                {openDocIds.length > 0 && (
                    <CodeMirrorEditor
                        ref={ref}
                        mode={mode}
                        code={code}
                        setCode={setCode}
                        isDarkMode={isDarkMode}
                        onScroll={onScroll}
                        placeholder={mode === 'mermaid' ? "Enter Mermaid code..." : "Enter Markdown content..."}
                    />
                )}

                {/* 空狀態覆蓋層 (具備「吸入」Footer 的動畫效果) */}
                <div className={`
                    absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-8 space-y-6 bg-white dark:bg-slate-900 z-20 transition-all duration-700 ease-in-out
                    ${openDocIds.length > 0
                        ? 'opacity-0 scale-[0.1] translate-x-[100%] translate-y-[100%] pointer-events-none blur-sm'
                        : 'opacity-100 scale-100 translate-x-0 translate-y-0'
                    }
                `}>
                    <div className="relative">
                        <div className="absolute -inset-4 bg-brand-primary/10 dark:bg-brand-primary/5 rounded-full blur-2xl animate-pulse"></div>
                        <div className="relative p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700">
                            <FileSearch size={40} className="text-brand-primary" />
                        </div>
                    </div>
                    <div className="text-center space-y-2 max-w-xs">
                        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">尚未開啟任何文件</h3>
                        <p className="text-sm leading-relaxed">
                            請在左側工具欄點選文件圖示，從「我的文檔」中選擇文件開始編輯。
                        </p>
                    </div>
                    <button
                        onClick={onToggleSidebar}
                        className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 active:scale-95 transition-all"
                    >
                        <Menu size={15} />
                        開啟側邊欄
                    </button>
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-sm leading-relaxed">
                            不知道如何開始嗎?要不要看看
                        </p>
                        <button
                            onClick={() => setIsIntroOpen(true)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 active:scale-95 transition-all"
                        >
                            功能介紹
                        </button>
                    </div>
                </div>
            </div>
            <IntroModal
                isOpen={isIntroOpen}
                onClose={() => setIsIntroOpen(false)}
            />
        </section>

    );
});

export default Editor;
