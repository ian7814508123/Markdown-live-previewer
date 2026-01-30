---
title: Mermaid 語法與樣式全攻略 (Cheat Sheet)
---
%% width: 80%
graph TD
    %% ==========================================
    %% 1. 基礎節點語法 (Node Syntax)
    %% 修正重點：文字內容全部加上雙引號 "" 以避免解析錯誤
    %% ==========================================
    
    Start(("Start<br/>(圓形)")) --> Node1["<b>標準矩形</b><br/>支援換行"]
    Node1 --> Node2("圓角矩形")
    Node2 --> Node3{"決策<br/>(菱形)"}
    
    %% 這裡就是原本報錯的地方，加上引號就修好了
    Node3 -->|Yes| Node4[/"平行四邊形<br/>(輸入/輸出)"/]
    
    Node3 -->|No| Node5[("資料庫<br/>Database")]
    Node4 --> Node6{{"六角形<br/>(準備/迴圈)"}}
    Node6 --> End((("雙圈<br/>(結束)")))

    %% ==========================================
    %% 2. 連線樣式 (Link Styles)
    %% ==========================================
    
    Node1 -.->|"虛線 (.-)"| Node3
    Node4 ==>|"粗線 (==)"| End
    Node5 --o|"圓頭 (o)"| Node2
    Node5 --x|"叉頭 (x)"| Node6

    %% ==========================================
    %% 3. 子圖表 (Subgraphs) - 用於分組
    %% ==========================================

    subgraph Group1 [📂 後端處理區]
        direction TB
        %% 這裡面的節點會被框在一起
        API["API 接口"] --> Auth{"驗證身分"}
        Auth -->|Pass| DB[("User DB")]
    end

    Node2 --> API

    %% ==========================================
    %% 4. 進階樣式定義 (ClassDef & Styles)
    %% 語法：classDef [樣式名] fill:[色碼],stroke:[色碼],color:[文字色]
    %% ==========================================

    %% 定義三種通用樣式
    classDef blueStyle fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#000
    classDef redStyle fill:#ffebee,stroke:#c62828,stroke-width:2px,stroke-dasharray: 5 5,color:#c62828
    classDef greenStyle fill:#e8f5e9,stroke:#2e7d32,stroke-width:4px,rx:10,ry:10

    %% 套用樣式
    class Node1,API blueStyle
    class Node3,Auth redStyle
    
    %% 直接在節點後用 ::: 套用
    SpecialNode["🚀 快速套用樣式"]:::greenStyle
    
    End --> SpecialNode

    %% ==========================================
    %% 5. 特殊排版與 HTML Hacks
    %% ==========================================

    %% 技巧：隱藏連結 (~~~) 用來調整上下位置但不畫線
    Group1 ~~~ FooterNote

    %% 技巧：使用 div 與 HTML 標籤來排版複雜文字
    %% 注意：classDef noteStyle 設為無邊框
    FooterNote["
    <div style='width:300px; text-align:left; color:#666;'>
      💡 <b>語法Tips：</b><br/>
      1. 換行請用 <code>&lt;br/&gt;</code><br/>
      2. 隱形連結使用 <code>~~~</code> 可調整版面<br/>
      3. 文字包在 <code>&quot;&quot;</code> 內才支援特殊符號
    </div>
    "]:::noteStyle

    %% 定義隱形樣式
    classDef noteStyle fill:none,stroke:none
    
    %% 連線樣式 (linkStyle)
    linkStyle 0 stroke:#ff9800,stroke-width:4px;
