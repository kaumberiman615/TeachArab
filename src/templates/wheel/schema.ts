import { WheelEntry } from '../../types';

export const WHEEL_COLORS = [
  '#059669', // emerald
  '#4f46e5', // indigo
  '#d97706', // amber
  '#dc2626', // rose
  '#0891b2', // cyan
  '#7c3aed', // violet
  '#ea580c', // orange
  '#0d9488', // teal
  '#2563eb', // blue
  '#db2777', // pink
];

export const DEFAULT_WHEEL_ENTRIES: WheelEntry[] = [
  {
    id: 'wh_1',
    text: 'مَا اسْمُكَ؟',
    answerOrExplanation: 'Jawab dengan: اسْمِي... (Nama saya...)',
    color: '#059669',
  },
  {
    id: 'wh_2',
    text: 'كَيْفَ حَالُكَ؟',
    answerOrExplanation: 'Jawab dengan: بِخَيْرٍ وَالْحَمْدُ لِلَّهِ (Baik, alhamdulillah)',
    color: '#4f46e5',
  },
  {
    id: 'wh_3',
    text: 'مَا هَذَا؟ (كِتَابٌ)',
    answerOrExplanation: 'Tunjuk buku dan ucapkan: هَذَا كِتَابٌ',
    color: '#d97706',
  },
  {
    id: 'wh_4',
    text: 'أَيْنَ الْمَدْرَسَةُ؟',
    answerOrExplanation: 'Jawab dengan: الْمَدْرَسَةُ أَمَامَ الْمَسْجِدِ (Sekolah di depan masjid)',
    color: '#0891b2',
  },
  {
    id: 'wh_5',
    text: 'سَمِّ 3 حَيَوَانَاتٍ',
    answerOrExplanation: 'Sebutkan 3 hewan dalam bahasa Arab (misal: فِيلٌ، سَمَكٌ، قِطٌّ)',
    color: '#7c3aed',
  },
  {
    id: 'wh_6',
    text: 'عُدَّ مِنْ 1 إِلَى 5',
    answerOrExplanation: 'وَاحِدٌ، اِثْنَانِ، ثَلَاثَةٌ، أَرْبَعَةٌ، خَمْسَةٌ',
    color: '#ea580c',
  },
  {
    id: 'wh_7',
    text: 'تَرْجِمْ: أَنَا طَالِبٌ',
    answerOrExplanation: 'Artinya: Saya adalah seorang murid/pelajar.',
    color: '#0d9488',
  },
  {
    id: 'wh_8',
    text: 'هَاتِ جُمْلَةً فِعْلِيَّةً',
    answerOrExplanation: 'Buatlah kalimat fi\'liyyah (misal: يَقْرَأُ أَحْمَدُ الْقُرْآنَ)',
    color: '#db2777',
  },
];

export function createEmptyWheelEntry(index = 0): WheelEntry {
  const color = WHEEL_COLORS[index % WHEEL_COLORS.length];
  return {
    id: 'wh_' + Math.random().toString(36).substring(2, 9),
    text: '',
    answerOrExplanation: '',
    color,
  };
}
