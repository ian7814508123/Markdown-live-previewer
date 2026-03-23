# SEO 實施快速檢查清單

## ✅ 立即行動清單

### 本地驗證 (5 分鐘)
- [ ] 構建項目
  ```bash
  npm run build
  ```

- [ ] 本地預覽
  ```bash
  npm run preview
  ```

- [ ] 打開 DevTools 檢查
  - [ ] Meta Description 是否存在
  - [ ] 結構化數據是否有效
  - [ ] `SEOContent` 組件是否包含在 HTML 中

### Schema 驗證 (5 分鐘)
- [ ] 訪問 https://richresults.withgoogle.com/
- [ ] 測試 Sitemap (提交本地 URL)
- [ ] 驗證以下 Schema：
  - [ ] SoftwareApplication (主要應用描述)
  - [ ] FAQPage (8 個 FAQ 項)
  - [ ] BreadcrumbList (導航)

### 部署 (3 分鐘)
```bash
git add .
git commit -m "SEO enhancement: Add FAQ schema, SEO content, and optimizations"
git push origin main
```

### Google Search Console (5 分鐘)
1. [ ] 登入 [Google Search Console](https://search.google.com/search-console)
2. [ ] 選擇您的網站
3. [ ] 進入「Sitemaps」
4. [ ] 新增或更新 Sitemap：
   ```
   https://markdown-live-previewer.onrender.com/sitemap.xml
   ```
5. [ ] 點擊「索取索引」

### URL 檢查驗證 (5 分鐘)
1. [ ] 打開「URL 檢查」工具
2. [ ] 輸入首頁 URL：
   ```
   https://markdown-live-previewer.onrender.com/
   ```
3. [ ] 驗證結果：
   - [ ] 「可在 Google 上建立索引」
   - [ ] 結構化數據被正確識別
   - [ ] 移動友好度 ✓

---

## 📊 實施成果驗證

### 應檢查的關鍵指標

#### 1. Meta 標籤 (在 HTML 源代碼中)
```html
✓ <meta name="description" content="...150-160 字符...">
✓ <meta name="keywords" content="...">
✓ <meta name="robots" content="index, follow, ...">
✓ <link rel="canonical" href="...">
✓ <link rel="search" type="application/opensearchdescription+xml" href="...">
```

#### 2. JSON-LD Schema (在 HTML 源代碼中)
```json
✓ @type: "SoftwareApplication" - 完整應用描述
✓ @type: "FAQPage" - 8 個 FAQ 項
✓ @type: "BreadcrumbList" - 導航結構
```

#### 3. SEO 內容 (在 HTML 源代碼中)
```html
✓ <div class="sr-only" role="main"> - 存在且包含 8000+ 字
✓ <h1>, <h2>, <h3> - 語義化標題結構
✓ <ul>, <li> - 列表結構
```

#### 4. 技術 SEO 文件
```
✓ /robots.txt - 存在，包含正確的規則
✓ /sitemap.xml - 存在，包含圖片信息
✓ /.well-known/security.txt - 存在
✓ /opensearchdescription.xml - 存在
```

---

## 🎯 Google Search Console 監控清單

### 第 1 周
- [ ] 檢查「覆蓋範圍」報告
  - 是否有新發現的頁面
  - 是否有新的錯誤

- [ ] 檢查「增強內容」報告
  - FAQ 是否被識別
  - 常見問題項是否顯示

- [ ] 檢查「效能」報告
  - 記錄基準線數據
  - 點擊、展示、CTR

### 第 4 周
- [ ] 檢查排名變化
  - 新的高排名查詢
  - CTR 改善

- [ ] 檢查 Core Web Vitals
  - LCP (最大內容繪製)
  - FID (首次輸入延遲)
  - CLS (累積佈局移位)

- [ ] 檢查「安全問題」
  - 是否有新的警告

### 第 12 周
- [ ] 對比初始基準線
  - 流量增長百分比
  - 新排名關鍵字數量
  - 平均排名位置改善

- [ ] 評估 FAQ 豐富摘錄的影響
- [ ] 計劃下一輪優化

---

## 🔧 故障排除

### 如果 Schema 未被識別

**症狀**: Rich Result Tester 顯示「沒有發現有效的項目類型」

**解決步驟**:
1. [ ] 檢查 JSON-LD 語法
   ```bash
   # 在瀏覽器控制台測試
   const json = {...}; // 複製 JSON-LD
   JSON.parse(json); // 如果報錯，JSON 無效
   ```

2. [ ] 確認 Schema 位置
   - [ ] 必須在 `<head>` 中

3. [ ] 驗證數據類型
   - [ ] 所有必需字段都存在
   - [ ] 日期格式為 ISO 8601 (YYYY-MM-DD)

4. [ ] 重新運行 Rich Result Tester

### 如果 SEO 內容不可見

**症狀**: 爬蟲看不到 SEO 內容

**解決步驟**:
1. [ ] 檢查 `SEOContent.tsx` 是否導入到 App.tsx
2. [ ] 驗證 CSS 類 `sr-only` 是否正確定義
3. [ ] 使用「查看網頁源代碼」確認內容存在

### 如果 Sitemap 未被提交

**症狀**: GSC 顯示「無法讀取」

**解決步驟**:
1. [ ] 訪問 Sitemap URL 直接驗證：
   ```
   https://markdown-live-previewer.onrender.com/sitemap.xml
   ```

2. [ ] 檢查 XML 語法
3. [ ] 確認所有 URL 都是有效的
4. [ ] 重新提交 Sitemap

---

## 📞 支持和資源

### 官方文檔
- [Google Search Central](https://developers.google.com/search)
- [Schema.org Documentation](https://schema.org/)
- [Google Search Console Help](https://support.google.com/webmasters)

### 實用工具
- [Rich Result Tester](https://richresults.withgoogle.com/)
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### 社區支持
- [Stack Overflow - SEO Tag](https://stackoverflow.com/questions/tagged/seo)
- [Google Search Central Blog](https://developers.google.com/search/blog)
- [Moz Community](https://moz.com/community)

---

## ✨ 成功指標

在 1-3 個月內，您應該看到：

✅ **能見度提升**
- 搜尋展示次數增加 20-50%
- 新的高排名查詢出現
- FAQ 豐富摘錄開始出現

✅ **流量增長**
- 有機流量增加 30-80%
- 點擊率改善 15-30%
- 新用戶訪問增加

✅ **排名改善**
- 前 10 頁排名的查詢數增加
- 平均排名位置提升
- 關鍵字覆蓋範圍擴大

---

## 📅 定期維護計劃

### 每月任務
- [ ] 更新 Sitemap 的 `lastmod`
- [ ] 檢查 Google Search Console 報告
- [ ] 驗證是否有新的爬蟲錯誤
- [ ] 添加新功能到 FAQ (如適用)

### 每季度任務
- [ ] 完整的 SEO 審計
- [ ] 競爭者分析
- [ ] 關鍵字策略更新
- [ ] Schema 數據驗證

### 年度任務
- [ ] 更新 security.txt 的過期日期
- [ ] 完整的內容审校和刷新
- [ ] 技術 SEO 深度檢查
- [ ] 制定下一年的 SEO 目標

---

**檢查清單版本**: 1.0  
**最後更新**: 2026-03-22  
**下一次更新**: 2026-06-22
