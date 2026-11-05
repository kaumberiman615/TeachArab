import { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  Keyboard,
  Monitor,
  Download,
  CheckCircle2,
  BookOpen,
  Gamepad2,
  Layers,
  ArrowRight,
  ChevronDown,
  Volume2,
  Share2,
  FileCheck,
} from 'lucide-react';

interface HelpPageProps {
  onNavigate: (path: string) => void;
}

interface FaqItem {
  q: string;
  a: string;
}

export default function HelpPage({ onNavigate }: HelpPageProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      q: 'Apakah saya wajib login dengan akun Google untuk memakai Teach Arab?',
      a: 'Tidak wajib sama sekali! Anda bisa langsung memakai Teach Arab dalam Mode Tamu. Draf tersimpan di browser Anda dan Anda bisa langsung mengunduh file HTML mandiri untuk diputar secara offline di kelas tanpa login.',
    },
    {
      q: 'Kapan saya sebaiknya masuk dengan akun Google?',
      a: 'Masuk dengan Google diperlukan jika Anda ingin membagikan link interaktif atau kode QR yang dapat dibuka siswa dari rumah, atau saat Anda ingin materi tersimpan permanen di cloud agar bisa dibuka dari komputer sekolah lain.',
    },
    {
      q: 'Bagaimana cara membuka file HTML offline di proyektor kelas tanpa internet?',
      a: 'Setelah membuat materi di editor, klik tombol "Unduh" lalu pilih "Unduh HTML (Offline)". Simpan berkas berekstensi .html tersebut ke flashdisk. Di kelas, cukup klik ganda file tersebut. File akan terbuka langsung di browser Chrome/Edge tanpa membutuhkan koneksi internet.',
    },
    {
      q: 'Apakah teks Arab dan tanda harakat dijamin rapi di proyektor?',
      a: 'Ya, Teach Arab menggunakan font Arab standar internasional (Amiri, Noto Naskh, Scheherazade New) dengan penyesuaian line-height khusus agar harakat fathah, kasrah, dammah, tanwin, dan tasydid tidak terpotong. Arah teks diatur RTL (Right-to-Left) secara otomatis.',
    },
    {
      q: 'Bagaimana cara cepat memasukkan puluhan kosakata tanpa mengetik satu-satu?',
      a: 'Gunakan fitur "Input Cepat". Anda cukup menempel daftar kata dari buku atau Excel dengan format baris sederhana (misal: "كِتَابٌ | buku" atau "قَلَمٌ | pena"), lalu klik Terapkan. Seluruh butir akan langsung terbuat otomatis.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12 pb-24">
      {/* Header Banner */}
      <div className="bg-[#FED034] text-[#0A254D] rounded-[36px] p-8 sm:p-12 shadow-sm relative overflow-hidden">
        {/* Floating background bubble shapes */}
        <div aria-hidden="true" className="absolute -top-10 -right-10 w-44 h-44 bg-white/30 rounded-full blur-xs pointer-events-none" />
        <div aria-hidden="true" className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#00B4D8]/20 rounded-full blur-xs pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white text-[#0A254D] rounded-full text-xs font-black uppercase tracking-wider shadow-xs">
            <HelpCircle className="w-3.5 h-3.5 text-[#FF3B8D]" />
            <span>Pusat Bantuan & Panduan Guru</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#0A254D] tracking-tight leading-tight">
            Panduan Lengkap Teach Arab
          </h1>

          <p className="text-[#0A254D] text-sm sm:text-base font-semibold leading-relaxed">
            Ketahui perbedaan kategori Materi dan Game, cara memakai fitur Input Cepat, hingga trik memutar media di kelas tanpa koneksi internet.
          </p>
        </div>
      </div>

      {/* SECTION 1: Perbedaan Kategori Materi vs Game */}
      <section className="bg-white border-2 border-stone-100 rounded-[32px] p-6 sm:p-10 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-black uppercase tracking-wider mb-2">
            <Layers className="w-3.5 h-3.5 text-[#00B4D8]" />
            <span>Struktur Kategori</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0A254D] tracking-tight">
            Dua Kategori Template: Materi vs Game
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 font-medium">
            Teach Arab membagi perangkat ajar menjadi 2 kategori jelas dengan tujuan penggunaan yang berbeda di kelas:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Kategori Materi */}
          <div className="border-t-8 border-t-[#00B4D8] border-x-2 border-b-2 border-stone-100 bg-[#E6F7F5]/40 rounded-3xl p-6 space-y-4 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#00B4D8] text-white flex items-center justify-center font-bold shadow-xs">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-[#0A254D] text-lg">Kategori Materi</h3>
                </div>
                <span className="text-[11px] font-black px-3 py-0.5 rounded-full bg-white text-[#00B4D8] border border-[#00B4D8]/30">
                  4 Format
                </span>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed font-medium">
                <strong>Tujuan Utama:</strong> Menyampaikan isi pelajaran secara runtut di layar proyektor atau dibaca mandiri oleh siswa. Fokus pada kejelasan teks Arab, harakat utuh, audio pelafalan, dan visual.
              </p>

              <div className="pt-3 border-t border-[#00B4D8]/20 space-y-2 text-xs text-[#0A254D]">
                <div>
                  <strong>1. Slide Materi:</strong> Presentasi bab dengan pilihan tata letak, gambar, dan catatan guru.
                </div>
                <div>
                  <strong>2. Kosakata Bergambar:</strong> Kartu visual besar untuk mengenalkan mufrodat baru dengan suara fasih.
                </div>
                <div>
                  <strong>3. Teks Bacaan (Qira'ah):</strong> Teks Arab mengalir rapi dengan intip arti per kalimat dan terjemah.
                </div>
                <div>
                  <strong>4. Tabel / Tashrif Kata:</strong> Tabel kata mufradat dan tasrif fi'il dengan mode hafalan dan tombol cetak ramah kertas.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('/materi')}
              className="w-full min-h-[44px] mt-2 py-2.5 bg-[#00B4D8] hover:bg-[#0096C7] text-white font-black text-xs rounded-full transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_3px_0_#0077B6] active:translate-y-0.5"
            >
              <span>Buka Galeri Materi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card Kategori Game */}
          <div className="border-t-8 border-t-[#FF3B8D] border-x-2 border-b-2 border-stone-100 bg-[#FFF0F6]/40 rounded-3xl p-6 space-y-4 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#FF3B8D] text-white flex items-center justify-center font-bold shadow-xs">
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-[#0A254D] text-lg">Kategori Game</h3>
                </div>
                <span className="text-[11px] font-black px-3 py-0.5 rounded-full bg-white text-[#FF3B8D] border border-[#FF3B8D]/30">
                  10 Permainan
                </span>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed font-medium">
                <strong>Tujuan Utama:</strong> Menguji pemahaman, melatih hafalan kosakata, dan mencairkan suasana kelas lewat permainan kompetitif tim yang interaktif dan menyenangkan.
              </p>

              <div className="pt-3 border-t border-[#FF3B8D]/20 space-y-2 text-xs text-[#0A254D]">
                <div>
                  <strong>1. Flashcard:</strong> Kartu hafalan bolak-balik 3D interaktif.
                </div>
                <div>
                  <strong>2. Kuis Pilihan Ganda:</strong> Mode cerdas cermat dengan timer dan skor 2-4 tim.
                </div>
                <div>
                  <strong>3. Susun Huruf & Kalimat:</strong> Susun huruf/kalimat Arab ber-harakat dengan arah RTL.
                </div>
                <div>
                  <strong>4. Memory Card, Roda Acak, Benar/Salah, & Tebak Media:</strong> Permainan visual interaktif.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('/game')}
              className="w-full min-h-[44px] mt-2 py-2.5 bg-[#FF3B8D] hover:bg-[#E62879] text-white font-black text-xs rounded-full transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_3px_0_#C2185B] active:translate-y-0.5"
            >
              <span>Buka Galeri Game</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2: 4 Langkah Cepat Mengajar */}
      <section className="bg-white border-2 border-stone-100 rounded-[32px] p-6 sm:p-10 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#FED034]" />
            <span>Alur Guru</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0A254D] tracking-tight">
            Alur Praktis 4 Langkah
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 font-medium">
            Hemat waktu persiapan mengajar dengan alur kerja sederhana tanpa kendala teknis:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div className="bg-[#FAFCFC] border-2 border-stone-100 rounded-3xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#FED034] text-[#0A254D] font-black text-lg flex items-center justify-center shadow-xs">
              1
            </div>
            <h3 className="font-black text-[#0A254D] text-sm">Pilih Format</h3>
            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              Tentukan apakah Anda ingin menyajikan <strong>Materi</strong> atau melatih siswa lewat <strong>Game</strong> interaktif.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-[#FAFCFC] border-2 border-stone-100 rounded-3xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#00B4D8] text-white font-black text-lg flex items-center justify-center shadow-xs">
              2
            </div>
            <h3 className="font-black text-[#0A254D] text-sm">Tempel Cepat</h3>
            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              Ketik langsung atau gunakan tombol <strong>Input Cepat</strong> untuk menempel puluhan baris teks dari buku sekaligus.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-[#FAFCFC] border-2 border-stone-100 rounded-3xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#FF3B8D] text-white font-black text-lg flex items-center justify-center shadow-xs">
              3
            </div>
            <h3 className="font-black text-[#0A254D] text-sm">Atur Media & Audio</h3>
            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              Rekam suara guru via mikrofon, pasang foto ilustrasi, dan sesuaikan ukuran tulisan Arab untuk layar kelas.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-[#FAFCFC] border-2 border-stone-100 rounded-3xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#0A254D] text-white font-black text-lg flex items-center justify-center shadow-xs">
              4
            </div>
            <h3 className="font-black text-[#0A254D] text-sm">Tampilkan di Kelas</h3>
            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              Putar di proyektor kelas dengan mode Layar Penuh, bagikan link via kode QR, atau unduh HTML mandiri.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: FAQ Accordion */}
      <section className="bg-white border-2 border-stone-100 rounded-[32px] p-6 sm:p-10 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-black uppercase tracking-wider mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-[#00B4D8]" />
            <span>Tanya Jawab</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0A254D] tracking-tight">
            Pertanyaan yang Sering Diajukan (FAQ)
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 font-medium">
            Jawaban cepat seputar penggunaan, penyimpanan draf, dan privasi akun Anda:
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="border-2 border-stone-100 rounded-2xl overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 text-left font-black text-xs sm:text-sm text-[#0A254D] flex items-center justify-between gap-3 bg-stone-50/60 hover:bg-stone-50 cursor-pointer min-h-[48px]"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#00B4D8]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="p-4 sm:p-5 pt-2 text-xs text-stone-600 leading-relaxed font-medium bg-white animate-in fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Banner at Bottom */}
      <div className="bg-[#0A254D] text-white rounded-[36px] p-8 sm:p-12 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-xl sm:text-2xl font-black">Siap Membuat Media Ajar Hari Ini?</h3>
          <p className="text-stone-300 text-xs sm:text-sm max-w-md">
            Mulai eksplorasi format materi atau pilih game edukasi untuk menghidupkan suasana kelas Anda.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 flex-wrap justify-center">
          <button
            type="button"
            onClick={() => onNavigate('/materi')}
            className="min-h-[44px] px-6 py-2.5 bg-[#00B4D8] hover:bg-[#0096C7] text-white font-black rounded-full text-xs transition-all shadow-[0_3px_0_#0077B6] active:translate-y-0.5 cursor-pointer"
          >
            Buat Materi
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/game')}
            className="min-h-[44px] px-6 py-2.5 bg-[#FF3B8D] hover:bg-[#E62879] text-white font-black rounded-full text-xs transition-all shadow-[0_3px_0_#C2185B] active:translate-y-0.5 cursor-pointer"
          >
            Buat Game
          </button>
        </div>
      </div>
    </div>
  );
}
