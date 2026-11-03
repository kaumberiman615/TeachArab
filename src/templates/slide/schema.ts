import { SlideItem } from '../../types';

export function createEmptySlideItem(): SlideItem {
  return {
    id: 'slide_' + Math.random().toString(36).substring(2, 9),
    title: 'Judul Slide Baru',
    content: 'Tulis penjelasan materi di sini dalam bahasa Indonesia atau Arab.',
    layout: 'text-only',
    teacherNotes: '',
  };
}

export const DEFAULT_SLIDES: SlideItem[] = [
  {
    id: 'slide_1',
    title: 'مَرْحَبًا بِكُمْ فِي دَرْسِ اللُّغَةِ العَرَبِيَّةِ',
    content: 'Selamat Datang di Pembelajaran Bahasa Arab Interaktif!\n\nMari kita mulai dengan niat yang tulus dan semangat untuk mempelajari bahasa Al-Qur\'an dan hadits Nabi.',
    layout: 'big-title',
    teacherNotes: 'Guru membuka kelas dengan salam, doa bersama, dan memberikan motivasi keutamaan bahasa Arab.',
  },
  {
    id: 'slide_2',
    title: 'أَهَمِّيَّةُ تَعَلُّمِ اللُّغَةِ العَرَبِيَّةِ',
    content: 'Bahasa Arab adalah salah satu bahasa resmi PBB dan bahasa peribadatan lebih dari 1,8 miliar Muslim di seluruh dunia.\n\nKeutamaan mempelajari bahasa Arab:\n1. Memahami Al-Qur\'an dan As-Sunnah secara langsung\n2. Melatih logika dan kepekaan tata bahasa (ilmu nahwu & sharaf)\n3. Memperkaya wawasan literatur klasik dan komunikasi internasional',
    layout: 'text-only',
    teacherNotes: 'Tanyakan kepada siswa: Mengapa kalian ingin belajar bahasa Arab?',
  },
  {
    id: 'slide_3',
    title: 'الحُرُوفُ الهِجَائِيَّةُ وَمَخَارِجُ الحُرُوفِ',
    content: 'Huruf Hijaiyah berjumlah 28 atau 29 huruf pokok.\n\nSetiap huruf memiliki Makhorijul Huruf (tempat keluarnya suara) yang unik:\n• Al-Jauf (rongga mulut)\n• Al-Halq (tenggorokan)\n• Al-Lisan (lidah)\n• Asy-Syafatain (kedua bibir)\n• Al-Khaisyum (rongga hidung)\n\nLafalkan setiap huruf dengan harakat yang fasih dan tepat!',
    layout: 'image-left',
    teacherNotes: 'Ajak murid melafalkan huruf-huruf tenggorokan (ع، ح، خ، غ) secara bersama-sama.',
  },
  {
    id: 'slide_4',
    title: 'تَحِيَّاتٌ وَتَعَارُفٌ يَوْمِيٌّ',
    content: 'Ungkapan sapaan penting yang sering digunakan sehari-hari:\n\n• السَّلَامُ عَلَيْكُمْ — Assalamu\'alaikum\n• صَبَاحُ الخَيْرِ — Selamat Pagi (Dijawab: صَبَاحُ النُّورِ)\n• مَسَاءُ الخَيْرِ — Selamat Sore (Dijawab: مَسَاءُ النُّورِ)\n• كَيْفَ حَالُكَ؟ — Bagaimana kabarmu? (Dijawab: بِخَيْرٍ وَالحَمْدُ لِلَّهِ)\n• شُكْرًا جَزِيلًا — Terima kasih banyak (Dijawab: عَفْوًا)',
    layout: 'text-only',
    teacherNotes: 'Praktekkan berpasangan antar teman sebangku selama 3 menit.',
  },
];
