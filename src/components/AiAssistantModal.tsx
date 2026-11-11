import { useState, useEffect, useRef } from 'react';
import { TemplateType, FlashcardItem, QuizItem, TrueFalseItem, FillBlankItem } from '../types';
import { generateAiContent, fetchAiStatus } from '../services/aiService';
import { sanitizeForFirestore } from '../services/cloudProjects';
import { useModalAccessibility } from '../utils/useModalAccessibility';
import {
  Sparkles,
  X,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Clock,
  Check,
  RotateCcw,
  RefreshCw,
  BookOpen,
} from 'lucide-react';

interface AiAssistantModalProps {
  isOpen: boolean;
  templateType: TemplateType;
  idToken?: string | null;
  onClose: () => void;
  onApplyItems: (items: any[]) => void;
}

export interface TaskOption {
  id: string;
  label: string;
  mode: 'topic' | 'text';
  placeholder: string;
  description: string;
}

/**
 * Daftar tugas AI yang relevan per template
 */
export function getAvailableTasksForTemplate(templateType: TemplateType): TaskOption[] {
  switch (templateType) {
    case 'kuis':
      return [
        {
          id: 'mcq_from_text',
          label: 'Soal Pilihan Ganda dari Teks Rujukan',
          mode: 'text',
          placeholder: 'Tempel paragraf bacaan atau teks materi pelajaran...',
          description: 'Membuat soal pilihan ganda berharakat lengkap dengan 4 opsi dan penjelasan.',
        },
        {
          id: 'vocab_from_topic',
          label: 'Kosakata dari Tema (Soal Arti Kata)',
          mode: 'topic',
          placeholder: 'Contoh: Nama Hari, Profesi, Ruang Tamu, Warna...',
          description: 'Membuat soal kuis pilihan ganda arti kata bahasa Arab berdasarkan tema.',
        },
      ];

    case 'true-false':
      return [
        {
          id: 'truefalse_from_text',
          label: 'Pernyataan Benar atau Salah dari Teks/Tema',
          mode: 'text',
          placeholder: 'Tempel teks bacaan atau ketik topik pelajaran...',
          description: 'Membuat pernyataan benar atau salah berharakat dengan penjelasannya.',
        },
      ];

    case 'fill-blank':
      return [
        {
          id: 'fillblank_from_text',
          label: 'Kalimat Rumpang / Isian Singkat',
          mode: 'text',
          placeholder: 'Tempel teks cerita atau ketik materi pelajaran...',
          description: 'Membuat kalimat berharakat dengan tanda ___ dan kunci kata yang hilang.',
        },
      ];

    case 'sentence-order':
    case 'reading':
      return [
        {
          id: 'sentences_from_topic',
          label: 'Kalimat & Terjemahan dari Tema',
          mode: 'topic',
          placeholder: 'Contoh: Di Perpustakaan Sekolah, Percakapan Sehari-hari...',
          description: 'Membuat kalimat bahasa Arab berharakat fusha beserta terjemahannya.',
        },
      ];

    case 'letter-order':
      return [
        {
          id: 'words_from_topic',
          label: 'Kata Bahasa Arab dari Tema',
          mode: 'topic',
          placeholder: 'Contoh: Buah-buahan, Anggota Tubuh, Ruang Kelas...',
          description: 'Membuat kata-kata bahasa Arab berharakat yang cocok disusun.',
        },
      ];

    case 'flashcard':
    default:
      return [
        {
          id: 'vocab_from_topic',
          label: 'Daftar Kosakata dari Tema (Dianjurkan)',
          mode: 'topic',
          placeholder: 'Contoh: Perlengkapan Sekolah, Makanan & Minuman, Anggota Keluarga, Hewan...',
          description: 'Membuat kartu kosakata berharakat lengkap, transliterasi latin, dan artinya.',
        },
        {
          id: 'words_from_topic',
          label: 'Kata Pilihan Singkat dari Tema',
          mode: 'topic',
          placeholder: 'Contoh: Kata Sifat, Warna, Arah & Tempat, Waktu...',
          description: 'Membuat kosakata ringkas berharakat fusha beserta maknanya.',
        },
        {
          id: 'sentences_from_topic',
          label: 'Kalimat & Contoh Penggunaan dari Tema',
          mode: 'topic',
          placeholder: 'Contoh: Percakapan di Kelas, Salam & Perkenalan...',
          description: 'Membuat contoh kalimat berharakat dan terjemahan bahasa Indonesia.',
        },
        {
          id: 'mcq_from_text',
          label: 'Ekstrak Kosakata & Soal dari Teks Rujukan',
          mode: 'text',
          placeholder: 'Tempel teks bacaan atau kutipan pelajaran bahasa Arab...',
          description: 'Menganalisis teks bacaan dan mengekstrak materi untuk kartu latihan.',
        },
      ];
  }
}

