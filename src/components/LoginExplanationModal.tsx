import React from 'react';
import { Cloud, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { LogoIcon } from './Logo';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl p-6 sm:p-8 border-2 border-stone-100 text-stone-800 space-y-5">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 w-11 h-11 flex items-center justify-center text-stone-400 hover:text-[#0A254D] rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        <div className="flex flex-col items-center gap-2">
          <LogoIcon size={56} className="shadow-md" />
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-stone-100 text-[#0A254D] text-xs font-black">
            <span>Teach</span><span className="text-[#FF3B8D]">Arab</span>
            <span className="text-stone-300">·</span>
            <span className="text-stone-600 font-bold">Cloud Guru</span>
          </div>
        </div>

        <div>
          <h3 className="text-xl sm:text-2xl font-black text-[#0A254D] tracking-tight">
            {reason === 'share'
              ? 'Masuk untuk Membagikan Link'
              : reason === 'save'
              ? 'Masuk untuk Menyimpan ke Akun'
              : 'Masuk dengan Akun Google'}
          </h3>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mt-2 font-medium">
            {reason === 'share'
              ? 'Untuk membuat tautan interaktif publik dan kode QR yang dapat dibuka siswa dari rumah kapan saja, materi perlu disimpan ke akun cloud Anda.'
              : 'Simpan materi dan game Anda ke cloud agar dapat dibuka dari laptop, komputer proyektor kelas, atau tablet sekolah mana pun.'}
          </p>
        </div>

        <div className="space-y-3 bg-[#FAFCFC] p-4 rounded-2xl border-2 border-stone-100 text-xs text-stone-700">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#00B4D8] shrink-0 mt-0.5" />
            <span className="font-medium">
              <strong className="text-[#0A254D]">Siswa tidak perlu login:</strong> Murid langsung membuka link atau scan QR untuk bermain/belajar.
            </span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#00B4D8] shrink-0 mt-0.5" />
            <span className="font-medium">
              <strong className="text-[#0A254D]">Draf lokal tetap aman:</strong> Anda tetap bisa membuat materi secara offline sebagai tamu.
            </span>
          </div>
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#00B4D8] shrink-0 mt-0.5" />
            <span className="font-medium">
              <strong className="text-[#0A254D]">Gratis & Privat:</strong> Hanya materi yang Anda bagikan yang dapat dilihat oleh siswa Anda.
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <button
            type="button"
            onClick={onConfirmLogin}
            className="w-full sm:flex-1 min-h-[48px] py-3 px-5 bg-[#00B4D8] hover:bg-[#0096C7] text-white font-black text-xs rounded-full shadow-[0_3px_0_#0077B6] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
              <path d="M12.24 10.285V13.4h6.887C18.2 16.14 15.645 18 12.24 18c-3.315 0-6-2.685-6-6s2.685-6 6-6c1.61 0 3.09.62 4.225 1.635l2.4-2.4C17.065 3.51 14.79 2.5 12.24 2.5 7.02 2.5 2.76 6.76 2.76 12s4.26 9.5 9.48 9.5c5.46 0 9.1-3.84 9.1-9.26 0-.62-.06-1.22-.16-1.74H12.24z" />
            </svg>
            <span>Lanjut Masuk Google</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] py-3 px-5 bg-stone-100 hover:bg-stone-200 text-[#0A254D] font-bold text-xs rounded-full transition-colors cursor-pointer"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};
