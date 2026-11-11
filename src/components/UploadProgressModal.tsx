import React, { useRef } from 'react';
import {
  Cloud,
  AlertCircle,
  RefreshCw,
  X,
  CheckCircle2,
  Film,
  AlertTriangle,
  FileWarning,
  Download,
  Share2,
} from 'lucide-react';
import { CLOUDINARY_MEDIA_NOTICE, YOUTUBE_VIDEO_RECOMMENDATION } from '../config/limits';
import { FailedFileUpload } from '../services/cloudProjects';
import { useModalAccessibility } from '../utils/useModalAccessibility';

export interface UploadProgressData {
  currentIndex: number;
  totalItems: number;
  fileName: string;
  itemPercent: number;
  failedCount?: number;
}

export interface CloudinaryConfigWarningData {
  missingKeys: string[];
  warningMessage?: string;
  fixSuggestion?: string;
}

interface UploadProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  status:
    | 'config_missing'
    | 'uploading'
    | 'saving_firestore'
    | 'partial_success'
    | 'completed'
    | 'error';
  progress: UploadProgressData | null;
  error: string | null;
  errorTitle?: string | null;
  errorSuggestion?: string | null;
  failedFiles?: FailedFileUpload[];
  configWarning?: CloudinaryConfigWarningData | null;
  onRetry: () => void;
  onProceedAnyway?: () => void;
  onOpenExport?: () => void;
}

