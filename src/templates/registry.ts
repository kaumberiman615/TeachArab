import React from 'react';
import { Draft, TemplateType, TemplateCategory } from '../types';
import {
  BookOpen,
  HelpCircle,
  GitFork,
  Presentation,
  Images,
  Scroll,
  Table,
  CheckSquare,
  Brain,
  Compass,
} from 'lucide-react';

import { DEFAULT_FLASHCARDS } from './flashcard/schema';
import { DEFAULT_QUIZ } from './kuis/schema';
import { DEFAULT_MATCHING } from './matching/schema';
import { DEFAULT_SLIDES } from './slide/schema';
import { DEFAULT_VOCAB_PICTURES } from './vocab-picture/schema';
import { DEFAULT_READING_SENTENCES } from './reading/schema';
import { DEFAULT_WORD_TABLE_ROWS, PRESET_TASHRIF_COLUMNS } from './word-table/schema';
import { DEFAULT_TRUE_FALSE } from './true-false/schema';
import { DEFAULT_MEMORY_PAIRS } from './memory/schema';
import { DEFAULT_WHEEL_ENTRIES } from './wheel/schema';
import { DEFAULT_LETTER_ORDER_ITEMS } from './letter-order/schema';
import { DEFAULT_SENTENCE_ORDER_ITEMS } from './sentence-order/schema';
import { DEFAULT_FILL_BLANK_ITEMS } from './fill-blank/schema';
import { DEFAULT_GUESS_ITEMS } from './guess/schema';
import { SpellCheck, ListOrdered, PenLine, Eye } from 'lucide-react';

// Lazy-loaded Editors and Players for fast initial page load (Code Splitting)
const FlashcardEditor = React.lazy(() => import('./flashcard/Editor'));
const FlashcardPlayer = React.lazy(() => import('./flashcard/Player'));

const QuizEditor = React.lazy(() => import('./kuis/Editor'));
const QuizPlayer = React.lazy(() => import('./kuis/Player'));

const MatchingEditor = React.lazy(() => import('./matching/Editor'));
const MatchingPlayer = React.lazy(() => import('./matching/Player'));

const SlideEditor = React.lazy(() => import('./slide/Editor'));
const SlidePlayer = React.lazy(() => import('./slide/Player'));

const VocabPictureEditor = React.lazy(() => import('./vocab-picture/Editor'));
const VocabPicturePlayer = React.lazy(() => import('./vocab-picture/Player'));

const ReadingEditor = React.lazy(() => import('./reading/Editor'));
const ReadingPlayer = React.lazy(() => import('./reading/Player'));

const WordTableEditor = React.lazy(() => import('./word-table/Editor'));
const WordTablePlayer = React.lazy(() => import('./word-table/Player'));

const TrueFalseEditor = React.lazy(() => import('./true-false/Editor'));
const TrueFalsePlayer = React.lazy(() => import('./true-false/Player'));

const MemoryEditor = React.lazy(() => import('./memory/Editor'));
const MemoryPlayer = React.lazy(() => import('./memory/Player'));

const WheelEditor = React.lazy(() => import('./wheel/Editor'));
const WheelPlayer = React.lazy(() => import('./wheel/Player'));

const LetterOrderEditor = React.lazy(() => import('./letter-order/Editor'));
const LetterOrderPlayer = React.lazy(() => import('./letter-order/Player'));

const SentenceOrderEditor = React.lazy(() => import('./sentence-order/Editor'));
const SentenceOrderPlayer = React.lazy(() => import('./sentence-order/Player'));

const FillBlankEditor = React.lazy(() => import('./fill-blank/Editor'));
const FillBlankPlayer = React.lazy(() => import('./fill-blank/Player'));

const GuessEditor = React.lazy(() => import('./guess/Editor'));
const GuessPlayer = React.lazy(() => import('./guess/Player'));

export interface TemplateDefinition {
  id: TemplateType;
  name: string;
  category: TemplateCategory;
  description: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  createDefaultDraft: (title?: string) => Draft;
  EditorComponent: React.ComponentType<any>;
  PlayerComponent: React.ComponentType<any>;
}

