# Teach Arab - Perangkat Ajar & Game Bahasa Arab Interaktif

Aplikasi web modern untuk membantu guru dan pengajar Bahasa Arab di Indonesia membuat perangkat ajar interaktif (14 format materi dan permainan edukatif) secara instan, baik dalam **Mode Tamu (100% Offline & Mandiri)** maupun **Mode Cloud Akun Google**.

---

## ✨ Fitur Utama

1. **14 Template Interaktif (Materi & Game)**:
   - **Kategori Materi (4 Format)**:
     - **Slide Materi**: Presentasi bab pelajaran dengan pilihan tata letak, gambar, dan catatan guru.
     - **Kosakata Bergambar**: Kartu visual mufrodat dengan audio pelafalan fasih dan teks Arab berharakat utuh.
     - **Teks Bacaan (Qira'ah)**: Paragraf teks Arab mengalir rapi dengan fitur intip arti kalimat dan terjemah.
     - **Tabel / Tashrif Kata**: Tabel mufradat dan perubahan wazan fi'il dengan mode hafalan sembunyikan kolom & tombol cetak ramah kertas.
   - **Kategori Game (10 Permainan)**:
     - **Flashcard Kosakata**: Kartu hafalan bolak-balik 3D interaktif.
     - **Kuis Pilihan Ganda**: Mode cerdas cermat dengan timer, poin, dan mode kompetisi 2-4 tim.
     - **Mencocokkan Kata**: Game memasangkan kata Arab dengan arti atau gambar.
     - **Susun Huruf (Hijaiah)**: Menyusun potongan huruf dari kanan ke kiri (RTL).
     - **Susun Kalimat**: Menyusun kata-kata acak menjadi kalimat yang runtut.
     - **Memory Card**: Kartu tertutup untuk melatih daya ingat hafalan pasangan kata.
     - **Roda Acak (Spin Wheel)**: Undian giliran siswa atau pertanyaan acak ice breaking.
     - **Benar / Salah**: Uji pemahaman pernyataan Arab dengan toggle benar/salah.
     - **Isian Singkat (Rumpang)**: Melengkapi bagian kalimat yang hilang (`___`).
     - **Tebak Media**: Game tebak gambar atau suara misterius.

2. **Bantuan AI Gemini (Flashcard, Kuis, Benar/Salah, Isian Singkat)**:
   - Menggunakan model resmi Google GenAI Gemini Flash di server-side (`api/index.ts`).
   - Menyusun draf kosakata berharakat fusha, soal pilihan ganda, pernyataan benar/salah, atau kalimat rumpang otomatis dari tema pelajaran.
   - Hasil masuk sebagai pratinjau yang bisa dicentang dan diedit guru sebelum ditambahkan ke editor (tidak pernah menimpa draf yang ada).
   - Rate limit aman 10 permintaan/jam dan 30 permintaan/hari per IP.

3. **Mode Tamu (Guest Mode) 100% Bebas & Privat**:
   - Guru dapat membuat materi, pratinjau, main proyektor, dan ekspor offline **tanpa perlu registrasi/login**.
   - Draf otomatis tersimpan di peramban menggunakan **IndexedDB** (termasuk media gambar dan audio rekaman sebagai `Blob`).
   - Tidak ada data atau media yang diunggah ke internet dalam mode tamu.

4. **Cloud Sync & Berbagi Tautan Siswa (/p/:shareId)**:
   - Masuk opsional dengan **Google Sign-In**.
   - **Bagikan lewat Link**: Guru membuat tautan publik unik `/p/{shareId}` dan kode QR otomatis.
   - **Siswa Bebas Akses**: Murid tidak perlu registrasi atau login, langsung buka link di HP/tablet untuk bermain atau belajar.
   - **Kontrol Penuh Guru**: Akses tautan publik dapat dinonaktifkan sewaktu-waktu dari dashboard **Materi Saya** (`/materi-saya`).
   - **Penyimpanan Media Hemat Biaya via Cloudinary**: Media diunggah secara unsigned ke Cloudinary dan URL hasilnya disimpan di Firestore.

5. **Ekspor Mandiri & 100% Offline**:
   - **Unduh HTML (Offline)**: 1 berkas `.html` mandiri dengan semua media disematkan secara base64. Siap dibuka di proyektor tanpa internet.
   - **Unduh ZIP**: Paket lengkap `index.html` + folder `media/`.
   - **Ekspor/Impor JSON**: Cadangkan draf lokal antarperangkat.

6. **Onboarding 4 Langkah & Panduan Lengkap**:
   - Tur interaktif 4 langkah bagi guru baru di beranda (bisa dibuka kembali dari `/bantuan`).
   - Contoh format Input Cepat untuk seluruh 14 template.
   - FAQ akordeon interaktif dan catatan privasi data yang transparan.

---

## 🛠️ Stack Teknologi

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons
- **Backend / API**: Express di `api/index.ts` (siap Vercel Serverless Function)
- **AI SDK**: `@google/genai` (Gemini Flash)
- **Database & Auth**: Cloud Firestore & Firebase Authentication (Google Sign-In via Popup)
- **Media Hosting**: Cloudinary (Unsigned Upload REST API)
- **QR Engine**: QRCode generator
- **Konfigurasi Vercel**: `vercel.json` dengan rewrite `/api/*` ke `/api`

---

## ⚙️ Variabel Lingkungan (Environment Variables)

Salin `.env.example` menjadi `.env` di lingkungan lokal atau masukkan di dashboard Vercel:

| Nama Variabel | Wajib/Opsional | Keterangan & Contoh |
|---|---|---|
| `GEMINI_API_KEY` | **Wajib** (Server) | API Key Google Gemini AI (`AIzaSy...`). *Jangan beri awalan VITE_!* |
| `VITE_FIREBASE_API_KEY` | **Wajib** (Client) | API Key Firebase Web (`AIzaSy...`) |
| `VITE_FIREBASE_AUTH_DOMAIN` | **Wajib** (Client) | Auth Domain Firebase (`nama-proyek.firebaseapp.com`) |
| `VITE_FIREBASE_PROJECT_ID` | **Wajib** (Client) | ID Proyek Firebase |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | **Wajib** (Client) | Sender ID Firebase (`123456789012`) |
| `VITE_FIREBASE_APP_ID` | **Wajib** (Client) | App ID Firebase (`1:123456789012:web:...`) |
| `VITE_FIREBASE_FIRESTORE_DATABASE_ID` | Opsional | Kosongkan jika database default `(default)` |
| `VITE_CLOUDINARY_CLOUD_NAME` | **Wajib** (Client) | Nama Cloudinary Anda |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | **Wajib** (Client) | Nama Unsigned Upload Preset Cloudinary |
| `APP_URL` | Opsional | Domain publik aplikasi (misal `https://teacharab.vercel.app`) |

---

## 🚀 Panduan Deploy ke Vercel (Langkah demi Langkah)

Aplikasi Teach Arab dirancang siap deploy dalam 1 klik ke Vercel berkat konfigurasi `vercel.json` yang secara otomatis mengarahkan panggilan frontend dan fungsi backend Express di folder `api/`.

### Langkah 1: Push Kode ke GitHub
1. Pastikan seluruh perubahan kode sudah di-commit dan di-push ke repositori GitHub Anda:
   ```bash
   git add .
   git commit -m "feat: teacharab ready for production"
   git push origin main
   ```

### Langkah 2: Impor Proyek di Vercel
1. Buka [Vercel Dashboard](https://vercel.com/) dan login/daftar dengan akun GitHub Anda.
2. Klik tombol **"Add New..."** > pilih **"Project"**.
3. Cari repositori Teach Arab Anda lalu klik **"Import"**.
4. Biarkan konfigurasi build standar:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Langkah 3: Masukkan Environment Variables di Vercel
Pada bagian **Environment Variables** di formulir impor Vercel, tambahkan seluruh variabel berikut:

1. `GEMINI_API_KEY`: API Key Gemini Anda dari Google AI Studio.
2. `VITE_FIREBASE_API_KEY`: API Key Firebase Web.
3. `VITE_FIREBASE_AUTH_DOMAIN`: Domain autentikasi Firebase.
4. `VITE_FIREBASE_PROJECT_ID`: ID proyek Firebase Anda.
5. `VITE_FIREBASE_MESSAGING_SENDER_ID`: Sender ID Firebase.
6. `VITE_FIREBASE_APP_ID`: App ID Firebase.
7. `VITE_CLOUDINARY_CLOUD_NAME`: Cloud Name Cloudinary Anda.
8. `VITE_CLOUDINARY_UPLOAD_PRESET`: Nama upload preset Unsigned Cloudinary.

### Langkah 4: Klik Deploy
1. Klik tombol **"Deploy"**.
2. Vercel akan mengompilasi frontend Vite dan menyiapkan serverless function Express di rute `/api`.
3. Setelah selesai, catat domain produksi Anda (misal: `https://teacharab-abc.vercel.app`).

### Langkah 5: Daftarkan Domain di Firebase Console
Agar fitur Google Sign-In guru dapat berfungsi di domain Vercel:
1. Buka [Firebase Console](https://console.firebase.google.com/) > pilih proyek Anda.
2. Buka menu **Authentication** > klik tab **Settings**.
3. Gulir ke bawah ke bagian **Authorized domains**.
4. Klik **Add domain** lalu masukkan domain Vercel Anda (misal: `teacharab-abc.vercel.app`).
5. Klik **Save**.

### Langkah 6: Verifikasi Fitur di Vercel
1. Buka URL Vercel Anda di peramban.
2. Buka endpoint status AI: `https://domain-anda.vercel.app/api/ai-status` untuk memastikan respons `{"status":"ai_enabled","enabled":true,...}`.
3. Coba buat materi atau game dalam Mode Tamu maupun Login Google.

---

## 📏 Batasan Ukuran Media (`src/config/limits.ts`)

- **Foto / Gambar**: Maksimal **5 MB** per berkas (didukung JPG, PNG, WebP, SVG).
- **Audio / Rekaman**: Maksimal **10 MB** per berkas (didukung MP3, WAV, AAC).
- **Video Langsung**: Maksimal **50 MB** per berkas.
- **Rekomendasi Video**: Untuk video berdurasi panjang atau >50MB, gunakan tautan YouTube agar siswa dapat memutar video dengan lancar tanpa buffering.

---

## 💻 Menjalankan di Komputer Lokal (Development)

```bash
# 1. Salin konfigurasi environment
cp .env.example .env

# 2. Pasang dependensi
npm install

# 3. Jalankan server pengembangan lokal (Port 3000)
npm run dev

# 4. Tes kompilasi & build produksi
npm run build
```

---

## 🔒 Privasi & Aturan Keamanan Data

- **Draf Tamu**: 100% tersimpan di browser Anda via IndexedDB lokal tanpa login.
- **Media Publik Siswa**: Gambar dan audio yang dibagikan lewat tautan tersimpan aman di Cloudinary CDN.
- **Data Akun Guru**: Disimpan di Google Cloud Firestore dengan isolasi data berbasis aturan `firestore.rules`.
