import { useState, useRef } from 'react';
import { TemplateType } from '../types';
import { parseQuickInput } from '../utils/quickInput';
import { X, Sparkles, Check, FileText } from 'lucide-react';
import { useModalAccessibility } from '../utils/useModalAccessibility';

interface QuickInputModalProps {
  isOpen: boolean;
  templateType: TemplateType;
  onClose: () => void;
  onApplyItems: (items: any[], mode: 'replace' | 'append') => void;
}

export default function QuickInputModal({
  isOpen,
  templateType,
  onClose,
  onApplyItems,
}: QuickInputModalProps) {
  const [rawText, setRawText] = useState('');
  const [applyMode, setApplyMode] = useState<'replace' | 'append'>('append');
  const modalRef = useRef<HTMLDivElement | null>(null);

  useModalAccessibility(isOpen, onClose, modalRef);

  if (!isOpen) return null;

  const parsedItems = parseQuickInput(templateType, rawText);

  // Template-specific guidance & placeholder
  let placeholder = '';
  let exampleFormat = '';

  if (templateType === 'flashcard') {
    exampleFormat = 'كِتَابٌ | kitaabun | buku\nقَلَمٌ | qalamun | pena\nمَدْرَسَةٌ | madrasatun | sekolah';
    placeholder = 'Tempel daftar kosakata di sini:\n' + exampleFormat;
  } else if (templateType === 'kuis') {
    exampleFormat = 'مَا هَذَا؟ (Buku) | كِتَابٌ | قَلَمٌ | بَابٌ | كُرْسِيٌّ | A | Buku adalah kitaabun\nApa arti مَسْجِدٌ? | Sekolah | Masjid | Rumah | Pasar | B | Masjid tempat ibadah';
    placeholder = 'Tempel soal kuis (Soal | Pilihan A | B | C | D | Kunci [A-D] | Penjelasan):\n' + exampleFormat;
  } else if (templateType === 'slide') {
    exampleFormat = 'مَرْحَبًا بِكُمْ | Selamat datang di pembelajaran bahasa Arab\nKeutamaan Bahasa Arab | 1. Bahasa Al-Qur\'an\n2. Bahasa internasional\nHuruf Hijaiyah | Pelajari makharijul huruf dengan fasih';
    placeholder = 'Tempel slide (Judul | Isi Teks):\n' + exampleFormat;
  } else if (templateType === 'vocab-picture') {
    exampleFormat = 'أَسَدٌ | Asadun | Singa\nفِيلٌ | Fiilun | Gajah\nقِطَّةٌ | Qiththatun | Kucing';
    placeholder = 'Tempel kosakata (Kata Arab | Latin | Arti - gambar dapat diunggah setelahnya):\n' + exampleFormat;
  } else if (templateType === 'reading') {
    exampleFormat = 'إِسْمِي عُمَرُ، أَنَا طَالِبٌ فِي المَدْرَسَةِ. | Namaku Umar, aku seorang siswa di sekolah.\nأَسْتَيْقِظُ مِنَ النَّوْمِ صَبَاحًا بَاكِرًا. | Aku bangun dari tidur pagi-pagi sekali.';
    placeholder = 'Tempel kalimat qira\'ah (Kalimat Arab | Terjemahan):\n' + exampleFormat;
  } else if (templateType === 'word-table') {
    exampleFormat = 'كَتَبَ | يَكْتُبُ | اُكْتُبْ | كِتَابَةً | Menulis\nقَرَأَ | يَقْرَأُ | اِقْرَأْ | قِرَاءَةً | Membaca\nدَرَسَ | يَدْرُسُ | اُدْرُسْ | دِرَاسَةً | Belajar';
    placeholder = 'Tempel baris tabel (Kolom 1 | Kolom 2 | Kolom 3 ... atau salin langsung dari Excel):\n' + exampleFormat;
  } else if (templateType === 'true-false') {
    exampleFormat = 'الشَّمْسُ تَطْلُعُ مِنَ الْمَشْرِقِ | B | Matahari terbit dari timur\nالسَّمَكُ يَعِيشُ فِي السَّمَاءِ | S | Ikan hidup di air, bukan di langit\nالْمَدْرَسَةُ مَكَانٌ لِلتَّعَلُّمِ | B | Sekolah tempat belajar';
    placeholder = 'Tempel pernyataan (Pernyataan | B atau S | Penjelasan opsional):\n' + exampleFormat;
  } else if (templateType === 'memory') {
    exampleFormat = 'كِتَابٌ | Buku\nقَلَمٌ | Pena\nبَابٌ | Pintu\nمَسْجِدٌ | Masjid\nسَيَّارَةٌ | Mobil';
    placeholder = 'Tempel pasangan kartu (Kata Arab | Arti):\n' + exampleFormat;
  } else if (templateType === 'wheel') {
    exampleFormat = 'مَا اسْمُكَ؟ | Jawab: اسْمِي... (Nama saya...)\nكَيْفَ حَالُكَ؟ | Jawab: بِخَيْرٍ وَالْحَمْدُ لِلَّهِ\nعُدَّ مِنْ 1 إِلَى 5 | وَاحِدٌ، اِثْنَانِ، ثَلَاثَةٌ، أَرْبَعَةٌ، خَمْسَةٌ\nأحمد | Giliran siswa\nفاطمة | Giliran siswa';
    placeholder = 'Tempel entri roda (Teks Arab/Nama | Kunci/Penjelasan opsional):\n' + exampleFormat;
  } else if (templateType === 'letter-order') {
    exampleFormat = 'كِتَابٌ | Buku\nقَلَمٌ | Pena / Pulpen\nمَدْرَسَةٌ | Sekolah\nبَابٌ | Pintu\nسَيَّارَةٌ | Mobil';
    placeholder = 'Tempel kata susun huruf (Kata Arab | Arti petunjuk):\n' + exampleFormat;
  } else if (templateType === 'sentence-order') {
    exampleFormat = 'ذَهَبَ أَحْمَدُ إِلَى الْمَدْرَسَةِ / إِلَى الْمَدْرَسَةِ ذَهَبَ أَحْمَدُ | Ahmad pergi ke sekolah\nيَقْرَأُ الطَّالِبُ الْكِتَابَ فِي الْمَكْتَبَةِ | Siswa itu membaca buku di perpustakaan\nهَذَا بَيْتٌ جَمِيلٌ جِدًّا | Ini rumah yang sangat indah';
    placeholder = 'Tempel kalimat (Kalimat Arab [gunakan / untuk variasi sah] | Terjemahan):\n' + exampleFormat;
  } else if (templateType === 'fill-blank') {
    exampleFormat = 'يَذْهَبُ الطَّالِبُ إِلَى ___ صَبَاحًا | الْمَدْرَسَةِ | المدرسة | Siswa pergi ke sekolah\nأَنَا أَكْتُبُ بِـ ___ | الْقَلَمِ | القلم | Menulis dengan pena\nمَكَانُ الصَّلَاةِ هُوَ ___ | الْمَسْجِدُ | المسجد | Tempat salat adalah masjid';
    placeholder = 'Tempel kalimat rumpang (Soal dengan ___ | Jawaban Benar | Alternatif opsional | Penjelasan opsional):\n' + exampleFormat;
  } else if (templateType === 'guess') {
    exampleFormat = 'جَمَلٌ | حِصَانٌ | فِيلٌ | Hewan gurun berpunuk (Unta)\nمَسْجِدٌ | مَدْرَسَةٌ | بَيْتٌ | Tempat ibadah umat Islam (Masjid)\nكِتَابٌ | قَلَمٌ | مِمْسَحَةٌ | Benda untuk dibaca (Buku)';
    placeholder = 'Tempel tebakan (Jawaban Arab | Pilihan salah 1 | Pilihan salah 2 | Petunjuk opsional):\n' + exampleFormat;
  } else {
    exampleFormat = 'كِتَابٌ | Buku\nقَلَمٌ | Pena\nحَقِيبَةٌ | Tas\nسَيَّارَةٌ | Mobil';
    placeholder = 'Tempel pasangan kata (Kata Arab | Arti):\n' + exampleFormat;
  }

  const handleApply = () => {
    if (parsedItems.length === 0) return;
    onApplyItems(parsedItems, applyMode);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Input Cepat Batch"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-white rounded-[32px] max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border-2 border-stone-100 outline-none"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b-2 border-stone-100 flex items-center justify-between bg-[#FAFCFC]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E6F7F5] text-[#00B4D8] rounded-2xl flex items-center justify-center border border-[#00B4D8]/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-[#0A254D] text-base">Input Cepat (Batch Paste)</h3>
              <p className="text-xs text-stone-500 font-medium">
                Tempel data langsung dari Excel, Word, atau buku teks dengan mudah
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-[#0A254D] hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="p-3.5 bg-[#E6F7F5] border-2 border-[#00B4D8]/20 rounded-2xl text-xs text-[#0A254D] space-y-1">
            <p className="font-black flex items-center gap-1.5 text-[#00B4D8]">
              <FileText className="w-4 h-4" /> Format yang Didukung:
            </p>
            <p className="text-stone-700 leading-relaxed font-medium">
              Satu baris untuk setiap item. Pisahkan antar kolom menggunakan garis tegak ( <code className="bg-white px-1.5 py-0.5 rounded-md border border-[#00B4D8]/30 font-black text-[#00B4D8]">|</code> ), Tab dari Excel, atau titik koma ( <code className="bg-white px-1.5 py-0.5 rounded-md border border-[#00B4D8]/30 font-black text-[#00B4D8]">;</code> ).
            </p>
          </div>

          <div>
            <label className="block text-xs font-black text-[#0A254D] mb-1.5">
              Tempel Teks Mentah:
            </label>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={placeholder}
              rows={8}
              className="w-full p-3.5 text-xs sm:text-sm font-mono border-2 border-stone-200 rounded-2xl focus:outline-[#00B4D8] focus:bg-stone-50/50 resize-y text-[#0A254D]"
            />
          </div>

          {/* Parsed Preview count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#FAFCFC] border-2 border-stone-100 rounded-2xl text-xs">
            <span className="text-stone-600 font-medium">
              Terdeteksi otomatis:{' '}
              <strong className="text-[#00B4D8] font-black text-sm">{parsedItems.length} butir item</strong>
            </span>
            <div className="flex items-center gap-3 font-bold text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer text-[#0A254D]">
                <input
                  type="radio"
                  name="applyMode"
                  value="append"
                  checked={applyMode === 'append'}
                  onChange={() => setApplyMode('append')}
                  className="accent-[#00B4D8]"
                />
                <span>Tambahkan ke daftar</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-[#0A254D]">
                <input
                  type="radio"
                  name="applyMode"
                  value="replace"
                  checked={applyMode === 'replace'}
                  onChange={() => setApplyMode('replace')}
                  className="accent-[#00B4D8]"
                />
                <span>Ganti semua</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t-2 border-stone-100 bg-[#FAFCFC] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 py-2 text-xs font-bold text-stone-600 hover:text-[#0A254D] cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={parsedItems.length === 0}
            className={`min-h-[44px] px-6 py-2.5 rounded-full text-xs font-black flex items-center gap-2 cursor-pointer transition-all ${
              parsedItems.length > 0
                ? 'bg-[#00B4D8] hover:bg-[#0096C7] text-white shadow-[0_3px_0_#0077B6] active:translate-y-0.5'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Masukkan {parsedItems.length} Item</span>
          </button>
        </div>
      </div>
    </div>
  );
}
