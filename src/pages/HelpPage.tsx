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
  QrCode,
  Film,
  Image as ImageIcon,
  Mic,
  AlertTriangle,
  Copy,
  Check,
  HardDrive,
  Cloud,
  ShieldCheck,
  RefreshCw,
  FolderArchive,
} from 'lucide-react';
import { MEDIA_LIMITS, YOUTUBE_VIDEO_RECOMMENDATION } from '../config/limits';
import { APP_CONFIG } from '../config/appConfig';
import OnboardingModal from '../components/OnboardingModal';

interface HelpPageProps {
  onNavigate: (path: string) => void;
}

interface FaqItem {
  q: string;
  a: string;
}

interface QuickInputExample {
  template: string;
  category: 'materi' | 'game';
  format: string;
  example: string;
  note: string;
}

const QUICK_INPUT_EXAMPLES: QuickInputExample[] = [
  {
    template: 'Slide Materi',
    category: 'materi',
    format: 'Judul Slide | Isi / Ringkasan Materi',
    example: 'الْمُقَدِّمَةُ | فِي هَذَا الدَّرْسِ نَتَعَلَّمُ أَسْمَاءَ أَدَوَاتِ الْمَدْرَسَةِ',
    note: 'Satu baris mewakili 1 kartu slide presentasi.',
  },
  {
    template: 'Kosakata Bergambar',
    category: 'materi',
    format: 'Kata Arab | Arti Indonesia | Transliterasi Latin',
    example: 'كِتَابٌ | Buku tulis / baca | kitaabun',
    note: 'Gambar & audio pelafalan dapat dilampirkan setelah diimpor ke editor.',
  },
  {
    template: 'Teks Bacaan (Qira\'ah)',
    category: 'materi',
    format: 'Kalimat Arab | Terjemahan Bahasa Indonesia',
    example: 'يَذْهَبُ أَحْمَدُ إِلَى الْمَدْرَسَةِ صَبَاحًا | Ahmad pergi ke sekolah di pagi hari',
    note: 'Masing-masing baris menjadi 1 kalimat yang dapat diintip artinya oleh siswa.',
  },
  {
    template: 'Tabel / Tashrif Kata',
    category: 'materi',
    format: 'Bentuk 1 | Bentuk 2 | Bentuk 3 | Arti',
    example: 'كَتَبَ | يَكْتُبُ | كِتَابَةً | Menulis',
    note: 'Mendukung mode sembunyikan kolom untuk melatih hafalan wazan fi\'il.',
  },
  {
    template: 'Flashcard Kosakata',
    category: 'game',
    format: 'Kata Arab | Arti Indonesia | Transliterasi Latin',
    example: 'قَلَمٌ | Pena / pulpen | qolamun',
    note: 'Kartu 3D interaktif yang bisa dibalik untuk menguji hafalan mandiri siswa.',
  },
  {
    template: 'Kuis Pilihan Ganda',
    category: 'game',
    format: 'Soal Arab | Opsi A | Opsi B* | Opsi C | Opsi D | Penjelasan',
    example: 'مَا مَعْنَى «كِتَابٌ»؟ | Pena | Buku* | Meja | Pintu | كِتَابٌ artinya buku untuk belajar',
    note: 'Beri tanda bintang (*) pada pilihan jawaban yang benar.',
  },
  {
    template: 'Mencocokkan Kata',
    category: 'game',
    format: 'Kata Arab | Pasangan Arti Indonesia',
    example: 'سَيَّارَةٌ | Mobil\nطَائِرَةٌ | Pesawat\nدَرَّاجَةٌ | Sepeda',
    note: 'Akan diacak otomatis di game untuk dipasangkan siswa secara bergantian.',
  },
  {
    template: 'Susun Huruf (Hijaiah)',
    category: 'game',
    format: 'Kata Arab | Petunjuk Arti',
    example: 'مَدْرَسَةٌ | Tempat menuntut ilmu (Sekolah)',
    note: 'Huruf-huruf akan dipecah otomatis agar disusun kembali dari kanan ke kiri (RTL).',
  },
  {
    template: 'Susun Kalimat',
    category: 'game',
    format: 'Kalimat Arab Utuh | Terjemahan Indonesia',
    example: 'أَنَا أَتَعَلَّمُ اللُّغَةَ الْعَرَبِيَّةَ | Saya belajar bahasa Arab',
    note: 'Kata-kata dalam kalimat akan diacak untuk disusun ulang secara runtut.',
  },
  {
    template: 'Memory Card (Ingatan)',
    category: 'game',
    format: 'Kata Arab | Arti Indonesia',
    example: 'بَيْتٌ | Rumah\nمَسْجِدٌ | Masjid\nحَدِيقَةٌ | Taman',
    note: 'Game kartu tertutup untuk melatih daya ingat pasangan kata dan arti.',
  },
  {
    template: 'Roda Acak (Spin Wheel)',
    category: 'game',
    format: 'Teks Sektor Roda | Keterangan / Poin',
    example: 'اقْرَأْ هَذِهِ الْكَلِمَةَ | Baca kata berikut\nتَرْجِمْ إِلَى الْعَرَبِيَّةِ | Terjemahkan ke Arab',
    note: 'Cocok untuk undian giliran siswa atau pertanyaan acak ice breaking.',
  },
  {
    template: 'Benar / Salah',
    category: 'game',
    format: 'Pernyataan Arab | benar/salah | Arti & Penjelasan',
    example: 'الشَّمْسُ تَطْلُعُ مِنَ الْمَشْرِقِ | benar | Benar, matahari terbit dari arah timur',
    note: 'Gunakan kata "benar" atau "salah" (bisa huruf besar/kecil).',
  },
  {
    template: 'Isian Singkat (Rumpang)',
    category: 'game',
    format: 'Kalimat dengan ___ | Kunci Jawaban | Penjelasan',
    example: 'يَذْهَبُ الطَّالِبُ إِلَى ___ صَبَاحًا | الْمَدْرَسَةِ | Siswa pergi ke sekolah pada waktu pagi',
    note: 'Pastikan menyisipkan tanda tiga garis bawah (___) sebagai tempat yang harus diisi siswa.',
  },
  {
    template: 'Tebak Media (Gambar/Audio)',
    category: 'game',
    format: 'Jawaban Arab | Arti Indonesia',
    example: 'فِيلٌ | Gajah\nأَسَدٌ | Singa',
    note: 'Lampirkan gambar atau audio yang tertutup lalu tebak bersama siswa.',
  },
];

