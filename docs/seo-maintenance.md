# SEO 持續維護與功能描述更新指南

為了在搜尋引擎中保持競爭力，當您新增功能或修改應用程式時，請務必同步更新相應的 SEO 配置文件。本指南概述了所有需要維護的 SEO 組件。

## 📌 SEO 架構概述

本應用實施了多層次的 SEO 優化：

1. **Meta Tags 層** - 基本的元標籤和社群分享
2. **結構化數據層** - JSON-LD Schema.org 數據
3. **無障礙內容層** - 用於爬蟲和螢幕閱讀器的隱藏內容
4. **技術 SEO 層** - robots.txt、sitemap.xml、security.txt
5. **配置層** - robots.txt、OpenSearch 配置

---

## 1️⃣ Meta Tags 更新 (基礎 SEO)

位於 `index.html` 的 `<head>` 區塊。

### A. Meta Description (主描述)
```html
<meta name="description" 
  content="[在此填入簡明的功能摘要，150-160 字符]">
```
**指南**：
- 總長 150-160 字符（移動搜尋結果顯示 120 字符）
- 包含主要關鍵字和獨特賣點
- 每頁應該不同
- 例：「Markdown-live-previewer - 免費在線 Markdown 編輯器，支持即時預覽、Mermaid 圖表、LaTeX 公式、PDF 導出...」

### B. Meta Keywords (補充)
```html
<meta name="keywords" 
  content="Markdown, Editor, Live Preview, Mermaid, LaTeX, ...">
```
**指南**：
- 8-10 個關鍵字
- 用逗號分隔
- 包含英文和中文關鍵字

### C. Open Graph Tags (社群分享)
```html
<meta property="og:description" 
  content="[Facebook/LINE 分享文本]">
<meta property="og:image" 
  content="https://markdown-live-previewer.onrender.com/favicon.svg">
```

### D. Twitter Card Tags
```html
<meta property="twitter:description" 
  content="[Twitter 分享文本]">
<meta property="twitter:image" 
  content="https://markdown-live-previewer.onrender.com/favicon.svg">
```

### E. 其他重要 Meta 標籤
```html
<meta name="robots" 
  content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
<link rel="canonical" href="https://markdown-live-previewer.onrender.com/">
<meta name="theme-color" content="#00416A">
```

---

## 2️⃣ 結構化數據更新 (JSON-LD Schema)

位於 `index.html` 的 `<script type="application/ld+json">` 標籤。

### A. SoftwareApplication Schema
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Markdown Live Previewer",
  "description": "[更新為最新的功能描述]",
  "featureList": [
    "[新增的功能1]",
    "[新增的功能2]",
    "[新增的功能3]"
  ],
  "dateModified": "2026-03-22",
  "isAccessibleForFree": true
}
```

**更新時機**：
- 每次新增主要功能
- 每月檢查 `dateModified` 是否為最新日期
- 新增或刪除功能時更新 `featureList`

### B. FAQPage Schema (常見問題)
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "新增功能是什麼？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[詳細描述]"
      }
    }
  ]
}
```

**好處**：
- 增加 FAQ 摘錄在搜尋結果中的顯示
- 改善 CTR (點擊率)
- 覆蓋長尾關鍵字

### C. BreadcrumbList Schema
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://markdown-live-previewer.onrender.com/"
    }
  ]
}
```

---

## 3️⃣ 無障礙 SEO 內容更新

位於 `src/components/SEOContent.tsx`

### 結構
- 隱藏的 `sr-only` div，對爬蟲可見但用戶看不見
- 包含豐富的文字描述和語義標記
- 使用 HTML 標題和列表結構

### 更新指南
```tsx
<div class="sr-only" role="main">
  <h1>主標題 - 包含主要關鍵字</h1>
  <h2>功能部分</h2>
  <ul>
    <li>[新增的功能詳細描述]</li>
  </ul>
</div>
```

**最佳實踐**：
- 每個新功能新增相應的 `<li>` 項目
- 使用語義化 HTML (`<h1>`, `<h2>`, `<ul>`, `<li>`)
- 不使用 `display: none`（會被搜尋引擎忽略）
- 確保文字自然流暢，避免關鍵字堆砌

---

## 4️⃣ Sitemap 更新

文件：`public/sitemap.xml`

### 必需字段
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>[頁面 URL]</loc>
    <lastmod>[更新日期 YYYY-MM-DD]</lastmod>
    <changefreq>[更新頻率]</changefreq>
    <priority>[優先級 0.0-1.0]</priority>
    <image:image>
      <image:loc>[圖片 URL]</image:loc>
      <image:title>[圖片標題]</image:title>
    </image:image>
  </url>
</urlset>
```

### 更新策略
- **每月**：更新 `<lastmod>` 為當前日期
- **新增功能**：新增相應的 `<url>` 項目（若有子頁面）
- **每次部署**：重新生成 Sitemap
- **Google Search Console**：手動提交更新的 sitemap.xml

### 變更頻率指南
| 內容 | changefreq | 說明 |
|------|-----------|------|
| 功能更新 | `weekly` | 定期新增功能 |
| 文檔更新 | `monthly` | 月度維護 |
| 穩定服務 | `yearly` | 長期穩定 |

---

## 5️⃣ Robots.txt 維護

文件：`public/robots.txt`

### 基本配置
```plaintext
# Allow all bots
User-agent: *
Allow: /
Disallow: /node_modules/
Disallow: /.git/

# Specific rules for Google
User-agent: Googlebot
Allow: /
Crawl-delay: 0

# Block aggressive crawlers
User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

Sitemap: https://markdown-live-previewer.onrender.com/sitemap.xml
```

