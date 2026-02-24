import React, { useState, useCallback, useMemo } from 'react';
import { Table, Copy, Check, AlignLeft, AlignCenter, AlignRight, Plus, Minus, FileInput, AlertTriangle } from 'lucide-react';
import RippleButton from './RippleButton';

/** 欄位對齊方向 */
type Align = 'left' | 'center' | 'right';

/** 對齊符號對應的 Markdown 分隔符 */
const ALIGN_SEPARATOR: Record<Align, string> = {
    left: ':---',
    center: ':---:',
    right: '---:',
};

/** 欄位數與列數的最小/最大限制 */
const MIN_COLS = 1, MAX_COLS = 8;
const MIN_ROWS = 1, MAX_ROWS = 10;
const DEFAULT_COLS = 3;
const DEFAULT_ROWS = 3;

/** 建立空白表格資料 */
function makeGrid(cols: number, rows: number): string[][] {
    return Array.from({ length: rows + 1 }, () => Array(cols).fill(''));
}

/** 建立預設對齊陣列 */
function makeAligns(cols: number): Align[] {
    return Array<Align>(cols).fill('left');
}

interface TableGeneratorToolProps {
    /** 將生成的表格 Markdown 插入編輯器游標位置 */
    onInsertIntoDoc: (text: string) => void;
    /** 當前文檔的編輯模式（mermaid 不支援 Markdown 表格） */
    currentDocMode: 'markdown' | 'mermaid';
}

