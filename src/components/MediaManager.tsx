import { useState, useRef } from 'react';
import { MediaItem } from '../types';
import { compressImage, MAX_PHOTO_SIZE, MAX_AUDIO_SIZE } from '../utils/media';
import { formatBytes } from '../services/storage';
import { Mic, Square, Play, Trash2, Image, Volume2, Upload, AlertCircle } from 'lucide-react';

interface MediaManagerProps {
  currentImageId?: string;
  currentAudioId?: string;
  mediaFiles: Record<string, MediaItem>;
  onAttachImage: (mediaId: string, mediaItem: MediaItem) => void;
  onRemoveImage: () => void;
  onAttachAudio: (mediaId: string, mediaItem: MediaItem) => void;
  onRemoveAudio: () => void;
}

export default function MediaManager({
  currentImageId,
  currentAudioId,
  mediaFiles,
  onAttachImage,
  onRemoveImage,
  onAttachAudio,
  onRemoveAudio,
}: MediaManagerProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const fileInputImageRef = useRef<HTMLInputElement>(null);
  const fileInputAudioRef = useRef<HTMLInputElement>(null);

  // Current attached items
  const attachedImage = currentImageId ? mediaFiles[currentImageId] : null;
  const attachedAudio = currentAudioId ? mediaFiles[currentAudioId] : null;

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_PHOTO_SIZE) {
      setErrorMessage(`Ukuran foto melebihi batas 5 MB (ukuran: ${formatBytes(file.size)})`);
      return;
    }

    try {
      const { blob, mimeType } = await compressImage(file);
      const mediaId = 'img_' + Math.random().toString(36).substring(2, 9);
      const mediaItem: MediaItem = {
        id: mediaId,
        name: file.name,
        type: 'image',
        mimeType,
        blob,
        size: blob.size,
      };
      onAttachImage(mediaId, mediaItem);
    } catch (err: any) {
      setErrorMessage('Gagal memproses gambar: ' + (err.message || 'Error'));
    }
  };

  // Handle audio upload
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_AUDIO_SIZE) {
      setErrorMessage(`Ukuran audio melebihi batas 10 MB (ukuran: ${formatBytes(file.size)})`);
      return;
    }

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
  };

  // Start microphone recording
  const startRecording = async () => {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Stop stream tracks
        stream.getTracks().forEach((track) => track.stop());

        const mediaId = 'aud_rec_' + Math.random().toString(36).substring(2, 9);
        const mediaItem: MediaItem = {
          id: mediaId,
          name: `Rekaman Suara (${new Date().toLocaleTimeString('id-ID')})`,
          type: 'audio',
          mimeType: 'audio/webm',
          blob: audioBlob,
          size: audioBlob.size,
        };
        onAttachAudio(mediaId, mediaItem);
      };

      recorder.start();
      setIsRecording(true);
      setRecordSeconds(0);
      timerRef.current = window.setInterval(() => {
        setRecordSeconds((sec) => sec + 1);
      }, 1000);
    } catch (err: any) {
      setErrorMessage('Tidak dapat mengakses mikrofon. Izinkan izin mikrofon di browser.');
    }
  };

  // Stop microphone recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Play audio preview
  const playAudio = (blob: Blob) => {
    if (audioPreviewUrl) {
      URL.revokeObjectURL(audioPreviewUrl);
    }
    const url = URL.createObjectURL(blob);
    setAudioPreviewUrl(url);
    const audio = new Audio(url);
    audio.play();
  };

  return (
    <div className="mt-3 p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs">
      <div className="font-semibold text-stone-700 mb-2 flex items-center justify-between">
        <span>Lampiran Media (Opsional)</span>
        <span className="text-[11px] text-stone-600 font-normal">Foto maks 5MB · Audio maks 10MB</span>
      </div>

      {errorMessage && (
        <div className="mb-2 p-2 bg-rose-50 border border-rose-200 text-rose-700 rounded flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Photo Box */}
        <div className="p-2.5 bg-white border border-stone-200 rounded-md">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-medium text-stone-700 flex items-center gap-1">
              <Image className="w-3.5 h-3.5 text-emerald-600" /> Foto / Gambar
            </span>
            {attachedImage && (
              <button
                type="button"
                onClick={onRemoveImage}
                className="text-rose-600 hover:text-rose-700 flex items-center gap-0.5 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" /> Hapus
              </button>
            )}
          </div>

          {attachedImage ? (
            <div className="flex items-center gap-2">
              <img
                src={URL.createObjectURL(attachedImage.blob)}
                alt="Pratinjau"
                className="w-12 h-12 object-cover rounded border border-stone-200"
              />
              <div className="overflow-hidden">
                <p className="truncate font-medium text-stone-800">{attachedImage.name}</p>
                <p className="text-[10px] text-stone-600">{formatBytes(attachedImage.size)}</p>
              </div>
            </div>
          ) : (
            <div>
              <input
                ref={fileInputImageRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={handleImageUpload}
              />
              <button
                type="button"
                onClick={() => fileInputImageRef.current?.click()}
                className="w-full py-1.5 px-2 bg-stone-100 hover:bg-stone-200 border border-stone-200 border-dashed rounded text-stone-600 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" /> Pilih Foto
              </button>
            </div>
          )}
        </div>

        {/* Audio Box */}
        <div className="p-2.5 bg-white border border-stone-200 rounded-md">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-medium text-stone-700 flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> Audio Pelafalan
            </span>
            {attachedAudio && (
              <button
                type="button"
                onClick={onRemoveAudio}
                className="text-rose-600 hover:text-rose-700 flex items-center gap-0.5 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" /> Hapus
              </button>
            )}
          </div>

          {attachedAudio ? (
            <div className="flex items-center justify-between gap-2">
              <div className="overflow-hidden">
                <p className="truncate font-medium text-stone-800">{attachedAudio.name}</p>
                <p className="text-[10px] text-stone-600">{formatBytes(attachedAudio.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => playAudio(attachedAudio.blob)}
                className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded flex items-center gap-1 cursor-pointer font-medium"
              >
                <Play className="w-3 h-3 fill-current" /> Putar
              </button>
            </div>
          ) : (
            <div className="flex gap-1.5">
              <input
                ref={fileInputAudioRef}
                type="file"
                accept="audio/mp3, audio/wav, audio/m4a, audio/webm"
                className="hidden"
                onChange={handleAudioUpload}
              />
              <button
                type="button"
                onClick={() => fileInputAudioRef.current?.click()}
                className="flex-1 py-1.5 px-2 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded text-stone-600 flex items-center justify-center gap-1 cursor-pointer"
              >
                <Upload className="w-3 h-3" /> Upload
              </button>

              {isRecording ? (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="flex-1 py-1.5 px-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Square className="w-3 h-3" /> Berhenti ({recordSeconds}s)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Mic className="w-3 h-3" /> Rekam Suara
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
