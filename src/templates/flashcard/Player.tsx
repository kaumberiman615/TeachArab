import { useState, useEffect } from 'react';
import { FlashcardItem, MediaItem, ThemeConfig } from '../../types';
import { removeHarakat, speakArabic } from '../../utils/arabic';
import { soundManager } from '../../utils/sound';
import { Volume2, ChevronLeft, ChevronRight, Shuffle, RotateCcw, Maximize2, Minimize2, Eye, EyeOff } from 'lucide-react';

import { getMediaUrl } from '../../utils/media';

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
    if (!items || items.length === 0) return;
    soundManager.playClick();
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    if (!items || items.length === 0) return;
    soundManager.playClick();
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
  };

  const handleFlip = () => {
    if (!items || items.length === 0) return;
    soundManager.playClick();
    setIsFlipped(!isFlipped);
  };

  const handleShuffle = () => {
    if (!items || items.length === 0) return;
    soundManager.playClick();
    setIsFlipped(false);
    const randomIndex = Math.floor(Math.random() * items.length);
    setCurrentIndex(randomIndex);
  };

  // Keyboard controls (Space = flip, ArrowLeft = prev, ArrowRight = next)
  useEffect(() => {
    if (!items || items.length === 0) return;
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
  }, [isFlipped, currentIndex, items?.length]);

  const safeIndex = items && items.length > 0 ? Math.min(currentIndex, items.length - 1) : 0;
  const currentItem = items && items.length > 0 ? items[safeIndex] : null;

  if (!items || items.length === 0 || !currentItem) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border-2 border-dashed border-stone-200 flex flex-col items-center justify-center space-y-3 min-h-[360px]">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center text-3xl font-black">
          🃏
        </div>
        <h3 className="text-lg font-black text-[#0A254D]">Belum Ada Kartu</h3>
        <p className="text-stone-500 text-xs sm:text-sm max-w-sm">
          Belum ada kartu untuk ditampilkan dalam pratinjau. Tambah kartu di editor atau gunakan Bantuan AI untuk membuat kosakata otomatis.
        </p>
      </div>
    );
  }

  // Media preview urls
  const currentImage = currentItem.mediaImageId ? mediaFiles[currentItem.mediaImageId] : null;
  const currentAudio = currentItem.mediaAudioId ? mediaFiles[currentItem.mediaAudioId] : null;

  const playRecordedAudio = () => {
    const audioUrl = getMediaUrl(currentAudio);
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  const textToDisplay = showHarakat ? currentItem.arabic : removeHarakat(currentItem.arabic);

  return (
    <div className={`flex flex-col select-none text-navy-deep ${isProjectorMode ? 'max-w-4xl mx-auto py-4' : 'w-full'}`}>
      {/* Top Bar Controls */}
      <div className="bg-white border-2 border-stone-200 rounded-2xl p-2.5 sm:p-3 px-4 shadow-xs flex items-center justify-between gap-2.5 mb-3 text-xs">
        <div className="font-black text-navy-deep bg-stone-100 px-3.5 py-1.5 rounded-full border border-stone-200">
          🃏 Kartu {currentIndex + 1} dari {items.length}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowHarakat(!showHarakat)}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-full border font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
              showHarakat ? 'bg-cyan-ice text-cyan-bubble border-cyan-bubble/40 shadow-xs' : 'bg-white text-stone-600 border-stone-200'
            }`}
            title="Tampilkan / Sembunyikan Harakat"
          >
            {showHarakat ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Harakat</span>
          </button>

          <button
            type="button"
            onClick={() => setShowLatin(!showLatin)}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-full border font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
              showLatin ? 'bg-cyan-ice text-cyan-bubble border-cyan-bubble/40 shadow-xs' : 'bg-white text-stone-600 border-stone-200'
            }`}
            title="Tampilkan / Sembunyikan Teks Latin"
          >
            {showLatin ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Latin</span>
          </button>

          <button
            type="button"
            onClick={handleShuffle}
            className="w-10 h-10 flex items-center justify-center bg-stone-100 hover:bg-stone-200 text-navy-deep rounded-full transition-colors cursor-pointer"
            title="Acak Urutan Kartu"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="w-10 h-10 flex items-center justify-center bg-stone-100 hover:bg-stone-200 text-navy-deep rounded-full transition-colors cursor-pointer"
            title="Layar Penuh Proyektor"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden mb-5 shadow-inner">
        <div
          className="bg-cyan-bubble h-full rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
        />
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={handleFlip}
        className="perspective-1000 w-full h-[370px] sm:h-[430px] cursor-pointer mb-6"
      >
        <div
          className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT FACE: ARABIC */}
          <div className="absolute inset-0 backface-hidden bg-white border-2 border-stone-200 hover:border-yellow-bubble rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-between text-center shadow-lg transition-colors">
            <div className="w-full flex justify-between items-center text-xs text-stone-500 font-bold">
              <span className="px-3 py-1 bg-yellow-bubble/20 text-navy-deep border border-yellow-bubble/50 rounded-full text-[11px] font-black">
                BAHASA ARAB
              </span>
              <span className="text-[11px] bg-stone-100 px-3 py-1 rounded-full text-stone-600 font-medium hidden sm:inline">
                Ketuk kartu atau tekan Spasi untuk membalik ↺
              </span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center my-auto">
              {getMediaUrl(currentImage) && (
                <img
                  src={getMediaUrl(currentImage)!}
                  alt="Ilustrasi"
                  className="max-h-28 sm:max-h-36 max-w-full object-contain mb-4 rounded-2xl shadow-xs border border-stone-100"
                />
              )}

              <div
                className={`arabic-text ${fontClass} ${fontSizeClass} font-black text-navy-deep leading-relaxed`}
              >
                {textToDisplay}
              </div>

              {showLatin && currentItem.latin && (
                <div className="text-base sm:text-lg text-stone-600 italic font-bold mt-2">
                  {currentItem.latin}
                </div>
              )}
            </div>

            {/* Pronunciation triggers */}
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => speakArabic(currentItem.arabic)}
                className="min-h-[40px] px-4 py-2 bg-cyan-ice hover:bg-cyan-bubble hover:text-white text-cyan-bubble border border-cyan-bubble/30 rounded-full text-xs font-black flex items-center gap-2 cursor-pointer transition-colors shadow-2xs"
              >
                <Volume2 className="w-4 h-4" />
                <span>Bacakan (TTS)</span>
              </button>

              {currentAudio && (
                <button
                  type="button"
                  onClick={playRecordedAudio}
                  className="min-h-[40px] px-4 py-2 bg-stone-100 hover:bg-stone-200 text-navy-deep border border-stone-200 rounded-full text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Volume2 className="w-4 h-4 text-cyan-bubble" />
                  <span>Audio Guru</span>
                </button>
              )}
            </div>
          </div>

          {/* BACK FACE: MEANING & EXPLANATION */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-cyan-ice/70 border-2 border-cyan-bubble/40 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-between text-center shadow-lg">
            <div className="w-full flex justify-between items-center text-xs font-bold">
              <span className="px-3 py-1 bg-cyan-bubble text-white rounded-full text-[11px] font-black">
                ARTI KATA
              </span>
              <span className="text-[11px] bg-white/80 px-3 py-1 rounded-full text-cyan-bubble font-semibold">
                Ketuk untuk kembali ke teks Arab
              </span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center my-auto">
              <div className="text-3xl sm:text-4xl md:text-5xl font-black text-navy-deep mb-2">
                {currentItem.meaning}
              </div>

              {currentItem.notes && (
                <div className="mt-3 p-3.5 bg-white/95 border border-cyan-bubble/20 rounded-2xl max-w-md text-xs sm:text-sm text-stone-700 shadow-xs font-medium">
                  {currentItem.notes}
                </div>
              )}

              <div
                className={`arabic-text ${fontClass} text-2xl text-cyan-bubble font-bold mt-4`}
              >
                {textToDisplay}
              </div>
            </div>

            <div className="text-xs text-stone-500 font-semibold">
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
          className="min-h-[46px] px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-navy-deep font-bold border-2 border-stone-200 rounded-full flex items-center gap-2 text-xs sm:text-sm cursor-pointer shadow-xs transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Sebelumnya
        </button>

        <button
          type="button"
          onClick={handleFlip}
          className="min-h-[46px] px-7 py-2.5 bg-pink-bubble hover:bg-pink-bubble/90 active:translate-y-0.5 active:shadow-none text-white font-black rounded-full flex items-center gap-2 text-xs sm:text-sm cursor-pointer shadow-[0_3px_0_#D81B60] transition-all"
        >
          <RotateCcw className="w-4 h-4" /> Balik Kartu
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="min-h-[46px] px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-navy-deep font-bold border-2 border-stone-200 rounded-full flex items-center gap-2 text-xs sm:text-sm cursor-pointer shadow-xs transition-colors"
        >
          Selanjutnya <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
