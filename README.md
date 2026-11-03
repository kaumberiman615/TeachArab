# Teach Arab - Perangkat Ajar & Game Bahasa Arab Interaktif

Aplikasi web modern untuk membantu guru dan pengajar Bahasa Arab di Indonesia membuat perangkat ajar interaktif (Flashcard kosakata, Kuis pilihan ganda, dan Game mencocokkan kata) secara instan, baik dalam **Mode Tamu (100% Offline)** maupun **Mode Cloud Akun Google**.

---

## ✨ Fitur Utama

1. **3 Template Interaktif Siap Pakai**:
   - **Flashcard Kosakata**: Kartu bolak-balik (flip 3D) dengan teks Arab, transliterasi Latin, terjemahan Indonesia, audio pelafalan, dan gambar.
   - **Kuis Pilihan Ganda**: Soal berbasis teks Arab/Indonesia/audio, timer opsional, skor, sound effect ceria, dan Mode Kompetisi Tim (2-4 tim) di 1 layar.
   - **Mencocokkan Kata**: Game memasangkan kata Arab dengan arti atau gambar dengan giliran tim dan papan skor otomatis.

2. **Mode Tamu (Guest Mode) 100% Bebas & Privat**:
   - Guru dapat membuat materi, pratinjau, main proyektor, dan ekspor offline **tanpa perlu registrasi/login**.
   - Draf otomatis tersimpan di browser menggunakan **IndexedDB** (termasuk media gambar dan audio rekaman sebagai `Blob`).
   - Tidak ada data atau media yang diunggah ke internet dalam mode tamu.

3. **Cloud Sync & Berbagi Tautan Siswa (/p/:shareId)**:
   - Masuk opsional dengan **Google Sign-In**.
   - **Bagikan lewat Link**: Guru membuat tautan publik unik `/p/{shareId}` dan kode QR otomatis.
   - **Siswa Bebas Akses**: Murid tidak perlu registrasi atau login, langsung buka link di HP/tablet untuk bermain atau belajar.
   - **Kontrol Penuh Guru**: Akses tautan publik dapat dinonaktifkan sewaktu-waktu dari dashboard **Materi Saya** (`/materi-saya`).
   - **Penyimpanan Media Hemat Biaya via Cloudinary**: Media lokal diunggah secara unsigned ke Cloudinary dan URL hasilnya disimpan di Firestore. Media yang sudah memiliki tautan tidak akan diunggah ulang (bebas duplikasi).

4. **Ekspor Mandiri & 100% Offline**:
   - **Unduh HTML (Offline)**: 1 file `.html` mandiri dengan semua media disematkan secara base64. Siap dibuka di proyektor tanpa internet.
   - **Unduh ZIP**: Paket lengkap `index.html` + folder `media/`.
   - **Ekspor/Impor JSON**: Cadangkan draf lokal antarperangkat.

---

## 🛠️ Stack Teknologi

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons
- **Backend**: Express di `api/index.ts` (siap Vercel Serverless Function)
- **Database & Auth**: Cloud Firestore & Firebase Authentication (Google Sign-In via Popup)
- **Media Hosting**: Cloudinary (Unsigned Upload REST API)
- **QR Engine**: QRCode generator
- **Konfigurasi Vercel**: `vercel.json` dengan rewrite `/api/*` ke `/api`

---

## 🚀 Panduan Setup Firebase & Cloudinary

### 1. Buat Proyek Firebase Baru & Setup Firestore
1. Buka [Firebase Console](https://console.firebase.google.com/) dan buat proyek baru.
2. Di menu **Authentication** > **Sign-in method**, aktifkan **Google**.
3. Di menu **Firestore Database**, klik **Create database** (mode produksi).
4. Buka tab **Rules** dan salin isi file `firestore.rules` dari repositori ini, lalu klik **Publish**:
   - Pemilik (*owner*) memiliki akses penuh baca/tulis ke proyek miliknya.
   - Siapa saja (siswa) dapat membaca dokumen jika `isPublic == true`.
5. Di menu **Project settings** > tab **General** > **Your apps**, daftarkan Web App dan salin nilai kredensialnya.
6. Pada **Authentication** > tab **Settings** > **Authorized domains**, tambahkan domain deployment Vercel Anda dan `localhost`.

### 2. Setup Cloudinary (Gratis untuk Media)
1. Buat akun gratis di [Cloudinary](https://cloudinary.com/).
2. Di dashboard Cloudinary, catat **Cloud Name** Anda.
3. Buka **Settings** (ikon roda gigi) > menu **Upload** > gulir ke **Upload presets**.
4. Klik **Add upload preset**:
   - Beri nama preset (misal: `teacharab_preset`).
   - Pada opsi **Signing Mode**, pilih **Unsigned**.
   - (Opsional) Pada Folder, isi `teacharab_media`.
5. Klik **Save**. Salin nama upload preset tersebut.

---

## ⚙️ Variabel Lingkungan (Environment Variables)

Saat melakukan deploy di Vercel atau menjalankan di lokal (`.env`):

| Nama Variabel | Keterangan & Contoh |
|---|---|
| `VITE_FIREBASE_API_KEY` | API Key Firebase (`AIzaSy...`) |
| `VITE_FIREBASE_AUTH_DOMAIN` | Domain Auth (`nama-proyek.firebaseapp.com`) |
| `VITE_FIREBASE_PROJECT_ID` | ID Proyek Firebase |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID Firebase (`1234567890`) |
| `VITE_FIREBASE_APP_ID` | App ID Firebase (`1:1234567890:web:...`) |
| `VITE_FIREBASE_FIRESTORE_DATABASE_ID` | *(Opsional)* Kosongkan jika database default |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloud Name Cloudinary Anda |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Nama Unsigned Upload Preset Cloudinary |

---

## 📏 Batasan Ukuran Media & Rekomendasi Video (`src/config/limits.ts`)

- **Foto / Gambar**: Maksimal **5 MB** per gambar (otomatis dikompresi canvas sisi klien bila berukuran besar).
- **Audio / Rekaman**: Maksimal **10 MB** per berkas audio.
- **Video**: Maksimal **50 MB**.
- **Tips Video Besar**: Untuk video materi berdurasi panjang atau ukuran besar (>50MB), sangat disarankan menyematkan tautan YouTube agar siswa dapat memutar video dengan lancar tanpa buffering.

---

## 💻 Menjalankan di Lokal (Development)

```bash
# Salin konfigurasi environment
cp .env.example .env

# Install dependensi
npm install

# Jalankan server pengembangan Vite
npm run dev

# Kompilasi & build produksi
npm run build
```

---

## 🔒 Aturan Keamanan Firestore

File `firestore.rules` menjamin isolasi data antar guru, validasi integritas field proyek, dan mengizinkan siswa membaca proyek yang dibagikan (`isPublic == true`) tanpa memerlukan login.
