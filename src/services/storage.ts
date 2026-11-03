import { Draft, DraftSummary } from '../types';

const DB_NAME = 'teach_arab_db';
const DB_VERSION = 1;
const STORE_NAME = 'drafts';

// In-memory fallback if IndexedDB is unavailable, blocked, or quota-exceeded
const memoryDraftsStore = new Map<string, Draft>();

export let isIndexedDBSupported = typeof indexedDB !== 'undefined';
export let lastIndexedDBError: string | null = null;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      isIndexedDBSupported = false;
      const err = new Error('IndexedDB tidak didukung pada lingkungan browser ini.');
      lastIndexedDBError = err.message;
      return reject(err);
    }

    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        try {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            store.createIndex('updatedAt', 'updatedAt', { unique: false });
            store.createIndex('templateType', 'templateType', { unique: false });
          }
        } catch (upgradeErr: unknown) {
          const e = upgradeErr as { name?: string; message?: string; stack?: string };
          console.error(
            `[IndexedDB Upgrade Error] Name: ${e.name || 'Error'} | Message: ${e.message || String(upgradeErr)} | Stack: ${e.stack || 'No stack'}`
          );
        }
      };

      request.onsuccess = () => {
        isIndexedDBSupported = true;
        resolve(request.result);
      };

      request.onerror = () => {
        const reqErr = request.error;
        const msg = reqErr ? `${reqErr.name}: ${reqErr.message}` : 'Gagal membuka IndexedDB';
        lastIndexedDBError = msg;
        console.warn(
          `[IndexedDB openDB Error] Name: ${reqErr?.name || 'Error'} | Message: ${reqErr?.message || msg}`
        );
        reject(request.error || new Error(msg));
      };

      request.onblocked = () => {
        const msg = 'IndexedDB diblokir oleh tab/koneksi lain.';
        lastIndexedDBError = msg;
        console.warn(`[IndexedDB openDB Blocked] ${msg}`);
      };
    } catch (openErr: unknown) {
      const e = openErr as { name?: string; message?: string; stack?: string };
      lastIndexedDBError = `${e.name || 'Error'}: ${e.message || String(openErr)}`;
      console.error(
        `[IndexedDB Synchronous Exception] Name: ${e.name || 'Error'} | Message: ${e.message || 'Unknown'} | Stack: ${e.stack || 'No stack'}`
      );
      reject(openErr);
    }
  });
}

export interface SaveDraftResult {
  success: boolean;
  isInMemoryOnly: boolean;
  error?: string;
}

export async function saveDraft(draft: Draft): Promise<SaveDraftResult> {
  const updatedDraft: Draft = {
    ...draft,
    updatedAt: Date.now(),
  };

  // Always keep a live copy in memory store
  memoryDraftsStore.set(draft.id, updatedDraft);

  try {
    const db = await openDB();
    return await new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(updatedDraft);

        req.onsuccess = () => {
          isIndexedDBSupported = true;
          resolve({ success: true, isInMemoryOnly: false });
        };

        req.onerror = () => {
          const reqErr = req.error;
          const msg = reqErr ? `${reqErr.name}: ${reqErr.message}` : 'Gagal menulis ke IndexedDB';
          lastIndexedDBError = msg;
          console.warn(
            `[IndexedDB saveDraft Error] Name: ${reqErr?.name || 'Error'} | Message: ${reqErr?.message || msg}`
          );
          resolve({ success: true, isInMemoryOnly: true, error: msg });
        };

        tx.onabort = () => {
          const txErr = tx.error;
          const msg = txErr ? `${txErr.name}: ${txErr.message}` : 'Transaksi IndexedDB dibatalkan';
          lastIndexedDBError = msg;
          console.warn(`[IndexedDB Transaction Aborted] ${msg}`);
          resolve({ success: true, isInMemoryOnly: true, error: msg });
        };
      } catch (txErr: unknown) {
        const e = txErr as { name?: string; message?: string; stack?: string };
        const msg = `${e.name || 'Error'}: ${e.message || String(txErr)}`;
        lastIndexedDBError = msg;
        console.warn(
          `[IndexedDB Transaction Exception] Name: ${e.name || 'Error'} | Message: ${e.message || 'Unknown'} | Stack: ${e.stack || 'No stack'}`
        );
        resolve({ success: true, isInMemoryOnly: true, error: msg });
      }
    });
  } catch (err: unknown) {
    const e = err as { name?: string; message?: string; stack?: string };
    const textLog = `[Tahap: Penyimpanan IndexedDB] Name: ${e.name || 'Error'} | Message: ${e.message || 'Unknown'} | Stack: ${e.stack || 'No stack'}`;
    console.warn(textLog);
    lastIndexedDBError = `${e.name || 'Error'}: ${e.message || 'IndexedDB tidak dapat dibuka'}`;
    return { success: true, isInMemoryOnly: true, error: lastIndexedDBError };
  }
}

