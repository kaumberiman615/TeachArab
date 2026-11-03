import { WordTableColumn, WordTableRow } from '../../types';

export const PRESET_MUFRADAT_COLUMNS: WordTableColumn[] = [
  { id: 'col_arab', name: 'Kata Arab', isArabic: true },
  { id: 'col_latin', name: 'Latin', isArabic: false },
  { id: 'col_arti', name: 'Arti Kata', isArabic: false },
];

export const PRESET_TASHRIF_COLUMNS: WordTableColumn[] = [
  { id: 'col_madhi', name: 'فِعْلٌ مَاضٍ (Madhi)', isArabic: true },
  { id: 'col_mudhari', name: 'فِعْلٌ مُضَارِعٌ (Mudhari\')', isArabic: true },
  { id: 'col_amr', name: 'فِعْلُ أَمْرٍ (Amr)', isArabic: true },
  { id: 'col_mashdar', name: 'مَصْدَرٌ (Mashdar)', isArabic: true },
  { id: 'col_arti', name: 'Arti Indonesia', isArabic: false },
];

export function createEmptyRow(columns: WordTableColumn[]): WordTableRow {
  const values: Record<string, string> = {};
  columns.forEach((col) => {
    values[col.id] = '';
  });
  return {
    id: 'row_' + Math.random().toString(36).substring(2, 9),
    values,
  };
}

export const DEFAULT_WORD_TABLE_ROWS: WordTableRow[] = [
  {
    id: 'row_1',
    values: {
      col_madhi: 'كَتَبَ',
      col_mudhari: 'يَكْتُبُ',
      col_amr: 'اُكْتُبْ',
      col_mashdar: 'كِتَابَةً',
      col_arti: 'Menulis',
    },
  },
  {
    id: 'row_2',
    values: {
      col_madhi: 'قَرَأَ',
      col_mudhari: 'يَقْرَأُ',
      col_amr: 'اِقْرَأْ',
      col_mashdar: 'قِرَاءَةً',
      col_arti: 'Membaca',
    },
  },
  {
    id: 'row_3',
    values: {
      col_madhi: 'دَرَسَ',
      col_mudhari: 'يَدْرُسُ',
      col_amr: 'اُدْرُسْ',
      col_mashdar: 'دِرَاسَةً',
      col_arti: 'Belajar',
    },
  },
  {
    id: 'row_4',
    values: {
      col_madhi: 'جَلَسَ',
      col_mudhari: 'يَجْلِسُ',
      col_amr: 'اِجْلِسْ',
      col_mashdar: 'جُلُوسًا',
      col_arti: 'Duduk',
    },
  },
  {
    id: 'row_5',
    values: {
      col_madhi: 'نَصَرَ',
      col_mudhari: 'يَنْصُرُ',
      col_amr: 'اُنْصُرْ',
      col_mashdar: 'نَصْرًا',
      col_arti: 'Menolong',
    },
  },
  {
    id: 'row_6',
    values: {
      col_madhi: 'فَتَحَ',
      col_mudhari: 'يَفْتَحُ',
      col_amr: 'اِفْتَحْ',
      col_mashdar: 'فَتْحًا',
      col_arti: 'Membuka',
    },
  },
];