const QUICK_TOPIC_PRESETS = [
  'Perlengkapan Sekolah',
  'Anggota Tubuh',
  'Makanan & Minuman',
  'Keluarga & Rumah',
  'Profesi & Pekerjaan',
  'Warna & Bentuk',
  'Hewan Peliharaan',
];

const FALLBACK_DISTRACTORS = [
  'Buku',
  'Pena',
  'Meja',
  'Pintu',
  'Rumah',
  'Guru',
  'Murid',
  'Sekolah',
  'Mobil',
  'Pasar',
  'Masjid',
  'Kantor',
  'Jendela',
  'Pohon',
  'Air',
  'Makanan',
];

/**
 * Sanitasi string sederhana (hilangkan tag HTML berbahaya)
 */
function sanitizeCleanString(val: any, maxLen = 500): string {
  if (typeof val !== 'string') return '';
  return val
    .replace(/<[^>]*>/g, '') // Buang tag HTML
    .trim()
    .slice(0, maxLen);
}

function getTemplateMeta(templateType: TemplateType): { name: string; itemLabel: string; subtitle: string } {
  switch (templateType) {
    case 'kuis':
      return {
        name: 'Kuis Pilihan Ganda',
        itemLabel: 'Soal',
        subtitle: 'Buat draf pertanyaan kuis 4 opsi berharakat otomatis',
      };
    case 'true-false':
      return {
        name: 'Benar / Salah',
        itemLabel: 'Pernyataan',
        subtitle: 'Buat draf pernyataan benar atau salah berharakat otomatis',
      };
    case 'fill-blank':
      return {
        name: 'Isian Singkat',
        itemLabel: 'Kalimat',
        subtitle: 'Buat draf kalimat rumpang berharakat dan kunci jawaban otomatis',
      };
    case 'flashcard':
    default:
      return {
        name: 'Flashcard',
        itemLabel: 'Kartu',
        subtitle: 'Buat draf materi & kartu kosakata bahasa Arab berharakat otomatis',
      };
  }
}

