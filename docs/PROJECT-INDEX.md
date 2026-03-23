# 🗺️ 專案結構與文件導航 (Project Map)

本文件提供 Markdown Live Previewer 的完整目錄結構說明與所有說明文件的索引，方便開發者快速定位資源。

---

## 📁 目錄結構 (Directory Structure)

```
Markdown-live-previewer/
│
├── 📦 項目配置文件 (核心)
│   ├── index.html          ✏️ (SEO Meta & JSON-LD)
│   ├── index.tsx           🚀 (進入點)
│   ├── App.tsx             🏠 (根組件 & SEO 集成)
│   ├── package.json        📦 (依賴)
│   └── vite.config.ts      ⚡ (構建配置)
│
├── 📚 docs/                📖 (說明文件目錄)
│   ├── DEVELOPMENT.md      🛠️ (開發與部署指南) [NEW]
│   ├── SEO-GUIDE.md        ⭐ (SEO 核心指南)
│   ├── SEO-TECHNICAL.md    ⭐ (技術細節報告)
│   ├── SEO-MAINTENANCE.md  ⭐ (維護與檢查清單)
│   ├── PROJECT-INDEX.md    🗺️ (專案地圖 - 本文件)
│   ├── deployment.md       🚀 (部署指南)
│   └── ... (其他部署與工具說明)
│
├── 🔧 public/              🌐 (靜態資源)
│   ├── robots.txt          ✏️ (爬蟲規則)
│   ├── sitemap.xml         ✏️ (網站地圖)
│   └── .well-known/        🔒 (安全配置)
│
├── 💻 src/                 💻 (源代碼)
│   ├── components/         🧩 (React 組件)
│   │   ├── SEOContent.tsx  🔍 (SEO 核心組件)
│   │   └── ...
│   ├── hooks/              🎣 (自定義 Hooks)
│   ├── services/           🛠️ (服務層)
│   └── types.ts            📝 (類型定義)
│
└── 🧪 tests/               🧪 (單元測試)
```

---

## 📖 說明文件導覽 (Documentation Index)

### 1. SEO 相關 (新整合)
*   **[🎯 SEO 核心指南](file:///c:/Users/User/Desktop/Markdown-live-previewer/docs/SEO-GUIDE.md)**: 了解 SEO 五層架構、策略與預期目標。
*   **[🛠️ SEO 技術細節](file:///c:/Users/User/Desktop/Markdown-live-previewer/docs/SEO-TECHNICAL-DETAILS.md)**: 變更摘要、優化前後對比與 ROI 分析。
*   **[♻️ SEO 維護與檢查](file:///c:/Users/User/Desktop/Markdown-live-previewer/docs/SEO-MAINTENANCE.md)**: 日期更新指南、維護清單與疑難排解。

### 2. 開發、部署與運作
*   **[🛠️ 開發與部署指南](file:///c:/Users/User/Desktop/Markdown-live-previewer/docs/DEVELOPMENT.md)**: 安裝、本地指令、Docker 與雲端部署說明。
*   **[🚀 基礎部署說明](file:///c:/Users/User/Desktop/Markdown-live-previewer/docs/deployment.md)**: 傳統部署流程。
*   **[☁️ 雲端部署](file:///c:/Users/User/Desktop/Markdown-live-previewer/docs/cloud-deployment.md)**: Render/Vercel 等平台部署細節。
*   **[🐳 Docker 部署](file:///c:/Users/User/Desktop/Markdown-live-previewer/docs/docker-deployment.md)**: 使用 Docker Container 運行的配置。

### 3. 工具與功能
*   **[🖨️ 列印與 PDF 導出](file:///c:/Users/User/Desktop/Markdown-live-previewer/docs/print-and-pdf-guide.md)**: 列印樣式說明與 PDF 合併工具使用指南。
*   **[📦 依賴項說明](file:///c:/Users/User/Desktop/Markdown-live-previewer/docs/dependencies.md)**: 主要開發與運行依賴列表。

---

## 🧭 快速查找建議
*   **我是新開發者**: 從 [SEO 核心指南](file:///c:/Users/User/Desktop/Markdown-live-previewer/docs/SEO-GUIDE.md) 開始。
*   **我要檢查 SEO 狀態**: 使用 [維護與檢查清單](file:///c:/Users/User/Desktop/Markdown-live-previewer/docs/SEO-MAINTENANCE.md)。
*   **我要調整代碼結構**: 參考 [專案結構圖](file:///c:/Users/User/Desktop/Markdown-live-previewer/docs/PROJECT-INDEX.md)。

---

**最後更新**: 2026-03-23  
**維護者**: Huang Jyun Ying
