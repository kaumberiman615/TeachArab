import { ArrowRight, CheckCircle2, Sparkles, BookOpen, Gamepad2, ArrowLeft } from 'lucide-react';
import { getAllMateriTemplates } from '../templates/registry';
import { TemplateType } from '../types';

interface MateriGalleryPageProps {
  onNavigate: (path: string) => void;
  onSelectTemplate: (type: TemplateType, useSampleData: boolean) => void;
}

export default function MateriGalleryPage({
  onNavigate,
  onSelectTemplate,
}: MateriGalleryPageProps) {
  const materiTemplates = getAllMateriTemplates();

  const cardCapColors = [
    'border-t-[#00B4D8]',
    'border-t-[#10B981]',
    'border-t-[#8B5CF6]',
    'border-t-[#FF9F1C]',
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
        <span className="text-[#00B4D8] font-black text-xs">Materi Pelajaran</span>
      </div>

      {/* Hero Banner: Ice Cyan Bubble Theme */}
      <div className="bg-[#E6F7F5] border-2 border-[#00B4D8]/20 rounded-[32px] p-6 sm:p-10 shadow-xs relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white border border-[#00B4D8]/30 text-[#00B4D8] rounded-full text-xs font-black uppercase tracking-wider shadow-xs">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Kategori: Materi Pelajaran</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[#0A254D] tracking-tight">
            Materi Pelajaran Bahasa Arab
          </h1>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-medium">
            Tampilkan materi pelajaran: slide, kosakata, bacaan, tabel. Perangkat ajar murni yang dirancang untuk proyektor kelas, telaah teks, dan bahan ajar mandiri siswa.
          </p>

          <div className="pt-2 flex flex-wrap gap-2 text-xs font-black text-[#0A254D]">
            <span className="px-3 py-1 bg-white border border-stone-200 rounded-full shadow-xs">✓ Harakat Utuh & RTL</span>
            <span className="px-3 py-1 bg-white border border-stone-200 rounded-full shadow-xs">✓ Rekam Suara Guru</span>
            <span className="px-3 py-1 bg-white border border-stone-200 rounded-full shadow-xs">✓ Siap Cetak Kertas</span>
          </div>
        </div>
      </div>

      {/* Cards Grid: 4 Formats with Bubble Bash Playful Styling */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black text-[#0A254D]">Pilih Format Materi</h2>
            <p className="text-xs text-stone-500 font-medium">Pilih salah satu dari 4 format materi di bawah ini untuk mulai membuat</p>
          </div>
          <span className="text-xs font-black text-[#00B4D8] bg-[#E6F7F5] border border-[#00B4D8]/30 px-3.5 py-1 rounded-full">
            {materiTemplates.length} Template Materi
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {materiTemplates.map((template, index) => {
            const IconComponent = template.icon;
            const capColor = cardCapColors[index % cardCapColors.length];

            return (
              <div
                key={template.id}
                className={`bg-white rounded-3xl p-6 sm:p-8 border-t-8 ${capColor} border-x border-b border-stone-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-[#E6F7F5] text-[#00B4D8] rounded-2xl flex items-center justify-center group-hover:scale-105 group-hover:bg-[#00B4D8] group-hover:text-white transition-all">
                      <IconComponent className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-black text-[#00B4D8] bg-[#E6F7F5] px-3 py-1 rounded-full">
                      {template.badge}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-[#0A254D] group-hover:text-[#00B4D8] transition-colors">
                    {template.name}
                  </h3>

                  <p className="text-stone-600 text-xs sm:text-sm mt-2 leading-relaxed">
                    {template.description}
                  </p>

                  {/* Feature checklist */}
                  <div className="mt-5 pt-4 border-t border-stone-100 space-y-2 text-xs text-stone-600">
                    {template.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#00B4D8] shrink-0" />
                        <span className="font-medium">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={() => onSelectTemplate(template.id, true)}
                    className="flex-1 py-3 px-4 bg-[#00B4D8] hover:bg-[#0096C7] text-white font-black rounded-full text-xs shadow-[0_3px_0_#0077B6] active:translate-y-0.5 active:shadow-[0_1px_0_#0077B6] transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Coba Contoh Siap Pakai</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTemplate(template.id, false)}
                    className="py-3 px-4 bg-stone-100 hover:bg-stone-200 text-[#0A254D] font-bold rounded-full text-xs transition-colors cursor-pointer text-center min-h-[44px]"
                  >
                    Buat Kosong
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Switch to Game Category Banner */}
      <div className="p-6 sm:p-8 bg-[#FFF0F6] border-2 border-[#FF3B8D]/20 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-[#FF3B8D] text-white flex items-center justify-center shrink-0 shadow-[0_2px_0_#C2185B]">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-black text-[#0A254D]">Ingin membuat game atau kuis interaktif?</h4>
            <p className="text-xs text-stone-600 mt-0.5 font-medium">
              Tersedia 10 pilihan game: Flashcard, Kuis Pilihan Ganda, Benar/Salah, Susun Huruf, Susun Kalimat, Roda Acak, dan Memory Card.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('/game')}
          className="px-6 py-3 bg-[#FF3B8D] hover:bg-[#E62879] text-white font-black rounded-full text-xs flex items-center gap-2 cursor-pointer transition-all shadow-[0_3px_0_#C2185B] active:translate-y-0.5 active:shadow-[0_1px_0_#C2185B] shrink-0 min-h-[44px]"
        >
          <span>Buka Galeri Game</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
