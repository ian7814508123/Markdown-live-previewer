import React, { useState } from 'react';
import { ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <footer className={`w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-all duration-500 ease-in-out relative z-40 ${isCollapsed ? 'py-2 px-6' : 'py-8 px-6'}`}>
      
      {/* 展開/收合切換按鈕 - 放在右上角或中央 */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -top-3 right-8 p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-sm text-slate-400 hover:text-brand-primary transition-all hover:scale-110 z-50"
        title={isCollapsed ? "展開詳情" : "收合頁腳"}
      >
        {isCollapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      <div className="max-w-7xl mx-auto overflow-hidden">
        
        {/* 展開模式下的豐富內容 */}
        {!isCollapsed && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Left: Branding & Tagline */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <img src="./image/markdown_liveditor.svg?v=2" alt="Logo" className="w-5 h-5" />
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">
                  Markdown Live Previewer
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                專業級線上 Markdown 即時編輯工具，整合 Mermaid 圖表、LaTeX 數學公式與數據視覺化。
                我們堅持<strong>隱私至上</strong>，所有運算與存儲均在使用者本地瀏覽器完成，給您最安全的創作環境。
              </p>
            </div>

            {/* Middle: Feature Links */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">法律資訊</span>
                <a href="/privacy.html" className="text-xs text-slate-600 dark:text-slate-400 hover:text-brand-primary transition-colors flex items-center gap-1">隱私政策 <ExternalLink size={10} /></a>
                <a href="/terms.html" className="text-xs text-slate-600 dark:text-slate-400 hover:text-brand-primary transition-colors flex items-center gap-1">服務條款 <ExternalLink size={10} /></a>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">關於我們</span>
                <a href="/about.html" className="text-xs text-slate-600 dark:text-slate-400 hover:text-brand-primary transition-colors">關於本站</a>
                <a href="https://github.com/HUANGJYUNYING/Markdown-live-previewer" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-600 dark:text-slate-400 hover:text-brand-primary transition-colors">GitHub 原始碼</a>
              </div>
            </div>

            {/* Right: Technical Badges or Extra Text */}
            <div className="hidden lg:block space-y-2">
               <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">技術規格</span>
               <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[9px] text-slate-500 font-bold">Vite 6</span>
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[9px] text-slate-500 font-bold">React 19</span>
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[9px] text-slate-500 font-bold">Tailwind 4</span>
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[9px] text-slate-500 font-bold">IndexedDB Storage</span>
               </div>
               <p className="text-[9px] text-slate-400 dark:text-slate-600 italic">
                  本網站由 Huang Jyun Ying 開發維護，旨在提供純淨的技術創作工具。
               </p>
            </div>
          </div>
        )}

        {/* 底部導覽條 (收合狀態下依然保持可見，確保 AdSense 爬蟲可讀取) */}
        <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 ${!isCollapsed ? 'border-t border-slate-100 dark:border-slate-800/50 pt-6' : ''}`}>
          <div className="flex items-center gap-4">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              © {new Date().getFullYear()} HUANGJYUNYING.
            </p>
            {isCollapsed && (
              <nav className="sm:flex items-center gap-3 hidden border-l border-slate-200 dark:border-slate-700 pl-4 animate-in fade-in duration-300">
                <a href="/privacy.html" className="text-[10px] text-slate-500 hover:text-brand-primary transition-colors font-bold">隱私政策</a>
                <a href="/terms.html" className="text-[10px] text-slate-500 hover:text-brand-primary transition-colors font-bold">服務條款</a>
                <a href="/about.html" className="text-[10px] text-slate-500 hover:text-brand-primary transition-colors font-bold">關於我們</a>
              </nav>
            )}
          </div>
          
          <div className="flex items-center gap-3">
             <span className="hidden sm:inline-block w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></span>
             <p className="text-[10px] text-slate-400 dark:text-slate-600 font-black uppercase tracking-tighter italic">
                Local-First • Privacy Focused • High Performance
             </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
