# 專案依賴套件 (Project Dependencies)

本清單整理自 `package.json`，列出專案運行與開發所需的所有套件。

## 📦 核心依賴 (dependencies)

這些是應用程式在生產環境中運行所需的套件：

| 套件名稱 | 版本 | 用途 |
| :--- | :--- | :--- |
| **User Interface** | | |
| `react` | ^19.2.3 | 用於構建使用者介面的核心庫 |
| `react-dom` | ^19.2.3 | React 的 DOM 渲染器 |
| `lucide-react` | ^0.562.0 | 輕量且美觀的圖標庫 |
| **Markdown & Rendering** | | |
| `react-markdown` | ^10.1.0 | 將 Markdown 渲染為 React 組件 |
| `remark-gfm` | ^4.0.1 | 支援 GitHub Flavored Markdown (表格、刪除線等) |
| `remark-math` | ^6.0.0 | 解析 Markdown 中的數學公式語法 |
| `rehype-mathjax` | latest | **(新)** 使用 MathJax 渲染 LaTeX 數學公式 |
| `rehype-raw` | ^7.0.0 | 允許在 Markdown 中解析原始 HTML |
| **Visualization** | | |
| `mermaid` | ^11.12.2 | 透過文字定義生成流程圖與圖表 |
| `vega` | ^6.2.0 | 宣告式視覺化語法核心 |
| `vega-lite` | ^6.4.2 | 簡化的 Vega 語法，用於快速建立統計圖表 |
| `vega-embed` | ^7.1.0 | 將 Vega/Vega-Lite 圖表嵌入網頁 |
| **Utilities** | | |
| `@google/genai` | ^1.34.0 | Google Generative AI SDK (若有使用 AI 功能) |
| `xlsx` | ^0.18.5 | 處理 Excel 檔案的讀寫 |
| `extend` | ^3.0.2 | 物件擴展工具 |

> ⚠️ **注意**：原 `rehype-katex` 已被 `rehype-mathjax` 取代，以提供更完整的數學公式支援。

---

## 🛠️ 開發依賴 (devDependencies)

這些僅在開發與構建過程中使用：

| 套件名稱 | 版本 | 用途 |
| :--- | :--- | :--- |
| `vite` | ^6.2.0 | 極速的前端構建工具與開發伺服器 |
| `@vitejs/plugin-react` | ^5.0.0 | Vite 的 React 插件 (支援 Fast Refresh) |
| `typescript` | ~5.8.2 | JavaScript 的型別超集，提供靜態型別檢查 |
| `@types/node` | ^22.14.0 | Node.js 的型別定義檔 |
