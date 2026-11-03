import React from 'react';
import { Cloud, CheckCircle2, ShieldCheck, X } from 'lucide-react';

interface LoginExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogin: () => void;
  reason?: 'share' | 'save' | 'general';
}

export const LoginExplanationModal: React.FC<LoginExplanationModalProps> = ({
  isOpen,
  onClose,
  onConfirmLogin,
  reason = 'general',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-7 border border-stone-100 text-stone-800">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mb-4">
          <Cloud className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-stone-900 tracking-tight mb-2">
          {reason === 'share'
            ? 'Masuk untuk Membagikan Link'
            : reason === 'save'
            ? 'Masuk untuk Menyimpan ke Akun'
            : 'Masuk dengan Akun Google'}
        </h3>

        <p className="text-sm text-stone-600 leading-relaxed mb-5">
          {reason === 'share'
            ? 'Untuk membuat link interaktif publik dan kode QR yang dapat diakses siswa tanpa batas waktu, materi perlu disimpan ke akun cloud Anda.'
            : 'Simpan materi dan game Anda ke cloud agar dapat diakses dari laptop, proyektor kelas, atau tablet kapan saja.'}
        </p>

        <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-100 text-xs text-stone-700 mb-6">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Siswa tidak perlu login:</strong> Murid langsung membuka link atau scan QR untuk bermain/belajar.
            </span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Draf lokal tetap aman:</strong> Anda tetap bisa membuat materi secara offline sebagai tamu.
            </span>
          </div>
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Gratis & Privat:</strong> Hanya materi yang Anda bagikan yang bisa dilihat siswa Anda.
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={onConfirmLogin}
            className="w-full sm:flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12.24 10.285V13.4h6.887C18.2 16.14 15.645 18 12.24 18c-3.315 0-6-2.685-6-6s2.685-6 6-6c1.61 0 3.09.62 4.225 1.635l2.4-2.4C17.065 3.51 14.79 2.5 12.24 2.5 7.02 2.5 2.76 6.76 2.76 12s4.26 9.5 9.48 9.5c5.46 0 9.1-3.84 9.1-9.26 0-.62-.06-1.22-.16-1.74H12.24z" />
            </svg>
            <span>Lanjut Masuk Google</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};
