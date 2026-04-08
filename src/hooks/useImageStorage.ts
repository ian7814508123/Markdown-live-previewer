import { useState, useEffect, useCallback } from 'react';

// ─── 常數設定（可依需求調整）─────────────────────────────────────────────────────
const DB_NAME = 'mlp-images-db';
const STORE_NAME = 'images';
const DB_VERSION = 1;
const MAX_IMAGES = 50;                      // 最大圖片數量上限
const TTL_DAYS = 15;                         // 圖片時效（天）
const MAX_SIZE_PER_IMAGE_MB = 10;             // 單張圖片大小上限（MB）
const MAX_SIZE_BYTES = MAX_SIZE_PER_IMAGE_MB * 1024 * 1024;
const TTL_MS = TTL_DAYS * 24 * 60 * 60 * 1000;

// ─── 型別定義 ────────────────────────────────────────────────────────────────
export interface ImageRecord {
    id: string;
    name: string;
    dataUrl: string;
    sizeBytes: number;
    mimeType: string;
    createdAt: number;
    expiresAt: number;  // createdAt + TTL_MS
}

export interface ImageMeta {
    id: string;
    name: string;
    sizeBytes: number;
    mimeType: string;
    createdAt: number;
    expiresAt: number;
}

// ─── IndexedDB 工具函式 ──────────────────────────────────────────────────────

/** 開啟（或建立）IndexedDB 資料庫 */
function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = (e) => {
            const db = (e.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                // 建立索引以加速排序查詢
                store.createIndex('createdAt', 'createdAt', { unique: false });
                store.createIndex('expiresAt', 'expiresAt', { unique: false });
            }
        };

        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

/** 從 IndexedDB 讀取單一圖片（包含 dataUrl） */
async function dbGetImage(id: string): Promise<ImageRecord | null> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const req = tx.objectStore(STORE_NAME).get(id);
        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror = () => reject(req.error);
        tx.oncomplete = () => db.close();
    });
}

/** 讀取所有 ImageMeta（不含 dataUrl，節省記憶體） */
async function dbGetAllMeta(): Promise<ImageMeta[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const all: ImageMeta[] = [];

        const req = store.openCursor();
        req.onsuccess = (e) => {
            const cursor = (e.target as IDBRequest<IDBCursorWithValue | null>).result;
            if (cursor) {
                const { id, name, sizeBytes, mimeType, createdAt, expiresAt } = cursor.value as ImageRecord;
                all.push({ id, name, sizeBytes, mimeType, createdAt, expiresAt });
                cursor.continue();
            } else {
                resolve(all);
            }
        };
        req.onerror = () => reject(req.error);
        tx.oncomplete = () => db.close();
    });
}

/** 寫入一筆 ImageRecord */
async function dbPutImage(record: ImageRecord): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(record);
        // 必須在 tx.oncomplete（事務真正 commit）後才 resolve，
        // 否則後續 dbGetImage 可能讀不到剛寫入的資料。
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => { db.close(); reject(tx.error); };
        tx.onabort = () => { db.close(); reject(tx.error); };
    });
}

/** 刪除一筆 ImageRecord */
async function dbDeleteImage(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(id);
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => { db.close(); reject(tx.error); };
    });
}

/** 批次刪除多筆 ImageRecord */
async function dbDeleteImages(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        ids.forEach(id => store.delete(id));
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => { db.close(); reject(tx.error); };
    });
}


// ─── 輔助函式 ─────────────────────────────────────────────────────────────────

