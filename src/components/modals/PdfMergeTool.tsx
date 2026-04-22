import React, { useState, useRef, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import { FilePlus2, Trash2, Download, GripVertical, FileText, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import RippleButton from '../ui/RippleButton';

/** 使用者加入的合併項目 */
interface MergeItem {
    id: string;
    file: File;
    type: 'pdf' | 'image';
}

const PdfMergeTool: React.FC = () => {
    const [items, setItems] = useState<MergeItem[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isMerging, setIsMerging] = useState(false);
    const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
    const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    /** 接受 File 列表並加入 items */
    const addFiles = useCallback((files: FileList | File[]) => {
        const arr = Array.from(files);
        const newItems: MergeItem[] = arr
            .filter(f => {
                const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
                return ['pdf', 'png', 'jpg', 'jpeg'].includes(ext);
            })
            .map(f => {
                const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
                return {
                    id: `${Date.now()}-${Math.random()}`,
                    file: f,
                    type: ext === 'pdf' ? 'pdf' : 'image',
                };
            });
        setItems(prev => [...prev, ...newItems]);
    }, []);

    // ── 拖放到上傳區域 ──────────────────────────────────
    const handleDropZoneDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };
    const handleDropZoneDragLeave = () => setIsDragOver(false);
    const handleDropZoneDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
    };

    // ── 列表項目拖曳排序 ─────────────────────────────────
    const handleItemDragStart = (idx: number) => setDraggedIdx(idx);
    const handleItemDragEnter = (idx: number) => setDragOverIdx(idx);
    const handleItemDragEnd = () => {
        if (draggedIdx !== null && dragOverIdx !== null && draggedIdx !== dragOverIdx) {
            setItems(prev => {
                const next = [...prev];
                const [moved] = next.splice(draggedIdx, 1);
                next.splice(dragOverIdx, 0, moved);
                return next;
            });
        }
        setDraggedIdx(null);
        setDragOverIdx(null);
    };

    const removeItem = (id: string) => setItems(prev => prev.filter(it => it.id !== id));

    // ── PDF 合併 ──────────────────────────────────────────
    const handleMerge = async () => {
        if (items.length === 0) return;
        setIsMerging(true);

        try {
            const merged = await PDFDocument.create();

            for (const item of items) {
                const arrayBuffer = await item.file.arrayBuffer();

                if (item.type === 'pdf') {
                    // 合併 PDF 頁面
                    const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
                    const copiedPages = await merged.copyPages(srcDoc, srcDoc.getPageIndices());
                    copiedPages.forEach(p => merged.addPage(p));
                } else {
                    // 將圖片嵌入為一頁 PDF
                    const ext = item.file.name.split('.').pop()?.toLowerCase();
                    const embeddedImage =
                        ext === 'png'
                            ? await merged.embedPng(arrayBuffer)
                            : await merged.embedJpg(arrayBuffer);

                    const { width, height } = embeddedImage.scale(1);
                    // 使用 A4 (595×842 pt) 為基準，等比縮放
                    const A4_W = 595, A4_H = 842;
                    const ratio = Math.min(A4_W / width, A4_H / height, 1);
                    const imgW = width * ratio;
                    const imgH = height * ratio;

                    const page = merged.addPage([A4_W, A4_H]);
                    page.drawImage(embeddedImage, {
                        x: (A4_W - imgW) / 2,
                        y: (A4_H - imgH) / 2,
                        width: imgW,
                        height: imgH,
                    });
                }
            }

            const pdfBytes = await merged.save();
            const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `merged-${Date.now()}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('PDF 合併失敗：', err);
            alert('合併失敗，請確認檔案未加密或格式正確。');
        } finally {
            setIsMerging(false);
        }
    };

    return (
        <div className="flex flex-col gap-3 p-3">
            {/* 標題 */}
            <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-brand-secondary dark:bg-brand-primary/40 text-brand-primary rounded-xl flex items-center justify-center">
                    <FilePlus2 size={15} />
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">PDF 合併工具</p>
                    <p className="text-[10px] text-slate-600 dark:text-slate-300">PDF・PNG・JPG → 單一 PDF</p>
                </div>
            </div>

            {/* 拖放上傳區 */}
            <div
                onDragOver={handleDropZoneDragOver}
                onDragLeave={handleDropZoneDragLeave}
                onDrop={handleDropZoneDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                    flex flex-row items-center gap-2.5
                    border-2 border-dashed rounded-2xl px-3 py-2.5 cursor-pointer
                    transition-all duration-200 select-none
                    ${isDragOver
                        ? 'border-brand-primary bg-brand-secondary dark:bg-brand-primary/20 scale-[0.98]'
                        : 'border-slate-200 dark:border-slate-700 hover:border-brand-primary/60 dark:hover:border-brand-primary hover:bg-slate-50 dark:hover:bg-slate-800/50'}
                `}
            >
                <FilePlus2 size={20} className={`shrink-0 ${isDragOver ? 'text-brand-primary' : 'text-slate-300 dark:text-slate-600'}`} />
                <div className="flex flex-col min-w-0">
                    <p className="text-[12px] font-medium text-slate-600 dark:text-slate-300">拖放或點擊選取</p>
                    <p className="text-[10px] text-slate-600 dark:text-slate-300">支援 PDF · PNG · JPG</p>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }}
                />
            </div>

            {/* 已加入的檔案列表 */}
            {items.length > 0 && (
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                        <p className="text-[12px] uppercase tracking-wider font-bold text-slate-600 dark:text-slate-300">
                            合併順序（可拖曳調整）
                        </p>
                        <button
                            onClick={() => setItems([])}
                            className="text-[12px] text-slate-600 dark:text-slate-300 hover:text-red-500 transition-colors"
                        >
                            清除全部
                        </button>
                    </div>

                    <div className="h-48 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden relative">
                        <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-1.5 flex flex-col gap-1">
                            {items.map((item, idx) => (
                                <div
                                    key={item.id}
                                    draggable
                                    onDragStart={() => handleItemDragStart(idx)}
                                    onDragEnter={() => handleItemDragEnter(idx)}
                                    onDragEnd={handleItemDragEnd}
                                    onDragOver={e => e.preventDefault()}
                                    className={`
                                        flex items-center gap-2 px-2 py-1.5 rounded-xl
                                        bg-slate-50 dark:bg-slate-800
                                        border transition-all duration-150 cursor-grab active:cursor-grabbing
                                        ${dragOverIdx === idx && draggedIdx !== idx
                                            ? 'border-brand-primary dark:border-brand-primary bg-brand-secondary dark:bg-brand-primary/20'
                                            : 'border-slate-200 dark:border-slate-700'}
                                        ${draggedIdx === idx ? 'opacity-40' : 'opacity-100'}
                                    `}
                                >
                                    <GripVertical size={13} className="text-slate-300 dark:text-slate-600 shrink-0" />
                                    <div className="flex items-center justify-center w-6 h-6 rounded-lg shrink-0 bg-brand-secondary dark:bg-brand-primary/40 text-brand-primary">
                                        {item.type === 'pdf' ? <FileText size={12} /> : <ImageIcon size={12} />}
                                    </div>
                                    <span className="text-[11px] text-slate-600 dark:text-slate-300 truncate flex-1 min-w-0">
                                        {item.file.name}
                                    </span>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        aria-label={`移除檔案 ${item.file.name}`}
                                        className="md-ripple-root p-1 rounded-full text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-colors shrink-0"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 合併按鈕 */}
                    <RippleButton
                        variant="filled"
                        onClick={handleMerge}
                        disabled={isMerging}
                        className={`w-full justify-center bg-brand-primary hover:bg-brand-primary/90 ${isMerging ? 'opacity-60' : ''}`}
                    >
                        {isMerging
                            ? <><Loader2 size={14} className="animate-spin" /> 合併中…</>
                            : <><Download size={14} /> 合併並下載</>}
                    </RippleButton>

                    {/* 清除 unused import warning */}
                    {false && <Trash2 size={0} />}
                </div>
            )}
        </div>
    );
};

export default PdfMergeTool;
