# Markdown 文法指南

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

或者查看我們的 [Mermaid 圖表教學](doc:mermaid)

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
