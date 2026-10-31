import React from 'react';
import { Draft, TemplateType, TemplateCategory } from '../types';
import { BookOpen, HelpCircle, GitFork } from 'lucide-react';

import FlashcardEditor from './flashcard/Editor';
import FlashcardPlayer from './flashcard/Player';
import { DEFAULT_FLASHCARDS } from './flashcard/schema';

import QuizEditor from './kuis/Editor';
import QuizPlayer from './kuis/Player';
import { DEFAULT_QUIZ } from './kuis/schema';

import MatchingEditor from './matching/Editor';
import MatchingPlayer from './matching/Player';
import { DEFAULT_MATCHING } from './matching/schema';

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

const matchingDefinition: TemplateDefinition = {
  id: 'matching',
  name: 'Mencocokkan Kata',
  category: 'game',
  description: 'Game memasangkan kata Arab dengan arti atau gambar. Dilengkapi drag-and-drop, acak posisi, dan ronde.',
  badge: 'Game Interaktif',
  icon: GitFork,
  features: ['Klik & Drag and Drop', 'Dukungan Gambar & Arti', 'Pengaturan Acak Posisi & Ronde', 'Mode Tim 2-4 Tim'],
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

export const TEMPLATE_REGISTRY: Record<string, TemplateDefinition> = {
  flashcard: {
    id: 'flashcard',
    name: 'Flashcard Kosakata',
    category: 'materi',
    description: 'Kartu bolak-balik interaktif untuk hafalan mufrodat Arab dengan audio pelafalan, harakat, dan contoh kalimat.',
    badge: 'Materi Belajar',
    icon: BookOpen,
    features: ['Flip 3D Bolak-Balik', 'Suara Bacakan (TTS ar-SA)', 'Sembunyikan Harakat/Latin', 'Keyboard Arab Virtual'],
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
  },

  kuis: {
    id: 'kuis',
    name: 'Kuis Pilihan Ganda',
    category: 'game',
    description: 'Game kuis cerdas cermat pilihan ganda (2-5 opsi) dengan skor langsung, batas waktu timer, dan mode kompetisi 2-4 tim.',
    badge: 'Game Kelas',
    icon: HelpCircle,
    features: ['2-5 Pilihan Jawaban & Gambar', 'Mode Tim (2-4 Tim)', 'Timer Menjawab', 'Acak Soal & Pilihan'],
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
  },

  matching: matchingDefinition,
  mencocokkan: matchingDefinition,
};

export function isValidTemplateType(type: string): type is TemplateType {
  return type === 'flashcard' || type === 'kuis' || type === 'matching' || type === 'mencocokkan';
}

export function getTemplateOrNull(type: string): TemplateDefinition | null {
  if (type === 'matching' || type === 'mencocokkan') {
    return matchingDefinition;
  }
  if (type === 'flashcard') {
    return TEMPLATE_REGISTRY.flashcard;
  }
  if (type === 'kuis') {
    return TEMPLATE_REGISTRY.kuis;
  }
  return null;
}

export function getTemplate(type: string): TemplateDefinition {
  const t = getTemplateOrNull(type);
  if (!t) {
    throw new Error(`Template "${type}" tidak terdaftar`);
  }
  return t;
}

export function getAllTemplates(): TemplateDefinition[] {
  // Returns exactly the 3 distinct templates for the gallery
  return [
    TEMPLATE_REGISTRY.flashcard,
    TEMPLATE_REGISTRY.kuis,
    matchingDefinition,
  ];
}
