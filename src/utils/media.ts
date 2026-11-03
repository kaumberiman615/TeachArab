import { MediaItem } from '../types';
import { MEDIA_LIMITS } from '../config/limits';

export {
  MEDIA_LIMITS,
  validateMediaSize,
  YOUTUBE_VIDEO_RECOMMENDATION,
  CLOUDINARY_MEDIA_NOTICE,
} from '../config/limits';

export const MAX_PHOTO_SIZE = MEDIA_LIMITS.IMAGE_MAX_BYTES; // 5 MB
export const MAX_AUDIO_SIZE = MEDIA_LIMITS.AUDIO_MAX_BYTES; // 10 MB
export const MAX_VIDEO_SIZE = MEDIA_LIMITS.VIDEO_MAX_BYTES; // 50 MB

/**
 * Resolves media item into an accessible URL, handling:
 * - Local IndexedDB Blobs via URL.createObjectURL
 * - Remote public URLs or data URLs
 */
export function getMediaUrl(
  media?: MediaItem | { blob?: Blob; url?: string; downloadUrl?: string } | null | string
): string | null {
  if (!media) return null;
  if (typeof media === 'string') return media;
  if ('url' in media && media.url) return media.url;
  if ('downloadUrl' in media && media.downloadUrl) return media.downloadUrl;
  if ('blob' in media && media.blob instanceof Blob) {
    try {
      return URL.createObjectURL(media.blob);
    } catch (e: unknown) {
      const err = e as { name?: string; message?: string };
      console.warn(`[getMediaUrl] Gagal createObjectURL: ${err.name} - ${err.message}`);
      return null;
    }
  }
  return null;
}

/**
 * Converts a Blob to a Base64 data URL string
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('FileReader result bukan berupa string'));
        }
      };
      reader.onerror = () => {
        reject(reader.error || new Error('Gagal membaca blob sebagai data URL'));
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Compresses an image client-side using Canvas.
 * Jika proses canvas gagal, otomatis fallback ke file/blob asli tanpa error.
 */
export async function compressImage(
  fileOrBlob: File | Blob,
  maxWidth = 1200,
  quality = 0.82
): Promise<{ blob: Blob; mimeType: string }> {
  const mimeType = fileOrBlob.type || 'image/jpeg';

  // If not an image, return original immediately
  if (!mimeType.startsWith('image/')) {
    return { blob: fileOrBlob, mimeType };
  }

  // If already small (< 300KB), return original to preserve quality
  if (fileOrBlob.size < 300 * 1024) {
    return { blob: fileOrBlob, mimeType };
  }

  try {
    return await new Promise((resolve) => {
      let objectUrl = '';
      try {
        objectUrl = URL.createObjectURL(fileOrBlob);
      } catch {
        resolve({ blob: fileOrBlob, mimeType });
        return;
      }

      const img = new Image();

      img.onload = () => {
        try {
          URL.revokeObjectURL(objectUrl);
          let { width, height } = img;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve({ blob: fileOrBlob, mimeType });
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob && blob.size < fileOrBlob.size) {
                resolve({ blob, mimeType: 'image/jpeg' });
              } else {
                resolve({ blob: fileOrBlob, mimeType });
              }
            },
            'image/jpeg',
            quality
          );
        } catch {
          // Fallback to original
          resolve({ blob: fileOrBlob, mimeType });
        }
      };

      img.onerror = () => {
        try {
          URL.revokeObjectURL(objectUrl);
        } catch {
          // Ignore
        }
        resolve({ blob: fileOrBlob, mimeType });
      };

      img.src = objectUrl;
    });
  } catch (err: unknown) {
    const e = err as { name?: string; message?: string };
    console.warn(`[compressImage Canvas Fallback] Error: ${e.name} - ${e.message}. Menggunakan file asli.`);
    return { blob: fileOrBlob, mimeType };
  }
}
