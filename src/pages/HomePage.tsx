import {
  Sparkles,
  ArrowRight,
  Monitor,
  CheckCircle2,
  FolderArchive,
  BookOpen,
  Gamepad2,
  Layers,
  ChevronRight,
  Volume2,
  Users,
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

  // Accent colors for card caps matching playful Bubble Bash palette
  const cardCapColors = [
    'border-t-[#FF3B8D]',
    'border-t-[#FED034]',
    'border-t-[#00B4D8]',
    'border-t-[#8B5CF6]',
    'border-t-[#FF9F1C]',
    'border-t-[#10B981]',
  ];

  return (
    <div className="pb-20 space-y-20 overflow-hidden">
      {/* ========================================================= */}
      {/* HERO SECTION: Canary Yellow Background with Bubble Ornaments */}
      {/* ========================================================= */}
      <section className="relative bg-[#FED034] text-[#0A254D] pt-10 sm:pt-16 pb-20 px-4 sm:px-6 overflow-hidden">
        {/* Floating Background Bubble Elements (CSS/SVG only - offline safe) */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          {/* Top Left Bubbles */}
          <div className="absolute -top-10 -left-10 w-44 h-44 bg-white/25 rounded-full blur-xs animate-bubble-float-slow" />
          <div className="absolute top-20 left-12 w-12 h-12 bg-[#00B4D8]/30 rounded-full animate-bubble-float" />
          <div className="absolute top-10 left-1/4 w-6 h-6 bg-[#FF3B8D]/40 rounded-full animate-bubble-float" />

          {/* Top Right Bubbles */}
          <div className="absolute -top-12 -right-12 w-56 h-56 bg-white/30 rounded-full blur-xs animate-bubble-float" />
          <div className="absolute top-28 right-16 w-16 h-16 bg-[#00B4D8]/35 rounded-full animate-bubble-float-slow" />
          <div className="absolute top-14 right-1/3 w-8 h-8 bg-[#FF3B8D]/45 rounded-full animate-bubble-float" />

          {/* Little Stars / Twinkles */}
          <div className="absolute top-8 right-24 text-[#0A254D]/40 text-xl font-bold">✦</div>
          <div className="absolute top-36 left-28 text-[#0A254D]/35 text-2xl font-bold">✦</div>
          <div className="absolute bottom-16 right-1/4 text-[#0A254D]/30 text-lg font-bold">✦</div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-6">
          {/* Playful Kicker Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-[#0A254D] text-xs font-black tracking-wider uppercase shadow-[0_2px_0_rgba(10,37,77,0.15)]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF3B8D] animate-ping" />
            <Sparkles className="w-3.5 h-3.5 text-[#00B4D8]" />
            <span>Media & Game Pembelajaran Bahasa Arab</span>
          </div>

          {/* Chunky Playful Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#0A254D] tracking-tight leading-[1.12] max-w-4xl mx-auto text-balance">
            Belajar Bahasa Arab Jadi Lebih{' '}
            <span className="relative inline-block text-[#0A254D]">
              <span className="relative z-10">Seru & Ceria</span>
              <span className="absolute bottom-1 left-0 right-0 h-4 bg-[#00B4D8]/30 -rotate-1 rounded-sm -z-0" />
            </span>
          </h1>

          {/* Playful Hot Pink Bubble Subtitle Box */}
          <div className="inline-block">
            <div className="bg-[#FF3B8D] text-white px-5 sm:px-7 py-3 rounded-2xl shadow-[0_4px_0_#C2185B] font-black text-sm sm:text-base tracking-wide flex items-center justify-center gap-2 transform hover:scale-102 transition-transform">
              <span>Cepat Dibuat · Siap di Proyektor · Siswa Makin Aktif!</span>
            </div>
          </div>

          {/* Description Paragraph with high contrast on Yellow */}
          <p className="text-sm sm:text-base md:text-lg text-[#0A254D] font-semibold max-w-2xl mx-auto leading-relaxed opacity-95">
            Pilih dari <span className="font-black text-[#0A254D] underline decoration-[#FF3B8D] decoration-2">4 format materi</span> presentasi dan <span className="font-black text-[#0A254D] underline decoration-[#00B4D8] decoration-2">10 game interaktif</span>. Masukkan kosakata Anda, lalu putar langsung di kelas atau bagikan ke siswa.
          </p>

          {/* Dual Chunky Action Buttons */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-xl mx-auto">
            <button
              type="button"
              onClick={() => onNavigate('/materi')}
              className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-stone-50 text-[#0A254D] font-black rounded-full shadow-[0_5px_0_#0A254D] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_#0A254D] transition-all text-sm flex items-center justify-center gap-2.5 cursor-pointer min-h-[48px]"
            >
              <BookOpen className="w-4 h-4 text-[#00B4D8]" />
              <span>Buat Materi Pelajaran</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/game')}
              className="w-full sm:w-auto px-7 py-3.5 bg-[#FF3B8D] hover:bg-[#E62879] text-white font-black rounded-full shadow-[0_5px_0_#C2185B] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_#C2185B] transition-all text-sm flex items-center justify-center gap-2.5 cursor-pointer min-h-[48px]"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Jelajahi 10 Game</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/draf')}
              className="w-full sm:w-auto px-5 py-3.5 bg-white/70 hover:bg-white text-[#0A254D] font-bold rounded-full border-2 border-[#0A254D]/30 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
            >
              <FolderArchive className="w-4 h-4 text-amber-600" />
              <span>Draf Tersimpan</span>
            </button>
          </div>

          {/* Quick Value Trust Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs font-black text-[#0A254D]">
            <div className="bg-white/80 backdrop-blur-xs px-3.5 py-1.5 rounded-full shadow-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00B4D8]" />
              <span>Mode Tamu Tanpa Login</span>
            </div>
            <div className="bg-white/80 backdrop-blur-xs px-3.5 py-1.5 rounded-full shadow-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF3B8D]" />
              <span>Layar Penuh Proyektor</span>
            </div>
            <div className="bg-white/80 backdrop-blur-xs px-3.5 py-1.5 rounded-full shadow-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00B4D8]" />
              <span>Unduh File HTML Mandiri & ZIP</span>
            </div>
          </div>
        </div>

        {/* Playful Organic Curved Bottom Divider */}
        <div className="absolute -bottom-1 left-0 right-0 overflow-hidden leading-none pointer-events-none">
          <svg
            className="relative block w-full h-8 sm:h-12"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,121.31,192,106.12,236.4,95.09,279.79,72.48,321.39,56.44Z"
              fill="#FAFCFC"
            />
          </svg>
        </div>
      </section>

      {/* ========================================================= */}
      {/* MARQUEE RIBBON: Hot Pink scrolling banner */}
      {/* ========================================================= */}
      <div className="relative -mt-16 sm:-mt-14 z-20 overflow-hidden bg-[#FF3B8D] text-white py-3 shadow-md rotate-1 transform scale-102">
        <div className="animate-marquee flex items-center gap-8 whitespace-nowrap font-black text-xs sm:text-sm tracking-wider uppercase">
          <div className="flex items-center gap-6">
            <span>★ SLIDE MATERI BERGAMBAR</span>
            <span>•</span>
            <span>★ KOSAKATA & AUDIO ARAB</span>
            <span>•</span>
            <span>★ TEKS QIRA'AH & TERJEMAH</span>
            <span>•</span>
            <span>★ KUIS TIM & SKOR LANGSUNG</span>
            <span>•</span>
            <span>★ SUSUN HURUF BER-HARAKAT</span>
            <span>•</span>
            <span>★ MEMORY CARD</span>
            <span>•</span>
            <span>★ BENAR ATAU SALAH</span>
            <span>•</span>
            <span>★ RODA ACAK KELAS</span>
            <span>•</span>
            <span>★ SUSUN KALIMAT RTL</span>
            <span>•</span>
            <span>★ 100% OFFLINE HTML</span>
            <span>•</span>
          </div>
          <div className="flex items-center gap-6" aria-hidden="true">
            <span>★ SLIDE MATERI BERGAMBAR</span>
            <span>•</span>
            <span>★ KOSAKATA & AUDIO ARAB</span>
            <span>•</span>
            <span>★ TEKS QIRA'AH & TERJEMAH</span>
            <span>•</span>
            <span>★ KUIS TIM & SKOR LANGSUNG</span>
            <span>•</span>
            <span>★ SUSUN HURUF BER-HARAKAT</span>
            <span>•</span>
            <span>★ MEMORY CARD</span>
            <span>•</span>
            <span>★ BENAR ATAU SALAH</span>
            <span>•</span>
            <span>★ RODA ACAK KELAS</span>
            <span>•</span>
            <span>★ SUSUN KALIMAT RTL</span>
            <span>•</span>
            <span>★ 100% OFFLINE HTML</span>
            <span>•</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 1: BUAT MATERI (Ice Cyan Section, styled like Image 1) */}
      {/* ========================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-[#E6F7F5] rounded-[32px] p-6 sm:p-10 border-2 border-[#00B4D8]/20 shadow-xs space-y-8">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white text-[#00B4D8] border border-[#00B4D8]/30 text-xs font-black uppercase tracking-wider shadow-xs">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Format Materi Pelajaran</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#0A254D] tracking-tight">
              Penyaji Materi Pelajaran
            </h2>
            <p className="text-stone-600 text-sm sm:text-base font-medium">
              Sajikan materi dengan harakat utuh, tata letak proporsional, dan tampilan bersih di proyektor kelas atau ponsel siswa.
            </p>
          </div>

          {/* Cards Grid: 4 Materi Templates styled with Bubble Bash cards (Image 1) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {materiTemplates.map((template, index) => {
              const IconComponent = template.icon;
              const capColor = cardCapColors[index % cardCapColors.length];

              return (
                <div
                  key={template.id}
                  className={`bg-white rounded-3xl p-6 sm:p-8 border-t-8 ${capColor} border-x border-b border-stone-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group`}
                >
                  <div className="text-center">
                    {/* Centered Circular Icon Badge */}
                    <div className="w-18 h-18 mx-auto mb-4 rounded-full bg-[#E6F7F5] text-[#00B4D8] flex items-center justify-center border-4 border-white shadow-xs group-hover:scale-110 group-hover:bg-[#00B4D8] group-hover:text-white transition-all duration-300">
                      <IconComponent className="w-8 h-8" />
                    </div>

                    {/* Badge */}
                    <div className="inline-block text-[11px] font-black text-[#00B4D8] bg-[#E6F7F5] px-3 py-0.5 rounded-full mb-2">
                      {template.badge}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-black text-[#0A254D] tracking-tight group-hover:text-[#00B4D8] transition-colors">
                      {template.name}
                    </h3>

                    {/* Description */}
                    <p className="text-stone-600 text-xs sm:text-sm mt-2 leading-relaxed">
                      {template.description}
                    </p>

                    {/* Feature Checklist */}
                    <div className="mt-5 pt-4 border-t border-stone-100 space-y-2 text-xs text-stone-600 text-left">
                      {template.features.map((feat, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#00B4D8] shrink-0" />
                          <span className="font-medium">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Playful Pill CTA Buttons */}
                  <div className="mt-6 pt-4 border-t border-stone-100 flex flex-col sm:flex-row gap-2.5">
                    <button
                      type="button"
                      onClick={() => onSelectTemplate(template.id, true)}
                      className="flex-1 py-3 px-5 bg-[#00B4D8] hover:bg-[#0096C7] text-white font-black rounded-full text-xs shadow-[0_3px_0_#0077B6] active:translate-y-0.5 active:shadow-[0_1px_0_#0077B6] transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                    >
                      <span>Coba & Edit Contoh</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectTemplate(template.id, false)}
                      className="py-3 px-4 bg-stone-100 hover:bg-stone-200 text-[#0A254D] font-bold rounded-full text-xs transition-colors cursor-pointer text-center min-h-[44px]"
                    >
                      Mulai Kosong
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick link to all Materi */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => onNavigate('/materi')}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-stone-50 text-[#00B4D8] font-black rounded-full border-2 border-[#00B4D8] text-xs shadow-xs transition-all cursor-pointer"
            >
              <span>Buka Galeri Lengkap Materi ({materiTemplates.length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 2: BUAT GAME (10 Interactive Games Grid) */}
      {/* ========================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="space-y-8">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFF0F6] text-[#FF3B8D] border border-[#FF3B8D]/30 text-xs font-black uppercase tracking-wider shadow-xs">
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>10 Jenis Permainan Interaktif</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#0A254D] tracking-tight">
              Buat Game Edukatif Seru
            </h2>
            <p className="text-stone-600 text-sm sm:text-base font-medium">
              Ciptakan antusiasme belajar lewat game kompetitif, tebak kata, susun kalimat, roda acak, dan kuis kelompok interaktif.
            </p>
          </div>

          {/* 10 Game Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gameTemplates.map((template, index) => {
              const IconComponent = template.icon;
              const capColor = cardCapColors[index % cardCapColors.length];

              return (
                <div
                  key={template.id}
                  className={`bg-white rounded-3xl p-6 border-t-8 ${capColor} border-x border-b border-stone-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group`}
                >
                  <div className="text-center">
                    {/* Centered Circular Icon Badge */}
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FFF0F6] text-[#FF3B8D] flex items-center justify-center border-4 border-white shadow-xs group-hover:scale-110 group-hover:bg-[#FF3B8D] group-hover:text-white transition-all duration-300">
                      <IconComponent className="w-7 h-7" />
                    </div>

                    {/* Badge */}
                    <div className="inline-block text-[10px] font-black text-[#FF3B8D] bg-[#FFF0F6] px-2.5 py-0.5 rounded-full mb-1.5">
                      {template.badge}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-black text-[#0A254D] tracking-tight group-hover:text-[#FF3B8D] transition-colors">
                      {template.name}
                    </h3>

                    {/* Description */}
                    <p className="text-stone-600 text-xs mt-2 leading-relaxed min-h-[40px]">
                      {template.description}
                    </p>

                    {/* Features bullet list */}
                    <div className="mt-4 pt-3 border-t border-stone-100 space-y-1.5 text-[11px] text-stone-600 text-left">
                      {template.features.slice(0, 3).map((feat, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#FF3B8D] shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Playful Pill CTA Button */}
                  <div className="mt-6 pt-3 border-t border-stone-100 space-y-2">
                    <button
                      type="button"
                      onClick={() => onSelectTemplate(template.id, true)}
                      className="w-full py-2.5 px-4 bg-[#FF3B8D] hover:bg-[#E62879] text-white font-black rounded-full text-xs shadow-[0_3px_0_#C2185B] active:translate-y-0.5 active:shadow-[0_1px_0_#C2185B] transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
                    >
                      <span>Coba & Mainkan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectTemplate(template.id, false)}
                      className="w-full py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-full text-[11px] transition-colors cursor-pointer text-center"
                    >
                      Mulai dari Kosong
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick link to all Games */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => onNavigate('/game')}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-stone-50 text-[#FF3B8D] font-black rounded-full border-2 border-[#FF3B8D] text-xs shadow-xs transition-all cursor-pointer"
            >
              <span>Buka Galeri Lengkap Game ({gameTemplates.length} Permainan)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 3: CARA KERJA (3 Langkah - Matching Image 3 & 4) */}
      {/* ========================================================= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-[#0A254D] text-white rounded-[36px] p-8 sm:p-14 shadow-2xl relative overflow-hidden">
          {/* Decorative Corner Ornaments */}
          <div aria-hidden="true" className="absolute -top-12 -right-12 w-48 h-48 bg-[#00B4D8]/20 rounded-full blur-xl pointer-events-none" />
          <div aria-hidden="true" className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#FF3B8D]/20 rounded-full blur-xl pointer-events-none" />

          {/* Section Title */}
          <div className="text-center max-w-xl mx-auto mb-12 space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-[#FED034] text-xs font-black uppercase tracking-wider">
              <span>Alur Praktis Guru</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              3 Langkah Mengajar dengan Teach Arab
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm">
              Hemat waktu persiapan mengajar tanpa kerumitan teknis, langsung siap tampil di kelas
            </p>
          </div>

          {/* 3 Numbered Cards with Bubble Bash Colored Badges (Yellow, Cyan, Pink) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {/* Step 1: Yellow Badge */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-6 text-center sm:text-left space-y-4 hover:bg-white/15 transition-all">
              <div className="w-12 h-12 rounded-full bg-[#FED034] text-[#0A254D] font-black text-xl flex items-center justify-center shadow-[0_3px_0_#D4A800] mx-auto sm:mx-0">
                1
              </div>
              <h3 className="font-black text-lg text-white">Pilih Format</h3>
              <p className="text-xs text-stone-300 leading-relaxed font-medium">
                Pilih kategori <strong className="text-[#00B4D8]">Materi</strong> untuk presentasi/bacaan atau <strong className="text-[#FF3B8D]">Game</strong> untuk kuis seru dan kompetisi kelas.
              </p>
            </div>

            {/* Step 2: Cyan Badge */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-6 text-center sm:text-left space-y-4 hover:bg-white/15 transition-all">
              <div className="w-12 h-12 rounded-full bg-[#00B4D8] text-white font-black text-xl flex items-center justify-center shadow-[0_3px_0_#0077B6] mx-auto sm:mx-0">
                2
              </div>
              <h3 className="font-black text-lg text-white">Masukkan Materi</h3>
              <p className="text-xs text-stone-300 leading-relaxed font-medium">
                Ketik langsung kata Arab & artinya, tempel lewat <strong className="text-white">Input Cepat</strong>, atau gunakan <strong className="text-[#FED034]">Bantuan AI</strong> untuk membuat draf instan.
              </p>
            </div>

            {/* Step 3: Hot Pink Badge */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-6 text-center sm:text-left space-y-4 hover:bg-white/15 transition-all">
              <div className="w-12 h-12 rounded-full bg-[#FF3B8D] text-white font-black text-xl flex items-center justify-center shadow-[0_3px_0_#C2185B] mx-auto sm:mx-0">
                3
              </div>
              <h3 className="font-black text-lg text-white">Mainkan & Bagikan</h3>
              <p className="text-xs text-stone-300 leading-relaxed font-medium">
                Putar di proyektor kelas dengan <strong className="text-[#00B4D8]">Layar Penuh</strong>, unduh sebagai file <strong className="text-[#FED034]">HTML mandiri offline</strong>, atau bagikan link ke siswa.
              </p>
            </div>
          </div>

          {/* Feature Trust Pills at bottom of section (Matching Image 3) */}
          <div className="mt-10 pt-8 border-t border-white/15 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-bold text-white relative z-10">
            <div className="bg-white/10 px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-[#00B4D8]" />
              <span>Tanpa Perlu Instalasi</span>
            </div>
            <div className="bg-white/10 px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-[#FF3B8D]" />
              <span>Dukungan Penuh Teks RTL</span>
            </div>
            <div className="bg-white/10 px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-[#FED034]" />
              <span>Audio & Rekam Suara Guru</span>
            </div>
            <div className="bg-white/10 px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-[#00B4D8]" />
              <span>Bisa Diputar Tanpa Internet</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
