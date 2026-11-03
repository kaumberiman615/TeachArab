/**
 * Batasan ukuran dan aturan media untuk Teach Arab
 */

export const MEDIA_LIMITS = {
  IMAGE_MAX_BYTES: 5 * 1024 * 1024, // 5 MB
  IMAGE_MAX_MB: 5,
  AUDIO_MAX_BYTES: 10 * 1024 * 1024, // 10 MB
  AUDIO_MAX_MB: 10,
  VIDEO_MAX_BYTES: 50 * 1024 * 1024, // 50 MB
  VIDEO_MAX_MB: 50,
};

export const YOUTUBE_VIDEO_RECOMMENDATION =
  'Untuk video materi pembelajaran atau video berukuran besar (>50MB), disarankan menggunakan tautan YouTube agar siswa dapat memutar video dengan lancar tanpa buffering dan hemat kuota.';

export const CLOUDINARY_MEDIA_NOTICE =
  'Media (gambar & audio) yang dibagikan lewat tautan tersimpan di layanan Cloudinary untuk akses publik cepat siswa.';

/**
 * Validasi ukuran media sebelum diunggah
 */
export function validateMediaSize(
  blob: Blob,
  fileName?: string
): { valid: boolean; error?: string } {
  const mime = blob.type || '';
  const size = blob.size;
  const displayName = fileName || 'File';

  if (mime.startsWith('image/')) {
    if (size > MEDIA_LIMITS.IMAGE_MAX_BYTES) {
      const actualMb = (size / (1024 * 1024)).toFixed(1);
      return {
        valid: false,
        error: `Ukuran gambar "${displayName}" (${actualMb}MB) melebihi batas maksimal ${MEDIA_LIMITS.IMAGE_MAX_MB}MB. Silakan kompres gambar terlebih dahulu.`,
      };
    }
  } else if (mime.startsWith('audio/')) {
    if (size > MEDIA_LIMITS.AUDIO_MAX_BYTES) {
      const actualMb = (size / (1024 * 1024)).toFixed(1);
      return {
        valid: false,
        error: `Ukuran rekaman audio "${displayName}" (${actualMb}MB) melebihi batas maksimal ${MEDIA_LIMITS.AUDIO_MAX_MB}MB.`,
      };
    }
  } else if (mime.startsWith('video/')) {
    if (size > MEDIA_LIMITS.VIDEO_MAX_BYTES) {
      const actualMb = (size / (1024 * 1024)).toFixed(1);
      return {
        valid: false,
        error: `Ukuran video "${displayName}" (${actualMb}MB) melebihi batas maksimal ${MEDIA_LIMITS.VIDEO_MAX_MB}MB. ${YOUTUBE_VIDEO_RECOMMENDATION}`,
      };
    }
  }

  return { valid: true };
}