const TableGeneratorTool: React.FC<TableGeneratorToolProps> = ({ onInsertIntoDoc, currentDocMode }) => {
    const [cols, setCols] = useState(DEFAULT_COLS);
    const [rows, setRows] = useState(DEFAULT_ROWS);
    // grid[0] = header，grid[1..n] = data rows
    const [grid, setGrid] = useState<string[][]>(() => makeGrid(DEFAULT_COLS, DEFAULT_ROWS));
    const [aligns, setAligns] = useState<Align[]>(() => makeAligns(DEFAULT_COLS));
    const [copied, setCopied] = useState(false);
    const [inserted, setInserted] = useState(false);

    // ── 欄數調整 ────────────────────────────────────────────
    const handleColChange = useCallback((delta: number) => {
        const next = Math.min(MAX_COLS, Math.max(MIN_COLS, cols + delta));
        if (next === cols) return;
        setCols(next);
        setGrid(prev => prev.map(row => {
            const r = [...row];
            if (next > cols) {
                for (let i = cols; i < next; i++) r.push('');
            } else {
                r.length = next;
            }
            return r;
        }));
        setAligns(prev => {
            const a = [...prev];
            if (next > cols) {
                for (let i = cols; i < next; i++) a.push('left');
            } else {
                a.length = next;
            }
            return a;
        });
    }, [cols]);

    // ── 列數調整 ────────────────────────────────────────────
    const handleRowChange = useCallback((delta: number) => {
        const next = Math.min(MAX_ROWS, Math.max(MIN_ROWS, rows + delta));
        if (next === rows) return;
        setRows(next);
        setGrid(prev => {
            const header = prev[0];
            let dataRows = prev.slice(1);
            if (next > rows) {
                for (let i = rows; i < next; i++) dataRows.push(Array(cols).fill(''));
            } else {
                dataRows = dataRows.slice(0, next);
            }
            return [header, ...dataRows];
        });
    }, [rows, cols]);

    // ── 儲存格更新 ──────────────────────────────────────────
    const handleCellChange = useCallback((rowIdx: number, colIdx: number, value: string) => {
        setGrid(prev => {
            const next = prev.map(r => [...r]);
            next[rowIdx][colIdx] = value;
            return next;
        });
    }, []);

    // ── 對齊切換 ────────────────────────────────────────────
    const cycleAlign = useCallback((colIdx: number) => {
        const order: Align[] = ['left', 'center', 'right'];
        setAligns(prev => {
            const next = [...prev];
            const cur = order.indexOf(next[colIdx]);
            next[colIdx] = order[(cur + 1) % order.length];
            return next;
        });
    }, []);

    // ── 產生 Markdown ───────────────────────────────────────
    const markdown = useMemo(() => {
        const pad = (s: string) => ` ${s} `;
        const headerCells = grid[0].map((h, i) => pad(h || `欄位 ${i + 1}`));
        const sepCells = aligns.map(a => ` ${ALIGN_SEPARATOR[a]} `);
        const dataRows = grid.slice(1).map(row =>
            `|${row.map(c => pad(c || '')).join('|')}|`
        );
        return [
            `|${headerCells.join('|')}|`,
            `|${sepCells.join('|')}|`,
            ...dataRows,
        ].join('\n');
    }, [grid, aligns]);

    // ── 複製 ────────────────────────────────────────────────
    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(markdown).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }, [markdown]);

    // ── 插入至文件游標位置 ───────────────────────────────────
    const handleInsert = useCallback(() => {
        onInsertIntoDoc(markdown);
        setInserted(true);
        setTimeout(() => setInserted(false), 2000);
    }, [markdown, onInsertIntoDoc]);

    // ── 對齊圖示 ────────────────────────────────────────────
    const AlignIcon = ({ align }: { align: Align }) => {
        if (align === 'center') return <AlignCenter size={11} />;
        if (align === 'right') return <AlignRight size={11} />;
        return <AlignLeft size={11} />;
    };

    return (
        <div className="flex flex-col gap-3 p-3 min-h-0">

            {/* ── 標題 ── */}
            <div className="flex items-center gap-2 shrink-0">
                <div className="w-7 h-7 bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 rounded-xl flex items-center justify-center">
                    <Table size={15} />
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Markdown 表格產生器</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">視覺化編輯，直接插入文件或複製語法</p>
                </div>
            </div>

            {/* ── Mermaid 模式：顯示提示，隱藏工具 UI ── */}
            {currentDocMode === 'mermaid' ? (
                <div className="flex flex-col items-center justify-center gap-3 flex-1 py-8 px-4 rounded-xl border-2 border-dashed border-amber-200 dark:border-amber-800/60 bg-amber-50/60 dark:bg-amber-900/10">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 text-amber-500 dark:text-amber-400 rounded-2xl flex items-center justify-center">
                        <AlertTriangle size={20} />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-bold text-amber-700 dark:text-amber-300 mb-1">
                            Mermaid 模式不支援 Markdown 表格
                        </p>
                        <p className="text-[11px] text-amber-600/80 dark:text-amber-400/70 leading-relaxed">
                            目前文檔為 <span className="font-semibold">Mermaid 圖表</span> 模式。<br />
                            請切換到 <span className="font-semibold">Markdown</span> 文檔後再使用表格產生器。
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    {/* ── 設定列：欄 / 列數 ── */}
                    <div className="flex items-center gap-4 shrink-0">
                        {/* 欄數 */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide w-5">欄</span>
                            <button
                                onClick={() => handleColChange(-1)}
                                disabled={cols <= MIN_COLS}
                                className="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                            >
                                <Minus size={11} />
                            </button>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 w-5 text-center tabular-nums">{cols}</span>
                            <button
                                onClick={() => handleColChange(1)}
                                disabled={cols >= MAX_COLS}
                                className="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                            >
                                <Plus size={11} />
                            </button>
                        </div>

                        <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />

                        {/* 列數 */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide w-5">列</span>
                            <button
                                onClick={() => handleRowChange(-1)}
                                disabled={rows <= MIN_ROWS}
                                className="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                            >
                                <Minus size={11} />
                            </button>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 w-5 text-center tabular-nums">{rows}</span>
                            <button
                                onClick={() => handleRowChange(1)}
                                disabled={rows >= MAX_ROWS}
                                className="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                            >
                                <Plus size={11} />
                            </button>
                        </div>
                    </div>

                    {/* ── 視覺化表格編輯區 ── */}
                    <div className="shrink-0 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                        <table className="w-full border-collapse text-[11px]" style={{ minWidth: `${cols * 90}px` }}>
                            {/* 對齊按鈕列 */}
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/60">
                                    {aligns.map((align, ci) => (
                                        <th key={ci} className="border-b border-slate-200 dark:border-slate-700 px-0 py-1 font-normal">
                                            <button
                                                onClick={() => cycleAlign(ci)}
                                                title={`切換對齊（目前：${align}）`}
                                                className="flex items-center justify-center gap-1 mx-auto px-2 py-0.5 rounded-md text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
                                            >
                                                <AlignIcon align={align} />
                                                <span className="text-[9px] capitalize">{align}</span>
                                            </button>
                                        </th>
                                    ))}
                                </tr>
                                {/* Header 列 */}
                                <tr className="bg-violet-50/60 dark:bg-violet-900/10">
                                    {grid[0].map((val, ci) => (
                                        <th key={ci} className="border-b border-slate-200 dark:border-slate-700 p-0 font-normal">
                                            <input
                                                type="text"
                                                value={val}
                                                placeholder={`欄位 ${ci + 1}`}
                                                onChange={e => handleCellChange(0, ci, e.target.value)}
                                                className="w-full px-2 py-1.5 text-[11px] font-semibold text-violet-700 dark:text-violet-300 bg-transparent placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:bg-violet-100/40 dark:focus:bg-violet-900/20 transition-colors"
                                            />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            {/* 資料列 */}
                            <tbody>
                                {grid.slice(1).map((row, ri) => (
                                    <tr key={ri} className="group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                        {row.map((val, ci) => (
                                            <td key={ci} className={`p-0 ${ci < cols - 1 ? 'border-r border-slate-100 dark:border-slate-800' : ''} ${ri < rows - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}>
                                                <input
                                                    type="text"
                                                    value={val}
                                                    placeholder="—"
                                                    onChange={e => handleCellChange(ri + 1, ci, e.target.value)}
                                                    className="w-full px-2 py-1.5 text-[11px] text-slate-600 dark:text-slate-300 bg-transparent placeholder:text-slate-200 dark:placeholder:text-slate-700 focus:outline-none focus:bg-violet-50/40 dark:focus:bg-violet-900/10 transition-colors"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Markdown 輸出區 ── */}
                    <div className="flex flex-col gap-1.5 shrink-0">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
                                Markdown 輸出
                            </span>
                            <div className="flex items-center gap-1.5">
                                {/* 插入文件 */}
                                <RippleButton
                                    variant="filled"
                                    onClick={handleInsert}
                                    className={`text-[11px] h-7 px-2.5 gap-1 transition-all ${inserted
                                            ? 'bg-emerald-500 hover:bg-emerald-500'
                                            : 'bg-indigo-600 hover:bg-indigo-700'
                                        }`}
                                >
                                    {inserted
                                        ? <><Check size={12} />已插入！</>
                                        : <><FileInput size={12} />插入文件</>
                                    }
                                </RippleButton>
                                {/* 複製 */}
                                <RippleButton
                                    variant="tonal"
                                    onClick={handleCopy}
                                    className={`text-[11px] h-7 px-2.5 gap-1 transition-all ${copied
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : 'text-slate-600 dark:text-slate-300'
                                        }`}
                                >
                                    {copied
                                        ? <><Check size={12} />已複製</>
                                        : <><Copy size={12} />複製</>
                                    }
                                </RippleButton>
                            </div>
                        </div>
                        <pre className="text-[10.5px] leading-relaxed font-mono text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 overflow-x-auto custom-scrollbar border border-slate-100 dark:border-slate-700 whitespace-pre">
                            {markdown}
                        </pre>
                    </div>
                </>
            )}

        </div>
    );
};

export default TableGeneratorTool;