// 1. Flashcard
const flashcardDefinition: TemplateDefinition = {
  id: 'flashcard',
  name: 'Flashcard Kosakata',
  category: 'game',
  description:
    'Kartu bolak-balik interaktif untuk hafalan mufrodat Arab dengan audio pelafalan, harakat, dan contoh kalimat.',
  badge: 'Game Hafalan',
  icon: BookOpen,
  features: [
    'Flip 3D Bolak-Balik',
    'Suara Bacakan (TTS ar-SA)',
    'Sembunyikan Harakat/Latin',
    'Keyboard Arab Virtual',
  ],
  createDefaultDraft: (title = 'Kosakata Bahasa Arab: Kelas & Sekolah') => ({
    id: 'draft_' + Math.random().toString(36).substring(2, 10),
    title,
    description: 'Daftar mufrodat penting seputar sekolah dan peralatan kelas.',
    templateType: 'flashcard',
    theme: {
      palette: 'emerald',
      fontFamily: 'Amiri',
      fontSize: 'large',
      showHarakat: true,
      showLatin: true,
      soundEnabled: true,
    },
    settings: {
      autoPlayAudio: false,
    },
    items: DEFAULT_FLASHCARDS,
    mediaFiles: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }),
  EditorComponent: FlashcardEditor,
  PlayerComponent: FlashcardPlayer,
};

// 2. Kuis Pilihan Ganda
const quizDefinition: TemplateDefinition = {
  id: 'kuis',
  name: 'Kuis Pilihan Ganda',
  category: 'game',
  description:
    'Game kuis cerdas cermat pilihan ganda (2-5 opsi) dengan skor langsung, batas waktu timer, dan mode kompetisi 2-4 tim.',
  badge: 'Game Kelas',
  icon: HelpCircle,
  features: [
    '2-5 Pilihan Jawaban & Gambar',
    'Mode Tim (2-4 Tim)',
    'Timer Menjawab',
    'Acak Soal & Pilihan',
  ],
  createDefaultDraft: (title = 'Kuis Evaluasi Bahasa Arab') => ({
    id: 'draft_' + Math.random().toString(36).substring(2, 10),
    title,
    description: 'Latihan soal pilihan ganda pemahaman kosakata dan percakapan.',
    templateType: 'kuis',
    theme: {
      palette: 'indigo',
      fontFamily: 'Noto Naskh Arabic',
      fontSize: 'large',
      showHarakat: true,
      showLatin: false,
      soundEnabled: true,
    },
    settings: {
      timerSeconds: 30,
      shuffleQuestions: false,
      shuffleChoices: false,
      pointsPerQuestion: 10,
      teamMode: false,
      teamCount: 2,
      teamNames: ['Tim Merah', 'Tim Biru'],
    },
    items: DEFAULT_QUIZ,
    mediaFiles: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }),
  EditorComponent: QuizEditor,
  PlayerComponent: QuizPlayer,
};

// 3. Matching
const matchingDefinition: TemplateDefinition = {
  id: 'matching',
  name: 'Mencocokkan Kata',
  category: 'game',
  description:
    'Game memasangkan kata Arab dengan arti atau gambar. Dilengkapi drag-and-drop, acak posisi, dan ronde.',
  badge: 'Game Interaktif',
  icon: GitFork,
  features: [
    'Klik & Drag and Drop',
    'Dukungan Gambar & Arti',
    'Pengaturan Acak Posisi & Ronde',
    'Mode Tim 2-4 Tim',
  ],
  createDefaultDraft: (title = 'Game Mencocokkan: Transportasi & Ruangan') => ({
    id: 'draft_' + Math.random().toString(36).substring(2, 10),
    title,
    description: 'Hubungkan mufrodat bahasa Arab dengan arti kata atau gambar yang sesuai.',
    templateType: 'matching',
    theme: {
      palette: 'amber',
      fontFamily: 'Scheherazade New',
      fontSize: 'large',
      showHarakat: true,
      showLatin: true,
      soundEnabled: true,
    },
    settings: {
      shufflePositions: true,
      pairsPerRound: 0,
      teamMode: false,
      teamCount: 2,
      teamNames: ['Tim Hijau', 'Tim Kuning'],
    },
    items: DEFAULT_MATCHING,
    mediaFiles: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }),
  EditorComponent: MatchingEditor,
  PlayerComponent: MatchingPlayer,
};

