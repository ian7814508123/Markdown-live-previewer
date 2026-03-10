import { useRef, useState, useEffect } from 'react';
import { Download, ChevronDown, Image as ImageIcon, FileImage, FileJson, FileText, Printer, Sun, Moon, FileUp, Settings } from 'lucide-react';
import { parseExcelToMarkdown } from '../services/excelParser';
import RippleButton from './RippleButton';

interface HeaderProps {
    mode: 'mermaid' | 'markdown';
    theme: string;
    setTheme: (theme: string) => void;
    isDarkMode: boolean;
    toggleDarkMode: (event?: React.MouseEvent) => void;
    onDownloadMarkdown: () => void;
    onExportImage: (format: 'png' | 'svg' | 'jpg') => void;
    isSyncScroll: boolean;
    setIsSyncScroll: (isSync: boolean) => void;
    onInsertCode: (code: string) => void;
    onImportFullFile: (file: File, content: string) => void;
    onOpenSettings: () => void;
    /** Mermaid PDF 匹出：注入 @page CSS 後列印，繞開 canvas 安全限制 */
    onMermaidPrint: () => void;
}

const Header: React.FC<HeaderProps> = ({
    mode,
    theme,
    setTheme,
    isDarkMode,
    toggleDarkMode,
    onDownloadMarkdown,
    onExportImage,
    isSyncScroll,
    setIsSyncScroll,
    onInsertCode,
    onImportFullFile,
    onOpenSettings,
    onMermaidPrint,
}) => {
    const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
    const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
    const downloadMenuRef = useRef<HTMLDivElement>(null);
    const themeMenuRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 主顕選句映射
    const THEMES: { value: string; label: string; emoji: string }[] = [
        { value: 'default', label: '預設', emoji: '🎨' },
        { value: 'neutral', label: '大自然', emoji: '🌿' },
        { value: 'dark', label: '深色的', emoji: '🌙' },
        { value: 'forest', label: '雨林', emoji: '🌲' },
    ];
    const currentTheme = THEMES.find(t => t.value === theme) ?? THEMES[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
                setIsDownloadMenuOpen(false);
            }
            if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
                setIsThemeMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleExport = (action: () => void) => {
        action();
        setIsDownloadMenuOpen(false);
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        const fileName = file.name.toLowerCase();

        try {
            if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) {
                const md = await parseExcelToMarkdown(file);
                if (md) onInsertCode(md);
            } else {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const content = event.target?.result as string;
                    if (content !== undefined) onImportFullFile(file, content);
                };
                reader.readAsText(file);
            }
        } catch (error) {
            console.error("Failed to parse file", error);
            alert("匯入失敗，請檢查檔案格式是否正確");
        }

        e.target.value = '';
    };

    // ── 下載選單項目的共用樣式 ──────────────────────────────
    const menuItem = (onClick: () => void, icon: React.ReactNode, label: string, sub: string) => (
        <button
            onClick={onClick}
            style={{ position: 'relative', overflow: 'hidden' }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 border border-transparent hover:border-slate-200 dark:hover:border-white/15 transition-all"
        >
            {icon}
            <div className="flex flex-col items-start">
                <span className="font-bold">{label}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase">{sub}</span>
            </div>
        </button>
    );

    return (
        <header className="h-14 flex items-center justify-between px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-30 shrink-0 shadow-sm transition-colors duration-200 select-none print:hidden">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".xlsx,.xls,.csv,.md,.txt,.mmd"
                onChange={handleFileUpload}
            />

            {/* Logo + 標題 */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40">
                    <img src="/image/markdown_liveditor.svg" alt="Logo" className="w-12 h-12" />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">標記掉落 即時編輯者</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">專業的 編輯者 給 標記掉落</p>
                </div>
            </div>

            {/* 右側工具列 */}
            <div className="flex items-center gap-1">

                {/* 分隔線元件（共用） */}
                {/* const Sep = () => <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" /> */}

                {/* ── Mermaid 模式工具列 ─────────────────────────────────────── */}
                {mode === 'mermaid' && (<>

                    {/* 深色模式 */}
                    <RippleButton variant="icon" onClick={(e) => toggleDarkMode(e)}
                        title={isDarkMode ? '切換 到 亮色模式' : '切換 到 深色模式'}
                        className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </RippleButton>

                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

                    {/* 設定（Mermaid → PDF 版面設定） */}
                    <RippleButton variant="icon" onClick={onOpenSettings} title="PDF 版面設定"
                        className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                        <Settings size={20} />
                    </RippleButton>

                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

                    {/* 主題選擇器 */}
                    <div className="relative ml-1" ref={themeMenuRef}>
                        <button onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                            style={{ position: 'relative', overflow: 'hidden' }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-all select-none">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">主題</span>
                            <span>{currentTheme.emoji} {currentTheme.label}</span>
                            <ChevronDown size={12} className={`transition-transform duration-200 ${isThemeMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <div style={{
                            position: 'absolute', left: 0, marginTop: '0.5rem', width: '11rem',
                            opacity: isThemeMenuOpen ? 1 : 0,
                            transform: isThemeMenuOpen ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.96)',
                            pointerEvents: isThemeMenuOpen ? 'auto' : 'none',
                            transition: 'opacity 0.25s cubic-bezier(0.4,0,0.2,1), transform 0.25s cubic-bezier(0.4,0,0.2,1)',
                            transformOrigin: 'top left',
                        }} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl py-2 px-2 z-50 ring-1 ring-black/5">
                            {THEMES.map(t => (
                                <button key={t.value} onClick={() => { setTheme(t.value); setIsThemeMenuOpen(false); }}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all border
                                        ${t.value === theme
                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 font-semibold'
                                            : 'text-slate-700 dark:text-slate-200 border-transparent hover:bg-slate-100 dark:hover:bg-white/10 hover:border-slate-200 dark:hover:border-white/15 font-medium'
                                        }`}>
                                    <span>{t.emoji}</span><span>{t.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

                    {/* 下載選單（Mermaid） */}
                    <div className="relative" ref={downloadMenuRef}>
                        <RippleButton variant="filled" onClick={() => setIsDownloadMenuOpen(!isDownloadMenuOpen)} className="text-sm pr-3">
                            <Download size={16} />
                            <span>下載</span>
                            <ChevronDown size={14} className={`transition-transform duration-200 ${isDownloadMenuOpen ? 'rotate-180' : ''}`} />
                        </RippleButton>
                        <div style={{
                            position: 'absolute', right: 0, marginTop: '0.5rem', width: '18rem',
                            opacity: isDownloadMenuOpen ? 1 : 0,
                            transform: isDownloadMenuOpen ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.96)',
                            pointerEvents: isDownloadMenuOpen ? 'auto' : 'none',
                            transition: 'opacity 0.25s cubic-bezier(0.4,0,0.2,1), transform 0.25s cubic-bezier(0.4,0,0.2,1)',
                            transformOrigin: 'top right',
                        }} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl py-2 px-2 z-50 ring-1 ring-black/5">
                            {menuItem(() => handleExport(() => onExportImage('png')),
                                <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center"><ImageIcon size={18} /></div>,
                                'PNG 圖片', '高保真')}
                            {menuItem(() => handleExport(() => onExportImage('jpg')),
                                <div className="w-9 h-9 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center"><FileImage size={18} /></div>,
                                'JPG 圖片', '壓縮')}
                            <div className="mx-4 my-1 border-t border-slate-100 dark:border-slate-700" />
                            {menuItem(() => handleExport(() => onExportImage('svg')),
                                <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center"><FileJson size={18} /></div>,
                                'SVG 向量', '解析度獨立')}
                            <div className="mx-4 my-1 border-t border-slate-100 dark:border-slate-700" />
                            {menuItem(() => handleExport(onDownloadMarkdown),
                                <div className="w-9 h-9 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl flex items-center justify-center"><FileText size={18} /></div>,
                                'Mermaid 原始碼', '.md 源碼')}
                            <div className="mx-4 my-1 border-t border-slate-100 dark:border-slate-700" />
                            {menuItem(() => handleExport(onMermaidPrint),
                                <div className="w-9 h-9 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center"><Printer size={18} /></div>,
                                '列印 / PDF', '套用 PDF 版面設定')}

                            {/* AdSense In-Menu Ad */}
                            <div className="mx-2 mt-4 p-2 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 min-h-[100px] flex items-center justify-center relative overflow-hidden">
                                <ins className="adsbygoogle"
                                    style={{ display: 'block' }}
                                    data-ad-client="ca-pub-8170892352848798"
                                    data-ad-slot="1864612249"
                                    data-ad-format="horizontal"
                                    data-full-width-responsive="true"></ins>
                                <span className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 text-[8px] font-bold uppercase tracking-widest">贊助廣告</span>
                            </div>
                        </div>
                    </div>

                </>)}

                {/* ── Markdown 模式工具列 ────────────────────────────────────── */}
                {mode === 'markdown' && (<>

                    {/* 深色模式 */}
                    <RippleButton variant="icon" onClick={(e) => toggleDarkMode(e)}
                        title={isDarkMode ? '切換 到 亮色模式' : '切換 到 深色模式'}
                        className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </RippleButton>

                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

                    {/* 設定（Markdown → MathJax 巨集） */}
                    <RippleButton variant="icon" onClick={onOpenSettings} title="MathJax 巨集設定"
                        className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                        <Settings size={20} />
                    </RippleButton>

                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

                    {/* 同步滾動 */}
                    <button onClick={() => setIsSyncScroll(!isSyncScroll)} title="同步滾動"
                        style={{ position: 'relative', overflow: 'hidden' }}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold transition-all select-none
                            ${isSyncScroll
                                ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-slate-200 dark:hover:bg-white/10'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}>
                        <span className={`w-2 h-2 rounded-full shrink-0 transition-colors ${isSyncScroll ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`} />
                        同步滾動
                    </button>

                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

                    {/* 進口檔案 */}
                    <button onClick={() => fileInputRef.current?.click()}
                        title="進口檔案 (.md, .txt, .xlsx, .csv)"
                        style={{ position: 'relative', overflow: 'hidden' }}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-slate-200 transition-all select-none">
                        <FileUp size={14} />
                        進口檔案
                    </button>

                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

                    {/* 下載選單（Markdown） */}
                    <div className="relative" ref={downloadMenuRef}>
                        <RippleButton variant="filled" onClick={() => setIsDownloadMenuOpen(!isDownloadMenuOpen)} className="text-sm pr-3">
                            <Download size={16} />
                            <span>下載</span>
                            <ChevronDown size={14} className={`transition-transform duration-200 ${isDownloadMenuOpen ? 'rotate-180' : ''}`} />
                        </RippleButton>
                        <div style={{
                            position: 'absolute', right: 0, marginTop: '0.5rem', width: '18rem',
                            opacity: isDownloadMenuOpen ? 1 : 0,
                            transform: isDownloadMenuOpen ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.96)',
                            pointerEvents: isDownloadMenuOpen ? 'auto' : 'none',
                            transition: 'opacity 0.25s cubic-bezier(0.4,0,0.2,1), transform 0.25s cubic-bezier(0.4,0,0.2,1)',
                            transformOrigin: 'top right',
                        }} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl py-2 px-2 z-50 ring-1 ring-black/5">
                            {menuItem(() => handleExport(onDownloadMarkdown),
                                <div className="w-9 h-9 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl flex items-center justify-center"><FileText size={18} /></div>,
                                'Markdown 檔案', '.md 源碼')}
                            <div className="mx-4 my-1 border-t border-slate-100 dark:border-slate-700" />
                            {menuItem(() => handleExport(() => window.print()),
                                <div className="w-9 h-9 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center"><Printer size={18} /></div>,
                                '列印 / PDF', '瀏覽器原生')}

                            {/* AdSense In-Menu Ad */}
                            <div className="mx-2 mt-4 p-2 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 min-h-[100px] flex items-center justify-center relative overflow-hidden">
                                <ins className="adsbygoogle"
                                    style={{ display: 'block' }}
                                    data-ad-client="ca-pub-8170892352848798"
                                    data-ad-slot="1864612249"
                                    data-ad-format="horizontal"
                                    data-full-width-responsive="true"></ins>
                                <span className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 text-[8px] font-bold uppercase tracking-widest">贊助廣告</span>
                            </div>
                        </div>
                    </div>

                </>)}

            </div>
        </header>
    );
};

export default Header;