export default function HelpPage({ onNavigate }: HelpPageProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  const handleCopyExample = (templateName: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedTemplate(templateName);
    setTimeout(() => setCopiedTemplate(null), 2000);
  };

  const faqs: FaqItem[] = [
    {
      q: 'Apakah saya wajib login dengan akun Google untuk memakai Teach Arab?',
      a: 'Tidak wajib sama sekali! Anda bisa langsung memakai Teach Arab dalam Mode Tamu. Seluruh draf materi tersimpan di peramban browser Anda (menggunakan IndexedDB lokal), dan Anda dapat langsung mengunduh file HTML mandiri untuk diputar secara offline di kelas tanpa perlu mendaftar atau login.',
    },
    {
      q: 'Kapan saya sebaiknya masuk dengan akun Google?',
      a: 'Masuk dengan Google diperlukan jika Anda ingin membagikan link interaktif unik atau kode QR yang dapat dibuka siswa dari rumah, atau saat Anda ingin materi tersimpan permanen di cloud Firebase agar bisa dibuka dari perangkat lain tanpa risiko terhapus pembersihan cache browser.',
    },
    {
      q: 'Bagaimana cara membuka file HTML offline di proyektor kelas tanpa koneksi internet?',
      a: 'Setelah membuat materi di editor, klik tombol "Unduh" lalu pilih "Unduh HTML (Offline)". Simpan berkas tunggal .html tersebut ke flashdisk. Di ruang kelas, tancapkan flashdisk ke laptop proyektor lalu klik ganda file tersebut. File akan terbuka langsung di peramban (Chrome, Edge, Firefox) secara interaktif 100% tanpa internet.',
    },
    {
      q: 'Apakah teks Arab dan harakat dijamin rapi dan tidak terpotong di layar proyektor?',
      a: 'Ya, Teach Arab dirancang khusus untuk pembelajaran bahasa Arab. Kami menggunakan font standar internasional (Amiri, Noto Naskh Arabic, Scheherazade New) dengan penyesuaian line-height khusus agar harakat fathah, kasrah, dammah, tanwin, dan tasydid tampil sempurna tanpa terpotong. Arah teks diatur kanan-ke-kiri (RTL) secara otomatis.',
    },
    {
      q: 'Berapa batas ukuran media yang bisa diunggah ke materi?',
      a: `Batas ukuran media: Foto/gambar maksimal ${MEDIA_LIMITS.IMAGE_MAX_MB} MB, rekaman audio suara maksimal ${MEDIA_LIMITS.AUDIO_MAX_MB} MB, dan video langsung maksimal ${MEDIA_LIMITS.VIDEO_MAX_MB} MB. Untuk video materi pelajaran yang berdurasi panjang, sangat disarankan menggunakan tautan YouTube agar siswa dapat memutar video dengan lancar tanpa buffering.`,
    },
    {
      q: 'Bagaimana cara kerja Bantuan AI Gemini dan apakah hasilnya selalu akurat?',
      a: 'Fitur Bantuan AI memakai model Gemini Flash dari Google untuk menyusun draf kosakata berharakat, kuis pilihan ganda, pernyataan benar/salah, dan kalimat rumpang secara otomatis. Hasil AI masuk sebagai draf pratinjau yang bisa dicentang dan diedit guru. PENTING: Guru wajib memeriksa kembali harakat, tata bahasa, dan kebenaran jawaban sebelum materi digunakan di kelas.',
    },
    {
      q: 'Apakah ada batasan penggunaan fitur Bantuan AI?',
      a: 'Untuk menjaga keadilan dan ketersediaan layanan bersama, terdapat batas pemakaian wajar sederhana yaitu 10 permintaan per jam dan 30 permintaan per hari untuk setiap pengguna.',
    },
    {
      q: 'Apakah siswa yang membuka link harus memiliki akun atau login?',
      a: 'Sama sekali tidak! Siswa cukup membuka tautan publik (/p/{shareId}) atau memindai kode QR dari HP atau tablet mereka. Siswa langsung masuk ke antarmuka permainan atau materi tanpa formulir registrasi atau login akun.',
    },
    {
      q: 'Bagaimana cara menonaktifkan link publik yang sudah dibagikan ke siswa?',
      a: 'Masuk ke menu "Materi Saya" di bilah atas. Cari materi yang ingin dinonaktifkan, lalu matikan saklar "Tautan Publik Siswa". Seketika itu juga tautan tidak akan bisa diakses lagi oleh siapapun.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12 pb-24">
      {/* ========================================================= */}
      {/* HEADER BANNER */}
      {/* ========================================================= */}
      <div className="bg-[#FED034] text-[#0A254D] rounded-[36px] p-8 sm:p-12 shadow-sm relative overflow-hidden border-2 border-[#0A254D]">
        <div
          aria-hidden="true"
          className="absolute -top-10 -right-10 w-44 h-44 bg-white/30 rounded-full blur-xs pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#00B4D8]/20 rounded-full blur-xs pointer-events-none"
        />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white text-[#0A254D] rounded-full text-xs font-black uppercase tracking-wider shadow-xs border border-[#0A254D]/15">
            <HelpCircle className="w-3.5 h-3.5 text-[#FF3B8D]" />
            <span>Pusat Bantuan & Panduan Guru {APP_CONFIG.VERSION}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#0A254D] tracking-tight leading-tight">
            Panduan Lengkap Teach Arab
          </h1>

          <p className="text-[#0A254D] text-sm sm:text-base font-semibold leading-relaxed">
            Ketahui alur pembuatan materi, perbedaan format Materi & Game, panduan format Input Cepat untuk 14 template, tips ekspor offline, hingga pemakaian Bantuan AI Gemini.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowOnboarding(true)}
              className="min-h-[44px] px-5 py-2.5 bg-[#0A254D] hover:bg-black text-white font-black text-xs sm:text-sm rounded-full shadow-[0_3px_0_#000] flex items-center gap-2 cursor-pointer transition-all active:translate-y-0.5"
            >
              <Sparkles className="w-4 h-4 text-[#FED034]" />
              <span>Buka Tur Pengenalan (4 Langkah)</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/materi')}
              className="min-h-[44px] px-5 py-2.5 bg-white hover:bg-stone-50 text-[#0A254D] font-black text-xs sm:text-sm rounded-full shadow-[0_3px_0_#0A254D] border-2 border-[#0A254D] flex items-center gap-2 cursor-pointer transition-all active:translate-y-0.5"
            >
              <BookOpen className="w-4 h-4 text-[#00B4D8]" />
              <span>Galeri Materi</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/game')}
              className="min-h-[44px] px-5 py-2.5 bg-[#FF3B8D] hover:bg-[#E62879] text-white font-black text-xs sm:text-sm rounded-full shadow-[0_3px_0_#C2185B] flex items-center gap-2 cursor-pointer transition-all active:translate-y-0.5"
            >
              <Gamepad2 className="w-4 h-4 text-white" />
              <span>Galeri Game</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* KARTU 1: CARA PAKAI (ALUR 4 LANGKAH GURU) */}
      {/* ========================================================= */}
      <section className="bg-white border-2 border-stone-100 rounded-[32px] p-6 sm:p-10 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#FED034]" />
            <span>Alur Mengajar</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0A254D] tracking-tight">
            Cara Pakai: Alur Praktis 4 Langkah
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 font-medium">
            Alur kerja yang dirancang untuk efisiensi persiapan guru sebelum masuk ruang kelas:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#FAFCFC] border-2 border-stone-100 rounded-3xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#FED034] text-[#0A254D] font-black text-lg flex items-center justify-center shadow-xs">
              1
            </div>
            <h3 className="font-black text-[#0A254D] text-sm">Pilih Format</h3>
            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              Tentukan apakah Anda ingin menyajikan <strong>Materi</strong> presentasi terstruktur atau melatih siswa dengan <strong>Game</strong> interaktif.
            </p>
          </div>

          <div className="bg-[#FAFCFC] border-2 border-stone-100 rounded-3xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#00B4D8] text-white font-black text-lg flex items-center justify-center shadow-xs">
              2
            </div>
            <h3 className="font-black text-[#0A254D] text-sm">Isi Konten</h3>
            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              Ketik manual, gunakan tombol <strong>Input Cepat</strong> untuk menempel puluhan kata sekaligus, atau gunakan <strong>Bantuan AI Gemini</strong>.
            </p>
          </div>

          <div className="bg-[#FAFCFC] border-2 border-stone-100 rounded-3xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#FF3B8D] text-white font-black text-lg flex items-center justify-center shadow-xs">
              3
            </div>
            <h3 className="font-black text-[#0A254D] text-sm">Unduh atau Bagikan</h3>
            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              Pilih <strong>Unduh HTML Mandiri</strong> untuk proyektor offline, atau simpan ke cloud dan bagikan tautan + kode QR ke gawai siswa.
            </p>
          </div>

          <div className="bg-[#FAFCFC] border-2 border-stone-100 rounded-3xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#0A254D] text-white font-black text-lg flex items-center justify-center shadow-xs">
              4
            </div>
            <h3 className="font-black text-[#0A254D] text-sm">Mainkan di Kelas</h3>
            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              Tampilkan di proyektor kelas dengan mode <strong>Layar Penuh</strong> dan hidupkan kompetisi 2-4 kelompok dengan <strong>Mode Tim</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* KARTU 2: BEDA MATERI DAN GAME */}
      {/* ========================================================= */}
      <section className="bg-white border-2 border-stone-100 rounded-[32px] p-6 sm:p-10 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-black uppercase tracking-wider mb-2">
            <Layers className="w-3.5 h-3.5 text-[#00B4D8]" />
            <span>Perbedaan Kategori</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0A254D] tracking-tight">
            Perbedaan Kategori: Materi vs Game
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 font-medium">
            Ketahui fungsi dan peruntukan masing-masing kategori agar proses belajar mengajar lebih terarah:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Materi */}
          <div className="border-t-8 border-t-[#00B4D8] border-x-2 border-b-2 border-stone-100 bg-[#E6F7F5]/30 rounded-3xl p-6 space-y-4 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#00B4D8] text-white flex items-center justify-center font-bold shadow-xs">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-[#0A254D] text-lg">Kategori Materi (4 Format)</h3>
                </div>
                <span className="text-[11px] font-black px-3 py-0.5 rounded-full bg-white text-[#00B4D8] border border-[#00B4D8]/30">
                  Presentasi
                </span>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed font-medium">
                <strong>Tujuan Penggunaan:</strong> Menyampaikan isi pelajaran secara runtut di layar proyektor atau dibaca mandiri oleh siswa. Menekankan ketepatan tanda harakat, audio fasih, dan catatan penjelas guru.
              </p>

              <div className="pt-3 border-t border-[#00B4D8]/20 space-y-2 text-xs text-[#0A254D]">
                <div><strong>1. Slide Materi:</strong> Presentasi bab pelajaran dengan pilihan tata letak, gambar, dan audio.</div>
                <div><strong>2. Kosakata Bergambar:</strong> Kartu visual besar untuk mengenalkan mufrodat baru secara bertahap.</div>
                <div><strong>3. Teks Bacaan (Qira'ah):</strong> Teks Arab berharakat mengalir rapi dengan fitur intip arti kalimat.</div>
                <div><strong>4. Tabel / Tashrif Kata:</strong> Tabel hafalan mufradat dan perubahan fi'il dengan mode sembunyikan kolom & tombol cetak.</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('/materi')}
              className="w-full min-h-[44px] mt-2 py-2.5 bg-[#00B4D8] hover:bg-[#0096C7] text-white font-black text-xs rounded-full transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_3px_0_#0077B6] active:translate-y-0.5"
            >
              <span>Jelajahi Galeri Materi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card Game */}
          <div className="border-t-8 border-t-[#FF3B8D] border-x-2 border-b-2 border-stone-100 bg-[#FFF0F6]/30 rounded-3xl p-6 space-y-4 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#FF3B8D] text-white flex items-center justify-center font-bold shadow-xs">
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-[#0A254D] text-lg">Kategori Game (10 Permainan)</h3>
                </div>
                <span className="text-[11px] font-black px-3 py-0.5 rounded-full bg-white text-[#FF3B8D] border border-[#FF3B8D]/30">
                  Interaktif
                </span>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed font-medium">
                <strong>Tujuan Penggunaan:</strong> Menguji pemahaman, melatih daya ingat hafalan kosakata, dan mencairkan suasana kelas melalui kompetisi kelompok 2-4 tim yang penuh semangat dan ceria.
              </p>

              <div className="pt-3 border-t border-[#FF3B8D]/20 space-y-2 text-xs text-[#0A254D]">
                <div><strong>1. Flashcard 3D:</strong> Kartu bolak-balik interaktif untuk hafalan mandiri siswa.</div>
                <div><strong>2. Kuis Pilihan Ganda:</strong> Cerdas cermat dengan timer, poin, dan mode kompetisi tim.</div>
                <div><strong>3. Mencocokkan Kata:</strong> Pasangkan kata Arab dengan artinya dengan papan giliran tim.</div>
                <div><strong>4. Susun Huruf & Susun Kalimat:</strong> Latihan menyusun potongan huruf atau kalimat Arab ber-harakat.</div>
                <div><strong>5. Memory Card, Roda Acak, Benar/Salah, Isian Singkat, & Tebak Media.</strong></div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('/game')}
              className="w-full min-h-[44px] mt-2 py-2.5 bg-[#FF3B8D] hover:bg-[#E62879] text-white font-black text-xs rounded-full transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_3px_0_#C2185B] active:translate-y-0.5"
            >
              <span>Jelajahi Galeri Game</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* KARTU 3: INPUT CEPAT PER TEMPLATE (14 CONTOH LENGKAP) */}
      {/* ========================================================= */}
      <section className="bg-white border-2 border-stone-100 rounded-[32px] p-6 sm:p-10 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-black uppercase tracking-wider mb-2">
            <Keyboard className="w-3.5 h-3.5 text-[#0A254D]" />
            <span>Format Input Cepat</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0A254D] tracking-tight">
            Contoh Format Input Cepat (14 Template)
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 font-medium">
            Tombol <strong>Input Cepat</strong> ada di pojok kanan atas setiap editor. Anda dapat menyalin contoh baris di bawah ini dan menempelkannya langsung:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {QUICK_INPUT_EXAMPLES.map((ex, idx) => {
            const isCopied = copiedTemplate === ex.template;
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl border-2 border-stone-100 bg-stone-50/50 hover:border-stone-300 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#0A254D] text-white text-[11px] font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h3 className="font-black text-xs text-[#0A254D]">{ex.template}</h3>
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                      ex.category === 'materi'
                        ? 'bg-[#E6F7F5] text-[#00B4D8] border-[#00B4D8]/30'
                        : 'bg-[#FFF0F6] text-[#FF3B8D] border-[#FF3B8D]/30'
                    }`}
                  >
                    {ex.category}
                  </span>
                </div>

                <div className="text-[11px] text-stone-500 font-semibold">
                  <strong>Pola Format:</strong> <code className="bg-stone-200/60 px-1 py-0.5 rounded text-[#0A254D]">{ex.format}</code>
                </div>

                <div className="relative bg-white border border-stone-200 rounded-xl p-2.5 font-mono text-[11px] text-[#0A254D] flex items-center justify-between gap-2 overflow-x-auto">
                  <span className="truncate">{ex.example}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyExample(ex.template, ex.example)}
                    className="min-h-[32px] px-2 py-1 bg-stone-100 hover:bg-stone-200 text-[#0A254D] rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
                    title="Salin contoh ke clipboard"
                  >
                    {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{isCopied ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-stone-500 italic">
                  💡 {ex.note}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* KARTU 4: UNDUH HTML DAN ZIP (100% OFFLINE) */}
      {/* ========================================================= */}
      <section className="bg-white border-2 border-stone-100 rounded-[32px] p-6 sm:p-10 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-black uppercase tracking-wider mb-2">
            <Download className="w-3.5 h-3.5 text-[#00B4D8]" />
            <span>Ekspor Mandiri</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0A254D] tracking-tight">
            Unduh HTML Mandiri dan Paket ZIP (100% Offline)
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 font-medium">
            Tidak ada koneksi internet di ruang kelas? Teach Arab memberikan solusi ekspor mandiri yang sangat andal:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl border-2 border-sky-100 bg-sky-50/40 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#00B4D8] text-white flex items-center justify-center shadow-xs">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="font-black text-sm text-[#0A254D]">1. Unduh HTML Mandiri</h3>
            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              Satu berkas <code>.html</code> utuh yang memuat kode, gaya, font Arab, dan seluruh media yang di-encode secara base64. Siap dibuka di peramban mana pun tanpa koneksi internet.
            </p>
          </div>

          <div className="p-5 rounded-2xl border-2 border-indigo-100 bg-indigo-50/40 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <FolderArchive className="w-5 h-5" />
            </div>
            <h3 className="font-black text-sm text-[#0A254D]">2. Unduh Paket ZIP</h3>
            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              Berisi <code>index.html</code> dan folder <code>media/</code> terpisah. Sangat ideal untuk proyek berukuran besar dengan puluhan foto ilustrasi dan rekaman suara berkualitas tinggi.
            </p>
          </div>

          <div className="p-5 rounded-2xl border-2 border-emerald-100 bg-emerald-50/40 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="font-black text-sm text-[#0A254D]">3. Ekspor & Impor JSON</h3>
            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              Cadangkan draf lokal Anda dalam format JSON untuk dipindahkan atau dibagikan ke laptop rekan guru lain dengan mudah.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* KARTU 5: BAGIKAN LINK DAN KODE QR UNTUK SISWA */}
      {/* ========================================================= */}
      <section className="bg-white border-2 border-stone-100 rounded-[32px] p-6 sm:p-10 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-black uppercase tracking-wider mb-2">
            <Share2 className="w-3.5 h-3.5 text-[#FF3B8D]" />
            <span>Akses Siswa</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0A254D] tracking-tight">
            Bagikan Link Interaktif & Kode QR untuk Siswa
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 font-medium">
            Permudah tugas rumah dan permainan interaktif di kelas melalui tautan publik langsung:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl border-2 border-stone-100 bg-stone-50 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#FF3B8D] text-white flex items-center justify-center font-black text-xs">
              <Share2 className="w-4 h-4" />
            </div>
            <h3 className="font-black text-xs text-[#0A254D]">Tautan Publik (/p/...)</h3>
            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              Guru cukup menyalin link unik yang dihasilkan. Siswa dapat membukanya langsung di smartphone atau tablet tanpa perlu membuat akun atau login.
            </p>
          </div>

          <div className="p-5 rounded-2xl border-2 border-stone-100 bg-stone-50 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#00B4D8] text-white flex items-center justify-center font-black text-xs">
              <QrCode className="w-4 h-4" />
            </div>
            <h3 className="font-black text-xs text-[#0A254D]">Kode QR Siap Cetak</h3>
            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              Sistem secara otomatis membuat kode QR resolusi tinggi yang dapat ditampilkan di proyektor atau dicetak pada lembar kerja siswa untuk dipindai kamera HP.
            </p>
          </div>

          <div className="p-5 rounded-2xl border-2 border-stone-100 bg-stone-50 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#0A254D] text-white flex items-center justify-center font-black text-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-black text-xs text-[#0A254D]">Kontrol Privasi Penuh</h3>
            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              Guru dapat mengaktifkan atau menonaktifkan akses tautan publik kapan saja dari halaman <strong>Materi Saya</strong> dengan satu kali klik.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* KARTU 6: BATAS UKURAN MEDIA & ANJURAN VIDEO */}
      {/* ========================================================= */}
      <section className="bg-white border-2 border-stone-100 rounded-[32px] p-6 sm:p-10 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-black uppercase tracking-wider mb-2">
            <Film className="w-3.5 h-3.5 text-amber-600" />
            <span>Ketentuan Media</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0A254D] tracking-tight">
            Batas Ukuran Media & Anjuran Video
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 font-medium">
            Untuk menjaga kecepatan muat dan kenyamanan siswa saat membuka materi di jaringan internet terbatas:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border-2 border-stone-200 bg-stone-50 space-y-2">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#00B4D8]" />
              <h3 className="font-black text-sm text-[#0A254D]">Foto & Gambar</h3>
            </div>
            <div className="text-2xl font-black text-[#00B4D8]">{MEDIA_LIMITS.IMAGE_MAX_MB} MB</div>
            <p className="text-xs text-stone-600 font-medium leading-relaxed">
              Maksimal {MEDIA_LIMITS.IMAGE_MAX_MB} MB per file. Format didukung: JPG, PNG, WebP, SVG.
            </p>
          </div>

          <div className="p-4 rounded-2xl border-2 border-stone-200 bg-stone-50 space-y-2">
            <div className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-[#FF3B8D]" />
              <h3 className="font-black text-sm text-[#0A254D]">Rekaman Audio</h3>
            </div>
            <div className="text-2xl font-black text-[#FF3B8D]">{MEDIA_LIMITS.AUDIO_MAX_MB} MB</div>
            <p className="text-xs text-stone-600 font-medium leading-relaxed">
              Maksimal {MEDIA_LIMITS.AUDIO_MAX_MB} MB per rekaman. Format didukung: MP3, WAV, AAC, M4A.
            </p>
          </div>

          <div className="p-4 rounded-2xl border-2 border-stone-200 bg-stone-50 space-y-2">
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-indigo-600" />
              <h3 className="font-black text-sm text-[#0A254D]">Video Berkas Langsung</h3>
            </div>
            <div className="text-2xl font-black text-indigo-600">{MEDIA_LIMITS.VIDEO_MAX_MB} MB</div>
            <p className="text-xs text-stone-600 font-medium leading-relaxed">
              Maksimal {MEDIA_LIMITS.VIDEO_MAX_MB} MB per berkas (MP4/WebM).
            </p>
          </div>
        </div>

        {/* Anjuran YouTube */}
        <div className="p-4 bg-[#FFF8DC] border-2 border-[#FED034]/70 rounded-2xl flex items-start gap-3 text-xs text-[#0A254D]">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong>Rekomendasi Video Materi Besar:</strong>
            <p className="text-stone-700 font-medium leading-relaxed">
              {YOUTUBE_VIDEO_RECOMMENDATION}
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* KARTU 7: PEMAKAIAN BANTUAN AI GEMINI */}
      {/* ========================================================= */}
      <section className="bg-white border-2 border-stone-100 rounded-[32px] p-6 sm:p-10 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE4EE] text-[#FF3B8D] text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#FF3B8D]" />
            <span>Bantuan AI Gemini</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0A254D] tracking-tight">
            Pemakaian Fitur Bantuan AI
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 font-medium">
            Hemat waktu menyusun butir soal dan kosakata bahasa Arab dengan kecerdasan buatan Google Gemini:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl border-2 border-pink-100 bg-[#FFF0F6]/40 space-y-2.5">
            <h3 className="font-black text-sm text-[#0A254D]">Cara Menggunakan Bantuan AI:</h3>
            <ol className="list-decimal list-inside text-xs text-stone-700 space-y-1.5 font-medium leading-relaxed">
              <li>Buka editor (Flashcard, Kuis, Benar/Salah, atau Isian Singkat).</li>
              <li>Klik tombol <strong>Bantuan AI</strong> di bilah atas atau kartu draf kosong.</li>
              <li>Pilih jenis tugas yang sesuai (misal: Kosakata dari Tema, Pilihan Ganda dari Teks, dll.).</li>
              <li>Isi tema materi atau tempel paragraf teks rujukan buku pelajaran.</li>
              <li>Tentukan jumlah soal (1 sampai 15) dan tingkat siswa (pemula, menengah, lanjut).</li>
              <li>Klik <strong>Buat Draf Materi AI</strong>, tinjau hasilnya di pratinjau, lalu masukkan ke editor.</li>
            </ol>
          </div>

          <div className="p-5 rounded-2xl border-2 border-amber-100 bg-amber-50/40 space-y-2.5 flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="font-black text-sm text-[#0A254D]">Pratinjau Aman & Kuota Wajar:</h3>
              <p className="text-xs text-stone-700 leading-relaxed font-medium">
                Hasil AI selalu ditampilkan dalam bentuk <strong>pratinjau yang dapat dicentang dan diedit guru</strong>. Hasil AI <strong>tidak pernah menimpa</strong> isi yang sudah ada di editor, melainkan ditambahkan ke akhir daftar.
              </p>
              <div className="pt-2 text-[11px] text-stone-600 font-semibold space-y-1">
                <div>⚡ <strong>Batas Kuota:</strong> 10 permintaan per jam / 30 permintaan per hari.</div>
                <div>🔒 <strong>Aman & Privat:</strong> Kunci API Gemini tersimpan aman di server tanpa bocor ke peramban siswa.</div>
              </div>
            </div>

            {/* Peringatan Tetap Guru */}
            <div className="mt-3 p-3 bg-[#FFF8DC] border-2 border-[#FED034] rounded-xl flex items-center gap-2 text-xs text-[#0A254D] font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Peringatan Guru:</strong> {APP_CONFIG.AI.TEACHER_WARNING}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* KARTU 8: FAQ AKORDEON */}
      {/* ========================================================= */}
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
            Klik pertanyaan di bawah ini untuk membaca penjelasan lengkapnya:
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

      {/* ========================================================= */}
      {/* CTA BANNER AT BOTTOM */}
      {/* ========================================================= */}
      <div className="bg-[#0A254D] text-white rounded-[36px] p-8 sm:p-12 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border-2 border-[#0A254D]">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-xl sm:text-2xl font-black">Siap Membuat Media Ajar Hari Ini?</h3>
          <p className="text-stone-300 text-xs sm:text-sm max-w-md">
            Mulai dari draf kosong atau pakai contoh materi siap pakai untuk menghidupkan suasana kelas bahasa Arab Anda.
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

      {/* Onboarding Tour Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onNavigate={onNavigate}
      />
    </div>
  );
}
