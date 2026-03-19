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
    documents?: any[];
    onSelectDocument?: (docId: string) => void;
    onCreateMissing?: (name: string) => void;
    currentDocId?: string | null;
}

// ─── 輔助函式：簡單的字串雜湊 ──────────────────────────────────────────────────
// 用於生成基於內容的穩定 Key，防止 React 在內容未變時重新掛載組件
const hashString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
};

// ─── 輔助組件：可調整寬度與高度的容器 ────────────────────────────────────────────────
const ResizableWrapper: React.FC<{
    children: React.ReactNode;
    width: string;
    height: string;
    scale: number;
    onWidthChange: (width: string) => void;
    onHeightChange: (height: string) => void;
    onScaleChange: (scale: number) => void;
    onReset: () => void;
    isDarkMode: boolean;
}> = ({ children, width, height, scale, onWidthChange, onHeightChange, onScaleChange, onReset, isDarkMode }) => {
    return (
        <div className="relative group/resizable my-8 print:my-4 print:p-0 print:w-full">
            <div
                className="mx-auto transition-all duration-300 ease-in-out relative flex justify-center print:!max-h-none print:!overflow-visible print:w-full"
                style={{
                    width,
                    maxHeight: height === 'auto' ? 'none' : height,
                    overflow: height === 'auto' ? 'visible' : 'auto'
                }}
            >
                <div
                    className="print:![transform:none] print:![zoom:var(--print-scale)] print:w-full"
                    style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        '--print-scale': scale
                    } as any}
                >
                    {children}
                </div>
            </div>

            {/* 調整大小的 UI 面板 - 懸浮於上方 (列印時隱藏) */}
            <div className={`absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/resizable:opacity-100 transition-all duration-300 z-30 pointer-events-none group-hover/resizable:translate-y-0 translate-y-2 print:hidden`}>
                <div className={`pointer-events-auto flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border shadow-2xl backdrop-blur-xl ${isDarkMode
                    ? 'bg-slate-800/95 border-slate-700 text-slate-200'
                    : 'bg-white/95 border-slate-200 text-slate-600'
                    }`}>
                    {/* Width Control */}
                    <div className="flex items-center gap-1.5 border-r border-slate-200/20 pr-2.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider select-none opacity-50">W</span>
                        <input
                            type="range" min="30" max="100" step="5"
                            value={parseInt(width)}
                            onChange={(e) => onWidthChange(`${e.target.value}%`)}
                            className={`w-16 h-1 rounded-lg appearance-none cursor-pointer accent-indigo-500`}
                        />
                        <span className="text-[10px] font-mono min-w-[2.2rem] opacity-70">{width}</span>
                    </div>

                    {/* Height Control */}
                    <div className="flex items-center gap-1.5 border-r border-slate-200/20 pr-2.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider select-none opacity-50">H</span>
                        <input
                            type="range" min="150" max="800" step="10"
                            value={height === 'auto' ? 800 : parseInt(height)}
                            onChange={(e) => onHeightChange(`${e.target.value}px`)}
                            className={`w-16 h-1 rounded-lg appearance-none cursor-pointer accent-teal-500`}
                        />
                        <span className="text-[10px] font-mono min-w-[2.2rem] opacity-70">{height === 'auto' ? 'Auto' : height}</span>
                    </div>

                    {/* Scale Control */}
                    <div className="flex items-center gap-1.5 border-r border-slate-200/20 pr-2.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider select-none opacity-50">S</span>
                        <input
                            type="range" min="0.5" max="2" step="0.1"
                            value={scale}
                            onChange={(e) => onScaleChange(parseFloat(e.target.value))}
                            className={`w-16 h-1 rounded-lg appearance-none cursor-pointer accent-amber-500`}
                        />
                        <span className="text-[10px] font-mono min-w-[2.2rem] opacity-70">{scale.toFixed(1)}x</span>
                    </div>

                    {/* Reset Button */}
                    <button
                        onClick={onReset}
                        className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-indigo-500 hover:text-white transition-colors duration-200`}
                    >
                        RESET
                    </button>
                </div>
            </div>
        </div>
    );
};

// 初始化 Mermaid 配置，防止其在語法出錯時顯示預設的錯誤 UI
mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    // @ts-ignore - 部分版本類型定義可能未包含此屬性
    suppressError: true, // 關鍵：抑制預設錯誤提示
});

const MermaidBlock: React.FC<{ code: string; isDarkMode: boolean }> = React.memo(({ code, isDarkMode }) => {
    const [svg, setSvg] = useState('');
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isMounted = useRef(true);

    // 從程式碼註解中讀取初始設定
    const initialWidth = useMemo(() => {
        const widthMatch = code.match(/%%\s*width:\s*(\d+)%/i);
        return widthMatch ? `${widthMatch[1]}%` : '100%';
    }, [code]);

    const initialScale = useMemo(() => {
        const scaleMatch = code.match(/%%\s*scale:\s*([\d.]+)/i);
        return scaleMatch ? parseFloat(scaleMatch[1]) : 1;
    }, [code]);

    const [width, setWidth] = useState(initialWidth);
    const [height, setHeight] = useState('auto');
    const [scale, setScale] = useState(initialScale);

    useEffect(() => {
        isMounted.current = true;
        setIsPending(true);
        const timer = setTimeout(async () => {
            try {
                // 先進行語法檢查
                await mermaid.parse(code);

                const id = `mermaid-${hashString(code)}`;
                const { svg: renderedSvg } = await mermaid.render(id, code);

                if (isMounted.current) {
                    setSvg(renderedSvg);
                    setError(null);
                }
            } catch (err: any) {
                console.error('Mermaid render error:', err);
                if (isMounted.current) {
                    setError(err.message || 'Syntax Error');
                    // 如果渲染失敗，不更新 svg，保留上一個版本（或保持空白）
                }
            } finally {
                if (isMounted.current) {
                    setIsPending(false);
                }
            }
        }, 200);

        return () => {
            isMounted.current = false;
            clearTimeout(timer);
        };
    }, [code, isDarkMode]);

    const handleReset = () => {
        setWidth(initialWidth);
        setHeight('auto');
        setScale(initialScale);
    };

    if (!svg && error) {
        return (
            <div className="my-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-mono whitespace-pre-wrap">
                <div className="font-bold mb-2">Mermaid Syntax Error</div>
                {error}
            </div>
        );
    }

    return (
        <ResizableWrapper
            width={width}
            height={height}
            scale={scale}
            onWidthChange={setWidth}
            onHeightChange={setHeight}
            onScaleChange={setScale}
            onReset={handleReset}
            isDarkMode={isDarkMode}
        >
            <div
                className={`flex justify-center bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 overflow-auto transition-opacity duration-300 ${isPending ? 'opacity-50' : 'opacity-100'}`}
                style={{ width: '100%', height: 'auto' }}
                dangerouslySetInnerHTML={{ __html: svg }}
            />
            {isPending && !error && (
                <div className="absolute top-2 right-2">
                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}
            {error && (
                <div className="absolute top-0 left-0 right-0 -mt-3 flex justify-center z-10 pointer-events-none">
                    <div className="bg-red-100 dark:bg-red-900/80 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-200 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-2 backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        Syntax Error - Showing last valid version
                    </div>
                </div>
            )}
        </ResizableWrapper>
    );
});

const VegaBlock: React.FC<{ code: string; isDarkMode: boolean }> = React.memo(({ code, isDarkMode }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isPending, setIsPending] = useState(false);
    const [width, setWidth] = useState('100%');
    const [height, setHeight] = useState('auto');
    const [scale, setScale] = useState(1);

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
        }, 250);
        return () => clearTimeout(timer);
    }, [code, isDarkMode]);

    const handleReset = () => {
        setWidth('100%');
        setHeight('auto');
        setScale(1);
    };

    return (
        <ResizableWrapper
            width={width}
            height={height}
            scale={scale}
            onWidthChange={setWidth}
            onHeightChange={setHeight}
            onScaleChange={setScale}
            onReset={handleReset}
            isDarkMode={isDarkMode}
        >
            <div
                ref={ref}
                className={`overflow-auto bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 transition-opacity duration-300 ${isPending ? 'opacity-50' : 'opacity-100'}`}
                style={{ width: '100%', height: 'auto' }}
            />
            {isPending && (
                <div className="absolute top-2 right-2">
                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}
        </ResizableWrapper>
    );
});

const SmilesBlock: React.FC<{ code: string; isDarkMode: boolean }> = React.memo(({ code, isDarkMode }) => {
    const svgRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);
    const [width, setWidth] = useState('100%');
    const [height, setHeight] = useState('auto');
    const [scale, setScale] = useState(1);

    useEffect(() => {
        setIsPending(true);
        setError(null);
        const timer = setTimeout(() => {
            if (!svgRef.current) return;
            try {
                const drawer = new SmilesDrawer.SvgDrawer({
                    width: 200,
                    height: 100,
                    padding: 20,
                    bondThickness: 1.2,
                    bondLength: 15,
                    shortBondLength: 0.85,
                    bondSpacing: 4,
                    compactDrawing: true,
                    fontFamily: 'Inter, Arial, sans-serif',
                    terminalCarbons: false,
                    explicitHydrogens: false,
                });

                SmilesDrawer.parse(
                    code.trim(),
                    (tree: any) => {
                        if (!svgRef.current) return;
                        // 僅在準備好繪製時才清除舊內容，減少閃爍
                        svgRef.current.innerHTML = '';
                        const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                        svgEl.setAttribute('width', '100%');
                        svgEl.setAttribute('height', 'auto');
                        svgEl.setAttribute('viewBox', '0 0 200 100');
                        svgEl.style.maxHeight = '100%';
                        svgRef.current.appendChild(svgEl);
                        drawer.draw(tree, svgEl, isDarkMode ? 'dark' : 'light');
                        setError(null);
                    },
                    (err: any) => {
                        console.error('SMILES parse error:', err);
                        setError(typeof err === 'string' ? err : (err?.message || 'SMILES 解析失敗'));
                    }
                );
            } catch (err: any) {
                console.error('SMILES render error:', err);
                setError(err?.message || '渲染失敗');
            } finally {
                setIsPending(false);
            }
        }, 600);
        return () => clearTimeout(timer);
    }, [code, isDarkMode]);

    const handleReset = () => {
        setWidth('100%');
        setHeight('auto');
        setScale(1);
    };

    if (error) {
        return (
            <div className="my-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-mono whitespace-pre-wrap">
                <div className="font-bold mb-2">⚗️ SMILES 語法錯誤</div>
                {error}
            </div>
        );
    }

    return (
        <ResizableWrapper
            width={width}
            height={height}
            scale={scale}
            onWidthChange={setWidth}
            onHeightChange={setHeight}
            onScaleChange={setScale}
            onReset={handleReset}
            isDarkMode={isDarkMode}
        >
            <div
                ref={svgRef}
                className={`flex justify-center items-center min-h-[200px] bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 overflow-auto transition-opacity duration-300 ${isPending ? 'opacity-50' : 'opacity-100'}`}
                style={{ width: '100%', height: 'auto' }}
            />
            <div className="absolute bottom-2 right-3 text-[10px] text-slate-400 dark:text-slate-600 font-mono select-none">
                SMILES
            </div>
            {isPending && (
                <div className="absolute top-2 right-2">
                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}
        </ResizableWrapper>
    );
});

// ─── WikiLink 元件（模組層級，確保 React.memo 真正生效）───────────────────────────
interface WikiLinkProps {
    name: string;
    children: React.ReactNode;
    documents: any[];
    currentDocId?: string | null;
    onSelectDocument?: (docId: string) => void;
    onCreateMissing?: (name: string) => void;
}

const WikiLink: React.FC<WikiLinkProps> = React.memo(({ name, children, documents, currentDocId, onSelectDocument, onCreateMissing }) => {
    const decodedName = decodeURIComponent(name);
    const currentDoc = documents.find((d: any) => d.id === currentDocId);
    const isInVault = !!currentDoc?.folderId;
    if (!isInVault) return <span>[[{children}]]</span>;

    const targetDoc = documents.find((doc: any) => doc.name === decodedName && doc.folderId === currentDoc.folderId);
    const exists = !!targetDoc;

    return (
        <a
            href={`#wikilink-${encodeURIComponent(decodedName)}`}
            onClick={(e) => {
                // 如果在目前的「列印預覽模式」或「PDF」中，不攔截預設跳轉（讓它實現頁面內移動）
                // 但為了瀏覽器內的使用者體驗，如果是正常模式，依然執行切換文件
                if (window.location.hash.includes('wikilink-') || document.querySelector('.show-print-preview')) {
                    // 讓瀏覽器自然跳轉
                } else {
                    e.preventDefault();
                    if (exists && onSelectDocument && targetDoc) {
                        onSelectDocument(targetDoc.id);
                    } else if (!exists && onCreateMissing) {
                        onCreateMissing(name);
                    }
                }
            }}
            className={`px-1 py-0.5 rounded-md transition-all duration-200 ${exists ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border-b border-indigo-300 dark:border-indigo-700' : 'text-slate-400 dark:text-slate-500 bg-slate-100/50 dark:bg-slate-800/20 hover:bg-slate-200 dark:hover:bg-slate-800 border-b border-dashed border-slate-300 dark:border-slate-700 italic cursor-help'}`}
            title={exists ? `跳轉至: ${name}` : `文件不存在: ${name} (在目前資料夾中)`}
        >
            {children}
        </a>
    );
});

