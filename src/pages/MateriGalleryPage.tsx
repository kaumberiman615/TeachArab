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
        <span className="text-emerald-800 font-bold text-xs">Materi Pelajaran</span>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-emerald-50 via-white to-stone-50 border border-emerald-100 rounded-3xl p-6 sm:p-10 mb-10 shadow-xs">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-full text-xs font-bold mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Kategori: Materi Pelajaran</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Materi Pelajaran Bahasa Arab
          </h1>
          <p className="mt-2 text-stone-600 text-sm sm:text-base leading-relaxed">
            Tampilkan materi pelajaran: slide, kosakata, bacaan, tabel. Perangkat ajar murni yang dirancang untuk proyektor kelas, telaah teks, dan bahan ajar mandiri siswa.
          </p>

          <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-stone-600">
            <span className="px-2.5 py-1 bg-white border border-stone-200 rounded-lg">✓ Dukungan Harakat & RTL</span>
            <span className="px-2.5 py-1 bg-white border border-stone-200 rounded-lg">✓ Audio & Rekam Suara Guru</span>
            <span className="px-2.5 py-1 bg-white border border-stone-200 rounded-lg">✓ Cetak Rapi Ramah Kertas</span>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Pilih Format Materi</h2>
            <p className="text-xs text-stone-500">Pilih salah satu dari 4 format materi di bawah ini untuk mulai membuat</p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            {materiTemplates.length} Template Materi
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {materiTemplates.map((template) => {
            const IconComponent = template.icon;
            return (
              <div
                key={template.id}
                className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-emerald-400 hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                      {template.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-stone-900 group-hover:text-emerald-800 transition-colors">
                    {template.name}
                  </h3>

                  <p className="text-stone-600 text-xs sm:text-sm mt-2 leading-relaxed">
                    {template.description}
                  </p>

                  {/* Feature checklist */}
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
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Coba Contoh Siap Pakai</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTemplate(template.id, false)}
                    className="py-2.5 px-4 bg-stone-50 hover:bg-stone-100 text-stone-700 font-semibold rounded-xl text-xs border border-stone-200 transition-colors cursor-pointer text-center"
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
      <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-indigo-950">Ingin membuat game atau kuis interaktif?</h4>
            <p className="text-xs text-indigo-700 mt-0.5">
              Coba Flashcard, Kuis Pilihan Ganda (dengan mode tim & timer), atau Game Mencocokkan Kata.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('/game')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs shrink-0"
        >
          <span>Buka Galeri Game</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
