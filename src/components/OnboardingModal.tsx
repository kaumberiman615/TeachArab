import { useState, useRef } from 'react';
import {
  Sparkles,
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  BookOpen,
  Gamepad2,
  Download,
  Share2,
  Monitor,
  Users,
  Zap,
} from 'lucide-react';
import { setSafeLocalStorage, ONBOARDING_COMPLETED_KEY } from '../utils/safeStorage';
import { useModalAccessibility } from '../utils/useModalAccessibility';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (path: string) => void;
}

interface StepData {
  step: number;
  badge: string;
  badgeColor: string;
  title: string;
  tagline: string;
  points: {
    icon: any;
    title: string;
    desc: string;
    color: string;
  }[];
}

const STEPS: StepData[] = [
  {
    step: 1,
    badge: 'Langkah 1 dari 4',
    badgeColor: 'bg-[#FED034] text-[#0A254D]',
    title: 'Pilih Format Materi atau Game',
    tagline: 'Teach Arab menyediakan 14 template interaktif siap pakai yang terbagi rapi dalam 2 kategori utama:',
    points: [
      {
        icon: BookOpen,
        title: 'Kategori Materi (4 Format)',
        desc: 'Slide Presentasi, Kosakata Bergambar, Teks Bacaan (Qira\'ah), dan Tabel Tashrif. Disusun untuk penyampaian pelajaran yang runtut dan jelas.',
        color: 'bg-[#E6F7F5] text-[#00B4D8] border-[#00B4D8]/30',
      },
      {
        icon: Gamepad2,
        title: 'Kategori Game (10 Format Permainan)',
        desc: 'Flashcard 3D, Kuis Pilihan Ganda, Susun Huruf & Kalimat, Memory Card, Roda Acak, Benar/Salah, Isian Singkat, dan Tebak Media untuk evaluasi seru.',
        color: 'bg-[#FFF0F6] text-[#FF3B8D] border-[#FF3B8D]/30',
      },
    ],
  },
  {
    step: 2,
    badge: 'Langkah 2 dari 4',
    badgeColor: 'bg-[#FF3B8D] text-white',
    title: 'Isi di Editor, Input Cepat, atau Bantuan AI',
    tagline: 'Hemat waktu persiapan guru dengan 3 cara pengisian materi yang sangat fleksibel:',
    points: [
      {
        icon: Zap,
        title: 'Input Cepat (Batch Paste)',
        desc: 'Punya puluhan kata dari buku atau Excel? Cukup tempel dengan format baris sederhana, semua soal akan terbuat dalam 1 detik.',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
      },
      {
        icon: Sparkles,
        title: 'Bantuan AI Gemini',
        desc: 'Ketik tema materi Anda, AI akan membantu menyusun draf kosakata berharakat lengkap, pilihan ganda, benar/salah, atau kalimat rumpang.',
        color: 'bg-[#FFE4EE] text-[#FF3B8D] border-pink-200',
      },
      {
        icon: CheckCircle2,
        title: 'Editor Visual Lengkap',
        desc: 'Lengkapi tulisan Arab berharakat utuh, rekam suara guru lewat mikrofon, dan lampirkan gambar pendukung dengan mudah.',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      },
    ],
  },
  {
    step: 3,
    badge: 'Langkah 3 dari 4',
    badgeColor: 'bg-[#00B4D8] text-white',
    title: 'Unduh File Mandiri atau Bagikan Link',
    tagline: 'Pilih cara distribusi yang paling sesuai dengan kebutuhan ruang kelas dan murid Anda:',
    points: [
      {
        icon: Download,
        title: 'Unduh HTML Mandiri (100% Offline)',
        desc: 'Simpan berkas .html ke flashdisk dan bawa ke sekolah. Bisa dibuka di laptop proyektor tanpa membutuhkan koneksi internet sama sekali.',
        color: 'bg-sky-50 text-[#00B4D8] border-sky-200',
      },
      {
        icon: Share2,
        title: 'Bagikan Link & Kode QR untuk Siswa',
        desc: 'Siswa dapat membuka materi di HP atau tablet masing-masing secara instan tanpa perlu mendaftar atau login akun.',
        color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      },
    ],
  },
  {
    step: 4,
    badge: 'Langkah 4 dari 4',
    badgeColor: 'bg-[#0A254D] text-white',
    title: 'Mainkan di Kelas dengan Proyektor & Tim',
    tagline: 'Ciptakan suasana belajar bahasa Arab yang aktif, hidup, dan interaktif:',
    points: [
      {
        icon: Monitor,
        title: 'Tampilan Layar Penuh Proyektor',
        desc: 'Font Arab standar internasional (Amiri, Noto Naskh) dengan baris harakat yang tidak terpotong, nyaman dibaca dari baris belakang kelas.',
        color: 'bg-blue-50 text-blue-700 border-blue-200',
      },
      {
        icon: Users,
        title: 'Mode Kompetisi Tim (2 - 4 Tim)',
        desc: 'Mainkan kuis atau mencocokkan kata bersama kelompok siswa. Dilengkapi papan giliran dan penghitungan skor otomatis di 1 layar.',
        color: 'bg-[#FFF8DC] text-[#0A254D] border-amber-300',
      },
    ],
  },
];

