import { useState, useEffect, useCallback } from 'react';

/**
 * 持久化圖表尺寸設定 Hook：將寬度、對齊方式等存入 localStorage
 * @param storageKey localStorage 的 key 值
 * @param initialWidth 初始寬度（預設 '100%'）
 * @param initialAlign 初始對齊方式（預設 'center'）
 */
export function usePersistentCanvasSettings(storageKey: string, initialWidth: string = '100%', initialAlign: string = 'center') {
    const [settings, setSettings] = useState(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            const parsed = saved ? JSON.parse(saved) : {};
            return {
                width: parsed.width || initialWidth,
                align: parsed.align || initialAlign,
                height: parsed.height || 'auto',
                scale: parsed.scale || 1
            };
        } catch {
            return { width: initialWidth, align: initialAlign, height: 'auto', scale: 1 };
        }
    });

    // 當 storageKey 改變時（例如切換了不同的圖表代碼），同步更新 state
    useEffect(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            const parsed = saved ? JSON.parse(saved) : {};
            setSettings({
                width: parsed.width || initialWidth,
                align: parsed.align || initialAlign,
                height: parsed.height || 'auto',
                scale: parsed.scale || 1
            });
        } catch (err) {
            setSettings({ width: initialWidth, align: initialAlign, height: 'auto', scale: 1 });
        }
    }, [storageKey, initialWidth, initialAlign]);

    // 當 settings 改變時，寫回 localStorage
    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(settings));
    }, [settings, storageKey]);

    const updateWidth = useCallback((w: string) => {
        setSettings((s: any) => ({ ...s, width: w }));
    }, []);

    const updateAlign = useCallback((a: string) => {
        setSettings((s: any) => ({ ...s, align: a }));
    }, []);

    const reset = useCallback(() => {
        setSettings({ width: initialWidth, align: initialAlign, height: 'auto', scale: 1 });
    }, [initialWidth, initialAlign]);

    return { 
        width: settings.width, 
        align: settings.align, 
        updateWidth, 
        updateAlign, 
        reset 
    };
}
