import React, { useState, useEffect, useRef } from 'react';
import { VocabPictureItem, ThemeConfig, DraftSettings, MediaItem } from '../../types';
import { getMediaUrl } from '../../utils/media';
import { removeHarakat, speakArabic } from '../../utils/arabic';
import {
  Volume2,
  VolumeX,
  LayoutGrid,
  Square,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Maximize2,
  Minimize2,
  Image as ImageIcon,
} from 'lucide-react';

interface VocabPicturePlayerProps {
  items: VocabPictureItem[];
  theme: ThemeConfig;
  settings?: DraftSettings;
  mediaFiles?: Record<string, MediaItem>;
  isProjectorMode?: boolean;
}

export default function VocabPicturePlayer({
  items = [],
  theme,
  settings,
  mediaFiles = {},
  isProjectorMode = false,
}: VocabPicturePlayerProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'single'>('single');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeSpeakingId, setActiveSpeakingId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

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

  const handlePlaySound = (item: VocabPictureItem) => {
    setActiveSpeakingId(item.id);
    const audioItem = item.mediaAudioId ? mediaFiles[item.mediaAudioId] : null;
    const audioUrl = audioItem ? getMediaUrl(audioItem) : null;

    if (audioUrl) {
      if (!audioPlayerRef.current) {
        audioPlayerRef.current = new Audio(audioUrl);
      } else {
        audioPlayerRef.current.src = audioUrl;
      }
      audioPlayerRef.current.onended = () => setActiveSpeakingId(null);
      audioPlayerRef.current.play().catch((err) => {
        console.warn('Audio play error, falling back to TTS:', err);
        speakArabic(item.arabic);
        setTimeout(() => setActiveSpeakingId(null), 1200);
      });
    } else {
      speakArabic(item.arabic);
      setTimeout(() => setActiveSpeakingId(null), 1200);
    }
  };

  // Keyboard navigation for single mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }
      if (viewMode === 'single') {
        if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
          e.preventDefault();
          if (currentIndex < items.length - 1) {
            setCurrentIndex((prev) => prev + 1);
          }
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          e.preventDefault();
          if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
          }
        } else if (e.key.toLowerCase() === 's') {
          if (items[currentIndex]) {
            handlePlaySound(items[currentIndex]);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, currentIndex, items]);

  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border-2 border-stone-200">
        <Sparkles className="w-10 h-10 text-[#00B4D8] mx-auto mb-3" />
        <h3 className="text-lg font-bold text-stone-800">Kosakata Belum Ditambahkan</h3>
        <p className="text-xs text-stone-500 mt-1">Tambahkan kosakata bergambar baru di panel editor.</p>
      </div>
    );
  }

  const currentItem = items[currentIndex] || items[0];
  const currentImage = currentItem?.mediaImageId ? mediaFiles[currentItem.mediaImageId] : null;
  const currentImageUrl = currentImage ? getMediaUrl(currentImage) : null;

  return (
    <div className="w-full flex flex-col justify-between space-y-4 select-none">
      {/* Top Controls Bar */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 px-2">
        <div className="text-xs font-black text-playful-navy flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-playful-yellow text-playful-navy border-2 border-playful-navy shadow-playful-xs">
            {items.length} Kosakata
          </span>
          {viewMode === 'single' && (
            <span className="bg-white px-3 py-1 rounded-full border-2 border-playful-navy/30">
              Kartu {currentIndex + 1} dari {items.length}
            </span>
          )}
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-full border-2 border-playful-navy shadow-playful-xs text-xs font-black">
          <button
            type="button"
            onClick={() => setViewMode('single')}
            className={`min-h-[38px] px-4 py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer transition-all ${
              viewMode === 'single'
                ? 'bg-playful-pink text-white shadow-xs'
                : 'text-playful-navy hover:bg-playful-yellow/30'
            }`}
          >
            <Square className="w-3.5 h-3.5" />
            <span>Satu Per Satu</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`min-h-[38px] px-4 py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer transition-all ${
              viewMode === 'grid'
                ? 'bg-playful-cyan text-white shadow-xs'
                : 'text-playful-navy hover:bg-playful-yellow/30'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Mode Grid</span>
          </button>
        </div>
      </div>

      {/* 1. SINGLE CARD VIEW */}
      {viewMode === 'single' && (
        <div className="space-y-4">
          <div
            onClick={() => handlePlaySound(currentItem)}
            className={`relative bg-white rounded-3xl border-3 transition-all p-6 sm:p-10 text-center shadow-playful-sm cursor-pointer group flex flex-col items-center justify-center print:border-none print:shadow-none ${
              activeSpeakingId === currentItem.id
                ? 'border-playful-pink ring-4 ring-pink-100 scale-[1.01]'
                : 'border-playful-navy hover:border-playful-cyan'
            } ${isProjectorMode ? 'min-h-[58vh]' : 'min-h-[420px]'}`}
          >
            {/* Sound indicator badge */}
            <div className="no-print absolute top-4 right-4 p-3 rounded-2xl bg-playful-yellow text-playful-navy border-2 border-playful-navy group-hover:bg-playful-pink group-hover:text-white transition-colors shadow-playful-xs">
              <Volume2
                className={`w-5 h-5 ${activeSpeakingId === currentItem.id ? 'animate-bounce' : ''}`}
              />
            </div>

            {/* Big Image */}
            <div className="mb-6 flex items-center justify-center w-full">
              {currentImageUrl ? (
                <img
                  src={currentImageUrl}
                  alt={currentItem.meaning}
                  className="max-h-60 sm:max-h-72 w-auto max-w-full rounded-2xl object-contain border-2 border-playful-navy/20 shadow-xs group-hover:scale-102 transition-transform"
                />
              ) : (
                <div className="w-48 h-48 bg-stone-50 rounded-2xl border-2 border-dashed border-playful-navy/30 flex flex-col items-center justify-center text-stone-400 gap-2">
                  <ImageIcon className="w-10 h-10 text-stone-300" />
                  <span className="text-xs font-semibold">Ketuk untuk pelafalan</span>
                </div>
              )}
            </div>

            {/* Arabic Word */}
            <div
              className={`text-4xl sm:text-6xl font-black text-playful-navy mb-2 leading-relaxed ${fontClass}`}
              dir="rtl"
            >
              {filterText(currentItem.arabic)}
            </div>

            {/* Latin */}
            {theme.showLatin && currentItem.latin && (
              <div className="text-base sm:text-lg font-semibold text-stone-500 italic mb-1">
                {currentItem.latin}
              </div>
            )}

            {/* Indonesian Meaning */}
            <div className="text-2xl sm:text-3xl font-black text-playful-navy mt-2">
              {currentItem.meaning}
            </div>

            <div className="no-print mt-4 text-xs text-stone-400 font-bold">
              Ketuk kartu untuk mendengarkan pelafalan fasih
            </div>
          </div>

          {/* Single Mode Navigation Footer */}
          <div className="no-print flex items-center justify-between px-2">
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className={`min-h-[44px] px-5 py-2.5 rounded-full text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                currentIndex === 0
                  ? 'opacity-40 cursor-not-allowed bg-stone-100 text-stone-400 border-2 border-stone-200'
                  : 'bg-white hover:bg-stone-100 text-playful-navy border-2 border-playful-navy shadow-playful-xs active:translate-y-0.5'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            {/* Speak button explicitly */}
            <button
              type="button"
              onClick={() => handlePlaySound(currentItem)}
              className="min-h-[44px] px-6 py-2.5 bg-playful-yellow hover:bg-yellow-300 text-playful-navy border-2 border-playful-navy rounded-full text-xs font-black flex items-center gap-2 shadow-playful-xs transition-all cursor-pointer active:translate-y-0.5"
            >
              <Volume2 className="w-4 h-4" />
              <span>Lafalkan (Suara)</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.min(items.length - 1, prev + 1))}
              disabled={currentIndex === items.length - 1}
              className={`min-h-[44px] px-5 py-2.5 rounded-full text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                currentIndex === items.length - 1
                  ? 'opacity-40 cursor-not-allowed bg-stone-100 text-stone-400 border-2 border-stone-200'
                  : 'bg-playful-pink hover:bg-pink-600 text-white border-2 border-playful-navy shadow-playful-xs active:translate-y-0.5'
              }`}
            >
              <span>Berikutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. GRID VIEW (All cards on 1 page) */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 print:grid-cols-3">
          {items.map((item) => {
            const imgItem = item.mediaImageId ? mediaFiles[item.mediaImageId] : null;
            const imgUrl = imgItem ? getMediaUrl(imgItem) : null;
            const isSpeaking = activeSpeakingId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => handlePlaySound(item)}
                className={`bg-white rounded-3xl border-3 p-4 text-center cursor-pointer transition-all flex flex-col justify-between group print:border-stone-300 print:shadow-none ${
                  isSpeaking
                    ? 'border-playful-pink ring-4 ring-pink-100 bg-pink-50/20'
                    : 'border-playful-navy shadow-playful-xs hover:shadow-playful-sm hover:-translate-y-0.5'
                }`}
              >
                {/* Image */}
                <div className="h-32 w-full flex items-center justify-center mb-3 overflow-hidden rounded-2xl bg-stone-50 border border-stone-100">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={item.meaning}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="text-stone-300 flex flex-col items-center gap-1">
                      <ImageIcon className="w-8 h-8" />
                      <span className="text-[10px] font-bold">Tanpa Gambar</span>
                    </div>
                  )}
                </div>

                {/* Text Block */}
                <div className="space-y-1">
                  <div
                    className={`text-2xl sm:text-3xl font-black text-playful-navy leading-snug ${fontClass}`}
                    dir="rtl"
                  >
                    {filterText(item.arabic)}
                  </div>

                  {theme.showLatin && item.latin && (
                    <div className="text-xs text-stone-500 font-medium italic truncate">{item.latin}</div>
                  )}

                  <div className="text-sm font-black text-stone-800 truncate">
                    {item.meaning}
                  </div>
                </div>

                {/* Sound button footer */}
                <div className="no-print mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-center">
                  <span className="min-h-[36px] px-3 py-1 rounded-full bg-playful-yellow/30 text-xs font-black text-playful-navy flex items-center gap-1 group-hover:bg-playful-yellow transition-colors">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Lafalkan</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
