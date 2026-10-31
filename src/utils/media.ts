/**
 * Media compression, validation, recording, and conversion utilities
 */

export const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5 MB
export const MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10 MB
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB

/**
 * Compress an image file using client-side canvas
 */
export async function compressImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.8
): Promise<{ blob: Blob; mimeType: string }> {
  return new Promise((resolve, reject) => {
    // If it's not an image or is SVG, don't re-compress with canvas
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
      resolve({ blob: file, mimeType: file.type });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ blob: file, mimeType: file.type });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Use webp or jpeg for compact compression
        const targetType = 'image/jpeg';
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ blob, mimeType: targetType });
            } else {
              resolve({ blob: file, mimeType: file.type });
            }
          },
          targetType,
          quality
        );
      };
      img.onerror = () => reject(new Error('Gagal memuat gambar'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.readAsDataURL(file);
  });
}

/**
 * Convert Blob to Base64 Data URL for offline HTML embedding
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Extract YouTube ID from various URL formats
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}
