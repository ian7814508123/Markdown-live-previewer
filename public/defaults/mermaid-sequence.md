sequenceDiagram
    participant User as 使用者
    participant App as 應用程式
    participant DB as 資料夾/資料庫

    User->>App: 發送請求 (Request)
    App->>DB: 查詢數據
    DB-->>App: 返回資料 (Response)
    App-->>User: 顯示結果
