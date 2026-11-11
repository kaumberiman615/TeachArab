import { useState, useEffect, useRef } from 'react';
import { Draft } from '../types';
import {
  generateOfflineHTML,
  generateProjectZip,
  exportDraftAsJson,
  downloadBlob,
} from '../utils/export';
import { estimateDraftSize, formatBytes } from '../services/storage';
import { useModalAccessibility } from '../utils/useModalAccessibility';
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
  const modalRef = useRef<HTMLDivElement | null>(null);

  useModalAccessibility(isOpen, onClose, modalRef);

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
      setSuccessMessage('File HTML Offline berhasil diunduh! Siap dibuka di proyektor tanpa internet.');
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
      setSuccessMessage('Paket ZIP berhasil diunduh lengkap dengan berkas media!');
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
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Unduh dan Ekspor Materi"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-white rounded-[32px] max-w-lg w-full shadow-2xl border-2 border-stone-100 overflow-hidden flex flex-col outline-none"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b-2 border-stone-100 flex items-center justify-between bg-[#FAFCFC]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E6F7F5] text-[#00B4D8] rounded-2xl flex items-center justify-center border border-[#00B4D8]/20">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-[#0A254D] text-base">Unduh & Ekspor Materi</h3>
              <p className="text-xs text-stone-500 font-medium">
                Pilih format yang sesuai dengan kebutuhan kelas Anda
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-[#0A254D] hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* File size indicator & warning */}
          <div className="p-3.5 bg-[#FAFCFC] border-2 border-stone-100 rounded-2xl flex items-center justify-between text-xs">
            <span className="text-stone-600 font-medium">
              Estimasi Ukuran Data Proyek:
            </span>
            <span className="font-black text-[#0A254D] text-sm bg-white px-3 py-1 rounded-full border border-stone-200">
              {estimatedSize}
            </span>
          </div>

          {isTooLarge && (
            <div className="p-3.5 bg-[#FFF8DC] border-2 border-[#FED034] rounded-2xl text-xs text-[#0A254D] flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Peringatan Ukuran Besar:</strong> Total media melebihi 15 MB ({formatBytes(totalBytes)}).
                Disarankan menggunakan format <strong>Unduh ZIP</strong> agar lebih optimal saat dibuka di laptop/komputer.
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-[#E6F7F5] border-2 border-[#00B4D8]/30 rounded-2xl text-xs text-[#00B4D8] font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Export Options */}
          <div className="space-y-3">
            {/* Option 1: Standalone HTML */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleDownloadHTML}
              className="w-full min-h-[44px] p-4 bg-white hover:bg-[#E6F7F5] border-2 border-stone-200 hover:border-[#00B4D8] rounded-2xl text-left flex items-start gap-3.5 transition-all cursor-pointer group shadow-xs active:translate-y-0.5"
            >
              <div className="w-10 h-10 bg-[#E6F7F5] text-[#00B4D8] rounded-xl flex items-center justify-center group-hover:bg-[#00B4D8] group-hover:text-white transition-colors shrink-0">
                <FileCode className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-black text-[#0A254D] text-sm flex items-center gap-2">
                  <span>Unduh HTML (Offline 100%)</span>
                  <span className="text-[10px] bg-[#FED034] text-[#0A254D] font-black px-2.5 py-0.5 rounded-full">
                    Pilihan Utama
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed font-medium">
                  1 file tunggal .html mandiri. Semua foto & audio disematkan langsung. Klik 2x di laptop manapun tanpa perlu internet atau aplikasi lain!
                </p>
              </div>
            </button>

            {/* Option 2: ZIP */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleDownloadZIP}
              className="w-full min-h-[44px] p-4 bg-white hover:bg-[#FFF0F6] border-2 border-stone-200 hover:border-[#FF3B8D] rounded-2xl text-left flex items-start gap-3.5 transition-all cursor-pointer group shadow-xs active:translate-y-0.5"
            >
              <div className="w-10 h-10 bg-stone-100 text-stone-600 rounded-xl flex items-center justify-center group-hover:bg-[#FF3B8D] group-hover:text-white transition-colors shrink-0">
                <Archive className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-black text-[#0A254D] text-sm">
                  Unduh ZIP (Folder Media Terpisah)
                </div>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed font-medium">
                  Berisi index.html dan folder media/ berisi file audio & gambar asli. Cocok jika media materi berukuran besar.
                </p>
              </div>
            </button>

            {/* Option 3: Project Backup JSON */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleDownloadJSON}
              className="w-full min-h-[44px] p-4 bg-white hover:bg-stone-50 border-2 border-stone-200 rounded-2xl text-left flex items-start gap-3.5 transition-all cursor-pointer group shadow-xs active:translate-y-0.5"
            >
              <div className="w-10 h-10 bg-stone-100 text-stone-600 rounded-xl flex items-center justify-center group-hover:bg-[#0A254D] group-hover:text-white transition-colors shrink-0">
                <FileJson className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-black text-[#0A254D] text-sm">
                  Ekspor Proyek (.teach-arab.json)
                </div>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed font-medium">
                  File cadangan penuh untuk dipindahkan ke HP atau laptop guru lain via WhatsApp atau Flashdisk, lalu diimpor kembali.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t-2 border-stone-100 bg-[#FAFCFC] flex items-center justify-between">
          <span className="text-xs text-stone-500 font-medium">
            Draf materi tetap tersimpan di browser ini.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-6 py-2 text-xs font-black text-[#0A254D] hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
