import { QuizItem, QuizChoice } from '../../types';

export function normalizeQuizChoices(choices: (string | QuizChoice)[]): QuizChoice[] {
  if (!Array.isArray(choices)) return [];
  return choices.map((c) => {
    if (typeof c === 'string') {
      return { text: c };
    }
    return {
      text: c?.text || '',
      mediaImageId: c?.mediaImageId,
    };
  });
}

export const DEFAULT_QUIZ: QuizItem[] = [
  {
    id: 'quiz_1',
    questionArabic: 'مَا مَعْنَى كَلِمَةِ «كِتَابٌ» فِي اللُّغَةِ الإِنْدُوْنِيْسِيَّةِ؟',
    questionIndo: 'Apa arti kata «كِتَابٌ» dalam bahasa Indonesia?',
    choices: [
      { text: 'Buku' },
      { text: 'Pena' },
      { text: 'Meja' },
      { text: 'Pintu' },
    ],
    correctIndex: 0,
    explanation: 'كِتَابٌ artinya buku (alat untuk dibaca dan ditulis).',
  },
  {
    id: 'quiz_2',
    questionArabic: 'أَيْنَ يَعْمَلُ الْمُدَرِّسُ؟',
    questionIndo: 'Di mana seorang guru (الْمُدَرِّسُ) bekerja?',
    choices: [
      { text: 'فِي الْمُسْتَشْفَى' },
      { text: 'فِي الْمَدْرَسَةِ' },
      { text: 'فِي السُّوْقِ' },
      { text: 'فِي الْمَطْعَمِ' },
    ],
    correctIndex: 1,
    explanation: 'الْمُدَرِّسُ يَعْمَلُ فِي الْمَدْرَسَةِ (Guru bekerja di sekolah).',
  },
  {
    id: 'quiz_3',
    questionArabic: 'مَا اسْمُ هَذِهِ الأَدَاةِ لِلْكِتَابَةِ؟',
    questionIndo: 'Apa nama alat tulis ini dalam bahasa Arab? (Pena)',
    choices: [
      { text: 'مِمْسَحَةٌ' },
      { text: 'مِسْطَرَةٌ' },
      { text: 'قَلَمٌ' },
      { text: 'حَقِيبَةٌ' },
    ],
    correctIndex: 2,
    explanation: 'قَلَمٌ artinya pena / pulpen.',
  },
  {
    id: 'quiz_4',
    questionArabic: 'كَيْفَ حَالُكَ؟',
    questionIndo: 'Jika seseorang bertanya «كَيْفَ حَالُكَ؟», apa jawaban yang tepat?',
    choices: [
      { text: 'بِخَيْرٍ، وَالْحَمْدُ لِلَّهِ' },
      { text: 'اسْمِي أَحْمَدُ' },
      { text: 'أَنَا مِنْ جَاكَرْتَا' },
      { text: 'إِلَى اللِّقَاءِ' },
    ],
    correctIndex: 0,
    explanation: 'Jawaban kabar baik adalah «بِخَيْرٍ، وَالْحَمْدُ لِلَّهِ» (Baik, alhamdulillah).',
  },
];

export function createEmptyQuizItem(): QuizItem {
  return {
    id: 'quiz_' + Math.random().toString(36).substring(2, 9),
    questionArabic: '',
    questionIndo: '',
    choices: [
      { text: '' },
      { text: '' },
      { text: '' },
      { text: '' },
    ],
    correctIndex: 0,
  };
}