export default function AiAssistantModal({
  isOpen,
  templateType,
  idToken,
  onClose,
  onApplyItems,
}: AiAssistantModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  useModalAccessibility(isOpen, onClose, modalRef);

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

  // Quota & AI Status
  const [quotaInfo, setQuotaInfo] = useState<{ remainingHourly: number; remainingDaily: number } | null>(null);

  const meta = getTemplateMeta(templateType);

  useEffect(() => {
    if (tasks.length > 0) {
      setSelectedTask(tasks[0]);
    }
  }, [templateType]);

  // Ambil sisa kuota saat modal terbuka
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      fetchAiStatus(idToken).then((res) => {
        if (res.quota) {
          setQuotaInfo(res.quota);
        }
      });
    } else {
      setPreviewItems([]);
      setErrorMessage(null);
    }
  }, [isOpen, idToken]);

  if (!isOpen) return null;

  // Jalankan generate AI
  const handleGenerate = async () => {
    const trimmed = topicOrText.trim();
    if (!trimmed) {
      setErrorMessage(
        selectedTask.mode === 'topic'
          ? 'Silakan isi tema materi pembelajaran terlebih dahulu.'
          : 'Silakan tempel teks materi pelajaran terlebih dahulu.'
      );
      return;
    }

    if (trimmed.length > 3000) {
      setErrorMessage(`Teks terlalu panjang (${trimmed.length} karakter). Batas maksimal 3.000 karakter.`);
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

      const items = response.items || [];
      if (items.length === 0) {
        setErrorMessage('AI tidak menghasilkan materi yang sesuai. Silakan coba sesuaikan tema atau teks materi Anda.');
        return;
      }

      // Normalisasi item pratinjau sesuai template dan task
      let normalizedPreview: any[] = [];

      if (templateType === 'kuis') {
        if (selectedTask.id === 'vocab_from_topic') {
          // Petakan kosakata ke soal arti kata 4 pilihan
          const allMeanings = items.map((it) => sanitizeCleanString(it.meaning)).filter(Boolean);

          normalizedPreview = items.map((item, idx) => {
            const arabic = sanitizeCleanString(item.arabic || '');
            const latin = sanitizeCleanString(item.latin || '');
            const correctMeaning = sanitizeCleanString(item.meaning || '');

            // Kumpulkan 3 pengecoh dari arti kata lain dalam batch atau fallback
            const otherMeanings = allMeanings.filter((m) => m !== correctMeaning);
            const distractorPool = [...otherMeanings, ...FALLBACK_DISTRACTORS.filter((f) => f !== correctMeaning)];
            const chosenDistractors: string[] = [];
            for (const d of distractorPool) {
              if (chosenDistractors.length >= 3) break;
              if (!chosenDistractors.includes(d) && d !== correctMeaning) {
                chosenDistractors.push(d);
              }
            }

            // Tentukan posisi acak jawaban benar (0..3)
            const correctIndex = Math.floor(Math.random() * 4);
            const choices: string[] = [];
            let distractorIdx = 0;
            for (let c = 0; c < 4; c++) {
              if (c === correctIndex) {
                choices.push(correctMeaning);
              } else {
                choices.push(chosenDistractors[distractorIdx] || `Pilihan ${c + 1}`);
                distractorIdx++;
              }
            }

            return {
              type: 'kuis',
              questionArabic: `مَا مَعْنَى كَلِمَةِ «${arabic}»؟`,
              questionIndo: `Apa arti kata «${arabic}»?`,
              choices,
              correctIndex,
              explanation: `كَلِمَةُ «${arabic}» تَعْنِي «${correctMeaning}».${latin ? ` (${latin})` : ''}`,
            };
          });
        } else {
          // mcq_from_text
          normalizedPreview = items.map((item) => {
            const rawChoices = Array.isArray(item.options)
              ? item.options
              : Array.isArray(item.choices)
              ? item.choices
              : [];
            const choices = rawChoices
              .map((c: any) => sanitizeCleanString(typeof c === 'string' ? c : c?.text || ''))
              .filter(Boolean)
              .slice(0, 4);

            while (choices.length < 4) {
              choices.push(`Pilihan ${choices.length + 1}`);
            }

            let correctIndex = typeof item.correctIndex === 'number' ? item.correctIndex : 0;
            if (correctIndex < 0 || correctIndex >= choices.length) correctIndex = 0;

            return {
              type: 'kuis',
              questionArabic: sanitizeCleanString(item.question || item.questionArabic || ''),
              questionIndo: sanitizeCleanString(item.questionIndo || ''),
              choices,
              correctIndex,
              explanation: sanitizeCleanString(item.explanation || ''),
            };
          });
        }
      } else if (templateType === 'true-false') {
        normalizedPreview = items.map((item) => ({
          type: 'true-false',
          statementArabic: sanitizeCleanString(item.statement || item.statementArabic || ''),
          statementIndo: sanitizeCleanString(item.statementIndo || ''),
          isTrue: typeof item.answer === 'boolean' ? item.answer : typeof item.isTrue === 'boolean' ? item.isTrue : true,
          explanation: sanitizeCleanString(item.explanation || ''),
        }));
      } else if (templateType === 'fill-blank') {
        normalizedPreview = items.map((item) => {
          let question = sanitizeCleanString(item.question || '');
          if (question && !question.includes('___')) {
            question = question.trim() + ' ___';
          }
          const primaryAns = sanitizeCleanString(
            item.answer || (Array.isArray(item.answers) ? item.answers[0] : '')
          );
          const rawAlts = Array.isArray(item.alternatives)
            ? item.alternatives
            : Array.isArray(item.answers)
            ? item.answers.slice(1)
            : [];
          const alternatives = rawAlts.map((a: any) => sanitizeCleanString(a)).filter(Boolean);

          return {
            type: 'fill-blank',
            question,
            answer: primaryAns,
            alternatives,
            explanation: sanitizeCleanString(item.explanation || ''),
          };
        });
      } else {
        // flashcard
        normalizedPreview = items.map((item) => ({
          type: 'flashcard',
          arabic: sanitizeCleanString(item.arabic || item.question || item.statement || ''),
          latin: sanitizeCleanString(item.latin || ''),
          meaning: sanitizeCleanString(item.meaning || item.translation || item.answer || ''),
          notes: item.notes || item.explanation ? sanitizeCleanString(item.notes || item.explanation) : undefined,
        }));
      }

      setPreviewItems(normalizedPreview);
      // Centang semua item secara default
      setSelectedItemIndices(new Set(normalizedPreview.map((_, i) => i)));

      if (response.remainingHourly !== undefined && response.remainingDaily !== undefined) {
        setQuotaInfo({
          remainingHourly: response.remainingHourly,
          remainingDaily: response.remainingDaily,
        });
      }
    } catch (err: any) {
      console.error('[AiAssistantModal] Error generation:', err);
      const msg = err?.message || 'Terjadi kendala saat menghubungi AI. Silakan coba lagi.';
      setErrorMessage(msg);
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

  const updatePreviewField = (index: number, field: string, value: any) => {
    const next = [...previewItems];
    next[index] = { ...next[index], [field]: value };
    setPreviewItems(next);
  };

  const updateChoice = (itemIndex: number, choiceIndex: number, text: string) => {
    const next = [...previewItems];
    const choices = [...(next[itemIndex].choices || [])];
    choices[choiceIndex] = sanitizeCleanString(text);
    next[itemIndex] = { ...next[itemIndex], choices };
    setPreviewItems(next);
  };

  /**
   * Masukkan item terpilih ke editor
   * Ketentuan: Selalu menambahkan ke akhir daftar, tidak boleh menimpa isi yang ada.
   * Ketentuan: Sanitasi sebelum disimpan dan lolos sanitizeForFirestore.
   */
  const handleApplyToEditor = () => {
    const selected = previewItems.filter((_, i) => selectedItemIndices.has(i));
    if (selected.length === 0) {
      alert(`Pilih minimal 1 ${meta.itemLabel.toLowerCase()} untuk dimasukkan ke editor.`);
      return;
    }

    const now = Date.now();

    if (templateType === 'kuis') {
      const quizItemsToInsert: QuizItem[] = selected.map((item, idx) => {
        const itemChoices = Array.isArray(item.choices) ? item.choices : [];
        const quiz: QuizItem = {
          id: `quiz_${now}_${idx}_${Math.random().toString(36).substring(2, 9)}`,
          questionArabic: sanitizeCleanString(item.questionArabic || ''),
          questionIndo: sanitizeCleanString(item.questionIndo || ''),
          choices: itemChoices.map((c: any) => ({
            text: sanitizeCleanString(typeof c === 'string' ? c : c?.text || ''),
          })),
          correctIndex: typeof item.correctIndex === 'number' ? item.correctIndex : 0,
          explanation: item.explanation ? sanitizeCleanString(item.explanation) : '',
        };
        return sanitizeForFirestore(quiz);
      });
      onApplyItems(quizItemsToInsert);
    } else if (templateType === 'true-false') {
      const tfItemsToInsert: TrueFalseItem[] = selected.map((item, idx) => {
        const tf: TrueFalseItem = {
          id: `tf_${now}_${idx}_${Math.random().toString(36).substring(2, 9)}`,
          statementArabic: sanitizeCleanString(item.statementArabic || ''),
          statementIndo: sanitizeCleanString(item.statementIndo || ''),
          isTrue: Boolean(item.isTrue),
          explanation: item.explanation ? sanitizeCleanString(item.explanation) : '',
        };
        return sanitizeForFirestore(tf);
      });
      onApplyItems(tfItemsToInsert);
    } else if (templateType === 'fill-blank') {
      const fbItemsToInsert: FillBlankItem[] = selected.map((item, idx) => {
        const alts = Array.isArray(item.alternatives) ? item.alternatives : [];
        const allAnswers = [item.answer, ...alts]
          .map((a: string) => sanitizeCleanString(a))
          .filter(Boolean);

        const fb: FillBlankItem = {
          id: `fb_${now}_${idx}_${Math.random().toString(36).substring(2, 9)}`,
          question: sanitizeCleanString(item.question || ''),
          answers: allAnswers.length > 0 ? allAnswers : [''],
          explanation: item.explanation ? sanitizeCleanString(item.explanation) : '',
          strictHarakat: false,
        };
        return sanitizeForFirestore(fb);
      });
      onApplyItems(fbItemsToInsert);
    } else {
      // flashcard
      const flashcardsToInsert: FlashcardItem[] = selected.map((item, idx) => {
        const card: FlashcardItem = {
          id: `fc_${now}_${idx}_${Math.random().toString(36).substring(2, 9)}`,
          arabic: sanitizeCleanString(item.arabic || ''),
          latin: sanitizeCleanString(item.latin || ''),
          meaning: sanitizeCleanString(item.meaning || ''),
          notes: item.notes && item.notes.trim() ? sanitizeCleanString(item.notes.trim()) : '',
        };
        return sanitizeForFirestore(card);
      });
      onApplyItems(flashcardsToInsert);
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0A254D]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`Bantuan AI ${meta.name}`}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border-2 border-[#0A254D] my-auto animate-in fade-in zoom-in-95 outline-none"
      >
        {/* Header Bar */}
        <div className="px-5 sm:px-6 py-4 border-b-2 border-stone-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF3B8D] text-white rounded-2xl border-2 border-[#0A254D] shadow-[0_2px_0_#0A254D] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-[#FED034]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-[#0A254D] text-base sm:text-lg">Bantuan AI Guru</h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#FED034]/30 text-[#0A254D] border border-[#FED034]">
                  {meta.name}
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium">{meta.subtitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center text-stone-500 hover:text-[#0A254D] hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Peringatan Tetap Guru */}
        <div className="px-5 sm:px-6 py-2.5 bg-[#FFF8DC] border-b-2 border-[#FED034]/60 flex items-center gap-2.5 text-xs text-[#0A254D]">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="leading-snug">
            <strong>Peringatan Guru:</strong> Hasil AI perlu diperiksa guru, terutama harakat, tata bahasa, dan kebenaran jawaban.
          </span>
          {quotaInfo && (
            <div className="hidden sm:flex ml-auto items-center gap-1.5 shrink-0 text-[11px] font-black text-[#0A254D] bg-white px-2.5 py-1 rounded-full border border-stone-200 shadow-2xs">
              <Clock className="w-3 h-3 text-[#00B4D8]" />
              <span>Sisa Kuota: {quotaInfo.remainingHourly}/10 jam ini</span>
            </div>
          )}
        </div>

        {/* Konten Utama: Form atau Pratinjau */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {previewItems.length === 0 ? (
            /* FORM VIEW */
            <div className="space-y-5">
              {/* Pilihan Tugas AI */}
              {tasks.length > 1 && (
                <div>
                  <label className="block text-xs font-black text-[#0A254D] mb-1.5">
                    Pilih Jenis Bantuan AI:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {tasks.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTask(t)}
                        className={`min-h-[44px] p-3 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                          selectedTask.id === t.id
                            ? 'bg-[#E6F7F5] border-[#00B4D8] text-[#0A254D] shadow-[0_2px_0_#00B4D8]'
                            : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400'
                        }`}
                      >
                        <div className="text-xs font-black">{t.label}</div>
                        <div className="text-[11px] text-stone-500 mt-0.5">{t.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Tema atau Teks */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black text-[#0A254D]">
                    {selectedTask.mode === 'topic' ? 'Tema Materi Pembelajaran' : 'Tempel Teks Materi Rujukan'}{' '}
                    <span className="text-[#FF3B8D]">*</span>
                  </label>
                  {selectedTask.mode === 'text' && (
                    <span
                      className={`text-[10px] font-bold ${
                        topicOrText.length > 3000 ? 'text-rose-600' : 'text-stone-400'
                      }`}
                    >
                      {topicOrText.length} / 3.000 karakter
                    </span>
                  )}
                </div>

                {selectedTask.mode === 'topic' ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={topicOrText}
                      onChange={(e) => setTopicOrText(e.target.value)}
                      placeholder={selectedTask.placeholder}
                      className="w-full px-4 py-3 bg-stone-50 border-2 border-stone-200 rounded-2xl text-sm font-medium text-[#0A254D] focus:bg-white focus:border-[#0A254D] focus:outline-hidden transition-all shadow-2xs"
                    />

                    {/* Quick Preset Topic Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-bold text-stone-400">Contoh Topik:</span>
                      {QUICK_TOPIC_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setTopicOrText(preset)}
                          className="px-2.5 py-1 text-[11px] font-bold bg-stone-100 hover:bg-[#FED034]/40 text-[#0A254D] rounded-full border border-stone-200 transition-colors cursor-pointer"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <textarea
                    rows={5}
                    value={topicOrText}
                    onChange={(e) => setTopicOrText(e.target.value)}
                    placeholder={selectedTask.placeholder}
                    className="w-full p-3.5 bg-stone-50 border-2 border-stone-200 rounded-2xl text-sm font-medium text-[#0A254D] focus:bg-white focus:border-[#0A254D] focus:outline-hidden resize-y transition-all shadow-2xs leading-relaxed"
                  />
                )}
              </div>

              {/* Pengaturan: Jumlah Item & Tingkat Kemampuan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Jumlah Item */}
                <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-black text-[#0A254D]">
                      Jumlah {meta.itemLabel} (1 - 15):
                    </label>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FED034] text-[#0A254D] font-black text-xs border border-[#0A254D]">
                      {count} {meta.itemLabel}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={15}
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value) || 5)}
                    className="w-full accent-[#FF3B8D] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 font-bold mt-1 px-0.5">
                    <span>1</span>
                    <span>5</span>
                    <span>10</span>
                    <span>15</span>
                  </div>
                </div>

                {/* Tingkat Kemampuan */}
                <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                  <label className="block text-xs font-black text-[#0A254D] mb-2">
                    Tingkat Kemampuan Siswa:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    {(['pemula', 'menengah', 'lanjut'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setLevel(lvl)}
                        className={`min-h-[44px] px-2 rounded-xl border-2 font-black capitalize transition-all cursor-pointer text-center text-xs ${
                          level === lvl
                            ? 'bg-[#0A254D] text-white border-[#0A254D] shadow-[0_2px_0_#000]'
                            : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pesan Error & Tombol Coba Lagi */}
              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border-2 border-rose-300 rounded-2xl text-xs text-rose-900 font-medium flex items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="min-h-[44px] px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center gap-1.5 text-xs cursor-pointer shrink-0 shadow-2xs active:scale-95 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Coba Lagi</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* PREVIEW VIEW */
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-stone-50 p-3 rounded-2xl border border-stone-200">
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="min-h-[44px] flex items-center gap-2 text-xs font-black text-[#0A254D] cursor-pointer hover:text-[#00B4D8]"
                >
                  <div
                    className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                      selectedItemIndices.size === previewItems.length
                        ? 'bg-[#0A254D] border-[#0A254D] text-white'
                        : 'border-stone-400 bg-white'
                    }`}
                  >
                    {selectedItemIndices.size === previewItems.length && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <span>
                    {selectedItemIndices.size === previewItems.length ? 'Batalkan Semua' : 'Pilih Semua'}{' '}
                    ({selectedItemIndices.size} dari {previewItems.length} {meta.itemLabel.toLowerCase()} terpilih)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewItems([])}
                  className="min-h-[44px] px-3 py-1.5 text-xs text-stone-600 hover:text-[#0A254D] flex items-center gap-1.5 cursor-pointer font-bold bg-white border border-stone-200 rounded-xl"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Ubah Topik / Buat Ulang</span>
                </button>
              </div>

              {/* Daftar Item yang Bisa Diedit Langsung */}
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {previewItems.map((item, idx) => {
                  const isChecked = selectedItemIndices.has(idx);

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        isChecked
                          ? 'bg-white border-[#0A254D] shadow-[0_2px_0_#0A254D]'
                          : 'bg-stone-50 border-stone-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(idx)}
                          className="mt-2 w-5 h-5 accent-[#0A254D] cursor-pointer rounded-lg"
                        />

                        <div className="flex-1 space-y-3">
                          {/* 1. KUIS PREVIEW */}
                          {templateType === 'kuis' && (
                            <div className="space-y-3">
                              {/* Pertanyaan Arab */}
                              <div>
                                <label className="block text-[11px] font-black text-stone-500 uppercase mb-1">
                                  Pertanyaan Bahasa Arab (RTL):
                                </label>
                                <input
                                  type="text"
                                  dir="rtl"
                                  value={item.questionArabic}
                                  onChange={(e) => updatePreviewField(idx, 'questionArabic', e.target.value)}
                                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-lg font-bold font-amiri text-[#0A254D] text-right focus:bg-white focus:border-[#0A254D] focus:outline-hidden"
                                />
                              </div>

                              {/* Pertanyaan Indonesia */}
                              <div>
                                <label className="block text-[11px] font-black text-stone-500 uppercase mb-1">
                                  Terjemahan / Petunjuk Pertanyaan (Indonesia):
                                </label>
                                <input
                                  type="text"
                                  value={item.questionIndo || ''}
                                  onChange={(e) => updatePreviewField(idx, 'questionIndo', e.target.value)}
                                  placeholder="Contoh: Apa arti kata tersebut?"
                                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-[#0A254D] focus:bg-white focus:border-[#0A254D] focus:outline-hidden"
                                />
                              </div>

                              {/* Pilihan Jawaban 4 Opsi */}
                              <div>
                                <label className="block text-[11px] font-black text-stone-500 uppercase mb-1.5">
                                  Pilihan Jawaban (Klik bulatan untuk kunci yang benar):
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {(item.choices || []).map((choiceText: string, cIdx: number) => {
                                    const isCorrect = item.correctIndex === cIdx;
                                    return (
                                      <div
                                        key={cIdx}
                                        className={`flex items-center gap-2 p-2 rounded-xl border-2 transition-all ${
                                          isCorrect
                                            ? 'bg-emerald-50 border-emerald-500'
                                            : 'bg-stone-50 border-stone-200'
                                        }`}
                                      >
                                        <button
                                          type="button"
                                          onClick={() => updatePreviewField(idx, 'correctIndex', cIdx)}
                                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer font-black text-xs transition-all ${
                                            isCorrect
                                              ? 'bg-emerald-500 border-emerald-600 text-white'
                                              : 'bg-white border-stone-400 text-stone-600 hover:border-emerald-400'
                                          }`}
                                          title="Tandai sebagai kunci jawaban"
                                        >
                                          {String.fromCharCode(65 + cIdx)}
                                        </button>
                                        <input
                                          type="text"
                                          value={choiceText}
                                          onChange={(e) => updateChoice(idx, cIdx, e.target.value)}
                                          className="w-full bg-transparent border-0 text-xs font-bold text-[#0A254D] focus:outline-hidden"
                                        />
                                        {isCorrect && (
                                          <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-sm shrink-0">
                                            Kunci
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Penjelasan */}
                              <div>
                                <label className="block text-[11px] font-black text-stone-500 uppercase mb-1">
                                  Penjelasan Jawaban:
                                </label>
                                <input
                                  type="text"
                                  value={item.explanation || ''}
                                  onChange={(e) => updatePreviewField(idx, 'explanation', e.target.value)}
                                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 focus:bg-white focus:border-[#0A254D] focus:outline-hidden"
                                />
                              </div>
                            </div>
                          )}

                          {/* 2. BENAR / SALAH PREVIEW */}
                          {templateType === 'true-false' && (
                            <div className="space-y-3">
                              {/* Pernyataan Arab */}
                              <div>
                                <label className="block text-[11px] font-black text-stone-500 uppercase mb-1">
                                  Pernyataan Bahasa Arab (RTL):
                                </label>
                                <input
                                  type="text"
                                  dir="rtl"
                                  value={item.statementArabic}
                                  onChange={(e) => updatePreviewField(idx, 'statementArabic', e.target.value)}
                                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-lg font-bold font-amiri text-[#0A254D] text-right focus:bg-white focus:border-[#0A254D] focus:outline-hidden"
                                />
                              </div>

                              {/* Pernyataan Indonesia */}
                              <div>
                                <label className="block text-[11px] font-black text-stone-500 uppercase mb-1">
                                  Arti Pernyataan (Indonesia):
                                </label>
                                <input
                                  type="text"
                                  value={item.statementIndo || ''}
                                  onChange={(e) => updatePreviewField(idx, 'statementIndo', e.target.value)}
                                  placeholder="Contoh: Matahari terbit dari arah timur."
                                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-[#0A254D] focus:bg-white focus:border-[#0A254D] focus:outline-hidden"
                                />
                              </div>

                              {/* Kunci Jawaban Benar / Salah */}
                              <div>
                                <label className="block text-[11px] font-black text-stone-500 uppercase mb-1.5">
                                  Kunci Jawaban:
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    type="button"
                                    onClick={() => updatePreviewField(idx, 'isTrue', true)}
                                    className={`min-h-[44px] py-2 px-3 rounded-xl border-2 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                                      item.isTrue
                                        ? 'bg-emerald-500 border-emerald-600 text-white shadow-[0_2px_0_#065f46]'
                                        : 'bg-white border-stone-200 text-stone-600 hover:border-emerald-300'
                                    }`}
                                  >
                                    <Check className="w-4 h-4" />
                                    <span>BENAR (صَحِيح)</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => updatePreviewField(idx, 'isTrue', false)}
                                    className={`min-h-[44px] py-2 px-3 rounded-xl border-2 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                                      !item.isTrue
                                        ? 'bg-rose-500 border-rose-600 text-white shadow-[0_2px_0_#9f1239]'
                                        : 'bg-white border-stone-200 text-stone-600 hover:border-rose-300'
                                    }`}
                                  >
                                    <X className="w-4 h-4" />
                                    <span>SALAH (خَطَأ)</span>
                                  </button>
                                </div>
                              </div>

                              {/* Penjelasan */}
                              <div>
                                <label className="block text-[11px] font-black text-stone-500 uppercase mb-1">
                                  Penjelasan Jawaban:
                                </label>
                                <input
                                  type="text"
                                  value={item.explanation || ''}
                                  onChange={(e) => updatePreviewField(idx, 'explanation', e.target.value)}
                                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 focus:bg-white focus:border-[#0A254D] focus:outline-hidden"
                                />
                              </div>
                            </div>
                          )}

                          {/* 3. ISIAN SINGKAT / KALIMAT RUMPANG PREVIEW */}
                          {templateType === 'fill-blank' && (
                            <div className="space-y-3">
                              {/* Kalimat Rumpang */}
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="text-[11px] font-black text-stone-500 uppercase">
                                    Kalimat Rumpang Bahasa Arab (Gunakan ___):
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const current = item.question || '';
                                      updatePreviewField(
                                        idx,
                                        'question',
                                        current ? current + ' ___ ' : '___ '
                                      );
                                    }}
                                    className="text-[10px] font-black text-[#00B4D8] hover:underline cursor-pointer"
                                  >
                                    + Sisipkan ___
                                  </button>
                                </div>
                                <input
                                  type="text"
                                  dir="rtl"
                                  value={item.question}
                                  onChange={(e) => updatePreviewField(idx, 'question', e.target.value)}
                                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-lg font-bold font-amiri text-[#0A254D] text-right focus:bg-white focus:border-[#0A254D] focus:outline-hidden"
                                />
                              </div>

                              {/* Kunci Jawaban Utama */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[11px] font-black text-stone-500 uppercase mb-1">
                                    Kunci Jawaban Utama:
                                  </label>
                                  <input
                                    type="text"
                                    dir="rtl"
                                    value={item.answer}
                                    onChange={(e) => updatePreviewField(idx, 'answer', e.target.value)}
                                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold font-amiri text-[#0A254D] text-right focus:bg-white focus:border-[#0A254D] focus:outline-hidden"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[11px] font-black text-stone-500 uppercase mb-1">
                                    Jawaban Alternatif (Pisahkan koma):
                                  </label>
                                  <input
                                    type="text"
                                    value={(item.alternatives || []).join(', ')}
                                    onChange={(e) => {
                                      const parts = e.target.value
                                        .split(',')
                                        .map((p) => p.trim())
                                        .filter(Boolean);
                                      updatePreviewField(idx, 'alternatives', parts);
                                    }}
                                    placeholder="Contoh: المدرسة, مدرسة"
                                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:bg-white focus:border-[#0A254D] focus:outline-hidden"
                                  />
                                </div>
                              </div>

                              {/* Penjelasan */}
                              <div>
                                <label className="block text-[11px] font-black text-stone-500 uppercase mb-1">
                                  Arti Kalimat / Penjelasan:
                                </label>
                                <input
                                  type="text"
                                  value={item.explanation || ''}
                                  onChange={(e) => updatePreviewField(idx, 'explanation', e.target.value)}
                                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 focus:bg-white focus:border-[#0A254D] focus:outline-hidden"
                                />
                              </div>
                            </div>
                          )}

                          {/* 4. FLASHCARD PREVIEW */}
                          {templateType === 'flashcard' && (
                            <div className="space-y-2.5">
                              {/* Teks Arab (RTL) */}
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-black text-stone-500 uppercase w-14 shrink-0">
                                  Arab:
                                </span>
                                <input
                                  type="text"
                                  dir="rtl"
                                  value={item.arabic}
                                  onChange={(e) => updatePreviewField(idx, 'arabic', e.target.value)}
                                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xl font-bold font-amiri text-[#0A254D] text-right focus:bg-white focus:border-[#0A254D] focus:outline-hidden"
                                />
                              </div>

                              {/* Transliterasi Latin */}
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-black text-stone-500 uppercase w-14 shrink-0">
                                  Latin:
                                </span>
                                <input
                                  type="text"
                                  value={item.latin}
                                  onChange={(e) => updatePreviewField(idx, 'latin', e.target.value)}
                                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-[#0A254D] focus:bg-white focus:border-[#0A254D] focus:outline-hidden"
                                />
                              </div>

                              {/* Arti Bahasa Indonesia */}
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-black text-stone-500 uppercase w-14 shrink-0">
                                  Arti:
                                </span>
                                <input
                                  type="text"
                                  value={item.meaning}
                                  onChange={(e) => updatePreviewField(idx, 'meaning', e.target.value)}
                                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:bg-white focus:border-[#0A254D] focus:outline-hidden"
                                />
                              </div>

                              {/* Catatan Tambahan (opsional) */}
                              {item.notes !== undefined && (
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-black text-stone-500 uppercase w-14 shrink-0">
                                    Catatan:
                                  </span>
                                  <input
                                    type="text"
                                    value={item.notes || ''}
                                    onChange={(e) => updatePreviewField(idx, 'notes', e.target.value)}
                                    placeholder="Contoh: Jamak dari..."
                                    className="w-full px-3 py-1 bg-stone-50 border border-stone-200 rounded-xl text-[11px] text-stone-600 focus:bg-white focus:border-[#0A254D] focus:outline-hidden"
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Penjelasan bahwa item akan ditambahkan ke akhir daftar */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex items-center gap-2 text-xs text-indigo-950 font-medium">
                <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  Item yang dipilih akan <strong>ditambahkan ke akhir daftar {meta.itemLabel.toLowerCase()}</strong> tanpa menimpa data yang sudah ada di editor.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 sm:px-6 py-4 bg-stone-50 border-t-2 border-stone-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 text-xs font-black text-stone-600 hover:text-[#0A254D] cursor-pointer rounded-xl transition-colors"
          >
            Batal
          </button>

          {previewItems.length === 0 ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGenerate}
              className="min-h-[44px] px-6 py-2.5 bg-[#FF3B8D] hover:bg-[#E62879] disabled:opacity-50 text-white font-black text-xs sm:text-sm rounded-full border-2 border-[#0A254D] shadow-[0_3px_0_#0A254D] flex items-center gap-2 cursor-pointer transition-all active:translate-y-0.5 active:shadow-[0_1px_0_#0A254D]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#FED034]" />
                  <span>Gemini Sedang Menyusun Materi...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#FED034]" />
                  <span>Buat Draf Materi AI</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleApplyToEditor}
              disabled={selectedItemIndices.size === 0}
              className="min-h-[44px] px-6 py-2.5 bg-[#FF3B8D] hover:bg-[#E62879] disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs sm:text-sm rounded-full border-2 border-[#0A254D] shadow-[0_3px_0_#0A254D] flex items-center gap-2 cursor-pointer transition-all active:translate-y-0.5 active:shadow-[0_1px_0_#0A254D]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                Masukkan {selectedItemIndices.size} {meta.itemLabel} ke Editor
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
