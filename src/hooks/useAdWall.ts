import { useState, useEffect, useCallback } from 'react';

const AD_WALL_KEY = 'ad_wall_last_unlock';
const UNLOCK_DURATION = 8 * 60 * 8 * 1000; // 10 小時 (毫秒)

export const useAdWall = () => {
    const [isLocked, setIsLocked] = useState(false);

    const checkLockStatus = useCallback(() => {
        const lastUnlock = localStorage.getItem(AD_WALL_KEY);
        if (!lastUnlock) {
            setIsLocked(true);
            return;
        }

        const now = Date.now();
        const lastTime = parseInt(lastUnlock, 10);

        if (now - lastTime > UNLOCK_DURATION) {
            setIsLocked(true);
        } else {
            setIsLocked(false);
        }
    }, []);

    useEffect(() => {
        checkLockStatus();
        // 每一分鐘檢查一次
        const interval = setInterval(checkLockStatus, 60000);
        return () => clearInterval(interval);
    }, [checkLockStatus]);

    const unlock = () => {
        localStorage.setItem(AD_WALL_KEY, Date.now().toString());
        setIsLocked(false);
    };

    return { isLocked, unlock };
};
