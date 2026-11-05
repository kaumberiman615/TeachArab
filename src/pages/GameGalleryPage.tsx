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

  const cardCapColors = [
    'border-t-[#FF3B8D]',
    'border-t-[#FED034]',
    'border-t-[#00B4D8]',
    'border-t-[#8B5CF6]',
    'border-t-[#FF9F1C]',
    'border-t-[#10B981]',
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Header Breadcrumb & Back */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="text-stone-500 hover:text-[#0A254D] transition-colors text-xs font-bold flex items-center gap-1.5 cursor-pointer bg-white px-3 py-1.5 rounded-full border border-stone-200"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Beranda</span>
        </button>
        <span className="text-stone-300 text-xs">/</span>
        <span className="text-[#FF3B8D] font-black text-xs">Game Interaktif</span>
      </div>

      {/* Hero Section: Hot Pink / Pastel Rose Bubble Theme */}
      <div className="bg-[#FFF0F6] border-2 border-[#FF3B8D]/20 rounded-[32px] p-6 sm:p-10 shadow-xs relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white border border-[#FF3B8D]/30 text-[#FF3B8D] rounded-full text-xs font-black uppercase tracking-wider shadow-xs">
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Kategori: Game Interaktif</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[#0A254D] tracking-tight">
            Game Interaktif Bahasa Arab
          </h1>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-medium">
            Permainan interaktif untuk siswa: flashcard, kuis, mencocokkan, benar/salah, memory card, roda acak, susun huruf, dan susun kalimat. Didesain untuk menciptakan suasana kelas yang kompetitif, menyenangkan, dan memacu keaktifan siswa.
          </p>

          <div className="pt-2 flex flex-wrap gap-2 text-xs font-black text-[#0A254D]">
            <span className="px-3 py-1 bg-white border border-stone-200 rounded-full shadow-xs">✓ Mode Tim Kompetisi (2-4 Tim)</span>
            <span className="px-3 py-1 bg-white border border-stone-200 rounded-full shadow-xs">✓ Timer & Skor Langsung</span>
            <span className="px-3 py-1 bg-white border border-stone-200 rounded-full shadow-xs">✓ Drag-and-Drop & Sentuh HP</span>
          </div>
        </div>
      </div>

      {/* Cards Grid: 10 Game Templates */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black text-[#0A254D]">Pilih Jenis Game</h2>
            <p className="text-xs text-stone-500 font-medium">Pilih salah satu dari {gameTemplates.length} format game di bawah ini untuk mulai bermain</p>
          </div>
          <span className="text-xs font-black text-[#FF3B8D] bg-[#FFF0F6] border border-[#FF3B8D]/30 px-3.5 py-1 rounded-full">
            {gameTemplates.length} Template Game
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gameTemplates.map((template, index) => {
            const IconComponent = template.icon;
            const capColor = cardCapColors[index % cardCapColors.length];

            return (
              <div
                key={template.id}
                className={`bg-white rounded-3xl p-6 border-t-8 ${capColor} border-x border-b border-stone-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-[#FFF0F6] text-[#FF3B8D] rounded-2xl flex items-center justify-center group-hover:scale-105 group-hover:bg-[#FF3B8D] group-hover:text-white transition-all">
                      <IconComponent className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-black text-[#FF3B8D] bg-[#FFF0F6] px-3 py-1 rounded-full">
                      {template.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-[#0A254D] group-hover:text-[#FF3B8D] transition-colors">
                    {template.name}
                  </h3>

                  <p className="text-stone-600 text-xs mt-2 leading-relaxed min-h-[40px]">
                    {template.description}
                  </p>

                  {/* Feature checklist */}
                  <div className="mt-4 pt-3 border-t border-stone-100 space-y-1.5 text-xs text-stone-600">
                    {template.features.slice(0, 3).map((feat, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#FF3B8D] shrink-0" />
                        <span className="truncate font-medium">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-stone-100 space-y-2">
                  <button
                    type="button"
                    onClick={() => onSelectTemplate(template.id, true)}
                    className="w-full py-3 px-4 bg-[#FF3B8D] hover:bg-[#E62879] text-white font-black rounded-full text-xs shadow-[0_3px_0_#C2185B] active:translate-y-0.5 active:shadow-[0_1px_0_#C2185B] transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Coba Contoh Siap Main</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTemplate(template.id, false)}
                    className="w-full py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-full text-xs transition-colors cursor-pointer text-center"
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
      <div className="p-6 sm:p-8 bg-[#E6F7F5] border-2 border-[#00B4D8]/20 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-[#00B4D8] text-white flex items-center justify-center shrink-0 shadow-[0_2px_0_#0077B6]">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-black text-[#0A254D]">Ingin menyajikan materi atau teks pelajaran?</h4>
            <p className="text-xs text-stone-600 mt-0.5 font-medium">
              Lihat Slide Materi, Kosakata Bergambar, Teks Bacaan Qira'ah, dan Tabel Tashrif Kata.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('/materi')}
          className="px-6 py-3 bg-[#00B4D8] hover:bg-[#0096C7] text-white font-black rounded-full text-xs flex items-center gap-2 cursor-pointer transition-all shadow-[0_3px_0_#0077B6] active:translate-y-0.5 active:shadow-[0_1px_0_#0077B6] shrink-0 min-h-[44px]"
        >
          <span>Buka Galeri Materi</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
