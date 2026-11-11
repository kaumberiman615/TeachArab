import { Heart, MessageSquare, ExternalLink, ShieldCheck, Lock, Cloud, HardDrive } from 'lucide-react';
import Logo from './Logo';
import { APP_CONFIG } from '../config/appConfig';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-white border-t-2 border-stone-100 pt-8 pb-10 px-4 sm:px-6 text-xs text-stone-600">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Main Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          {/* Logo & Version Badge */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <Logo variant="full" size="sm" showTagline={false} />
            <span className="px-2.5 py-0.5 rounded-full bg-[#FED034]/30 text-[#0A254D] font-black text-[11px] border border-[#FED034]">
              {APP_CONFIG.VERSION}
            </span>
            <span className="text-stone-300 hidden sm:inline" aria-hidden="true">·</span>
            <span className="font-semibold text-stone-500 text-xs hidden sm:inline">
              {APP_CONFIG.TAGLINE}
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 font-bold text-xs text-stone-600">
            <button
              type="button"
              onClick={() => onNavigate('/materi-saya')}
              className="hover:text-[#00B4D8] transition-colors cursor-pointer text-[#0A254D]"
            >
              Materi Saya
            </button>
            <span className="text-stone-300" aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => onNavigate('/draf')}
              className="hover:text-[#0A254D] transition-colors cursor-pointer"
            >
              Draf Lokal
            </button>
            <span className="text-stone-300" aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => onNavigate('/bantuan')}
              className="hover:text-[#FF3B8D] transition-colors cursor-pointer"
            >
              Panduan
            </button>
            <span className="text-stone-300" aria-hidden="true">·</span>
            <a
              href={APP_CONFIG.FEEDBACK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#FF3B8D] hover:text-[#E62879] transition-colors font-black"
              title="Kirim saran dan masukan guru"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Umpan Balik Guru</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </div>
        </div>

        {/* Catatan Privasi & Keamanan Data (Ketentuan 3) */}
        <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-500">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="inline-flex items-center gap-1 font-bold text-stone-600">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00B4D8]" />
              <span>Privasi Guru & Siswa:</span>
            </span>
            <span className="inline-flex items-center gap-1 bg-stone-50 px-2 py-0.5 rounded-md border border-stone-200">
              <HardDrive className="w-3 h-3 text-stone-400" />
              <span>Draf tamu di browser (IndexedDB)</span>
            </span>
            <span className="inline-flex items-center gap-1 bg-stone-50 px-2 py-0.5 rounded-md border border-stone-200">
              <Cloud className="w-3 h-3 text-sky-500" />
              <span>Media tautan di Cloudinary</span>
            </span>
            <span className="inline-flex items-center gap-1 bg-stone-50 px-2 py-0.5 rounded-md border border-stone-200">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>Data akun guru di Firebase</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 text-stone-400 font-medium">
            <span>Dibuat dengan</span>
            <Heart className="w-3.5 h-3.5 text-[#FF3B8D] fill-[#FF3B8D]" />
            <span>untuk Pendidikan Bahasa Arab</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