export default function OnboardingModal({ isOpen, onClose, onNavigate }: OnboardingModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useModalAccessibility(isOpen, onClose, modalRef);

  if (!isOpen) return null;

  const currentStep = STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STEPS.length - 1;

  const handleFinish = (targetPath?: string) => {
    // Simpan status sudah melihat onboarding ke localStorage secara aman
    setSafeLocalStorage(ONBOARDING_COMPLETED_KEY, 'true');
    onClose();
    if (targetPath && onNavigate) {
      onNavigate(targetPath);
    }
  };

  const handleNext = () => {
    if (isLastStep) {
      handleFinish();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0A254D]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Tur Pengenalan Teach Arab"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-white rounded-[32px] max-w-xl w-full flex flex-col shadow-2xl overflow-hidden border-2 border-[#0A254D] my-auto animate-in zoom-in-95 duration-200 outline-none"
      >
        
        {/* Top Header Bar */}
        <div className="px-5 sm:px-6 py-4 border-b-2 border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-[#0A254D]/15 shadow-2xs ${currentStep.badgeColor}`}
            >
              {currentStep.badge}
            </span>
            <span className="text-xs font-black text-[#0A254D] hidden sm:inline">
              · Tur Pengenalan Guru
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSkip}
              className="min-h-[44px] px-3 text-xs font-bold text-stone-500 hover:text-[#0A254D] cursor-pointer transition-colors"
            >
              Lewati Tur
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className="w-11 h-11 flex items-center justify-center text-stone-400 hover:text-[#0A254D] hover:bg-stone-200/60 rounded-full transition-colors cursor-pointer"
              aria-label="Tutup Tur"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Progress Bar (4 Dots / Bars) */}
        <div className="px-5 sm:px-6 pt-4 flex items-center gap-2">
          {STEPS.map((s, idx) => {
            const isActive = idx === currentStepIndex;
            const isDone = idx < currentStepIndex;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-2 flex-1 rounded-full transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FF3B8D]'
                    : isDone
                    ? 'bg-[#00B4D8]'
                    : 'bg-stone-200 hover:bg-stone-300'
                }`}
                title={`Buka langkah ${s.step}`}
              />
            );
          })}
        </div>

        {/* Modal Main Content */}
        <div className="p-5 sm:p-7 space-y-5 overflow-y-auto max-h-[65vh]">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0A254D] tracking-tight leading-snug">
              {currentStep.title}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 font-medium mt-1 leading-relaxed">
              {currentStep.tagline}
            </p>
          </div>

          {/* Cards for this step */}
          <div className="space-y-3">
            {currentStep.points.map((pt, pIdx) => {
              const IconComp = pt.icon;
              return (
                <div
                  key={pIdx}
                  className={`p-4 rounded-2xl border-2 transition-all flex items-start gap-3.5 ${pt.color}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-stone-200/60 shadow-2xs flex items-center justify-center shrink-0 mt-0.5">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-black text-sm text-[#0A254D]">{pt.title}</h3>
                    <p className="text-xs text-stone-700 leading-relaxed font-medium">
                      {pt.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Special Quick Action for the last step */}
          {isLastStep && (
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => handleFinish('/materi')}
                className="flex-1 min-h-[44px] py-2.5 px-4 bg-[#00B4D8] hover:bg-[#0096C7] text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-[0_2px_0_#0077B6] cursor-pointer transition-all active:translate-y-0.5"
              >
                <BookOpen className="w-4 h-4" />
                <span>Mulai Buat Materi</span>
              </button>
              <button
                type="button"
                onClick={() => handleFinish('/game')}
                className="flex-1 min-h-[44px] py-2.5 px-4 bg-[#FF3B8D] hover:bg-[#E62879] text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-[0_2px_0_#C2185B] cursor-pointer transition-all active:translate-y-0.5"
              >
                <Gamepad2 className="w-4 h-4" />
                <span>Mulai Buat Game</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Bottom Navigation Bar */}
        <div className="px-5 sm:px-6 py-4 bg-stone-50 border-t-2 border-stone-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={isFirstStep}
            className="min-h-[44px] px-4 py-2 text-xs font-black text-stone-600 hover:text-[#0A254D] disabled:opacity-30 disabled:pointer-events-none rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Sebelumnya</span>
          </button>

          <div className="text-[11px] font-black text-stone-400">
            {currentStepIndex + 1} dari {STEPS.length}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="min-h-[44px] px-6 py-2.5 bg-[#FF3B8D] hover:bg-[#E62879] text-white font-black text-xs sm:text-sm rounded-full border-2 border-[#0A254D] shadow-[0_3px_0_#0A254D] flex items-center gap-2 cursor-pointer transition-all active:translate-y-0.5 active:shadow-[0_1px_0_#0A254D]"
          >
            <span>{isLastStep ? 'Selesai & Mulai Mengajar' : 'Lanjut'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
