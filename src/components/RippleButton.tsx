import React, { useRef, useCallback } from 'react';

type ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text' | 'icon';

interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    /** 覆蓋 ripple 波紋顏色，預設由 variant 決定 */
    rippleColor?: string;
    children: React.ReactNode;
}

/**
 * MD3 風格按鈕，內建 Ripple 波紋效果。
 *
 * Variants:
 *  - filled   : 實心主色（最強調）
 *  - tonal    : 半透明主色填充（次強調）
 *  - outlined : 外框線條
 *  - text     : 純文字
 *  - icon     : 純圖示，正方形
 */
const RippleButton: React.FC<RippleButtonProps> = ({
    variant = 'text',
    rippleColor,
    className = '',
    children,
    onMouseDown,
    ...rest
}) => {
    const ref = useRef<HTMLButtonElement>(null);

    const createRipple = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        const btn = ref.current;
        if (!btn) return;

        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        const wave = document.createElement('span');
        wave.className = 'md-ripple-wave';
        wave.style.width = `${size}px`;
        wave.style.height = `${size}px`;
        wave.style.left = `${x}px`;
        wave.style.top = `${y}px`;
        if (rippleColor) wave.style.color = rippleColor;

        btn.appendChild(wave);
        wave.addEventListener('animationend', () => wave.remove(), { once: true });

        onMouseDown?.(e);
    }, [onMouseDown, rippleColor]);

    // ── Variant 對應的 Tailwind class ──────────────────────
    const BASE = 'md-ripple-root inline-flex items-center justify-center gap-2 font-semibold transition-colors duration-150 select-none disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/70';

    const VARIANTS: Record<ButtonVariant, string> = {
        filled:
            'rounded-full px-5 py-2.5 text-sm bg-indigo-600 text-white hover:bg-indigo-500 dark:hover:bg-indigo-500 active:bg-indigo-700 shadow-sm hover:shadow-md [&_.md-ripple-wave]:text-white/30',
        tonal:
            'rounded-full px-5 py-2.5 text-sm bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-white/10 active:bg-indigo-200 [&_.md-ripple-wave]:text-indigo-600/20',
        outlined:
            'rounded-full px-5 py-2.5 text-sm border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 active:bg-slate-200 [&_.md-ripple-wave]:text-slate-700/15',
        text:
            'rounded-xl px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 active:bg-slate-200 [&_.md-ripple-wave]:text-slate-700/15',
        icon:
            'rounded-full w-10 h-10 p-0 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 active:bg-slate-200 [&_.md-ripple-wave]:text-slate-700/20',
    };

    return (
        <button
            ref={ref}
            className={`${BASE} ${VARIANTS[variant]} ${className}`}
            onMouseDown={createRipple}
            {...rest}
        >
            {children}
        </button>
    );
};

export default RippleButton;
