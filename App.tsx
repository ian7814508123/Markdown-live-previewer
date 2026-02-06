import React, { useState, useEffect, useRef, useCallback } from 'react';
import mermaid from 'mermaid';

import Header from './src/components/Header';
import Editor from './src/components/Editor';
import PreviewPanel from './src/components/PreviewPanel';
import HistorySidebar from './src/components/HistorySidebar';
import { usePanZoom } from './src/hooks/usePanZoom';
import { useDocumentStorage } from './src/hooks/useDocumentStorage';

type Theme = 'default' | 'neutral' | 'dark' | 'forest';

// Initialize Mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'loose',
  fontFamily: 'Inter',
});


const DEFAULT_MERMAID = `---
title: Mermaid 語法與樣式全攻略 (Cheat Sheet)
---
%% width: 100%
%% 👆 Tip: 使用 %% width: 80% 或 %% scale: 0.9 來調整圖表大小 (支援 PDF 匯出)
graph TD
    %% ==========================================
    %% 1. 基礎節點語法 (Node Syntax)
    %% 修正重點：文字內容全部加上雙引號 "" 以避免解析錯誤
    %% ==========================================
    
    Start(("Start<br/>(圓形)")) --> Node1["<b>標準矩形</b><br/>支援換行"]
    Node1 --> Node2("圓角矩形")
    Node2 --> Node3{"決策<br/>(菱形)"}
    
    %% 這裡就是原本報錯的地方，加上引號就修好了
    Node3 -->|Yes| Node4[/"平行四邊形<br/>(輸入/輸出)"/]
    
    Node3 -->|No| Node5[("資料庫<br/>Database")]
    Node4 --> Node6{{"六角形<br/>(準備/迴圈)"}}
    Node6 --> End((("雙圈<br/>(結束)")))

    %% ==========================================
    %% 2. 連線樣式 (Link Styles)
    %% ==========================================
    
    Node1 -.->|"虛線 (.-)"| Node3
    Node4 ==>|"粗線 (==)"| End
    Node5 --o|"圓頭 (o)"| Node2
    Node5 --x|"叉頭 (x)"| Node6

    %% ==========================================
    %% 3. 子圖表 (Subgraphs) - 用於分組
    %% ==========================================

    subgraph Group1 [📂 後端處理區]
        direction TB
        %% 這裡面的節點會被框在一起
        API["API 接口"] --> Auth{"驗證身分"}
        Auth -->|Pass| DB[("User DB")]
    end

    Node2 --> API

    %% ==========================================
    %% 4. 進階樣式定義 (ClassDef & Styles)
    %% 語法：classDef [樣式名] fill:[色碼],stroke:[色碼],color:[文字色]
    %% ==========================================

    %% 定義三種通用樣式
    classDef blueStyle fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#000
    classDef redStyle fill:#ffebee,stroke:#c62828,stroke-width:2px,stroke-dasharray: 5 5,color:#c62828
    classDef greenStyle fill:#e8f5e9,stroke:#2e7d32,stroke-width:4px,rx:10,ry:10

    %% 套用樣式
    class Node1,API blueStyle
    class Node3,Auth redStyle
    
    %% 直接在節點後用 ::: 套用
    SpecialNode["🚀 快速套用樣式"]:::greenStyle
    
    End --> SpecialNode

    %% ==========================================
    %% 5. 特殊排版與 HTML Hacks
    %% ==========================================

    %% 技巧：隱藏連結 (~~~) 用來調整上下位置但不畫線
    Group1 ~~~ FooterNote

    %% 技巧：使用 div 與 HTML 標籤來排版複雜文字
    %% 注意：classDef noteStyle 設為無邊框
    FooterNote["
    <div style='width:300px; text-align:left; color:#666;'>
      💡 <b>語法Tips：</b><br/>
      1. 換行請用 <code>&lt;br/&gt;</code><br/>
      2. 隱形連結使用 <code>~~~</code> 可調整版面<br/>
      3. 文字包在 <code>&quot;&quot;</code> 內才支援特殊符號
    </div>
    "]:::noteStyle

    %% 定義隱形樣式
    classDef noteStyle fill:none,stroke:none
    
    %% 連線樣式 (linkStyle)
    linkStyle 0 stroke:#ff9800,stroke-width:4px;
  
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

const DEFAULT_MARKDOWN =
  `# Markdown 文法指南

歡迎使用 **Markdown 即時編輯器** ✨  
本指南將帶你快速了解常用 Markdown 語法，並示範本編輯器支援的進階功能。

---

## 標題（Headings）

# 這是標題 H1
## 這是標題 H2
### 這是標題 H3
###### 這是標題 H6

---

## 強調（Emphasis）

*此文字為斜體*  
_此文字也是斜體_

**此文字為粗體**  
__此文字也是粗體__

***粗斜體***  
~~刪除線~~

_你也可以 **混合使用** 不同樣式_

---

## 列表（Lists）

### 無序列表（Unordered）

* 項目 1
* 項目 2
  * 項目 2a
  * 項目 2b
* 項目 3
  * 項目 3a
  * 項目 3b

### 有序列表（Ordered）

1. 項目 1
2. 項目 2
3. 項目 3
   1. 項目 3a
   2. 項目 3b

---

## 列表進階示範（支援至 5 階）

### 有序列表樣式

1. 第一階 (I)
    1. 第二階 (i)
        1. 第三階 (A)
            1. 第四階 (a)
                1. 第五階 (1)

### 無序列表樣式

* 第一階（實心圓）
    * 第二階（空心圓）
        * 第三階（方塊）
            * 第四階（實心圓）
                * 第五階（空心圓）

---

## 連結（Links）

