import React, { useEffect, useRef, useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { MathJax } from 'better-react-mathjax';
import rehypeRaw from 'rehype-raw';
import mermaid from 'mermaid';
import embed from 'vega-embed';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownPreviewProps {
    content: string;
    theme?: 'default' | 'neutral' | 'dark' | 'forest';
    isDarkMode: boolean;
}

const MermaidBlock: React.FC<{ code: string; isDarkMode: boolean }> = React.memo(({ code, isDarkMode }) => {
    const [svg, setSvg] = useState('');
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setIsPending(true);
        const timer = setTimeout(async () => {
            try {
                // 1. Validate syntax first directly
                // This prevents mermaid.render from injecting error artifacts into the DOM
                await mermaid.parse(code);

                // 2. Only render if valid
                const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                const { svg: renderedSvg } = await mermaid.render(id, code);

                setSvg(renderedSvg);
                setError(null); // Clear error on success
            } catch (err: any) {
                console.error('Mermaid render error:', err);
                setError(err.message || 'Syntax Error');
                // We do NOT clear setSvg here, preserving the last good render
            } finally {
                setIsPending(false);
            }
        }, 500); // 500ms debounce to stabilize typing
        return () => clearTimeout(timer);
    }, [code, isDarkMode]);

    // Extract custom size directives (%% width: ... or %% scale: ...)
    // This allows users to override SVG sizing behavior directly from the markdown
    const containerStyle = useMemo(() => {
        const style: React.CSSProperties = {};

        // Match %% width: 50% or 500px
        const widthMatch = code.match(/%%\s*width:\s*([^\n]+)/i);
        if (widthMatch) {
            style.width = widthMatch[1].trim();
            style.maxWidth = 'none'; // Override default constraints
        }

        // Match %% scale: 0.8
        const scaleMatch = code.match(/%%\s*scale:\s*([\d.]+)/i);
        if (scaleMatch) {
            const scale = parseFloat(scaleMatch[1]);
            if (!isNaN(scale)) {
                style.transform = `scale(${scale})`;
                style.transformOrigin = 'top center';
                style.width = `${100 / scale}%`; // Compensate width if scaling down to prevent empty space
            }
        }

        return style;
    }, [code]);

    if (!svg && error) {
        return (
            <div className="my-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-mono whitespace-pre-wrap">
                <div className="font-bold mb-2">Mermaid Syntax Error</div>
                {error}
            </div>
        );
    }

    return (
        <div className="my-6 relative group" style={containerStyle}>
            <div
                className={`flex justify-center bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 overflow-auto transition-opacity duration-300 ${isPending ? 'opacity-50' : 'opacity-100'}`}
                dangerouslySetInnerHTML={{ __html: svg }}
            />

            {/* Loading Indicator */}
            {isPending && !error && (
                <div className="absolute top-2 right-2">
                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* Error Overlay (Lightweight hint) */}
            {error && (
                <div className="absolute top-0 left-0 right-0 -mt-3 flex justify-center z-10 pointer-events-none">
                    <div className="bg-red-100 dark:bg-red-900/80 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-200 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-2 backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        Syntax Error - Showing last valid version
                    </div>
                </div>
            )}
        </div>
    );
});