// ─── 數學與化學元件 (Memoized) ────────────────────────────────────────────────
interface MemoizedMathJaxProps {
    content: string;
    inline?: boolean;
    isDarkMode: boolean;
}

const MemoizedMathJax: React.FC<MemoizedMathJaxProps> = React.memo(({ content, inline, isDarkMode }) => {
    return (
        <MathJax
            renderMode="pre"
            inline={inline}
            dynamic={true}
            text={content}
            typesettingOptions={{ fn: 'tex2chtml' }}
        />
    );
});

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, theme, isDarkMode, documents = [], onSelectDocument, onCreateMissing, currentDocId }) => {
    const isDark = isDarkMode;
    const [debouncedContent, setDebouncedContent] = useState(content);

    useEffect(() => {
        const timer = setTimeout(() => {
            const processed = content.replace(/\[\[(.*?)\]\]/g, '[$1](#wikilink-$1)');
            setDebouncedContent(processed);
        }, 600);
        return () => clearTimeout(timer);
    }, [content]);


    const remarkRehypeOptions = useMemo(() => ({
        handlers: {
            math: (h: any, node: any) => ({
                type: 'element' as const,
                tagName: 'div',
                properties: { className: ['math-display'] },
                children: [{ type: 'text' as const, value: node.value }]
            }),
            inlineMath: (h: any, node: any) => ({
                type: 'element' as const,
                tagName: 'span',
                properties: { className: ['math-inline'] },
                children: [{ type: 'text' as const, value: node.value }]
            })
        }
    }), []);

    const components = useMemo(() => ({
        code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const codeString = String(children).replace(/\n$/, '');
            const stableKey = hashString(codeString);
            const line = node?.position?.start?.line;

            if (!inline) {
                if (language === 'mermaid') return <div data-line={line}><MermaidBlock key={stableKey} code={codeString} isDarkMode={isDark} /></div>;
                if (language === 'vega' || language === 'vega-lite') return <div data-line={line}><VegaBlock key={stableKey} code={codeString} isDarkMode={isDark} /></div>;
                if (language === 'smiles') return <div data-line={line}><SmilesBlock key={stableKey} code={codeString} isDarkMode={isDark} /></div>;

                return (
                    <div data-line={line}>
                        <SyntaxHighlighter
                            key={stableKey}
                            language={language || 'text'}
                            style={isDark ? vscDarkPlus : vs}
                            customStyle={{ borderRadius: '0.75rem', padding: '1rem', marginTop: '1.5rem', marginBottom: '1.5rem', fontSize: '0.875rem', lineHeight: '1.5' }}
                            showLineNumbers={true}
                            wrapLines={true}
                        >
                            {codeString}
                        </SyntaxHighlighter>
                    </div>
                );
            }
            return <code className={className} {...props} data-line={line}>{children}</code>;
        },
        // ─── 注入 Line Number 以實現精準同步捲動 ───────────────────────────────────
        p: ({ node, ...props }: any) => <p data-line={node?.position?.start?.line} {...props} />,
        h1: ({ node, ...props }: any) => <h1 data-line={node?.position?.start?.line} {...props} />,
        h2: ({ node, ...props }: any) => <h2 data-line={node?.position?.start?.line} {...props} />,
        h3: ({ node, ...props }: any) => <h3 data-line={node?.position?.start?.line} {...props} />,
        h4: ({ node, ...props }: any) => <h4 data-line={node?.position?.start?.line} {...props} />,
        h5: ({ node, ...props }: any) => <h5 data-line={node?.position?.start?.line} {...props} />,
        h6: ({ node, ...props }: any) => <h6 data-line={node?.position?.start?.line} {...props} />,
        ul: ({ node, ...props }: any) => <ul data-line={node?.position?.start?.line} {...props} />,
        ol: ({ node, ...props }: any) => <ol data-line={node?.position?.start?.line} {...props} />,
        li: ({ node, ...props }: any) => <li data-line={node?.position?.start?.line} {...props} />,
        blockquote: ({ node, ...props }: any) => <blockquote data-line={node?.position?.start?.line} {...props} />,
        table: ({ node, ...props }: any) => <table data-line={node?.position?.start?.line} {...props} />,
        // ─────────────────────────────────────────────────────────────────────────
        div: ({ node, className, children, ...props }: any) => {
            if (className?.includes('math-display')) {
                const mathContent = String(children);
                const stableKey = hashString(mathContent);
                return (
                    <div key={stableKey} className="my-4 overflow-x-auto" style={{ whiteSpace: 'nowrap' }} data-line={node?.position?.start?.line}>
                        <MemoizedMathJax content={mathContent} isDarkMode={isDark} />
                    </div>
                );
            }
            return <div className={className} {...props} data-line={node?.position?.start?.line}>{children}</div>;
        },
        span: ({ node, className, children, ...props }: any) => {
            if (className?.includes('math-inline')) {
                const mathContent = String(children);
                const stableKey = hashString(mathContent);
                return (
                    <span key={stableKey} className="math-inline" style={{ whiteSpace: 'nowrap' }} data-line={node?.position?.start?.line}>
                        <MemoizedMathJax content={mathContent} inline isDarkMode={isDark} />
                    </span>
                );
            }
            return <span className={className} {...props} data-line={node?.position?.start?.line}>{children}</span>;
        },
        a: ({ node, href, children, ...props }: any) => {
            if (href?.startsWith('#wikilink-')) {
                const name = decodeURIComponent(href.replace('#wikilink-', ''));
                return (
                    <WikiLink
                        name={name}
                        documents={documents}
                        currentDocId={currentDocId}
                        onSelectDocument={onSelectDocument}
                        onCreateMissing={onCreateMissing}
                    >
                        {children}
                    </WikiLink>
                );
            }
            return <a href={href} {...props} target="_blank" rel="noopener noreferrer" data-line={node?.position?.start?.line}>{children}</a>;
        }
    }), [isDark, documents, onSelectDocument, onCreateMissing, currentDocId]);

    // 監聽圖片載入完成，若有必要可觸發同步刷新
    useEffect(() => {
        const container = document.querySelector('.prose');
        if (!container) return;

        const handleImageLoad = () => {
            // 圖片載入後高度會變，這可能會導致同步偏差。
            // 這裡可以觸發一個自定義事件或回調，讓 App.tsx 重新對齊
            window.dispatchEvent(new CustomEvent('preview-content-height-change'));
        };

        container.addEventListener('load', handleImageLoad, true);
        return () => container.removeEventListener('load', handleImageLoad, true);
    }, [debouncedContent]);

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
