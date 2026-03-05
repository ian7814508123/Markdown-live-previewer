
import React, { forwardRef } from 'react';
import { FileCode, Check, Copy, RefreshCw, Trash2, Menu, X, FileText, FileSearch } from 'lucide-react';
import RippleButton from './RippleButton';

interface EditorProps {
    mode: 'mermaid' | 'markdown';
    code: string;
    setCode: (code: string) => void;
    onCopy: () => void;
    onReset: () => void;
    onClear: () => void;
    copied: boolean;
    onScroll?: (e: React.UIEvent<HTMLTextAreaElement>) => void;
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

const Editor = forwardRef<HTMLTextAreaElement, EditorProps>(({
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
    const lineNumbersRef = React.useRef<HTMLDivElement>(null);

    // Calculate lines
    const lines = React.useMemo(() => {
        return code.split('\n').map((_, i) => i + 1);
    }, [code]);

    const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
        if (lineNumbersRef.current) {
            lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
        }
        // Pass to parent listener if exists (for sync scroll feature)
        if (onScroll) {
            onScroll(e);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const target = e.target as HTMLTextAreaElement;
            const start = target.selectionStart;
            const end = target.selectionEnd;
            const value = target.value;
            const lines = value.split('\n');

            // Find start and end line indices
            let startLineIndex = value.substring(0, start).split('\n').length - 1;
            let endLineIndex = value.substring(0, end).split('\n').length - 1;

            if (e.shiftKey) {
                // Shift+Tab: Unindent
                const newLines = lines.map((line, i) => {
                    if (i >= startLineIndex && i <= endLineIndex) {
                        return line.startsWith('  ') ? line.substring(2) : line;
                    }
                    return line;
                });

                const newValue = newLines.join('\n');
                setCode(newValue);

                // Adjust selection
                // Simple adjustment: keep selection range but shifted. 
                // A full robust cursor adjustment is complex, but this is usually sufficient for simple editors.
                // Re-calculating cursor position is tricky without tracking exact changes per line.
                // We'll try to maintain relative position if possible, but resetting to end of range is safer to avoid glitches.
                // For a proper implementation, we would calculate the exact delta.

                let removedChars = 0;
                for (let i = startLineIndex; i <= endLineIndex; i++) {
                    if (lines[i].startsWith('  ')) removedChars += 2;
                }

                setTimeout(() => {
                    target.selectionStart = Math.max(0, start - (lines[startLineIndex].startsWith('  ') ? 2 : 0));
                    target.selectionEnd = Math.max(0, end - removedChars);
                }, 0);

            } else {
                // Tab: Indent
                if (start !== end) {
                    // Multi-line selection indent
                    const newLines = lines.map((line, i) => {
                        if (i >= startLineIndex && i <= endLineIndex) {
                            return '  ' + line;
                        }
                        return line;
                    });

                    const newValue = newLines.join('\n');
                    setCode(newValue);

                    setTimeout(() => {
                        // Adjust selection to cover the indentations
                        target.selectionStart = start + 2;
                        target.selectionEnd = end + (endLineIndex - startLineIndex + 1) * 2;
                    }, 0);
                } else {
                    // Single line / Cursor indent
                    const newValue = value.substring(0, start) + "  " + value.substring(end);
                    setCode(newValue);
                    setTimeout(() => {
                        target.selectionStart = target.selectionEnd = start + 2;
                    }, 0);
                }
            }
        }
    };

    return (
        <section
            className="w-[400px] lg:w-[480px] flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-20 shadow-xl transition-colors duration-200 print:hidden"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {/* 整合後的 Tab Bar + 工具列 (精緻瀏覽器風格) */}
            <div className="flex items-end border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 pl-0 pr-1 pt-1.5 sticky top-0 z-30 select-none overflow-hidden">
                {/* 左側漢堡選單 (圓角按鈕風格) - 稍微左移以與分頁對齊 */}
                <div className="flex flex-nowrap items-end flex-1 min-w-0">
                    {/* 使用 -mb-px 讓底部邊框與 header 對齊 */}
                    <div className="flex items-center gap-1 px-2 mb-1">
                        <RippleButton
                            variant="icon"
                            onClick={onToggleSidebar}
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
                                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 rounded-t-xl shadow-[0_-8px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_-8px_20px_rgba(0,0,0,0.15)] z-10 flex-[2_2_0%]'
                                        : 'text-slate-500 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 bg-slate-200/50 dark:bg-slate-800/30 rounded-t-lg mb-0.5 mx-0.5 flex-1'
                                    }
                                `}
                                style={{ minWidth: isActive ? '120px' : '44px', maxWidth: '180px' }}
                            >
                                {doc.mode === 'mermaid' ? <FileCode size={12} className={isActive ? 'text-indigo-500' : 'opacity-60'} /> : <FileText size={12} className={isActive ? 'text-indigo-500' : 'opacity-60'} />}
                                <span className={`truncate flex-1 ${isActive ? 'font-bold' : ''}`}>{doc.name}</span>
                                <button
                                    onClick={(e) => onCloseTab?.(id, e)}
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
                    <RippleButton variant="icon" onClick={onCopy} title="複製" className="w-8 h-8 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800">
                        {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                    </RippleButton>
                    <RippleButton variant="icon" onClick={onReset} title="重置" className="w-8 h-8 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800">
                        <RefreshCw size={14} />
                    </RippleButton>
                    <RippleButton variant="icon" onClick={onClear} title="清除" className="w-8 h-8 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <Trash2 size={14} />
                    </RippleButton>
                </div>
            </div>

            {/* 編輯區域 */}
            <div className="flex-1 flex overflow-hidden bg-white dark:bg-slate-900 transition-colors duration-200 relative">
                {openDocIds.length > 0 ? (
                    <>
                        {/* 行號 */}
                        <div
                            ref={lineNumbersRef}
                            className="w-12 pt-4 flex flex-col items-center bg-slate-50 dark:bg-slate-800/30 border-r border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600 font-mono text-xs select-none transition-colors duration-200 overflow-hidden"
                        >
                            {lines.map((_, i) => (
                                <div key={i} className="leading-6 h-6">{i + 1}</div>
                            ))}
                        </div>

                        <textarea
                            ref={ref}
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            onScroll={handleScroll}
                            onKeyDown={handleKeyDown}
                            onMouseEnter={onMouseEnter}
                            onMouseLeave={onMouseLeave}
                            className="flex-1 p-4 bg-transparent resize-none outline-none font-mono text-sm leading-6 text-slate-700 dark:text-slate-300 custom-scrollbar transition-colors duration-200"
                            placeholder={mode === 'mermaid' ? "Enter Mermaid code..." : "Enter Markdown content..."}
                            spellCheck={false}
                        />
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-8 space-y-6">
                        <div className="relative">
                            <div className="absolute -inset-4 bg-indigo-500/10 dark:bg-indigo-400/5 rounded-full blur-2xl animate-pulse"></div>
                            <div className="relative p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700">
                                <FileSearch size={48} className="text-indigo-500 dark:text-indigo-400" />
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
                            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                        >
                            <Menu size={18} />
                            開啟側邊欄
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
});

export default Editor;
