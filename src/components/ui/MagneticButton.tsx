import React from 'react';
import { motion } from 'framer-motion';
import { useMagneticEffect, UseMagneticEffectOptions } from '../../hooks/useMagneticEffect';
import RippleButton from './RippleButton';

/**
 * MagneticButton Props。
 * 繼承所有 RippleButton 的 Props，並額外接受磁力參數。
 */
interface MagneticButtonProps extends React.ComponentPropsWithoutRef<typeof RippleButton> {
    /** 磁力效果參數（可選，有合理預設值） */
    magneticOptions?: UseMagneticEffectOptions;
    /** 是否停用磁力效果（例如行動裝置或偏好減少動畫的使用者） */
    disableMagnetic?: boolean;
}

/**
 * 磁力按鈕元件。
 *
 * 在 RippleButton 外層包裹一個帶有 spring 動畫的 motion.div，
 * 讓按鈕在滑鼠靠近時產生向游標「傾斜吸附」的物理拉力感。
 *
 * @example
 * ```tsx
 * // 基本用法（預設磁力強度）
 * <MagneticButton variant="filled" onClick={handleClick}>
 *   下載
 * </MagneticButton>
 *
 * // 自訂磁力參數
 * <MagneticButton
 *   variant="icon"
 *   magneticOptions={{ maxOffset: 6, radius: 40 }}
 * >
 *   <Settings size={20} />
 * </MagneticButton>
 * ```
 */
const MagneticButton: React.FC<MagneticButtonProps> = ({
    magneticOptions,
    disableMagnetic = false,
    ...rippleButtonProps
}) => {
    const { x, y, handlers } = useMagneticEffect(magneticOptions);

    // 停用磁力時直接渲染 RippleButton（不引入 motion 層）
    if (disableMagnetic) {
        return <RippleButton {...rippleButtonProps} />;
    }

    return (
        <motion.div
            style={{
                x,
                y,
                display: 'inline-flex',
                // 透過 perspective 讓位移更有 3D 拉力感
                perspective: 400,
            }}
            {...handlers}
        >
            <RippleButton {...rippleButtonProps} />
        </motion.div>
    );
};

export default MagneticButton;
