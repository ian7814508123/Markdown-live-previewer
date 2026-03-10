import React, { useState, useEffect, useRef, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { MathJaxContext } from 'better-react-mathjax';
import mermaid from 'mermaid';

import Header from './src/components/Header';
import Editor from './src/components/Editor';
import PreviewPanel from './src/components/PreviewPanel';
import HistorySidebar from './src/components/HistorySidebar';
import CreateDocModal from './src/components/CreateDocModal';
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
    markdown: Record<string, string>;
    mermaid: Record<string, string>;
  } | null>(null);
  const [isLoadingDefaults, setIsLoadingDefaults] = useState(true);

  // Load default contents on mount
  useEffect(() => {
    const loadDefaults = async () => {
      try {
        const rawBaseUrl = import.meta.env.BASE_URL || '/';
        // Ensure baseUrl ends with a slash for consistent joining
        const normalizedBaseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`;

        // Define templates to load
        const mdTemplates = [
          { id: 'markdown-standard', path: 'defaults/default-markdown.md' },
          { id: 'basic', path: 'defaults/markdown-basic.md' },
          { id: 'math', path: 'defaults/markdown-math.md' },
          { id: 'charts', path: 'defaults/markdown-charts.md' },
          { id: 'mermaid', path: 'defaults/markdown-mermaid.md' },
        ];

        const mermaidTemplates = [
          { id: 'mermaid-standard', path: 'defaults/default-mermaid.md' },
          { id: 'flowchart', path: 'defaults/mermaid-flowchart.md' },
          { id: 'sequence', path: 'defaults/mermaid-sequence.md' },
          { id: 'gantt', path: 'defaults/mermaid-gantt.md' },
          { id: 'class', path: 'defaults/mermaid-class.md' },
          { id: 'state', path: 'defaults/mermaid-state.md' },
        ];

        // Fetch everything
        const [mdResponses, mmdResponses] = await Promise.all([
          Promise.all(mdTemplates.map(t => fetch(`${normalizedBaseUrl}${t.path}`))),
          Promise.all(mermaidTemplates.map(t => fetch(`${normalizedBaseUrl}${t.path}`)))
        ]);

        const markdownMap: Record<string, string> = {};
        const mermaidMap: Record<string, string> = {};

        for (let i = 0; i < mdTemplates.length; i++) {
          const res = mdResponses[i];
          markdownMap[mdTemplates[i].id] = res.ok ? await res.text() : `# ${mdTemplates[i].id}\n\n無法載入內容。`;
        }

        for (let i = 0; i < mermaidTemplates.length; i++) {
          const res = mmdResponses[i];
          mermaidMap[mermaidTemplates[i].id] = res.ok ? await res.text() : `graph TD\n  A[${mermaidTemplates[i].id}] --> B[Fail]`;
        }

        setDefaultContents({ markdown: markdownMap, mermaid: mermaidMap });
      } catch (error) {
        console.error('Failed to load default contents:', error);
        setDefaultContents({
          markdown: { 'markdown-standard': '# Markdown Editor\n\n無法載入預設內容。' },
          mermaid: { 'mermaid-standard': 'graph TD\n  A[開始] --> B[結束]' }
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
    getBacklinks,
    folders,
    createFolder,
    deleteFolder,
    renameFolder,
    moveDocument,
  } = useDocumentStorage();

  // UI 狀態
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<Theme>('neutral');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSyncScroll, setIsSyncScroll] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [initialDocName, setInitialDocName] = useState('');
  const [pendingFolderId, setPendingFolderId] = useState<string | null>(null);
  const [openDocIds, setOpenDocIds] = useState<string[]>([]);

  const { settings, updateMacros, updatePrintSettings, restoreDefaults } = useAppSettings();

  // 從當前文檔取得 mode 和 code
  const mode = currentDocument?.mode || 'markdown';
  const code = currentDocument?.content || '';

  // Toggle Dark Mode with View Transitions
  const handleToggleDarkMode = (event?: React.MouseEvent) => {
    const isSupported = typeof document !== 'undefined' && 'startViewTransition' in document;

    if (!isSupported) {
      setIsDarkMode(!isDarkMode);
      return;
    }

    // 獲取點擊位置，以便動畫從按鈕處擴散
    const x = event?.clientX ?? window.innerWidth / 2;
    const y = event?.clientY ?? 0;

    // 將座標傳給 CSS 變數
    document.documentElement.style.setProperty('--reveal-center-x', `${x}px`);
    document.documentElement.style.setProperty('--reveal-center-y', `${y}px`);

    // 開始過渡
    const transition = (document as any).startViewTransition(() => {
      // 必須使用 flushSync 確保 React 狀態更新同步反映到 DOM
      flushSync(() => {
        setIsDarkMode(!isDarkMode);
      });
    });

    transition.ready.then(() => {
      // 在動畫開始前標記 class
      document.documentElement.classList.add('dark-transition-active');
    });

    transition.finished.then(() => {
      document.documentElement.classList.remove('dark-transition-active');
    });
  };

  // Toggle Dark Mode Update to DOM (Legacy fallback and state sync)
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // 同步 openDocIds：當 currentDocId 改變且不在 openDocIds 中時，加入它
  useEffect(() => {
    if (currentDocId && !openDocIds.includes(currentDocId)) {
      setOpenDocIds(prev => {
        if (!prev.includes(currentDocId)) {
          return [...prev, currentDocId];
        }
        return prev;
      });
    }
  }, [currentDocId]); // 移除 openDocIds 依賴，防止關閉分頁後又被加回

  // 當 documents 改變時，確保 openDocIds 中只包含還存在的文檔
  useEffect(() => {
    const docIdSet = new Set(documents.map(d => d.id));
    setOpenDocIds(prev => prev.filter(id => docIdSet.has(id)));
  }, [documents]);

  // 初始化：如果沒有文檔，建立預設文檔
  useEffect(() => {
    if (documents.length === 0 && defaultContents && !isLoadingDefaults) {
      createDocument('markdown', defaultContents.markdown['markdown-standard'], '預設 標記掉落 文檔');
      createDocument('mermaid', defaultContents.mermaid['mermaid-standard'], '預設 美人魚 文檔');
    }
  }, [documents.length, createDocument, defaultContents, isLoadingDefaults]);

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
  const handleDocumentSwitch = (docId: string | null) => {
    if (!docId) {
      switchDocument(""); // 或者調整 useDocumentStorage 支援 null
      return;
    }
    switchDocument(docId);
    // 只在手機版（小螢幕）自動關閉側邊欄，桌面版保持開啟以便雙擊重命名
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
    resetNavigation();
  };

  const handleCloseTab = (docId: string, event?: React.MouseEvent) => {
    event?.stopPropagation();

    const nextOpenIds = openDocIds.filter(id => id !== docId);
    setOpenDocIds(nextOpenIds);

    // 如果關閉的是當前分頁
    if (currentDocId === docId) {
      if (nextOpenIds.length > 0) {
        // 切換到最右邊的分頁 (模仿 VS Code)
        handleDocumentSwitch(nextOpenIds[nextOpenIds.length - 1]);
      } else {
        // 如果沒有分頁了，設定為 null
        handleDocumentSwitch(null);
      }
    }
  };

  // 處理新增文檔
  const handleCreateDocument = (newMode: 'markdown' | 'mermaid', name: string, templateId: string = '') => {
    if (!defaultContents) return;

    const modeToUse = newMode || (currentDocument?.mode || 'markdown');
    let defaultContent = '';

    if (modeToUse === 'mermaid') {
      const tid = templateId || 'mermaid-standard';
      defaultContent = defaultContents.mermaid[tid] || defaultContents.mermaid['mermaid-standard'];
    } else {
      const tid = templateId || 'markdown-standard';
      defaultContent = defaultContents.markdown[tid] || defaultContents.markdown['markdown-standard'];
    }

    // 使用傳入的資料夾 ID (來自側邊欄偵測或是 Wikilink 偵測)
    const folderId = pendingFolderId;

    createDocument(modeToUse, defaultContent, name, folderId);
    setInitialDocName(''); // Reset
    setPendingFolderId(null); // Reset
  };

  const handleOpenCreateModal = (name: string = '', folderId: string | null = null) => {
    setInitialDocName(name);
    setPendingFolderId(folderId);
    setIsCreateModalOpen(true);
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
    }, 150); // 縮短 Mermaid 模式延遲 (300ms -> 150ms)
    return () => clearTimeout(timer);
  }, [code, theme, renderDiagram]);


  // 清理檔案名稱中的非法字元
  const sanitizeFileName = (name: string): string => {
    // Windows 和多數系統禁止的字元：< > : " / \ | ? *
    return name.replace(/[<>:"/\\|?*]/g, '-').trim();
  };

  /** Mermaid PDF 匹出：注入 @page CSS 後呼叫 window.print()，完全繞開 canvas 安全限制 */
  const handleMermaidPrint = () => {
    const { paperSize, orientation, scale, margin } = settings.printSettings;
    const marginMap: Record<string, string> = { normal: '1.5cm', narrow: '0.5cm', none: '0' };
    const scaleCSS = scale === 'fit'
      ? 'svg { max-width: 100% !important; width: 100% !important; height: auto !important; }'
      : scale === 'actual' ? ''
        : `svg { zoom: ${scale}%; }`;

    const style = document.createElement('style');
    style.id = 'mermaid-print-override';
    style.textContent = `
      @page { size: ${paperSize} ${orientation}; margin: ${marginMap[margin] ?? '1.5cm'}; }
      header, aside, .editor-panel, .tab-bar { display: none !important; }
      ${scaleCSS}
    `;
    document.head.appendChild(style);
    window.print();
    window.addEventListener('afterprint', () => {
      document.getElementById('mermaid-print-override')?.remove();
    }, { once: true });
  };

  const downloadMarkdown = () => {
    const blob = new Blob([code], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // 使用文檔自訂名稱，若無則使用時間戳記
    const fileName = currentDocument?.name ? sanitizeFileName(currentDocument.name) : `document-${Date.now()}`;
    link.download = `${fileName}.md`;
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
      // 使用文檔自訂名稱，若無則使用時間戳記
      const fileName = currentDocument?.name ? sanitizeFileName(currentDocument.name) : `mermaid-diagram-${Date.now()}`;
      link.download = `${fileName}.svg`;
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
          // 使用文檔自訂名稱，若無則使用時間戳記
          const fileName = currentDocument?.name ? sanitizeFileName(currentDocument.name) : `mermaid-diagram-${Date.now()}`;
          link.download = `${fileName}.${format}`;
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
      const defaultCode = mode === 'mermaid' ? defaultContents?.mermaid['mermaid-standard'] : defaultContents?.markdown['markdown-standard'];
      handleCodeChange(defaultCode || '');
      resetNavigation();
    }
  };

  const handleClear = () => {
    handleCodeChange('');
  };

  /**
   * 將文字插入編輯器游標位置。
   * 若無游標位置資訊（例如 Modal 開啟後 focus 已移走），則附加至文件末尾。
   */
  const handleInsertIntoDoc = (text: string) => {
    if (!editorRef.current) return;
    const el = editorRef.current;
    const pos = el.selectionStart ?? code.length;
    const before = code.slice(0, pos);
    const after = code.slice(pos);
    // 確保插入的表格前後各有一個空行
    const prefix = before.length > 0 && !before.endsWith('\n\n') ? (before.endsWith('\n') ? '\n' : '\n\n') : '';
    const suffix = after.length > 0 && !after.startsWith('\n') ? '\n\n' : '\n';
    handleCodeChange(before + prefix + text + suffix + after);
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
    loader: { load: ["[tex]/ams", "[tex]/html", "[tex]/mhchem"] },
    tex: {
      packages: { "[+]": ["ams", "html", "mhchem"] },
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
          toggleDarkMode={handleToggleDarkMode}
          onDownloadMarkdown={downloadMarkdown}
          onExportImage={exportAsImage}
          isSyncScroll={isSyncScroll}
          setIsSyncScroll={setIsSyncScroll}
          onInsertCode={(newCode) => handleCodeChange(code + '\n\n' + newCode)}
          onImportFullFile={handleImportFullFile}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onMermaidPrint={handleMermaidPrint}
        />

        <main className="flex-1 flex overflow-hidden print:block print:overflow-visible">
          {/* 歷史側邊欄 */}
          <HistorySidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            documents={documents}
            currentDocId={currentDocId}
            currentDocContent={code}
            currentDocMode={mode}
            onInsertIntoDoc={handleInsertIntoDoc}
            onSelectDocument={handleDocumentSwitch}
            onCreateDocument={(fId) => handleOpenCreateModal('', fId)}
            onDeleteDocument={deleteDocument}
            onRenameDocument={renameDocument}
            storageUsage={storageUsage}
            getBacklinks={getBacklinks}
            folders={folders}
            onCreateFolder={createFolder}
            onDeleteFolder={deleteFolder}
            onRenameFolder={renameFolder}
            onMoveDocument={moveDocument}
          />

          {/* Create Document Modal */}
          <CreateDocModal
            isOpen={isCreateModalOpen}
            onClose={() => {
              setIsCreateModalOpen(false);
              setPendingFolderId(null);
            }}
            onCreate={handleCreateDocument}
            initialName={initialDocName}
          />
          {/* 移除 key={docFadeKey} 以防止全組件樹重掛造成的渲染跳動 */}
          <div className="flex flex-1 overflow-hidden print:block">
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
              openDocIds={openDocIds}
              currentDocId={currentDocId}
              documents={documents}
              onSwitchTab={handleDocumentSwitch}
              onCloseTab={handleCloseTab}
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
              documents={documents}
              onSelectDocument={handleDocumentSwitch}
              onCreateMissing={handleOpenCreateModal}
              currentDocId={currentDocId}
              openDocIds={openDocIds}
            />
          </div>
        </main>

        {/* Settings Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          mode={mode}
          currentMacros={settings.customMacros}
          onSaveMacros={updateMacros}
          onRestoreDefaults={restoreDefaults}
          currentPrintSettings={settings.printSettings}
          onSavePrintSettings={updatePrintSettings}
        />
      </div>
    </MathJaxContext>
  );
};

export default App;
