import { ReadingSentence } from '../../types';

export function createEmptySentence(): ReadingSentence {
  return {
    id: 'sent_' + Math.random().toString(36).substring(2, 9),
    arabic: '',
    translation: '',
  };
}

export const DEFAULT_READING_SENTENCES: ReadingSentence[] = [
  {
    id: 'sent_1',
    arabic: 'إِسْمِي عُمَرُ، وَأَنَا طَالِبٌ فِي المَدْرَسَةِ المُتَوَسِّطَةِ الإِسْلَامِيَّةِ.',
    translation: 'Namaku Umar, dan aku seorang siswa di Madrasah Tsanawiyah.',
  },
  {
    id: 'sent_2',
    arabic: 'أَسْتَيْقِظُ مِنَ النَّوْمِ كُلَّ يَوْمٍ فِي السَّاعَةِ الرَّابِعَةِ صَبَاحًا.',
    translation: 'Aku bangun dari tidur setiap hari pada pukul empat pagi.',
  },
  {
    id: 'sent_3',
    arabic: 'أَتَوَضَّأُ ثُمَّ أُصَلِّي الصُّبْحَ جَمَاعَةً مَعَ أَبِي فِي المَسْجِدِ.',
    translation: 'Aku berwudhu kemudian shalat Subuh berjamaah bersama ayahku di masjid.',
  },
  {
    id: 'sent_4',
    arabic: 'فِي السَّاعَةِ السَّادِسَةِ، أَتَنَاوَلُ الفُطُورَ اللَّذِيذَ ثُمَّ أَرْكَبُ الدَّرَّاجَةَ إِلَى المَدْرَسَةِ.',
    translation: 'Pada pukul enam, aku sarapan lezat kemudian mengendarai sepeda ke sekolah.',
  },
  {
    id: 'sent_5',
    arabic: 'فِي الفَصْلِ، أَدْرُسُ اللُّغَةَ العَرَبِيَّةَ بِحَمَاسَةٍ وَأَسْتَمِعُ إِلَى شَرْحِ الأُسْتَاذِ بِعِنَايَةٍ.',
    translation: 'Di dalam kelas, aku belajar bahasa Arab dengan penuh antusias dan mendengarkan penjelasan guru dengan seksama.',
  },
  {
    id: 'sent_6',
    arabic: 'اللُّغَةُ العَرَبِيَّةُ لُغَةٌ جَمِيلَةٌ وَسَهْلَةٌ لِمَنْ يَجْتَهِدُ فِي تَعَلُّمِهَا.',
    translation: 'Bahasa Arab adalah bahasa yang indah dan mudah bagi siapa saja yang bersungguh-sungguh mempelajarinya.',
  },
];
