import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MathJaxContext } from 'better-react-mathjax';
import mermaid from 'mermaid';

import Header from './src/components/Header';
import Editor from './src/components/Editor';
import PreviewPanel from './src/components/PreviewPanel';
import HistorySidebar from './src/components/HistorySidebar';
import SettingsModal from './src/components/SettingsModal';
import { usePanZoom } from './src/hooks/usePanZoom';
import { useDocumentStorage } from './src/hooks/useDocumentStorage';
import { useAppSettings } from './src/hooks/useAppSettings';

type Theme = 'default' | 'neutral' | 'dark' | 'forest';

// Initialize Mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'loose',
  fontFamily: 'Inter',
});




type EditorMode = 'mermaid' | 'markdown';

const App: React.FC = () => {
  // State for loading default contents from external .md files
  const [defaultContents, setDefaultContents] = useState<{
    markdown: string;
    mermaid: string;
  } | null>(null);
  const [isLoadingDefaults, setIsLoadingDefaults] = useState(true);

  // Load default contents on mount
  useEffect(() => {
    const loadDefaults = async () => {
      try {
        // Use Vite's BASE_URL for GitHub Pages support
        const baseUrl = import.meta.env.BASE_URL;
        const [markdownRes, mermaidRes] = await Promise.all([
          fetch(`${baseUrl}defaults/default-markdown.md`),
          fetch(`${baseUrl}defaults/default-mermaid.md`),
        ]);

        if (!markdownRes.ok || !mermaidRes.ok) {
          throw new Error('Failed to fetch default content files');
        }

        const markdown = await markdownRes.text();
        const mermaid = await mermaidRes.text();

        setDefaultContents({ markdown, mermaid });
      } catch (error) {
        console.error('Failed to load default contents:', error);
        // Fallback content
        setDefaultContents({
          markdown: '# Markdown Editor\n\n無法載入預設內容。',
          mermaid: 'graph TD\n  A[開始] --> B[結束]'
        });
      } finally {
        setIsLoadingDefaults(false);
      }
    };

    loadDefaults();
  }, []);

  // 文檔管理
  const {
    documents,
    currentDocId,
    currentDocument,
    createDocument,
    updateCurrentDocument,
    switchDocument,
    deleteDocument,
    renameDocument,
    storageUsage,
  } = useDocumentStorage();

  // UI 狀態
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<Theme>('neutral');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSyncScroll, setIsSyncScroll] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { settings, updateMacros, restoreDefaults } = useAppSettings();

  // 從當前文檔取得 mode 和 code
  const mode = currentDocument?.mode || 'markdown';
  const code = currentDocument?.content || '';

  // Toggle Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // 初始化：如果沒有文檔，建立預設文檔
  useEffect(() => {
    if (documents.length === 0 && defaultContents && !isLoadingDefaults) {
      createDocument('markdown', defaultContents.markdown, '預設 標註掉落 文檔');
      createDocument('mermaid', defaultContents.mermaid, '預設 美人魚 文檔');
    }
  }, [documents.length, createDocument, defaultContents, isLoadingDefaults]);

  // 自動儲存當前文檔內容
  useEffect(() => {
    if (!currentDocument) return;

    const timer = setTimeout(() => {
      updateCurrentDocument(code);
    }, 500); // debounce 500ms

    return () => clearTimeout(timer);
  }, [code, currentDocument, updateCurrentDocument]);

  // Custom Hook for Navigation
  const {
    zoom,
    setZoom,
    position,
    isDragging,
    handleZoom,
    resetNavigation,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    handleWheel,
    fitToView
  } = usePanZoom();

  const previewRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Sync Scroll State
  const targetScrollTop = useRef(0);
  const currentScrollTop = useRef(0);
  const isHoveringEditor = useRef(false);
  const isHoveringPreview = useRef(false);
  const rafId = useRef<number | null>(null);

  const syncLoop = useCallback(() => {
    if (!previewRef.current || !editorRef.current) return;

    const diff = targetScrollTop.current - currentScrollTop.current;
    if (Math.abs(diff) < 0.5) {
      currentScrollTop.current = targetScrollTop.current;
      rafId.current = null; // Stop loop
    } else {
      currentScrollTop.current += diff * 0.1; // Smooth factor
      rafId.current = requestAnimationFrame(syncLoop);
    }

    if (isHoveringEditor.current) {
      previewRef.current.scrollTop = currentScrollTop.current;
    } else if (isHoveringPreview.current) {
      editorRef.current.scrollTop = currentScrollTop.current;
    }
  }, []);

  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (!isSyncScroll || mode !== 'markdown' || !isHoveringEditor.current) return;

    const target = e.target as HTMLTextAreaElement;
    const percentage = target.scrollTop / (target.scrollHeight - target.clientHeight);

    if (previewRef.current) {
      targetScrollTop.current = percentage * (previewRef.current.scrollHeight - previewRef.current.clientHeight);

      if (!rafId.current) {
        // Sync starting point to avoid jump
        currentScrollTop.current = previewRef.current.scrollTop;
        rafId.current = requestAnimationFrame(syncLoop);
      }
    }
  };

  const handlePreviewScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!isSyncScroll || mode !== 'markdown' || !isHoveringPreview.current) return;

    const target = e.target as HTMLDivElement;
    const percentage = target.scrollTop / (target.scrollHeight - target.clientHeight);

    if (editorRef.current) {
      targetScrollTop.current = percentage * (editorRef.current.scrollHeight - editorRef.current.clientHeight);

      if (!rafId.current) {
        // Sync starting point to avoid jump
        currentScrollTop.current = editorRef.current.scrollTop;
        rafId.current = requestAnimationFrame(syncLoop);
      }
    }
  };


  // Switch default code when mode changes
  useEffect(() => {
    setError(null);
    setSvgContent('');
  }, [mode]);

  // 更新編輯器內容
  const handleCodeChange = (newCode: string) => {
    if (currentDocument) {
      // 直接更新當前文檔（debounce 在上面的 useEffect 中處理）
      updateCurrentDocument(newCode);
    }
  };

  // 處理文檔切換
  const handleDocumentSwitch = (docId: string) => {
    switchDocument(docId);
    // 只在手機版（小螢幕）自動關閉側邊欄，桌面版保持開啟以便雙擊重命名
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
    resetNavigation();
  };

  // 處理新增文檔
  const handleCreateDocument = (newMode?: EditorMode) => {
    // If explicit mode provided (from sidebar), use it. Otherwise default to current mode.
    const modeToUse = newMode || mode;
    const defaultContent = modeToUse === 'mermaid' ? defaultContents.mermaid : defaultContents.markdown;
    createDocument(modeToUse, defaultContent);
  };

  // 處理模式切換（Header 中的切換）
  // 處理模式切換（Header 中的切換） - OLD, now removed from Header UI, but kept logic just in case
  const handleModeSwitch = (newMode: EditorMode) => {
    // Legacy support or if we add a switch back later
    if (!currentDocument || newMode === currentDocument.mode) return;
    // ... logic preserved or removed if unused
  };

  // Render Mermaid code to SVG
  const renderDiagram = useCallback(async (mermaidCode: string, currentTheme: string) => {
    if (mode !== 'mermaid') return;

    if (!mermaidCode.trim()) {
      setSvgContent('');
      setError(null);
      return;
    }

    try {
      mermaid.initialize({ theme: currentTheme as any });
      const { svg } = await mermaid.render('mermaid-render-target', mermaidCode);
      setSvgContent(svg);
      setError(null);
    } catch (err: any) {
      console.error("Mermaid Render Error:", err);
      let msg = err.message || 'Syntax error in Mermaid code';

      // 1. Line Number Mapping Logic
      // Mermaid often ignores blank lines and comments in its internal representation,
      // leading to line number mismatch in errors.
      const lineMatch = msg.match(/line (\d+)/i);
      if (lineMatch) {
        const compilerLine = parseInt(lineMatch[1]);
        const lines = mermaidCode.split('\n');

        let actualLine = 0;
        let compilerCounter = 0;

        // Mermaid typically ignores:
        // - Empty lines (trimmed)
        // - Comment lines starting with %% (trimmed)
        // - Leading/trailing whitespace
        for (let i = 0; i < lines.length; i++) {
          const trimmed = lines[i].trim();
          const isIgnored = trimmed === '' || trimmed.startsWith('%%');

          if (!isIgnored) {
            compilerCounter++;
          }

          if (compilerCounter === compilerLine) {
            actualLine = i + 1;
            break;
          }
        }

        if (actualLine > 0) {
          msg = msg.replace(/line \d+/i, `line ${actualLine} `);
        }
      }

      if (msg.includes('Expecting')) {
        msg = msg.split('Expecting')[0].trim();
      }

      // Ensure newline before the pointer line (dashes followed by caret)
      msg = msg.replace(/([^\n])(\-{3,}\^)/g, '$1\n$2');

      setError(msg);
      setSvgContent('');
    }
  }, [mode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      renderDiagram(code, theme);
    }, 300);
    return () => clearTimeout(timer);
  }, [code, theme, renderDiagram]);


  const downloadMarkdown = () => {
    const blob = new Blob([code], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `document - ${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAsImage = (format: 'png' | 'svg' | 'jpg') => {
    if (!svgContent) {
      console.error("Export failed: No SVG content");
      return;
    }

    // 1. Parse raw SVG string
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svgEl = doc.documentElement;

    // REMOVED: Manual xmlns injection to avoid "redefined" errors.
    // XMLSerializer usually handles this correctly.

    // 2. Precise ViewBox parsing
    const viewBoxAttr = svgEl.getAttribute('viewBox');
    let x = 0, y = 0, width = 0, height = 0;

    if (viewBoxAttr) {
      const parts = viewBoxAttr.split(/\s+|,/).filter(Boolean).map(Number);
      if (parts.length === 4) {
        [x, y, width, height] = parts;
      }
    }

    // Fallback logic
    if (width === 0 || height === 0) {
      const wAttr = parseFloat(svgEl.getAttribute('width') || '0');
      const hAttr = parseFloat(svgEl.getAttribute('height') || '0');
      if (wAttr > 0 && hAttr > 0) {
        width = wAttr;
        height = hAttr;
      } else {
        if (previewRef.current) {
          const domSvg = previewRef.current.querySelector('svg');
          if (domSvg) {
            try {
              const bbox = domSvg.getBBox();
              width = bbox.width;
              height = bbox.height;
              x = bbox.x;
              y = bbox.y;
            } catch (e) {
              console.warn("Export BBox missing", e);
            }
          }
        }
      }
    }

    // Safety check
    if (width === 0 || height === 0) {
      width = 800; height = 600;
    }

    const padding = 40;
    // Smart scaling: Use 2x for quality, but drop to 1x if massive to avoid canvas limits
    let scale = 2;
    if ((width * scale) > 4000 || (height * scale) > 4000) {
      scale = 1;
      console.warn("Large diagram detected, reducing export scale to 1x");
    }

    svgEl.setAttribute('width', width.toString());
    svgEl.setAttribute('height', height.toString());
    svgEl.style.maxWidth = 'none';

    const serializer = new XMLSerializer();

    if (format === 'svg') {
      svgEl.setAttribute('viewBox', `${x - padding} ${y - padding} ${width + padding * 2} ${height + padding * 2} `);
      const svgData = serializer.serializeToString(svgEl);
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mermaid - diagram - ${Date.now()}.svg`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      const cleanSvgData = serializer.serializeToString(svgEl);

      // Use Blob URL as requested for large file support and performance
      const svgBlob = new Blob([cleanSvgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = (width + padding * 2) * scale;
        canvas.height = (height + padding * 2) * scale;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.scale(scale, scale);
        ctx.fillStyle = theme === 'dark' ? '#1e293b' : '#ffffff';
        ctx.fillRect(0, 0, canvas.width / scale, canvas.height / scale);

        // Draw image
        ctx.drawImage(img, padding, padding, width, height);

        try {
          const link = document.createElement('a');
          link.download = `mermaid - diagram - ${Date.now()}.${format} `;
          link.href = canvas.toDataURL(`image / ${format} `, 0.9);
          link.click();
        } catch (e) {
          console.error("Export canvas error:", e);
          alert("Export failed: Image resolution might be too high for this browser. Please try SVG format.");
        }
        URL.revokeObjectURL(url);
      };
      img.onerror = (e) => {
        console.error("Export image loading failed:", e);
        alert("Failed to render diagram. If using external images/fonts, this may be a security restriction. Please use SVG format.");
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    if (confirm("重置當前的工作到預設?")) {
      const defaultCode = mode === 'mermaid' ? defaultContents.mermaid : defaultContents.markdown;
      handleCodeChange(defaultCode);
      resetNavigation();
    }
  };

  const handleClear = () => {
    handleCodeChange('');
  };

  // 處理全檔案匯入
  const handleImportFullFile = (file: File, content: string) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    let importMode: EditorMode = 'markdown';

    // 只根據副檔名判斷，避免誤判包含 Mermaid 程式碼區塊的 Markdown 文件
    if (extension === 'mmd') {
      importMode = 'mermaid';
    }

    const newDocId = createDocument(importMode, content, file.name.replace(/\.[^/.]+$/, ""));
    if (newDocId) {
      handleDocumentSwitch(newDocId);
    }
  };

  const mathJaxConfig = {
    loader: { load: ["[tex]/ams", "[tex]/html"] },
    tex: {
      packages: { "[+]": ["ams", "html"] },
      inlineMath: [
        ["$", "$"],
        ["\\(", "\\)"]
      ],
      displayMath: [
        ["$$", "$$"],
        ["\\[", "\\]"]
      ],
      macros: {
        ...settings.customMacros
      }
    },
    chtml: {
      scale: 1,
      minScale: 0.5,
      mtextInheritFont: false,
      merrorInheritFont: true,
      mathmlSpacing: false,
      skipAttributes: {},
      exFactor: 0.5,
      displayAlign: 'center',
      displayIndent: '0'
    },
    svg: {
      scale: 1,
      minScale: 0.5,
      mtextInheritFont: false,
      merrorInheritFont: true,
      mathmlSpacing: false,
      skipAttributes: {},
      exFactor: 0.5,
      displayAlign: 'center',
      displayIndent: '0'
    }
  };

  return (
    <MathJaxContext config={mathJaxConfig}>
      <div className="flex flex-col h-screen max-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
        <Header
          mode={mode}
          // setMode={handleModeSwitch} // Removed from UI
          theme={theme}
          setTheme={(t) => setTheme(t as Theme)}
          isDarkMode={isDarkMode}
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          onDownloadMarkdown={downloadMarkdown}
          onExportImage={exportAsImage}
          isSyncScroll={isSyncScroll}
          setIsSyncScroll={setIsSyncScroll}
          onInsertCode={(newCode) => handleCodeChange(code + '\n\n' + newCode)}
          onImportFullFile={handleImportFullFile}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        <main className="flex-1 flex overflow-hidden print:block print:overflow-visible">
          {/* 歷史側邊欄 */}
          <HistorySidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            documents={documents}
            currentDocId={currentDocId}
            onSelectDocument={handleDocumentSwitch}
            onCreateDocument={handleCreateDocument}
            onDeleteDocument={deleteDocument}
            onRenameDocument={renameDocument}
            storageUsage={storageUsage}
          />

          <Editor
            ref={editorRef}
            mode={mode}
            code={code}
            setCode={handleCodeChange}
            onCopy={handleCopy}
            onReset={handleReset}
            onClear={handleClear}
            copied={copied}
            onScroll={handleEditorScroll}
            isDarkMode={isDarkMode}
            onMouseEnter={() => { isHoveringEditor.current = true; }}
            onMouseLeave={() => { isHoveringEditor.current = false; }}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />

          <PreviewPanel
            ref={previewRef}
            mode={mode}
            error={error}
            setError={setError}
            svgContent={svgContent}
            zoom={zoom}
            position={position}
            isDragging={isDragging}
            onZoom={handleZoom}
            onSetZoom={setZoom}
            onResetNav={resetNavigation}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onWheel={handleWheel}
            onScroll={handlePreviewScroll}
            code={code}
            theme={theme}
            isDarkMode={isDarkMode}
            onMouseEnter={() => { isHoveringPreview.current = true; }}
            onMouseLeave={() => { isHoveringPreview.current = false; }}
          />
        </main>

        {/* Settings Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          currentMacros={settings.customMacros}
          onSaveMacros={updateMacros}
          onRestoreDefaults={restoreDefaults}
        />
      </div>
    </MathJaxContext>
  );
};

export default App;