export const UploadProgressModal: React.FC<UploadProgressModalProps> = ({
  isOpen,
  onClose,
  status,
  progress,
  error,
  errorTitle,
  errorSuggestion,
  failedFiles = [],
  configWarning,
  onRetry,
  onProceedAnyway,
  onOpenExport,
}) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const canClose = status !== 'uploading' && status !== 'saving_firestore';
  useModalAccessibility(isOpen && canClose, onClose, modalRef);

  if (!isOpen) return null;

  const total = progress?.totalItems || 0;
  const current = progress?.currentIndex || 0;
  const itemPercent = progress?.itemPercent || 0;

  // Approximate overall percentage
  const overallPercent =
    total > 0
      ? Math.min(100, Math.round(((current - 1 + itemPercent / 100) / total) * 100))
      : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/60 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Status Unggah & Simpan Cloud"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-7 border-2 border-stone-200 text-navy-deep max-h-[90vh] overflow-y-auto outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-xs ${
                status === 'config_missing'
                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : status === 'error'
                  ? 'bg-rose-100 text-rose-700 border-rose-200'
                  : status === 'partial_success'
                  ? 'bg-yellow-bubble/20 text-navy-deep border-yellow-bubble/40'
                  : status === 'completed'
                  ? 'bg-cyan-ice text-cyan-bubble border-cyan-bubble/30'
                  : 'bg-cyan-ice text-cyan-bubble border-cyan-bubble/30'
              }`}
            >
              {status === 'config_missing' ? (
                <AlertTriangle className="w-6 h-6" />
              ) : status === 'error' ? (
                <AlertCircle className="w-6 h-6" />
              ) : status === 'partial_success' ? (
                <FileWarning className="w-6 h-6" />
              ) : status === 'completed' ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <Cloud className="w-6 h-6 animate-pulse" />
              )}
            </div>
            <div>
              <h3 className="text-base font-black text-navy-deep leading-tight">
                {status === 'config_missing' && 'Konfigurasi Cloudinary Belum Diisi'}
                {status === 'uploading' && 'Mengunggah Media ke Cloud...'}
                {status === 'saving_firestore' && 'Menyimpan Materi ke Akun...'}
                {status === 'partial_success' && 'Unggah Sebagian Berhasil'}
                {status === 'completed' && 'Media Siap Dibagikan!'}
                {status === 'error' && (errorTitle || 'Gagal Mengunggah Media')}
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">
                {status === 'config_missing' && 'Pengaturan cloud diperlukan untuk menyimpan media online.'}
                {status === 'uploading' &&
                  `Mengunggah berkas ${current} dari ${total} (${progress?.fileName || 'media'})`}
                {status === 'saving_firestore' && 'Menyimpan tautan media & pengaturan ke database.'}
                {status === 'partial_success' &&
                  `${total - failedFiles.length} dari ${total} berkas berhasil disimpan.`}
                {status === 'completed' && 'Semua gambar & audio siap diakses siswa.'}
                {status === 'error' && (
                  errorTitle?.includes('Firestore')
                    ? 'Terjadi kendala saat menyimpan ke database Firestore.'
                    : 'Terjadi kendala pada proses unggah media Cloudinary.'
                )}
              </p>
            </div>
          </div>
          {(status === 'error' || status === 'config_missing' || status === 'partial_success') && (
            <button
              onClick={onClose}
              type="button"
              className="w-11 h-11 flex items-center justify-center text-stone-400 hover:text-navy-deep rounded-full hover:bg-stone-100 transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 1. Config Missing Warning View */}
        {status === 'config_missing' && (
          <div className="my-3 space-y-3">
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 leading-relaxed space-y-2">
              <p className="font-semibold text-amber-950">
                {configWarning?.warningMessage ||
                  'Variabel VITE_CLOUDINARY_CLOUD_NAME atau VITE_CLOUDINARY_UPLOAD_PRESET masih kosong.'}
              </p>
              <p className="text-stone-700">
                {configWarning?.fixSuggestion ||
                  'Tambahkan kredensial Cloudinary di file .env (lokal) atau Environment Variables Vercel.'}
              </p>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl text-[11px] text-stone-700 space-y-1">
              <p className="font-semibold text-stone-900">Alternatif Praktis:</p>
              <p>
                Anda tetap dapat mengunduh materi ini sebagai <strong>File HTML Mandiri</strong> atau{' '}
                <strong>ZIP</strong>. Berkas dapat dibuka di laptop atau proyektor kelas 100% offline tanpa
                membutuhkan koneksi internet maupun akun cloud.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              {onOpenExport && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenExport();
                  }}
                  className="flex-1 min-h-[44px] py-2.5 px-4 bg-cyan-bubble hover:bg-cyan-bubble/90 text-white font-black text-xs rounded-full shadow-[0_3px_0_#0087A2] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Offline (HTML / ZIP)</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] py-2.5 px-5 bg-stone-100 hover:bg-stone-200 text-navy-deep font-bold text-xs rounded-full transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        {/* 2. Uploading Progress View */}
        {status === 'uploading' && (
          <div className="space-y-4 my-3">
            <div className="p-3 bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl">
              <div className="flex justify-between text-xs font-bold text-navy-deep mb-1.5">
                <span className="truncate max-w-[280px]">
                  Mengunggah {current} dari {total}:{' '}
                  <span className="text-cyan-bubble">{progress?.fileName || 'berkas'}</span>
                </span>
                <span className="text-cyan-bubble font-black">{itemPercent}%</span>
              </div>
              <div className="w-full bg-stone-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-cyan-bubble h-3 rounded-full transition-all duration-200 ease-out"
                  style={{ width: `${itemPercent}%` }}
                />
              </div>
            </div>

            {total > 1 && (
              <div>
                <div className="flex justify-between text-[11px] text-stone-600 mb-1 font-semibold">
                  <span>Progres Total ({current}/{total} berkas)</span>
                  <span className="font-black text-navy-deep">{overallPercent}%</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-pink-bubble h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${overallPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. Saving Firestore View */}
        {status === 'saving_firestore' && (
          <div className="py-5 text-center space-y-2.5">
            <div className="w-10 h-10 border-4 border-cyan-bubble border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-navy-deep">
              Menyimpan data materi dan tautan media ke database...
            </p>
            <p className="text-[11px] text-stone-600">Hampir selesai, mohon tunggu sebentar.</p>
          </div>
        )}

        {/* 4. Partial Success View (Some failed, some succeeded) */}
        {status === 'partial_success' && (
          <div className="my-3 space-y-3">
            <div className="p-3 bg-yellow-bubble/20 border border-yellow-bubble/40 rounded-2xl text-xs text-navy-deep">
              <p className="font-bold mb-1">
                Sebagian berkas berhasil disimpan ({total - failedFiles.length} dari {total} berkas).
              </p>
              <p className="text-stone-700">
                Namun terdapat {failedFiles.length} berkas yang gagal diunggah:
              </p>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {failedFiles.map((f, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl text-xs space-y-1"
                >
                  <div className="flex items-center gap-1.5 font-bold text-rose-900 truncate">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>{f.fileName}</span>
                  </div>
                  <p className="text-rose-800 text-[11px]">{f.error}</p>
                  {f.suggestion && (
                    <p className="text-stone-700 text-[10px] bg-white/70 p-1.5 rounded border border-rose-100">
                      💡 <strong>Saran:</strong> {f.suggestion}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              {onProceedAnyway && (
                <button
                  type="button"
                  onClick={onProceedAnyway}
                  className="flex-1 min-h-[44px] py-2.5 px-4 bg-pink-bubble hover:bg-pink-bubble/90 text-white font-black text-xs rounded-full shadow-[0_3px_0_#D81B60] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Lanjutkan Bagikan Link</span>
                </button>
              )}
              <button
                type="button"
                onClick={onRetry}
                className="min-h-[44px] py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-navy-deep font-bold text-xs rounded-full transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Coba Lagi Berkas Gagal</span>
              </button>
            </div>
          </div>
        )}

        {/* 5. Error View (All failed) */}
        {status === 'error' && (
          <div className="my-3 space-y-3">
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-2">
              <p className="font-bold text-rose-950">
                {errorTitle || 'Gagal Mengunggah Berkas Media'}
              </p>
              <p className="text-rose-800 leading-relaxed">
                {error || (errorTitle?.includes('Firestore') ? 'Gagal menyimpan dokumen materi ke database Firestore.' : 'Terjadi gangguan saat mengunggah ke Cloudinary.')}
              </p>
              {errorSuggestion && (
                <div className="mt-2 p-2.5 bg-white/80 rounded-xl border border-rose-200 text-[11px] text-stone-800 leading-relaxed">
                  <p className="font-semibold text-stone-900 mb-0.5">💡 Langkah Perbaikan Singkat:</p>
                  <p>{errorSuggestion}</p>
                </div>
              )}
            </div>

            {failedFiles.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold text-stone-700">Daftar Berkas Gagal:</p>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {failedFiles.map((f, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-stone-50 border border-stone-200 rounded-lg text-[11px] flex items-center justify-between gap-2"
                    >
                      <span className="font-medium text-stone-800 truncate">{f.fileName}</span>
                      <span className="text-rose-600 text-[10px] shrink-0 font-medium">{f.error}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onRetry}
                className="flex-1 min-h-[44px] py-2.5 px-4 bg-pink-bubble hover:bg-pink-bubble/90 text-white font-black text-xs rounded-full shadow-[0_3px_0_#D81B60] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Coba Lagi</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] py-2.5 px-5 bg-stone-100 hover:bg-stone-200 text-navy-deep font-bold text-xs rounded-full transition-colors cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {/* Cloudinary Notice and Video Recommendation */}
        <div className="mt-4 pt-3 border-t border-stone-100 space-y-2">
          <div className="flex items-start gap-2 text-[11px] text-stone-600 leading-relaxed">
            <Cloud className="w-3.5 h-3.5 text-stone-600 shrink-0 mt-0.5" />
            <span>{CLOUDINARY_MEDIA_NOTICE}</span>
          </div>

          <div className="flex items-start gap-2 text-[11px] text-amber-900 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/50 leading-relaxed">
            <Film className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
            <span>{YOUTUBE_VIDEO_RECOMMENDATION}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
