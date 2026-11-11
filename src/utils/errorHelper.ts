/**
 * Helper pemformat pesan error ramah pengguna dalam Bahasa Indonesia
 * Membedakan error Cloudinary, Firestore, Login (Auth), Jaringan, dan AI
 * Disertai saran perbaikan konkret untuk guru
 */

export interface FormattedError {
  category: 'Cloudinary' | 'Firestore' | 'Login (Auth)' | 'Jaringan' | 'AI Gemini' | 'Sistem';
  title: string;
  message: string;
  suggestion: string;
}

export function formatAppError(
  err: unknown,
  context?: 'login' | 'upload' | 'save' | 'share' | 'ai' | 'network' | 'general'
): FormattedError {
  const errorObj = err as any;
  const rawCode = errorObj?.code || '';
  const rawMsg = String(errorObj?.message || errorObj || '');
  const lowerMsg = rawMsg.toLowerCase();

  // 1. CEK ERROR JARINGAN (NETWORK / OFFLINE)
  if (
    lowerMsg.includes('failed to fetch') ||
    lowerMsg.includes('networkerror') ||
    lowerMsg.includes('network request failed') ||
    lowerMsg.includes('the client is offline') ||
    lowerMsg.includes('client is offline') ||
    rawCode === 'auth/network-request-failed' ||
    rawCode === 'unavailable'
  ) {
    return {
      category: 'Jaringan',
      title: 'Koneksi Internet Terputus',
      message: 'Perangkat Anda sedang offline atau koneksi internet tidak stabil saat menghubungi server.',
      suggestion:
        'Periksa sambungan Wi-Fi atau paket data Anda. Draf lokal tetap aman tersimpan di browser peramban ini.',
    };
  }

  // 2. CEK ERROR LOGIN / FIREBASE AUTH
  if (
    context === 'login' ||
    rawCode.startsWith('auth/') ||
    lowerMsg.includes('auth/') ||
    lowerMsg.includes('firebase auth')
  ) {
    if (rawCode === 'auth/popup-blocked' || lowerMsg.includes('popup-blocked')) {
      return {
        category: 'Login (Auth)',
        title: 'Jendela Masuk Diblokir Peramban',
        message: 'Peramban Anda memblokir jendela popup Google Sign-In otomatis.',
        suggestion:
          'Klik ikon gembok/popup di bilah alamat peramban (URL bar), pilih "Selalu izinkan pop-up", lalu klik tombol Masuk kembali.',
      };
    }

    if (rawCode === 'auth/unauthorized-domain' || lowerMsg.includes('unauthorized domain')) {
      return {
        category: 'Login (Auth)',
        title: 'Domain Belum Didaftarkan di Firebase',
        message: 'Domain web saat ini belum masuk ke daftar domain resmi proyek Firebase.',
        suggestion:
          'Buka Firebase Console > Authentication > Settings > Authorized Domains, lalu tambahkan domain ini ke dalam daftar.',
      };
    }

    if (rawCode === 'auth/popup-closed-by-user' || lowerMsg.includes('popup-closed-by-user')) {
      return {
        category: 'Login (Auth)',
        title: 'Masuk Dibatalkan',
        message: 'Jendela masuk ditutup sebelum proses selesai.',
        suggestion: 'Klik kembali tombol "Masuk dengan Google" untuk melanjutkan.',
      };
    }

    return {
      category: 'Login (Auth)',
      title: 'Kendala Masuk Akun Google',
      message: `Tidak dapat memverifikasi akun Google (${rawCode || 'Error'}).`,
      suggestion: 'Pastikan koneksi internet aktif dan coba masuk kembali dengan akun Google sekolah atau pribadi.',
    };
  }

  // 3. CEK ERROR CLOUDINARY (MEDIA UPLOAD)
  if (
    context === 'upload' ||
    errorObj?.isCloudinaryError ||
    lowerMsg.includes('cloudinary') ||
    lowerMsg.includes('unsigned') ||
    lowerMsg.includes('upload preset')
  ) {
    if (lowerMsg.includes('unsigned') || lowerMsg.includes('must be unsigned')) {
      return {
        category: 'Cloudinary',
        title: 'Pengaturan Upload Preset Belum "Unsigned"',
        message: 'Preset Cloudinary yang digunakan masih bertipe Signed sehingga ditolak untuk unggahan langsung siswa.',
        suggestion:
          'Buka Cloudinary Console > Settings > Upload > Upload presets > Edit preset Anda > ubah Signing Mode menjadi "Unsigned" lalu Simpan.',
      };
    }

    if (lowerMsg.includes('does not exist') || lowerMsg.includes('preset') || lowerMsg.includes('not found')) {
      return {
        category: 'Cloudinary',
        title: 'Preset Cloudinary Tidak Ditemukan',
        message: 'Nama upload preset atau Cloud Name di variabel lingkungan VITE_CLOUDINARY_* tidak cocok.',
        suggestion:
          'Periksa kembali file .env Anda atau menu Settings di Vercel, pastikan VITE_CLOUDINARY_CLOUD_NAME dan VITE_CLOUDINARY_UPLOAD_PRESET terisi benar.',
      };
    }

    return {
      category: 'Cloudinary',
      title: 'Gagal Mengunggah Berkas Media (Cloudinary)',
      message: errorObj?.userMessage || rawMsg || 'Berkas gambar atau audio gagal diunggah ke penyimpanan cloud.',
      suggestion:
        errorObj?.suggestion || 'Pastikan ukuran berkas tidak melebihi batas (Foto 5MB, Audio 10MB) dan koneksi internet stabil.',
    };
  }

  // 4. CEK ERROR FIRESTORE (DATABASE & BERBAGI LINK)
  if (
    context === 'save' ||
    context === 'share' ||
    errorObj?.isFirestoreError ||
    rawCode.includes('permission-denied') ||
    lowerMsg.includes('firestore') ||
    lowerMsg.includes('permission-denied') ||
    lowerMsg.includes('insufficient permissions')
  ) {
    if (rawCode === 'permission-denied' || lowerMsg.includes('permission-denied')) {
      return {
        category: 'Firestore',
        title: 'Akses Ditolak (Izin Keamanan)',
        message: 'Aturan keamanan database tidak mengizinkan operasi ini untuk akun saat ini.',
        suggestion:
          'Pastikan Anda telah masuk dengan akun Google pemilik materi dan file firestore.rules telah diterapkan di Firebase Console.',
      };
    }

    if (rawCode === 'resource-exhausted' || lowerMsg.includes('resource-exhausted')) {
      return {
        category: 'Firestore',
        title: 'Batas Kuota Database Tercapai',
        message: 'Kapasitas pembacaan atau penulisan data Firestore harian telah mencapai batas kuota gratis.',
        suggestion: 'Draf Anda tetap aman tersimpan di browser lokal. Anda dapat mengunduh HTML mandiri tanpa batasan.',
      };
    }

    return {
      category: 'Firestore',
      title: 'Gagal Menyimpan ke Cloud (Firestore)',
      message: errorObj?.userMessage || rawMsg || 'Terjadi kendala saat menyinkronkan data materi ke Cloud Firestore.',
      suggestion: 'Coba simpan kembali, atau unduh draf sebagai file HTML / JSON untuk cadangan offline.',
    };
  }

  // 5. CEK ERROR AI GEMINI
  if (
    context === 'ai' ||
    lowerMsg.includes('gemini') ||
    lowerMsg.includes('kuota') ||
    lowerMsg.includes('rate limit') ||
    lowerMsg.includes('429')
  ) {
    if (lowerMsg.includes('429') || lowerMsg.includes('kuota') || lowerMsg.includes('batas pemakaian')) {
      return {
        category: 'AI Gemini',
        title: 'Batas Kuota AI Tercapai',
        message: 'Batas permintaan Bantuan AI telah tercapai (10 kali per jam atau 30 kali per hari).',
        suggestion:
          'Silakan tunggu beberapa saat atau gunakan fitur Input Cepat untuk menempel kosakata manual dari buku.',
      };
    }

    if (lowerMsg.includes('503') || lowerMsg.includes('overloaded') || lowerMsg.includes('sibuk')) {
      return {
        category: 'AI Gemini',
        title: 'Layanan AI Sedang Sibuk',
        message: 'Server Google Gemini sedang menangani antrean tinggi saat ini.',
        suggestion: 'Klik tombol "Coba Lagi" dalam beberapa detik untuk mengirim ulang permintaan.',
      };
    }

    return {
      category: 'AI Gemini',
      title: 'Kendala Layanan Bantuan AI',
      message: rawMsg || 'Gemini tidak dapat menyelesaikan pembuatan materi untuk topik ini.',
      suggestion:
        'Coba ubah kata kunci topik materi menjadi lebih spesifik atau tempelkan kutipan paragraf bacaan pendek.',
    };
  }

  // 6. DEFAULT / GENERAL FALLBACK
  return {
    category: 'Sistem',
    title: 'Terjadi Kendala Teknis',
    message: rawMsg || 'Operasi tidak dapat diselesaikan karena kendala tak terduga.',
    suggestion: 'Muat ulang halaman atau periksa sambungan internet Anda.',
  };
}
