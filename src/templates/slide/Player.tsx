import React, { useState, useEffect, useRef } from 'react';
import { SlideItem, ThemeConfig, DraftSettings, MediaItem } from '../../types';
import { getMediaUrl } from '../../utils/media';
import { removeHarakat, speakArabic } from '../../utils/arabic';
import {
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  FileText,
  Video,
  X,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

interface SlidePlayerProps {
  items: SlideItem[];
  theme: ThemeConfig;
  settings?: DraftSettings;
  mediaFiles?: Record<string, MediaItem>;
  isProjectorMode?: boolean;
}

export default function SlidePlayer({
  items = [],
  theme,
  settings,
  mediaFiles = {},
  isProjectorMode = false,
}: SlidePlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Swipe handling
  const touchStartXRef = useRef<number | null>(null);

  // Safe current slide
  const currentSlide: SlideItem | undefined = items[currentIndex];

  const fontClass =
    theme.fontFamily === 'Noto Naskh Arabic'
      ? 'font-noto'
      : theme.fontFamily === 'Scheherazade New'
      ? 'font-scheherazade'
      : 'font-amiri';

  const filterText = (text: string) => {
    if (!text) return '';
    return theme.showHarakat ? text : removeHarakat(text);
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      stopAudio();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      stopAudio();
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlayingAudio(false);
  };

  const handlePlayAudio = () => {
    if (!currentSlide) return;
    const audioItem = currentSlide.mediaAudioId ? mediaFiles[currentSlide.mediaAudioId] : null;
    const audioUrl = audioItem ? getMediaUrl(audioItem) : null;

    if (audioUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl);
        audioRef.current.onended = () => setIsPlayingAudio(false);
      } else {
        audioRef.current.src = audioUrl;
      }

      if (isPlayingAudio) {
        audioRef.current.pause();
        setIsPlayingAudio(false);
      } else {
        audioRef.current.play().catch((err) => console.warn('Audio play error:', err));
        setIsPlayingAudio(true);
      }
    } else {
      // Fallback: Speak title or Arabic content using TTS
      speakArabic(currentSlide.title);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key.toLowerCase() === 'n') {
        setShowNotes((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, items.length]);

  // Touch Swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // Swiped left -> next
        handleNext();
      } else {
        // Swiped right -> prev
        handlePrev();
      }
    }
    touchStartXRef.current = null;
  };

  // Helper for YouTube embed
  const getYouTubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    try {
      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      return match ? `https://www.youtube.com/embed/${match[1]}` : null;
    } catch {
      return null;
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
        <Sparkles className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-stone-800">Slide Belum Ditambahkan</h3>
        <p className="text-xs text-stone-500 mt-1">Tambahkan slide materi baru di panel editor.</p>
      </div>
    );
  }

  const currentImage = currentSlide?.mediaImageId ? mediaFiles[currentSlide.mediaImageId] : null;
  const imageUrl = currentImage ? getMediaUrl(currentImage) : null;

  const currentVideo = currentSlide?.mediaVideoId ? mediaFiles[currentSlide.mediaVideoId] : null;
  const videoUrl = currentVideo ? getMediaUrl(currentVideo) : null;
  const youtubeEmbedUrl = getYouTubeEmbedUrl(currentSlide?.youtubeUrl);

  const hasAudio = Boolean(currentSlide?.mediaAudioId && mediaFiles[currentSlide.mediaAudioId]);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`relative w-full rounded-3xl overflow-hidden border-3 border-playful-navy bg-white shadow-playful-sm flex flex-col justify-between transition-all select-none print:border-none print:shadow-none ${
        isProjectorMode ? 'min-h-[75vh] sm:min-h-[82vh]' : 'min-h-[520px]'
      }`}
    >
      {/* Top Slide Meta Bar */}
      <div className="no-print px-5 py-3 border-b-2 border-playful-navy/15 flex items-center justify-between bg-stone-50/90 backdrop-blur-xs">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-black bg-playful-yellow text-playful-navy border-2 border-playful-navy shadow-playful-xs">
            Slide {currentIndex + 1} / {items.length}
          </span>
          {hasAudio && (
            <span className="text-xs font-bold text-playful-navy bg-playful-cyan/20 border border-playful-navy/30 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-playful-cyan" /> Audio Tersedia
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Button */}
          <button
            type="button"
            onClick={handlePlayAudio}
            className={`min-h-[44px] px-3.5 py-2 rounded-full border-2 border-playful-navy text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-playful-xs active:translate-y-0.5 ${
              isPlayingAudio
                ? 'bg-playful-pink text-white'
                : 'bg-white hover:bg-playful-yellow/20 text-playful-navy'
            }`}
            title="Putar Audio / Lafalkan"
          >
            {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isPlayingAudio ? 'Jeda' : 'Audio'}</span>
          </button>

          {/* Teacher Notes Toggle Button */}
          {currentSlide?.teacherNotes && (
            <button
              type="button"
              onClick={() => setShowNotes(!showNotes)}
              className={`min-h-[44px] px-3.5 py-2 rounded-full border-2 border-playful-navy text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-playful-xs active:translate-y-0.5 ${
                showNotes
                  ? 'bg-playful-yellow text-playful-navy'
                  : 'bg-white hover:bg-stone-100 text-playful-navy'
              }`}
              title="Catatan Guru (Tekan 'N')"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Catatan Guru</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Slide Content Canvas */}
      <div className="flex-1 p-6 sm:p-10 flex flex-col justify-center">
        {/* 1. BIG TITLE LAYOUT */}
        {currentSlide?.layout === 'big-title' && (
          <div className="text-center max-w-3xl mx-auto space-y-6 my-auto">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-3xl mx-auto flex items-center justify-center shadow-xs">
              <Sparkles className="w-8 h-8" />
            </div>

            <h2
              className={`text-3xl sm:text-5xl font-extrabold text-stone-900 tracking-tight leading-relaxed ${fontClass}`}
              dir="auto"
            >
              {filterText(currentSlide.title)}
            </h2>

            {currentSlide.content && (
              <p
                className="text-stone-600 text-base sm:text-xl leading-relaxed whitespace-pre-line max-w-2xl mx-auto"
                dir="auto"
              >
                {filterText(currentSlide.content)}
              </p>
            )}

            {imageUrl && (
              <div className="pt-4">
                <img
                  src={imageUrl}
                  alt={currentSlide.title}
                  className="max-h-56 mx-auto rounded-2xl object-contain border border-stone-200 shadow-sm"
                />
              </div>
            )}
          </div>
        )}

        {/* 2. IMAGE LEFT / TEXT RIGHT LAYOUT */}
        {currentSlide?.layout === 'image-left' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center max-w-5xl mx-auto w-full">
            <div className="md:col-span-5 flex justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={currentSlide.title}
                  className="max-h-80 w-full object-contain rounded-2xl border border-stone-200 shadow-sm"
                />
              ) : youtubeEmbedUrl ? (
                <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-sm border border-stone-200">
                  <iframe
                    src={youtubeEmbedUrl}
                    title="YouTube video"
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              ) : videoUrl ? (
                <video
                  src={videoUrl}
                  controls
                  className="w-full max-h-80 rounded-2xl border border-stone-200"
                />
              ) : (
                <div className="w-full h-48 bg-stone-100 rounded-2xl border border-dashed border-stone-300 flex items-center justify-center text-xs text-stone-400">
                  Gambar belum diunggah
                </div>
              )}
            </div>

            <div className="md:col-span-7 space-y-4">
              <h2
                className={`text-2xl sm:text-3xl font-extrabold text-stone-900 leading-snug ${fontClass}`}
                dir="auto"
              >
                {filterText(currentSlide.title)}
              </h2>
              <div
                className="text-stone-700 text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-2"
                dir="auto"
              >
                {filterText(currentSlide.content)}
              </div>
            </div>
          </div>
        )}

        {/* 3. IMAGE RIGHT / TEXT LEFT LAYOUT */}
        {currentSlide?.layout === 'image-right' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center max-w-5xl mx-auto w-full">
            <div className="md:col-span-7 space-y-4 order-2 md:order-1">
              <h2
                className={`text-2xl sm:text-3xl font-extrabold text-stone-900 leading-snug ${fontClass}`}
                dir="auto"
              >
                {filterText(currentSlide.title)}
              </h2>
              <div
                className="text-stone-700 text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-2"
                dir="auto"
              >
                {filterText(currentSlide.content)}
              </div>
            </div>

            <div className="md:col-span-5 flex justify-center order-1 md:order-2">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={currentSlide.title}
                  className="max-h-80 w-full object-contain rounded-2xl border border-stone-200 shadow-sm"
                />
              ) : youtubeEmbedUrl ? (
                <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-sm border border-stone-200">
                  <iframe
                    src={youtubeEmbedUrl}
                    title="YouTube video"
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-stone-100 rounded-2xl border border-dashed border-stone-300 flex items-center justify-center text-xs text-stone-400">
                  Gambar belum diunggah
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. IMAGE FULL LAYOUT */}
        {currentSlide?.layout === 'image-full' && (
          <div className="max-w-4xl mx-auto w-full flex flex-col items-center space-y-4">
            <h2
              className={`text-xl sm:text-2xl font-bold text-stone-900 text-center ${fontClass}`}
              dir="auto"
            >
              {filterText(currentSlide.title)}
            </h2>

            {imageUrl ? (
              <img
                src={imageUrl}
                alt={currentSlide.title}
                className="max-h-[50vh] sm:max-h-[55vh] w-auto max-w-full rounded-2xl object-contain border border-stone-200 shadow-md"
              />
            ) : youtubeEmbedUrl ? (
              <div className="w-full max-w-2xl aspect-video rounded-2xl overflow-hidden shadow-sm border border-stone-200">
                <iframe
                  src={youtubeEmbedUrl}
                  title="YouTube video"
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            ) : null}

            {currentSlide.content && (
              <p
                className="text-xs sm:text-sm text-stone-600 text-center max-w-xl mx-auto whitespace-pre-line"
                dir="auto"
              >
                {filterText(currentSlide.content)}
              </p>
            )}
          </div>
        )}

        {/* 5. TEXT ONLY LAYOUT (Default) */}
        {(!currentSlide?.layout || currentSlide.layout === 'text-only') && (
          <div className="max-w-3xl mx-auto w-full space-y-5 my-auto">
            <h2
              className={`text-2xl sm:text-4xl font-extrabold text-stone-900 leading-snug text-center border-b border-stone-100 pb-4 ${fontClass}`}
              dir="auto"
            >
              {filterText(currentSlide.title)}
            </h2>

            <div
              className="text-stone-700 text-sm sm:text-lg leading-relaxed whitespace-pre-line space-y-3 bg-stone-50/50 p-6 rounded-2xl border border-stone-100"
              dir="auto"
            >
              {filterText(currentSlide.content)}
            </div>

            {/* Optional video below if present */}
            {youtubeEmbedUrl && (
              <div className="max-w-lg mx-auto aspect-video rounded-2xl overflow-hidden shadow-xs border border-stone-200 mt-4">
                <iframe
                  src={youtubeEmbedUrl}
                  title="YouTube video"
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Teacher Notes Drawer / Box */}
      {showNotes && currentSlide?.teacherNotes && (
        <div className="no-print mx-6 mb-4 p-4 bg-amber-50 border-2 border-playful-navy rounded-2xl text-xs text-amber-950 flex items-start justify-between gap-3 shadow-playful-xs animate-in fade-in slide-in-from-bottom-2">
          <div className="space-y-1">
            <div className="font-black flex items-center gap-1.5 text-playful-navy">
              <FileText className="w-4 h-4 text-playful-pink" />
              <span>Catatan Guru untuk Slide Ini:</span>
            </div>
            <p className="leading-relaxed whitespace-pre-line text-stone-700 font-medium">
              {currentSlide.teacherNotes}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowNotes(false)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-stone-600 hover:text-playful-navy hover:bg-amber-100 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bottom Navigation Toolbar */}
      <div className="no-print px-6 py-4 bg-stone-50 border-t-2 border-playful-navy/15 flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`min-h-[44px] px-5 py-2.5 rounded-full text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
            currentIndex === 0
              ? 'opacity-40 cursor-not-allowed text-stone-400 bg-stone-100 border-2 border-stone-200'
              : 'bg-white hover:bg-stone-100 text-playful-navy border-2 border-playful-navy shadow-playful-xs active:translate-y-0.5'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Sebelumnya</span>
        </button>

        {/* Dots indicator */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-[200px] sm:max-w-xs px-2 py-1">
          {items.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setCurrentIndex(idx);
                stopAudio();
              }}
              className={`h-3 rounded-full transition-all cursor-pointer border border-playful-navy ${
                idx === currentIndex
                  ? 'w-7 bg-playful-navy shadow-xs'
                  : 'w-3 bg-playful-yellow hover:bg-playful-pink'
              }`}
              title={`Buka slide ${idx + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleNext}
          disabled={currentIndex === items.length - 1}
          className={`min-h-[44px] px-5 py-2.5 rounded-full text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
            currentIndex === items.length - 1
              ? 'opacity-40 cursor-not-allowed text-stone-400 bg-stone-100 border-2 border-stone-200'
              : 'bg-playful-pink hover:bg-pink-600 text-white border-2 border-playful-navy shadow-playful-xs active:translate-y-0.5'
          }`}
        >
          <span>Berikutnya</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
