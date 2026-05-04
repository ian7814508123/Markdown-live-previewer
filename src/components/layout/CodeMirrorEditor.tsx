
import React, { useCallback, useEffect, useMemo } from 'react';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { mermaid } from 'codemirror-lang-mermaid';
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode';
import { EditorView, keymap } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { searchKeymap, openSearchPanel, search } from '@codemirror/search';

interface CodeMirrorEditorProps {
    mode: 'mermaid' | 'markdown';
    code: string;
    setCode: (code: string) => void;
    isDarkMode: boolean;
    onScroll?: (e: any) => void;
    placeholder?: string;
}

const CodeMirrorEditor = React.forwardRef<ReactCodeMirrorRef, CodeMirrorEditorProps>((props, ref) => {
    const { mode, code, setCode, isDarkMode, onScroll, placeholder } = props;

    const extensions = useMemo(() => {
        const exts = [
            EditorView.lineWrapping,
            EditorState.tabSize.of(2),
            EditorView.theme({
                '.cm-content, .cm-gutter': {
                    lineHeight: '1.5',
                },
                '.cm-gutterElement': {
                    fontStyle: 'italic',
                },
            }),
            mode === 'mermaid' ? mermaid() : markdown({ base: markdownLanguage, codeLanguages: languages }),
            // 搜尋擴充與快速鍵
            search({ top: true }),
            keymap.of(searchKeymap),
            // 透過 domEventHandlers 確保監聽到 scroller 的捲動事件
            EditorView.domEventHandlers({
                scroll: (event, view) => {
                    if (onScroll) onScroll(event);
                }
            })
        ];
        return exts;
    }, [mode, onScroll]);

    const theme = isDarkMode ? vscodeDark : vscodeLight;

    const handleChange = useCallback((value: string) => {
        setCode(value);
    }, [setCode]);

    // Handle scroll synchronization
    const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
        if (onScroll) {
            onScroll(event);
        }
    }, [onScroll]);

    return (
        <CodeMirror
            ref={ref}
            value={code}
            height="100%"
            theme={theme}
            extensions={extensions}
            onChange={handleChange}
            onScroll={handleScroll}
            placeholder={placeholder}
            basicSetup={{
                lineNumbers: true,
                highlightActiveLine: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: true,
                foldGutter: true,
                dropCursor: true,
                allowMultipleSelections: true,
                indentOnInput: true,
            }}
            style={{
                fontSize: '14px',
                height: '100%',
                width: '100%',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            }}
            className="codemirror-editor-container"
            aria-label={mode === 'mermaid' ? 'Mermaid 圖表代碼編輯器' : 'Markdown 內容編輯器'}
        />
    );
});

export default CodeMirrorEditor;
