import React from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-7 border border-stone-100 text-stone-800">
        <button
          onClick={onDismiss}
          type="button"
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center mb-4">
          <UploadCloud className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-stone-900 tracking-tight mb-2">
          Simpan Draf ke Akun Anda?
        </h3>

        <p className="text-sm text-stone-600 leading-relaxed mb-4">
          Anda berhasil masuk! Draf materi yang sedang Anda kerjakan saat ini dapat langsung disimpan ke cloud akun Google Anda:
        </p>

        <div className="flex items-center gap-3 p-3.5 bg-stone-50 border border-stone-200 rounded-2xl mb-6">
          <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <div className="text-xs text-stone-500 font-medium">Draf aktif:</div>
            <div className="text-sm font-bold text-stone-900 truncate">
              {draftTitle || 'Materi Tanpa Judul'}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full sm:flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Ya, Simpan ke Akun</span>
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="w-full sm:w-auto py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
          >
            Nanti Saja
          </button>
        </div>
      </div>
    </div>
  );
};
