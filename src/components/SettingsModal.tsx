import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw, AlertCircle, Check, FileText, Printer, Box, PackagePlus, ChevronLeft } from 'lucide-react';
import RippleButton from './RippleButton';
import { PrintSettings } from '../hooks/useAppSettings';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** 根據當前模式決定顯示哪組設定（markdown → 巨集；mermaid → PDF 版面） */
    mode: 'markdown' | 'mermaid';
    currentMacros: Record<string, string | [string, number]>;
    onSaveMacros: (macros: Record<string, string | [string, number]>) => void;
    onRestoreDefaults: () => void;
    currentPrintSettings: PrintSettings;
    onSavePrintSettings: (patch: Partial<PrintSettings>) => void;
    isStandalone?: boolean;
}

// ── PDF 設定面板 ────────────────────────────────────────────────────────────
const PdfSettingsPanel: React.FC<{
    settings: PrintSettings;
    onChange: (patch: Partial<PrintSettings>) => void;
    isStandalone?: boolean;
}> = ({ settings, onChange, isStandalone }) => {
    const [customScale, setCustomScale] = useState<number>(
        typeof settings.scale === 'number' ? settings.scale : 100
    );

    /** 通用 Toggle Group */
    function ToggleGroup<T extends string | number>({
        label, options, value, onSelect,
    }: {
        label: string;
        options: { label: string; value: T; hint?: string }[];
        value: T;
        onSelect: (v: T) => void;
    }) {
        return (
            <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{label}</p>
                <div className="flex flex-wrap gap-2">
                    {options.map(opt => (
                        <button
                            key={String(opt.value)}
                            onClick={() => onSelect(opt.value)}
                            className={[
                                'flex flex-col items-center px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all active:scale-95',
                                value === opt.value
                                    ? 'bg-brand-secondary dark:bg-brand-primary/40 border-brand-primary/30 dark:border-brand-primary/70 text-brand-primary dark:text-brand-primary shadow-sm'
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-primary/20 dark:hover:border-brand-primary/80',
                            ].join(' ')}
                        >
                            <span>{opt.label}</span>
                            {opt.hint && <span className="text-[9px] opacity-60 mt-0.5 font-medium">{opt.hint}</span>}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="px-6 py-4 space-y-6 bg-slate-50/30 dark:bg-slate-900/30">
            {/* 分組 A：視覺化預覽 */}
            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 bg-brand-secondary/60 dark:bg-brand-primary/30 rounded-lg text-brand-primary"><FileText size={16} /></div>
                    <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">預覽行為</p>
                </div>

                <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-brand-primary transition-colors">顯示列印預覽</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">在編輯器旁模擬紙張邊界與分頁線</span>
                    </div>
                    <div
                        onClick={() => {
                            const nextShow = !settings.showPrintPreview;
                            const patch: Partial<PrintSettings> = { showPrintPreview: nextShow };
                            // 當開啟預覽時，預設切換到 fit 模式以確保使用者能看到完整紙張
                            if (nextShow) patch.scale = 'fit';
                            onChange(patch);
                        }}
                        className={`w-11 h-6 rounded-full transition-all relative ${settings.showPrintPreview ? 'bg-brand-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${settings.showPrintPreview ? 'left-6' : 'left-1'}`} />
                    </div>
                </label>
            </div>


            {/* 分組 C：頁面配置 */}
            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
                <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-500"><Printer size={16} /></div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">頁面佈局參數</p>
                </div>

                <ToggleGroup
                    label="紙張尺寸"
                    options={[
                        { label: 'A4', value: 'A4', hint: '預設' },
                        { label: 'A3', value: 'A3', hint: '大圖' },
                        { label: 'Letter', value: 'Letter', hint: '美制' },
                    ]}
                    value={settings.paperSize}
                    onSelect={(v) => onChange({ paperSize: v as PrintSettings['paperSize'] })}
                />

                <ToggleGroup
                    label="方向"
                    options={[
                        { label: '橫向 ↔', value: 'landscape', hint: 'Landscape' },
                        { label: '直向 ↕', value: 'portrait', hint: 'Portrait' },
                    ]}
                    value={settings.orientation}
                    onSelect={(v) => onChange({ orientation: v as PrintSettings['orientation'] })}
                />

                <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">比例縮放</p>
                    <div className="flex flex-wrap gap-2">
                        {([
                            { label: '符合', value: 'fit' as PrintSettings['scale'], hint: 'Fit' },
                            { label: '100%', value: 'actual' as PrintSettings['scale'], hint: 'Actual' },
                            { label: '自訂', value: customScale as PrintSettings['scale'], hint: `${customScale}%` },
                        ]).map(opt => {
                            const isCustom = typeof opt.value === 'number';
                            const isActive = isCustom ? typeof settings.scale === 'number' : settings.scale === opt.value;
                            return (
                                <button key={String(opt.value)} onClick={() => onChange({ scale: opt.value })}
                                    className={[
                                        'px-3 py-2 rounded-xl border text-xs font-bold transition-all',
                                        isActive
                                            ? 'bg-brand-secondary dark:bg-brand-primary/40 border-brand-primary/20 dark:border-brand-primary/70 text-brand-primary dark:text-brand-primary'
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300',
                                    ].join(' ')}
                                >
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                    {typeof settings.scale === 'number' && (
                        <div className="flex items-center gap-4 pt-1 px-1">
                            <input type="range" min={10} max={200} step={5} value={customScale}
                                onChange={(e) => { const v = Number(e.target.value); setCustomScale(v); onChange({ scale: v }); }}
                                className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                            />
                            <span className="text-xs font-mono font-bold w-12 text-brand-primary">{customScale}%</span>
                        </div>
                    )}
                </div>

                <ToggleGroup
                    label="邊距 (Margins)"
                    options={[
                        { label: '標準', value: 'normal', hint: '1.5cm' },
                        { label: '緊湊', value: 'narrow', hint: '0.5cm' },
                        { label: '無', value: 'none', hint: '0' },
                    ]}
                    value={settings.margin}
                    onSelect={(v) => onChange({ margin: v as PrintSettings['margin'] })}
                />
            </div>

            <div className="rounded-2xl bg-brand-secondary/30 dark:bg-brand-primary/10 px-5 py-4 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed border border-brand-primary/15 dark:border-brand-primary/30">
                <span className="font-bold text-brand-primary">TIPS:</span> 設定即時生效。當您點選「下載 → 列印」時會套用此配置。匯出大型 Mermaid 圖表時，建議優先嘗試 <strong>A3 橫向 + 符合頁面</strong> 選項。
            </div>
        </div>
    );
};

// ── SettingsModal 主體 ──────────────────────────────────────────────────────
const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    mode,
    currentMacros,
    onSaveMacros,
    onRestoreDefaults,
    currentPrintSettings,
    onSavePrintSettings,
    isStandalone = false,
}) => {
    const [activeTab, setActiveTab] = useState<'editor' | 'print' | 'about'>('editor');
    const [jsonInput, setJsonInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showChangelog, setShowChangelog] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setJsonInput(JSON.stringify(currentMacros, null, 4));
            setError(null);
            setSuccess(false);
            // 預設切換到與當前模式最相關的分頁（雖然現在兩者都可用）
            // 如果是 Mermaid 模式，直接切換到列印設定可能更直觀
            if (mode === 'mermaid') setActiveTab('print');
            else setActiveTab('editor');
        }
    }, [isOpen, currentMacros, mode]);

    const handleSaveMacros = () => {
        try {
            const parsed = JSON.parse(jsonInput);
            if (typeof parsed !== 'object' || parsed === null) throw new Error('Root must be an object');
            onSaveMacros(parsed);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 1500);
            setTimeout(() => onClose(), 1500);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Invalid JSON format');
            setSuccess(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-[2px]" onClick={onClose} />
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_30px_90px_rgba(0,0,0,0.3)] border border-slate-200 dark:border-slate-800/80 z-50 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 fade-in duration-300">

                {/* Header & Tabs */}
                <div className="px-8 pt-8 pb-4 shrink-0">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">偏好設定</h2>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Application Configuration</p>
                        </div>
                        <RippleButton variant="icon" onClick={onClose}
                            aria-label="關閉偏好設定"
                            className="w-10 h-10 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-full transition-all">
                            <X size={20} />
                        </RippleButton>
                    </div>

                    <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl w-full">
                        <button
                            onClick={() => setActiveTab('editor')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'editor' ? 'bg-white dark:bg-slate-700 text-brand-primary shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            <Box size={14} />
                            編輯器設定
                        </button>
                        <button
                            onClick={() => setActiveTab('print')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'print' ? 'bg-white dark:bg-slate-700 text-brand-primary shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            <Printer size={14} />
                            列印與匯出
                        </button>
                        <button
                            onClick={() => setActiveTab('about')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'about' ? 'bg-white dark:bg-slate-700 text-brand-primary shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            <AlertCircle size={14} />
                            關於
                        </button>
                    </div>
                </div>

                {/* 內容區 */}
                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                    {activeTab === 'about' ? (
                        showChangelog ? (
                            <div key="about-changelog" className="p-8 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                                    <RippleButton variant="icon" onClick={() => setShowChangelog(false)} className="w-8 h-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full">
                                        <ChevronLeft size={20} />
                                    </RippleButton>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">發行內容 (What's New)</h3>
                                        <p className="text-[10px] font-bold text-brand-primary lowercase tracking-widest mt-0.5">Version 3.3.5</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-5 bg-gradient-to-br from-indigo-50 to-white dark:from-slate-800 dark:to-slate-800/50 rounded-2xl border border-indigo-100/50 dark:border-slate-700/50 shadow-sm">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-500 dark:text-indigo-400 rounded-xl">
                                                <PackagePlus size={18} />
                                            </div>
                                            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">音樂樂譜渲染 (abc notation)</h4>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed ml-11">
                                            現在您可以直接在 Markdown 文件中使用 <code className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px] font-mono mx-1">abc</code> 語法區塊來編寫傳統五線譜！系統會自動將其渲染為高解析度、可自由縮放的高品質向量樂譜，並深度優化深色模式與文件列印的顯示效果。
                                        </p>
                                    </div>
                                    <div className="p-5 bg-gradient-to-br from-indigo-50 to-white dark:from-slate-800 dark:to-slate-800/50 rounded-2xl border border-indigo-100/50 dark:border-slate-700/50 shadow-sm">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                                                <Check size={18} />
                                            </div>
                                            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">體驗優化與修正</h4>
                                        </div>
                                        <ul className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed ml-11 list-disc list-outside space-y-1.5 pl-4 opacity-90">
                                            <li>改善列印模式，強制將包含圖表與樂譜在內的所有元件配色還原為高對比黑色。</li>
                                            <li>在「新增文檔」選單追加了「音樂樂譜」範本，便於快速建立教學文件。</li>
                                            <li>優化表格產生器,可直接從外部試算表複製表格並轉換成markdown語法。</li>
                                            <li>修正元件樣式。</li>
                                            <li>列印時可以支援內嵌圖表縮放設定了。</li>
                                            <li>修正圖表與方程式的跳動問題</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div key="about-main" className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex flex-col items-center text-center space-y-6">
                                    <div className="
                                    w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-white overflow-hidden transform transition-transform hover:scale-[1.02] duration-300
                                    /* 基礎漸層 (淺色模式) */
                                    bg-gradient-to-br from-brand-primary to-brand-secondary 
                                    /* 深色模式下的漸層修改 */
                                    dark:from-brand-secondary dark:to-brand-accent
                                    /* 其他深色模式樣式 */
                                    shadow-xl shadow-slate-200 dark:shadow-black/70 
                                    border-4 border-white dark:border-slate-800 
                                    ring-1 ring-slate-100 dark:ring-slate-700/50
                                    ">
                                        <img src="./image/markdown_liveditor.svg?v=2" alt="Logo" className="w-16 h-16 drop-shadow-sm" />
                                    </div>
                                    <div className="pt-0">
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Markdown Live Previewer</h3>
                                        <div className="flex items-center justify-center gap-2 mt-2">
                                            <p className="text-1xl font-bold text-slate-600 dark:text-slate-300 lowercase tracking-widest">版本 3.3.5</p>
                                            <button
                                                onClick={() => setShowChangelog(true)}
                                                className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-500 dark:text-indigo-600 rounded-lg text-[10px] font-black hover:bg-indigo-200 dark:hover:bg-indigo-800/60 transition-colors"
                                            >
                                                發行內容
                                            </button>
                                        </div>
                                    </div>

                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                                        <FileText size={16} className="text-brand-primary opacity-80" />
                                        <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">功能特色 (Features)</h4>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">即時預覽與編輯</h5>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">支持 GFM 標準與即時同步滾動，提供極速的 Markdown 編輯體驗。</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">專業圖表渲染</h5>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">內建 Mermaid (流程圖、時序圖) 與 Vega-Lite 數據可視化支持。</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">科學公式與計算</h5>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">完美支援 LaTeX 數學公式、化學符號及樂譜渲染。</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">隱私與安全</h5>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">100% 瀏覽器本地運行，不對外傳輸您的任何文檔數據。</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                                        <Box size={16} className="text-brand-primary opacity-80" />
                                        <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">第三方套件與致謝 (Credits)</h4>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {[
                                            { name: 'React', license: 'MIT', url: 'https://react.dev' },
                                            { name: 'CodeMirror', license: 'MIT', url: 'https://codemirror.net' },
                                            { name: 'Mermaid', license: 'MIT', url: 'https://mermaid.js.org' },
                                            { name: 'MathJax', license: 'Apache-2.0', url: 'https://www.mathjax.org' },
                                            { name: 'Lucide Icons', license: 'ISC', url: 'https://lucide.dev' },
                                            { name: 'Vega / Vega-Lite', license: 'BSD-3-Clause', url: 'https://vega.github.io' },
                                            { name: 'SheetJS', license: 'Apache-2.0', url: 'https://sheetjs.com' },
                                            { name: 'PDF-lib', license: 'MIT', url: 'https://pdf-lib.js.org' },
                                            { name: 'abcjs', license: 'MIT', url: 'https://paulrosen.github.io/abcjs/' },
                                            { name: 'SmilesDrawer', license: 'MIT', url: 'https://github.com/reymendes/smilesDrawer' },
                                            { name: 'Vite', license: 'MIT', url: 'https://vitejs.dev' },
                                            { name: 'Tailwind CSS', license: 'MIT', url: 'https://tailwindcss.com' },
                                        ].map((pkg) => (
                                            <div key={pkg.name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-brand-primary/20 dark:hover:border-brand-primary/40 transition-colors text-left">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{pkg.name}</span>
                                                    <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-tighter">{pkg.license} License</span>
                                                </div>
                                                <a href={pkg.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-brand-primary hover:text-brand-accent transition-colors uppercase tracking-widest">網站</a>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-2xl bg-brand-secondary/30 dark:bg-brand-primary/10 px-5 py-4 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed border border-brand-primary/15 dark:border-brand-primary/30 text-center">
                                    © 2026 HUANGJYUNYING. 授權：MIT 開源協議。使用本軟體即代表您同意其<a href="/privacy.html" className="mx-1 underline">隱私政策</a>與<a href="/terms.html" className="mx-1 underline">服務條款</a>。
                                </div>

                            </div>
                        )
                    ) : activeTab === 'print' ? (
                        <PdfSettingsPanel key="print" settings={currentPrintSettings} onChange={onSavePrintSettings} isStandalone={isStandalone} />
                    ) : (
                        <div key="editor" className="flex flex-col">
                            {mode === 'markdown' ? (
                                <div className="flex flex-col p-8 pt-0">
                                    <div className="mb-4">
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">MathJax 自定義巨集 (JSON)</p>
                                        <div className="relative">
                                            <textarea
                                                value={jsonInput}
                                                onChange={(e) => setJsonInput(e.target.value)}
                                                className={`w-full min-h-[320px] p-5 font-mono text-xs bg-slate-50 dark:bg-slate-950 border-2 rounded-2xl resize-none focus:outline-none focus:ring-4 transition-all
                                                    ? 'border-red-200 focus:ring-red-100 dark:border-red-900/40'
                                                        : 'border-slate-100 dark:border-slate-800 focus:ring-brand-secondary dark:focus:ring-brand-primary/20'
                                                    }
                                                    text-slate-700 dark:text-slate-300 custom-scrollbar shadow-inner`}
                                                spellCheck={false}
                                            />
                                            {error && (
                                                <div className="absolute top-4 right-4 bg-red-50 dark:bg-red-950/80 text-red-600 dark:text-red-400 text-[10px] px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-900/50 flex items-center gap-2 animate-in fade-in duration-300 backdrop-blur-sm">
                                                    <AlertCircle size={12} />
                                                    {error}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pb-8">
                                        <RippleButton variant="text" onClick={() => confirm('確定要還原預設巨集設定嗎?') && onRestoreDefaults()} className="text-slate-400 hover:text-brand-primary text-[10px] font-black uppercase tracking-widest">
                                            <RotateCcw size={14} />
                                            還原預設
                                        </RippleButton>
                                        <div className="flex items-center gap-4">
                                            <RippleButton variant="outlined" onClick={onClose} className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest">取消</RippleButton>
                                            <RippleButton variant="filled" onClick={handleSaveMacros} className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all ${success ? 'bg-green-500 shadow-green-500/20' : 'bg-brand-primary hover:bg-brand-primary/90 shadow-brand-primary/20'}`}>
                                                {success ? <Check size={16} /> : <Save size={16} />}
                                                {success ? '已儲存' : '儲存變更'}
                                            </RippleButton>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-40">
                                    <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] mb-6">
                                        <Box size={48} className="text-slate-400" />
                                    </div>
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">Mermaid 模式</p>
                                    <p className="text-[10px] font-medium text-slate-400 mt-2 max-w-[200px]">目前尚無可自定義的編輯器選項。請切換至「列印與匯出」進行版面配置。</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default SettingsModal;
