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
      <div className="flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto my-auto min-h-[460px]">
        <div className="w-20 h-20 bg-indigo-100 text-indigo-700 rounded-3xl flex items-center justify-center mb-6 shadow-inner animate-bounce">
          <Sparkles className="w-10 h-10" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mb-2">
          Game Susun Huruf (تَرْتِيبُ الْحُرُوفِ)
        </h1>
        <p className="text-stone-600 text-sm leading-relaxed mb-6 max-w-md">
          Susun kartu-kartu huruf hijaiyah yang teracak agar membentuk kata bahasa Arab yang tepat dari arah kanan ke kiri!
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
            <span className="text-stone-400 block text-[11px]">Jumlah Kata</span>
            <strong className="text-sm font-bold text-stone-900">{items.length} Kata</strong>
          </div>
          <div className="h-6 w-px bg-stone-200" />
          <div>
            <span className="text-stone-400 block text-[11px]">Cek Harakat</span>
            <strong className="text-sm font-bold text-stone-900">
              {ignoreHarakat ? 'Abaikan Harakat' : 'Wajib Teliti'}
            </strong>
          </div>
          <div className="h-6 w-px bg-stone-200" />
          <div>
            <span className="text-stone-400 block text-[11px]">Input Kartu</span>
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
        <p className="text-xs text-stone-500 mb-6">Hebat! Kamu telah menyelesaikan seluruh teka-teki kata.</p>

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
  const targetLetters = currentItem ? splitArabicWordLetters(currentItem.arabic) : [];

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto space-y-4">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between bg-white border border-stone-200 rounded-2xl p-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-indigo-50 text-indigo-800 rounded-xl text-xs font-bold border border-indigo-100">
            Kata {currentIndex + 1} / {runtimeItems.length}
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
        {/* Clue / Hint Section */}
        <div className="flex flex-col items-center space-y-2">
          {imageUrl && (
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border border-stone-200 shadow-2xs mb-2 bg-stone-50">
              <img src={imageUrl} alt="Ilustrasi kata" className="w-full h-full object-contain p-2" />
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Arti / Petunjuk:</span>
            <h3 className="text-lg sm:text-xl font-bold text-stone-900">{currentItem.meaning || 'Susun huruf'}</h3>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleSpeak}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Dengarkan Pelafalan</span>
            </button>
            {audioUrl && (
              <audio src={audioUrl} controls className="h-8 max-w-[200px]" />
            )}
          </div>
        </div>

        {/* Answer Assembly Drop Zone (RTL direction!) */}
        <div className="w-full max-w-2xl bg-stone-50 border-2 border-dashed border-indigo-200 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-3 px-1">
            <span className="font-semibold flex items-center gap-1 text-indigo-900">
              <span>Kotak Jawaban</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">RTL: Kanan ➔ Kiri</span>
            </span>
            <span className="text-stone-400">
              {placedLetters.filter(Boolean).length} dari {targetLetters.length} huruf terisi
            </span>
          </div>

          {/* Slots container with RTL direction */}
          <div
            dir="rtl"
            className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap min-h-[72px]"
          >
            {placedLetters.map((card, slotIdx) => (
              <div
                key={`slot_${slotIdx}`}
                onClick={() => handleRemovePlacedCard(slotIdx)}
                className={`relative w-14 h-16 sm:w-16 sm:h-20 rounded-2xl flex items-center justify-center transition-all cursor-pointer select-none ${
                  card
                    ? isEvaluated
                      ? isCorrect
                        ? 'bg-emerald-600 text-white shadow-md border-2 border-emerald-500 scale-102'
                        : 'bg-rose-50 text-rose-700 border-2 border-rose-300'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md border-2 border-indigo-500 active:scale-95'
                    : 'bg-white border-2 border-dashed border-stone-300 text-stone-300 hover:border-indigo-400'
                }`}
                title={card ? 'Klik/ketuk untuk mengembalikan huruf ke daftar' : `Kotak ke-${slotIdx + 1}`}
              >
                {/* RTL order badge */}
                <span className="absolute top-1 right-1 text-[9px] font-mono text-stone-400/80 leading-none">
                  {slotIdx + 1}
                </span>

                {card ? (
                  <span className={`${fontClass} text-2xl sm:text-3xl font-bold leading-none`}>
                    {card.letter}
                  </span>
                ) : (
                  <span className="text-stone-300 text-sm font-mono">_</span>
                )}
              </div>
            ))}
          </div>

          <p className="text-[11px] text-stone-400 mt-2 text-center">
            Ketuk huruf di kotak jawaban untuk mengembalikannya ke pilihan di bawah
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
                <span>Periksa Jawaban</span>
              </button>

              <button
                type="button"
                onClick={handleHint}
                className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer text-xs sm:text-sm"
                title="Buka satu huruf yang benar"
              >
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span>Petunjuk</span>
              </button>

              <button
                type="button"
                onClick={handleResetToPool}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer text-xs sm:text-sm"
                title="Kembalikan semua huruf ke bawah"
              >
                <Shuffle className="w-4 h-4 text-stone-500" />
                <span>Acak Ulang</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleNextQuestion}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer text-sm animate-pulse"
            >
              <span>Kata Berikutnya</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Available Letters Pool */}
        <div className="w-full max-w-2xl pt-4 border-t border-stone-100">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-3 px-1">
            <span className="font-semibold text-stone-700">Pilihan Huruf (Klik / Ketuk untuk Menyusun):</span>
            <span className="text-[11px] text-stone-400">Sisa {availablePool.length} huruf</span>
          </div>

          <div
            dir="rtl"
            className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap min-h-[64px] p-2 bg-stone-50 rounded-2xl border border-stone-200"
          >
            {availablePool.length === 0 ? (
              <span className="text-xs text-stone-400 italic py-2">Semua huruf sudah ditaruh di kotak jawaban</span>
            ) : (
              availablePool.map((card) => (
                <button
                  type="button"
                  key={card.uid}
                  onClick={() => handleSelectPoolCard(card)}
                  className={`w-14 h-16 sm:w-16 sm:h-18 bg-white hover:bg-indigo-50 hover:border-indigo-300 active:scale-95 border-2 border-stone-200 text-stone-900 rounded-2xl shadow-xs flex items-center justify-center cursor-pointer transition-all ${fontClass} text-2xl sm:text-3xl font-bold select-none`}
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