// 4. Slide Materi
const slideDefinition: TemplateDefinition = {
  id: 'slide',
  name: 'Slide Materi',
  category: 'materi',
  description:
    'Presentasi materi bahasa Arab interaktif dengan tata letak visual, gambar, audio pelafalan, video YouTube, dan catatan guru.',
  badge: 'Slide Presentasi',
  icon: Presentation,
  features: [
    '5 Pilihan Tata Letak',
    'Dukungan Video YouTube & Audio',
    'Navigasi Keyboard & Geser HP',
    'Catatan Guru Rahasia',
  ],
  createDefaultDraft: (title = 'Slide: Pengenalan Bahasa Arab') => ({
    id: 'draft_' + Math.random().toString(36).substring(2, 10),
    title,
    description: 'Materi presentasi pembelajaran bahasa Arab untuk kelas dan proyektor.',
    templateType: 'slide',
    theme: {
      palette: 'emerald',
      fontFamily: 'Noto Naskh Arabic',
      fontSize: 'large',
      showHarakat: true,
      showLatin: true,
      soundEnabled: true,
    },
    settings: {},
    items: DEFAULT_SLIDES,
    mediaFiles: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }),
  EditorComponent: SlideEditor,
  PlayerComponent: SlidePlayer,
};

// 5. Kosakata Bergambar
const vocabPictureDefinition: TemplateDefinition = {
  id: 'vocab-picture',
  name: 'Kosakata Bergambar',
  category: 'materi',
  description:
    'Kartu visual besar bergambar dengan harakat lengkap, arti, dan audio pelafalan. Mendukung mode grid dan mode satu per satu.',
  badge: 'Visual Mufrodat',
  icon: Images,
  features: [
    'Mode Grid & Satu per Satu',
    'Ketuk Kartu Bersuara (TTS ar-SA)',
    'Teks Arab Berharakat Jelas',
    'Dukungan Gambar Ilustrasi',
  ],
  createDefaultDraft: (title = 'Kosakata Bergambar: Hewan & Binatang') => ({
    id: 'draft_' + Math.random().toString(36).substring(2, 10),
    title,
    description: 'Belajar kosakata bahasa Arab melalui gambar visual yang menarik.',
    templateType: 'vocab-picture',
    theme: {
      palette: 'teal',
      fontFamily: 'Amiri',
      fontSize: 'large',
      showHarakat: true,
      showLatin: true,
      soundEnabled: true,
    },
    settings: {
      vocabViewMode: 'single',
    },
    items: DEFAULT_VOCAB_PICTURES,
    mediaFiles: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }),
  EditorComponent: VocabPictureEditor,
  PlayerComponent: VocabPicturePlayer,
};

// 6. Teks Bacaan (Qira'ah)
const readingDefinition: TemplateDefinition = {
  id: 'reading',
  name: 'Teks Bacaan (Qira\'ah)',
  category: 'materi',
  description:
    'Lembar qira\'ah interaktif dengan terjemahan per kalimat (bisa sembunyi/muncul), sorotan kalimat aktif, pengatur ukuran huruf, dan audio.',
  badge: 'Membaca & Qira\'ah',
  icon: Scroll,
  features: [
    'Sembunyi/Tampilkan Terjemahan',
    'Sorot Kalimat Saat Dibaca',
    'Audio Per Kalimat & Utuh',
    'Pengatur Ukuran Font (A-/A+)',
  ],
  createDefaultDraft: (title = 'Qira\'ah: Kegiatan Sehari-hari Siswa') => ({
    id: 'draft_' + Math.random().toString(36).substring(2, 10),
    title,
    description: 'Teks bacaan qira\'ah bahasa Arab dengan pemahaman terjemah per kalimat.',
    templateType: 'reading',
    theme: {
      palette: 'indigo',
      fontFamily: 'Scheherazade New',
      fontSize: 'large',
      showHarakat: true,
      showLatin: true,
      soundEnabled: true,
    },
    settings: {},
    items: DEFAULT_READING_SENTENCES,
    mediaFiles: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }),
  EditorComponent: ReadingEditor,
  PlayerComponent: ReadingPlayer,
};

