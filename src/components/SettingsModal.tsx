import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw, AlertCircle, Check } from 'lucide-react';
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
}

// ── PDF 設定面板 ────────────────────────────────────────────────────────────
const PdfSettingsPanel: React.FC<{
    settings: PrintSettings;
    onChange: (patch: Partial<PrintSettings>) => void;
}> = ({ settings, onChange }) => {
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
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">{label}</p>
                <div className="flex flex-wrap gap-2">
                    {options.map(opt => (
                        <button
                            key={String(opt.value)}
                            onClick={() => onSelect(opt.value)}
                            className={[
                                'flex flex-col items-center px-3 py-2 rounded-xl border text-xs font-medium transition-all',
                                value === opt.value
                                    ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-200 dark:hover:border-indigo-800',
                            ].join(' ')}
                        >
                            <span>{opt.label}</span>
                            {opt.hint && <span className="text-[9px] opacity-60 mt-0.5">{opt.hint}</span>}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="px-6 py-5 space-y-5 overflow-y-auto custom-scrollbar">
            {/* 紙張尺寸 */}
            <ToggleGroup
                label="紙張尺寸"
                options={[
                    { label: 'A4', value: 'A4', hint: '210×297mm' },
                    { label: 'A3', value: 'A3', hint: '297×420mm' },
                    { label: 'Letter', value: 'Letter', hint: '216×279mm' },
                ]}
                value={settings.paperSize}
                onSelect={(v) => onChange({ paperSize: v as PrintSettings['paperSize'] })}
            />

            {/* 方向 */}
            <ToggleGroup
                label="方向"
                options={[
                    { label: '橫向 ↔', value: 'landscape', hint: '寬幅圖表推薦' },
                    { label: '直向 ↕', value: 'portrait', hint: '流程圖推薦' },
                ]}
                value={settings.orientation}
                onSelect={(v) => onChange({ orientation: v as PrintSettings['orientation'] })}
            />

            {/* 縮放 */}
            <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">縮放</p>
                <div className="flex flex-wrap gap-2">
                    {([
                        { label: '符合頁面', value: 'fit' as PrintSettings['scale'], hint: '自動縮放' },
                        { label: '實際大小', value: 'actual' as PrintSettings['scale'], hint: '100%' },
                        { label: '自訂', value: customScale as PrintSettings['scale'], hint: `${customScale}%` },
                    ]).map(opt => {
                        const isCustom = typeof opt.value === 'number';
                        const isActive = isCustom ? typeof settings.scale === 'number' : settings.scale === opt.value;
                        return (
                            <button key={String(opt.value)} onClick={() => onChange({ scale: opt.value })}
                                className={[
                                    'flex flex-col items-center px-3 py-2 rounded-xl border text-xs font-medium transition-all',
                                    isActive
                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-200 dark:hover:border-indigo-800',
                                ].join(' ')}
                            >
                                <span>{opt.label}</span>
                                <span className="text-[9px] opacity-60 mt-0.5">{opt.hint}</span>
                            </button>
                        );
                    })}
                </div>
                {typeof settings.scale === 'number' && (
                    <div className="flex items-center gap-3 pt-1">
                        <input type="range" min={10} max={200} step={5} value={customScale}
                            onChange={(e) => { const v = Number(e.target.value); setCustomScale(v); onChange({ scale: v }); }}
                            className="flex-1 accent-indigo-500"
                        />
                        <span className="text-xs font-mono w-10 text-right text-slate-600 dark:text-slate-300">{customScale}%</span>
                    </div>
                )}
            </div>

            {/* 邊距 */}
            <ToggleGroup
                label="邊距"
                options={[
                    { label: '正常', value: 'normal', hint: '1.5cm' },
                    { label: '窄', value: 'narrow', hint: '0.5cm' },
                    { label: '無', value: 'none', hint: '0' },
                ]}
                value={settings.margin}
                onSelect={(v) => onChange({ margin: v as PrintSettings['margin'] })}
            />

            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                💡 設定即時生效。點選「下載 → 列印 / PDF」時套用。<br />
                大型圖建議使用 <strong>A3 橫向、符合頁面</strong> 以避免裁切。
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
}) => {
    const [jsonInput, setJsonInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setJsonInput(JSON.stringify(currentMacros, null, 4));
            setError(null);
            setSuccess(false);
        }
    }, [isOpen, currentMacros]);

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

    const isMermaid = mode === 'mermaid';

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
                    <div>
                        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">設定</h2>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                            {isMermaid ? 'PDF 列印版面配置' : 'MathJax 自訂義巨集'}
                        </p>
                    </div>
                    <RippleButton variant="icon" onClick={onClose} className="w-8 h-8 text-slate-500">
                        <X size={18} />
                    </RippleButton>
                </div>

                {/* 內容區：根據 mode 切換 */}
                <div className="flex-1 min-h-0 overflow-hidden">
                    {isMermaid ? (
                        /* Mermaid 模式：PDF 版面設定（即時儲存，無需確認按鈕） */
                        <PdfSettingsPanel settings={currentPrintSettings} onChange={onSavePrintSettings} />
                    ) : (
                        /* Markdown 模式：MathJax 巨集編輯器 */
                        <div className="flex flex-col h-full">
                            <div className="flex-1 relative p-4 min-h-0">
                                <textarea
                                    value={jsonInput}
                                    onChange={(e) => setJsonInput(e.target.value)}
                                    className={`w-full min-h-[340px] h-full p-4 font-mono text-sm bg-slate-50 dark:bg-slate-950 border rounded-xl resize-none focus:outline-none focus:ring-2 transition-all
                                        ${error
                                            ? 'border-red-300 focus:ring-red-200 dark:border-red-900/50'
                                            : 'border-slate-200 dark:border-slate-800 focus:ring-indigo-100 dark:focus:ring-indigo-900'
                                        }
                                        text-slate-700 dark:text-slate-300 custom-scrollbar`}
                                    spellCheck={false}
                                />
                                {error && (
                                    <div className="absolute bottom-6 right-6 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-xs px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-800/50 flex items-center gap-2 animate-in slide-in-from-bottom-2">
                                        <AlertCircle size={14} />
                                        {error}
                                    </div>
                                )}
                            </div>
                            {/* Footer */}
                            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
                                <RippleButton variant="text" onClick={() => confirm('確定要還原預設巨集設定嗎?') && onRestoreDefaults()} className="text-slate-500">
                                    <RotateCcw size={16} />
                                    還原預設
                                </RippleButton>
                                <div className="flex items-center gap-3">
                                    <RippleButton variant="outlined" onClick={onClose}>取消</RippleButton>
                                    <RippleButton variant="filled" onClick={handleSaveMacros} className={success ? 'bg-green-600 hover:bg-green-700' : ''}>
                                        {success ? <Check size={18} /> : <Save size={18} />}
                                        {success ? '已儲存' : '儲存'}
                                    </RippleButton>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default SettingsModal;
