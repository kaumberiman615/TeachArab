# Teach Arab - Perangkat Ajar & Game Bahasa Arab Interaktif

Aplikasi web modern untuk membantu guru dan pengajar Bahasa Arab di Indonesia membuat perangkat ajar interaktif (Flashcard kosakata, Kuis pilihan ganda, dan Game mencocokkan kata) secara instan tanpa perlu registrasi/login.

## ✨ Fitur Utama

1. **3 Template Interaktif Siap Pakai**:
   - **Flashcard Kosakata**: Kartu bolak-balik (flip 3D) dengan teks Arab, transliterasi Latin, terjemahan Indonesia, audio pelafalan, dan gambar.
   - **Kuis Pilihan Ganda**: Soal berbasis teks Arab/Indonesia/audio, timer opsional, skor, sound effect ceria, dan Mode Kompetisi Tim (2-4 tim) di 1 layar.
   - **Mencocokkan Kata**: Game memasangkan kata Arab dengan arti atau gambar dengan giliran tim dan papan skor otomatis.

2. **Ekspor Mandiri & 100% Offline**:
   - **Unduh HTML (Offline)**: 1 file `.html` mandiri dengan semua media (foto & audio rekaman) disematkan secara base64. Dapat dibuka langsung di proyektor kelas tanpa koneksi internet sama sekali!
   - **Unduh ZIP**: Paket lengkap `index.html` + folder `media/`.
   - **Ekspor/Impor Proyek (.json)**: Cadangkan proyek untuk dipindahkan antarperangkat atau dibagikan ke rekan guru.

3. **Kemudahan Input Guru**:
   - **Input Cepat (Batch Paste)**: Tempel puluhan baris kosakata langsung dari Excel, Word, atau WhatsApp dengan pemisah `|`, tab, atau koma.
   - **Keyboard Arab Virtual**: Tersedia huruf hijaiyah, harakat lengkap (fathah, dammah, kasrah, sukun, tanwin, shaddah), dan angka Arab.
   - **Fitur Hapus Harakat**: Otomatis membersihkan harakat untuk latihan membaca gundul.
   - **Perekam Suara Guru**: Rekam pelafalan langsung lewat mikrofon tanpa aplikasi pihak ketiga.
   - **Web Speech API**: Tombol "Bacakan" dengan aksen Arab (*ar-SA*).

4. **Penyimpanan Lokal Aman**:
   - Otomatis tersimpan di browser menggunakan **IndexedDB** (termasuk file audio dan gambar sebagai `Blob`, tanpa batas 5MB seperti localStorage).
   - Dilengkapi peringatan keamanan data dan halaman "Draf Saya".

## 🛠️ Stack Teknologi

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Web Audio API, Web Speech API
- **ZIP Engine**: JSZip
- **Backend API**: Express di `api/index.ts` dengan endpoint `GET /api/health`
- **Konfigurasi Vercel**: `vercel.json` dengan rewrite `/api/*` ke `/api`

## 🚀 Menjalankan Aplikasi

```bash
# Menjalankan server dev
npm run dev

# Membangun produksi (output ke folder dist/)
npm run build
```

## 🔒 Keamanan (Security)

Semua input teks mentah disanitasi menggunakan pembersih karakter HTML sebelum dirender untuk mencegah serangan Cross-Site Scripting (XSS).
