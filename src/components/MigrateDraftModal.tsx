import React, { useRef } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';
import { useModalAccessibility } from '../utils/useModalAccessibility';

interface MigrateDraftModalProps {
  isOpen: boolean;
  draftTitle: string;
  onConfirm: () => void;
  onDismiss: () => void;
}

export const MigrateDraftModal: React.FC<MigrateDraftModalProps> = ({
  isOpen,
  draftTitle,
  onConfirm,
  onDismiss,
}) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  useModalAccessibility(isOpen, onDismiss, modalRef);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/60 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Simpan Draf ke Cloud"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-7 border-2 border-stone-200 text-navy-deep outline-none"
      >
        <button
          onClick={onDismiss}
          type="button"
          className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center text-stone-400 hover:text-navy-deep rounded-full hover:bg-stone-100 transition-colors"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-13 h-13 bg-cyan-ice text-cyan-bubble rounded-2xl flex items-center justify-center mb-4 border border-cyan-bubble/20 shadow-xs">
          <UploadCloud className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-black text-navy-deep tracking-tight mb-2">
          Simpan Draf ke Akun Anda?
        </h3>

        <p className="text-sm text-stone-600 leading-relaxed mb-4">
          Anda berhasil masuk! Draf materi yang sedang Anda kerjakan saat ini dapat langsung disimpan ke cloud akun Google Anda:
        </p>

        <div className="flex items-center gap-3 p-3.5 bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl mb-6">
          <div className="w-10 h-10 bg-yellow-bubble/20 text-navy-deep rounded-xl flex items-center justify-center shrink-0 font-bold">
            <FileText className="w-5 h-5 text-amber-600" />
          </div>
          <div className="overflow-hidden">
            <div className="text-xs text-stone-500 font-medium">Draf aktif:</div>
            <div className="text-sm font-bold text-navy-deep truncate">
              {draftTitle || 'Materi Tanpa Judul'}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full sm:flex-1 min-h-[44px] py-3 px-4 bg-pink-bubble hover:bg-pink-bubble/90 text-white font-black text-sm rounded-full shadow-[0_3px_0_#D81B60] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Ya, Simpan ke Akun</span>
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="w-full sm:w-auto min-h-[44px] py-3 px-5 bg-stone-100 hover:bg-stone-200 text-navy-deep font-bold text-sm rounded-full transition-colors cursor-pointer"
          >
            Nanti Saja
          </button>
        </div>
      </div>
    </div>
  );
};
