import { SentenceOrderItem } from '../../types';

export const DEFAULT_SENTENCE_ORDER_ITEMS: SentenceOrderItem[] = [
  {
    id: 'so_1',
    sentenceArabic: 'ذَهَبَ أَحْمَدُ إِلَى الْمَدْرَسَةِ / إِلَى الْمَدْرَسَةِ ذَهَبَ أَحْمَدُ',
    translation: 'Ahmad pergi ke sekolah',
  },
  {
    id: 'so_2',
    sentenceArabic: 'يَقْرَأُ الطَّالِبُ الْكِتَابَ فِي الْمَكْتَبَةِ',
    translation: 'Siswa itu membaca buku di perpustakaan',
  },
  {
    id: 'so_3',
    sentenceArabic: 'هَذَا بَيْتٌ جَمِيلٌ جِدًّا',
    translation: 'Ini rumah yang sangat indah',
  },
  {
    id: 'so_4',
    sentenceArabic: 'أَنَا أَتَعَلَّمُ اللُّغَةَ الْعَرَبِيَّةَ فِي الْفَصْلِ',
    translation: 'Saya belajar bahasa Arab di dalam kelas',
  },
];

export function createEmptySentenceOrderItem(): SentenceOrderItem {
  return {
    id: 'so_' + Math.random().toString(36).substring(2, 9),
    sentenceArabic: '',
    translation: '',
  };
}