export async function getDraft(id: string): Promise<Draft | null> {
  try {
    const db = await openDB();
    const idbResult = await new Promise<Draft | null>((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(id);

        req.onsuccess = () => {
          resolve(req.result || null);
        };

        req.onerror = () => {
          console.warn('[IndexedDB getDraft Error]', req.error);
          resolve(null);
        };
      } catch (err) {
        console.warn('[IndexedDB getDraft Transaction Error]', err);
        resolve(null);
      }
    });

    if (idbResult) {
      memoryDraftsStore.set(id, idbResult);
      return idbResult;
    }
  } catch (err: unknown) {
    const e = err as { name?: string; message?: string; stack?: string };
    console.warn(
      `[Tahap: Membaca IndexedDB] Fallback ke Memori. Name: ${e.name || 'Error'} | Message: ${e.message || 'Unknown'} | Stack: ${e.stack || 'No stack'}`
    );
  }

  // Fallback to in-memory store
  return memoryDraftsStore.get(id) || null;
}

export async function getAllDrafts(): Promise<DraftSummary[]> {
  const mapSummaries = new Map<string, DraftSummary>();

  try {
    const db = await openDB();
    const drafts: Draft[] = await new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });

    for (const d of drafts) {
      mapSummaries.set(d.id, {
        id: d.id,
        title: d.title || 'Draf Tanpa Judul',
        description: d.description || '',
        templateType: d.templateType,
        itemCount: Array.isArray(d.items) ? d.items.length : 0,
        hasMedia: Object.keys(d.mediaFiles || {}).length > 0,
        updatedAt: d.updatedAt,
        createdAt: d.createdAt,
      });
    }
  } catch (err) {
    console.warn('[IndexedDB getAllDrafts Fallback]:', err);
  }

  // Also include drafts stored in memory
  for (const [id, d] of memoryDraftsStore.entries()) {
    if (!mapSummaries.has(id)) {
      mapSummaries.set(id, {
        id: d.id,
        title: d.title || 'Draf Tanpa Judul',
        description: d.description || '',
        templateType: d.templateType,
        itemCount: Array.isArray(d.items) ? d.items.length : 0,
        hasMedia: Object.keys(d.mediaFiles || {}).length > 0,
        updatedAt: d.updatedAt,
        createdAt: d.createdAt,
      });
    }
  }

  const list = Array.from(mapSummaries.values());
  list.sort((a, b) => b.updatedAt - a.updatedAt);
  return list;
}

export async function deleteDraft(id: string): Promise<void> {
  memoryDraftsStore.delete(id);
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  } catch {
    // Already deleted from memory
  }
}

export async function duplicateDraft(id: string): Promise<Draft> {
  const original = await getDraft(id);
  if (!original) {
    throw new Error('Draf tidak ditemukan');
  }

  const newId = 'draft_' + Math.random().toString(36).substring(2, 10);
  const duplicate: Draft = {
    ...original,
    id: newId,
    title: `${original.title} (Salinan)`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await saveDraft(duplicate);
  return duplicate;
}

export async function estimateDraftSize(draft: Draft): Promise<{ totalBytes: number; formattedSize: string }> {
  let totalBytes = 0;
  const jsonStr = JSON.stringify({
    id: draft.id,
    title: draft.title,
    description: draft.description,
    templateType: draft.templateType,
    theme: draft.theme,
    settings: draft.settings,
    items: draft.items,
  });
  totalBytes += new Blob([jsonStr]).size;

  if (draft.mediaFiles) {
    for (const media of Object.values(draft.mediaFiles)) {
      if (media && media.blob) {
        totalBytes += media.blob.size;
      }
    }
  }

  return {
    totalBytes,
    formattedSize: formatBytes(totalBytes),
  };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Mendapatkan status diagnostik IndexedDB dan jumlah berkas media
 */
export async function getStorageDiagnostics(draft?: Draft): Promise<{
  isIndexedDBReady: boolean;
  mediaCount: number;
  totalMediaBytes: number;
  formattedMediaBytes: string;
  lastError: string | null;
}> {
  let isReady = false;
  try {
    const db = await openDB();
    db.close();
    isReady = true;
  } catch {
    isReady = false;
  }

  let mediaCount = 0;
  let totalMediaBytes = 0;

  if (draft && draft.mediaFiles) {
    const entries = Object.values(draft.mediaFiles);
    mediaCount = entries.length;
    for (const item of entries) {
      if (item && item.blob) {
        totalMediaBytes += item.blob.size;
      }
    }
  }

  return {
    isIndexedDBReady: isReady,
    mediaCount,
    totalMediaBytes,
    formattedMediaBytes: formatBytes(totalMediaBytes),
    lastError: lastIndexedDBError,
  };
}