// 7. Tabel / Tashrif Kata
const wordTableDefinition: TemplateDefinition = {
  id: 'word-table',
  name: 'Tabel & Tashrif Kata',
  category: 'materi',
  description:
    'Tabel kosakata dan perubahan bentuk kata (tashrif fi\'il). Dilengkapi mode cetak bersih dan mode hafalan sembunyikan kolom.',
  badge: 'Tabel & Tashrif',
  icon: Table,
  features: [
    'Preset Tashrif & Mufradat',
    'Mode Hafalan (Klik untuk Buka)',
    'Cetak Bersih ke Kertas/PDF',
    'Kolom Kustom 2-6 Kolom',
  ],
  createDefaultDraft: (title = 'Tashrif Fi\'il Tsulatsi Mujarrad') => ({
    id: 'draft_' + Math.random().toString(36).substring(2, 10),
    title,
    description: 'Tabel perubahan bentuk kata fi\'il madhi, mudhari\', amr, dan mashdar.',
    templateType: 'word-table',
    theme: {
      palette: 'amber',
      fontFamily: 'Noto Naskh Arabic',
      fontSize: 'large',
      showHarakat: true,
      showLatin: true,
      soundEnabled: true,
    },
    settings: {
      columns: PRESET_TASHRIF_COLUMNS,
    },
    items: DEFAULT_WORD_TABLE_ROWS,
    mediaFiles: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }),
  EditorComponent: WordTableEditor,
  PlayerComponent: WordTablePlayer,
};

// 8. Benar atau Salah (True-False)
const trueFalseDefinition: TemplateDefinition = {
  id: 'true-false',
  name: 'Benar atau Salah',
  category: 'game',
  description:
    'Game evaluasi cepat dengan tombol BENAR dan SALAH, skor langsung, batas waktu timer, dan penjelasan kunci jawaban.',
  badge: 'Game Cepat',
  icon: CheckSquare,
  features: [
    'Dua Tombol Besar Interaktif',
    'Umpan Balik & Penjelasan Langsung',
    'Batas Waktu Timer per Soal',
    'Mode Kompetisi 2-4 Tim',
  ],
  createDefaultDraft: (title = 'Benar atau Salah: Pemahaman Kosakata') => ({
    id: 'draft_' + Math.random().toString(36).substring(2, 10),
    title,
    description: 'Latihan menentukan kebenaran pernyataan bahasa Arab secara interaktif.',
    templateType: 'true-false',
    theme: {
      palette: 'emerald',
      fontFamily: 'Noto Naskh Arabic',
      fontSize: 'large',
      showHarakat: true,
      showLatin: true,
      soundEnabled: true,
    },
    settings: {
      tfTimerSeconds: 15,
      tfPointsPerQuestion: 10,
      tfShuffle: false,
      teamMode: false,
      teamCount: 2,
      teamNames: ['Tim Hijau', 'Tim Kuning'],
    },
    items: DEFAULT_TRUE_FALSE,
    mediaFiles: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }),
  EditorComponent: TrueFalseEditor,
  PlayerComponent: TrueFalsePlayer,
};

