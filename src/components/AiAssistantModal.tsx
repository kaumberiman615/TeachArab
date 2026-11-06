import { useState, useEffect } from 'react';
import { TemplateType } from '../types';
import { generateAiContent, fetchAiStatus, AiStatusResponse } from '../services/aiService';
import { sanitizeText } from '../utils/arabic';
import {
  Sparkles,
  X,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Clock,
  ArrowRight,
  BookOpen,
  Check,
  Edit2,
  HelpCircle,
  RotateCcw,
  Plus,
} from 'lucide-react';

interface AiAssistantModalProps {
  isOpen: boolean;
  templateType: TemplateType;
  idToken: string | null;
  onClose: () => void;
  onApplyItems: (items: any[], mode: 'replace' | 'append') => void;
  onRequestLogin: () => void;
}

export interface TaskOption {
  id: string;
  label: string;
  mode: 'topic' | 'text';
  placeholder: string;
  description: string;
}

export function getAvailableTasksForTemplate(templateType: TemplateType): TaskOption[] {
  switch (templateType) {
    case 'kuis':
      return [
        {
          id: 'quiz_text',
          label: 'Soal Pilihan Ganda dari Teks / Materi',
          mode: 'text',
          placeholder: 'Tempel teks bacaan, paragraf, atau materi yang ingin diujikan...',
          description: 'Gemini akan membuat soal pilihan ganda berharakat lengkap, pilihan jawaban, dan penjelasan.',
        },
        {
          id: 'vocab_topic',
          label: 'Kosakata dari Tema (Pilihan Ganda)',
          mode: 'topic',
          placeholder: 'Contoh: Nama-nama Hari & Waktu, Profesi, Ruang Tamu...',
          description: 'Membuat soal kuis kosakata berdasarkan tema tertentu.',
        },
      ];

    case 'true-false':
      return [
        {
          id: 'true_false_text',
          label: 'Pernyataan Benar atau Salah dari Teks/Tema',
          mode: 'text',
          placeholder: 'Tempel materi pelajaran atau ketik tema yang ingin diuji kebenarannya...',
          description: 'Gemini akan membuat pernyataan benar/salah berharakat lengkap dengan penjelasannya.',
        },
      ];

    case 'fill-blank':
      return [
        {
          id: 'fill_blank_text',
          label: 'Soal Isian Kalimat Rumpang dari Teks/Tema',
          mode: 'text',
          placeholder: 'Tempel teks cerita atau ketik topik pelajaran untuk dijadikan kalimat rumpang...',
          description: 'Gemini akan membuat kalimat berharakat dengan tanda ___ dan kunci jawaban yang tepat.',
        },
      ];

    case 'sentence-order':
    case 'reading':
      return [
        {
          id: 'sentence_topic',
          label: 'Kalimat & Terjemah dari Tema',
          mode: 'topic',
          placeholder: 'Contoh: Kegiatan Sehari-hari Siswa, Di Kebun Binatang, Percakapan di Bandara...',
          description: 'Gemini akan membuat kalimat bahasa Arab berharakat terstruktur dan terjemahannya.',
        },
      ];

    case 'letter-order':
      return [
        {
          id: 'letter_order_topic',
          label: 'Kata Bahasa Arab dari Tema',
          mode: 'topic',
          placeholder: 'Contoh: Anggota Tubuh, Buah-buahan, Perlengkapan Sekolah...',
          description: 'Gemini akan memilih kata-kata Arab berharakat dengan panjang 3-6 huruf yang asyik disusun.',
        },
      ];

    case 'flashcard':
    case 'vocab-picture':
    case 'matching':
    case 'mencocokkan':
    case 'memory':
    case 'word-table':
    default:
      return [
        {
          id: 'vocab_topic',
          label: 'Kosakata dari Tema',
          mode: 'topic',
          placeholder: 'Contoh: Warna-warni, Makanan & Minuman, Di Rumah Sakit, Angka 1-20...',
          description: 'Gemini akan membuat daftar mufrodat fusha berharakat lengkap, latin, dan arti.',
        },
      ];
  }
}

