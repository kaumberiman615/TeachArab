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
} from 'lucide-react';

interface HelpPageProps {
  onNavigate: (path: string) => void;
}

export default function HelpPage({ onNavigate }: HelpPageProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-semibold mb-3 border border-emerald-200">
          <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Bantuan & Panduan Guru</span>
        </div>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
          Cara Pakai & Panduan Teach Arab
        </h1>
        <p className="text-stone-600 text-sm mt-1">
          Pelajari perbedaan kategori Materi dan Game, cara menggunakan Input Cepat, hingga trik menampilkan di proyektor kelas offline.
        </p>
      </div>

      {/* SECTION: Perbedaan Kategori Materi vs Game */}
      <section className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-700" />
            <span>Dua Kategori Template: Materi vs Game</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Teach Arab membagi perangkat ajar menjadi 2 kategori dengan tujuan penggunaan yang berbeda di kelas:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Kategori Materi */}
          <div className="border border-emerald-200 bg-emerald-50/40 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-stone-900 text-base">Kategori Materi</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Penyaji Ajar
              </span>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              <strong>Tujuan:</strong> Menyampaikan isi pelajaran secara runtut di layar proyektor atau dibaca mandiri oleh siswa. Fokus pada kejelasan visual, harakat, dan penjelasan.
            </p>

            <div className="pt-2 border-t border-emerald-100 space-y-2 text-xs text-stone-700">
              <div>
                <strong>1. Slide Materi:</strong> Presentasi bab pelajaran dengan pilihan tata letak, gambar, video YouTube, dan catatan guru.
              </div>
              <div>
                <strong>2. Kosakata Bergambar:</strong> Kartu visual besar untuk mengenalkan mufrodat baru dengan suara fasih.
              </div>
              <div>
                <strong>3. Teks Bacaan (Qira'ah):</strong> Teks Arab mengalir rapi dengan intip arti per kalimat dan audio fasih.
              </div>
              <div>
                <strong>4. Tabel / Tashrif Kata:</strong> Tabel kata mufradat dan tasrif fi'il dengan mode hafalan dan tombol cetak ramah kertas.
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('/materi')}
              className="w-full mt-2 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Jelajahi Galeri Materi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card Kategori Game */}
          <div className="border border-indigo-200 bg-indigo-50/40 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Gamepad2 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-stone-900 text-base">Kategori Game</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                Permainan Kelas
              </span>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              <strong>Tujuan:</strong> Melatih pemahaman, mengingat kata, dan mencairkan suasana kelas lewat kompetisi yang menyenangkan dan interaktif.
            </p>

            <div className="pt-2 border-t border-indigo-100 space-y-2 text-xs text-stone-700">
              <div>
                <strong>1. Flashcard Kosakata:</strong> Kartu hafalan bolak-balik 3D untuk melatih kecepatan daya ingat siswa.
              </div>
              <div>
                <strong>2. Kuis Pilihan Ganda:</strong> Evaluasi cerdas cermat dengan batas waktu timer dan mode kompetisi 2–4 tim kelas.
              </div>
              <div>
                <strong>3. Mencocokkan Kata:</strong> Game tarik-pasang (drag and drop) kata Arab dengan artinya atau gambarnya.
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('/game')}
              className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Jelajahi Galeri Game</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 4-Step Quick Flow */}
      <section className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-700" />
          <span>Alur Cepat 4 Langkah Membuat Media</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="font-bold text-stone-900 text-sm">Pilih Kategori & Format</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed pl-8">
              Pilih <strong>Materi</strong> untuk presentasi/bacaan atau <strong>Game</strong> untuk aktivitas latihan murid.
            </p>
          </div>

          <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h3 className="font-bold text-stone-900 text-sm">Masukkan Materi / Tempel Cepat</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed pl-8">
              Ketik langsung lewat form atau gunakan tombol <strong>Input Cepat</strong> untuk menempel puluhan baris kosakata dari Excel/buku sekaligus dalam hitungan detik.
            </p>
          </div>

          <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                3
              </span>
              <h3 className="font-bold text-stone-900 text-sm">Atur Media & Tampilan</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed pl-8">
              Rekam pelafalan suara guru lewat mikrofon, pasang foto ilustrasi, pilih font Arab (Amiri, Noto, Scheherazade), dan atur ukuran teks untuk proyektor.
            </p>
          </div>

          <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                4
              </span>
              <h3 className="font-bold text-stone-900 text-sm">Unduh File HTML Offline</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed pl-8">
              Klik <strong>Unduh / Ekspor</strong> &gt; <strong>Unduh HTML (Offline)</strong>. Simpan file tersebut ke flashdisk dan bawa ke ruang kelas tanpa perlu koneksi internet.
            </p>
          </div>
        </div>
      </section>

      {/* Guide: Input Cepat */}
      <section className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-700" />
          <span>Panduan Fitur "Input Cepat" (Batch Paste)</span>
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Guru tidak perlu mengetik satu per satu. Buka tombol <strong>Input Cepat</strong> di editor, lalu tempel data dengan pemisah pipa (<code>|</code>) atau tab:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
            <span className="text-xs font-bold text-stone-800 block mb-1">
              Slide Materi: (judul | isi)
            </span>
            <code className="block bg-white p-2.5 rounded-lg border border-stone-200 text-xs font-mono text-emerald-900 leading-relaxed overflow-x-auto">
              الدَّرْسُ الأَوَّلُ | فِي الفَصْلِ<br />
              Pengantar | Pengenalan peralatan kelas
            </code>
          </div>

          <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
            <span className="text-xs font-bold text-stone-800 block mb-1">
              Kosakata / Flashcard: (Arab | Latin | Arti)
            </span>
            <code className="block bg-white p-2.5 rounded-lg border border-stone-200 text-xs font-mono text-emerald-900 leading-relaxed overflow-x-auto">
              كِتَابٌ | kitaabun | buku<br />
              قَلَمٌ | qalamun | pena
            </code>
          </div>

          <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
            <span className="text-xs font-bold text-stone-800 block mb-1">
              Teks Bacaan Qira'ah: (Kalimat Arab | Terjemah)
            </span>
            <code className="block bg-white p-2.5 rounded-lg border border-stone-200 text-xs font-mono text-emerald-900 leading-relaxed overflow-x-auto">
              يَذْهَبُ أَحْمَدُ إِلَى الْمَدْرَسَةِ | Ahmad pergi ke sekolah
            </code>
          </div>

          <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
            <span className="text-xs font-bold text-stone-800 block mb-1">
              Kuis Pilihan Ganda: (Soal | A | B | C | D | Kunci)
            </span>
            <code className="block bg-white p-2.5 rounded-lg border border-stone-200 text-xs font-mono text-emerald-900 leading-relaxed overflow-x-auto">
              Apa arti كِتَابٌ? | Buku | Meja | Pena | Tas | A
            </code>
          </div>
        </div>
      </section>

      {/* Guide: Keyboard Arab & Harakat */}
      <section className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
          <Keyboard className="w-5 h-5 text-emerald-700" />
          <span>Keyboard Arab Virtual & Tanda Harakat</span>
        </h2>
        <div className="space-y-2 text-xs sm:text-sm text-stone-600 leading-relaxed">
          <p>
            Di pojok kanan bawah editor selalu tersedia tombol <strong>Keyboard Arab Virtual</strong>.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Ketik Huruf Hijaiyah:</strong> Cukup klik kolom input teks Arab, lalu klik huruf di keyboard virtual untuk memasukkannya.
            </li>
            <li>
              <strong>Harakat Lengkap:</strong> Tersedia tab Harakat khusus untuk memasukkan Fathah (ـَ), Kasrah (ـِ), Dammah (ـُ), Sukun (ـْ), Tanwin (ـً ـٍ ـٌ), dan Shaddah (ـّ).
            </li>
            <li>
              <strong>Tombol Hapus Harakat:</strong> Di atas setiap kolom Arab ada tombol "Hapus Harakat" untuk menghapus seluruh baris dalam 1 klik jika ingin membuat latihan tanpa harakat bagi murid tingkat lanjut.
            </li>
            <li>
              <strong>Tombol Bacakan:</strong> Menggunakan Web Speech API berbahasa Arab (ar-SA) untuk membacakan kata dengan pelafalan fasih jika guru belum sempat merekam audio.
            </li>
          </ul>
        </div>
      </section>

      {/* Guide: Offline HTML & Proyektor */}
      <section className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
          <Download className="w-5 h-5 text-emerald-700" />
          <span>Cara Unduh & Membuka Offline di Kelas</span>
        </h2>
        <div className="space-y-3 text-xs sm:text-sm text-stone-600 leading-relaxed">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong>Unduh HTML (Offline):</strong> Menghasilkan 1 file tunggal berekstensi <code>.html</code>. Anda bisa mengirimkannya lewat WhatsApp Web, flashdisk, atau email.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong>Cara Membuka di Kelas:</strong> Cukup klik 2x file <code>.html</code> tersebut. File akan terbuka langsung di Google Chrome / Edge tanpa koneksi internet sama sekali!
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong>Tombol Layar Penuh:</strong> Di dalam file HTML offline sudah tersedia tombol <em>Layar Penuh</em> untuk tampilan proyektor yang bersih tanpa bilah tab browser yang mengganggu.
            </div>
          </div>
        </div>
      </section>

      {/* CTA at bottom */}
      <div className="p-6 bg-emerald-700 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div>
          <h3 className="text-lg font-bold">Siap Mengajar Bahasa Arab Hari Ini?</h3>
          <p className="text-emerald-100 text-xs sm:text-sm mt-0.5">
            Pilih antara membuat materi pelajaran atau game kelas interaktif.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('/materi')}
            className="px-4 py-2.5 bg-white text-emerald-800 font-bold rounded-xl text-xs hover:bg-emerald-50 transition-colors cursor-pointer shadow-xs"
          >
            Buat Materi
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/game')}
            className="px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 transition-colors cursor-pointer shadow-xs"
          >
            Buat Game
          </button>
        </div>
      </div>
    </div>
  );
}