// 9. Memory Card
const memoryDefinition: TemplateDefinition = {
  id: 'memory',
  name: 'Memory Card',
  category: 'game',
  description:
    'Game melatih daya ingat mufrodat dengan grid kartu tertutup. Cocokkan kata Arab dengan arti, gambar, atau audio pelafalan.',
  badge: 'Game Ingatan',
  icon: Brain,
  features: [
    '4-10 Pasangan Kartu (Grid Responsif)',
    'Efek 3D Flip & Suara Interaktif',
    'Hitung Langkah & Catatan Waktu',
    'Mode Tim Bergiliran',
  ],
  createDefaultDraft: (title = 'Memory Card: Mufrodat Penting') => ({
    id: 'draft_' + Math.random().toString(36).substring(2, 10),
    title,
    description: 'Permainan membalik kartu untuk mencocokkan kata Arab dan artinya.',
    templateType: 'memory',
    theme: {
      palette: 'indigo',
      fontFamily: 'Amiri',
      fontSize: 'large',
      showHarakat: true,
      showLatin: true,
      soundEnabled: true,
    },
    settings: {
      memoryPairsPerGame: 6,
      memoryPreviewBriefly: false,
      teamMode: false,
      teamCount: 2,
      teamNames: ['Tim Merah', 'Tim Biru'],
    },
    items: DEFAULT_MEMORY_PAIRS,
    mediaFiles: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }),
  EditorComponent: MemoryEditor,
  PlayerComponent: MemoryPlayer,
};

// 10. Roda Acak / Spinner
const wheelDefinition: TemplateDefinition = {
  id: 'wheel',
  name: 'Roda Acak / Spinner',
  category: 'game',
  description:
    'Roda putar interaktif untuk undian nama siswa, kuis acak, dan tantangan kelas dengan animasi putaran halus dan efek suara.',
  badge: 'Game Putar Roda',
  icon: Compass,
  features: [
    'Animasi Fisika Halus & Suara Berputar',
    'Dukungan Penuh Teks Arab RTL',
    'Opsi Hapus Entri Setelah Terpilih',
    'Kunci Jawaban Pop-up & Skor Tim',
  ],
  createDefaultDraft: (title = 'Roda Acak: Tanya Jawab Arab') => ({
    id: 'draft_' + Math.random().toString(36).substring(2, 10),
    title,
    description: 'Roda putaran seru untuk memilih pertanyaan atau undian giliran siswa di kelas.',
    templateType: 'wheel',
    theme: {
      palette: 'emerald',
      fontFamily: 'Amiri',
      fontSize: 'large',
      showHarakat: true,
      showLatin: true,
      soundEnabled: true,
    },
    settings: {
      wheelMode: 'questions',
      wheelEliminateOnPick: false,
      wheelSound: true,
      teamMode: false,
      teamCount: 2,
      teamNames: ['Tim A', 'Tim B'],
    },
    items: DEFAULT_WHEEL_ENTRIES,
    mediaFiles: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }),
  EditorComponent: WheelEditor,
  PlayerComponent: WheelPlayer,
};

// 11. Letter Order (Susun Huruf)
const letterOrderDefinition: TemplateDefinition = {
  id: 'letter-order',
  name: 'Susun Huruf',
  category: 'game',
  description:
    'Game menyusun kartu huruf hijaiyah teracak menjadi kata Arab yang tepat dengan kontrol klik atau drag and drop berarah RTL.',
  badge: 'Game Kata',
  icon: SpellCheck,
  features: [
    'Pecah Huruf & Harakat Akurat',
    'RTL (Kanan ke Kiri)',
    'Tombol Petunjuk & Acak Ulang',
    'Mode Tim & Suara SFX',
  ],
  createDefaultDraft: (title = 'Susun Huruf: Mufrodat Penting') => ({
    id: 'draft_' + Math.random().toString(36).substring(2, 10),
    title,
    description: 'Game menyusun kartu huruf Arab menjadi kata yang benar sesuai petunjuk arti.',
    templateType: 'letter-order',
    theme: {
      palette: 'indigo',
      fontFamily: 'Amiri',
      fontSize: 'large',
      showHarakat: true,
      showLatin: true,
      soundEnabled: true,
    },
    settings: {
      letterIgnoreHarakat: false,
      letterShuffle: true,
      teamMode: false,
      teamCount: 2,
      teamNames: ['Tim Merah', 'Tim Biru'],
    },
    items: DEFAULT_LETTER_ORDER_ITEMS,
    mediaFiles: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }),
  EditorComponent: LetterOrderEditor,
  PlayerComponent: LetterOrderPlayer,
};

