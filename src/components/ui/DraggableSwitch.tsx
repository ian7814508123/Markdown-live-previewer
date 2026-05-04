import React, { useRef, useEffect } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';

interface DraggableSwitchProps {
    /** 當前開關狀態 */
    checked: boolean;
    /**
     * 狀態變更回呼。
     * 點擊 → toggle；拖曳超過 40% 行程 → 依方向 toggle。
     */
    onChange: (newValue: boolean) => void;
    /** 額外的 className（套用到外層 track div） */
    className?: string;
}

/**
 * DraggableSwitch — 同時支援「點擊切換」與「拖曳切換」的 Toggle Switch。
 *
 * 互動方式：
 *  - **點擊 (click)**：切換 ON/OFF（與原生 toggle 相同）
 *  - **向右拖曳 (OFF → ON)**：拖曳超過 40% 行程即觸發
 *  - **向左拖曳 (ON → OFF)**：拖曳超過 40% 行程即觸發
 *
 * 技術重點：
 *  - `useRef` 追蹤 isDragging，不觸發 re-render（避免因父層更新重置狀態）
 *  - `useMotionValue` 驅動 thumb 的即時視覺偏移，與 React state 解耦
 *  - `animate()` 在拖曳結束時讓 thumb spring 歸位
 *  - 點擊 vs 拖曳：位移 > 3px 視為「有意義的拖曳」，否則視為點擊
 *
 * @example
 * ```tsx
 * <DraggableSwitch
 *   checked={settings.showPrintPreview}
 *   onChange={(v) => {
 *     const patch: Partial<PrintSettings> = { showPrintPreview: v };
 *     if (v) patch.scale = 'fit';
 *     onChange(patch);
 *   }}
 * />
 * ```
 */
const DraggableSwitch: React.FC<DraggableSwitchProps> = ({
    checked,
    onChange,
    className = '',
}) => {
    // w-11(44px) track，w-4(16px) thumb，各 4px padding
    // OFF: left=4px, ON: left=24px → TRAVEL = 20px
    const TRAVEL = 20;
    const THRESHOLD = TRAVEL * 0.4; // 40% 行程觸發切換

    const isDraggingRef = useRef(false);
    const hasDraggedRef = useRef(false); // 是否有位移 > 3px
    const startXRef = useRef(0);
    const thumbDxRef = useRef(0); // 拖曳中的即時偏移量（用於 mouseup 判斷）

    // thumbX 驅動 thumb 的 transform:translateX，與 `left` 疊加
    // 平常為 0（由 left 決定位置），拖曳中實時反映偏移
    const thumbX = useMotionValue(0);

    // 全域 mousemove / mouseup（確保游標拖出元素外也能正常工作）
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDraggingRef.current) return;

            const dx = e.clientX - startXRef.current;
            if (Math.abs(dx) > 3) hasDraggedRef.current = true;

            // 限制 thumb 在合理範圍：OFF 時只能向右；ON 時只能向左
            const minDx = checked ? -TRAVEL : 0;
            const maxDx = checked ? 0 : TRAVEL;
            thumbDxRef.current = Math.max(minDx, Math.min(maxDx, dx));
            thumbX.set(thumbDxRef.current);
        };

        const handleMouseUp = () => {
            if (!isDraggingRef.current) return;
            isDraggingRef.current = false;

            if (!hasDraggedRef.current) {
                // 點擊（位移極小）→ 直接 toggle
                onChange(!checked);
            } else {
                // 拖曳結束：判斷是否超過閾值
                const shouldToggle =
                    (!checked && thumbDxRef.current > THRESHOLD) ||
                    (checked && thumbDxRef.current < -THRESHOLD);

                if (shouldToggle) onChange(!checked);
            }

            // 無論結果如何，讓 thumb spring 歸位（left 由 checked 決定，thumbX 歸 0）
            animate(thumbX, 0, { type: 'spring', stiffness: 500, damping: 30 });

            hasDraggedRef.current = false;
            thumbDxRef.current = 0;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [checked, onChange, thumbX, THRESHOLD]);

    return (
        <div
            onMouseDown={(e) => {
                e.preventDefault(); // 防止文字選取
                isDraggingRef.current = true;
                hasDraggedRef.current = false;
                startXRef.current = e.clientX;
                thumbDxRef.current = 0;
                thumbX.set(0);
            }}
            style={{ userSelect: 'none' }}
            className={[
                'w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer select-none',
                checked ? 'bg-brand-primary' : 'bg-slate-200 dark:bg-slate-700',
                className,
            ].join(' ')}
        >
            <motion.div
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                // `left` 決定 OFF/ON 基礎位置，`x` 疊加拖曳的即時偏移
                animate={{ left: checked ? '1.5rem' : '0.25rem' }}
                style={{ x: thumbX, cursor: 'grab' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.6 }}
                // 懸停時輕微放大，拖曳時更顯著，強化「可抓取」感知
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 1.25 }}
            />
        </div>
    );
};

export default DraggableSwitch;
