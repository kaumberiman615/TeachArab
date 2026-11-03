import React, { useState, useRef, useEffect } from 'react';
import { MediaItem } from '../types';
import { compressImage, getMediaUrl, MAX_PHOTO_SIZE, MAX_AUDIO_SIZE } from '../utils/media';
import { formatBytes, isIndexedDBSupported, lastIndexedDBError } from '../services/storage';
import {
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  Image as ImageIcon,
  Volume2,
  Upload,
  AlertCircle,
  AlertTriangle,
  ExternalLink,
  X,
  ChevronDown,
  ChevronUp,
  Activity,
  CheckCircle2,
} from 'lucide-react';

interface MediaManagerProps {
  currentImageId?: string;
  currentAudioId?: string;
  mediaFiles: Record<string, MediaItem>;
  onAttachImage: (mediaId: string, mediaItem: MediaItem) => void;
  onRemoveImage: () => void;
  onAttachAudio: (mediaId: string, mediaItem: MediaItem) => void;
  onRemoveAudio: () => void;
  allowAudio?: boolean;
}

export default function MediaManager({
  currentImageId,
  currentAudioId,
  mediaFiles = {},
  onAttachImage,
  onRemoveImage,
  onAttachAudio,
  onRemoveAudio,
  allowAudio = true,
}: MediaManagerProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stageFailed, setStageFailed] = useState<string | null>(null);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [lastDiagnosticError, setLastDiagnosticError] = useState<string | null>(lastIndexedDBError);

  // Audio Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // MediaRecorder Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const currentStreamRef = useRef<MediaStream | null>(null);

  // File Inputs
  const fileInputImageRef = useRef<HTMLInputElement>(null);
  const fileInputAudioRef = useRef<HTMLInputElement>(null);

  // Current attached items
  const attachedImage = currentImageId ? mediaFiles[currentImageId] : null;
  const attachedAudio = currentAudioId ? mediaFiles[currentAudioId] : null;

  // Object URLs
  const [imageObjectUrl, setImageObjectUrl] = useState<string | null>(null);
  const [audioObjectUrl, setAudioObjectUrl] = useState<string | null>(null);

  // Create & sync Object URL for image immediately
  useEffect(() => {
    let url: string | null = null;
    if (attachedImage) {
      if (attachedImage.blob instanceof Blob) {
        try {
          url = URL.createObjectURL(attachedImage.blob);
        } catch (e: unknown) {
          const err = e as { name?: string; message?: string };
          console.warn(`[MediaManager URL Image] ${err.name}: ${err.message}`);
          url = getMediaUrl(attachedImage);
        }
      } else {
        url = getMediaUrl(attachedImage);
      }
    }
    setImageObjectUrl(url);

    return () => {
      if (url && url.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // ignore
        }
      }
    };
  }, [attachedImage]);

  // Create & sync Object URL for audio immediately
  useEffect(() => {
    let url: string | null = null;
    if (attachedAudio) {
      if (attachedAudio.blob instanceof Blob) {
        try {
          url = URL.createObjectURL(attachedAudio.blob);
        } catch (e: unknown) {
          const err = e as { name?: string; message?: string };
          console.warn(`[MediaManager URL Audio] ${err.name}: ${err.message}`);
          url = getMediaUrl(attachedAudio);
        }
      } else {
        url = getMediaUrl(attachedAudio);
      }
    }
    setAudioObjectUrl(url);
    setIsPlaying(false);

    return () => {
      if (url && url.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // ignore
        }
      }
    };
  }, [attachedAudio]);

  // Check IndexedDB status on mount
  useEffect(() => {
    if (typeof indexedDB === 'undefined' || !isIndexedDBSupported) {
      setStorageWarning('Media tidak bisa disimpan permanen di browser ini (mode memori aktif).');
    }
  }, []);

  // Textual Logging & Error State Helper per Requirement 6
  const logAndSetError = (
    stage: string,
    err: unknown,
    file?: { name?: string; type?: string; size?: number }
  ) => {
    const e = err instanceof Error ? err : { name: 'Error', message: String(err), stack: '' };
    const fileDetails = file
      ? `name="${file.name || 'unknown'}", type="${file.type || 'unknown'}", size=${file.size ?? 0} bytes`
      : 'Berkas: N/A';

    const textLog = `[Tahap: ${stage}] Error Name: ${e.name} | Message: ${e.message} | Stack: ${e.stack || 'Tidak ada stack'} | Detail: ${fileDetails}`;
    console.error(textLog);

    setStageFailed(stage);
    setErrorMessage(`Gagal pada tahap "${stage}": ${e.message || 'Terjadi kesalahan'}`);
    setLastDiagnosticError(`[${stage}] ${e.name}: ${e.message}`);
  };

  // 1. Handle Photo Upload (100% Local)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setStageFailed(null);
    setMicPermissionDenied(false);

    const file = e.target.files?.[0];
    if (fileInputImageRef.current) {
      fileInputImageRef.current.value = '';
    }

    if (!file) return;

    // Tahap 1: Validasi Ukuran & Tipe
    if (file.size > MAX_PHOTO_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const msg = `Ukuran foto "${file.name}" (${sizeMB}MB) melebihi batas 5MB.`;
      logAndSetError('Validasi Foto', new Error(msg), file);
      return;
    }

    // Tahap 2: Pembacaan & Kompresi Foto
    let finalBlob: Blob = file;
    let finalMime = file.type || 'image/jpeg';

    try {
      const compressed = await compressImage(file);
      finalBlob = compressed.blob;
      finalMime = compressed.mimeType;
    } catch (compressErr: unknown) {
      // Fallback ke file asli jika canvas gagal
      logAndSetError('Kompresi Foto (Fallback ke Asli)', compressErr, file);
      finalBlob = file;
      finalMime = file.type || 'image/jpeg';
    }

    // Tahap 3: Penyimpanan Lokal ke Editor
    try {
      const mediaId = 'img_' + Math.random().toString(36).substring(2, 9);
      const mediaItem: MediaItem = {
        id: mediaId,
        name: file.name,
        type: 'image',
        mimeType: finalMime,
        blob: finalBlob,
        size: finalBlob.size,
      };

      onAttachImage(mediaId, mediaItem);

      // Verify IndexedDB availability warning
      if (typeof indexedDB === 'undefined' || !isIndexedDBSupported) {
        setStorageWarning('Media tidak bisa disimpan permanen di browser ini (disimpan di memori sesi).');
      }
    } catch (saveErr: unknown) {
      logAndSetError('Penyimpanan Foto Lokal', saveErr, file);
    }
  };

  // 2. Handle Audio Upload (100% Local)
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setStageFailed(null);
    setMicPermissionDenied(false);

    const file = e.target.files?.[0];
    if (fileInputAudioRef.current) {
      fileInputAudioRef.current.value = '';
    }

    if (!file) return;

    // Tahap 1: Validasi Ukuran
    if (file.size > MAX_AUDIO_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const msg = `Ukuran audio "${file.name}" (${sizeMB}MB) melebihi batas 10MB.`;
      logAndSetError('Validasi Audio', new Error(msg), file);
      return;
    }

    // Tahap 2: Penyimpanan Audio ke Editor
    try {
      const mediaId = 'aud_' + Math.random().toString(36).substring(2, 9);
      const mediaItem: MediaItem = {
        id: mediaId,
        name: file.name,
        type: 'audio',
        mimeType: file.type || 'audio/mpeg',
        blob: file,
        size: file.size,
      };

      onAttachAudio(mediaId, mediaItem);

      if (typeof indexedDB === 'undefined' || !isIndexedDBSupported) {
        setStorageWarning('Media tidak bisa disimpan permanen di browser ini (disimpan di memori sesi).');
      }
    } catch (saveErr: unknown) {
      logAndSetError('Penyimpanan Audio Lokal', saveErr, file);
    }
  };

  // 3. Audio Recording (MediaRecorder Chunking & onstop flow)
  const startRecording = async () => {
    setErrorMessage(null);
    setStageFailed(null);
    setMicPermissionDenied(false);

    if (typeof window === 'undefined') return;

    // Tahap 1: Validasi Ketersediaan MediaDevices
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const isIframe = window.self !== window.top;
      const msg = isIframe
        ? 'Akses mikrofon dibatasi pada jendela frame/pratinjau. Silakan buka aplikasi di Tab Baru.'
        : 'Peramban ini tidak mendukung navigator.mediaDevices.getUserMedia.';
      setMicPermissionDenied(true);
      logAndSetError('Inisialisasi Mikrofon', new Error(msg));
      return;
    }

    // Tahap 2: Validasi MediaRecorder
    if (typeof MediaRecorder === 'undefined') {
      logAndSetError(
        'Inisialisasi Perekam',
        new Error('MediaRecorder tidak didukung di browser ini. Gunakan tombol Upload.')
      );
      return;
    }

    // Tahap 3: Pemilihan MIME Type yang Didukung Browser
    const candidateMimes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/aac',
      'audio/ogg',
      'audio/wav',
    ];

    let selectedMime = '';
    if (typeof MediaRecorder.isTypeSupported === 'function') {
      for (const mime of candidateMimes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          selectedMime = mime;
          break;
        }
      }
    }

    // Tahap 4: Permintaan Akses Mikrofon & Perekaman
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      currentStreamRef.current = stream;
      audioChunksRef.current = [];

      const options = selectedMime ? { mimeType: selectedMime } : undefined;
      const recorder = options ? new MediaRecorder(stream, options) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onerror = (event: Event) => {
        const errEvent = event as unknown as { error?: { name?: string; message?: string } };
        const msg = errEvent.error?.message || 'Kesalahan pada MediaRecorder saat merekam.';
        logAndSetError('Perekaman Audio Berjalan', new Error(msg));
        stopRecording();
      };

      recorder.onstop = () => {
        try {
          const finalMime = recorder.mimeType || selectedMime || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: finalMime });

          // Matikan stream tracks agar indikator mikrofon mati
          if (currentStreamRef.current) {
            currentStreamRef.current.getTracks().forEach((track) => track.stop());
            currentStreamRef.current = null;
          }

          if (audioBlob.size === 0) {
            logAndSetError('Pemrosesan Rekaman', new Error('Hasil rekaman kosong (0 bytes).'));
            return;
          }

          if (audioBlob.size > MAX_AUDIO_SIZE) {
            logAndSetError(
              'Validasi Rekaman',
              new Error('Ukuran hasil rekaman melebihi batas 10MB.')
            );
            return;
          }

          // Masuk ke alur yang sama dengan unggah file
          const mediaId = 'aud_rec_' + Math.random().toString(36).substring(2, 9);
          const mediaItem: MediaItem = {
            id: mediaId,
            name: `Rekaman Suara (${new Date().toLocaleTimeString('id-ID')})`,
            type: 'audio',
            mimeType: finalMime,
            blob: audioBlob,
            size: audioBlob.size,
          };

          onAttachAudio(mediaId, mediaItem);

          if (typeof indexedDB === 'undefined' || !isIndexedDBSupported) {
            setStorageWarning('Media tidak bisa disimpan permanen di browser ini (disimpan di memori sesi).');
          }
        } catch (onstopErr: unknown) {
          logAndSetError('Penggabungan Blob Rekaman', onstopErr);
        }
      };

      recorder.start(200); // chunking 200ms
      setIsRecording(true);
      setRecordSeconds(0);
      timerRef.current = window.setInterval(() => {
        setRecordSeconds((sec) => sec + 1);
      }, 1000);
    } catch (micErr: unknown) {
      const e = micErr as { name?: string; message?: string };
      const errName = e.name || 'Error';

      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        setMicPermissionDenied(true);
      }
      logAndSetError('Akses Izin Mikrofon', micErr);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
      } catch (err: unknown) {
        logAndSetError('Penghentian Rekaman', err);
      }
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // 4. Audio Playback Controller
  const togglePlayAudio = () => {
    if (!audioObjectUrl) return;

    if (!audioPlayerRef.current) {
      const audio = new Audio(audioObjectUrl);
      audioPlayerRef.current = audio;
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        logAndSetError('Pemutaran Audio', new Error('Gagal memutar audio rekaman.'));
      };
    }

    const player = audioPlayerRef.current;
    if (isPlaying) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.play()
        .then(() => setIsPlaying(true))
        .catch((playErr: unknown) => {
          setIsPlaying(false);
          logAndSetError('Pemutaran Audio', playErr);
        });
    }
  };

  // Total media count calculation
  const totalMediaCount = Object.keys(mediaFiles).length;

  return (
    <div className="mt-3 p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-2.5">
      {/* Header Info */}
      <div className="flex items-center justify-between font-semibold text-stone-700">
        <span className="flex items-center gap-1.5">
          <span>Lampiran Media Lokal (100% Offline)</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </span>
        <div className="flex items-center gap-2 text-[11px] font-normal">
          <span className="text-stone-500 hidden sm:inline">Foto maks 5MB · Audio maks 10MB</span>
          <button
            type="button"
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            className="text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-0.5 cursor-pointer bg-white px-2 py-0.5 rounded border border-stone-200"
            title="Tampilkan panel diagnostik media"
          >
            <Activity className="w-3 h-3" />
            <span>Diagnostik</span>
            {showDiagnostics ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Storage Warning (if IndexedDB fallback to memory) */}
      {storageWarning && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg flex items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{storageWarning}</span>
          </div>
          <button
            type="button"
            onClick={() => setStorageWarning(null)}
            className="text-amber-700 hover:text-amber-950 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Stage Error Alert with Indonesian Message */}
      {errorMessage && (
        <div className="space-y-2">
          {micPermissionDenied ? (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-xs text-amber-900 mb-1">
                      Izin Mikrofon Ditolak atau Dibatasi Browser
                    </p>
                    <p className="text-[11px] text-stone-700 mb-1.5 leading-relaxed">
                      Cara mengaktifkan perekaman suara:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-[11px] text-stone-700 mb-2.5">
                      <li>
                        Klik ikon <strong>Gembok 🔒 / Izin Situs</strong> di bilah URL browser Anda.
                      </li>
                      <li>
                        Ubah status <strong>Mikrofon</strong> menjadi <strong>"Izinkan" (Allow)</strong>.
                      </li>
                      <li>
                        Jika Teach Arab dibuka di jendela frame pratinjau, klik <strong>Buka di Tab Baru</strong> di bawah agar browser dapat meminta izin mikrofon secara langsung.
                      </li>
                    </ol>
                    <div className="flex flex-wrap gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => window.open(window.location.href, '_blank')}
                        className="px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Buka di Tab Baru</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMicPermissionDenied(false);
                          setErrorMessage(null);
                        }}
                        className="px-2.5 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-[11px] font-medium cursor-pointer"
                      >
                        Tutup
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMicPermissionDenied(false);
                    setErrorMessage(null);
                  }}
                  className="text-stone-400 hover:text-stone-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-stone-400 hover:text-stone-700 p-1 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Media Upload & Recording Grid */}
      <div className={`grid grid-cols-1 ${allowAudio ? 'sm:grid-cols-2' : ''} gap-3`}>
        {/* Photo Box */}
        <div className="p-2.5 bg-white border border-stone-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-stone-700 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-600" /> Foto / Gambar
            </span>
            {attachedImage && (
              <button
                type="button"
                onClick={onRemoveImage}
                className="text-rose-600 hover:text-rose-700 flex items-center gap-0.5 cursor-pointer font-medium text-[11px]"
              >
                <Trash2 className="w-3 h-3" /> Hapus
              </button>
            )}
          </div>

          {attachedImage && imageObjectUrl ? (
            <div className="flex items-center gap-2.5 p-1 bg-stone-50 rounded-lg border border-stone-100">
              <img
                src={imageObjectUrl}
                alt="Thumbnail"
                className="w-12 h-12 object-cover rounded-md border border-stone-200 bg-white"
              />
              <div className="overflow-hidden flex-1 min-w-0">
                <p className="truncate font-medium text-stone-800">{attachedImage.name}</p>
                <p className="text-[10px] text-stone-500">{formatBytes(attachedImage.size)} · Tersimpan Lokal</p>
              </div>
            </div>
          ) : (
            <div>
              <input
                ref={fileInputImageRef}
                type="file"
                accept="image/png, image/jpeg, image/webp, image/gif"
                className="hidden"
                onChange={handleImageUpload}
              />
              <button
                type="button"
                onClick={() => fileInputImageRef.current?.click()}
                className="w-full py-2 px-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 border-dashed rounded-lg text-stone-600 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-stone-500" />
                <span>Pilih Foto (Maks 5MB)</span>
              </button>
            </div>
          )}
        </div>

        {/* Audio Box */}
        {allowAudio && (
          <div className="p-2.5 bg-white border border-stone-200 rounded-xl shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-stone-700 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> Audio Pelafalan
              </span>
              {attachedAudio && (
                <button
                  type="button"
                  onClick={() => {
                    if (audioPlayerRef.current) {
                      audioPlayerRef.current.pause();
                    }
                    setIsPlaying(false);
                    onRemoveAudio();
                  }}
                  className="text-rose-600 hover:text-rose-700 flex items-center gap-0.5 cursor-pointer font-medium text-[11px]"
                >
                  <Trash2 className="w-3 h-3" /> Hapus
                </button>
              )}
            </div>

            {attachedAudio && audioObjectUrl ? (
              <div className="flex items-center justify-between gap-2 p-1.5 bg-stone-50 rounded-lg border border-stone-100">
                <div className="overflow-hidden flex-1 min-w-0">
                  <p className="truncate font-medium text-stone-800">{attachedAudio.name}</p>
                  <p className="text-[10px] text-stone-500">{formatBytes(attachedAudio.size)} · Tersimpan Lokal</p>
                </div>
                <button
                  type="button"
                  onClick={togglePlayAudio}
                  className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1 cursor-pointer font-medium transition-colors shrink-0"
                >
                  {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                  <span>{isPlaying ? 'Jeda' : 'Putar'}</span>
                </button>
              </div>
            ) : (
              <div className="flex gap-1.5">
                <input
                  ref={fileInputAudioRef}
                  type="file"
                  accept="audio/mp3, audio/wav, audio/m4a, audio/webm, audio/ogg"
                  className="hidden"
                  onChange={handleAudioUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputAudioRef.current?.click()}
                  className="flex-1 py-2 px-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg text-stone-600 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  title="Upload berkas audio dari komputer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                </button>

                {isRecording ? (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="flex-1 py-2 px-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg flex items-center justify-center gap-1 cursor-pointer shadow-xs animate-pulse"
                  >
                    <Square className="w-3 h-3 fill-current" />
                    <span>Selesai ({recordSeconds}s)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="flex-1 py-2 px-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-lg flex items-center justify-center gap-1 cursor-pointer shadow-xs transition-colors"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Rekam Suara</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Panel Kecil Diagnostik Media (Collapsible per Requirement 7) */}
      {showDiagnostics && (
        <div className="mt-2 p-2.5 bg-stone-100 border border-stone-200 rounded-lg text-[11px] text-stone-700 space-y-1.5">
          <div className="flex items-center justify-between font-bold text-stone-900 border-b border-stone-200 pb-1">
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-emerald-700" />
              <span>Diagnostik Media Teach Arab</span>
            </span>
            <span className="text-[10px] text-stone-500 font-normal">Status Penyimpanan Lokal</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <div className="flex items-center justify-between bg-white px-2 py-1 rounded border border-stone-200">
              <span className="text-stone-500">Status IndexedDB:</span>
              <span className={`font-semibold flex items-center gap-1 ${isIndexedDBSupported ? 'text-emerald-700' : 'text-amber-700'}`}>
                {isIndexedDBSupported ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Tersedia & Aktif
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3 text-amber-600" /> Tidak Tersedia (Memori)
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between bg-white px-2 py-1 rounded border border-stone-200">
              <span className="text-stone-500">Jumlah Media Tersimpan:</span>
              <span className="font-semibold text-stone-800">{totalMediaCount} Berkas</span>
            </div>
          </div>

          <div className="bg-white px-2 py-1 rounded border border-stone-200">
            <div className="flex items-center justify-between text-stone-500 mb-0.5">
              <span>Error Terakhir:</span>
              {lastDiagnosticError && (
                <button
                  type="button"
                  onClick={() => setLastDiagnosticError(null)}
                  className="text-[10px] text-stone-400 hover:text-stone-700"
                >
                  Bersihkan
                </button>
              )}
            </div>
            <p className="font-mono text-[10px] text-stone-700 truncate">
              {lastDiagnosticError || 'Tidak ada error (Sistem normal)'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
