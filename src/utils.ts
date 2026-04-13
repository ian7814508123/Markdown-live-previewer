// ─── 輔助函式：簡單的字串雜湊 ──────────────────────────────────────────────────
// 用於生成基於內容的穩定 Key，防止 React 在內容未變時重新掛載組件
export const hashString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
};
