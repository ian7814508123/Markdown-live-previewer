import { useState, useEffect, useCallback } from 'react';

/**
 * 持久化圖表尺寸設定 Hook：將縮放、寬度與高度存入 localStorage
 * @param storageKey localStorage 的 key 值
 * @param initialWidth 初始寬度（預設 '100%'）
 * @param initialScale 初始縮放比例（預設 1）
 */
export function usePersistentCanvasSettings(storageKey: string, initialWidth: string = '100%', initialScale: number = 1) {
    const [settings, setSettings] = useState(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            return saved ? JSON.parse(saved) : { width: initialWidth, height: 'auto', scale: initialScale };
        } catch {
            return { width: initialWidth, height: 'auto', scale: initialScale };
        }
    });

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(settings));
    }, [settings, storageKey]);

    const updateWidth = useCallback((w: string) => setSettings((s: any) => ({ ...s, width: w })), []);
    const updateHeight = useCallback((h: string) => setSettings((s: any) => ({ ...s, height: h })), []);
    const updateScale = useCallback((sc: number) => setSettings((s: any) => ({ ...s, scale: sc })), []);
    const reset = useCallback(() => setSettings({ width: initialWidth, height: 'auto', scale: initialScale }), [initialWidth, initialScale]);

    return { ...settings, updateWidth, updateHeight, updateScale, reset };
}
