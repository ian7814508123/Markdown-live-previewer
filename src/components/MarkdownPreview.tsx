import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { MathJax } from 'better-react-mathjax';
import rehypeRaw from 'rehype-raw';
import mermaid from 'mermaid';
import embed from 'vega-embed';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import SmilesDrawer from 'smiles-drawer';
import { useImageStorage } from '../hooks/useImageStorage';
import { WrapText } from 'lucide-react';
import DiagramBlock from './DiagramBlock';
import { ResizableWrapper } from './ResizableWrapper';
import { hashString } from '../utils';
import { useDebounce } from '../hooks/useDebounce';
import { usePersistentCanvasSettings } from '../hooks/usePersistentCanvasSettings';

interface MarkdownPreviewProps {
    content: string;
    theme?: 'default' | 'neutral' | 'dark' | 'forest';
    isDarkMode: boolean;
    documents?: any[];
    onSelectDocument?: (docId: string) => void;
    onCreateMissing?: (name: string) => void;
    currentDocId?: string | null;
    isPrinting?: boolean;
    showPrintPreview?: boolean;
    printSessionId?: number;
}

// 原有的輔助 Hook 與組件已抽離至 DiagramBlock.tsx 與 ResizableWrapper.tsx 處理

// 原有的輔助 Hook 與組件已抽離至 DiagramBlock.tsx 處理

/** 
 * 淨化 Mermaid 生成的 SVG 字串
 * 移除固定的 width 和 height 屬性，改由 CSS 控制，以實現自適應縮放
 */
const cleanMermaidSvg = (svgHtml: string) => {
    return svgHtml
        .replace(/width=".*?"/i, 'width="100%"')
        .replace(/height=".*?"/i, 'height="auto"')
        .replace(/style="max-width:.*?"/i, 'style="max-width: 100%"');
};

const MermaidBlock: React.FC<{ code: string; isDarkMode: boolean; isPrinting?: boolean; showPrintPreview?: boolean; printSessionId?: number }> = React.memo(({ code, isDarkMode, isPrinting, showPrintPreview, printSessionId = 0 }) => {
    const render = useCallback(async (container: HTMLDivElement, renderCode: string, isDark: boolean) => {
        mermaid.initialize({
            theme: isDark ? 'dark' : 'neutral',
            fontFamily: 'Inter, system-ui, sans-serif',
            securityLevel: 'loose'
        });

        const id = `mermaid-${hashString(renderCode + (isDark ? 'dark' : 'light'))}`;
        const { svg: renderedSvg } = await mermaid.render(id, renderCode);
        container.innerHTML = cleanMermaidSvg(renderedSvg);
    }, []);

    return (
        <DiagramBlock
            type="mermaid"
            code={code}
            isDarkMode={isDarkMode}
            isPrinting={isPrinting}
            showPrintPreview={showPrintPreview}
            printSessionId={printSessionId}
            render={render}
            errorTitle="Mermaid Syntax Error"
        />
    );
});

const VegaBlock: React.FC<{ code: string; isDarkMode: boolean; isPrinting?: boolean; showPrintPreview?: boolean; printSessionId?: number }> = React.memo(({ code, isDarkMode, isPrinting, showPrintPreview, printSessionId = 0 }) => {
    const render = useCallback(async (container: HTMLDivElement, renderCode: string, isDark: boolean) => {
        const spec = JSON.parse(renderCode);
        container.innerHTML = '';
        await embed(container, spec, {
            actions: false,
            theme: isDark ? 'dark' : 'vox',
            renderer: 'svg'
        });
    }, []);

    return (
        <DiagramBlock
            type="vega"
            code={code}
            isDarkMode={isDarkMode}
            isPrinting={isPrinting}
            showPrintPreview={showPrintPreview}
            printSessionId={printSessionId}
            render={render}
            errorTitle="Vega Render Error"
        />
    );
});

