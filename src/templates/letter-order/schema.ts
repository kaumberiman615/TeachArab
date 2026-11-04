import { LetterOrderItem } from '../../types';

export const DEFAULT_LETTER_ORDER_ITEMS: LetterOrderItem[] = [
  {
    id: 'lo_1',
    arabic: 'كِتَابٌ',
    meaning: 'Buku',
  },
  {
    id: 'lo_2',
    arabic: 'قَلَمٌ',
    meaning: 'Pena / Pulpen',
  },
  {
    id: 'lo_3',
    arabic: 'مَدْرَسَةٌ',
    meaning: 'Sekolah',
  },
  {
    id: 'lo_4',
    arabic: 'بَابٌ',
    meaning: 'Pintu',
  },
  {
    id: 'lo_5',
    arabic: 'سَيَّارَةٌ',
    meaning: 'Mobil',
  },
];

export function createEmptyLetterOrderItem(): LetterOrderItem {
  return {
    id: 'lo_' + Math.random().toString(36).substring(2, 9),
    arabic: '',
    meaning: '',
  };
}