// 12. Sentence Order (Susun Kalimat)
const sentenceOrderDefinition: TemplateDefinition = {
  id: 'sentence-order',
  name: 'Susun Kalimat',
  category: 'game',
  description:
    'Game merangkai potongan kata bahasa Arab menjadi kalimat sempurna sesuai petunjuk arti dan kaidah tata bahasa.',
  badge: 'Game Kalimat',
  icon: ListOrdered,
  features: [
    'Susun Kata Kanan ke Kiri',
    'Mendukung Multi-Variasi Sah (/)',
    'Petunjuk Arti & Audio',
    'Mode Kompetisi Tim',
  ],
  createDefaultDraft: (title = 'Susun Kalimat: Jumlah Mufidah') => ({
    id: 'draft_' + Math.random().toString(36).substring(2, 10),
    title,
    description: 'Latihan merangkai kata-kata Arab yang diacak menjadi kalimat berfaedah.',
    templateType: 'sentence-order',
    theme: {
      palette: 'indigo',
      fontFamily: 'Noto Naskh Arabic',
      fontSize: 'large',
      showHarakat: true,
      showLatin: false,
      soundEnabled: true,
    },
    settings: {
      sentenceShuffle: true,
      sentenceAllowMultipleOrders: true,
      teamMode: false,
      teamCount: 2,
      teamNames: ['Tim Merah', 'Tim Biru'],
    },
    items: DEFAULT_SENTENCE_ORDER_ITEMS,
    mediaFiles: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }),
  EditorComponent: SentenceOrderEditor,
  PlayerComponent: SentenceOrderPlayer,
};

// 13. Fill Blank (Isian Singkat / Lengkapi Kalimat)
const fillBlankDefinition: TemplateDefinition = {
  id: 'fill-blank',
  name: 'Isian Singkat & Lengkapi Kalimat',
  category: 'game',
  description:
    'Game melengkapi kalimat rumpang bahasa Arab (tanda ___) dengan keyboard virtual, toleransi harakat & alif, serta penilaian instan.',
  badge: 'Game Isian',
  icon: PenLine,
  features: [
    'Penanda Rumpang ___ Otomatis',
    'Toleransi Harakat & Bentuk Alif',
    'Keyboard Arab Virtual & Fisik',
    'Petunjuk Huruf & Mode Tim',
  ],
  createDefaultDraft: (title = 'Latihan Isian Singkat Bahasa Arab') => ({
    id: 'draft_' + Math.random().toString(36).substring(2, 10),
    title,
    description: 'Latihan melengkapi kalimat bahasa Arab dengan kata yang tepat.',
    templateType: 'fill-blank',
    theme: {
      palette: 'indigo',
      fontFamily: 'Noto Naskh Arabic',
      fontSize: 'large',
      showHarakat: true,
      showLatin: false,
      soundEnabled: true,
    },
    settings: {
      fbIgnoreHarakat: true,
      fbNormalizeAlif: true,
      fbNormalizeTaMarbutah: true,
      fbNormalizeYa: true,
      fbShuffle: false,
      fbPointsPerQuestion: 10,
    },
    items: DEFAULT_FILL_BLANK_ITEMS,
    mediaFiles: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }),
  EditorComponent: FillBlankEditor,
  PlayerComponent: FillBlankPlayer,
};

