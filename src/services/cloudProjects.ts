import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db, handleFirestoreError, OperationType } from './firebase';
import { uploadToCloudinary, CloudinaryUploadError } from './cloudinary';
import { CloudProject, Draft, TemplateType } from '../types';

export function generateShareId(): string {
  // 6 to 8 alphanumeric lowercase characters
  return Math.random().toString(36).substring(2, 9);
}

export class FirestoreSaveError extends Error {
  readonly isFirestoreError = true;
  readonly originalError?: unknown;
  constructor(message: string, originalError?: unknown) {
    super(message);
    this.name = 'FirestoreSaveError';
    this.originalError = originalError;
  }
}

/**
 * Recursively cleans any object or nested structure before passing to Firestore.
 * 1. Omit properties with `undefined` values from objects.
 * 2. In arrays, replace `undefined` with `null`.
 * 3. Preserves Firestore special values: Date, Timestamp, FieldValue, DocumentReference.
 * 4. Ensures optional fields (explanation, notes, audioUrl, imageUrl) never leak undefined.
 */
export function sanitizeForFirestore<T = any>(val: T): T {
  if (val === undefined) {
    return undefined as unknown as T;
  }
  if (val === null || typeof val !== 'object') {
    return val;
  }

  // Preserve Date instances
  if (val instanceof Date) {
    return val;
  }

  // Preserve Firestore Timestamp, FieldValue, and DocumentReference
  const constructorName = (val as any).constructor?.name;
  if (
    constructorName === 'Timestamp' ||
    constructorName === 'FieldValue' ||
    typeof (val as any).toDate === 'function' ||
    ('_methodName' in (val as any)) ||
    (val as any).type === 'document'
  ) {
    return val;
  }

  // Array handling: clean each item, map undefined to null
  if (Array.isArray(val)) {
    const cleanedArr: any[] = [];
    for (const item of val) {
      if (item === undefined) {
        cleanedArr.push(null);
      } else {
        const cleaned = sanitizeForFirestore(item);
        cleanedArr.push(cleaned === undefined ? null : cleaned);
      }
    }
    return cleanedArr as unknown as T;
  }

  // Plain object handling: omit any key whose value is undefined
  const cleanedObj: Record<string, any> = {};
  for (const [k, v] of Object.entries(val)) {
    if (v === undefined) {
      continue;
    }
    const cleanedVal = sanitizeForFirestore(v);
    if (cleanedVal !== undefined) {
      cleanedObj[k] = cleanedVal;
    }
  }

  return cleanedObj as unknown as T;
}

export interface FailedFileUpload {
  mediaId: string;
  fileName: string;
  error: string;
  suggestion?: string;
  title?: string;
}

export interface MediaUploadProgressCallbackInfo {
  currentIndex: number;
  totalItems: number;
  fileName: string;
  itemPercent: number;
  failedCount?: number;
}

export type MediaUploadProgressCallback = (info: MediaUploadProgressCallbackInfo) => void;

export interface SaveCloudProjectResult {
  project: CloudProject;
  totalMediaCount: number;
  succeededMediaCount: number;
  failedFiles: FailedFileUpload[];
}

