import React, { useRef, useCallback } from 'react';

type ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text' | 'icon';

interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    /** 覆蓋 ripple 波紋顏色（CSS color string），預設由 variant 決定 */
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

/** 每個 variant 預設的 ripple 顏色 */
const RIPPLE_COLORS: Record<string, string> = {
    filled: 'rgba(255,255,255,0.28)',
    tonal: 'rgba(0, 65, 106, 0.18)',
    outlined: 'rgba(100,116,139,0.14)',
    text: 'rgba(100,116,139,0.14)',
    icon: 'rgba(100,116,139,0.18)',
};

const ANIMATION_DURATION = 550; // ms，與 @keyframes md-ripple 一致

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

        const color = rippleColor ?? RIPPLE_COLORS[variant] ?? 'rgba(100,116,139,0.16)';

        const wave = document.createElement('span');

        // ── 直接用 inline style，不依賴外部 CSS class ────────
        Object.assign(wave.style, {
            position: 'absolute',
            borderRadius: '50%',
            pointerEvents: 'none',
            width: `${size}px`,
            height: `${size}px`,
            left: `${x}px`,
            top: `${y}px`,
            backgroundColor: color,
            transform: 'scale(0)',
            opacity: '0.9',
            animation: `md-ripple ${ANIMATION_DURATION}ms cubic-bezier(0.4,0,0.2,1) forwards`,
        });

        btn.appendChild(wave);

        // 雙重清理：animationend + setTimeout 保底（production 中 animationend 可能不觸發）
        const cleanup = () => {
            if (wave.parentNode === btn) btn.removeChild(wave);
        };
        wave.addEventListener('animationend', cleanup, { once: true });
        setTimeout(cleanup, ANIMATION_DURATION + 100);

        onMouseDown?.(e);
    }, [onMouseDown, rippleColor, variant]);

    // ── Variant 對應的 Tailwind class ──────────────────────
    const BASE = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 select-none disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/70 [transition-timing-function:var(--m3-easing-standard)]';

    const VARIANTS: Record<ButtonVariant, string> = {
        filled:
            'rounded-full px-5 py-2.5 text-sm bg-brand-primary text-white hover:bg-brand-primary/90 active:bg-brand-primary shadow-sm hover:shadow-md',
        tonal:
            'rounded-full px-5 py-2.5 text-sm bg-brand-secondary dark:bg-brand-primary/30 text-brand-primary dark:text-brand-primary hover:bg-brand-secondary/80 dark:hover:bg-brand-primary/40 active:bg-brand-secondary',
        outlined:
            'rounded-full px-5 py-2.5 text-sm border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 active:bg-slate-200',
        text:
            'rounded-xl px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 active:bg-slate-200',
        icon:
            'rounded-full w-10 h-10 p-0 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 active:bg-slate-200',
    };

    return (
        <button
            ref={ref}
            // position:relative + overflow:hidden 直接 inline，不依賴外部 .md-ripple-root CSS
            style={{ position: 'relative', overflow: 'hidden' }}
            className={`${BASE} ${VARIANTS[variant]} ${className}`}
            onMouseDown={createRipple}
            {...rest}
        >
            {children}
        </button>
    );
};

export default RippleButton;
