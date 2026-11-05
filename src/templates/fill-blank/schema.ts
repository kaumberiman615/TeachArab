import { FillBlankItem } from '../../types';

export const DEFAULT_FILL_BLANK_ITEMS: FillBlankItem[] = [
  {
    id: 'fb_1',
    question: 'يَذْهَبُ الطَّالِبُ إِلَى ___ صَبَاحًا',
    answers: ['الْمَدْرَسَةِ', 'المدرسة'],
    explanation: 'Siswa pergi ke sekolah pada waktu pagi.',
  },
  {
    id: 'fb_2',
    question: 'أَنَا أَكْتُبُ الدَّرْسَ بِـ ___',
    answers: ['الْقَلَمِ', 'القلم', 'قَلَمٍ', 'قلم'],
    explanation: 'Saya menulis pelajaran dengan menggunakan pena.',
  },
  {
    id: 'fb_3',
    question: 'الْقُرْآنُ الْكَرِيمُ كِتَابُ ___',
    answers: ['اللَّهِ', 'الله'],
    explanation: 'Al-Qur\'an Al-Karim adalah firman dan kitab Allah SWT.',
  },
  {
    id: 'fb_4',
    question: 'مَكَانُ الصَّلَاةِ هُوَ ___',
    answers: ['الْمَسْجِدُ', 'المسجد'],
    explanation: 'Tempat untuk melaksanakan salat berjamaah adalah masjid.',
  },
];

export function createEmptyFillBlankItem(): FillBlankItem {
  return {
    id: 'fb_' + Math.random().toString(36).substring(2, 9),
    question: '',
    answers: [''],
    explanation: '',
    strictHarakat: false,
  };
}