const SmilesBlock: React.FC<{ code: string; isDarkMode: boolean; isPrinting?: boolean; showPrintPreview?: boolean; printSessionId?: number }> = React.memo(({ code, isDarkMode, isPrinting, showPrintPreview, printSessionId = 0 }) => {
    const render = useCallback(async (container: HTMLDivElement, renderCode: string, isDark: boolean) => {
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

        return new Promise<void>((resolve, reject) => {
            SmilesDrawer.parse(
                renderCode.trim(),
                (tree: any) => {
                    container.innerHTML = '';
                    const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    svgEl.setAttribute('width', '100%');
                    svgEl.setAttribute('height', 'auto');
                    svgEl.setAttribute('viewBox', '0 0 200 100');
                    svgEl.style.maxHeight = '100%';
                    container.appendChild(svgEl);
                    drawer.draw(tree, svgEl, isDark ? 'dark' : 'light');
                    resolve();
                },
                (err: any) => {
                    reject(new Error(typeof err === 'string' ? err : (err?.message || 'SMILES 解析失敗')));
                }
            );
        });
    }, []);

    return (
        <DiagramBlock
            type="smiles"
            code={code}
            isDarkMode={isDarkMode}
            isPrinting={isPrinting}
            showPrintPreview={showPrintPreview}
            printSessionId={printSessionId}
            render={render}
            errorTitle="⚗️ SMILES 語法錯誤"
            containerClassName="min-h-[200px]"
        />
    );
});


const AbcBlock = React.lazy(() => import('./AbcBlock'));

// ─── 本地圖片元件：非同步從 IndexedDB 讀取 Data URL 並顯示 (按需載入) ──────────────────────
interface LocalImageProps {
    id: string;
    alt?: string;
    className?: string;
}

// 建立一個輕量的記憶體快取，避免每次 markdown re-render 時都產生非同步讀取的落差(bounce)
const memoryImageCache = new Map<string, string>();

const LocalImage: React.FC<LocalImageProps & { getImage: (id: string) => Promise<string | null> }> = React.memo(({ id, alt, className, getImage }) => {
    const cached = memoryImageCache.get(id);
    const [src, setSrc] = useState<string | null>(cached || null);
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(cached ? 'loaded' : 'loading');

    useEffect(() => {
        if (cached) {
            window.dispatchEvent(new CustomEvent('content-layout-ready'));
            return;
        }

        let cancelled = false;
        setStatus('loading');
        getImage(id).then(dataUrl => {
            if (cancelled) return;
            if (dataUrl) {
                memoryImageCache.set(id, dataUrl);
                setSrc(dataUrl);
                setStatus('loaded');
            } else {
                setStatus('error');
            }
            // 通知佈局已就緒
            window.dispatchEvent(new CustomEvent('content-layout-ready'));
        }).catch(() => {
            if (!cancelled) {
                setStatus('error');
                window.dispatchEvent(new CustomEvent('content-layout-ready'));
            }
        });
        return () => { cancelled = true; };
    }, [id, getImage]);

    if (status === 'loading') {
        return (
            <div className={`flex flex-col items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/50 animate-pulse w-full min-h-[150px] ${className || ''}`}>
                <span className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs">
                    <span className="w-3 h-3 rounded-full border-2 border-slate-400 border-t-transparent animate-spin inline-block" />
                    載入圖片中…
                </span>
            </div>
        );
    }

    if (status === 'error' || !src) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-500 text-xs">
                ⚠️ 圖片不存在或已到期: {alt || id}
            </span>
        );
    }

    return <img src={src ?? undefined} alt={alt ?? ''} className={className ?? 'rounded-xl max-w-full h-auto'} />;

});

// ─── 可縮放圖片元件：整合 ResizableWrapper ───────────────────────────────────────────
interface ResizableImageProps {
    src: string;
    alt?: string;
    getImage: (id: string) => Promise<string | null>;
    isDarkMode: boolean;
}

const ResizableImage: React.FC<ResizableImageProps> = ({ src, alt, getImage, isDarkMode }) => {
    // ─── 狀態持久化：從 LocalStorage 讀取初始設定 ───────────────────────────────────────
    const storageKey = useMemo(() => `chart-size-img:${src}`, [src]);
    const { width, height, scale, updateWidth, updateHeight, updateScale, reset } = usePersistentCanvasSettings(storageKey);

    const isLocal = src?.startsWith('img-local://');
    const imgId = isLocal ? src.replace('img-local://', '') : '';

    return (
        <ResizableWrapper
            width={width}
            height={height}
            scale={scale}
            onWidthChange={updateWidth}
            onHeightChange={updateHeight}
            onScaleChange={updateScale}
            onReset={reset}
            isDarkMode={isDarkMode}
        >
            {isLocal ? (
                <LocalImage id={imgId} alt={alt} getImage={getImage} />
            ) : (
                <img src={src} alt={alt} className="rounded-xl max-w-full h-auto" />
            )}
            <div className="absolute bottom-2 right-3 text-[10px] text-slate-400 dark:text-slate-600 font-mono select-none pointer-events-none opacity-0 group-hover/resizable:opacity-100 transition-opacity">
                {isLocal ? 'LOCAL IMAGE' : 'IMAGE'}
            </div>
        </ResizableWrapper>
    );
};

