# 部署指南 (Deployment Guide)

本專案已設定好自動化部署至 **GitHub Pages**。

## 📍 快速開始

1.  **推送程式碼**：將本專案推送到 GitHub。
2.  **開啟權限**：
    *   進入 GitHub Repository 的 **Settings** (設定) > **Pages** (頁面)
    *   在 **Build and deployment** > **Source** 中，選擇 **GitHub Actions**。
3.  **等待部署**：
    *   切換到 **Actions** 分頁，您應該會看到 "Deploy to GitHub Pages" 正在執行。
    *   完成後，該 Workflow 會顯示綠色勾勾，並提供網站連結。

## ⚙️ 技術細節

### 雙模兼容設計 (Hybrid Mode)

為了同時支援「本地開發」與「GitHub Pages 託管」，我們在 `vite.config.ts` 中實作了動態路徑策略：

*   **本地開發 (`npm run dev`)**：
    *   使用預設路徑 `/`。
    *   網址格式：`http://localhost:3000/`

*   **GitHub Pages (線上部署)**：
    *   透過 GitHub Actions 自動注入環境變數 `BASE_URL`。
    *   網址格式：`https://<username>.github.io/<repo-name>/`
    *   系統會自動將資源路徑修正為 `/<repo-name>/assets/...`，確保圖片與樣式正確載入。

### 安全注意事項

*   本專案目前為 **純靜態網站 (Static Site)**。
*   ⚠️ **請勿** 在原始碼中提交任何 API Key 或敏感資訊，因為這些內容在瀏覽器端都是公開可見的。

## 🛠 手動建置 (Optional)

如果您需要手動產生建置檔案：

```bash
# 本地預覽 (使用根路徑)
npm run build
npm run preview

# 模擬 GitHub Pages 路徑 (將 repo-name 換成您的資料夾名稱)
BASE_URL=/repo-name/ npm run build
npm run preview
```
