import React, { useState, useEffect, useRef, useCallback } from 'react';
import mermaid from 'mermaid';

import Header from './src/components/Header';
import Editor from './src/components/Editor';
import PreviewPanel from './src/components/PreviewPanel';
import { usePanZoom } from './src/hooks/usePanZoom';

type Theme = 'default' | 'neutral' | 'dark' | 'forest';

// Initialize Mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'loose',
  fontFamily: 'Inter',
});


const DEFAULT_MERMAID = `---
title: Mermaid 語法示範
---
graph TB
    %% === 流程圖：展示各種節點和連接方式 ===
    
    Start([開始]) --> Input[/輸入資料/]
    Input --> Process[處理資料]
    Process --> Decision{是否有效?}
    
    Decision -->|是| SubGraph[進入子流程]
    Decision -->|否| Error[顯示錯誤]
    Error --> Input
    
    SubGraph --> Database[(儲存到<br/>資料庫)]
    Database --> Output[/輸出結果/]
    Output --> End((結束))
    
    %% 樣式定義
    classDef processStyle fill:#e1f5ff,stroke:#01579b,stroke-width:2px
    classDef errorStyle fill:#ffebee,stroke:#c62828,stroke-width:2px
    classDef successStyle fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    
    class Process,SubGraph processStyle
    class Error errorStyle
    class End successStyle
    
    %% ====================================
    %% 其他圖表類型範例（取消註解即可使用）
    %% ====================================
    
    %% 序列圖 (Sequence Diagram)
    %% sequenceDiagram
    %%     participant 用戶
    %%     participant 系統
    %%     participant 資料庫
    %%     用戶->>系統: 發送請求
    %%     系統->>資料庫: 查詢資料
    %%     資料庫-->>系統: 返回結果
    %%     系統-->>用戶: 顯示結果
    
    %% 類別圖 (Class Diagram)
    %% classDiagram
    %%     class Animal {
    %%         +String name
    %%         +int age
    %%         +makeSound()
    %%     }
    %%     class Dog {
    %%         +String breed
    %%         +bark()
    %%     }
    %%     Animal <|-- Dog
    
    %% 狀態圖 (State Diagram)
    %% stateDiagram-v2
    %%     [*] --> 待處理
    %%     待處理 --> 處理中: 開始處理
    %%     處理中 --> 已完成: 處理成功
    %%     處理中 --> 失敗: 處理失敗
    %%     失敗 --> 待處理: 重試
    %%     已完成 --> [*]
    
    %% 甘特圖 (Gantt Chart)
    %% gantt
    %%     title 專案時程表
    %%     dateFormat YYYY-MM-DD
    %%     section 設計階段
    %%     需求分析: 2024-01-01, 7d
    %%     UI設計: 2024-01-08, 5d
    %%     section 開發階段
    %%     前端開發: 2024-01-13, 10d
    %%     後端開發: 2024-01-13, 10d
    
    %% 圓餅圖 (Pie Chart)
    %% pie title 專案時間分配
    %%     "設計" : 30
    %%     "開發" : 45
    %%     "測試" : 15
    %%     "部署" : 10
`;

