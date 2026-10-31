import { Draft, DraftSummary } from '../types';

const DB_NAME = 'teach_arab_db';
const DB_VERSION = 1;
const STORE_NAME = 'drafts';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
        store.createIndex('templateType', 'templateType', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveDraft(draft: Draft): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const updatedDraft: Draft = {
      ...draft,
      updatedAt: Date.now(),
    };
    const req = store.put(updatedDraft);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getDraft(id: string): Promise<Draft | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);
    req.onsuccess = () => {
      resolve(req.result || null);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getAllDrafts(): Promise<DraftSummary[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => {
      const drafts: Draft[] = req.result || [];
      // Sort newest first
      drafts.sort((a, b) => b.updatedAt - a.updatedAt);
      const summaries: DraftSummary[] = drafts.map((d) => ({
        id: d.id,
        title: d.title || 'Draf Tanpa Judul',
        description: d.description || '',
        templateType: d.templateType,
        itemCount: Array.isArray(d.items) ? d.items.length : 0,
        hasMedia: Object.keys(d.mediaFiles || {}).length > 0,
        updatedAt: d.updatedAt,
        createdAt: d.createdAt,
      }));
      resolve(summaries);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteDraft(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
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
  // approximate JSON size
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
