import { useRef, useCallback } from 'react';
import { useSpring, useMotionValue, MotionValue } from 'framer-motion';

/**
 * 磁力效果 Hook 的回傳值型別。
 * x、y 是 Framer Motion spring MotionValue，可直接傳給 motion.div 的 style。
 */
export interface MagneticEffectResult {
    /** 水平位移的 spring MotionValue（px） */
    x: MotionValue<number>;
    /** 垂直位移的 spring MotionValue（px） */
    y: MotionValue<number>;
    /** 綁定到元素的事件 handlers */
    handlers: {
        onMouseMove: (e: React.MouseEvent<HTMLElement>) => void;
        onMouseLeave: () => void;
    };
}

export interface UseMagneticEffectOptions {
    /**
     * 磁力最大位移量（像素）。
     * 數值越大，按鈕被「拉走」越遠。
     * @default 10
     */
    maxOffset?: number;
    /**
     * 感應半徑（像素）。
     * 滑鼠在此距離內才會觸發磁力。
     * @default 60
     */
    radius?: number;
    /** spring 剛性（stiffness）。越高越彈跳。@default 200 */
    stiffness?: number;
    /** spring 阻尼（damping）。越低越晃動。@default 20 */
    damping?: number;
    /** spring 質量（mass）。越大越有重量感。@default 0.5 */
    mass?: number;
}

/**
 * 磁力按鈕 Hook。
 *
 * 透過偵測滑鼠與元素中心的相對距離，產生彈性位移效果，
 * 讓按鈕「感知」滑鼠的靠近並向其傾斜吸附。
 *
 * @example
 * ```tsx
 * const { x, y, handlers } = useMagneticEffect({ maxOffset: 12 });
 * return (
 *   <motion.div style={{ x, y }} {...handlers}>
 *     <button>Click me</button>
 *   </motion.div>
 * );
 * ```
 */
export function useMagneticEffect({
    maxOffset = 10,
    radius = 60,
    stiffness = 200,
    damping = 20,
    mass = 0.5,
}: UseMagneticEffectOptions = {}): MagneticEffectResult {
    // 原始目標值（不帶 spring）
    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);

    // spring 值：讓位移帶有物理彈力感
    const x = useSpring(rawX, { stiffness, damping, mass });
    const y = useSpring(rawY, { stiffness, damping, mass });

    // 使用 ref 追蹤元素，避免每次 render 重新建立 handler
    const elementRef = useRef<HTMLElement | null>(null);

    const onMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
        const el = e.currentTarget;
        elementRef.current = el;

        const rect = el.getBoundingClientRect();

        // 計算滑鼠相對於元素中心的偏移
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;

        // 計算距離，超出感應半徑則不觸發
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > radius) {
            rawX.set(0);
            rawY.set(0);
            return;
        }

        // 將距離轉換為位移量（越近影響越大）
        const factor = (1 - distance / radius);
        rawX.set(dx * factor * (maxOffset / (rect.width / 2)));
        rawY.set(dy * factor * (maxOffset / (rect.height / 2)));
    }, [rawX, rawY, maxOffset, radius]);

    const onMouseLeave = useCallback(() => {
        // 滑鼠離開時，spring 自動回彈到 0
        rawX.set(0);
        rawY.set(0);
    }, [rawX, rawY]);

    return {
        x,
        y,
        handlers: { onMouseMove, onMouseLeave },
    };
}
