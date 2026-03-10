import React, { useEffect } from 'react';
import { Lock, Heart, ShieldCheck } from 'lucide-react';
import RippleButton from './RippleButton';

interface AdWallProps {
    onUnlock: () => void;
}

const AdWall: React.FC<AdWallProps> = ({ onUnlock }) => {
    // 當 AdWall 顯示時，手動觸發 AdSense 廣告載入
    useEffect(() => {
        try {
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        } catch (e) {
            console.error("AdSense push error:", e);
        }
    }, []);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-500">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl overflow-hidden border border-white/10 flex flex-col items-center p-8 text-center">
                <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                    <Lock size={40} className="animate-pulse" />
                </div>

                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">
                    支持開發者，繼續使用
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
                    為了維持伺服器運作與功能更新，<br />
                    請觀看下方廣告以解鎖接下來 <span className="font-bold text-indigo-500">10 小時</span> 的使用權限。
                </p>

                {/* 廣告佔位單元 */}
                <div className="w-full bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 mb-8 border border-dashed border-slate-200 dark:border-slate-700 min-h-[250px] flex items-center justify-center relative">
                    <ins className="adsbygoogle"
                        style={{ display: 'block' }}
                        data-ad-client="ca-pub-8170892352848798"
                        data-ad-slot="1864612249"
                        data-ad-format="auto"
                        data-full-width-responsive="true"></ins>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20">
                        <Heart className="mb-2 text-rose-500" />
                        <span className="text-[10px] uppercase font-bold tracking-widest">廣告載入中...</span>
                    </div>
                </div>

                <RippleButton
                    variant="filled"
                    onClick={onUnlock}
                    className="w-full py-4 rounded-2xl text-lg font-bold flex items-center justify-center gap-3 active:scale-95 transition-transform"
                >
                    <ShieldCheck size={24} />
                    已點擊廣告，立即解鎖
                </RippleButton>

                <p className="mt-4 text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                    感謝您的支持！
                </p>
            </div>
        </div>
    );
};

export default AdWall;
