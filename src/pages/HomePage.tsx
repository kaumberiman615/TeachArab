import {
  Sparkles,
  ArrowRight,
  Monitor,
  CheckCircle2,
  FolderArchive,
  BookOpen,
  Gamepad2,
  Layers,
} from 'lucide-react';
import { getAllMateriTemplates, getAllGameTemplates } from '../templates/registry';
import { TemplateType } from '../types';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onSelectTemplate: (type: TemplateType, useSampleData: boolean) => void;
}

export default function HomePage({ onNavigate, onSelectTemplate }: HomePageProps) {
  const materiTemplates = getAllMateriTemplates();
  const gameTemplates = getAllGameTemplates();

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-emerald-50/60 via-white to-stone-50 border-b border-stone-200/80 pt-12 sm:pt-20 pb-14 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-semibold tracking-wide border border-emerald-200 shadow-xs animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Aplikasi Guru Bahasa Arab · Langsung Pakai & 100% Fleksibel</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight leading-[1.15]">
            Bikin <span className="text-emerald-700">Materi & Game</span> Bahasa Arab dalam Hitungan Menit
          </h1>

          <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Pilih template penyaji materi atau permainan interaktif, masukkan kata dan kalimat mentah Anda, lalu langsung siap ditampilkan di proyektor kelas atau dibagikan ke siswa.
          </p>

          {/* Quick Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/materi')}
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-sm text-sm transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <BookOpen className="w-4 h-4" />
              <span>Jelajahi Materi</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/game')}
              className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm text-sm transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Jelajahi Game</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/draf')}
              className="w-full sm:w-auto px-5 py-3.5 bg-white hover:bg-stone-100 text-stone-700 font-semibold rounded-xl border border-stone-200 text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <FolderArchive className="w-4 h-4 text-stone-500" />
              <span>Buka Draf Saya</span>
            </button>
          </div>

          {/* Quick value badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-stone-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Mode Tamu Tanpa Login
            </span>
            <span className="flex items-center gap-1.5">
              <Monitor className="w-4 h-4 text-emerald-600" /> Mode Layar Penuh Proyektor
            </span>
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" /> Ekspor HTML Mandiri & ZIP
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 1: BUAT MATERI */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-stone-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-full text-xs font-bold mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Kategori Materi</span>
            </div>
            <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">
              Buat Materi Pelajaran
            </h2>
            <p className="text-stone-500 text-sm mt-1">
              Tampilkan materi pelajaran: slide, kosakata, bacaan, tabel. Dirancang untuk penyampaian materi di proyektor.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('/materi')}
            className="self-start sm:self-auto px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>Lihat Semua Materi ({materiTemplates.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Materi Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {materiTemplates.map((template) => {
            const IconComponent = template.icon;
            return (
              <div
                key={template.id}
                className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-emerald-300 hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                      {template.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-stone-900 group-hover:text-emerald-800 transition-colors">
                    {template.name}
                  </h3>

                  <p className="text-stone-600 text-xs sm:text-sm mt-2 leading-relaxed">
                    {template.description}
                  </p>

                  {/* Feature bullets */}
                  <div className="mt-4 pt-4 border-t border-stone-100 space-y-1.5 text-xs text-stone-600">
                    {template.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectTemplate(template.id, true)}
                    className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
                  >
                    <span>Coba & Edit Contoh</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTemplate(template.id, false)}
                    className="py-2.5 px-4 bg-stone-50 hover:bg-stone-100 text-stone-700 font-semibold rounded-xl text-xs border border-stone-200 transition-colors cursor-pointer text-center"
                  >
                    Mulai Kosong
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: BUAT GAME */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-stone-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 border border-indigo-200 text-indigo-800 rounded-full text-xs font-bold mb-2">
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Kategori Game</span>
            </div>
            <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">
              Buat Game Interaktif
            </h2>
            <p className="text-stone-500 text-sm mt-1">
              Permainan interaktif untuk siswa: flashcard, kuis, mencocokkan. Didesain untuk aktivitas kelas yang seru dan kompetitif.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('/game')}
            className="self-start sm:self-auto px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs rounded-xl border border-indigo-200 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>Lihat Semua Game ({gameTemplates.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Game Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gameTemplates.map((template) => {
            const IconComponent = template.icon;
            return (
              <div
                key={template.id}
                className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-700 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-md">
                      {template.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-stone-900 group-hover:text-indigo-900 transition-colors">
                    {template.name}
                  </h3>

                  <p className="text-stone-600 text-xs sm:text-sm mt-2 leading-relaxed">
                    {template.description}
                  </p>

                  {/* Feature bullets */}
                  <div className="mt-4 pt-4 border-t border-stone-100 space-y-1.5 text-xs text-stone-600">
                    {template.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectTemplate(template.id, true)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
                  >
                    <span>Coba & Edit Contoh</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTemplate(template.id, false)}
                    className="w-full py-2 bg-stone-50 hover:bg-stone-100 text-stone-700 font-semibold rounded-xl text-xs border border-stone-200 transition-colors cursor-pointer text-center"
                  >
                    Mulai dari Kosong
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works 3 steps */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-stone-900 text-white rounded-3xl p-8 sm:p-12">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl font-bold tracking-tight">3 Langkah Mengajar dengan Teach Arab</h2>
            <p className="text-stone-400 text-sm mt-2">
              Hemat waktu persiapan mengajar Anda dengan alur praktis tanpa hambatan teknis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-lg mx-auto sm:mx-0">
                1
              </div>
              <h3 className="font-bold text-base text-white">Pilih Format</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Pilih kategori Materi untuk presentasi/bacaan, atau Game untuk kuis dan permainan kompetitif.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-lg mx-auto sm:mx-0">
                2
              </div>
              <h3 className="font-bold text-base text-white">Masukkan Materi Mentah</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Tulis langsung atau tempel daftar kata lewat fitur Input Cepat. Rekam audio guru atau aktifkan suara otomatis.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-lg mx-auto sm:mx-0">
                3
              </div>
              <h3 className="font-bold text-base text-white">Tampilkan & Bagikan</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Putar di proyektor kelas, unduh sebagai file HTML offline, atau bagikan link ke siswa agar bisa latihan sendiri.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
