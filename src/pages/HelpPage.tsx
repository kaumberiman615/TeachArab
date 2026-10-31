import {
  HelpCircle,
  FileCode,
  Sparkles,
  Keyboard,
  Monitor,
  Download,
  CheckCircle2,
  ChevronRight,
  BookOpen,
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
          Pelajari langkah mudah membuat perangkat ajar interaktif, mengekspor file offline, hingga menggunakannya di proyektor kelas.
        </p>
      </div>

      {/* 4-Step Quick Flow */}
      <section className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-700" />
          <span>Alur Cepat 4 Langkah</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="font-bold text-stone-900 text-sm">Pilih Template</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed pl-8">
              Pilih antara <strong>Flashcard Kosakata</strong> untuk materi hafalan, <strong>Kuis Pilihan Ganda</strong> untuk evaluasi seru, atau <strong>Mencocokkan Kata</strong> untuk game kelas.
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
          Guru tidak perlu mengetik satu per satu. Buka menu <strong>Input Cepat</strong> di editor, lalu tempel data dalam format:
        </p>

        <div className="space-y-3">
          <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
            <span className="text-xs font-bold text-stone-800 block mb-1">
              Contoh Format Flashcard:
            </span>
            <code className="block bg-white p-2.5 rounded-lg border border-stone-200 text-xs font-mono text-emerald-900 leading-relaxed overflow-x-auto">
              كِتَابٌ | kitaabun | buku<br />
              قَلَمٌ | qalamun | pena<br />
              مَدْرَسَةٌ | madrasatun | sekolah
            </code>
          </div>

          <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
            <span className="text-xs font-bold text-stone-800 block mb-1">
              Contoh Format Soal Kuis (Soal | A | B | C | D | Kunci | Penjelasan):
            </span>
            <code className="block bg-white p-2.5 rounded-lg border border-stone-200 text-xs font-mono text-emerald-900 leading-relaxed overflow-x-auto">
              Apa arti كِتَابٌ? | Buku | Meja | Pintu | Pena | A | Buku adalah kitaabun<br />
              أَيْنَ يَعْمَلُ الْمُدَرِّسُ؟ | فِي الْمَدْرَسَةِ | فِي الْمَطْعَمِ | فِي السُّوْقِ | فِي الْبَيْتِ | A
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
          <h3 className="text-lg font-bold">Siap Membuat Materi Pertama Anda?</h3>
          <p className="text-emerald-100 text-xs sm:text-sm mt-0.5">
            Pilih salah satu template siap pakai dan sesuaikan dengan bab pelajaran Anda.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('/buat/flashcard')}
          className="px-5 py-3 bg-white text-emerald-800 font-bold rounded-xl text-xs sm:text-sm hover:bg-emerald-50 transition-colors cursor-pointer shrink-0 shadow-xs"
        >
          Mulai Buat Sekarang
        </button>
      </div>
    </div>
  );
}
