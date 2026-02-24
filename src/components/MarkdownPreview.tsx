import React, { useEffect, useState, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { MathJax } from 'better-react-mathjax';
import rehypeRaw from 'rehype-raw';
import mermaid from 'mermaid';
import embed from 'vega-embed';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import SmilesDrawer from 'smiles-drawer';

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

// ─── SMILES Block ──────────────────────────────────────────────────────────────
// 渲染 SMILES 化學結構式為 SVG 分子骨架圖
// 使用 SvgDrawer（非 Canvas Drawer）以避免 smiles-drawer v2.x 的 canvas 更新問題
const SmilesBlock: React.FC<{ code: string; isDarkMode: boolean }> = React.memo(({ code, isDarkMode }) => {
    const svgRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);

    useEffect(() => {
        setIsPending(true);
        const timer = setTimeout(() => {
            if (!svgRef.current) return;

            try {
                // 清空上一次渲染結果
                svgRef.current.innerHTML = '';

                const options = {
                    width: 500,
                    height: 300,
                    bondThickness: 1.0,
                    bondLength: 15,
                    shortBondLength: 0.85,
                    bondSpacing: 4,
                    atomVisualization: 'default',
                    themes: {
                        custom: {
                            C: isDarkMode ? '#e2e8f0' : '#1e293b',
                            N: isDarkMode ? '#93c5fd' : '#3b82f6',
                            O: isDarkMode ? '#fca5a5' : '#ef4444',
                            S: isDarkMode ? '#fde68a' : '#f59e0b',
                            BACKGROUND: isDarkMode ? '#1e293b' : '#ffffff',
                        }
                    },
                    theme: 'custom',
                    isometric: false,
                    debug: false,
                    terminalCarbons: false,
                    explicitHydrogens: false,
                    overlapSensitivity: 0.42,
                    overlapResolutionIterations: 1,
                    compactDrawing: true,
                    fontFamily: 'Inter, Arial, sans-serif',
                    fontSizeLarge: 6,
                    fontSizeSmall: 4,
                    padding: 20,
                    experimentalSSSR: true,
                    kkThreshold: 0.1,
                    kkInnerThreshold: 0.1,
                    kkMaxIteration: 20000,
                    kkMaxInnerIteration: 50,
                    kkMaxEnergy: 1e9,
                    weights: { ringOverlap: 10, overlap: 10, bondLength: 1 },
                };

                const drawer = new SmilesDrawer.SvgDrawer(options);
                SmilesDrawer.parse(
                    code.trim(),
                    (tree: any) => {
                        // 建立 SVG 元素並渲染
                        const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                        svgEl.setAttribute('width', '100%');
                        svgEl.setAttribute('height', '300');
                        svgRef.current?.appendChild(svgEl);
                        drawer.draw(tree, svgEl, isDarkMode ? 'dark' : 'light', false);
                        setError(null);
                    },
                    (err: any) => {
                        console.error('SMILES parse error:', err);
                        setError(typeof err === 'string' ? err : (err?.message || 'SMILES 解析失敗'));
                    }
                );
            } catch (err: any) {
                console.error('SMILES render error:', err)
                setError(err?.message || '渲染失敗');
            } finally {
                setIsPending(false);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [code, isDarkMode]);

    if (error) {
        return (
            <div className="my-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-mono whitespace-pre-wrap">
                <div className="font-bold mb-2">⚗️ SMILES 語法錯誤</div>
                {error}
            </div>
        );
    }

    return (
        <div className="my-6 relative group">
            <div
                ref={svgRef}
                className={`flex justify-center items-center min-h-[200px] bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 overflow-auto transition-opacity duration-300 ${isPending ? 'opacity-50' : 'opacity-100'}`}
            />
            {/* SMILES 標籤 */}
            <div className="absolute bottom-2 right-3 text-[10px] text-slate-400 dark:text-slate-600 font-mono select-none">
                SMILES
            </div>
            {/* 讀取指示器 */}
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

    // Customize how remark-math nodes are converted to HAST (HTML)
    // This ensures that 'math' nodes become 'div.math-display' and 'inlineMath' become 'span.math-inline'
    // containing the raw LaTeX, which our custom components will then render using MathJax.
    const remarkRehypeOptions = useMemo(() => ({
        handlers: {
            math: (h: any, node: any) => {
                // Return HAST element directly
                return {
                    type: 'element' as const,
                    tagName: 'div',
                    properties: { className: ['math-display'] },
                    children: [{ type: 'text' as const, value: node.value }]
                };
            },
            inlineMath: (h: any, node: any) => {
                return {
                    type: 'element' as const,
                    tagName: 'span',
                    properties: { className: ['math-inline'] },
                    children: [{ type: 'text' as const, value: node.value }]
                };
            }
        }
    }), []);

    const components = useMemo(() => ({
        code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const codeString = String(children).replace(/\n$/, '');

            if (!inline) {
                // Special renderers for Mermaid, Vega, and SMILES
                if (language === 'mermaid') {
                    return <MermaidBlock code={codeString} isDarkMode={isDark} />;
                }
                if (language === 'vega' || language === 'vega-lite') {
                    return <VegaBlock code={codeString} isDarkMode={isDark} />;
                }
                if (language === 'smiles') {
                    return <SmilesBlock code={codeString} isDarkMode={isDark} />;
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
        div: ({ node, className, children, ...props }: any) => {
            if (className?.includes('math-display')) {
                return (
                    <div className="my-4 overflow-x-auto" style={{ whiteSpace: 'nowrap' }}>
                        <MathJax dynamic>{`$$${children}$$`}</MathJax>
                    </div>
                );
            }
            return <div className={className} {...props}>{children}</div>;
        },
        span: ({ node, className, children, ...props }: any) => {
            if (className?.includes('math-inline')) {
                return (
                    <span className="math-inline" style={{ whiteSpace: 'nowrap' }}>
                        <MathJax dynamic inline>{`$${children}$`}</MathJax>
                    </span>
                );
            }
            return <span className={className} {...props}>{children}</span>;
        }
    }), [isDark]);

    return (
        <div className={`prose max-w-none p-8 select-text ${isDark ? 'prose-invert' : 'prose-slate'} prose-headings:font-bold prose-a:text-indigo-600 prose-img:rounded-xl prose-table:border-collapse prose-th:border prose-th:border-slate-300 dark:prose-th:border-slate-700 prose-th:p-2 prose-td:border prose-td:border-slate-300 dark:prose-td:border-slate-700 prose-td:p-2 print:p-0 print:max-w-none`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeRaw]}
                remarkRehypeOptions={remarkRehypeOptions}
                components={components}
            >
                {debouncedContent}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownPreview;
