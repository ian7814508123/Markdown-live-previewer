import React from 'react';
import { motion } from 'framer-motion';
import { useMagneticEffect, UseMagneticEffectOptions } from '../../hooks/useMagneticEffect';

interface MagneticWrapperProps {
    children: React.ReactNode;
    /** 磁力參數（可選，有合理預設值） */
    options?: UseMagneticEffectOptions;
    /** 停用磁力（例如偏好減少動畫的使用者） */
    disabled?: boolean;
    /** 傳遞給外層 motion.div 的 className */
    className?: string;
    /** 傳遞給外層 motion.div 的 style */
    style?: React.CSSProperties;
}

/**
 * 通用磁力包裝元件。
 *
 * 在任意子元素外層加上 spring 磁力位移效果，
 * 不限定子元素必須是 RippleButton 或 MagneticButton。
 *
 * 最適合「Switch / Toggle」類型的選項按鈕，
 * 例如 ToggleGroup（紙張尺寸、方向、邊距...），
 * 讓使用者在掃描選項時透過手感引導感受每個選項的「重量」。
 *
 * @example
 * ```tsx
 * // 包裝任意按鈕
 * <MagneticWrapper options={{ maxOffset: 8, radius: 50 }}>
 *   <button className="...">A4</button>
 * </MagneticWrapper>
 *
 * // 包裝整個 label（toggle switch）
 * <MagneticWrapper options={{ maxOffset: 5, radius: 60 }}>
 *   <label>...</label>
 * </MagneticWrapper>
 * ```
 */
const MagneticWrapper: React.FC<MagneticWrapperProps> = ({
    children,
    options,
    disabled = false,
    className,
    style,
}) => {
    const { x, y, handlers } = useMagneticEffect(options);

    // 停用時直接透傳，不引入 motion 層
    if (disabled) {
        return <>{children}</>;
    }

    return (
        <motion.div
            style={{ x, y, display: 'inline-flex', ...style }}
            className={className}
            {...handlers}
        >
            {children}
        </motion.div>
    );
};

export default MagneticWrapper;
