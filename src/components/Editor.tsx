import React, { forwardRef } from 'react';
import { FileCode, Check, Copy, RefreshCw, Trash2, Menu } from 'lucide-react';

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
    onToggleSidebar?: () => void;  // 新增漢堡選單回調
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
    onToggleSidebar
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

                // Calculate removed characters
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
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                    {/* 漢堡選單按鈕 */}
                    <button
                        onClick={onToggleSidebar}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-all text-slate-500 dark:text-slate-400 active:scale-90"
                        title="文檔歷史"
                    >
                        <Menu size={18} />
                    </button>
                    <FileCode size={18} className="text-indigo-500" />
                    <span className="uppercase text-slate-600 dark:text-slate-400">{mode === 'mermaid' ? '美人魚 編輯者' : '標記掉落 編輯者'}</span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={onCopy} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-all text-slate-500 dark:text-slate-400 active:scale-90" title="複製">
                        {copied ? <Check size={16} className="text-green-600 dark:text-green-500" /> : <Copy size={16} />}
                    </button>
                    <button onClick={onReset} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-all text-slate-500 dark:text-slate-400 active:scale-90" title="重置"><RefreshCw size={16} /></button>
                    <button onClick={onClear} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded-md transition-all text-slate-500 dark:text-slate-400 active:scale-90" title="清除"><Trash2 size={16} /></button>
                </div>
            </div>

            <div className="flex-1 relative flex overflow-hidden">
                {/* Line Numbers */}
                <div
                    ref={lineNumbersRef}
                    className="h-full pt-6 pb-6 px-2 text-right bg-slate-50 dark:bg-slate-800 border-r border-slate-100 dark:border-slate-800 select-none overflow-hidden custom-scrollbar transition-colors duration-200"
                    style={{ width: '3rem' }} // Fixed width
                >
                    {lines.map(line => (
                        <div key={line} className="mono text-sm leading-relaxed text-slate-300 dark:text-slate-600">
                            {line}
                        </div>
                    ))}
                </div>

                {/* Textarea */}
                <textarea
                    ref={ref}
                    onScroll={handleScroll}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 h-full p-6 mono text-sm leading-relaxed resize-none focus:outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 custom-scrollbar selection:bg-indigo-100 dark:selection:bg-indigo-900/50 placeholder:text-slate-300 dark:placeholder:text-slate-700 transition-colors duration-200"
                    placeholder={mode === 'mermaid' ? "進入 美人魚 代碼 這裡... ..." : "進入 標記掉落 代碼 這裡......"}
                    spellCheck={false}
                    style={{ paddingLeft: '1.5rem' }} // Reduce padding slightly to fit with line numbers nicely
                />
            </div>
        </section>
    );
});

export default Editor;