export default function AiAssistantModal({
  isOpen,
  templateType,
  idToken,
  onClose,
  onApplyItems,
  onRequestLogin,
}: AiAssistantModalProps) {
  const tasks = getAvailableTasksForTemplate(templateType);
  const [selectedTask, setSelectedTask] = useState<TaskOption>(tasks[0]);
  const [topicOrText, setTopicOrText] = useState('');
  const [count, setCount] = useState<number>(5);
  const [level, setLevel] = useState<'pemula' | 'menengah' | 'lanjut'>('pemula');

  // Loading & Generation state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Preview state
  const [previewItems, setPreviewItems] = useState<any[]>([]);
  const [selectedItemIndices, setSelectedItemIndices] = useState<Set<number>>(new Set());
  const [applyMode, setApplyMode] = useState<'append' | 'replace'>('append');

  // Quota & AI Status
  const [quotaInfo, setQuotaInfo] = useState<{ remainingHourly: number; remainingDaily: number } | null>(null);

  useEffect(() => {
    if (tasks.length > 0) {
      setSelectedTask(tasks[0]);
    }
  }, [templateType]);

  // Fetch status on open
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      if (idToken) {
        fetchAiStatus(idToken).then((res) => {
          if (res.quota) {
            setQuotaInfo(res.quota);
          }
        });
      }
    } else {
      setPreviewItems([]);
      setErrorMessage(null);
    }
  }, [isOpen, idToken]);

  if (!isOpen) return null;

  // Handle generation call
  const handleGenerate = async () => {
    if (!idToken) {
      onRequestLogin();
      return;
    }

    const trimmed = topicOrText.trim();
    if (!trimmed) {
      setErrorMessage(selectedTask.mode === 'topic' ? 'Silakan isi tema pembelajaran.' : 'Silakan tempel teks materi pelajaran.');
      return;
    }

    if (trimmed.length > 3000) {
      setErrorMessage(`Teks terlalu panjang (${trimmed.length} karakter). Maksimal 3000 karakter.`);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await generateAiContent(
        {
          task: selectedTask.id,
          templateType,
          topic: selectedTask.mode === 'topic' ? trimmed : undefined,
          text: selectedTask.mode === 'text' ? trimmed : undefined,
          count,
          level,
        },
        idToken
      );

      if (response.status === 'ai_disabled') {
        setErrorMessage('Layanan AI dinonaktifkan di server (kunci API belum diatur).');
        return;
      }

      const items = response.items || [];
      if (items.length === 0) {
        setErrorMessage('Tidak ada item yang dihasilkan. Coba sesuaikan topik Anda.');
        return;
      }

      setPreviewItems(items);
      // Select all by default
      setSelectedItemIndices(new Set(items.map((_, i) => i)));

      if (response.remainingHourly !== undefined && response.remainingDaily !== undefined) {
        setQuotaInfo({
          remainingHourly: response.remainingHourly,
          remainingDaily: response.remainingDaily,
        });
      }
    } catch (err: any) {
      console.error('Error generating AI:', err);
      setErrorMessage(err.message || 'Terjadi kesalahan saat memanggil Gemini AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSelect = (index: number) => {
    const next = new Set(selectedItemIndices);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setSelectedItemIndices(next);
  };

  const handleToggleSelectAll = () => {
    if (selectedItemIndices.size === previewItems.length) {
      setSelectedItemIndices(new Set());
    } else {
      setSelectedItemIndices(new Set(previewItems.map((_, i) => i)));
    }
  };

  const updatePreviewItem = (index: number, field: string, value: any) => {
    const next = [...previewItems];
    next[index] = { ...next[index], [field]: value };
    setPreviewItems(next);
  };

  const handleApplyToEditor = () => {
    const selected = previewItems.filter((_, i) => selectedItemIndices.has(i));
    if (selected.length === 0) {
      alert('Pilih minimal 1 item untuk dimasukkan ke editor.');
      return;
    }

    // Map AI items to target template structure
    const mapped = selected.map((item) => {
      if (templateType === 'flashcard') {
        return {
          id: 'fc_' + Math.random().toString(36).substring(2, 9),
          arabic: sanitizeText(item.arabic || item.questionArabic || item.statementArabic || ''),
          latin: sanitizeText(item.latin || ''),
          meaning: sanitizeText(item.meaning || item.statementIndo || item.translation || ''),
          notes: item.explanation ? sanitizeText(item.explanation) : undefined,
        };
      }
      if (templateType === 'kuis') {
        return {
          id: 'q_' + Math.random().toString(36).substring(2, 9),
          questionArabic: sanitizeText(item.questionArabic || item.arabic || ''),
          choices: Array.isArray(item.choices)
            ? item.choices.map((c: string) => sanitizeText(c))
            : [item.meaning || 'A', 'B', 'C'],
          correctIndex: typeof item.correctIndex === 'number' ? item.correctIndex : 0,
          explanation: item.explanation ? sanitizeText(item.explanation) : undefined,
        };
      }
      if (templateType === 'true-false') {
        return {
          id: 'tf_' + Math.random().toString(36).substring(2, 9),
          statementArabic: sanitizeText(item.statementArabic || item.arabic || item.questionArabic || ''),
          statementIndo: sanitizeText(item.statementIndo || item.meaning || item.translation || ''),
          isTrue: Boolean(item.isTrue),
          explanation: item.explanation ? sanitizeText(item.explanation) : undefined,
        };
      }
      if (templateType === 'fill-blank') {
        return {
          id: 'fb_' + Math.random().toString(36).substring(2, 9),
          question: sanitizeText(item.question || `${item.statementArabic || item.arabic} ___`),
          answers: Array.isArray(item.answers) && item.answers.length > 0
            ? item.answers.map((a: string) => sanitizeText(a))
            : [sanitizeText(item.arabic || 'الْمَدْرَسَةِ')],
          explanation: item.explanation ? sanitizeText(item.explanation) : undefined,
          strictHarakat: false,
        };
      }
      if (templateType === 'sentence-order') {
        return {
          id: 'so_' + Math.random().toString(36).substring(2, 9),
          sentenceArabic: sanitizeText(item.sentenceArabic || item.statementArabic || item.arabic || ''),
          translation: sanitizeText(item.translation || item.statementIndo || item.meaning || ''),
        };
      }
      if (templateType === 'letter-order') {
        return {
          id: 'lo_' + Math.random().toString(36).substring(2, 9),
          arabic: sanitizeText(item.arabic || ''),
          meaning: sanitizeText(item.meaning || item.translation || ''),
        };
      }
      if (templateType === 'reading') {
        return {
          id: 'rs_' + Math.random().toString(36).substring(2, 9),
          arabic: sanitizeText(item.sentenceArabic || item.arabic || ''),
          translation: sanitizeText(item.translation || item.meaning || ''),
        };
      }
      if (templateType === 'word-table') {
        return {
          id: 'row_' + Math.random().toString(36).substring(2, 9),
          values: {
            col_1: sanitizeText(item.arabic || ''),
            col_2: sanitizeText(item.latin || ''),
            col_3: sanitizeText(item.meaning || item.translation || ''),
          },
        };
      }
      // General vocab / matching / memory / vocab-picture
      return {
        id: 'item_' + Math.random().toString(36).substring(2, 9),
        arabic: sanitizeText(item.arabic || item.questionArabic || item.statementArabic || ''),
        latin: sanitizeText(item.latin || ''),
        meaning: sanitizeText(item.meaning || item.statementIndo || item.translation || ''),
        explanation: item.explanation ? sanitizeText(item.explanation) : undefined,
      };
    });

    onApplyItems(mapped, applyMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 my-auto">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-gradient-to-r from-purple-50 via-indigo-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-2xl flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-stone-900 text-base sm:text-lg">Bantuan AI Guru</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Buat draf materi & game bahasa Arab berharakat fusha lengkap dalam hitungan detik
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Persistent Teacher Warning Banner (Requirement 3) */}
        <div className="px-6 py-2.5 bg-amber-50/80 border-b border-amber-200/80 flex items-center gap-2.5 text-xs text-amber-900 font-medium">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Peringatan Guru:</strong> Hasil AI perlu diperiksa guru, terutama harakat, tata bahasa, dan kebenaran jawaban.
          </span>
          {quotaInfo && (
            <div className="ml-auto flex items-center gap-1.5 shrink-0 text-[11px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md border border-amber-200">
              <Clock className="w-3 h-3" />
              <span>Sisa: {quotaInfo.remainingHourly}/10 jam ini · {quotaInfo.remainingDaily}/30 hari</span>
            </div>
          )}
        </div>

        {/* Body content: Form or Preview */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {previewItems.length === 0 ? (
            /* FORM VIEW */
            <div className="space-y-5">
              {/* Task Selector (if multiple) */}
              {tasks.length > 1 && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Pilih Jenis Bantuan AI:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {tasks.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTask(t)}
                        className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                          selectedTask.id === t.id
                            ? 'bg-indigo-50/70 border-indigo-400 text-indigo-950 ring-2 ring-indigo-200'
                            : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <div className="text-xs font-bold">{t.label}</div>
                        <div className="text-[11px] text-stone-500 mt-0.5">{t.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input: Topic or Text */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-stone-800">
                    {selectedTask.mode === 'topic' ? 'Tema Materi Pembelajaran' : 'Tempel Teks Materi Pelajaran'} <span className="text-rose-500">*</span>
                  </label>
                  {selectedTask.mode === 'text' && (
                    <span className={`text-[10px] font-semibold ${topicOrText.length > 3000 ? 'text-rose-600 font-bold' : 'text-stone-400'}`}>
                      {topicOrText.length} / 3000 karakter
                    </span>
                  )}
                </div>

                {selectedTask.mode === 'topic' ? (
                  <input
                    type="text"
                    value={topicOrText}
                    onChange={(e) => setTopicOrText(e.target.value)}
                    placeholder={selectedTask.placeholder}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                  />
                ) : (
                  <textarea
                    rows={6}
                    value={topicOrText}
                    onChange={(e) => setTopicOrText(e.target.value)}
                    placeholder={selectedTask.placeholder}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-indigo-600 focus:outline-hidden resize-y font-sans leading-relaxed"
                  />
                )}
              </div>

              {/* Settings row: Count & Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Count */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Jumlah Item (1 - 15):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={1}
                      max={15}
                      value={count}
                      onChange={(e) => setCount(parseInt(e.target.value) || 5)}
                      className="w-full accent-indigo-600"
                    />
                    <span className="w-10 text-center font-bold text-sm text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg py-1">
                      {count}
                    </span>
                  </div>
                </div>

                {/* Level */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Tingkat Kemampuan Siswa:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    {(['pemula', 'menengah', 'lanjut'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setLevel(lvl)}
                        className={`py-2 px-2 rounded-xl border font-bold capitalize transition-all cursor-pointer text-center text-xs ${
                          level === lvl
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Error Alert if any */}
              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-semibold flex items-start gap-2 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          ) : (
            /* PREVIEW VIEW (Requirement 2) */
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-stone-50 p-3 rounded-2xl border border-stone-200">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    className="flex items-center gap-1.5 text-xs font-bold text-stone-700 cursor-pointer hover:text-indigo-700"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center ${
                        selectedItemIndices.size === previewItems.length
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-stone-400 bg-white'
                      }`}
                    >
                      {selectedItemIndices.size === previewItems.length && <Check className="w-3 h-3" />}
                    </div>
                    <span>
                      {selectedItemIndices.size === previewItems.length ? 'Batalkan Semua' : 'Pilih Semua'}{' '}
                      ({selectedItemIndices.size}/{previewItems.length} terpilih)
                    </span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewItems([])}
                  className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer font-medium"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Ubah Topik / Buat Ulang</span>
                </button>
              </div>

              {/* Editable items list */}
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {previewItems.map((item, idx) => {
                  const isChecked = selectedItemIndices.has(idx);

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isChecked
                          ? 'bg-white border-indigo-300 shadow-2xs'
                          : 'bg-stone-50/70 border-stone-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(idx)}
                          className="mt-1.5 w-4 h-4 accent-indigo-600 cursor-pointer rounded"
                        />

                        <div className="flex-1 space-y-2">
                          {/* Arabic Text Input */}
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-stone-400 uppercase w-12">Arab:</span>
                            <input
                              type="text"
                              dir="rtl"
                              value={item.arabic || item.questionArabic || item.statementArabic || item.question || item.sentenceArabic || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (item.arabic !== undefined) updatePreviewItem(idx, 'arabic', val);
                                else if (item.questionArabic !== undefined) updatePreviewItem(idx, 'questionArabic', val);
                                else if (item.statementArabic !== undefined) updatePreviewItem(idx, 'statementArabic', val);
                                else if (item.question !== undefined) updatePreviewItem(idx, 'question', val);
                                else if (item.sentenceArabic !== undefined) updatePreviewItem(idx, 'sentenceArabic', val);
                              }}
                              className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-lg font-bold font-amiri text-stone-900 focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                            />
                          </div>

                          {/* Meaning / Translation / Indo Statement */}
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-stone-400 uppercase w-12">Arti:</span>
                            <input
                              type="text"
                              value={item.meaning || item.statementIndo || item.translation || (Array.isArray(item.answers) ? item.answers.join(', ') : '') || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (item.meaning !== undefined) updatePreviewItem(idx, 'meaning', val);
                                else if (item.statementIndo !== undefined) updatePreviewItem(idx, 'statementIndo', val);
                                else if (item.translation !== undefined) updatePreviewItem(idx, 'translation', val);
                                else if (item.answers !== undefined) updatePreviewItem(idx, 'answers', val.split(',').map((s) => s.trim()));
                              }}
                              className="w-full p-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-stone-800 focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                            />
                          </div>

                          {/* Explanation or choices if quiz */}
                          {item.explanation && (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-stone-400 uppercase w-12">Keterangan:</span>
                              <input
                                type="text"
                                value={item.explanation}
                                onChange={(e) => updatePreviewItem(idx, 'explanation', e.target.value)}
                                className="w-full p-1 bg-stone-50 border border-stone-200 rounded-lg text-[11px] text-stone-600 focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mode Insertion Options: Append vs Replace */}
              <div className="pt-2 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-stone-700">Metode Masukkan:</span>
                  <label className="flex items-center gap-1.5 cursor-pointer text-stone-700 font-semibold">
                    <input
                      type="radio"
                      name="applyMode"
                      value="append"
                      checked={applyMode === 'append'}
                      onChange={() => setApplyMode('append')}
                      className="accent-indigo-600"
                    />
                    <span>Tambahkan ke editor (Aman)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-stone-700">
                    <input
                      type="radio"
                      name="applyMode"
                      value="replace"
                      checked={applyMode === 'replace'}
                      onChange={() => setApplyMode('replace')}
                      className="accent-indigo-600"
                    />
                    <span>Gantikan item di editor</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
          >
            Batal
          </button>

          {previewItems.length === 0 ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGenerate}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Gemini Sedang Menyusun Materi...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Buat Draf Materi AI</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleApplyToEditor}
              disabled={selectedItemIndices.size === 0}
              className="min-h-[44px] px-6 py-2.5 bg-[#FF3B8D] hover:bg-[#e02e7b] disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs sm:text-sm rounded-2xl border-2 border-[#0A254D] shadow-[0_3px_0_#0A254D] flex items-center gap-2 cursor-pointer transition-all active:translate-y-0.5 active:shadow-[0_1px_0_#0A254D]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Masukkan {selectedItemIndices.size} Item ke Editor</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