const VegaBlock: React.FC<{ code: string; isDarkMode: boolean }> = React.memo(({ code, isDarkMode }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isPending, setIsPending] = useState(false);

    useEffect(() => {
        setIsPending(true);
        const timer = setTimeout(async () => {
            if (!ref.current) return;
            try {
                const spec = JSON.parse(code);
                await embed(ref.current, spec, { actions: false, theme: isDarkMode ? 'dark' : 'vox' });
            } catch (err) {
                console.error('Vega render error:', err);
            } finally {
                setIsPending(false);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [code, isDarkMode]);

    return (
        <div className="my-6 relative group">
            <div
                ref={ref}
                className={`overflow-auto bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 transition-opacity duration-300 ${isPending ? 'opacity-50' : 'opacity-100'}`}
            />
            {isPending && (
                <div className="absolute top-2 right-2">
                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
});

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, theme, isDarkMode }) => {
    const isDark = isDarkMode;

    // Add debounce for content to reduce re-rendering during typing
    const [debouncedContent, setDebouncedContent] = useState(content);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedContent(content);
        }, 300); // 300ms debounce for markdown/math rendering

        return () => clearTimeout(timer);
    }, [content]);

    // 1. Pre-process content to protect MathJax from Markdown parsers
    const processedContent = useMemo(() => {
        if (!debouncedContent) return { text: '', store: {} };

        let protectedContent = debouncedContent;
        const mathStore: Record<string, string> = {};
        const codeBlockStore: Record<string, string> = {};

        // Step 1: Protect code blocks first (to prevent math inside code blocks from being processed)
        protectedContent = protectedContent.replace(/```[\s\S]*?```/g, (match) => {
            const id = `CODE-BLOCK-${Math.random().toString(36).substr(2, 9)}`;
            codeBlockStore[id] = match;
            return id;
        });

        // Step 2: Protect display math $$...$$
        protectedContent = protectedContent.replace(/\$\$([\s\S]*?)\$\$/g, (match, tex) => {
            const id = `MATH-DISPLAY-${Math.random().toString(36).substr(2, 9)}`;
            mathStore[id] = tex;
            return `<div data-math-id="${id}" class="math-display-protector"></div>`;
        });

        // Step 3: Protect inline math $...$ 
        protectedContent = protectedContent.replace(/(?<!\\)\$((?:\\.|[^$])+?)(?<!\\)\$/g, (match, tex) => {
            const id = `MATH-INLINE-${Math.random().toString(36).substr(2, 9)}`;
            mathStore[id] = tex;
            return `<span data-math-id="${id}" class="math-inline-protector"></span>`;
        });

        // Step 4: Restore code blocks
        protectedContent = protectedContent.replace(/CODE-BLOCK-[a-z0-9]+/g, (id) => {
            return codeBlockStore[id] || id;
        });

        return { text: protectedContent, store: mathStore };
    }, [debouncedContent]);

    const components = useMemo(() => ({
        code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const codeString = String(children).replace(/\n$/, '');

            if (!inline) {
                // Special renderers for Mermaid and Vega
                if (language === 'mermaid') {
                    return <MermaidBlock code={codeString} isDarkMode={isDark} />;
                }
                if (language === 'vega' || language === 'vega-lite') {
                    return <VegaBlock code={codeString} isDarkMode={isDark} />;
                }

                // Syntax highlighting for all other code blocks
                return (
                    <SyntaxHighlighter
                        language={language || 'text'}
                        style={isDark ? vscDarkPlus : vs}
                        customStyle={{
                            borderRadius: '0.75rem',
                            padding: '1rem',
                            marginTop: '1.5rem',
                            marginBottom: '1.5rem',
                            fontSize: '0.875rem',
                            lineHeight: '1.5',
                        }}
                        showLineNumbers={true}
                        wrapLines={true}
                    >
                        {codeString}
                    </SyntaxHighlighter>
                );
            }

            return (
                <code className={className} {...props}>
                    {children}
                </code>
            );
        },
        // Custom handlers for our protected math blocks
        div: ({ node, ...props }: any) => {
            if (props.className === 'math-display-protector' && props['data-math-id']) {
                const id = props['data-math-id'];
                const tex = processedContent.store[id];
                if (tex) {
                    return (
                        <div className="my-4 overflow-x-auto">
                            <MathJax dynamic>{`$$${tex}$$`}</MathJax>
                        </div>
                    );
                }
            }
            return <div {...props} />;
        },
        span: ({ node, ...props }: any) => {
            if (props.className === 'math-inline-protector' && props['data-math-id']) {
                const id = props['data-math-id'];
                const tex = processedContent.store[id];
                if (tex) {
                    return <MathJax dynamic inline>{`$${tex}$`}</MathJax>;
                }
            }
            return <span {...props} />;
        }
    }), [isDark, processedContent]);

    return (
        <div className={`prose max-w-none p-8 select-text ${isDark ? 'prose-invert' : 'prose-slate'} prose-headings:font-bold prose-a:text-indigo-600 prose-img:rounded-xl prose-table:border-collapse prose-th:border prose-th:border-slate-300 dark:prose-th:border-slate-700 prose-th:p-2 prose-td:border prose-td:border-slate-300 dark:prose-td:border-slate-700 prose-td:p-2 print:p-0 print:max-w-none`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]} // Removed remarkMath as we handle it manually
                rehypePlugins={[rehypeRaw]}
                components={components}
            >
                {processedContent.text}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownPreview;