const DEFAULT_MARKDOWN = `# Markdown 語法與功能指南

## 🌟 新功能亮點
* **Excel/表格 匯入**: 點擊工具列的 "匯入表格" 按鈕，上傳 .xlsx 檔或貼上 CSV 資料。
* **PDF 匯出**: 在下載選單中選擇 "列印 / PDF" 以儲存為高品質文件。
* **同步滾動**: 編輯區與預覽區現在會流暢地同步捲動。
* **智慧縮排**: 按下 Tab 鍵可自動縮排，Shift+Tab 可取消縮排（支援多行）。

## 列表演示

### 有序列表 (支援且樣式化至 5 階)
1. 第一階 (I)
    1. 第二階 (i)
        1. 第三階 (A)
            1. 第四階 (a)
                1. 第五階 (1)
                2. 第五階項目 B


### 無序列表 (支援且樣式化至 5 階)
* 第一階 (實心圓)
    * 第二階 (空心圓)
        * 第三階 (方塊)
            * 第四階 (實心圓)
                * 第五階 (空心圓)
                * 第五階項目 B

## 標題
# H1 標題
## H2 標題
### H3 標題

## 強調與格式
*斜體* 或 _斜體_
**粗體** 或 __粗體__
***粗斜體***
~~刪除線~~

## 程式碼
行內程式碼: \`console.log('Hello')\`

區塊程式碼:
\`\`\`javascript
function sayHello() {
  console.log('Hello, Mermaid Lens Pro!');
}
\`\`\`

## 表格範例 (試試看匯入 Excel!)
| 功能 | 狀態 | 描述 |
|:-----|:----:|:-----|
| 即時預覽 | ✅ | 修改即見 |
| Excel 匯入 | ✅ | 支援 .xlsx |
| PDF 匯出 | ✅ | 乾淨版面 |
`;

type EditorMode = 'mermaid' | 'markdown';

const App: React.FC = () => {
  const [mode, setMode] = useState<EditorMode>(() => {
    return (localStorage.getItem('editor-mode') as EditorMode) || 'mermaid';
  });

  const [code, setCode] = useState(() => {
    const savedMode = (localStorage.getItem('editor-mode') as EditorMode) || 'mermaid';
    return localStorage.getItem(`${savedMode}-session-code`) || (savedMode === 'mermaid' ? DEFAULT_MERMAID : DEFAULT_MARKDOWN);
  });
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<Theme>('neutral');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSyncScroll, setIsSyncScroll] = useState(true);

  // Toggle Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('editor-mode', mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem(`${mode}-session-code`, code);
  }, [code, mode]);

  // Custom Hook for Navigation
  const {
    zoom,
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

  const handleModeSwitch = (newMode: EditorMode) => {
    setMode(newMode);

    // Try to restore saved session for the new mode, or valid default
    const savedCode = localStorage.getItem(`${newMode}-session-code`);
    if (savedCode) {
      setCode(savedCode);
    } else {
      setCode(newMode === 'mermaid' ? DEFAULT_MERMAID : DEFAULT_MARKDOWN);
    }

    resetNavigation();
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
    link.download = `document-${Date.now()}.md`;
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
      svgEl.setAttribute('viewBox', `${x - padding} ${y - padding} ${width + padding * 2} ${height + padding * 2}`);
      const svgData = serializer.serializeToString(svgEl);
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mermaid-diagram-${Date.now()}.svg`;
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
          link.download = `mermaid-diagram-${Date.now()}.${format}`;
          link.href = canvas.toDataURL(`image/${format}`, 0.9);
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
      const defaultCode = mode === 'mermaid' ? DEFAULT_MERMAID : DEFAULT_MARKDOWN;
      setCode(defaultCode);
      resetNavigation();
    }
  };

  const handleClear = () => {
    setCode('');
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <Header
        mode={mode}
        setMode={handleModeSwitch}
        theme={theme}
        setTheme={(t) => setTheme(t as Theme)}
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onDownloadMarkdown={downloadMarkdown}
        onExportImage={exportAsImage}
        isSyncScroll={isSyncScroll}
        setIsSyncScroll={setIsSyncScroll}
        onInsertCode={(newCode) => setCode(prev => prev + '\n\n' + newCode)}
      />

      <main className="flex-1 flex overflow-hidden print:block print:overflow-visible">
        <Editor
          ref={editorRef}
          mode={mode}
          code={code}
          setCode={setCode}
          onCopy={handleCopy}
          onReset={handleReset}
          onClear={handleClear}
          copied={copied}
          onScroll={handleEditorScroll}
          isDarkMode={isDarkMode}
          onMouseEnter={() => { isHoveringEditor.current = true; }}
          onMouseLeave={() => { isHoveringEditor.current = false; }}
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
    </div>
  );
};

export default App;
