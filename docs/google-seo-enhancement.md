# Google Search Console 內容價值提升指南

## 📌 概述
Google Search Console 評估網站價值的主要指標包括：
1. **內容完整性** - Schema.org 結構化數據的豐富度
2. **主題相關性** - 關鍵字覆蓋率和語義相關性
3. **用戶體驗信號** - Core Web Vitals、響應式設計
4. **內容新鮮度** - Sitemap 更新頻率和 lastmod 日期
5. **可訪問性** - 螢幕閱讀器友好的內容結構

---

## ✅ 已實施的 SEO 優化

您的專案已經具備了基礎 SEO 框架：
- ✓ Meta description（元描述）
- ✓ Open Graph 標籤（社群分享）
- ✓ Twitter Card 標籤
- ✓ JSON-LD 結構化數據（SoftwareApplication 類型）
- ✓ robots.txt 和 sitemap.xml
- ✓ 語言標記（lang="zh-Hant"）

---

## 🚀 進階優化建議

### 1️⃣ **增強 Schema.org 結構化數據**

#### 現狀
目前只有 `SoftwareApplication` 類型的 Schema。

#### 建議新增

##### A. 增加 FAQ Schema（常見問題）
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Markdown Live Previewer 支持哪些功能？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "支持即時預覽、Mermaid 圖表、LaTeX 公式、PDF 導出等..."
      }
    },
    {
      "@type": "Question",
      "name": "我的數據會被保存到雲端嗎？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "不會，所有數據都存儲在您的瀏覽器本地..."
      }
    },
    {
      "@type": "Question",
      "name": "如何導出我的 Markdown 文件？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "支持 PDF、PNG、SVG、Markdown 等多種格式..."
      }
    }
  ]
}
```

**優點**：
- 增加長尾關鍵字覆蓋率
- Google 會在搜尋結果中顯示 FAQ 摘錄
- 改善 CTR（點擊率）

##### B. 增加 AggregateRating（評分）
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Markdown Live Previewer",
  ...
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "1250",
    "bestRating": "5",
    "worstRating": "1"
  }
}
```

**注意**：只有在真實收集用戶評分後才能使用。

##### C. 增加 BreadcrumbList（麵包屑導航）
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
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Editor",
      "item": "https://markdown-live-previewer.onrender.com/"
    }
  ]
}
```

##### D. 增加 CreativeWork（創意作品描述）
```json
{
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "name": "Markdown Live Previewer",
  "description": "一款功能完整的 Markdown 編輯與預覽工具...",
  "url": "https://markdown-live-previewer.onrender.com/",
  "creator": {
    "@type": "Person",
    "name": "Huang Jyun Ying"
  },
  "datePublished": "2024-01-01",
  "dateModified": "2026-03-22"
}
```

---

### 2️⃣ **擴展 Meta 標籤**

#### A. 新增 `robots` 指令
```html
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
```

#### B. 新增 `canonical` 標籤
```html
<link rel="canonical" href="https://markdown-live-previewer.onrender.com/">
```

#### C. 新增 `alternate` 語言版本（如果有英文版本）
```html
<link rel="alternate" hreflang="en" href="https://markdown-live-previewer.onrender.com/en/">
<link rel="alternate" hreflang="zh-Hant" href="https://markdown-live-previewer.onrender.com/">
<link rel="alternate" hreflang="x-default" href="https://markdown-live-previewer.onrender.com/">
```

---

### 3️⃣ **增強 sr-only 無障礙內容** 

在 `index.tsx` 的 `#root` 內部，新增更多描述性文字：

```html
<div class="sr-only" role="main" aria-label="Markdown 編輯器主要區域">
  <h1>Markdown Live Previewer - 專業在線 Markdown 編輯器</h1>
  
  <h2>主要功能</h2>
  <ul>
    <li>即時同步滾動預覽 - 編輯時實時看到渲染結果</li>
    <li>Mermaid 圖表支持 - 流程圖、時序圖、甘特圖、類圖、狀態圖</li>
    <li>LaTeX 數學公式 - 支持行內和塊級公式</li>
    <li>Vega-Lite 數據可視化 - 創建交互式圖表</li>
    <li>多格式導出 - PDF、PNG、SVG、Markdown</li>
    <li>PDF 合併工具 - 合併多個 PDF 文件</li>
    <li>Excel 轉 Markdown - 快速轉換表格格式</li>
    <li>圖片上傳與優化 - 本地處理，保護隱私</li>
    <li>本地存儲 - 所有數據存在瀏覽器，無雲存儲</li>
  </ul>

  <h2>支持的導出格式</h2>
  <ul>
    <li>PDF - 高質量文檔格式</li>
    <li>PNG - 光柵圖像格式</li>
    <li>SVG - 矢量圖形格式</li>
    <li>Markdown - 原始 Markdown 格式</li>
  </ul>

  <h2>支持的圖表類型</h2>
  <ul>
    <li>流程圖 - Flowchart</li>
    <li>時序圖 - Sequence Diagram</li>
    <li>甘特圖 - Gantt Chart</li>
    <li>類圖 - Class Diagram</li>
    <li>狀態圖 - State Diagram</li>
    <li>實體關係圖 - Entity Relationship Diagram</li>
    <li>用戶旅程圖 - User Journey</li>
  </ul>

  <h2>技術特點</h2>
  <ul>
    <li>瀏覽器端執行 - 無需後端服務</li>
    <li>完全免費 - 開源 Web 應用</li>
    <li>響應式設計 - 支持所有設備</li>
    <li>無廣告 - 專注編輯體驗</li>
    <li>快速加載 - 優化的性能表現</li>
  </ul>

  <h2>用戶場景</h2>
  <ul>
    <li>軟件開發者 - 編寫技術文檔和 README</li>
    <li>學生 - 筆記記錄和論文撰寫</li>
    <li>博客作者 - 內容創作和發布準備</li>
    <li>數據分析師 - 報告和演示文稿</li>
    <li>產品經理 - 需求文檔和規劃</li>
    <li>設計師 - 設計稿描述和標註</li>
  </ul>
</div>
```

