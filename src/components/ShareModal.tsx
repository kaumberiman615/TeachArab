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
          dark: '#0A254D', // Deep navy
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
      <div className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl p-6 sm:p-8 border-2 border-stone-100 text-stone-800 max-h-[90vh] overflow-y-auto space-y-5">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 w-11 h-11 flex items-center justify-center text-stone-400 hover:text-[#0A254D] rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#FFF0F6] text-[#FF3B8D] rounded-2xl flex items-center justify-center shadow-xs border border-[#FF3B8D]/20">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#0A254D] leading-tight">
              Bagikan Materi ke Siswa
            </h3>
            <p className="text-xs text-stone-500 truncate max-w-xs sm:max-w-sm font-medium">
              {title}
            </p>
          </div>
        </div>

        {/* Status Switch */}
        <div className="p-4 rounded-2xl border-2 border-stone-100 bg-[#FAFCFC] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                isPublic ? 'bg-[#00B4D8] text-white' : 'bg-stone-200 text-stone-600'
              }`}
            >
              {isPublic ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black text-[#0A254D]">
                {isPublic ? 'Link Publik Aktif' : 'Link Dinonaktifkan'}
              </div>
              <div className="text-[11px] text-stone-500 font-medium">
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
            className={`min-h-[40px] px-3.5 py-1.5 text-xs font-black rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
              isPublic
                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                : 'bg-[#00B4D8] text-white hover:bg-[#0096C7] shadow-xs'
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
              <label className="block text-xs font-black text-[#0A254D] mb-1.5">
                Link Langsung Siswa:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={publicUrl}
                  className="w-full text-xs font-mono bg-stone-100 text-[#0A254D] border-2 border-stone-200 rounded-2xl px-3.5 py-3 select-all focus:outline-hidden font-medium"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="min-h-[44px] px-4 py-2 bg-[#FF3B8D] hover:bg-[#E62879] text-white rounded-full text-xs font-black flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-[0_3px_0_#C2185B] active:translate-y-0.5 active:shadow-none"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
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
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-[#FAFCFC] rounded-3xl border-2 border-stone-100">
              <div className="bg-white p-2.5 rounded-2xl shadow-xs border-2 border-stone-100 shrink-0">
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
                  <div className="text-xs font-black text-[#0A254D] mb-1">
                    Scan Kode QR di Kelas
                  </div>
                  <p className="text-[11px] text-stone-500 leading-relaxed font-medium">
                    Tampilkan di proyektor atau cetak di kertas agar siswa dapat langsung scan dengan kamera ponsel masing-masing.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={handleDownloadQR}
                    className="min-h-[40px] px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-[#0A254D] rounded-full text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-200"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Gambar QR</span>
                  </button>

                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="min-h-[40px] px-3.5 py-1.5 bg-[#E6F7F5] hover:bg-[#00B4D8] hover:text-white text-[#00B4D8] rounded-full text-xs font-black flex items-center gap-1.5 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Uji Coba Siswa</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200 space-y-2">
            <Lock className="w-8 h-8 text-stone-400 mx-auto" />
            <p className="text-sm font-black text-[#0A254D]">
              Link Berbagi Sedang Nonaktif
            </p>
            <p className="text-xs text-stone-500 max-w-xs mx-auto font-medium">
              Siswa tidak dapat membuka tautan ini sampai Anda menekan tombol aktifkan di atas.
            </p>
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleToggle(true)}
              className="min-h-[44px] px-5 py-2.5 bg-[#00B4D8] hover:bg-[#0096C7] text-white rounded-full text-xs font-black transition-all shadow-[0_3px_0_#0077B6] active:translate-y-0.5 cursor-pointer inline-flex items-center gap-1.5"
            >
              {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Aktifkan dan Bagikan Sekarang</span>
            </button>
          </div>
        )}

        <div className="pt-3 border-t border-stone-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-6 py-2 bg-stone-100 hover:bg-stone-200 text-[#0A254D] text-xs font-black rounded-full transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
