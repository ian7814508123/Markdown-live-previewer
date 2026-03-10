stateDiagram-v2
    [*] --> Idle
    Idle --> Loading: 點擊按鈕
    Loading --> Success: 下載完成
    Loading --> Error: 發生異常
    Error --> Idle: 重試
    Success --> [*]
