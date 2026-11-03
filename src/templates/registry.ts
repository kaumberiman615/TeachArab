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
} from 'lucide-react';

import FlashcardEditor from './flashcard/Editor';
import FlashcardPlayer from './flashcard/Player';
import { DEFAULT_FLASHCARDS } from './flashcard/schema';

import QuizEditor from './kuis/Editor';
import QuizPlayer from './kuis/Player';
import { DEFAULT_QUIZ } from './kuis/schema';

import MatchingEditor from './matching/Editor';
import MatchingPlayer from './matching/Player';
import { DEFAULT_MATCHING } from './matching/schema';

import SlideEditor from './slide/Editor';
import SlidePlayer from './slide/Player';
import { DEFAULT_SLIDES } from './slide/schema';

import VocabPictureEditor from './vocab-picture/Editor';
import VocabPicturePlayer from './vocab-picture/Player';
import { DEFAULT_VOCAB_PICTURES } from './vocab-picture/schema';

import ReadingEditor from './reading/Editor';
import ReadingPlayer from './reading/Player';
import { DEFAULT_READING_SENTENCES } from './reading/schema';

import WordTableEditor from './word-table/Editor';
import WordTablePlayer from './word-table/Player';
import { DEFAULT_WORD_TABLE_ROWS, PRESET_TASHRIF_COLUMNS } from './word-table/schema';

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

export const TEMPLATE_REGISTRY: Record<string, TemplateDefinition> = {
  flashcard: flashcardDefinition,
  kuis: quizDefinition,
  matching: matchingDefinition,
  mencocokkan: matchingDefinition,
  slide: slideDefinition,
  'vocab-picture': vocabPictureDefinition,
  reading: readingDefinition,
  'word-table': wordTableDefinition,
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
    type === 'word-table'
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
  ];
}

export function getTemplatesByCategory(category: TemplateCategory): TemplateDefinition[] {
  return category === 'materi' ? getAllMateriTemplates() : getAllGameTemplates();
}
