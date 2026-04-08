# ♻️ SEO 維護、檢查清單與故障排除

本手冊為 Markdown Live Previewer 的 SEO 持續維護提供了一站式解決方案，包括分階段檢查清單、更新指南以及常見問題的疑難排解。

---

## 📅 定期維護計劃 (Maintenance Schedule)

| 頻率 | 任務 |
|------|------|
| **每週 (Weekly)** | 檢查 Google Search Console (GSC) 的「效能」報告，觀察展示量與 CTR 趨勢。 |
| **每月 (Monthly)** | 手動更新 `sitemap.xml` 的 `lastmod` 日期，向 Google 發出新鮮度信號。 |
| **每季 (Quarterly)** | 使用 [Rich Result Tester](https://richresults.withgoogle.com/) 驗證 Schema 是否依然有效。 |
| **每年 (Yearly)** | 更新 `public/.well-known/security.txt` 的 `Expires` 日期，確保合規。 |

---

## ✅ 完整檢查清單 (Master Checklist)

### 1. 部署前快速檢查 (5 分鐘)
*   [ ] 執行 `npm run build` 確保無編譯錯誤。
*   [ ] 執行 `npm run preview` 本地預覽確認 Meta 標籤已渲染。
*   [ ] 確認 `public/robots.txt` 與 `public/sitemap.xml` 已更新。

### 2. Google Search Console (GSC) 登錄清單
*   [ ] 提交 Sitemap (`https://[your-domain]/sitemap.xml`)。
*   [ ] 執行「URL 檢查」並點擊「索取索引」以加速爬蟲抓取。
*   [ ] 在「增強內容」報告中驗證 FAQ 與 SoftwareApplication 已被識別。

### 3. 功能更新時的 SEO 同步
若新增了重大功能（如新的圖表類型或工具），請同步更新：
*   [ ] `index.html` 的 `SoftwareApplication` `featureList`。
*   [ ] `index.html` 的 `FAQPage` (如有適用問題)。
*   [ ] `src/components/SEOContent.tsx` 的對應章節描述。

---

## 🔧 疑難排解 (Troubleshooting)

### 問題 A: Google Search Console 顯示「未檢測到結構化數據」
*   **原因**：JSON 語法錯誤或腳本被 CSP 屏蔽。
*   **解決**：將 `index.html` 中的 JSON-LD 複製到 [Schema.org Validator](https://validator.schema.org/) 驗證語法，確保沒有遺漏的逗號或引號。

### 問題 B: 內容已更新，但搜尋結果仍顯示舊版本
*   **原因**：緩存或爬蟲未及時重新抓取。
*   **解決**：在 GSC 中對受影響的 URL 再次執行「索取索引」，並確認 `sitemap.xml` 的 `lastmod` 已更新。

### 問題 C: SEOContent 組件在頁面上肉眼可見
*   **原因**：`src/index.css` 中的 `.sr-only` 樣式未正確加載或被覆蓋。
*   **解決**：確保 `.sr-only` 具有以下屬性：`position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0;`。

---

## 📚 導航
*   [上一級：技術實作細節](file:///c:/Users/User/Desktop/Markdown-live-previewer/docs/SEO-TECHNICAL-DETAILS.md)
*   [下一級：專案結構圖](file:///c:/Users/User/Desktop/Markdown-live-previewer/docs/PROJECT-INDEX.md)