export async function saveDraftToCloud(
  draft: Draft,
  user: User,
  existingProjectId?: string,
  onProgress?: MediaUploadProgressCallback
): Promise<SaveCloudProjectResult> {
  const projectId = existingProjectId || `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const shareId = generateShareId();

  // Load existing project if any, to retrieve existing mediaRefs
  const projectRef = doc(db, 'projects', projectId);
  let existingData: CloudProject | null = null;
  try {
    const existingDoc = await getDoc(projectRef);
    if (existingDoc.exists()) {
      existingData = existingDoc.data() as CloudProject;
    }
  } catch (err) {
    console.warn('Gagal membaca dokumen proyek lama (mungkin proyek baru):', err);
  }

  // Identify all media items to upload or reuse
  const mediaRefs: Record<string, string> = {};
  if (existingData?.mediaRefs) {
    for (const [k, v] of Object.entries(existingData.mediaRefs)) {
      if (typeof v === 'string' && v.trim()) {
        mediaRefs[k] = v.trim();
      }
    }
  }

  const mediaEntries = Object.entries(draft.mediaFiles || {});
  const itemsToUpload: Array<{ mediaId: string; blob: Blob; name: string }> = [];

  for (const [mediaId, mediaItem] of mediaEntries) {
    if (!mediaItem) continue;

    // Check if media already has a valid remote URL (avoid duplicate uploads)
    const existingUrl = (mediaItem as any).url || mediaRefs[mediaId];
    if (existingUrl && typeof existingUrl === 'string' && (existingUrl.startsWith('http://') || existingUrl.startsWith('https://'))) {
      mediaRefs[mediaId] = existingUrl;
      continue;
    }

    if (mediaItem.blob) {
      itemsToUpload.push({
        mediaId,
        blob: mediaItem.blob,
        name: mediaItem.name || `${mediaId}.bin`,
      });
    }
  }

  // Upload to Cloudinary sequentially with progress notifications per file
  const totalToUpload = itemsToUpload.length;
  const failedFiles: FailedFileUpload[] = [];
  let succeededCount = 0;

  for (let i = 0; i < totalToUpload; i++) {
    const item = itemsToUpload[i];
    if (onProgress) {
      onProgress({
        currentIndex: i + 1,
        totalItems: totalToUpload,
        fileName: item.name,
        itemPercent: 0,
        failedCount: failedFiles.length,
      });
    }

    try {
      const secureUrl = await uploadToCloudinary(item.blob, item.name, (percent) => {
        if (onProgress) {
          onProgress({
            currentIndex: i + 1,
            totalItems: totalToUpload,
            fileName: item.name,
            itemPercent: percent,
            failedCount: failedFiles.length,
          });
        }
      });

      if (typeof secureUrl === 'string' && secureUrl.trim()) {
        mediaRefs[item.mediaId] = secureUrl.trim();
        succeededCount++;
      }
    } catch (err: unknown) {
      console.error(`[saveDraftToCloud] Gagal mengunggah berkas "${item.name}":`, err);
      let errorMsg = 'Gagal mengunggah berkas media ke Cloudinary.';
      let suggestionMsg: string | undefined;
      let titleMsg: string | undefined;

      if (err instanceof CloudinaryUploadError) {
        errorMsg = err.parsedInfo.userMessage;
        suggestionMsg = err.parsedInfo.suggestion;
        titleMsg = err.parsedInfo.title;
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }

      // DO NOT set mediaRefs[item.mediaId] = undefined!
      // Add to failedFiles for reporting
      failedFiles.push({
        mediaId: item.mediaId,
        fileName: item.name,
        error: errorMsg,
        suggestion: suggestionMsg,
        title: titleMsg,
      });
    }
  }

  // Clean mediaRefs: strictly keep valid string URLs, never undefined or empty
  const cleanMediaRefs: Record<string, string> = {};
  for (const [k, v] of Object.entries(mediaRefs)) {
    if (typeof v === 'string' && v.trim().length > 0) {
      cleanMediaRefs[k] = v.trim();
    }
  }

  // Clean draft items: ensure no undefined in optional fields (notes, explanation, questionLatin, etc.)
  const cleanItems = (draft.items || []).map((item) => {
    if (!item || typeof item !== 'object') return item;
    const cleaned: Record<string, any> = {};
    for (const [key, val] of Object.entries(item)) {
      if (val !== undefined) {
        cleaned[key] = val;
      }
    }
    return cleaned;
  });

  const now = Date.now();
  const rawProjectData: CloudProject = {
    id: projectId,
    ownerId: user.uid,
    templateType: draft.templateType,
    title: draft.title || 'Materi Tanpa Judul',
    description: draft.description || '',
    content: {
      theme: draft.theme,
      settings: draft.settings,
      items: cleanItems,
      mediaUrls: cleanMediaRefs,
    },
    mediaRefs: cleanMediaRefs,
    createdAt: existingData?.createdAt || now,
    updatedAt: now,
    isPublic: existingData?.isPublic ?? false,
    shareId: existingData?.shareId || shareId,
  };

  // Perform full recursive sanitization for Firestore
  const projectData = sanitizeForFirestore(rawProjectData);

  try {
    await setDoc(projectRef, projectData, { merge: true });
    return {
      project: projectData,
      totalMediaCount: totalToUpload,
      succeededMediaCount: succeededCount,
      failedFiles,
    };
  } catch (error) {
    console.error('[saveDraftToCloud] Gagal menyimpan data (Firestore):', error);
    throw new FirestoreSaveError(
      `Gagal menyimpan data (Firestore): ${error instanceof Error ? error.message : String(error)}`,
      error
    );
  }
}

export async function getUserProjects(uid: string): Promise<CloudProject[]> {
  try {
    const q = query(collection(db, 'projects'), where('ownerId', '==', uid));
    const snapshot = await getDocs(q);
    const projects: CloudProject[] = [];
    snapshot.forEach((d) => {
      projects.push(d.data() as CloudProject);
    });
    // Sort in memory by updatedAt descending
    projects.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    return projects;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'projects');
  }
}

export async function getProjectById(projectId: string): Promise<CloudProject | null> {
  try {
    const projectRef = doc(db, 'projects', projectId);
    const snapshot = await getDoc(projectRef);
    if (!snapshot.exists()) return null;
    return snapshot.data() as CloudProject;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `projects/${projectId}`);
  }
}

export async function getPublicProjectByShareId(shareId: string): Promise<CloudProject | null> {
  try {
    const q = query(
      collection(db, 'projects'),
      where('shareId', '==', shareId),
      where('isPublic', '==', true)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }
    const docData = snapshot.docs[0].data() as CloudProject;
    return docData;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'projects');
  }
}

export async function toggleProjectPublic(
  projectId: string,
  isPublic: boolean,
  currentShareId?: string
): Promise<string> {
  const shareId = currentShareId || generateShareId();
  try {
    const projectRef = doc(db, 'projects', projectId);
    const updatePayload = sanitizeForFirestore({
      isPublic,
      shareId,
      updatedAt: Date.now(),
    });
    await updateDoc(projectRef, updatePayload);
    return shareId;
  } catch (error) {
    console.error('[toggleProjectPublic] Gagal memperbarui status publik (Firestore):', error);
    throw new FirestoreSaveError(
      `Gagal menyimpan data (Firestore): ${error instanceof Error ? error.message : String(error)}`,
      error
    );
  }
}

export async function deleteCloudProject(projectId: string): Promise<void> {
  try {
    const projectRef = doc(db, 'projects', projectId);
    await deleteDoc(projectRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `projects/${projectId}`);
  }
}

export async function duplicateCloudProject(projectId: string, user: User): Promise<CloudProject> {
  const original = await getProjectById(projectId);
  if (!original) {
    throw new Error('Proyek tidak ditemukan');
  }

  const newId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newShareId = generateShareId();
  const now = Date.now();

  const duplicate: CloudProject = sanitizeForFirestore({
    ...original,
    id: newId,
    ownerId: user.uid,
    title: `${original.title} (Salinan)`,
    isPublic: false,
    shareId: newShareId,
    createdAt: now,
    updatedAt: now,
  });

  try {
    await setDoc(doc(db, 'projects', newId), duplicate);
    return duplicate;
  } catch (error) {
    console.error('[duplicateCloudProject] Gagal menduplikasi materi (Firestore):', error);
    throw new FirestoreSaveError(
      `Gagal menyimpan data (Firestore): ${error instanceof Error ? error.message : String(error)}`,
      error
    );
  }
}
