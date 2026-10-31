import { useState, useEffect } from 'react';
import { Draft } from '../types';
import {
  generateOfflineHTML,
  generateProjectZip,
  exportDraftAsJson,
  downloadBlob,
} from '../utils/export';
import { estimateDraftSize, formatBytes } from '../services/storage';
import {
  X,
  Download,
  FileCode,
  Archive,
  FileJson,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  draft: Draft;
  onClose: () => void;
}

export default function ExportModal({ isOpen, draft, onClose }: ExportModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [estimatedSize, setEstimatedSize] = useState<string>('0 B');
  const [totalBytes, setTotalBytes] = useState<number>(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      estimateDraftSize(draft).then((res) => {
        setEstimatedSize(res.formattedSize);
        setTotalBytes(res.totalBytes);
      });
      setSuccessMessage(null);
    }
  }, [isOpen, draft]);

  if (!isOpen) return null;

  const isTooLarge = totalBytes > 15 * 1024 * 1024; // > 15MB warning

  const getCleanSlug = () => {
    return (draft.title || 'teach-arab')
      .toLowerCase()
      .replace(/[^a-z0-9]/gi, '_')
      .substring(0, 30);
  };

  // 1. Download Offline HTML
  const handleDownloadHTML = async () => {
    setIsProcessing(true);
    setSuccessMessage(null);
    try {
      const htmlContent = await generateOfflineHTML(draft);
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      downloadBlob(blob, `${getCleanSlug()}.html`);
      setSuccessMessage('File HTML Offline berhasil diunduh! Bisa dibuka tanpa internet.');
    } catch (err: any) {
      alert('Gagal membuat HTML: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Download ZIP
  const handleDownloadZIP = async () => {
    setIsProcessing(true);
    setSuccessMessage(null);
    try {
      const zipBlob = await generateProjectZip(draft);
      downloadBlob(zipBlob, `${getCleanSlug()}.zip`);
      setSuccessMessage('Paket ZIP berhasil diunduh lengkap dengan folder media!');
    } catch (err: any) {
      alert('Gagal membuat ZIP: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Export Project JSON
  const handleDownloadJSON = async () => {
    setIsProcessing(true);
    setSuccessMessage(null);
    try {
      const jsonBlob = await exportDraftAsJson(draft);
      downloadBlob(jsonBlob, `${getCleanSlug()}.teach-arab.json`);
      setSuccessMessage('File cadangan proyek JSON berhasil diunduh!');
    } catch (err: any) {
      alert('Gagal membuat JSON: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900">Unduh & Ekspor Materi</h3>
              <p className="text-xs text-stone-500">
                Pilih format sesuai kebutuhan mengajar di kelas Anda
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* File size indicator & warning */}
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between text-xs">
            <span className="text-stone-600">
              Estimasi Ukuran Data Proyek:
            </span>
            <span className="font-bold text-stone-800 text-sm">
              {estimatedSize}
            </span>
          </div>

          {isTooLarge && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Peringatan Ukuran Besar:</strong> Total media melebihi 15 MB ({formatBytes(totalBytes)}).
                Disarankan menggunakan format <strong>Unduh ZIP</strong> agar lebih optimal saat dibuka di laptop/komputer.
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Export Options */}
          <div className="space-y-2.5">
            {/* Option 1: Standalone HTML */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleDownloadHTML}
              className="w-full p-3.5 bg-stone-50 hover:bg-emerald-50/70 border border-stone-200 hover:border-emerald-300 rounded-xl text-left flex items-start gap-3 transition-all cursor-pointer group"
            >
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <FileCode className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                  <span>Unduh HTML (Offline 100%)</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                    Rekomendasi
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-0.5">
                  1 file tunggal .html mandiri. Semua foto & audio disematkan langsung. Klik 2x di laptop manapun tanpa perlu internet atau aplikasi lain!
                </p>
              </div>
            </button>

            {/* Option 2: ZIP */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleDownloadZIP}
              className="w-full p-3.5 bg-stone-50 hover:bg-emerald-50/70 border border-stone-200 hover:border-emerald-300 rounded-xl text-left flex items-start gap-3 transition-all cursor-pointer group"
            >
              <div className="p-2 bg-stone-200 text-stone-700 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Archive className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-stone-900 text-sm">
                  Unduh ZIP (Folder Media Terpisah)
                </div>
                <p className="text-xs text-stone-600 mt-0.5">
                  Berisi index.html dan folder media/ berisi file audio & gambar asli. Cocok jika media materi berukuran besar.
                </p>
              </div>
            </button>

            {/* Option 3: Project Backup JSON */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleDownloadJSON}
              className="w-full p-3.5 bg-stone-50 hover:bg-emerald-50/70 border border-stone-200 hover:border-emerald-300 rounded-xl text-left flex items-start gap-3 transition-all cursor-pointer group"
            >
              <div className="p-2 bg-stone-200 text-stone-700 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <FileJson className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-stone-900 text-sm">
                  Ekspor Proyek (.teach-arab.json)
                </div>
                <p className="text-xs text-stone-600 mt-0.5">
                  File cadangan penuh untuk dipindahkan ke HP atau laptop guru lain via WhatsApp atau Flashdisk, lalu diimpor kembali.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <span className="text-[11px] text-stone-600">
            Draf materi tetap tersimpan di browser ini.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
