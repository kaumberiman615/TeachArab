import { VocabPictureItem } from '../../types';

export function createEmptyVocabItem(): VocabPictureItem {
  return {
    id: 'vocab_' + Math.random().toString(36).substring(2, 9),
    arabic: '',
    latin: '',
    meaning: '',
  };
}

export const DEFAULT_VOCAB_PICTURES: VocabPictureItem[] = [
  {
    id: 'vp_1',
    arabic: 'أَسَدٌ',
    latin: 'Asadun',
    meaning: 'Singa',
  },
  {
    id: 'vp_2',
    arabic: 'فِيلٌ',
    latin: 'Fiilun',
    meaning: 'Gajah',
  },
  {
    id: 'vp_3',
    arabic: 'قِطَّةٌ',
    latin: 'Qiththatun',
    meaning: 'Kucing',
  },
  {
    id: 'vp_4',
    arabic: 'جَمَلٌ',
    latin: 'Jamalun',
    meaning: 'Unta',
  },
  {
    id: 'vp_5',
    arabic: 'حِصَانٌ',
    latin: 'Hishaanun',
    meaning: 'Kuda',
  },
  {
    id: 'vp_6',
    arabic: 'طَائِرٌ',
    latin: 'Thaa\'irun',
    meaning: 'Burung',
  },
];