您可能正在使用  
[Markdown 即時編輯器](http://localhost:3000)

如果需要語法上的幫助可以參考
[標註掉落 語法大全](https://hackmd.io/@eMP9zQQ0Qt6I8Uqp2Vqy6w/SyiOheL5N/%2FBVqowKshRH246Q7UDyodFA)

---

## 圖片（Images）

![這是替代文字](/image/markdown_liveditor.svg "這是一張範例圖片")

---

## 引用區塊（Blockquote）

> Markdown 是一種輕量級的標記語言，  
> 採用純文字語法，於 2004 年由 John Gruber 與 Aaron Swartz 創建。
>
> 常用於 README、技術文件、論壇文章與筆記整理。

---

## 程式碼（Code）

### 行內程式碼

本網站使用 \`markedjs/marked\` 進行解析。  
例如：\`console.log('Hello')\`

### 程式碼區塊

\`\`\`javascript
function sayHello() {
  console.log('Hello, Markdown Live Editor!');
}
\`\`\`

---

---

## 🚀 進階擴展功能

本編輯器支援多種進階渲染引擎，讓您的 Markdown 文檔更具表現力。

### 1. Mermaid 圖表 (內嵌式)

可以直接在 Markdown 中撰寫 Mermaid 語法：

\`\`\`mermaid
graph LR
    A[Markdown] --> B{內嵌渲染}
    B --> C[Mermaid]
    B --> D[KaTeX]
    B --> E[Vega]
\`\`\`

### 2. 數學公式 (KaTeX)

支援 LaTeX 語法進行科學運算與公式顯示：

- **行內公式**：$E = mc^2$
- **區塊公式**：

$$
I = \int_{0}^{\infty} e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$

### 3. 數據視覺化 (Vega-Lite)

支援以 JSON 語法定義專業圖表：

\`\`\`vega-lite
{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "description": "簡單的長條圖",
  "data": {
    "values": [
      {"a": "A", "b": 28}, {"a": "B", "b": 55}, {"a": "C", "b": 43},
      {"a": "D", "b": 91}, {"a": "E", "b": 81}, {"a": "F", "b": 53}
    ]
  },
  "mark": "bar",
  "encoding": {
    "x": {"field": "a", "type": "nominal", "axis": {"labelAngle": 0}},
    "y": {"field": "b", "type": "quantitative"}
  }
}
\`\`\`

---

## 🧠 智慧縮排（編輯輔助功能）

本編輯器支援 **智慧縮排**，可大幅提升列表與程式碼編輯效率。

### 使用方式

1. 將游標放在任一行，或選取多行
2. 按下 \`Tab\`  
   → 增加一層縮排
3. 按下 \`Shift + Tab\`  
   → 取消一層縮排

> 💡 小技巧  
> - 可同時選取多行進行縮排  
> - 特別適合巢狀列表與程式碼區塊編輯

---

## 🛠️ 編輯器進階功能

### 1. 圖表尺寸控制
您可以在 Mermaid 程式碼區塊的最上方加入特殊指令來調整顯示大小（此設定也會套用到 PDF 匯出）：

\`\`\`mermaid
%% width: 80%  <-- 設定寬度 (支援 px, %)
%% scale: 1.2  <-- 設定縮放比例 (Zoom)
graph TD
  A[小圖示] --> B[大圖示]
\`\`\`

### 2. 智能錯誤容錯
當您編輯圖表時若發生語法錯誤，**編輯器會保留上一次成功渲染的圖表**，並在頂部顯示輕量級錯誤提示。您不用擔心誤刪一個字元就導致整個圖表消失！

### 3. PDF 匯出優化
本編輯器針對列印與 PDF 匯出做了特別優化：
- **Vega 圖表自動縮放**：避免圖表過大被裁切（預設縮放 90%）。
- **精準邊界**：強制設定 10mm 邊界，確保文件整齊。
`;


type EditorMode = 'mermaid' | 'markdown';

const App: React.FC = () => {
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

  // 從當前文檔取得 mode 和 code
  const mode = currentDocument?.mode || 'mermaid';
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
    if (documents.length === 0) {
      createDocument('mermaid', DEFAULT_MERMAID, '預設 Mermaid 文檔');
    }
  }, [documents.length, createDocument]);

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
  const handleCreateDocument = () => {
    const newMode = mode; // 使用當前模式
    const defaultContent = newMode === 'mermaid' ? DEFAULT_MERMAID : DEFAULT_MARKDOWN;
    createDocument(newMode, defaultContent);
  };

  // 處理模式切換（Header 中的切換）
  const handleModeSwitch = (newMode: EditorMode) => {
    if (!currentDocument || newMode === currentDocument.mode) return;
    const modeName = newMode === 'mermaid' ? '美人魚' : '標記掉落';
    if (confirm(`切換到 ${modeName} 模式？將建立一個新的 ${modeName} 文檔`)) {
      const defaultContent = newMode === 'mermaid' ? DEFAULT_MERMAID : DEFAULT_MARKDOWN;
      createDocument(newMode, defaultContent);
    }

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
          msg = msg.replace(/line \d+/i, `line ${actualLine}`);
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
      const defaultCode = mode === 'mermaid' ? DEFAULT_MERMAID : DEFAULT_MARKDOWN;
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

    if (extension === 'mmd' || content.includes('graph ') || content.includes('sequenceDiagram')) {
      importMode = 'mermaid';
    }

    const newDocId = createDocument(importMode, content, file.name.replace(/\.[^/.]+$/, ""));
    if (newDocId) {
      handleDocumentSwitch(newDocId);
    }
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
        onInsertCode={(newCode) => handleCodeChange(code + '\n\n' + newCode)}
        onImportFullFile={handleImportFullFile}
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
    </div>
  );
};

export default App;
