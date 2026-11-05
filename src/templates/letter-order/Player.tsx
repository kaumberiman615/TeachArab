import React, { useState, useEffect, useRef } from 'react';
import { LetterOrderItem, MediaItem, ThemeConfig, DraftSettings } from '../../types';
import { splitArabicWordLetters, removeHarakat, speakArabic } from '../../utils/arabic';
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
  HelpCircle,
  Play,
  Trophy,
  Users,
  ArrowRight,
  Shuffle,
  Lightbulb,
  Sparkles,
} from 'lucide-react';
import {
  GameStartScreen,
  GameTopBar,
  GameResultScreen,
} from '../../components/game/GameShared';

interface LetterOrderPlayerProps {
  items: LetterOrderItem[];
  theme: ThemeConfig;
  settings: DraftSettings;
  mediaFiles: Record<string, MediaItem>;
  isProjectorMode?: boolean;
}

interface LetterCard {
  uid: string; // unique id per letter instance
  letter: string; // letter with its harakat
  originalIndex: number;
}

export default function LetterOrderPlayer({
  items,
  theme,
  settings,
  mediaFiles,
  isProjectorMode = false,
}: LetterOrderPlayerProps) {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'finished'>('start');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [soundMuted, setSoundMuted] = useState(!theme.soundEnabled);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Runtime items (can be filtered or shuffled)
  const [runtimeItems, setRuntimeItems] = useState<LetterOrderItem[]>([]);

  // Current item's letter cards
  // availablePool: letters waiting to be placed
  const [availablePool, setAvailablePool] = useState<LetterCard[]>([]);
  // placedLetters: array of placed letters in RTL order (index 0 is 1st letter of Arabic word)
  const [placedLetters, setPlacedLetters] = useState<(LetterCard | null)[]>([]);

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

  // Dragging state
  const [draggedCardUid, setDraggedCardUid] = useState<string | null>(null);

  const fontClass =
    theme.fontFamily === 'Amiri'
      ? 'font-amiri'
      : theme.fontFamily === 'Scheherazade New'
      ? 'font-scheherazade'
      : 'font-naskh';

  const ignoreHarakat = settings.letterIgnoreHarakat ?? false;

  const currentItem = runtimeItems[currentIndex] || items[0];

  // Start game
  const startGame = () => {
    let list = [...items].filter((item) => item.arabic && item.arabic.trim().length > 0);
    if (list.length === 0) list = [...items];
    if (settings.letterShuffle !== false) {
      list = list.sort(() => Math.random() - 0.5);
    }
    setRuntimeItems(list);
    setCurrentIndex(0);
    setScore(0);
    setCurrentTeam(0);
    setTeamScores(Array(teamCount).fill(0));
    setGameState('playing');
  };

  // Setup letters for current item
  const setupLettersForItem = (item: LetterOrderItem) => {
    if (!item || !item.arabic) return;
    const letters = splitArabicWordLetters(item.arabic);
    const cards: LetterCard[] = letters.map((l, idx) => ({
      uid: `${item.id}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      letter: l,
      originalIndex: idx,
    }));

    // Scramble cards for available pool
    const scrambled = [...cards].sort(() => Math.random() - 0.5);
    setAvailablePool(scrambled);
    setPlacedLetters(new Array(letters.length).fill(null));
    setIsEvaluated(false);
    setIsCorrect(false);
    setFeedbackMessage(null);
  };

  useEffect(() => {
    if (gameState === 'playing' && runtimeItems.length > 0) {
      setupLettersForItem(runtimeItems[currentIndex]);
    }
  }, [gameState, currentIndex, runtimeItems]);

  // Handle click on card in available pool (place into first empty slot)
  const handleSelectPoolCard = (card: LetterCard) => {
    if (isEvaluated && isCorrect) return;
    if (soundMuted === false) soundManager.playClick();

    // Find first empty slot in placedLetters
    const emptySlotIdx = placedLetters.findIndex((slot) => slot === null);
    if (emptySlotIdx === -1) return; // All slots full

    // Remove from available pool
    setAvailablePool((prev) => prev.filter((c) => c.uid !== card.uid));

    // Place into slot
    setPlacedLetters((prev) => {
      const next = [...prev];
      next[emptySlotIdx] = card;
      return next;
    });

    setIsEvaluated(false);
    setFeedbackMessage(null);
  };

  // Handle click on placed letter card (return back to pool)
  const handleRemovePlacedCard = (slotIndex: number) => {
    if (isEvaluated && isCorrect) return;
    const card = placedLetters[slotIndex];
    if (!card) return;

    if (soundMuted === false) soundManager.playClick();

    // Return to available pool
    setAvailablePool((prev) => [...prev, card]);

    // Empty this slot
    setPlacedLetters((prev) => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });

    setIsEvaluated(false);
    setFeedbackMessage(null);
  };

  // Reshuffle all placed cards back to pool
  const handleResetToPool = () => {
    if (isEvaluated && isCorrect) return;
    if (soundMuted === false) soundManager.playClick();
    setupLettersForItem(currentItem);
  };

  // Hint button: reveals / places the next correct letter in correct slot
  const handleHint = () => {
    if (isEvaluated && isCorrect) return;
    if (!currentItem) return;

    const targetLetters = splitArabicWordLetters(currentItem.arabic);

    // Find first slot that is empty or incorrect
    let targetSlotIdx = -1;
    for (let i = 0; i < targetLetters.length; i++) {
      const placed = placedLetters[i];
      if (!placed || placed.letter !== targetLetters[i]) {
        targetSlotIdx = i;
        break;
      }
    }

    if (targetSlotIdx === -1) return; // already all correct

    // If there was a card in that slot, return it to pool
    const existing = placedLetters[targetSlotIdx];
    let poolWithExisting = availablePool;
    if (existing) {
      poolWithExisting = [...availablePool, existing];
    }

    // Find card with matching letter in poolWithExisting
    const neededLetter = targetLetters[targetSlotIdx];
    const matchIdx = poolWithExisting.findIndex((c) =>
      ignoreHarakat
        ? removeHarakat(c.letter) === removeHarakat(neededLetter)
        : c.letter === neededLetter
    );

    if (matchIdx !== -1) {
      const matchedCard = poolWithExisting[matchIdx];
      const nextPool = [...poolWithExisting];
      nextPool.splice(matchIdx, 1);

      setAvailablePool(nextPool);
      setPlacedLetters((prev) => {
        const next = [...prev];
        next[targetSlotIdx] = matchedCard;
        return next;
      });

      if (soundMuted === false) soundManager.playClick();
    }
  };

  // Check answer
  const handleCheckAnswer = () => {
    if (!currentItem) return;
    const targetLetters = splitArabicWordLetters(currentItem.arabic);

    // Check if all slots filled
    const allFilled = placedLetters.every((slot) => slot !== null);
    if (!allFilled) {
      setFeedbackMessage('Letakkan semua huruf pada kotak jawaban terlebih dahulu!');
      setIsEvaluated(true);
      setIsCorrect(false);
      if (soundMuted === false) soundManager.playWrong();
      return;
    }

    const assembledWord = placedLetters.map((c) => c!.letter).join('');
    const targetWord = currentItem.arabic.trim();

    const matches = ignoreHarakat
      ? removeHarakat(assembledWord) === removeHarakat(targetWord)
      : assembledWord === targetWord;

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
      setFeedbackMessage('Benar! Susunan huruf sangat tepat! 🎉');
    } else {
      if (soundMuted === false) soundManager.playWrong();
      setFeedbackMessage('Susunan belum tepat. Periksa kembali urutan huruf dari kanan ke kiri.');
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

  // Media URLs
  const imageUrl = currentItem?.mediaImageId ? getMediaUrl(mediaFiles[currentItem.mediaImageId]) : null;
  const audioUrl = currentItem?.mediaAudioId ? getMediaUrl(mediaFiles[currentItem.mediaAudioId]) : null;

  // Speak word
  const handleSpeak = () => {
    if (currentItem?.arabic) {
      speakArabic(currentItem.arabic);
    }
  };

  // START SCREEN
  if (gameState === 'start') {
    return (
      <GameStartScreen
        title="Susun Huruf (تَرْتِيبُ الْحُرُوفِ)"
        description="Susun kartu-kartu huruf hijaiyah yang teracak agar membentuk kata bahasa Arab yang tepat dari arah kanan ke kiri!"
        itemCount={items.length}
        itemLabel="Kata Arab"
        onStart={startGame}
        isTeam={isTeam}
        teamCount={teamCount}
        teamNames={teamNames}
        extraInfo={
          <div className="bg-slate-50 border border-[#0A254D]/15 rounded-2xl p-4 text-xs text-[#0A254D] flex items-center justify-around">
            <div>
              <span className="text-[#0A254D]/60 block text-[11px] font-bold">Cek Harakat</span>
              <strong className="text-sm font-black text-[#0A254D]">
                {ignoreHarakat ? 'Abaikan Harakat' : 'Wajib Teliti'}
              </strong>
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
        title="Mumtaz! Susun Huruf Selesai!"
        message="Hebat sekali! Kamu telah berhasil menyusun seluruh teka-teki kata bahasa Arab."
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
  const targetLetters = currentItem ? splitArabicWordLetters(currentItem.arabic) : [];

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto space-y-5">
      <GameTopBar
        score={score}
        scoreLabel="Poin"
        roundText={`Kata ${currentIndex + 1} / ${runtimeItems.length}`}
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
        {/* Clue / Hint Section */}
        <div className="flex flex-col items-center space-y-2">
          {imageUrl && (
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border-2 border-[#0A254D]/10 shadow-xs mb-2 bg-slate-50 flex items-center justify-center">
              <img src={imageUrl} alt="Ilustrasi kata" className="w-full h-full object-contain p-2" />
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#0A254D]/60 uppercase tracking-wider">Arti / Petunjuk:</span>
            <h3 className="text-xl sm:text-2xl font-black text-[#0A254D]">{currentItem.meaning || 'Susun huruf'}</h3>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleSpeak}
              className="px-4 py-2 bg-[#00B4D8]/10 hover:bg-[#00B4D8]/20 text-[#00B4D8] border border-[#00B4D8]/30 text-xs font-black rounded-full flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <Volume2 className="w-4 h-4" />
              <span>Dengarkan Pelafalan</span>
            </button>
            {audioUrl && (
              <audio src={audioUrl} controls className="h-8 max-w-[200px]" />
            )}
          </div>
        </div>

        {/* Answer Assembly Drop Zone (RTL direction!) */}
        <div className="w-full max-w-2xl bg-sky-50/50 border-2 border-dashed border-[#00B4D8]/40 rounded-3xl p-5 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#0A254D]/70 mb-3 px-1 font-bold">
            <span className="flex items-center gap-1.5 text-[#0A254D]">
              <span>Kotak Jawaban</span>
              <span className="text-[10px] bg-[#00B4D8] text-white font-black px-2 py-0.5 rounded-full shadow-xs">
                RTL: Kanan ➔ Kiri
              </span>
            </span>
            <span className="text-[#0A254D]/60">
              {placedLetters.filter(Boolean).length} dari {targetLetters.length} huruf terisi
            </span>
          </div>

          {/* Slots container with RTL direction */}
          <div
            dir="rtl"
            className="flex items-center justify-center gap-2.5 sm:gap-4 flex-wrap min-h-[80px]"
          >
            {placedLetters.map((card, slotIdx) => (
              <div
                key={`slot_${slotIdx}`}
                onClick={() => handleRemovePlacedCard(slotIdx)}
                className={`relative w-14 h-16 sm:w-16 sm:h-20 rounded-2xl flex items-center justify-center transition-all cursor-pointer select-none ${
                  card
                    ? isEvaluated
                      ? isCorrect
                        ? 'bg-emerald-500 text-white shadow-[0_4px_0_#059669] border-2 border-emerald-600 scale-102'
                        : 'bg-rose-50 text-rose-700 border-2 border-rose-400 shadow-[0_4px_0_#FB7185]'
                      : 'bg-[#00B4D8] hover:bg-[#0096B4] text-white shadow-[0_4px_0_#007791] border-2 border-[#00B4D8] active:translate-y-1'
                    : 'bg-white border-2 border-dashed border-[#0A254D]/20 text-[#0A254D]/30 hover:border-[#00B4D8]'
                }`}
                title={card ? 'Klik/ketuk untuk mengembalikan huruf ke daftar' : `Kotak ke-${slotIdx + 1}`}
              >
                {/* RTL order badge */}
                <span className="absolute top-1 right-1.5 text-[9px] font-mono text-white/80 leading-none font-bold">
                  {slotIdx + 1}
                </span>

                {card ? (
                  <span className={`${fontClass} text-2xl sm:text-3xl font-extrabold leading-loose`}>
                    {card.letter}
                  </span>
                ) : (
                  <span className="text-[#0A254D]/25 text-base font-mono">_</span>
                )}
              </div>
            ))}
          </div>

          <p className="text-[11px] text-[#0A254D]/60 mt-2.5 text-center font-medium">
            Ketuk huruf di kotak jawaban untuk mengembalikannya ke pilihan di bawah
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
                className="px-7 py-3 bg-[#00B4D8] hover:bg-[#0096B4] text-white font-black rounded-full shadow-[0_4px_0_#007791] active:translate-y-1 transition-all flex items-center gap-2 cursor-pointer text-sm"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>Periksa Jawaban</span>
              </button>

              <button
                type="button"
                onClick={handleHint}
                className="px-5 py-3 bg-[#FED034] hover:bg-[#E5B800] text-[#0A254D] border-2 border-[#0A254D]/15 font-black rounded-full shadow-[0_4px_0_#CFA300] active:translate-y-1 transition-all flex items-center gap-1.5 cursor-pointer text-sm"
                title="Buka satu huruf yang benar"
              >
                <Lightbulb className="w-4 h-4 text-[#0A254D]" />
                <span>Petunjuk</span>
              </button>

              <button
                type="button"
                onClick={handleResetToPool}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-[#0A254D] font-black rounded-full border border-[#0A254D]/15 transition-all flex items-center gap-1.5 cursor-pointer text-sm active:scale-95"
                title="Kembalikan semua huruf ke bawah"
              >
                <Shuffle className="w-4 h-4 text-[#0A254D]/70" />
                <span>Acak Ulang</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleNextQuestion}
              className="px-9 py-3.5 bg-[#FF3B8D] hover:bg-[#E02674] text-white font-black rounded-full shadow-[0_5px_0_#C7175E] active:translate-y-1 transition-all flex items-center gap-2 cursor-pointer text-base animate-bounce"
            >
              <span>Kata Berikutnya</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}
        </div>

        {/* Available Letters Pool */}
        <div className="w-full max-w-2xl pt-4 border-t border-[#0A254D]/10">
          <div className="flex items-center justify-between text-xs text-[#0A254D]/70 mb-3 px-1 font-bold">
            <span className="text-[#0A254D]">Pilihan Huruf (Klik / Ketuk untuk Menyusun):</span>
            <span className="text-[11px] text-[#0A254D]/50">Sisa {availablePool.length} huruf</span>
          </div>

          <div
            dir="rtl"
            className="flex items-center justify-center gap-2.5 sm:gap-3.5 flex-wrap min-h-[70px] p-3 bg-slate-50 rounded-3xl border-2 border-[#0A254D]/15"
          >
            {availablePool.length === 0 ? (
              <span className="text-xs text-[#0A254D]/50 italic py-2">Semua huruf sudah ditaruh di kotak jawaban</span>
            ) : (
              availablePool.map((card) => (
                <button
                  type="button"
                  key={card.uid}
                  onClick={() => handleSelectPoolCard(card)}
                  className={`w-14 h-16 sm:w-16 sm:h-18 bg-white hover:bg-pink-50/50 hover:border-[#FF3B8D] active:translate-y-1 border-2 border-[#0A254D]/15 text-[#0A254D] rounded-2xl shadow-[0_4px_0_rgba(10,37,77,0.08)] flex items-center justify-center cursor-pointer transition-all ${fontClass} text-2xl sm:text-3xl font-extrabold select-none leading-loose`}
                  title="Klik untuk menaruh ke kotak jawaban"
                >
                  {card.letter}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
