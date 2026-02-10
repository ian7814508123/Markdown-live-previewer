import { useState, useEffect } from 'react';

const SETTINGS_KEY = 'mermaid-lens-settings';

export interface AppSettings {
    customMacros: Record<string, string | [string, number]>;
}

const DEFAULT_SETTINGS: AppSettings = {
    customMacros: {
        // 常用數學集合
        "RR": "{\\mathbb{R}}",           // 實數集
        "NN": "{\\mathbb{N}}",           // 自然數集
        "ZZ": "{\\mathbb{Z}}",           // 整數集
        "QQ": "{\\mathbb{Q}}",           // 有理數集
        "CC": "{\\mathbb{C}}",           // 複數集

        // 文字樣式
        "bold": ["{\\mathbf{#1}}", 1],   // 粗體

        // 微分相關
        "dd": "{\\mathrm{d}}",           // 微分符號 d
        "dv": ["{\\frac{\\mathrm{d} #1}{\\mathrm{d} #2}}", 2],  // 導數 d/dx
        "pdv": ["{\\frac{\\partial #1}{\\partial #2}}", 2],     // 偏導數 ∂/∂x

        // 括號類
        "norm": ["{\\left\\| #1 \\right\\|}", 1],     // 範數 ||x||
        "abs": ["{\\left| #1 \\right|}", 1],          // 絕對值 |x|
        "set": ["{\\left\\{ #1 \\right\\}}", 1],      // 集合 {x}
        "paren": ["{\\left( #1 \\right)}", 1],        // 括號 (x)
        "bracket": ["{\\left[ #1 \\right]}", 1],      // 方括號 [x]
        "angle": ["{\\left\\langle #1 \\right\\rangle}", 1],  // 角括號 ⟨x⟩

        // 向量與矩陣
        "vect": ["{\\mathbf{#1}}", 1],               // 向量粗體
        "mat": ["{\\mathbf{#1}}", 1],                // 矩陣粗體
    }
};

export function useAppSettings() {
    const [settings, setSettings] = useState<AppSettings>(() => {
        try {
            const stored = localStorage.getItem(SETTINGS_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Migration: Remove backslashes from macro keys if they exist
                if (parsed.customMacros) {
                    const newMacros: Record<string, any> = {};
                    let hasChanges = false;

                    Object.entries(parsed.customMacros).forEach(([key, value]) => {
                        if (key.startsWith('\\')) {
                            newMacros[key.substring(1)] = value;
                            hasChanges = true;
                        } else {
                            newMacros[key] = value;
                        }
                    });

                    if (hasChanges) {
                        return { ...DEFAULT_SETTINGS, ...parsed, customMacros: newMacros };
                    }
                }
                return { ...DEFAULT_SETTINGS, ...parsed };
            }
            return DEFAULT_SETTINGS;
        } catch (error) {
            console.error('Failed to load settings:', error);
            return DEFAULT_SETTINGS;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }, [settings]);

    const updateMacros = (newMacros: Record<string, string | [string, number]>) => {
        setSettings(prev => ({ ...prev, customMacros: newMacros }));
    };

    const restoreDefaults = () => {
        setSettings(DEFAULT_SETTINGS);
    };

    return {
        settings,
        updateMacros,
        restoreDefaults
    };
}
