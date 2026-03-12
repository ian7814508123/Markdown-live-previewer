
import React, { forwardRef, useEffect, useRef } from 'react';
import { FileCode, Check, Copy, RefreshCw, Trash2, Menu, X, FileText } from 'lucide-react';
import RippleButton from './RippleButton';

// CodeMirror 6 Imports
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { syntaxHighlighting, defaultHighlightStyle, indentOnInput, bracketMatching, foldGutter, foldKeymap } from '@codemirror/language';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { lintKeymap } from '@codemirror/lint';
import { oneDark } from '@codemirror/theme-one-dark';

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
    documents?: any[];
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
    const editorContainerRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const codeRef = useRef(code);
    
    // 使用 useRef 儲存 Compartment 實例以確保持久性
    const themeConfigRef = useRef(new Compartment());
    const highlightConfigRef = useRef(new Compartment());
    
    // Keep codeRef in sync with code prop for event handlers
    useEffect(() => {
        codeRef.current = code;
    }, [code]);

    // Handle focus/selection proxy for the parent ref
    React.useImperativeHandle(ref, () => ({
        focus: () => viewRef.current?.focus(),
        get value() {
            return viewRef.current?.state.doc.toString() || '';
        },
        set value(v: string) {
            if (viewRef.current) {
                viewRef.current.dispatch({
                    changes: { from: 0, to: viewRef.current.state.doc.length, insert: v }
                });
            }
        },
        get selectionStart() {
            return viewRef.current?.state.selection.main.from || 0;
        },
        get selectionEnd() {
            return viewRef.current?.state.selection.main.to || 0;
        },
        setSelectionRange(start: number, end: number) {
            viewRef.current?.dispatch({
                selection: { anchor: start, head: end },
                scrollIntoView: true
            });
        },
        getScrollTop: () => {
            const scroller = editorContainerRef.current?.querySelector('.cm-scroller');
            return scroller?.scrollTop || 0;
        },
        setScrollTop: (val: number) => {
            const scroller = editorContainerRef.current?.querySelector('.cm-scroller');
            if (scroller) scroller.scrollTop = val;
        },
        get scrollHeight() {
            const scroller = editorContainerRef.current?.querySelector('.cm-scroller');
            return scroller?.scrollHeight || 0;
        },
        get clientHeight() {
            const scroller = editorContainerRef.current?.querySelector('.cm-scroller');
            return scroller?.clientHeight || 0;
        },
        get scrollTop() {
            const scroller = editorContainerRef.current?.querySelector('.cm-scroller');
            return scroller?.scrollTop || 0;
        }
    } as any));

    // Initialize Editor
    useEffect(() => {
        if (!editorContainerRef.current) return;

        const state = EditorState.create({
            doc: code,
            extensions: [
                lineNumbers(),
                highlightActiveLineGutter(),
                highlightSpecialChars(),
                history(),
                foldGutter(),
                drawSelection(),
                dropCursor(),
                EditorState.allowMultipleSelections.of(true),
                indentOnInput(),
                bracketMatching(),
                closeBrackets(),
                autocompletion(),
                rectangularSelection(),
                crosshairCursor(),
                highlightActiveLine(),
                highlightSelectionMatches(),
                keymap.of([
                    ...closeBracketsKeymap,
                    ...defaultKeymap,
                    ...searchKeymap,
                    ...historyKeymap,
                    ...foldKeymap,
                    ...completionKeymap,
                    ...lintKeymap,
                    indentWithTab
                ]),
                markdown({ base: markdownLanguage, codeLanguages: languages }),
                EditorView.domEventHandlers({
                    scroll: (event, view) => {
                        if (onScroll) {
                            const target = event.target as HTMLElement;
                            onScroll({
                                currentTarget: target,
                                target: target
                            } as any);
                        }
                    }
                }),
                EditorView.updateListener.of((update) => {
                    if (update.docChanged) {
                        const newDoc = update.state.doc.toString();
                        if (newDoc !== codeRef.current) {
                            setCode(newDoc);
                        }
                    }
                }),
                themeConfigRef.current.of(isDarkMode ? oneDark : []),
                highlightConfigRef.current.of(syntaxHighlighting(defaultHighlightStyle, { fallback: true })),
                EditorView.theme({
                    "&": {
                        height: "100%",
                        fontSize: "14px",
                        backgroundColor: isDarkMode ? "#0f172a" : "#ffffff",
                        color: isDarkMode ? "#f8fafc" : "#1e293b",
                    },
                    ".cm-content": {
                        fontFamily: "'Fira Code', monospace",
                        padding: "0 1rem",
                    },
                    ".cm-gutters": {
                        backgroundColor: isDarkMode ? "#0f172a" : "#f8fafc",
                        color: isDarkMode ? "#64748b" : "#94a3b8",
                        border: "none",
                        borderRight: isDarkMode ? "1px solid #1e293b" : "1px solid #e2e8f0",
                    },
                    ".cm-activeLine": {
                        backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
                    },
                    ".cm-activeLineGutter": {
                        backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
                        color: isDarkMode ? "#cbd5e1" : "#475569",
                    }
                }, { dark: isDarkMode }),
                EditorView.lineWrapping,
            ],
        });

        const view = new EditorView({
            state,
            parent: editorContainerRef.current,
        });

        viewRef.current = view;

        return () => {
            view.destroy();
        };
    }, []); // Run once

    // Update content when code changes externally (e.g. tabs or templates)
    useEffect(() => {
        if (viewRef.current && code !== viewRef.current.state.doc.toString()) {
            viewRef.current.dispatch({
                changes: { from: 0, to: viewRef.current.state.doc.length, insert: code }
            });
        }
    }, [code]);

    // Handle Theme Change
    useEffect(() => {
        if (viewRef.current) {
            viewRef.current.dispatch({
                effects: [
                    themeConfigRef.current.reconfigure(isDarkMode ? oneDark : []),
                    highlightConfigRef.current.reconfigure(syntaxHighlighting(defaultHighlightStyle, { fallback: true }))
                ]
            });
        }
    }, [isDarkMode]);

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-100 dark:bg-slate-950 transition-colors duration-200">
            {/* 標題欄 / 分頁欄 */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950/80 backdrop-blur-md px-1 pt-1">
                <div className="flex flex-nowrap items-end flex-1 min-w-0">
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

                                {isActive && (
                                    <>
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
            <div
                ref={editorContainerRef}
                className="flex-1 overflow-hidden bg-white dark:bg-slate-900 transition-colors duration-200 relative"
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            />
        </div>
    );
});

Editor.displayName = 'Editor';

export default Editor;