// ─── WikiLink 元件（模組層級，確保 React.memo 真正生效）──────────────────────────────
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
            className={`px-1 py-0.5 rounded-md transition-all duration-200 ${exists ? 'text-brand-primary bg-brand-secondary/50 dark:bg-brand-primary/20 hover:bg-brand-secondary dark:hover:bg-brand-primary/40 border-b border-brand-primary/30 dark:border-brand-primary/70' : 'text-slate-400 dark:text-slate-500 bg-slate-100/50 dark:bg-slate-800/20 hover:bg-slate-200 dark:hover:bg-slate-800 border-b border-dashed border-slate-300 dark:border-slate-700 italic cursor-help'}`}
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
    // 為數學公式加入內部 Debounce，避免公式隨著打字不斷抖動
    const debouncedContent = useDebounce(content, 300);
    const [isPending, setIsPending] = useState(false);

    useEffect(() => {
        if (content !== debouncedContent) {
            setIsPending(true);
        } else {
            setIsPending(false);
        }
    }, [content, debouncedContent]);

    const Wrapper = inline ? 'span' : 'div';

    return (
        <Wrapper className={`transition-opacity duration-300 ${isPending ? 'opacity-40' : 'opacity-100'}`}>
            <MathJax inline={inline} dynamic hideUntilTypeset="every">
                {inline ? `\\(${debouncedContent}\\)` : `\\[${debouncedContent}\\]`}
            </MathJax>
        </Wrapper>
    );
});

// ─── 增強型程式碼區塊 (智能斷行、懸掛縮排與列印控制) ────────────────────────────────────────────────
interface EnhancedCodeBlockProps {
    language: string;
    codeString: string;
    stableKey: string;
    isActuallyPrinting: boolean;
    shouldShowDark: boolean;
}

