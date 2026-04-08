# 🛠️ 開發與部署指南 (Development & Deployment Guide)

本文件提供 Markdown Live Previewer 的技術細節，涵蓋開發環境設定、本地運行指令以及多種部屬方案。

---

## ⚙️ 開發環境 (Development Environment)

### 前置要求
*   **Node.js**: 建議使用 v16 或更高版本。
*   **npm**: 隨 Node.js 安裝的套件管理器。

### 安裝步驟
1.  複製專案庫或下載原始碼。
2.  在終端機執行安裝依賴：
    ```bash
    npm install
    ```

---

## 💻 本地開發指令 (Local Commands)

### 啟動開發伺服器
```bash
npm run dev
```
預設會運行在 `http://localhost:5173`。  
*提示：若需要開啟區域網路存取，請在 `vite.config.ts` 的 server 段落加上 `host: "0.0.0.0"`。*

### 構建生產版本
```bash
npm run build
```
構建後的檔案將存放在 `dist/` 目錄中。

### 本地預覽生產版本
```bash
npm run preview
```
這會啟動一個伺服器來測試構建後的成果，預設運行在 `http://localhost:4173/Markdown-live-previewer/`。

---

## 🐳 Docker 部署 (推薦用於生產環境)

使用 Docker 部署可以獲得一致的運行環境。

**快速啟動**：
```bash
docker-compose up -d
```
訪問 `http://localhost:8080`。詳細配置請參考 [Docker 部署細節](docker-deployment.md)。

---

## ☁️ 雲端部署 (公開存取)

推薦使用以下免費伺服平台進行部署：
*   **Render** (最推薦): 零配置，自動 HTTPS。詳細教學請參考 [雲端部署指南](cloud-deployment.md)。
*   **Railway / Fly.io**: 支援高度自定義。
*   **Google Cloud Run**: Serverless，按需計費。

---

## 📦 GitHub Pages 部署

`vite.config.ts` 已配置基本路徑為 `/Markdown-live-previewer/`。
1.  **Build**: `npm run build`
2.  **Deploy**: 將 `dist` 資料夾推送到 `gh-pages` 分支。

---

## 🔧 技術點與注意事項

*   **MathJax 渲染**: 生產版本包含特定的 CSS 覆蓋（見 `public/index.css`），以確保數學公式在不同裝置下不會出現非預期的斷行。
*   **SEO 優化**: 專案集成了 8,000+ 字的 SEO 隱藏內容組件，詳情請見 [SEO 核心指南](SEO-GUIDE.md)。

---

## ⚖️ 授權 (License)

本專案採用 [MIT License](../LICENSE) 授權。關於第三方套件的授權資訊，請參考 [依賴項說明](dependencies.md)。