---

### 4️⃣ **更新 sitemap.xml 的動態生成**

考慮在 Vite 構建時自動更新 `lastmod` 日期：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://markdown-live-previewer.onrender.com/</loc>
    <lastmod>2026-03-22</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>https://markdown-live-previewer.onrender.com/favicon.svg</image:loc>
      <image:title>Markdown Live Previewer Logo</image:title>
    </image:image>
  </url>
</urlset>
```

---

### 5️⃣ **新增 robots.txt 的詳細規則**

```plaintext
# Allow all bots
User-agent: *
Allow: /
Disallow: /node_modules/
Disallow: /.git/

# Crawl-delay (optional, for aggressive crawlers)
# Crawl-delay: 1

# Specific rules for Google
User-agent: Googlebot
Allow: /
Crawl-delay: 0

# Sitemap locations
Sitemap: https://markdown-live-previewer.onrender.com/sitemap.xml

# Allow JSON-LD indexing
Allow: /ld+json

# Block unwanted crawlers
User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /
```

---

### 6️⃣ **新增 .well-known/security.txt** (可選但推薦)

在 `public/.well-known/security.txt` 中建立安全聯絡方式：

```text
Contact: mailto:security@markdown-live-previewer.onrender.com
Expires: 2027-03-22T00:00:00Z
Preferred-Languages: en, zh
```

---

### 7️⃣ **新增 Open Search Description** (可選)

在 `public/opensearchdescription.xml` 中允許瀏覽器搜索功能：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
  <ShortName>Markdown Live Previewer</ShortName>
  <Description>搜索 Markdown Live Previewer 的文檔和教程</Description>
  <Url type="text/html" 
       template="https://markdown-live-previewer.onrender.com/?search={searchTerms}"/>
  <Image height="16" width="16" type="image/x-icon">
    https://markdown-live-previewer.onrender.com/favicon.svg
  </Image>
</OpenSearchDescription>
```

---

## 📊 Google Search Console 檢查清單

部署上述優化後，請在 Google Search Console 執行以下操作：

- [ ] 提交更新的 sitemap.xml
- [ ] 點擊「索取索引」來加速內容索引
- [ ] 使用「URL 檢查」工具驗證結構化數據是否正確
- [ ] 檢查「增強內容報告」中的錯誤
- [ ] 監控「Core Web Vitals」指標
- [ ] 檢查「手動操作」中是否有違規警告
- [ ] 查看「效能報告」中的點擊率和展示次數

---

## 🔍 驗證 Schema 的工具

1. **Google 結構化數據測試工具**
   https://search.google.com/test/rich-results

2. **Google Rich Result Tester**
   https://richresults.withgoogle.com/

3. **Schema.org 驗證工具**
   https://validator.schema.org/

---

## 📈 預期改進效果

實施這些優化後，通常可以期待：

| 指標 | 改進 |
|------|------|
| 搜尋結果豐富片段 | +40-60% CTR 提升 |
| 關鍵字覆蓋率 | +15-25% 長尾關鍵字 |
| 索引速度 | 縮短 50% 索引時間 |
| 搜尋曝光 | +20-30% 展示次數 |
| 用戶體驗信號 | 改善可訪問性評分 |

---

## 🔄 定期維護計劃

| 頻率 | 任務 |
|------|------|
| 每日 | 監控 GSC 的「手動操作」和「安全問題」 |
| 每週 | 檢查 Core Web Vitals 數據 |
| 每月 | 更新 sitemap.xml 的 lastmod 日期 |
| 每季 | 審查關鍵字排名和競爭對手分析 |
| 每年 | 更新 robots.txt 和 security.txt 過期日期 |

---

## ⚠️ 常見 SEO 錯誤 (應避免)

- ❌ 隱藏文本（黑帽 SEO）- 不要使用 `display: none`
- ❌ 關鍵字堆砌 - 自然語言是王道
- ❌ 斷鏈接 - 定期檢查 404 錯誤
- ❌ 重複內容 - 使用 canonical 標籤避免
- ❌ 沒有 HTTPS - 確保全站使用 HTTPS
- ❌ 移動設備不友好 - 測試響應式設計
- ❌ 頁面加載過慢 - 優化圖像和 JS 大小

---

**最後更新**：2026-03-22
**維護者**：Huang Jyun Ying
