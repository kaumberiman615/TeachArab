/**
 * Konfigurasi Aplikasi Teach Arab
 * Tempat terpusat untuk versi aplikasi, tautan umpan balik, kontak, dan catatan privasi.
 */

export const APP_CONFIG = {
  // Versi aplikasi saat ini
  VERSION: 'v2.4.0',

  // Nama aplikasi
  NAME: 'Teach Arab',
  TAGLINE: 'Materi & Game Bahasa Arab Interaktif',

  // Tautan umpan balik & saran guru (dapat diganti dengan Google Form / Typeform sekolah)
  FEEDBACK_URL: 'https://forms.gle/teacharab-feedback',

  // Email kontak bantuan
  SUPPORT_EMAIL: 'support@teacharab.id',

  // Catatan privasi ringkas untuk footer
  PRIVACY_NOTE: {
    GUEST_STORAGE: 'Draf tamu tersimpan di browser Anda (IndexedDB lokal tanpa login)',
    CLOUDINARY_MEDIA: 'Media yang dibagikan ke siswa tersimpan di Cloudinary',
    FIREBASE_DATA: 'Data akun & cloud guru tersimpan aman di Firebase Firestore',
    SUMMARY:
      'Draf tamu tersimpan di browser · Media yang dibagikan tersimpan di Cloudinary · Data akun guru di Firebase',
  },

  // Batasan AI Gemini
  AI: {
    MODEL_DISPLAY: 'Gemini Flash',
    TEACHER_WARNING:
      'Hasil AI perlu diperiksa guru, terutama harakat, tata bahasa, dan kebenaran jawaban.',
  },
};
