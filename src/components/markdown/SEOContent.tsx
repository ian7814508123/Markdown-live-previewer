import React from 'react';

/**
 * SEO Accessibility Content Component
 * 
 * 這個隱藏的內容區域專為搜尋引擎爬蟲和螢幕閱讀器設計。
 * 它提供豐富的文字描述，幫助 Google 理解應用程式的功能和內容。
 * 
 * 對於單頁應用(SPA)特別重要，因為 JavaScript 加載前爬蟲主要看這裡。
 */
const SEOContent: React.FC = () => {
  return (
    <div className="sr-only" role="main" aria-label="Markdown 編輯器主要區域">
      <h1>Markdown Live Previewer - 專業在線 Markdown 編輯器與圖表工具</h1>

      <h2>關於 Markdown Live Previewer</h2>
      <p>
        Markdown Live Previewer 是一款功能完整的在線 Markdown 編輯器，提供實時預覽、
        多種導出格式支持以及進階編輯功能。該應用程式完全運行在瀏覽器端，無需上傳到雲端，
        確保用戶數據隱私和安全。
      </p>

      <h2>核心功能模塊</h2>

      <h3>1. Markdown 編輯與預覽</h3>
      <ul>
        <li>實時同步滾動預覽 - 在編輯 Markdown 時實時看到渲染結果</li>
        <li>支持完整的 GFM (GitHub Flavored Markdown) 語法</li>
        <li>代碼高亮顯示 - 支持多種程式語言語法著色</li>
        <li>表格支持 - 輕松創建和格式化 Markdown 表格</li>
        <li>任務列表 - 支持可交互的任務追蹤列表</li>
      </ul>

      <h3>2. Mermaid 圖表渲染</h3>
      <p>支持以下 Mermaid 圖表類型：</p>
      <ul>
        <li>流程圖 (Flowchart) - 描述業務流程和工作流</li>
        <li>時序圖 (Sequence Diagram) - 展示系統交互和消息順序</li>
        <li>甘特圖 (Gantt Chart) - 項目時間表和里程碑規劃</li>
        <li>類圖 (Class Diagram) - 面向對象的結構設計</li>
        <li>狀態圖 (State Diagram) - 系統狀態和轉換</li>
        <li>實體關係圖 (ER Diagram) - 數據庫架構設計</li>
        <li>用戶旅程圖 (User Journey) - 用戶行為路徑分析</li>
      </ul>
      <p>所有圖表支持多種主題切換，包括默認、中立、深色和森林主題。</p>

      <h3>3. LaTeX 數學公式與科學符號</h3>
      <ul>
        <li>行內數學公式 - 在文本中嵌入數學表達式</li>
        <li>塊級數學公式 - 獨立行展示複雜公式</li>
        <li>化學符號支持 - 使用 SMILES 表示法表示化學結構</li>
        <li>高級數學符號 - 支持 AMS 和 HTML 數學擴展包</li>
        <li>自訂巨集 - 用戶可定義自訂 LaTeX 巨集</li>
      </ul>

      <h3>4. Vega-Lite 數據可視化</h3>
      <ul>
        <li>交互式圖表 - 創建響應式和可交互的數據可視化</li>
        <li>多種圖表類型 - 柱狀圖、折線圖、散點圖、熱力圖等</li>
        <li>數據轉換 - 在圖表中直接轉換和聚合數據</li>
        <li>主題定制 - 根據需要自訂圖表外觀</li>
      </ul>

      <h3>5. WikiLinks 雙向連結</h3>
      <ul>
        <li>雙向連結支持 - 使用 [[文檔名]] 語法創建文檔間連結</li>
        <li>自動創建文檔 - 連結不存在的文檔時自動創建</li>
        <li>反向連接追蹤 - 查看哪些文檔連結到當前文檔</li>
        <li>知識圖譜 - 構建個人或團隊知識庫</li>
      </ul>

      <h2>文件導出與轉換</h2>
      <p>Markdown Live Previewer 支持多種導出格式：</p>
      <ul>
        <li>PDF 導出 - 高質量的便攜式文檔格式，完美用於打印和分享</li>
        <li>PNG 導出 - 光柵圖像格式，適合網絡發布和演示</li>
        <li>SVG 導出 - 矢量圖形格式，支持無損縮放</li>
        <li>JPG 導出 - 壓縮圖像格式，文件大小較小</li>
        <li>Markdown 導出 - 原始 Markdown 格式，便於版本控制</li>
      </ul>

      <h2>進階工具與功能</h2>

      <h3>PDF 管理工具</h3>
      <ul>
        <li>PDF 合併 - 將多個 PDF 文件合併為一個</li>
        <li>頁面重新排序 - 調整 PDF 頁面順序</li>
        <li>內建 PDF 查看器 - 直接在應用中查看和管理 PDF</li>
      </ul>

      <h3>Excel 到 Markdown 轉換</h3>
      <ul>
        <li>表格導入 - 將 Excel 文件轉換為 Markdown 表格</li>
        <li>格式保留 - 自動保留單元格格式和內容</li>
        <li>快速編輯 - 轉換後可直接在編輯器中修改</li>
      </ul>

      <h3>圖片上傳與優化</h3>
      <ul>
        <li>本地上傳 - 從計算機上傳圖片文件</li>
        <li>自動優化 - 智能壓縮和轉換圖片格式</li>
        <li>嵌入支持 - 將圖片嵌入到 Markdown 文檔中</li>
        <li>隱私保護 - 所有圖片處理都在本地進行</li>
      </ul>

      <h3>字數統計與分析</h3>
      <ul>
        <li>實時統計 - 顯示字數、單詞數、行數、段落數</li>
        <li>深度分析 - 不同語言的字數計算支持</li>
        <li>讀取時間估計 - 根據內容估計閱讀時間</li>
      </ul>

      <h2>編輯器特性</h2>
      <ul>
        <li>代碼鏡像編輯器 - 基於 CodeMirror 6 的專業編輯體驗</li>
        <li>標籤式編輯 - 同時打開並編輯多個文檔</li>
        <li>文檔分組 - 使用資料夾組織和管理文檔</li>
        <li>本地存儲 - 使用瀏覽器 IndexedDB 持久化存儲</li>
        <li>歷史記錄 - 查看和回復文檔編輯歷史</li>
        <li>快捷鍵支持 - 提高編輯效率的鍵盤快捷鍵</li>
      </ul>

      <h2>用戶界面與體驗</h2>
      <ul>
        <li>深色模式 - 支持淺色和深色主題，保護視力</li>
        <li>響應式設計 - 完美適配桌面、平板和手機</li>
        <li>直覺式界面 - 易於使用的用戶界面，最小化學習曲線</li>
        <li>快捷操作 - 常用功能的快速訪問按鈕</li>
        <li>拖放支持 - 直觀的拖放交互體驗</li>
      </ul>

      <h2>數據安全與隱私</h2>
      <ul>
        <li>完全本地運行 - 所有處理都在瀏覽器中完成，無服務器上傳</li>
        <li>無雲存儲 - 數據完全存儲在本地設備，不依賴云服務</li>
        <li>隱私優先 - 不收集用戶信息或分析數據</li>
        <li>開源代碼 - 源代碼公開透明，社區可審計</li>
        <li>無廣告追蹤 - 不使用第三方跟蹤或分析</li>
      </ul>

      <h2>適用場景與用戶</h2>

      <h3>軟件開發者與技術寫手</h3>
      <p>編寫技術文檔、API 文檔、README 文件、項目設計文檔等。</p>

      <h3>學生與教育工作者</h3>
      <p>筆記記錄、論文撰寫、研究文檔、教學材料準備。</p>

      <h3>博客作者與內容創作者</h3>
      <p>文章撰寫、內容規劃、發布前預覽、多格式導出。</p>

      <h3>數據分析師與業務人士</h3>
      <p>數據報告生成、業務分析文檔、演示文稿準備。</p>

      <h3>產品經理與項目經理</h3>
      <p>需求文檔、項目規劃、時間表管理、決策文檔。</p>

      <h3>設計師與 UX 專家</h3>
      <p>設計稿描述、用戶流程文檔、標註和評論。</p>

      <h3>研究人員與學術界</h3>
      <p>研究筆記、論文初稿、數學公式撰寫、圖表繪製。</p>

      <h2>技術架構與框架</h2>
      <ul>
        <li>構建技術 - 使用 Vite 進行快速構建和開發</li>
        <li>前端框架 - React 18 及現代 JavaScript/TypeScript</li>
        <li>編輯器 - CodeMirror 6 提供強大的代碼編輯功能</li>
        <li>圖表渲染 - Mermaid.js 用於 UML 和流程圖</li>
        <li>數學公式 - MathJax 4 支持 LaTeX 和化學符號</li>
        <li>數據可視化 - Vega-Lite 用於互動式圖表</li>
        <li>樣式系統 - Tailwind CSS 提供現代化設計</li>
        <li>存儲方案 - IndexedDB 用於大容量本地存儲</li>
      </ul>

      <h2>支持的輸入格式</h2>
      <ul>
        <li>Markdown (.md) - 標準 Markdown 文件格式</li>
        <li>Mermaid (.mmd) - 圖表定義文件</li>
        <li>文本文件 (.txt) - 純文本格式</li>
        <li>Excel 文件 (.xlsx, .csv) - 表格數據轉換</li>
        <li>圖片格式 (.jpg, .png, .svg, .gif) - 圖片上傳和優化</li>
        <li>PDF 文件 - PDF 查看和合併</li>
      </ul>

      <h2>支持的輸出格式</h2>
      <ul>
        <li>PDF Document - 可打印的高質量文檔</li>
        <li>PNG Image - 便於共享的光柵圖像</li>
        <li>SVG Vector - 無損縮放的矢量圖形</li>
        <li>JPG Image - 壓縮的圖像格式</li>
        <li>Markdown File - 原始 Markdown 文本</li>
      </ul>

      <h2>主題和自訂選項</h2>
      <ul>
        <li>編輯器主題 - 支持多種顏色方案（深色、淺色等）</li>
        <li>圖表主題 - Default、Neutral、Dark、Forest 四種主題</li>
        <li>字體選擇 - 代碼編輯區支持等寬字體</li>
        <li>排版設置 - 自訂行高、縮進、字號等</li>
        <li>打印設置 - 紙張大小、方向、邊距等打印參數</li>
      </ul>

      <h2>免費與開源</h2>
      <p>
        Markdown Live Previewer 完全免費使用，無隱藏費用或訂閱要求。
        這是一個開源項目，源代碼托管在 GitHub，歡迎社區貢獻和改進。
      </p>

      <h2>性能與兼容性</h2>
      <ul>
        <li>快速加載 - 優化的包大小和懶加載技術</li>
        <li>流暢性能 - 高效的渲染和更新機制</li>
        <li>跨瀏覽器支持 - 支持所有現代主流瀏覽器</li>
        <li>離線能力 - 首次加載後可離線工作</li>
        <li>設備兼容 - 完美支持桌面、平板和移動設備</li>
      </ul>

      <h2>快速開始指南</h2>
      <ol>
        <li>訪問應用 - 在瀏覽器中打開 Markdown Live Previewer</li>
        <li>開始編輯 - 在左側編輯器中輸入或粘貼內容</li>
        <li>實時預覽 - 右側自動顯示渲染結果</li>
        <li>導出內容 - 點擊導出按鈕選擇所需格式</li>
        <li>保存文檔 - 應用自動保存到本地存儲</li>
      </ol>

      <h2>常見用途示例</h2>
      <ul>
        <li>從 Excel 轉換表格到 Markdown 文檔中</li>
        <li>使用 Mermaid 繪製系統架構圖</li>
        <li>編寫包含數學公式的科學論文</li>
        <li>創建支持圖表的 README 文件</li>
        <li>生成多種格式的最終文檔</li>
        <li>維護組織化的文檔知識庫</li>
        <li>合併多個 PDF 文件</li>
      </ul>

      <h2>關鍵特點總結</h2>
      <p>
        Markdown Live Previewer 是一個功能豐富、隱私優先、完全免費的在線編輯工具。
        無論您是開發者、學生、作家還是數據分析師，都能找到合適的功能。
        所有數據都保存在本地，無需擔心隱私問題。立即開始使用，提高您的編輯和文檔製作效率！
      </p>

      <h2>開發者信息</h2>
      <p>
        由 Huang Jyun Ying 開發並維護。
        這個項目是開源的，歡迎在 GitHub 上提交問題報告和功能請求。
      </p>
    </div>
  );
};

export default SEOContent;
