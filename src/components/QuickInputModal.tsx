import { useState } from 'react';
import { TemplateType } from '../types';
import { parseQuickInput } from '../utils/quickInput';
import { X, Sparkles, Check, FileText } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900">Input Cepat (Batch Paste)</h3>
              <p className="text-xs text-stone-500">
                Tempel data langsung dari Excel, Word, atau WhatsApp dengan cepat
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs text-emerald-900 space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-700" /> Format yang Didukung:
            </p>
            <p className="text-emerald-800">
              Satu baris untuk setiap item. Pisahkan antar kolom menggunakan garis tegak ( <code className="bg-white px-1 py-0.5 rounded border border-emerald-300 font-bold">|</code> ), Tab dari Excel, atau titik koma ( <code className="bg-white px-1 py-0.5 rounded border border-emerald-300 font-bold">;</code> ).
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Tempel Teks Mentah:
            </label>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={placeholder}
              rows={8}
              className="w-full p-3 text-sm font-mono border border-stone-300 rounded-xl focus:outline-emerald-600 focus:bg-stone-50/50 resize-y"
            />
          </div>

          {/* Parsed Preview count */}
          <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs">
            <span className="text-stone-600">
              Terdeteksi otomatis:{' '}
              <strong className="text-emerald-700 font-bold text-sm">{parsedItems.length} item</strong>
            </span>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer text-stone-700">
                <input
                  type="radio"
                  name="applyMode"
                  value="append"
                  checked={applyMode === 'append'}
                  onChange={() => setApplyMode('append')}
                  className="accent-emerald-600"
                />
                <span>Tambahkan ke daftar</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-stone-700 ml-2">
                <input
                  type="radio"
                  name="applyMode"
                  value="replace"
                  checked={applyMode === 'replace'}
                  onChange={() => setApplyMode('replace')}
                  className="accent-emerald-600"
                />
                <span>Ganti semua</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={parsedItems.length === 0}
            className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
              parsedItems.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Masukkan {parsedItems.length} Item</span>
          </button>
        </div>
      </div>
    </div>
  );
}
