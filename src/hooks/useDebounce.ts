import { useState, useEffect } from 'react';

/**
 * 通用防抖 Hook：延遲更新值，適用於需要避免高頻觸發的場景
 * @param value 需要防抖的值
 * @param delay 延遲毫秒數
 * @returns 經過防抖處理後的穩定值
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
}