/** 生成唯一 ID（時間戳 + 隨機碼） */
function generateId(): string {
    return `img-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** 將 File 轉換成 Base64 Data URL */
function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}

/** 格式化到期日 */
export function formatExpiryDate(expiresAt: number): string {
    return new Date(expiresAt).toLocaleDateString('zh-TW', {
        year: 'numeric', month: '2-digit', day: '2-digit',
    });
}

/** 格式化檔案大小 */
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ─── Hook：useImageStorage ────────────────────────────────────────────────────

export interface UseImageStorageReturn {
    /** 所有已上傳圖片的 Meta 列表（不含 dataUrl） */
    images: ImageMeta[];
    /** 已用總容量（MB） */
    totalSizeMB: number;
    /** 圖片數量是否達到上限 */
    isAtLimit: boolean;
    /**
     * 上傳圖片。
     * @param file 要上傳的檔案
     * @param currentDocContent 目前文件內容（用於 LRU 淘汰時排除被引用圖片）
     * @returns 若成功，回傳 { id, name, markdownRef }；若失敗，回傳含 error 訊息
     */
    uploadImage: (file: File, currentDocContent?: string) => Promise<
        { success: true; id: string; name: string; markdownRef: string } |
        { success: false; error: string }
    >;
    /**
     * 取得圖片 Data URL（非同步）。
     * @param id 圖片 ID
     * @returns Data URL 或 null（若不存在）
     */
    getImage: (id: string) => Promise<string | null>;
    /**
     * 刪除圖片。
     * @param id 圖片 ID
     */
    deleteImage: (id: string) => Promise<void>;
    /** 最大圖片數量上限（供 UI 顯示） */
    maxImages: number;
    /** 單張大小上限 MB（供 UI 顯示） */
    maxSizeMB: number;
    /** TTL 天數（供 UI 顯示） */
    ttlDays: number;
}

/**
 * 管理圖片上傳、儲存、查詢與刪除。
 * 使用 IndexedDB 儲存圖片，支援 TTL 自動到期與 LRU 數量淘汰。
 */
export function useImageStorage(): UseImageStorageReturn {
    const [images, setImages] = useState<ImageMeta[]>([]);

    /** 從 IndexedDB 同步最新的 Meta 列表到 state */
    const refreshImages = useCallback(async () => {
        try {
            const all = await dbGetAllMeta();
            // 依建立時間新到舊排序
            all.sort((a, b) => b.createdAt - a.createdAt);
            setImages(all);
        } catch (err) {
            console.error('[useImageStorage] refreshImages 失敗:', err);
        }
    }, []);

    /** App 初始化時：非同步清除過期圖片，不阻塞 UI */
    useEffect(() => {
        const init = async () => {
            try {
                const all = await dbGetAllMeta();
                const now = Date.now();
                const expired = all.filter(img => img.expiresAt <= now).map(img => img.id);
                if (expired.length > 0) {
                    await dbDeleteImages(expired);
                    console.info(`[useImageStorage] 已清除 ${expired.length} 張過期圖片`);
                }
            } catch (err) {
                console.error('[useImageStorage] TTL 清理失敗:', err);
            } finally {
                await refreshImages();
            }
        };
        init();
    }, [refreshImages]);

    const uploadImage = useCallback(async (
        file: File,
        currentDocContent: string = ''
    ): Promise<
        { success: true; id: string; name: string; markdownRef: string } |
        { success: false; error: string }
    > => {
        // 1. 驗證檔案類型
        const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        if (!ALLOWED_TYPES.includes(file.type)) {
            return { success: false, error: `不支援的檔案類型：${file.type}。僅支援 JPG、PNG、GIF、WebP、SVG。` };
        }

        // 2. 驗證檔案大小
        if (file.size > MAX_SIZE_BYTES) {
            return {
                success: false,
                error: `圖片檔案過大（${formatFileSize(file.size)}），單張上傳上限為 ${MAX_SIZE_PER_IMAGE_MB} MB。`
            };
        }

        // 3. 檢查數量上限，執行 LRU 淘汰
        const all = await dbGetAllMeta();
        if (all.length >= MAX_IMAGES) {
            // 找出未被目前文件內容引用的最舊圖片
            const unreferenced = all
                .filter(img => !currentDocContent.includes(`img-local://${img.id}`))
                .sort((a, b) => a.createdAt - b.createdAt); // 最舊的在前

            if (unreferenced.length === 0) {
                return {
                    success: false,
                    error: `已達到圖片數量上限（${MAX_IMAGES} 張），且所有圖片均被文件引用，無法自動淘汰。請手動刪除不需要的圖片。`
                };
            }

            // 刪除最舊的一張
            const toEvict = unreferenced[0];
            await dbDeleteImage(toEvict.id);
            console.info(`[useImageStorage] LRU 淘汰最舊圖片：${toEvict.name} (${toEvict.id})`);
        }

        // 4. 轉換 Base64 並寫入 IndexedDB
        try {
            const dataUrl = await fileToDataUrl(file);
            const now = Date.now();
            const id = generateId();

            const record: ImageRecord = {
                id,
                name: file.name,
                dataUrl,
                sizeBytes: file.size,
                mimeType: file.type,
                createdAt: now,
                expiresAt: now + TTL_MS,
            };

            await dbPutImage(record);
            await refreshImages();

            const markdownRef = `![${file.name}](img-local://${id})`;
            return { success: true, id, name: file.name, markdownRef };
        } catch (err: any) {
            console.error('[useImageStorage] 上傳失敗:', err);
            return { success: false, error: `圖片上傳失敗：${err?.message ?? '未知錯誤'}` };
        }
    }, [refreshImages]);

    const getImage = useCallback(async (id: string): Promise<string | null> => {
        try {
            const record = await dbGetImage(id);
            if (!record) return null;
            // 若已過期，懶惰刪除
            if (record.expiresAt <= Date.now()) {
                await dbDeleteImage(id);
                await refreshImages();
                return null;
            }
            return record.dataUrl;
        } catch (err) {
            console.error('[useImageStorage] getImage 失敗:', err);
            return null;
        }
    }, [refreshImages]);

    const deleteImage = useCallback(async (id: string): Promise<void> => {
        try {
            await dbDeleteImage(id);
            await refreshImages();
        } catch (err) {
            console.error('[useImageStorage] deleteImage 失敗:', err);
        }
    }, [refreshImages]);

    const totalSizeMB = images.reduce((acc, img) => acc + img.sizeBytes, 0) / (1024 * 1024);

    return {
        images,
        totalSizeMB,
        isAtLimit: images.length >= MAX_IMAGES,
        uploadImage,
        getImage,
        deleteImage,
        maxImages: MAX_IMAGES,
        maxSizeMB: MAX_SIZE_PER_IMAGE_MB,
        ttlDays: TTL_DAYS,
    };
}
