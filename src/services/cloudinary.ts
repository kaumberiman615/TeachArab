import { validateMediaSize } from '../config/limits';

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  bytes: number;
}

export interface CloudinaryParsedError {
  title: string;
  userMessage: string;
  suggestion: string;
  code?: string | number;
  originalError: string;
}

export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
export const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';

export const isCloudinaryConfigured = Boolean(
  CLOUDINARY_CLOUD_NAME.trim() && CLOUDINARY_UPLOAD_PRESET.trim()
);

/**
 * Validasi status konfigurasi Cloudinary
 */
export function getCloudinaryConfigStatus(): {
  isReady: boolean;
  missingKeys: string[];
  warningMessage?: string;
  fixSuggestion?: string;
} {
  const missing: string[] = [];
  if (!CLOUDINARY_CLOUD_NAME.trim()) missing.push('VITE_CLOUDINARY_CLOUD_NAME');
  if (!CLOUDINARY_UPLOAD_PRESET.trim()) missing.push('VITE_CLOUDINARY_UPLOAD_PRESET');

  if (missing.length > 0) {
    return {
      isReady: false,
      missingKeys: missing,
      warningMessage: `Konfigurasi Cloudinary belum lengkap. Variabel ${missing.join(' dan ')} belum disetel.`,
      fixSuggestion:
        'Untuk membagikan media interaktif ke siswa lewat tautan, tambahkan variabel lingkungan tersebut di file .env (lokal) atau di menu Settings > Environment Variables di dashboard Vercel.',
    };
  }

  return { isReady: true, missingKeys: [] };
}

/**
 * Mengurai respon error dari Cloudinary dan mengonversinya menjadi bahasa Indonesia yang informatif dengan saran perbaikan singkat
 */
export function parseCloudinaryError(
  status: number,
  rawResponse: string,
  fileName?: string
): CloudinaryParsedError {
  let serverMessage = '';
  let serverCode = '';

  try {
    const parsed = JSON.parse(rawResponse);
    if (parsed.error) {
      serverMessage = parsed.error.message || '';
      serverCode = parsed.error.code || '';
    }
  } catch {
    serverMessage = rawResponse.substring(0, 300);
  }

  const lowerMsg = serverMessage.toLowerCase();
  const fileLabel = fileName ? `"${fileName}"` : 'berkas media';

  // 1. Preset Belum Unsigned
  if (
    lowerMsg.includes('whitelist') ||
    lowerMsg.includes('must be unsigned') ||
    lowerMsg.includes('not unsigned') ||
    lowerMsg.includes('signed preset')
  ) {
    return {
      title: 'Upload Preset Belum Unsigned',
      userMessage: `Upload preset Cloudinary "${CLOUDINARY_UPLOAD_PRESET}" belum diatur ke mode Unsigned.`,
      suggestion:
        'Buka Cloudinary Console > Settings (ikon roda gigi) > Upload > Upload presets > Edit preset Anda > ubah Signing Mode dari "Signed" menjadi "Unsigned" > Simpan.',
      code: status,
      originalError: serverMessage,
    };
  }

  // 2. Preset Tidak Ditemukan
  if (
    lowerMsg.includes('upload preset must be specified') ||
    lowerMsg.includes('does not exist') ||
    lowerMsg.includes('was not found') ||
    lowerMsg.includes("can't find upload preset") ||
    lowerMsg.includes('invalid preset')
  ) {
    return {
      title: 'Upload Preset Tidak Ditemukan',
      userMessage: `Upload preset "${CLOUDINARY_UPLOAD_PRESET}" tidak ditemukan di Cloudinary.`,
      suggestion:
        'Pastikan nama preset di VITE_CLOUDINARY_UPLOAD_PRESET sama persis dengan yang ada di Cloudinary Console > Settings > Upload > Upload presets.',
      code: status,
      originalError: serverMessage,
    };
  }

  // 3. Cloud Name Salah / Endpoint 404
  if (
    status === 404 ||
    lowerMsg.includes('invalid cloud_name') ||
    lowerMsg.includes('cloud name') ||
    lowerMsg.includes('resource not found') ||
    lowerMsg.includes('unknown cloud')
  ) {
    return {
      title: 'Cloud Name Tidak Ditemukan',
      userMessage: `Nama Cloud "${CLOUDINARY_CLOUD_NAME}" tidak valid atau salah.`,
      suggestion:
        'Periksa kembali VITE_CLOUDINARY_CLOUD_NAME di file .env atau Vercel. Dapatkan Cloud Name yang benar dari dashboard utama Cloudinary.',
      code: status,
      originalError: serverMessage,
    };
  }

  // 4. File Terlalu Besar
  if (
    lowerMsg.includes('file size') ||
    lowerMsg.includes('too large') ||
    lowerMsg.includes('exceeds the limit') ||
    lowerMsg.includes('maximum size') ||
    status === 413
  ) {
    return {
      title: 'Ukuran Berkas Terlalu Besar',
      userMessage: `Ukuran ${fileLabel} melebihi batas kuota yang diizinkan oleh Cloudinary.`,
      suggestion:
        'Kompres gambar atau persingkat audio Anda. Untuk video berukuran besar (>50MB), disarankan menyematkan tautan YouTube.',
      code: status,
      originalError: serverMessage,
    };
  }

  // 5. Jaringan Terputus / Diblokir / CORS
  if (status === 0 || lowerMsg.includes('network') || lowerMsg.includes('failed to fetch')) {
    return {
      title: 'Koneksi Jaringan Gagal',
      userMessage: `Tidak dapat terhubung ke server Cloudinary saat mengunggah ${fileLabel}.`,
      suggestion:
        'Periksa koneksi internet Anda. Jika menggunakan ekstensi AdBlocker atau VPN, pastikan domain api.cloudinary.com tidak diblokir.',
      code: 'NETWORK_ERROR',
      originalError: serverMessage || 'Network / CORS error',
    };
  }

  // 6. Timeout
  if (status === -1 || lowerMsg.includes('timeout')) {
    return {
      title: 'Waktu Unggah Habis (Timeout)',
      userMessage: `Waktu pengunggahan ${fileLabel} habis (timeout) setelah 60 detik.`,
      suggestion: 'Koneksi internet lambat atau berkas terlalu besar. Silakan periksa koneksi dan coba lagi.',
      code: 'TIMEOUT',
      originalError: serverMessage || 'Timeout after 60s',
    };
  }

  // Fallback
  return {
    title: 'Gagal Mengunggah ke Cloudinary',
    userMessage: `Gagal mengunggah ${fileLabel}: ${serverMessage || 'Status HTTP ' + status}`,
    suggestion:
      'Periksa kembali konfigurasi Cloudinary Anda dan pastikan koneksi internet stabil.',
    code: status || serverCode || 'UNKNOWN',
    originalError: serverMessage,
  };
}