### 何時更新
- 新增應該被爬蟲忽略的路徑時
- 需要控制特定爬蟲行為時
- Sitemap 位置變更時

---

## 6️⃣ Security.txt 和其他配置

### 位置：`public/.well-known/security.txt`
```text
Contact: mailto:security@markdown-live-previewer.onrender.com
Expires: 2027-03-22T00:00:00Z
Preferred-Languages: zh-Hant, en
```

**年度任務**：
- [ ] 更新 `Expires` 日期（往後推延一年）
- [ ] 確認聯絡方式正確

### 位置：`public/opensearchdescription.xml`
- 允許瀏覽器添加網站到搜尋引擎
- 在 `index.html` 中以 `<link rel="search">` 引用

---

## 📋 Google Search Console 檢查清單

部署上述優化後，請執行：

### 初始設定
- [ ] 驗證網站所有權
- [ ] 新增網站地圖
- [ ] 設定目標地理位置（如適用）
- [ ] 設定首選域名（www vs non-www）

### 定期檢查
- [ ] **每週**：檢查「覆蓋範圍」是否有錯誤
- [ ] **每週**：監控「效能」報告（CTR、展示次數、排名）
- [ ] **每月**：檢查「增強內容」報告（豐富摘錄、常見問題等）
- [ ] **每月**：驗證新頁面是否被索引
- [ ] **每季**：分析「搜尋流量」和關鍵字排名

### 新功能部署流程
1. 更新上述所有 5 個 SEO 組件
2. 提交更新到 Git 並部署
3. 等待 2-3 小時讓爬蟲發現更新
4. 在 Google Search Console 點擊「索取索引」
5. 使用「URL 檢查」工具驗證結構化數據

---

## 🔍 驗證工具

### 結構化數據驗證
1. **Google Rich Result Tester**
   https://richresults.withgoogle.com/

2. **Schema.org 驗證工具**
   https://validator.schema.org/

3. **Google 結構化數據測試工具**
   https://search.google.com/test/rich-results

### 其他工具
- **Lighthouse** - Core Web Vitals 和 SEO 審計
- **Mobile-Friendly Test** - 移動設備兼容性
- **Broken Link Checker** - 尋找損壞的連結

---

## 📊 SEO 性能指標

### 追蹤指標
| 指標 | 目標 | 檢查工具 |
|------|------|---------|
| 被索引頁面數 | > 100 | GSC 覆蓋範圍 |
| 平均 CTR | > 3% | GSC 效能 |
| 平均排名位置 | < 20 | GSC 效能 |
| Core Web Vitals | 良好 | PageSpeed Insights |
| 移動友好度 | 是 | Mobile-Friendly Test |

---

## 🚀 快速參考：新增功能 SEO 檢查清單

每當新增功能時，按照此清單：

1. ✅ **index.html Meta Tags**
   - [ ] 更新 `<meta name="description">`
   - [ ] 更新 `<meta name="keywords">`
   - [ ] 更新 `<meta property="og:description">`
   - [ ] 更新 `<meta property="twitter:description">`
   - [ ] 更新 `<title>`

2. ✅ **index.html JSON-LD Schemas**
   - [ ] 更新 SoftwareApplication `featureList`
   - [ ] 更新 `dateModified`
   - [ ] 新增或更新 FAQ Schema（如適用）
   - [ ] 新增或更新其他相關 Schema

3. ✅ **src/components/SEOContent.tsx**
   - [ ] 新增相應的 `<h3>` 小節
   - [ ] 新增功能描述的 `<ul>` 列表
   - [ ] 確保文字自然且包含相關關鍵字

4. ✅ **public/sitemap.xml**
   - [ ] 更新 `<lastmod>` 為今天日期
   - [ ] 新增新頁面（如適用）

5. ✅ **Google Search Console**
   - [ ] 提交新的 sitemap.xml
   - [ ] 點擊「索取索引」
   - [ ] 使用「URL 檢查」驗證結構化數據

---

## 🎯 預期結果

實施這些 SEO 優化後，通常可以期待：

| 時間 | 預期改進 |
|------|---------|
| 1-2 周 | 爬蟲開始重新索引，新頁面出現在搜尋結果 |
| 1 個月 | FAQ/豐富摘錄開始出現在搜尋結果 |
| 3 個月 | 關鍵字排名開始提升，流量增加 |
| 6 個月 | 顯著的流量和轉換率改善 |

---

## ⚠️ 常見錯誤 (應避免)

- ❌ 重複的 Meta Description
- ❌ 過長的 Meta Description (> 160 字符)
- ❌ 關鍵字堆砌
- ❌ 隱藏文本（使用 `display: none` 或 `visibility: hidden`）
- ❌ 忘記更新 Sitemap 的 `lastmod`
- ❌ 斷鏈接
- ❌ Schema 數據不一致
- ❌ 沒有 HTTPS

---

## 📚 參考資源

- [Google Search Central](https://developers.google.com/search)
- [Schema.org Documentation](https://schema.org/)
- [Moz SEO Guide](https://moz.com/beginners-guide-to-seo)
- [Semrush SEO Writing Assistant](https://www.semrush.com/seo-writing-assistant/)
- [Google Search Console Help](https://support.google.com/webmasters)

---

**最後更新**：2026-03-22
**維護者**：Huang Jyun Ying
**下次檢查日期**：2026-06-22 (每季度檢查一次)


