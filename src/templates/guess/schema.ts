import { GuessItem } from '../../types';

export const DEFAULT_GUESS_ITEMS: GuessItem[] = [
  {
    id: 'guess_1',
    answer: 'مَسْجِدٌ',
    wrongChoices: ['مَدْرَسَةٌ', 'بَيْتٌ', 'حَدِيقَةٌ'],
    hint: 'Tempat ibadah salat bagi umat Islam (Masjid)',
  },
  {
    id: 'guess_2',
    answer: 'كِتَابٌ',
    wrongChoices: ['قَلَمٌ', 'مِمْسَحَةٌ', 'مِسْطَرَةٌ'],
    hint: 'Benda untuk membaca dan belajar (Buku)',
  },
  {
    id: 'guess_3',
    answer: 'جَمَلٌ',
    wrongChoices: ['أَسَدٌ', 'فِيلٌ', 'حِصَانٌ'],
    hint: 'Hewan berpunuk yang hidup di gurun pasir (Unta)',
  },
  {
    id: 'guess_4',
    answer: 'سَيَّارَةٌ',
    wrongChoices: ['طَائِرَةٌ', 'سَفِينَةٌ', 'دَرَّاجَةٌ'],
    hint: 'Kendaraan roda empat di jalan raya (Mobil)',
  },
];

export function createEmptyGuessItem(): GuessItem {
  return {
    id: 'guess_' + Math.random().toString(36).substring(2, 9),
    answer: '',
    wrongChoices: ['', '', ''],
    hint: '',
    answerMode: 'choice',
  };
}
