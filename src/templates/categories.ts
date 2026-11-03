import { TemplateType, TemplateCategory } from '../types';

export interface CategoryInfo {
  id: TemplateCategory;
  name: string;
  badgeLabel: string;
  tagline: string;
  description: string;
  colorClass: {
    badge: string;
    pillActive: string;
    bgAccent: string;
    border: string;
    text: string;
  };
}

export const CATEGORIES: Record<TemplateCategory, CategoryInfo> = {
  materi: {
    id: 'materi',
    name: 'Materi Pelajaran',
    badgeLabel: 'Materi',
    tagline: 'Tampilkan materi pelajaran: slide, kosakata, bacaan, tabel',
    description:
      'Perangkat ajar murni untuk menyajikan dan menyampaikan materi bahasa Arab di proyektor, layar kelas, atau gawai siswa.',
    colorClass: {
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      pillActive: 'bg-emerald-700 text-white',
      bgAccent: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
    },
  },
  game: {
    id: 'game',
    name: 'Game Interaktif',
    badgeLabel: 'Game',
    tagline: 'Permainan interaktif untuk siswa: flashcard, kuis, mencocokkan',
    description:
      'Permainan interaktif dan kuis berbasis kelas untuk melatih hafalan, pemahaman, dan kompetisi tim yang seru.',
    colorClass: {
      badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      pillActive: 'bg-indigo-700 text-white',
      bgAccent: 'bg-indigo-50',
      border: 'border-indigo-200',
      text: 'text-indigo-700',
    },
  },
};

/**
 * Single source of truth mapping each templateType to its category.
 * Used across navigation, header, galleries, and draft/cloud filters.
 */
export function getCategoryByTemplateType(templateType?: string): TemplateCategory {
  if (!templateType) return 'materi';
  const cleanType = templateType.toLowerCase().trim();

  // Game category
  if (
    cleanType === 'flashcard' ||
    cleanType === 'kuis' ||
    cleanType === 'quiz' ||
    cleanType === 'matching' ||
    cleanType === 'mencocokkan' ||
    cleanType === 'true-false' ||
    cleanType === 'memory' ||
    cleanType === 'wheel'
  ) {
    return 'game';
  }

  // Materi category
  return 'materi';
}

export function isMateriCategory(templateType?: string): boolean {
  return getCategoryByTemplateType(templateType) === 'materi';
}

export function isGameCategory(templateType?: string): boolean {
  return getCategoryByTemplateType(templateType) === 'game';
}
