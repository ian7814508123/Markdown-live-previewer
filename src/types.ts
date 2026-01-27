/**
 * 文檔記錄型別
 */
export interface DocumentRecord {
    id: string;                          // UUID
    name: string;                        // 使用者自訂名稱
    mode: 'markdown' | 'mermaid';        // 文檔類型
    content: string;                     // 編輯內容
    createdAt: number;                   // 建立時間戳
    updatedAt: number;                   // 最後修改時間戳
}

/**
 * 應用狀態型別
 */
export interface AppState {
    currentDocId: string | null;         // 當前編輯的文檔 ID
    documents: DocumentRecord[];          // 所有文檔列表
}
