import { useState } from 'react';
import { getAllTemplates } from '../templates/registry';
import { TemplateType, TemplateCategory } from '../types';
import {
  Sparkles,
  ArrowRight,
  Monitor,
  Download,
  WifiOff,
  Keyboard,
  Users,
  CheckCircle2,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onSelectTemplate: (type: TemplateType, useSampleData: boolean) => void;
}

export default function HomePage({ onNavigate, onSelectTemplate }: HomePageProps) {
  const [filterCategory, setFilterCategory] = useState<'all' | TemplateCategory>('all');
  const templates = getAllTemplates();

  const filteredTemplates = templates.filter(
    (t) => filterCategory === 'all' || t.category === filterCategory
  );

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="bg-white border-b border-stone-200 pt-12 pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Khusus Guru & Pengajar Bahasa Arab di Indonesia</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight text-balance">
            Buat Perangkat Ajar & Game Bahasa Arab <span className="text-emerald-700">Langsung Siap Pakai</span>
          </h1>

          <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
            Cukup masukkan teks kosakata atau soal mentah dari buku / Excel, web app ini otomatis mengubahnya menjadi Flashcard interaktif, Kuis cerdas cermat, atau Game mencocokkan.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('/buat/flashcard')}
              className="px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
            >
              <span>Mulai Buat Materi Baru</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/draf')}
              className="px-5 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
            >
              Buka Draf Saya
            </button>
          </div>

          {/* Quick value badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-stone-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Tanpa Registrasi / Akun
            </span>
            <span className="flex items-center gap-1.5">
              <WifiOff className="w-4 h-4 text-emerald-600" /> Bisa Diunduh untuk Offline
            </span>
            <span className="flex items-center gap-1.5">
              <Monitor className="w-4 h-4 text-emerald-600" /> Mode Layar Penuh Proyektor
            </span>
          </div>
        </div>
      </section>

      {/* Template Gallery with Filter */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-stone-900">Pilih Template Perangkat Ajar</h2>
            <p className="text-stone-500 text-sm mt-1">
              Setiap template dilengkapi form editor cepat, keyboard Arab, dan player proyektor
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl border border-stone-200 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setFilterCategory('all')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filterCategory === 'all'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Semua Template
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('materi')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filterCategory === 'materi'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Materi Belajar
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('game')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filterCategory === 'game'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Game Kelas
            </button>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => {
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

                <div className="mt-6 pt-4 border-t border-stone-100 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectTemplate(template.id, true)}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
                  >
                    <span>Coba & Edit Contoh Siap Pakai</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTemplate(template.id, false)}
                    className="w-full py-2 bg-stone-50 hover:bg-stone-100 text-stone-700 font-semibold rounded-xl text-xs border border-stone-200 transition-colors cursor-pointer"
                  >
                    Mulai dari Kosong
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <div className="bg-stone-900 text-stone-100 rounded-3xl p-8 sm:p-12 shadow-xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Dirancang Khusus untuk Kebutuhan Guru Bahasa Arab
            </h2>
            <p className="text-stone-400 text-sm mt-2">
              Sering terkendala internet sekolah atau bingung mengetik huruf Arab? Teach Arab menyelesaikan masalah tersebut.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-stone-800/80 border border-stone-700 rounded-2xl space-y-2.5">
              <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
                <WifiOff className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base">Unduh HTML (100% Offline)</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Hasil pembuatan materi dapat diunduh sebagai 1 file .html mandiri. Cukup copy ke flashdisk dan buka di komputer kelas tanpa koneksi internet sama sekali.
              </p>
            </div>

            <div className="p-5 bg-stone-800/80 border border-stone-700 rounded-2xl space-y-2.5">
              <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
                <Keyboard className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base">Keyboard Arab & Harakat</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Keyboard virtual terintegrasi dengan tombol harakat lengkap (Fathah, Kasrah, Dammah, Sukun, Tanwin, Shaddah) dan fitur hapus harakat otomatis dengan 1 klik.
              </p>
            </div>

            <div className="p-5 bg-stone-800/80 border border-stone-700 rounded-2xl space-y-2.5">
              <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base">Mode Tim di 1 Layar Proyektor</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Ajak murid berkompetisi aktif di depan kelas! Game mendukung mode 2 sampai 4 tim dengan papan skor otomatis dan giliran menjawab.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
