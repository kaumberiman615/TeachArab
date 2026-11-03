import React, { useState, useRef } from 'react';
import { ReadingSentence, ThemeConfig, DraftSettings, MediaItem } from '../../types';
import { getMediaUrl } from '../../utils/media';
import { removeHarakat, speakArabic } from '../../utils/arabic';
import {
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Type,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

interface ReadingPlayerProps {
  items: ReadingSentence[];
  theme: ThemeConfig;
  settings?: DraftSettings;
  mediaFiles?: Record<string, MediaItem>;
  isProjectorMode?: boolean;
}

export default function ReadingPlayer({
  items = [],
  theme,
  settings,
  mediaFiles = {},
  isProjectorMode = false,
}: ReadingPlayerProps) {
  const [activeSentenceId, setActiveSentenceId] = useState<string | null>(null);
  const [revealedTranslationIds, setRevealedTranslationIds] = useState<Set<string>>(new Set());
  const [allTranslationsVisible, setAllTranslationsVisible] = useState(false);
  const [showHarakat, setShowHarakat] = useState(theme.showHarakat !== false);
  const [fontSizeDelta, setFontSizeDelta] = useState(0); // -2, -1, 0, 1, 2, 3
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const fontClass =
    theme.fontFamily === 'Noto Naskh Arabic'
      ? 'font-noto'
      : theme.fontFamily === 'Scheherazade New'
      ? 'font-scheherazade'
      : 'font-amiri';

  const filterText = (text: string) => {
    if (!text) return '';
    return showHarakat ? text : removeHarakat(text);
  };

  const toggleSentenceTranslation = (id: string) => {
    setRevealedTranslationIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAllTranslations = () => {
    if (allTranslationsVisible) {
      setRevealedTranslationIds(new Set());
      setAllTranslationsVisible(false);
    } else {
      setRevealedTranslationIds(new Set(items.map((it) => it.id)));
      setAllTranslationsVisible(true);
    }
  };

  const handlePlaySentenceAudio = (sentence: ReadingSentence) => {
    setActiveSentenceId(sentence.id);
    const audioItem = sentence.mediaAudioId ? mediaFiles[sentence.mediaAudioId] : null;
    const audioUrl = audioItem ? getMediaUrl(audioItem) : null;

    if (audioUrl) {
      if (!audioPlayerRef.current) {
        audioPlayerRef.current = new Audio(audioUrl);
      } else {
        audioPlayerRef.current.src = audioUrl;
      }
      audioPlayerRef.current.onended = () => {
        setIsPlayingAudio(false);
      };
      setIsPlayingAudio(true);
      audioPlayerRef.current.play().catch(() => {
        speakArabic(sentence.arabic);
        setIsPlayingAudio(false);
      });
    } else {
      speakArabic(sentence.arabic);
    }
  };

  // Full reading audio if available in settings
  const fullAudioItem = settings?.fullAudioId ? mediaFiles[settings.fullAudioId] : null;
  const fullAudioUrl = fullAudioItem ? getMediaUrl(fullAudioItem) : null;

  const handlePlayFullAudio = () => {
    if (!fullAudioUrl) return;
    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio(fullAudioUrl);
    } else {
      audioPlayerRef.current.src = fullAudioUrl;
    }

    if (isPlayingAudio) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioPlayerRef.current.onended = () => setIsPlayingAudio(false);
      setIsPlayingAudio(true);
      audioPlayerRef.current.play().catch(() => setIsPlayingAudio(false));
    }
  };

  // Font size calculation
  // normal = 1.6rem, large = 2.1rem, xlarge = 2.7rem, xxlarge = 3.3rem
  const baseRem =
    theme.fontSize === 'normal'
      ? 1.5
      : theme.fontSize === 'large'
      ? 1.9
      : theme.fontSize === 'xlarge'
      ? 2.4
      : 3.0;
  const currentRem = Math.max(1.1, baseRem + fontSizeDelta * 0.25);

  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
        <BookOpen className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-stone-800">Teks Bacaan Belum Diisi</h3>
        <p className="text-xs text-stone-500 mt-1">Tambahkan kalimat qira'ah di panel editor.</p>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden border border-stone-200 bg-white shadow-lg flex flex-col justify-between ${
        isProjectorMode ? 'min-h-[75vh]' : 'min-h-[480px]'
      }`}
    >
      {/* Top Reading Toolbar */}
      <div className="px-5 py-3 border-b border-stone-200 bg-stone-50 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Sentence count & Full audio */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
            {items.length} Kalimat
          </span>

          {fullAudioUrl && (
            <button
              type="button"
              onClick={handlePlayFullAudio}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                isPlayingAudio
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlayingAudio ? 'Jeda Audio Penuh' : 'Putar Audio Lengkap'}</span>
            </button>
          )}
        </div>

        {/* Right: Controls (Harakat, Translations, Font Size) */}
        <div className="flex items-center gap-2">
          {/* Toggle Harakat */}
          <button
            type="button"
            onClick={() => setShowHarakat(!showHarakat)}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
              showHarakat
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-stone-100 text-stone-600 border-stone-200'
            }`}
            title={showHarakat ? 'Sembunyikan Harakat' : 'Tampilkan Harakat'}
          >
            {showHarakat ? 'Harakat: Aktif' : 'Harakat: Mati'}
          </button>

          {/* Toggle All Translations */}
          <button
            type="button"
            onClick={toggleAllTranslations}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer flex items-center gap-1 ${
              allTranslationsVisible
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
            }`}
          >
            {allTranslationsVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">
              {allTranslationsVisible ? 'Sembunyikan Semua Arti' : 'Tampilkan Semua Arti'}
            </span>
          </button>

          {/* Font Size Adjusters */}
          <div className="flex items-center bg-white border border-stone-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setFontSizeDelta((prev) => Math.max(-2, prev - 1))}
              className="px-2 py-1 text-xs font-bold text-stone-600 hover:bg-stone-100 cursor-pointer"
              title="Perkecil Huruf"
            >
              A-
            </button>
            <span className="px-1 text-[10px] text-stone-400">|</span>
            <button
              type="button"
              onClick={() => setFontSizeDelta((prev) => Math.min(3, prev + 1))}
              className="px-2 py-1 text-xs font-bold text-stone-600 hover:bg-stone-100 cursor-pointer"
              title="Perbesar Huruf"
            >
              A+
            </button>
          </div>
        </div>
      </div>

      {/* Main Qira'ah Reading Area */}
      <div className="flex-1 p-6 sm:p-10 overflow-y-auto space-y-4">
        {items.map((sentence, idx) => {
          const isSelected = activeSentenceId === sentence.id;
          const isTranslated =
            allTranslationsVisible || revealedTranslationIds.has(sentence.id);

          return (
            <div
              key={sentence.id}
              onClick={() => setActiveSentenceId(sentence.id)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-100 shadow-xs'
                  : 'border-stone-200 bg-white hover:border-emerald-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                {/* Sentence Number & Audio Trigger */}
                <div className="flex items-center gap-1.5 shrink-0 pt-1">
                  <span className="w-6 h-6 rounded-lg bg-stone-100 text-stone-700 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlaySentenceAudio(sentence);
                    }}
                    className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                    title="Dengarkan Pelafalan"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Arabic Text */}
                <div
                  className={`flex-1 text-right font-bold text-stone-900 leading-loose ${fontClass}`}
                  dir="rtl"
                  style={{ fontSize: `${currentRem}rem` }}
                >
                  {filterText(sentence.arabic)}
                </div>
              </div>

              {/* Translation Bar */}
              <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSentenceTranslation(sentence.id);
                  }}
                  className="text-stone-500 hover:text-emerald-700 font-medium flex items-center gap-1 cursor-pointer"
                >
                  {isTranslated ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{isTranslated ? 'Tutup Arti' : 'Lihat Terjemah'}</span>
                </button>

                {isTranslated && (
                  <div className="text-emerald-950 font-medium text-xs sm:text-sm italic animate-in fade-in pl-2">
                    {sentence.translation}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="px-6 py-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
        <span>Ketuk kalimat untuk menyorot atau tekan ikon speaker untuk pelafalan</span>
        <span>Teach Arab Qira'ah</span>
      </div>
    </div>
  );
}
