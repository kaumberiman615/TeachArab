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
      <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
        <Sparkles className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
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
      <div className="flex items-center justify-between px-2">
        <div className="text-xs font-semibold text-stone-600 flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
            {items.length} Kosakata
          </span>
          {viewMode === 'single' && (
            <span>
              Kartu {currentIndex + 1} dari {items.length}
            </span>
          )}
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setViewMode('single')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors ${
              viewMode === 'single'
                ? 'bg-white text-emerald-800 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Square className="w-3.5 h-3.5" />
            <span>Satu Per Satu</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors ${
              viewMode === 'grid'
                ? 'bg-white text-emerald-800 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
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
            className={`relative bg-white rounded-3xl border-2 transition-all p-6 sm:p-10 text-center shadow-lg cursor-pointer group flex flex-col items-center justify-center ${
              activeSpeakingId === currentItem.id
                ? 'border-emerald-500 ring-4 ring-emerald-100'
                : 'border-stone-200 hover:border-emerald-300'
            } ${isProjectorMode ? 'min-h-[58vh]' : 'min-h-[420px]'}`}
          >
            {/* Sound indicator badge */}
            <div className="absolute top-4 right-4 p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-2xs">
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
                  className="max-h-60 sm:max-h-72 w-auto max-w-full rounded-2xl object-contain border border-stone-100 shadow-xs group-hover:scale-102 transition-transform"
                />
              ) : (
                <div className="w-48 h-48 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-400 gap-2">
                  <ImageIcon className="w-10 h-10 text-stone-300" />
                  <span className="text-xs">Ketuk untuk pelafalan</span>
                </div>
              )}
            </div>

            {/* Arabic Word */}
            <div
              className={`text-4xl sm:text-6xl font-bold text-emerald-900 mb-2 leading-relaxed ${fontClass}`}
              dir="rtl"
            >
              {filterText(currentItem.arabic)}
            </div>

            {/* Latin */}
            {theme.showLatin && currentItem.latin && (
              <div className="text-base sm:text-lg font-medium text-stone-500 italic mb-1">
                {currentItem.latin}
              </div>
            )}

            {/* Indonesian Meaning */}
            <div className="text-xl sm:text-2xl font-extrabold text-stone-900 mt-2">
              {currentItem.meaning}
            </div>

            <div className="mt-4 text-[11px] text-stone-400 font-medium">
              Ketuk kartu untuk mendengarkan pelafalan fasih
            </div>
          </div>

          {/* Single Mode Navigation Footer */}
          <div className="flex items-center justify-between px-2">
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentIndex === 0
                  ? 'opacity-40 cursor-not-allowed bg-stone-100 text-stone-400'
                  : 'bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 shadow-2xs active:scale-95'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            {/* Speak button explicitly */}
            <button
              type="button"
              onClick={() => handlePlaySound(currentItem)}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer active:scale-95"
            >
              <Volume2 className="w-4 h-4" />
              <span>Lafalkan (Suara)</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.min(items.length - 1, prev + 1))}
              disabled={currentIndex === items.length - 1}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentIndex === items.length - 1
                  ? 'opacity-40 cursor-not-allowed bg-stone-100 text-stone-400'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs active:scale-95'
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map((item, idx) => {
            const imgItem = item.mediaImageId ? mediaFiles[item.mediaImageId] : null;
            const imgUrl = imgItem ? getMediaUrl(imgItem) : null;
            const isSpeaking = activeSpeakingId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => handlePlaySound(item)}
                className={`bg-white rounded-2xl border p-4 text-center cursor-pointer transition-all hover:shadow-md flex flex-col justify-between group ${
                  isSpeaking
                    ? 'border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50/20'
                    : 'border-stone-200 hover:border-emerald-300'
                }`}
              >
                {/* Image */}
                <div className="h-32 w-full flex items-center justify-center mb-3 overflow-hidden rounded-xl bg-stone-50">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={item.meaning}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="text-stone-300 flex flex-col items-center gap-1">
                      <ImageIcon className="w-8 h-8" />
                      <span className="text-[10px]">Tanpa Gambar</span>
                    </div>
                  )}
                </div>

                {/* Text Block */}
                <div className="space-y-1">
                  <div
                    className={`text-2xl font-bold text-emerald-900 leading-snug ${fontClass}`}
                    dir="rtl"
                  >
                    {filterText(item.arabic)}
                  </div>

                  {theme.showLatin && item.latin && (
                    <div className="text-xs text-stone-500 italic truncate">{item.latin}</div>
                  )}

                  <div className="text-sm font-extrabold text-stone-900 truncate">
                    {item.meaning}
                  </div>
                </div>

                {/* Sound button footer */}
                <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-center">
                  <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 group-hover:underline">
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
