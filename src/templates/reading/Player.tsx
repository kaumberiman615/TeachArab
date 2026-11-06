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
      <div className="bg-white rounded-3xl p-12 text-center border-2 border-stone-200">
        <BookOpen className="w-10 h-10 text-[#00B4D8] mx-auto mb-3" />
        <h3 className="text-lg font-bold text-stone-800">Teks Bacaan Belum Diisi</h3>
        <p className="text-xs text-stone-500 mt-1">Tambahkan kalimat qira'ah di panel editor.</p>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden border-3 border-playful-navy bg-white shadow-playful-sm flex flex-col justify-between print:border-none print:shadow-none ${
        isProjectorMode ? 'min-h-[75vh]' : 'min-h-[480px]'
      }`}
    >
      {/* Top Reading Toolbar */}
      <div className="no-print px-5 py-3 border-b-2 border-playful-navy/15 bg-stone-50 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Sentence count & Full audio */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-black bg-playful-yellow text-playful-navy border-2 border-playful-navy shadow-playful-xs">
            {items.length} Kalimat
          </span>

          {fullAudioUrl && (
            <button
              type="button"
              onClick={handlePlayFullAudio}
              className={`min-h-[44px] px-4 py-2 rounded-full text-xs font-black flex items-center gap-2 cursor-pointer transition-all border-2 border-playful-navy shadow-playful-xs active:translate-y-0.5 ${
                isPlayingAudio
                  ? 'bg-playful-pink text-white'
                  : 'bg-playful-cyan text-white hover:bg-cyan-500'
              }`}
            >
              {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlayingAudio ? 'Jeda Audio' : 'Putar Audio Lengkap'}</span>
            </button>
          )}
        </div>

        {/* Right: Controls (Harakat, Translations, Font Size) */}
        <div className="flex items-center gap-2">
          {/* Toggle Harakat */}
          <button
            type="button"
            onClick={() => setShowHarakat(!showHarakat)}
            className={`min-h-[44px] px-3.5 py-2 text-xs font-black rounded-full border-2 border-playful-navy transition-all cursor-pointer shadow-playful-xs active:translate-y-0.5 ${
              showHarakat
                ? 'bg-playful-yellow text-playful-navy'
                : 'bg-white text-stone-600 hover:bg-stone-100'
            }`}
            title={showHarakat ? 'Sembunyikan Harakat' : 'Tampilkan Harakat'}
          >
            {showHarakat ? 'Harakat: Aktif' : 'Harakat: Mati'}
          </button>

          {/* Toggle All Translations */}
          <button
            type="button"
            onClick={toggleAllTranslations}
            className={`min-h-[44px] px-3.5 py-2 text-xs font-black rounded-full border-2 border-playful-navy transition-all cursor-pointer flex items-center gap-1.5 shadow-playful-xs active:translate-y-0.5 ${
              allTranslationsVisible
                ? 'bg-playful-pink text-white'
                : 'bg-white text-playful-navy hover:bg-stone-100'
            }`}
          >
            {allTranslationsVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="hidden sm:inline">
              {allTranslationsVisible ? 'Tutup Semua Arti' : 'Lihat Semua Arti'}
            </span>
          </button>

          {/* Font Size Adjusters */}
          <div className="flex items-center bg-white border-2 border-playful-navy rounded-full overflow-hidden shadow-playful-xs">
            <button
              type="button"
              onClick={() => setFontSizeDelta((prev) => Math.max(-2, prev - 1))}
              className="min-h-[44px] px-3 py-2 text-xs font-black text-playful-navy hover:bg-playful-yellow/30 cursor-pointer"
              title="Perkecil Huruf"
            >
              A-
            </button>
            <span className="text-xs font-black text-playful-navy/30">|</span>
            <button
              type="button"
              onClick={() => setFontSizeDelta((prev) => Math.min(3, prev + 1))}
              className="min-h-[44px] px-3 py-2 text-xs font-black text-playful-navy hover:bg-playful-yellow/30 cursor-pointer"
              title="Perbesar Huruf"
            >
              A+
            </button>
          </div>
        </div>
      </div>

      {/* Main Qira'ah Reading Area */}
      <div className="flex-1 p-6 sm:p-10 overflow-y-auto space-y-4 print:p-0 print:space-y-6">
        {items.map((sentence, idx) => {
          const isSelected = activeSentenceId === sentence.id;
          const isTranslated =
            allTranslationsVisible || revealedTranslationIds.has(sentence.id);

          return (
            <div
              key={sentence.id}
              onClick={() => setActiveSentenceId(sentence.id)}
              className={`p-4 sm:p-6 rounded-3xl border-3 transition-all cursor-pointer print:border-stone-300 print:shadow-none ${
                isSelected
                  ? 'border-playful-pink bg-pink-50/30 ring-4 ring-pink-100 shadow-playful-xs'
                  : 'border-playful-navy bg-white hover:border-playful-cyan shadow-playful-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                {/* Sentence Number & Audio Trigger */}
                <div className="no-print flex items-center gap-1.5 shrink-0 pt-1">
                  <span className="w-8 h-8 rounded-full bg-playful-yellow text-playful-navy border-2 border-playful-navy text-xs font-black flex items-center justify-center shadow-2xs">
                    {idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlaySentenceAudio(sentence);
                    }}
                    className="min-w-[44px] min-h-[44px] rounded-full text-playful-navy hover:bg-playful-yellow/30 flex items-center justify-center transition-colors cursor-pointer"
                    title="Dengarkan Pelafalan"
                  >
                    <Volume2 className="w-5 h-5 text-playful-pink" />
                  </button>
                </div>

                {/* Print only number */}
                <span className="hidden print:inline-block font-bold mr-2 text-stone-700">
                  {idx + 1}.
                </span>

                {/* Arabic Text */}
                <div
                  className={`flex-1 text-right font-black text-playful-navy leading-loose ${fontClass}`}
                  dir="rtl"
                  style={{ fontSize: `${currentRem}rem` }}
                >
                  {filterText(sentence.arabic)}
                </div>
              </div>

              {/* Translation Bar */}
              <div className="mt-3 pt-3 border-t border-stone-200 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSentenceTranslation(sentence.id);
                  }}
                  className="no-print text-stone-500 hover:text-playful-navy font-bold flex items-center gap-1.5 cursor-pointer py-1"
                >
                  {isTranslated ? <EyeOff className="w-4 h-4 text-playful-pink" /> : <Eye className="w-4 h-4 text-playful-cyan" />}
                  <span>{isTranslated ? 'Tutup Arti' : 'Lihat Terjemah'}</span>
                </button>

                {isTranslated && (
                  <div className="text-playful-navy font-bold text-xs sm:text-sm italic animate-in fade-in pl-2">
                    {sentence.translation}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="no-print px-6 py-3 bg-stone-50 border-t-2 border-playful-navy/15 flex items-center justify-between text-xs text-stone-500 font-bold">
        <span>Ketuk kalimat untuk menyorot atau tekan ikon speaker untuk pelafalan</span>
        <span className="text-playful-navy font-black">Teach Arab Qira'ah</span>
      </div>
    </div>
  );
}
