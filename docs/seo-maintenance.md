# SEO 持續維護與功能描述更新指南

為了在搜尋引擎中保持競爭力，當您新增功能或修改應用程式時，請務必同步更新 `index.html` 中的以下三個區塊。

## 1. 更新 Meta Tags (基礎 SEO)
位於 `<head>` 區塊，影響顯示在搜尋結果與社群分享的文字。

- **`description`**: 修改主描述。
- **`og:description`**: 影響 Facebook/LINE 分享文字。
- **`twitter:description`**: 影響 Twitter 分享文字。

```html
<meta name="description" content="[在此填入新的功能摘要]">
```

## 2. 更新 JSON-LD (結構化數據)
位於 `<head>` 區塊的 `<script type="application/ld+json">`。這是給 Google 爬蟲讀取的格式。

- **`featureList`**: 一個清單陣列，用來列出應用程式的核心功能點。

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Markdown Live Previewer",
  "description": "[在此填入新的功能摘要]",
  "featureList": [
    "即時同步滾動預覽",
    "Mermaid 圖表渲染",
    "[在此新增更多功能...]"
  ]
}
```

## 3. 更新 `sr-only` 靜態內容 (關鍵點)
位於 `<body>` 區塊最上方，`#root` 內部的 `<div class="sr-only">`。
**這對於單頁應用 (SPA) 尤其重要**，因為 JS 載入前爬蟲主要看這裡。

- 加入新的 `<li>` 項目來描述新功能。
- 確保關鍵字（如：Mermaid, LaTeX, PDF 導出）包含在文字中。

## 4. 更新 Sitemap
每次有重大更新或新增子頁面（若有的話）時，請手動修改 `public/sitemap.xml` 中的 `<lastmod>` 為當前日期，這能主動告訴 Google 內容已更新。

---
> [!TIP]
> 建議在每次 Git Commit 並部署後，手動前往 [Google Search Console](https://search.google.com/search-console) 點擊「索取索引」，這能縮短搜尋結果更新的時間。


