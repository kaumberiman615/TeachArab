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
      badge: 'bg-[#E0F7FA] text-[#0A254D] border-2 border-[#0A254D]',
      pillActive: 'bg-[#00B4D8] text-white border-2 border-[#0A254D] shadow-[0_2px_0_#0A254D]',
      bgAccent: 'bg-[#E0F7FA]',
      border: 'border-[#0A254D]',
      text: 'text-[#0A254D]',
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
      badge: 'bg-[#FFE4EE] text-[#0A254D] border-2 border-[#0A254D]',
      pillActive: 'bg-[#FF3B8D] text-white border-2 border-[#0A254D] shadow-[0_2px_0_#0A254D]',
      bgAccent: 'bg-[#FFE4EE]',
      border: 'border-[#0A254D]',
      text: 'text-[#0A254D]',
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
    cleanType === 'wheel' ||
    cleanType === 'letter-order' ||
    cleanType === 'sentence-order' ||
    cleanType === 'fill-blank' ||
    cleanType === 'guess'
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
