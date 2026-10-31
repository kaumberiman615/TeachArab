import { MatchingPair } from '../../types';

export const DEFAULT_MATCHING: MatchingPair[] = [
  {
    id: 'match_1',
    arabic: 'بَابٌ',
    latin: 'baabun',
    meaning: 'Pintu',
  },
  {
    id: 'match_2',
    arabic: 'نَافِذَةٌ',
    latin: 'naafidzatun',
    meaning: 'Jendela',
  },
  {
    id: 'match_3',
    arabic: 'سَيَّارَةٌ',
    latin: 'sayyaarotun',
    meaning: 'Mobil',
  },
  {
    id: 'match_4',
    arabic: 'دَرَّاجَةٌ',
    latin: 'darroojatun',
    meaning: 'Sepeda',
  },
  {
    id: 'match_5',
    arabic: 'طَائِرَةٌ',
    latin: 'thoo-irotun',
    meaning: 'Pesawat Terbang',
  },
  {
    id: 'match_6',
    arabic: 'سَفِينَةٌ',
    latin: 'safiinatun',
    meaning: 'Kapal Laut',
  },
];

export function createEmptyMatchingPair(): MatchingPair {
  return {
    id: 'match_' + Math.random().toString(36).substring(2, 9),
    arabic: '',
    latin: '',
    meaning: '',
  };
}
