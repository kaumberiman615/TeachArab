import { TrueFalseItem } from '../../types';

export const DEFAULT_TRUE_FALSE: TrueFalseItem[] = [
  {
    id: 'tf_1',
    statementArabic: 'الشَّمْسُ تَطْلُعُ مِنَ الْمَشْرِقِ',
    statementIndo: 'Matahari terbit dari arah timur.',
    isTrue: true,
    explanation: 'Benar. الْمَشْرِقُ artinya adalah timur.',
  },
  {
    id: 'tf_2',
    statementArabic: 'السَّمَكُ يَعِيشُ فِي السَّمَاءِ',
    statementIndo: 'Ikan hidup di langit.',
    isTrue: false,
    explanation: 'Salah. Ikan hidup di dalam air (الْمَاءُ), bukan di langit (السَّمَاءُ).',
  },
  {
    id: 'tf_3',
    statementArabic: 'الْمَدْرَسَةُ مَكَانٌ لِلتَّعَلُّمِ',
    statementIndo: 'Sekolah adalah tempat untuk belajar.',
    isTrue: true,
    explanation: 'Benar. الْمَدْرَسَةُ bermakna tempat menuntut ilmu/belajar.',
  },
  {
    id: 'tf_4',
    statementArabic: 'الْقَلَمُ يُسْتَخْدَمُ لِلْأَكْلِ',
    statementIndo: 'Pena digunakan untuk makan.',
    isTrue: false,
    explanation: 'Salah. Pena (الْقَلَمُ) digunakan untuk menulis (لِلْكِتَابَةِ), bukan untuk makan.',
  },
  {
    id: 'tf_5',
    statementArabic: 'الْفِيلُ حَيَوَانٌ كَبِيرٌ جِدًّا',
    statementIndo: 'Gajah adalah hewan yang sangat besar.',
    isTrue: true,
    explanation: 'Benar. كَبِيرٌ artinya besar.',
  },
  {
    id: 'tf_6',
    statementArabic: 'يَوْمُ الْجُمُعَةِ يَأْتِي بَعْدَ السَّبْتِ',
    statementIndo: 'Hari Jumat datang setelah hari Sabtu.',
    isTrue: false,
    explanation: 'Salah. Hari Jumat datang sebelum hari Sabtu (قَبْلَ السَّبْتِ).',
  },
];

export function createEmptyTrueFalseItem(): TrueFalseItem {
  return {
    id: 'tf_' + Math.random().toString(36).substring(2, 9),
    statementArabic: '',
    statementIndo: '',
    isTrue: true,
    explanation: '',
  };
}
