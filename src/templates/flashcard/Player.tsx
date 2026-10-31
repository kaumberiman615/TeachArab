import { useState, useEffect } from 'react';
import { FlashcardItem, MediaItem, ThemeConfig } from '../../types';
import { removeHarakat, speakArabic } from '../../utils/arabic';
import { soundManager } from '../../utils/sound';
import { Volume2, ChevronLeft, ChevronRight, Shuffle, RotateCcw, Maximize2, Minimize2, Eye, EyeOff } from 'lucide-react';

interface FlashcardPlayerProps {
  items: FlashcardItem[];
  theme: ThemeConfig;
  mediaFiles: Record<string, MediaItem>;
  isProjectorMode?: boolean;
}

export default function FlashcardPlayer({
  items,
  theme,
  mediaFiles,
  isProjectorMode = false,
}: FlashcardPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHarakat, setShowHarakat] = useState(theme.showHarakat);
  const [showLatin, setShowLatin] = useState(theme.showLatin);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync theme changes
  useEffect(() => {
    setShowHarakat(theme.showHarakat);
    setShowLatin(theme.showLatin);
  }, [theme.showHarakat, theme.showLatin]);

  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
        <p className="text-stone-500 font-medium">Belum ada kosakata untuk ditampilkan.</p>
      </div>
    );
  }

  const currentItem = items[currentIndex];

  const fontClass =
    theme.fontFamily === 'Noto Naskh Arabic'
      ? 'font-noto'
      : theme.fontFamily === 'Scheherazade New'
      ? 'font-scheherazade'
      : 'font-amiri';

  const fontSizeClass =
    theme.fontSize === 'normal'
      ? 'text-3xl sm:text-4xl'
      : theme.fontSize === 'large'
      ? 'text-4xl sm:text-5xl'
      : theme.fontSize === 'xlarge'
      ? 'text-5xl sm:text-6xl'
      : 'text-6xl sm:text-7xl';

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleNext = () => {
    soundManager.playClick();
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    soundManager.playClick();
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
  };

  const handleFlip = () => {
    soundManager.playClick();
    setIsFlipped(!isFlipped);
  };

  const handleShuffle = () => {
    soundManager.playClick();
    setIsFlipped(false);
    const randomIndex = Math.floor(Math.random() * items.length);
    setCurrentIndex(randomIndex);
  };

  // Keyboard controls (Space = flip, ArrowLeft = prev, ArrowRight = next)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, currentIndex, items.length]);

  // Media preview urls
  const currentImage = currentItem.mediaImageId ? mediaFiles[currentItem.mediaImageId] : null;
  const currentAudio = currentItem.mediaAudioId ? mediaFiles[currentItem.mediaAudioId] : null;

  const playRecordedAudio = () => {
    if (currentAudio?.blob) {
      const url = URL.createObjectURL(currentAudio.blob);
      const audio = new Audio(url);
      audio.play();
    }
  };

  const textToDisplay = showHarakat ? currentItem.arabic : removeHarakat(currentItem.arabic);

  return (
    <div className={`flex flex-col select-none ${isProjectorMode ? 'max-w-4xl mx-auto py-4' : 'w-full'}`}>
      {/* Top Bar Controls */}
      <div className="flex items-center justify-between gap-2 mb-3 text-xs">
        <div className="font-semibold text-stone-600 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200">
          Kartu {currentIndex + 1} dari {items.length}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowHarakat(!showHarakat)}
            className={`px-2.5 py-1.5 rounded-lg border font-medium flex items-center gap-1 cursor-pointer transition-colors ${
              showHarakat ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-white text-stone-600 border-stone-200'
            }`}
            title="Tampilkan / Sembunyikan Harakat"
          >
            {showHarakat ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Harakat</span>
          </button>

          <button
            type="button"
            onClick={() => setShowLatin(!showLatin)}
            className={`px-2.5 py-1.5 rounded-lg border font-medium flex items-center gap-1 cursor-pointer transition-colors ${
              showLatin ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-white text-stone-600 border-stone-200'
            }`}
            title="Tampilkan / Sembunyikan Teks Latin"
          >
            {showLatin ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Latin</span>
          </button>

          <button
            type="button"
            onClick={handleShuffle}
            className="p-1.5 bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-lg cursor-pointer transition-colors"
            title="Acak Kartu"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-lg cursor-pointer transition-colors"
            title="Layar Penuh Proyektor"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden mb-4">
        <div
          className="bg-emerald-600 h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
        />
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={handleFlip}
        className="perspective-1000 w-full h-[360px] sm:h-[420px] cursor-pointer mb-6"
      >
        <div
          className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT FACE: ARABIC */}
          <div className="absolute inset-0 backface-hidden bg-white border-2 border-stone-200 hover:border-emerald-300 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-between text-center shadow-md transition-colors">
            <div className="w-full flex justify-between items-center text-xs text-stone-400">
              <span>Bahasa Arab</span>
              <span className="text-[11px] bg-stone-100 px-2 py-0.5 rounded text-stone-600">
                Ketuk kartu atau tekan Spasi untuk membalik
              </span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center my-auto">
              {currentImage && (
                <img
                  src={URL.createObjectURL(currentImage.blob)}
                  alt="Ilustrasi"
                  className="max-h-28 sm:max-h-36 max-w-full object-contain mb-4 rounded-lg shadow-2xs"
                />
              )}

              <div
                className={`arabic-text ${fontClass} ${fontSizeClass} font-bold text-emerald-800 leading-loose`}
              >
                {textToDisplay}
              </div>

              {showLatin && currentItem.latin && (
                <div className="text-base sm:text-lg text-stone-600 italic font-medium mt-2">
                  {currentItem.latin}
                </div>
              )}
            </div>

            {/* Pronunciation triggers */}
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => speakArabic(currentItem.arabic)}
                className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                <Volume2 className="w-4 h-4 text-emerald-600" />
                <span>Bacakan (TTS)</span>
              </button>

              {currentAudio && (
                <button
                  type="button"
                  onClick={playRecordedAudio}
                  className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  <span>Audio Guru</span>
                </button>
              )}
            </div>
          </div>

          {/* BACK FACE: MEANING & EXPLANATION */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-emerald-50/80 border-2 border-emerald-300 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-between text-center shadow-md">
            <div className="w-full flex justify-between items-center text-xs text-emerald-800 font-semibold">
              <span>Arti & Keterangan</span>
              <span className="text-[11px] bg-white px-2 py-0.5 rounded text-emerald-700">
                Ketuk untuk kembali ke teks Arab
              </span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center my-auto">
              <div className="text-3xl sm:text-4xl font-extrabold text-stone-900 mb-2">
                {currentItem.meaning}
              </div>

              {currentItem.notes && (
                <div className="mt-3 p-3 bg-white/90 border border-emerald-200 rounded-xl max-w-md text-xs sm:text-sm text-stone-700 shadow-2xs">
                  {currentItem.notes}
                </div>
              )}

              <div
                className={`arabic-text ${fontClass} text-2xl text-emerald-700 font-bold mt-4`}
              >
                {textToDisplay}
              </div>
            </div>

            <div className="text-xs text-emerald-800 font-medium">
              Gunakan tombol panah di bawah atau keyboard (← / →)
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={handlePrev}
          className="px-4 py-2.5 bg-white hover:bg-stone-100 text-stone-700 font-semibold border border-stone-300 rounded-xl flex items-center gap-1.5 text-xs sm:text-sm cursor-pointer shadow-xs transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Sebelumnya
        </button>

        <button
          type="button"
          onClick={handleFlip}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 text-xs sm:text-sm cursor-pointer shadow-md transition-all active:scale-95"
        >
          <RotateCcw className="w-4 h-4" /> Balik Kartu
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="px-4 py-2.5 bg-white hover:bg-stone-100 text-stone-700 font-semibold border border-stone-300 rounded-xl flex items-center gap-1.5 text-xs sm:text-sm cursor-pointer shadow-xs transition-colors"
        >
          Selanjutnya <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