// 14. Guess (Tebak Gambar & Audio)
const guessDefinition: TemplateDefinition = {
  id: 'guess',
  name: 'Tebak Gambar & Audio',
  category: 'game',
  description:
    'Game interaktif menebak kosa kata bahasa Arab berdasarkan petunjuk foto atau suara rekaman, dilengkapi efek gambar buram misterius.',
  badge: 'Game Tebak Media',
  icon: Eye,
  features: [
    'Petunjuk Foto & Audio Clue',
    'Efek Buram Misterius (Progressive)',
    'Pilihan Ganda & Ketik Mandiri',
    'Mode Kompetisi Tim & Skor',
  ],
  createDefaultDraft: (title = 'Game Tebak Gambar & Audio Arab') => ({
    id: 'draft_' + Math.random().toString(36).substring(2, 10),
    title,
    description: 'Tebak kosa kata bahasa Arab berdasarkan petunjuk visual atau audio.',
    templateType: 'guess',
    theme: {
      palette: 'emerald',
      fontFamily: 'Noto Naskh Arabic',
      fontSize: 'large',
      showHarakat: true,
      showLatin: false,
      soundEnabled: true,
    },
    settings: {
      guessAnswerMode: 'choice',
      guessBlurMode: false,
      guessTimerSeconds: 0,
      guessShuffle: true,
    },
    items: DEFAULT_GUESS_ITEMS,
    mediaFiles: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }),
  EditorComponent: GuessEditor,
  PlayerComponent: GuessPlayer,
};

export const TEMPLATE_REGISTRY: Record<string, TemplateDefinition> = {
  flashcard: flashcardDefinition,
  kuis: quizDefinition,
  matching: matchingDefinition,
  mencocokkan: matchingDefinition,
  slide: slideDefinition,
  'vocab-picture': vocabPictureDefinition,
  reading: readingDefinition,
  'word-table': wordTableDefinition,
  'true-false': trueFalseDefinition,
  memory: memoryDefinition,
  wheel: wheelDefinition,
  'letter-order': letterOrderDefinition,
  'sentence-order': sentenceOrderDefinition,
  'fill-blank': fillBlankDefinition,
  guess: guessDefinition,
};

export function isValidTemplateType(type: string): type is TemplateType {
  return (
    type === 'flashcard' ||
    type === 'kuis' ||
    type === 'matching' ||
    type === 'mencocokkan' ||
    type === 'slide' ||
    type === 'vocab-picture' ||
    type === 'reading' ||
    type === 'word-table' ||
    type === 'true-false' ||
    type === 'memory' ||
    type === 'wheel' ||
    type === 'letter-order' ||
    type === 'sentence-order' ||
    type === 'fill-blank' ||
    type === 'guess'
  );
}

export function getTemplateOrNull(type: string): TemplateDefinition | null {
  if (type === 'matching' || type === 'mencocokkan') {
    return matchingDefinition;
  }
  return TEMPLATE_REGISTRY[type] || null;
}

export function getTemplate(type: string): TemplateDefinition {
  const t = getTemplateOrNull(type);
  if (!t) {
    throw new Error(`Template "${type}" tidak terdaftar`);
  }
  return t;
}

export function getAllTemplates(): TemplateDefinition[] {
  return [
    slideDefinition,
    vocabPictureDefinition,
    readingDefinition,
    wordTableDefinition,
    flashcardDefinition,
    quizDefinition,
    matchingDefinition,
    trueFalseDefinition,
    memoryDefinition,
    wheelDefinition,
    letterOrderDefinition,
    sentenceOrderDefinition,
    fillBlankDefinition,
    guessDefinition,
  ];
}

export function getAllMateriTemplates(): TemplateDefinition[] {
  return [
    slideDefinition,
    vocabPictureDefinition,
    readingDefinition,
    wordTableDefinition,
  ];
}

export function getAllGameTemplates(): TemplateDefinition[] {
  return [
    flashcardDefinition,
    quizDefinition,
    matchingDefinition,
    trueFalseDefinition,
    memoryDefinition,
    wheelDefinition,
    letterOrderDefinition,
    sentenceOrderDefinition,
    fillBlankDefinition,
    guessDefinition,
  ];
}

export function getTemplatesByCategory(category: TemplateCategory): TemplateDefinition[] {
  return category === 'materi' ? getAllMateriTemplates() : getAllGameTemplates();
}
