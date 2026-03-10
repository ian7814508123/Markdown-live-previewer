%% width: 80%
graph TD
    Start(("開始")) --> Node1["方塊節點"]
    Node1 --> Cond{"決策判斷"}
    Cond -->|Yes| End((("結束")))
    Cond -->|No| Sub[("資料庫系統")]
    Sub --> Node1
