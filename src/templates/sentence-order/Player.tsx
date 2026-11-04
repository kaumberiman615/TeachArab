import React, { useState, useEffect } from 'react';
import { SentenceOrderItem, MediaItem, ThemeConfig, DraftSettings } from '../../types';
import { splitArabicSentenceWords, speakArabic } from '../../utils/arabic';
import { soundManager } from '../../utils/sound';
import { getMediaUrl } from '../../utils/media';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Play,
  Trophy,
  Users,
  ArrowRight,
  Shuffle,
  Lightbulb,
  Sparkles,
  Trash2,
} from 'lucide-react';

interface SentenceOrderPlayerProps {
  items: SentenceOrderItem[];
  theme: ThemeConfig;
  settings: DraftSettings;
  mediaFiles: Record<string, MediaItem>;
  isProjectorMode?: boolean;
}

interface WordCard {
  uid: string;
  word: string;
  originalIndex: number;
}

export default function SentenceOrderPlayer({
  items,
  theme,
  settings,
  mediaFiles,
  isProjectorMode = false,
}: SentenceOrderPlayerProps) {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'finished'>('start');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [soundMuted, setSoundMuted] = useState(!theme.soundEnabled);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Runtime items (can be filtered or shuffled)
  const [runtimeItems, setRuntimeItems] = useState<SentenceOrderItem[]>([]);

  // Current item's word cards
  const [availablePool, setAvailablePool] = useState<WordCard[]>([]);
  const [placedWords, setPlacedWords] = useState<WordCard[]>([]);

  // Verification state
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Team mode
  const isTeam = settings.teamMode;
  const teamCount = settings.teamCount || 2;
  const teamNames = settings.teamNames || ['Tim Merah', 'Tim Biru', 'Tim Hijau', 'Tim Kuning'].slice(0, teamCount);
  const [currentTeam, setCurrentTeam] = useState(0);
  const [teamScores, setTeamScores] = useState<number[]>(Array(teamCount).fill(0));

  const fontClass =
    theme.fontFamily === 'Amiri'
      ? 'font-amiri'
      : theme.fontFamily === 'Scheherazade New'
      ? 'font-scheherazade'
      : 'font-naskh';

  const currentItem = runtimeItems[currentIndex] || items[0];

  // Parse valid sentences from sentenceArabic (supports multiple variations separated by '/')
  const getValidSentenceStrings = (raw: string): string[] => {
    if (!raw) return [];
    return raw
      .split('/')
      .map((part) => part.trim().split(/\s+/).filter(Boolean).join(' '))
      .filter((s) => s.length > 0);
  };

  // Get canonical first target sentence words
  const getCanonicalWords = (raw: string): string[] => {
    if (!raw) return [];
    const firstOption = raw.split('/')[0] || '';
    return splitArabicSentenceWords(firstOption);
  };

  // Start game
  const startGame = () => {
    let list = [...items].filter((item) => item.sentenceArabic && item.sentenceArabic.trim().length > 0);
    if (list.length === 0) list = [...items];
    if (settings.sentenceShuffle !== false) {
      list = list.sort(() => Math.random() - 0.5);
    }
    setRuntimeItems(list);
    setCurrentIndex(0);
    setScore(0);
    setCurrentTeam(0);
    setTeamScores(Array(teamCount).fill(0));
    setGameState('playing');
  };

  // Setup words for current item
  const setupWordsForItem = (item: SentenceOrderItem) => {
    if (!item || !item.sentenceArabic) return;
    const words = getCanonicalWords(item.sentenceArabic);
    const cards: WordCard[] = words.map((w, idx) => ({
      uid: `${item.id}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      word: w,
      originalIndex: idx,
    }));

    // Scramble cards for available pool
    const scrambled = [...cards].sort(() => Math.random() - 0.5);
    setAvailablePool(scrambled);
    setPlacedWords([]);
    setIsEvaluated(false);
    setIsCorrect(false);
    setFeedbackMessage(null);
  };

  useEffect(() => {
    if (gameState === 'playing' && runtimeItems.length > 0) {
      setupWordsForItem(runtimeItems[currentIndex]);
    }
  }, [gameState, currentIndex, runtimeItems]);

  // Handle click on card in available pool (place into placedWords)
  const handleSelectPoolCard = (card: WordCard) => {
    if (isEvaluated && isCorrect) return;
    if (soundMuted === false) soundManager.playClick();

    setAvailablePool((prev) => prev.filter((c) => c.uid !== card.uid));
    setPlacedWords((prev) => [...prev, card]);

    setIsEvaluated(false);
    setFeedbackMessage(null);
  };

  // Handle click on card in placedWords (return to availablePool)
  const handleRemovePlacedCard = (cardIndex: number) => {
    if (isEvaluated && isCorrect) return;
    const card = placedWords[cardIndex];
    if (!card) return;

    if (soundMuted === false) soundManager.playClick();

    setPlacedWords((prev) => prev.filter((_, idx) => idx !== cardIndex));
    setAvailablePool((prev) => [...prev, card]);

    setIsEvaluated(false);
    setFeedbackMessage(null);
  };

  // Reset all placed cards back to pool
  const handleResetAll = () => {
    if (isEvaluated && isCorrect) return;
    if (soundMuted === false) soundManager.playClick();
    setupWordsForItem(currentItem);
  };

  // Reshuffle available pool
  const handleReshufflePool = () => {
    if (isEvaluated && isCorrect) return;
    if (soundMuted === false) soundManager.playClick();
    setAvailablePool((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  // Hint button: places next correct word into placedWords
  const handleHint = () => {
    if (isEvaluated && isCorrect || !currentItem) return;
    const canonical = getCanonicalWords(currentItem.sentenceArabic);

    const nextIndexNeeded = placedWords.length;
    if (nextIndexNeeded >= canonical.length) return;

    const neededWord = canonical[nextIndexNeeded];

    // Find card with matching word in availablePool
    const matchIdx = availablePool.findIndex((c) => c.word === neededWord);
    if (matchIdx !== -1) {
      const card = availablePool[matchIdx];
      setAvailablePool((prev) => prev.filter((_, i) => i !== matchIdx));
      setPlacedWords((prev) => [...prev, card]);
      if (soundMuted === false) soundManager.playClick();
    }
  };

  // Check answer
  const handleCheckAnswer = () => {
    if (!currentItem) return;
    const canonical = getCanonicalWords(currentItem.sentenceArabic);

    if (placedWords.length < canonical.length) {
      setFeedbackMessage('Letakkan semua kata terlebih dahulu sebelum memeriksa.');
      setIsEvaluated(true);
      setIsCorrect(false);
      if (soundMuted === false) soundManager.playWrong();
      return;
    }

    const assembled = placedWords.map((c) => c.word.trim()).join(' ');
    const validVariants = getValidSentenceStrings(currentItem.sentenceArabic);

    const matches = validVariants.some((v) => v === assembled);

    setIsEvaluated(true);
    setIsCorrect(matches);

    if (matches) {
      if (soundMuted === false) soundManager.playCorrect();
      setScore((s) => s + 10);
      if (isTeam) {
        setTeamScores((prev) => {
          const next = [...prev];
          next[currentTeam] = (next[currentTeam] || 0) + 10;
          return next;
        });
      }
      setFeedbackMessage('Mumtaz! Susunan kalimat bahasa Arab sudah tepat! 🎉');
    } else {
      if (soundMuted === false) soundManager.playWrong();
      setFeedbackMessage('Urutan kalimat belum tepat. Susunlah kata dari kanan ke kiri.');
    }
  };

  // Advance to next question
  const handleNextQuestion = () => {
    if (currentIndex + 1 < runtimeItems.length) {
      setCurrentIndex((i) => i + 1);
      if (isTeam) {
        setCurrentTeam((t) => (t + 1) % teamCount);
      }
    } else {
      setGameState('finished');
    }
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Speak sentence
  const handleSpeak = () => {
    if (currentItem?.sentenceArabic) {
      const firstVariant = currentItem.sentenceArabic.split('/')[0] || '';
      speakArabic(firstVariant);
    }
  };

  const audioUrl = currentItem?.mediaAudioId ? getMediaUrl(mediaFiles[currentItem.mediaAudioId]) : null;

  // START SCREEN
  if (gameState === 'start') {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto my-auto min-h-[460px]">
        <div className="w-20 h-20 bg-indigo-100 text-indigo-700 rounded-3xl flex items-center justify-center mb-6 shadow-inner animate-bounce">
          <Sparkles className="w-10 h-10" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mb-2">
          Game Susun Kalimat (تَرْتِيبُ الْجُمَلِ)
        </h1>
        <p className="text-stone-600 text-sm leading-relaxed mb-6 max-w-md">
          Rangkai kata-kata bahasa Arab yang teracak menjadi kalimat sempurna berarah kanan ke kiri sesuai arti petunjuknya!
        </p>

        {isTeam && (
          <div className="w-full bg-indigo-50 border border-indigo-200 rounded-2xl p-4 mb-6 text-left">
            <div className="flex items-center gap-2 font-bold text-xs text-indigo-900 mb-2 uppercase tracking-wider">
              <Users className="w-4 h-4 text-indigo-700" />
              <span>Kompetisi Mode Tim ({teamCount} Tim)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {teamNames.map((name, i) => (
                <div key={i} className="bg-white p-2 rounded-lg border border-indigo-100 font-semibold text-stone-800">
                  {name}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 w-full mb-6 text-xs text-stone-600 flex items-center justify-around">
          <div>
            <span className="text-stone-400 block text-[11px]">Jumlah Kalimat</span>
            <strong className="text-sm font-bold text-stone-900">{items.length} Soal</strong>
          </div>
          <div className="h-6 w-px bg-stone-200" />
          <div>
            <span className="text-stone-400 block text-[11px]">Variasi Urutan</span>
            <strong className="text-sm font-bold text-stone-900">Didukung (/)</strong>
          </div>
          <div className="h-6 w-px bg-stone-200" />
          <div>
            <span className="text-stone-400 block text-[11px]">Kontrol</span>
            <strong className="text-sm font-bold text-stone-900">Klik / Sentuh & Drag</strong>
          </div>
        </div>

        <button
          type="button"
          onClick={startGame}
          className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all text-base"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Mulai Bermain</span>
        </button>
      </div>
    );
  }

  // FINISHED SCREEN
  if (gameState === 'finished') {
    const totalPossible = runtimeItems.length * 10;
    const pct = Math.round((score / totalPossible) * 100) || 0;

    return (
      <div className="flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto my-auto min-h-[460px]">
        <div className="w-20 h-20 bg-amber-100 text-amber-700 rounded-3xl flex items-center justify-center mb-4 shadow-sm animate-bounce">
          <Trophy className="w-10 h-10" />
        </div>

        <h2 className="text-2xl font-extrabold text-stone-900 mb-1">Permainan Selesai!</h2>
        <p className="text-xs text-stone-500 mb-6">Mumtaz! Kamu telah menyusun seluruh kalimat dengan baik.</p>

        {isTeam ? (
          <div className="w-full bg-white border border-stone-200 rounded-2xl p-5 mb-6 shadow-xs">
            <h3 className="font-bold text-xs uppercase tracking-wider text-stone-400 mb-3">Papan Skor Tim</h3>
            <div className="space-y-2">
              {teamNames.map((name, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200"
                >
                  <span className="font-bold text-sm text-stone-800">{name}</span>
                  <span className="font-extrabold text-base text-indigo-700">{teamScores[idx]} Poin</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full bg-indigo-50 border border-indigo-200 rounded-2xl p-6 mb-6">
            <div className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1">Skor Akhir</div>
            <div className="text-4xl font-black text-indigo-700 mb-1">
              {score} <span className="text-lg font-medium text-indigo-400">/ {totalPossible}</span>
            </div>
            <div className="text-xs font-semibold text-indigo-800">Tingkat Ketepatan: {pct}%</div>
          </div>
        )}

        <button
          type="button"
          onClick={startGame}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Mainkan Lagi</span>
        </button>
      </div>
    );
  }

  // PLAYING SCREEN
  const canonicalWords = currentItem ? getCanonicalWords(currentItem.sentenceArabic) : [];

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto space-y-4">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between bg-white border border-stone-200 rounded-2xl p-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-indigo-50 text-indigo-800 rounded-xl text-xs font-bold border border-indigo-100">
            Soal {currentIndex + 1} / {runtimeItems.length}
          </div>
          {isTeam && (
            <div className="px-3 py-1 bg-amber-50 text-amber-900 rounded-xl text-xs font-bold border border-amber-200 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-700" />
              <span>Giliran: {teamNames[currentTeam]}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-100">
            Skor: {score}
          </div>
          <button
            type="button"
            onClick={() => setSoundMuted(!soundMuted)}
            className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-600 cursor-pointer"
            title={soundMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          </button>
          {!isProjectorMode && (
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-600 cursor-pointer"
              title="Layar Penuh"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Main Game Card */}
      <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-8 shadow-xs flex flex-col items-center text-center space-y-6">
        {/* Clue / Indonesian Hint */}
        <div className="flex flex-col items-center space-y-2">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Arti Kalimat:</span>
          <h3 className="text-lg sm:text-xl font-bold text-stone-900 max-w-xl">
            {currentItem.translation || 'Susun kalimat bahasa Arab di bawah ini'}
          </h3>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleSpeak}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Dengarkan Kalimat</span>
            </button>
            {audioUrl && (
              <audio src={audioUrl} controls className="h-8 max-w-[200px]" />
            )}
          </div>
        </div>

        {/* Answer Assembly Drop Zone (RTL direction!) */}
        <div className="w-full max-w-3xl bg-stone-50 border-2 border-dashed border-indigo-200 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-3 px-1">
            <span className="font-semibold flex items-center gap-1 text-indigo-900">
              <span>Susunan Kalimat Jawaban</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">RTL: Kanan ➔ Kiri</span>
            </span>
            <span className="text-stone-400">
              {placedWords.length} dari {canonicalWords.length} kata tersusun
            </span>
          </div>

          {/* Placed Words Container */}
          <div
            dir="rtl"
            className="flex items-center justify-start gap-2 sm:gap-3 flex-wrap min-h-[72px] p-2 bg-white rounded-xl border border-stone-200"
          >
            {placedWords.length === 0 ? (
              <div className="w-full py-4 text-xs text-stone-400 italic text-center">
                Pilih atau ketuk kata-kata di bawah untuk mulai menyusun kalimat
              </div>
            ) : (
              placedWords.map((card, idx) => (
                <button
                  type="button"
                  key={card.uid}
                  onClick={() => handleRemovePlacedCard(idx)}
                  className={`px-4 py-2.5 rounded-xl shadow-xs border-2 cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 select-none ${
                    isEvaluated
                      ? isCorrect
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-500'
                  }`}
                  title="Klik untuk mengembalikan kata ke daftar"
                >
                  <span className={`${fontClass} text-xl sm:text-2xl font-bold leading-none`}>
                    {card.word}
                  </span>
                  <span className="text-[10px] opacity-75 font-mono">#{idx + 1}</span>
                </button>
              ))
            )}
          </div>

          <p className="text-[11px] text-stone-400 mt-2 text-center">
            Ketuk kata di atas untuk mengembalikannya ke pilihan di bawah
          </p>
        </div>

        {/* Feedback Message Banner */}
        {feedbackMessage && (
          <div
            className={`w-full max-w-2xl p-3.5 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 animate-fadeIn ${
              isCorrect
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {isCorrect ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
          {!isCorrect ? (
            <>
              <button
                type="button"
                onClick={handleCheckAnswer}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer text-xs sm:text-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Periksa Kalimat</span>
              </button>

              <button
                type="button"
                onClick={handleHint}
                className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer text-xs sm:text-sm"
                title="Buka satu kata berikutnya"
              >
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span>Petunjuk</span>
              </button>

              <button
                type="button"
                onClick={handleResetAll}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer text-xs sm:text-sm"
                title="Kembalikan semua kata ke bawah"
              >
                <RotateCcw className="w-4 h-4 text-stone-500" />
                <span>Hapus Semua</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleNextQuestion}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer text-sm animate-pulse"
            >
              <span>Kalimat Berikutnya</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Available Words Pool */}
        <div className="w-full max-w-3xl pt-4 border-t border-stone-100">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-3 px-1">
            <span className="font-semibold text-stone-700">Pilihan Kata (Klik / Ketuk untuk Menyusun):</span>
            <button
              type="button"
              onClick={handleReshufflePool}
              className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Shuffle className="w-3 h-3" />
              <span>Acak Pilihan</span>
            </button>
          </div>

          <div
            dir="rtl"
            className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap min-h-[64px] p-3 bg-stone-50 rounded-2xl border border-stone-200"
          >
            {availablePool.length === 0 ? (
              <span className="text-xs text-stone-400 italic py-2">Semua kata telah dimasukkan ke kotak jawaban</span>
            ) : (
              availablePool.map((card) => (
                <button
                  type="button"
                  key={card.uid}
                  onClick={() => handleSelectPoolCard(card)}
                  className={`px-4 py-2.5 bg-white hover:bg-indigo-50 hover:border-indigo-300 active:scale-95 border-2 border-stone-200 text-stone-900 rounded-xl shadow-xs flex items-center justify-center cursor-pointer transition-all ${fontClass} text-xl sm:text-2xl font-bold select-none`}
                  title="Klik untuk menaruh ke kotak jawaban"
                >
                  {card.word}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
