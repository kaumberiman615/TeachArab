import { FlashcardItem } from '../../types';

export const DEFAULT_FLASHCARDS: FlashcardItem[] = [
  {
    id: 'fc_1',
    arabic: 'كِتَابٌ',
    latin: 'kitaabun',
    meaning: 'Buku',
    notes: 'Bentuk jamak: كُتُبٌ (kutubun)',
  },
  {
    id: 'fc_2',
    arabic: 'قَلَمٌ',
    latin: 'qalamun',
    meaning: 'Pena / Pulpen',
    notes: 'Alat tulis untuk mencatat pelajaran',
  },
  {
    id: 'fc_3',
    arabic: 'مَدْرَسَةٌ',
    latin: 'madrasatun',
    meaning: 'Sekolah',
    notes: 'Tempat menuntut ilmu',
  },
  {
    id: 'fc_4',
    arabic: 'أُسْتَاذٌ',
    latin: 'ustadzun',
    meaning: 'Guru / Ustadz',
    notes: 'Pendidik dan pembimbing di kelas',
  },
  {
    id: 'fc_5',
    arabic: 'مَكْتَبٌ',
    latin: 'maktabun',
    meaning: 'Meja Tulis / Kantor',
    notes: 'Tempat meletakkan buku dan laptop',
  },
];

export function createEmptyFlashcard(): FlashcardItem {
  return {
    id: 'fc_' + Math.random().toString(36).substring(2, 9),
    arabic: '',
    latin: '',
    meaning: '',
  };
}
