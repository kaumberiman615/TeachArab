import { ArrowRight, CheckCircle2, Sparkles, Gamepad2, BookOpen, ArrowLeft } from 'lucide-react';
import { getAllGameTemplates } from '../templates/registry';
import { TemplateType } from '../types';

interface GameGalleryPageProps {
  onNavigate: (path: string) => void;
  onSelectTemplate: (type: TemplateType, useSampleData: boolean) => void;
}

export default function GameGalleryPage({
  onNavigate,
  onSelectTemplate,
}: GameGalleryPageProps) {
  const gameTemplates = getAllGameTemplates();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header Breadcrumb & Back */}
      <div className="flex items-center gap-2 mb-6">
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="text-stone-500 hover:text-stone-900 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Beranda</span>
        </button>
        <span className="text-stone-300 text-xs">/</span>
        <span className="text-indigo-800 font-bold text-xs">Game Interaktif</span>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-50 via-white to-stone-50 border border-indigo-100 rounded-3xl p-6 sm:p-10 mb-10 shadow-xs">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 border border-indigo-200 text-indigo-800 rounded-full text-xs font-bold mb-4">
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Kategori: Game Interaktif</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Game Interaktif Bahasa Arab
          </h1>
          <p className="mt-2 text-stone-600 text-sm sm:text-base leading-relaxed">
            Permainan interaktif untuk siswa: flashcard, kuis, mencocokkan, benar/salah, memory card, roda acak, susun huruf, dan susun kalimat. Didesain untuk menciptakan suasana kelas yang kompetitif, menyenangkan, dan memacu keaktifan siswa.
          </p>

          <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-stone-600">
            <span className="px-2.5 py-1 bg-white border border-stone-200 rounded-lg">✓ Mode Tim Kompetisi (2-4 Tim)</span>
            <span className="px-2.5 py-1 bg-white border border-stone-200 rounded-lg">✓ Timer & Skor Langsung</span>
            <span className="px-2.5 py-1 bg-white border border-stone-200 rounded-lg">✓ Drag-and-Drop & Sentuh Interaktif</span>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Pilih Jenis Game</h2>
            <p className="text-xs text-stone-500">Pilih salah satu dari {gameTemplates.length} format game di bawah ini untuk mulai bermain</p>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
            {gameTemplates.length} Template Game
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gameTemplates.map((template) => {
            const IconComponent = template.icon;
            return (
              <div
                key={template.id}
                className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-indigo-400 hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-700 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-md">
                      {template.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-stone-900 group-hover:text-indigo-800 transition-colors">
                    {template.name}
                  </h3>

                  <p className="text-stone-600 text-xs sm:text-sm mt-2 leading-relaxed">
                    {template.description}
                  </p>

                  {/* Feature checklist */}
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
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Coba Contoh Siap Main</span>
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
      </div>

      {/* Switch to Materi Category Banner */}
      <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-950">Ingin menyajikan materi atau teks pelajaran?</h4>
            <p className="text-xs text-emerald-700 mt-0.5">
              Lihat Slide Materi, Kosakata Bergambar, Teks Bacaan Qira'ah, dan Tabel Tashrif Kata.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('/materi')}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs shrink-0"
        >
          <span>Buka Galeri Materi</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
