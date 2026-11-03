import React, { useEffect, useState } from 'react';
import { X, Copy, Check, QrCode, Download, ExternalLink, Globe, Lock, Loader2 } from 'lucide-react';
import QRCode from 'qrcode';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  shareId: string;
  isPublic: boolean;
  onTogglePublic: (newStatus: boolean) => Promise<void>;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  shareId,
  isPublic,
  onTogglePublic,
}) => {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Derive public URL
  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}#/p/${shareId}`
    : `#/p/${shareId}`;

  useEffect(() => {
    if (isOpen && shareId) {
      QRCode.toDataURL(publicUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#064e3b', // emerald 900
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Gagal generate QR code:', err));
    }
  }, [isOpen, shareId, publicUrl]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = publicUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `QR_${title.replace(/\s+/g, '_')}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handleToggle = async (status: boolean) => {
    setIsUpdating(true);
    try {
      await onTogglePublic(status);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-7 border border-stone-200 text-stone-800 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900 leading-tight">
              Bagikan Materi ke Siswa
            </h3>
            <p className="text-xs text-stone-500 truncate max-w-xs sm:max-w-sm">
              {title}
            </p>
          </div>
        </div>

        {/* Status Switch */}
        <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50 mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isPublic ? 'bg-emerald-600 text-white' : 'bg-stone-300 text-stone-600'
              }`}
            >
              {isPublic ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-sm font-bold text-stone-900">
                {isPublic ? 'Link Publik Aktif' : 'Link Dinonaktifkan'}
              </div>
              <div className="text-xs text-stone-500">
                {isPublic
                  ? 'Siswa dapat membuka materi via link & QR'
                  : 'Siswa tidak dapat mengakses link ini'}
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={isUpdating}
            onClick={() => handleToggle(!isPublic)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              isPublic
                ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                : 'bg-emerald-700 text-white hover:bg-emerald-800'
            }`}
          >
            {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isPublic ? 'Matikan Link' : 'Aktifkan Link'}</span>
          </button>
        </div>

        {isPublic ? (
          <div className="space-y-5">
            {/* Link Box */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Link Langsung Siswa:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={publicUrl}
                  className="w-full text-xs font-mono bg-stone-100 text-stone-800 border border-stone-300 rounded-xl px-3 py-2.5 select-all focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer shadow-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-200" />
                      <span>Disalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <div className="bg-white p-2 rounded-2xl shadow-xs border border-stone-200 shrink-0">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR Code Materi"
                    className="w-36 h-36 rounded-xl object-contain"
                  />
                ) : (
                  <div className="w-36 h-36 flex items-center justify-center bg-stone-100 rounded-xl">
                    <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-between text-center sm:text-left space-y-3 w-full">
                <div>
                  <div className="text-xs font-bold text-stone-900 mb-1">
                    Scan Kode QR di Kelas
                  </div>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    Tampilkan di proyektor atau cetak lembar tugas agar siswa dapat langsung scan dengan kamera smartphone masing-masing.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={handleDownloadQR}
                    className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Gambar QR</span>
                  </button>

                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Uji Coba Tampilan Siswa</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-300">
            <Lock className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-stone-700 mb-1">
              Link Berbagi Sedang Nonaktif
            </p>
            <p className="text-xs text-stone-500 mb-4 max-w-xs mx-auto">
              Siswa tidak dapat membuka tautan ini sampai Anda menekan tombol aktifkan di atas.
            </p>
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleToggle(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Aktifkan dan Bagikan Sekarang</span>
            </button>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-stone-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
