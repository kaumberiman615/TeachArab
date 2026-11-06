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
import {
  GameStartScreen,
  GameTopBar,
  GameResultScreen,
} from '../../components/game/GameShared';

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
      <GameStartScreen
        title="Susun Kalimat (تَرْتِيبُ الْجُمَلِ)"
        description="Rangkai kata-kata bahasa Arab yang teracak menjadi kalimat sempurna berarah kanan ke kiri sesuai arti petunjuknya!"
        itemCount={items.length}
        itemLabel="Soal Kalimat"
        onStart={startGame}
        isTeam={isTeam}
        teamCount={teamCount}
        teamNames={teamNames}
        extraInfo={
          <div className="bg-slate-50 border border-[#0A254D]/15 rounded-2xl p-4 text-xs text-[#0A254D] flex items-center justify-around">
            <div>
              <span className="text-[#0A254D]/60 block text-[11px] font-bold">Variasi Urutan</span>
              <strong className="text-sm font-black text-[#0A254D]">Didukung (/)</strong>
            </div>
            <div className="h-6 w-px bg-[#0A254D]/15" />
            <div>
              <span className="text-[#0A254D]/60 block text-[11px] font-bold">Arah Jawaban</span>
              <strong className="text-sm font-black text-[#00B4D8]">RTL (Kanan ➔ Kiri)</strong>
            </div>
            <div className="h-6 w-px bg-[#0A254D]/15" />
            <div>
              <span className="text-[#0A254D]/60 block text-[11px] font-bold">Interaksi</span>
              <strong className="text-sm font-black text-[#FF3B8D]">Klik / Sentuh & Drag</strong>
            </div>
          </div>
        }
      />
    );
  }

  // FINISHED SCREEN
  if (gameState === 'finished') {
    const totalPossible = runtimeItems.length * 10;

    return (
      <GameResultScreen
        title="Mumtaz! Susun Kalimat Selesai!"
        message="Luar biasa! Kamu telah berhasil menyusun seluruh kalimat bahasa Arab dengan sempurna."
        score={score}
        maxScore={totalPossible}
        scoreLabel="Poin"
        onRestart={startGame}
        isTeam={isTeam}
        teamNames={teamNames}
        teamScores={teamScores}
      />
    );
  }

  // PLAYING SCREEN
  const canonicalWords = currentItem ? getCanonicalWords(currentItem.sentenceArabic) : [];

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto space-y-5">
      <GameTopBar
        score={score}
        scoreLabel="Poin"
        roundText={`Soal ${currentIndex + 1} / ${runtimeItems.length}`}
        soundMuted={soundMuted}
        onToggleSound={() => setSoundMuted(!soundMuted)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onReset={startGame}
        isTeam={isTeam}
        teamNames={teamNames}
        teamScores={teamScores}
        currentTeamIdx={currentTeam}
      />

      {/* Main Game Card */}
      <div className="bg-white border-2 border-[#0A254D]/15 rounded-3xl p-6 sm:p-8 shadow-[0_8px_0_rgba(10,37,77,0.06)] flex flex-col items-center text-center space-y-6">
        {/* Clue / Indonesian Hint */}
        <div className="flex flex-col items-center space-y-2">
          <span className="text-xs font-black text-[#0A254D]/60 uppercase tracking-wider">Arti Kalimat:</span>
          <h3 className="text-xl sm:text-2xl font-black text-[#0A254D] max-w-xl">
            "{currentItem.translation || 'Susun kalimat bahasa Arab di bawah ini'}"
          </h3>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleSpeak}
              className="px-4 py-2 bg-[#00B4D8]/10 hover:bg-[#00B4D8]/20 text-[#00B4D8] border border-[#00B4D8]/30 text-xs font-black rounded-full flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <Volume2 className="w-4 h-4" />
              <span>Dengarkan Kalimat</span>
            </button>
            {audioUrl && (
              <audio src={audioUrl} controls className="h-8 max-w-[200px]" />
            )}
          </div>
        </div>

        {/* Answer Assembly Drop Zone (RTL direction!) */}
        <div className="w-full max-w-3xl bg-sky-50/50 border-2 border-dashed border-[#00B4D8]/40 rounded-3xl p-5 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#0A254D]/70 mb-3 px-1 font-bold">
            <span className="flex items-center gap-1.5 text-[#0A254D]">
              <span>Susunan Kalimat Jawaban</span>
              <span className="text-[10px] bg-[#00B4D8] text-white font-black px-2 py-0.5 rounded-full shadow-xs">
                RTL: Kanan ➔ Kiri
              </span>
            </span>
            <span className="text-[#0A254D]/60">
              {placedWords.length} dari {canonicalWords.length} kata tersusun
            </span>
          </div>

          {/* Placed Words Container */}
          <div
            dir="rtl"
            className="flex items-center justify-start gap-2.5 sm:gap-3 flex-wrap min-h-[76px] p-3 bg-white rounded-2xl border-2 border-[#0A254D]/10"
          >
            {placedWords.length === 0 ? (
              <div className="w-full py-4 text-xs text-[#0A254D]/40 italic text-center font-medium">
                Pilih atau ketuk kata-kata di bawah untuk mulai menyusun kalimat
              </div>
            ) : (
              placedWords.map((card, idx) => (
                <button
                  type="button"
                  key={card.uid}
                  onClick={() => handleRemovePlacedCard(idx)}
                  className={`px-4.5 py-3 rounded-2xl shadow-[0_4px_0_#0A254D] border-2 border-[#0A254D] cursor-pointer transition-all active:translate-y-1 flex items-center gap-2 select-none ${
                    isEvaluated
                      ? isCorrect
                        ? 'bg-[#10B981] text-white'
                        : 'bg-rose-50 text-rose-800'
                      : 'bg-[#00B4D8] hover:bg-[#0096b7] text-white'
                  }`}
                  title="Klik untuk mengembalikan kata ke daftar"
                >
                  <span className={`${fontClass} text-2xl sm:text-3xl font-extrabold leading-[2.2]`}>
                    {card.word}
                  </span>
                  <span className="text-[10px] opacity-80 font-mono font-bold">#{idx + 1}</span>
                </button>
              ))
            )}
          </div>

          <p className="text-[11px] text-[#0A254D]/60 mt-2.5 text-center font-medium">
            Ketuk kata di atas untuk mengembalikannya ke pilihan di bawah
          </p>
        </div>

        {/* Feedback Message Banner */}
        {feedbackMessage && (
          <div
            className={`w-full max-w-2xl p-4 rounded-2xl border-2 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 animate-in fade-in zoom-in-95 ${
              isCorrect
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
                : 'bg-rose-50 border-rose-300 text-rose-900 shadow-xs'
            }`}
          >
            {isCorrect ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap justify-center pt-1">
          {!isCorrect ? (
            <>
              <button
                type="button"
                onClick={handleCheckAnswer}
                className="px-7 py-3.5 bg-[#00B4D8] hover:bg-[#0096b7] text-white font-black rounded-2xl border-2 border-[#0A254D] shadow-[0_4px_0_#0A254D] active:translate-y-1 transition-all flex items-center gap-2 cursor-pointer text-sm"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>Periksa Kalimat</span>
              </button>

              <button
                type="button"
                onClick={handleHint}
                className="px-5 py-3.5 bg-[#FED034] hover:bg-[#e0b820] text-[#0A254D] border-2 border-[#0A254D] font-black rounded-2xl shadow-[0_4px_0_#0A254D] active:translate-y-1 transition-all flex items-center gap-1.5 cursor-pointer text-sm"
                title="Buka satu kata berikutnya"
              >
                <Lightbulb className="w-4 h-4 text-[#0A254D]" />
                <span>Petunjuk</span>
              </button>

              <button
                type="button"
                onClick={handleResetAll}
                className="px-5 py-3.5 bg-white hover:bg-stone-50 text-[#0A254D] font-black rounded-2xl border-2 border-[#0A254D] shadow-[0_3px_0_#0A254D] transition-all flex items-center gap-1.5 cursor-pointer text-sm active:translate-y-0.5"
                title="Kembalikan semua kata ke bawah"
              >
                <RotateCcw className="w-4 h-4 text-[#0A254D]/70" />
                <span>Hapus Semua</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleNextQuestion}
              className="px-9 py-3.5 bg-[#FF3B8D] hover:bg-[#e02e7b] text-white font-black rounded-2xl border-2 border-[#0A254D] shadow-[0_4px_0_#0A254D] active:translate-y-1 transition-all flex items-center gap-2 cursor-pointer text-base animate-bounce"
            >
              <span>Kalimat Berikutnya</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}
        </div>

        {/* Available Words Pool */}
        <div className="w-full max-w-3xl pt-4 border-t border-[#0A254D]/10">
          <div className="flex items-center justify-between text-xs text-[#0A254D]/70 mb-3 px-1 font-bold">
            <span className="text-[#0A254D]">Pilihan Kata (Klik / Ketuk untuk Menyusun):</span>
            <button
              type="button"
              onClick={handleReshufflePool}
              className="text-xs text-[#00B4D8] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Acak Pilihan</span>
            </button>
          </div>

          <div
            dir="rtl"
            className="flex items-center justify-center gap-2.5 sm:gap-3 flex-wrap min-h-[70px] p-3.5 bg-slate-50 rounded-3xl border-2 border-[#0A254D]/15"
          >
            {availablePool.length === 0 ? (
              <span className="text-xs text-[#0A254D]/50 italic py-2">Semua kata telah dimasukkan ke kotak jawaban</span>
            ) : (
              availablePool.map((card) => (
                <button
                  type="button"
                  key={card.uid}
                  onClick={() => handleSelectPoolCard(card)}
                  className={`px-4.5 py-3 bg-white hover:bg-pink-50/50 hover:border-[#FF3B8D] active:translate-y-1 border-2 border-[#0A254D]/15 text-[#0A254D] rounded-2xl shadow-[0_4px_0_rgba(10,37,77,0.08)] flex items-center justify-center cursor-pointer transition-all ${fontClass} text-2xl sm:text-3xl font-extrabold select-none leading-loose`}
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
