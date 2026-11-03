import { MemoryCardPair } from '../../types';

export const DEFAULT_MEMORY_PAIRS: MemoryCardPair[] = [
  {
    id: 'mem_1',
    arabic: 'كِتَابٌ',
    meaning: 'Buku',
  },
  {
    id: 'mem_2',
    arabic: 'قَلَمٌ',
    meaning: 'Pena',
  },
  {
    id: 'mem_3',
    arabic: 'بَابٌ',
    meaning: 'Pintu',
  },
  {
    id: 'mem_4',
    arabic: 'مَسْجِدٌ',
    meaning: 'Masjid',
  },
  {
    id: 'mem_5',
    arabic: 'سَيَّارَةٌ',
    meaning: 'Mobil',
  },
  {
    id: 'mem_6',
    arabic: 'شَجَرَةٌ',
    meaning: 'Pohon',
  },
  {
    id: 'mem_7',
    arabic: 'قَمَرٌ',
    meaning: 'Bulan',
  },
  {
    id: 'mem_8',
    arabic: 'بَيْتٌ',
    meaning: 'Rumah',
  },
];

export function createEmptyMemoryPair(): MemoryCardPair {
  return {
    id: 'mem_' + Math.random().toString(36).substring(2, 9),
    arabic: '',
    meaning: '',
  };
}