const EnhancedCodeBlock: React.FC<EnhancedCodeBlockProps> = ({
    language,
    codeString,
    stableKey,
    isActuallyPrinting,
    shouldShowDark
}) => {
    // 預設需要換行的語言
    const defaultWrapLanguages = ['text', 'log', 'json', 'bash', 'sh', 'yaml', 'plaintext', 'markdown'];
    const [isWrapped, setIsWrapped] = useState(defaultWrapLanguages.includes(language));

    // 列印模式為了防截斷，強制換行
    const effectiveWrapped = isActuallyPrinting || isWrapped;

    // 當斷行狀態改變或初次渲染時，通知預覽器重新計算佈局高度（列印同步用）
    useEffect(() => {
        window.dispatchEvent(new CustomEvent('content-layout-ready'));
    }, [effectiveWrapped]);

    return (
        <div className="relative group/codeblock w-full">
            {/* 切換換行的按鈕 (不給列印時顯示) */}
            {!isActuallyPrinting && (
                <button
                    className={`absolute top-2 right-2 p-1.5 rounded-md transition-all duration-200 z-10 opacity-0 group-hover/codeblock:opacity-100 
                        ${isWrapped
                            ? 'bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/30 dark:text-brand-primary font-semibold'
                            : 'bg-slate-100 text-slate-400 hover:text-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
                    onClick={() => setIsWrapped(!isWrapped)}
                    title={isWrapped ? "禁用自動換行" : "啟用自動換行"}
                    aria-label="Toggle Word Wrap"
                >
                    <WrapText size={16} />
                </button>
            )}

            <div
                className={`enhanced-codeblock ${effectiveWrapped ? 'code-block-wrap' : 'code-block-scroll'}`}
                data-theme-style={(isActuallyPrinting || !shouldShowDark) ? 'light' : 'dark'}
            >
                <SyntaxHighlighter
                    key={stableKey}
                    language={language || 'text'}
                    useInlineStyles={false}
                    customStyle={{
                        margin: '1.5rem 0',
                        padding: '1rem',
                        fontSize: '0.875rem',
                        lineHeight: '1.5',
                        backgroundColor: 'transparent',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--code-border)',
                        overflowX: effectiveWrapped ? 'hidden' : 'auto',
                        tabSize: '2',
                    }}
                    showLineNumbers={false} /* 關閉原生的缺陷行號 */
                    wrapLines={true} /* 強制每一行編織成 span，作為 css counter 基準 */
                    lineProps={{
                        className: 'code-line'
                    }}
                >
                    {codeString}
                </SyntaxHighlighter>
            </div>
        </div>
    );
};

// ─── 區塊判斷上下文：用於解決 react-markdown v10 移除 inline prop 後的辨識問題 ───────
const IsInPreContext = React.createContext(false);

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, theme, isDarkMode, documents = [], onSelectDocument, onCreateMissing, currentDocId, isPrinting, showPrintPreview, printSessionId = 0 }) => {
    // 關鍵修正：判斷當前是否處於「需要白色底」或「列印中」的狀態
    // 優先使用 Props 以確保 React 渲染週期同步，避免 reliance on DOM queries
    const isActuallyPrinting = !!isPrinting || !!showPrintPreview;
    const shouldShowDark = isDarkMode && !isActuallyPrinting;
    const processedContent = useMemo(() => content.replace(/\[\[(.*?)\]\]/g, '[$1](#wikilink-$1)'), [content]);
    const debouncedContent = useDebounce(processedContent, 200);
    // 在 MarkdownPreview 頂層呼叫一次，避免每個 LocalImage 獨立開啟 DB 連線
    const { getImage } = useImageStorage();

    const renderContextRef = useRef<any>(null);

    // 🛠️ 同步更新渲染上下文 (Ref)，確保 ReactMarkdown 中的 Memoized 子組件能讀取到最新狀態，
    // 同時避免因為 components 物件 identity 改變而觸發整個 Markdown 樹重掛。
    // 解決列印後輔助工具「狀態回退延遲」的關鍵在於不等待 useEffect，而是直接在渲染階段階段同步最新值。
    renderContextRef.current = {
        documents,
        currentDocId,
        onSelectDocument,
        onCreateMissing,
        shouldShowDark,
        isActuallyPrinting,
        isDarkMode,
        isPrinting,
        showPrintPreview,
        printSessionId,
        getImage
    };

    // ─── URI 轉換：允許自定義協定通過 react-markdown 的過濾 ───────────────────────────
    const urlTransform = useCallback((uri: string) => {
        // 放行我們的本地圖片協定
        if (uri.startsWith('img-local://')) return uri;

        // 其他常見的安全協定
        const protocols = ['http', 'https', 'mailto', 'tel', '#'];
        for (const protocol of protocols) {
            if (uri.toLowerCase().startsWith(protocol)) return uri;
        }

        // 相對路徑也放行
        if (uri.startsWith('/') || uri.startsWith('./') || uri.startsWith('../')) return uri;

        return `about:blank`; // 過濾掉潛在不安全的連結
    }, []);


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
        pre: ({ children }: any) => <IsInPreContext.Provider value={true}>{children}</IsInPreContext.Provider>, 
        code({ node, className, children, ...props }: any) {
            const isBlock = React.useContext(IsInPreContext);
            const ctx = renderContextRef.current;
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const codeString = String(children).replace(/\n$/, '');
            const stableKey = hashString(codeString);
            const line = node?.position?.start?.line;

            if (isBlock) {
                if (language === 'mermaid') return <div data-line={line} className="not-prose"><MermaidBlock key={stableKey} code={codeString} isDarkMode={ctx.isDarkMode} isPrinting={ctx.isPrinting} showPrintPreview={ctx.showPrintPreview} printSessionId={ctx.printSessionId} /></div>;
                if (language === 'vega' || language === 'vega-lite') return <div data-line={line} className="not-prose"><VegaBlock key={stableKey} code={codeString} isDarkMode={ctx.isDarkMode} isPrinting={ctx.isPrinting} showPrintPreview={ctx.showPrintPreview} printSessionId={ctx.printSessionId} /></div>;
                if (language === 'smiles') return <div data-line={line} className="not-prose"><SmilesBlock key={stableKey} code={codeString} isDarkMode={ctx.isDarkMode} isPrinting={ctx.isPrinting} showPrintPreview={ctx.showPrintPreview} printSessionId={ctx.printSessionId} /></div>;
                if (language === 'abc') return <React.Suspense fallback={<div className="p-4 flex justify-center items-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs">樂譜加載中...</div>}><div data-line={line} className="not-prose"><AbcBlock key={stableKey} code={codeString} isDarkMode={ctx.isDarkMode} isPrinting={ctx.isPrinting} showPrintPreview={ctx.showPrintPreview} printSessionId={ctx.printSessionId} /></div></React.Suspense>;

                return (
                    <div data-line={line} className="code-block-wrapper not-prose">
                        <EnhancedCodeBlock
                            language={language}
                            codeString={codeString}
                            stableKey={stableKey}
                            isActuallyPrinting={ctx.isActuallyPrinting}
                            shouldShowDark={ctx.shouldShowDark}
                        />
                    </div>
                );
            }
            return <code className={`${className || ''} inline-code`} {...props} data-line={line}>{children}</code>;
        },
        // ─── 注入 Line Number 以實現精準同步捲動 ───────────────────────────────────
        p: ({ node, ...props }: any) => <div className="mb-4 last:mb-0" data-line={node?.position?.start?.line} {...props} />,
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
                const ctx = renderContextRef.current;
                const mathContent = String(children);
                const stableKey = hashString(mathContent);
                return (
                    <div key={stableKey} className="my-4 overflow-x-auto" style={{ whiteSpace: 'nowrap' }} data-line={node?.position?.start?.line}>
                        <MemoizedMathJax content={mathContent} isDarkMode={ctx.shouldShowDark} />
                    </div>
                );
            }
            return <div className={className} {...props} data-line={node?.position?.start?.line}>{children}</div>;
        },
        span: ({ node, className, children, ...props }: any) => {
            if (className?.includes('math-inline')) {
                const ctx = renderContextRef.current;
                const mathContent = String(children);
                const stableKey = hashString(mathContent);
                return (
                    <span key={stableKey} className="math-inline" style={{ whiteSpace: 'nowrap' }} data-line={node?.position?.start?.line}>
                        <MemoizedMathJax content={mathContent} inline isDarkMode={ctx.shouldShowDark} />
                    </span>
                );
            }
            return <span className={className} {...props} data-line={node?.position?.start?.line}>{children}</span>;
        },
        a: ({ node, href, children, ...props }: any) => {
            if (href?.startsWith('#wikilink-')) {
                const ctx = renderContextRef.current;
                const name = decodeURIComponent(href.replace('#wikilink-', ''));
                return (
                    <WikiLink
                        name={name}
                        documents={ctx.documents}
                        currentDocId={ctx.currentDocId}
                        onSelectDocument={ctx.onSelectDocument}
                        onCreateMissing={ctx.onCreateMissing}
                    >
                        {children}
                    </WikiLink>
                );
            }
            return <a href={href} {...props} target="_blank" rel="noopener noreferrer" data-line={node?.position?.start?.line}>{children}</a>;
        },
        // ─── 圖片解析：支援本地與遠端，並提供縮放工具 ──────────────────────────────────────────
        img: ({ node, src, alt, ...props }: any) => {
            if (!src) return null;
            const ctx = renderContextRef.current;
            return (
                <ResizableImage
                    key={src}
                    src={src}
                    alt={alt}
                    getImage={ctx.getImage}
                    isDarkMode={ctx.shouldShowDark}
                />
            );
        },
    }), []);

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
        <div className={`prose max-w-none p-8 select-text ${shouldShowDark ? 'prose-invert' : 'prose-slate'} prose-headings:font-bold prose-a:text-brand-primary prose-img:rounded-xl prose-table:border-collapse prose-th:border prose-th:border-slate-300 dark:prose-th:border-slate-700 prose-th:p-2 prose-td:border prose-td:border-slate-300 dark:prose-td:border-slate-700 prose-td:p-2 print:p-0 print:max-w-none print:bg-white`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeRaw]}
                remarkRehypeOptions={remarkRehypeOptions}
                components={components}
                urlTransform={urlTransform}
            >
                {debouncedContent}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownPreview;