export class CloudinaryUploadError extends Error {
  public parsedInfo: CloudinaryParsedError;

  constructor(parsedInfo: CloudinaryParsedError) {
    super(parsedInfo.userMessage);
    this.name = 'CloudinaryUploadError';
    this.parsedInfo = parsedInfo;
  }
}

/**
 * Mengunggah media (Blob/File) ke Cloudinary lewat unsigned upload.
 * Melacak progres dengan XMLHttpRequest onprogress.
 */
export async function uploadToCloudinary(
  blob: Blob,
  fileName: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const cloudName = CLOUDINARY_CLOUD_NAME.trim();
  const uploadPreset = CLOUDINARY_UPLOAD_PRESET.trim();

  // Validasi konfigurasi sebelum request
  if (!cloudName || !uploadPreset) {
    const status = getCloudinaryConfigStatus();
    console.error('[Cloudinary] Konfigurasi environment belum disetel:', status);
    const parsed: CloudinaryParsedError = {
      title: 'Konfigurasi Cloudinary Belum Diisi',
      userMessage: status.warningMessage || 'Variabel lingkungan Cloudinary belum lengkap.',
      suggestion: status.fixSuggestion || 'Setel VITE_CLOUDINARY_CLOUD_NAME dan VITE_CLOUDINARY_UPLOAD_PRESET.',
      code: 'MISSING_CONFIG',
      originalError: 'Missing Cloudinary environment variables',
    };
    throw new CloudinaryUploadError(parsed);
  }

  // Validasi batasan ukuran lokal
  const validation = validateMediaSize(blob, fileName);
  if (!validation.valid) {
    console.warn('[Cloudinary] Validasi ukuran file gagal:', { fileName, size: blob.size, error: validation.error });
    const parsed: CloudinaryParsedError = {
      title: 'Ukuran Berkas Melebihi Batas',
      userMessage: validation.error || 'Ukuran file melebihi batas yang diizinkan.',
      suggestion: 'Kompres file gambar atau audio Anda sebelum mengunggah.',
      code: 'SIZE_LIMIT_EXCEEDED',
      originalError: validation.error || 'Size limit exceeded',
    };
    throw new CloudinaryUploadError(parsed);
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/auto/upload`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    const safeName = (fileName || `media_${Date.now()}`).replace(/[^a-zA-Z0-9._-]/g, '_');
    formData.append('file', blob, safeName);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'teacharab_media');

    // Progress listener
    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && event.total > 0) {
          const percent = Math.min(100, Math.round((event.loaded / event.total) * 100));
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          const secureUrl = response.secure_url || response.url;
          if (!secureUrl) {
            const parsed = parseCloudinaryError(xhr.status, xhr.responseText, fileName);
            console.error('[Cloudinary] Respon tidak memuat URL media:', xhr.responseText);
            reject(new CloudinaryUploadError(parsed));
            return;
          }
          if (onProgress) onProgress(100);
          resolve(secureUrl);
        } catch (parseErr) {
          console.error('[Cloudinary] Gagal mengurai respon JSON:', parseErr, xhr.responseText);
          const parsed = parseCloudinaryError(xhr.status, xhr.responseText, fileName);
          reject(new CloudinaryUploadError(parsed));
        }
      } else {
        const parsed = parseCloudinaryError(xhr.status, xhr.responseText, fileName);
        console.error('[Cloudinary Upload Error Details]:', {
          status: xhr.status,
          fileName,
          cloudName,
          uploadPreset,
          rawResponse: xhr.responseText,
          parsed,
        });
        reject(new CloudinaryUploadError(parsed));
      }
    };

    xhr.onerror = () => {
      const parsed = parseCloudinaryError(0, 'Network / CORS error', fileName);
      console.error('[Cloudinary Network Error]:', {
        endpoint,
        fileName,
        cloudName,
        status: xhr.status,
      });
      reject(new CloudinaryUploadError(parsed));
    };

    xhr.ontimeout = () => {
      const parsed = parseCloudinaryError(-1, 'Timeout error', fileName);
      console.error('[Cloudinary Timeout Error]:', {
        endpoint,
        fileName,
        cloudName,
        timeout: xhr.timeout,
      });
      reject(new CloudinaryUploadError(parsed));
    };

    xhr.timeout = 60000; // 60 detik timeout
    xhr.open('POST', endpoint, true);
    xhr.send(formData);
  });
}
