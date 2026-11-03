import { useState, useEffect, useRef } from 'react';
import { MemoryCardPair, MediaItem, ThemeConfig, DraftSettings } from '../../types';
import { speakArabic, removeHarakat } from '../../utils/arabic';
import { soundManager } from '../../utils/sound';
import { getMediaUrl } from '../../utils/media';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  Trophy,
  Users,
  Clock,
  Play,
  Sparkles,
  CheckCircle,
} from 'lucide-react';

interface MemoryPlayerProps {
  items: MemoryCardPair[];
  theme: ThemeConfig;
  settings: DraftSettings;
  mediaFiles: Record<string, MediaItem>;
  isProjectorMode?: boolean;
}

interface RuntimeCard {
  instanceId: string;
  pairId: string;
  cardType: 'arabic' | 'meaning';
  arabicText?: string;
  meaningText?: string;
  mediaImageId?: string;
  mediaAudioId?: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MemoryPlayer({
  items,
  theme,
  settings,
  mediaFiles,
  isProjectorMode = false,
}: MemoryPlayerProps) {
  const [gameState, setGameState] = useState<'start' | 'previewing' | 'playing' | 'finished'>('start');
  const [cards, setCards] = useState<RuntimeCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [previewCountdown, setPreviewCountdown] = useState(3);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundMuted, setSoundMuted] = useState(!theme.soundEnabled);

  // Difficulty / Pairs count per round (default 6 or settings)
  const [pairCount, setPairCount] = useState<number>(settings.memoryPairsPerGame || 6);

  // Team mode state
  const isTeam = settings.teamMode;
  const teamCount = settings.teamCount || 2;
  const teamNames = settings.teamNames || ['Tim Merah', 'Tim Biru', 'Tim Hijau', 'Tim Kuning'].slice(0, teamCount);
  const [currentTeam, setCurrentTeam] = useState(0);
  const [teamScores, setTeamScores] = useState<number[]>(Array(teamCount).fill(0));

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fontClass =
    theme.fontFamily === 'Amiri'
      ? 'font-amiri'
      : theme.fontFamily === 'Scheherazade New'
      ? 'font-scheherazade'
      : 'font-naskh';

  // Initialize and shuffle cards
  const startNewGame = (selectedPairsNum = pairCount) => {
    if (items.length === 0) return;

    // Pick pairs
    const availablePairs = [...items];
    const shuffledPairs = availablePairs.sort(() => Math.random() - 0.5);
    const chosenPairs = shuffledPairs.slice(0, Math.min(selectedPairsNum, availablePairs.length));

    // Create 2 cards per pair
    const cardDeck: RuntimeCard[] = [];
    chosenPairs.forEach((pair) => {
      // Card A: Arabic
      cardDeck.push({
        instanceId: `card_a_${pair.id}`,
        pairId: pair.id,
        cardType: 'arabic',
        arabicText: pair.arabic,
        isFlipped: false,
        isMatched: false,
      });

      // Card B: Meaning / Image
      cardDeck.push({
        instanceId: `card_b_${pair.id}`,
        pairId: pair.id,
        cardType: 'meaning',
        meaningText: pair.meaning,
        mediaImageId: pair.mediaImageId,
        mediaAudioId: pair.mediaAudioId,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle the deck
    const randomized = cardDeck.sort(() => Math.random() - 0.5);

    setCards(randomized);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setSecondsElapsed(0);
    setCurrentTeam(0);
    setTeamScores(Array(teamCount).fill(0));

    // Check if brief preview is enabled
    if (settings.memoryPreviewBriefly) {
      setCards(randomized.map((c) => ({ ...c, isFlipped: true })));
      setGameState('previewing');
      setPreviewCountdown(3);
    } else {
      setGameState('playing');
    }
  };

  // Preview countdown timer
  useEffect(() => {
    if (gameState !== 'previewing') return;
    const interval = setInterval(() => {
      setPreviewCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCards((cList) => cList.map((c) => ({ ...c, isFlipped: false })));
          setGameState('playing');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState]);

  // Game timer stopwatch
  useEffect(() => {
    if (gameState !== 'playing') return;

    timerRef.current = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  // Handle card click
  const handleCardClick = (index: number) => {
    if (gameState !== 'playing') return;
    const clickedCard = cards[index];

    // Cannot click if already flipped or matched or 2 cards are currently open
    if (clickedCard.isFlipped || clickedCard.isMatched || flippedCards.length >= 2) return;

    if (!soundMuted) soundManager.playClick();

    // If card has Arabic text, read it aloud with TTS
    if (clickedCard.cardType === 'arabic' && clickedCard.arabicText) {
      speakArabic(clickedCard.arabicText);
    }

    const nextFlipped = [...flippedCards, index];
    const nextCards = [...cards];
    nextCards[index] = { ...clickedCard, isFlipped: true };
    setCards(nextCards);
    setFlippedCards(nextFlipped);

    // If this is the second card opened
    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      const firstCard = nextCards[nextFlipped[0]];
      const secondCard = nextCards[nextFlipped[1]];

      // Check match: same pairId and different cardType
      if (firstCard.pairId === secondCard.pairId && firstCard.cardType !== secondCard.cardType) {
        // MATCH!
        setTimeout(() => {
          if (!soundMuted) soundManager.playCorrect();
          setCards((prev) =>
            prev.map((c) =>
              c.pairId === firstCard.pairId ? { ...c, isMatched: true, isFlipped: true } : c
            )
          );
          setFlippedCards([]);
          setMatches((prev) => {
            const newMatches = prev + 1;
            // Check win condition
            const totalPairs = cards.length / 2;
            if (newMatches >= totalPairs) {
              setGameState('finished');
              if (!soundMuted) soundManager.playVictory();
            }
            return newMatches;
          });

          // Add points in team mode (current team gets another turn!)
          if (isTeam) {
            setTeamScores((prev) => {
              const updated = [...prev];
              updated[currentTeam] = (updated[currentTeam] || 0) + 10;
              return updated;
            });
          }
        }, 500);
      } else {
        // NO MATCH -> Flip back after 1 second
        setTimeout(() => {
          if (!soundMuted) soundManager.playIncorrect();
          setCards((prev) =>
            prev.map((c, i) =>
              nextFlipped.includes(i) ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedCards([]);

          // Switch team turn on mistake
          if (isTeam) {
            setCurrentTeam((prev) => (prev + 1) % teamCount);
          }
        }, 1000);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-stone-500 text-sm">
        Belum ada pasangan kartu dalam game Memory ini. Silakan tambahkan kosakata di editor.
      </div>
    );
  }

  // 1. START SCREEN
  if (gameState === 'start') {
    return (
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 text-center shadow-xs max-w-xl mx-auto my-4 space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-indigo-100 text-indigo-800 flex items-center justify-center mx-auto text-2xl font-black shadow-xs">
          🃏
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Game: Memory Card Kosakata
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-2 leading-relaxed">
            Buka dua kartu yang tertutup dan temukan pasangan kata Arab serta artinya yang cocok!
          </p>
        </div>

        {/* Difficulty selector */}
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3 text-left">
          <label className="block text-xs font-bold text-stone-700">Pilih Jumlah Pasangan Kartu:</label>
          <div className="grid grid-cols-4 gap-2">
            {[4, 6, 8, 10].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setPairCount(num)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                  pairCount === num
                    ? 'bg-indigo-700 text-white border-indigo-700 shadow-xs'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {num} Pasang
                <span className="block text-[10px] opacity-80 font-normal">({num * 2} Kartu)</span>
              </button>
            ))}
          </div>

          {isTeam && (
            <div className="pt-2 border-t border-stone-200 text-xs font-semibold text-indigo-800 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Mode Kompetisi {teamCount} Tim Aktif (Bergantian saat gagal cocok)</span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => startNewGame(pairCount)}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-base rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Mulai Permainan</span>
        </button>
      </div>
    );
  }

  // 2. FINISHED SCREEN
  if (gameState === 'finished') {
    const totalPairs = cards.length / 2;
    return (
      <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center shadow-md max-w-xl mx-auto my-4 space-y-6 animate-in fade-in zoom-in-95">
        <div className="w-20 h-20 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
          <Trophy className="w-10 h-10" />
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">Selamat! Berhasil Cocok Semua!</h2>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Daya ingat dan pemahaman kosakata Anda sangat luar biasa!
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 p-4 bg-stone-50 border border-stone-200 rounded-2xl text-center">
          <div>
            <div className="text-[11px] font-bold text-stone-500 uppercase">Pasangan</div>
            <div className="text-2xl font-black text-indigo-700 mt-1">{totalPairs}</div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-stone-500 uppercase">Langkah (Moves)</div>
            <div className="text-2xl font-black text-stone-900 mt-1">{moves}</div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-stone-500 uppercase">Waktu</div>
            <div className="text-2xl font-black text-emerald-700 mt-1">{secondsElapsed}s</div>
          </div>
        </div>

        {isTeam && (
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-2">
            <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Skor Tim</h4>
            <div className="grid grid-cols-2 gap-2 text-center">
              {teamNames.map((name, idx) => (
                <div key={idx} className="p-2.5 bg-white rounded-xl border border-indigo-100">
                  <span className="text-xs font-semibold text-stone-600 block">{name}</span>
                  <span className="text-xl font-bold text-indigo-700">{teamScores[idx]} Poin</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => startNewGame(pairCount)}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Mainkan Lagi</span>
        </button>
      </div>
    );
  }

  // 3. PLAYING & PREVIEW SCREEN
  const totalPairs = cards.length / 2;

  // Grid columns class based on card count
  const gridColsClass =
    cards.length <= 8
      ? 'grid-cols-2 sm:grid-cols-4'
      : cards.length <= 12
      ? 'grid-cols-3 sm:grid-cols-4'
      : cards.length <= 16
      ? 'grid-cols-4 sm:grid-cols-4 md:grid-cols-4'
      : 'grid-cols-4 sm:grid-cols-5';

  return (
    <div className={`space-y-4 max-w-4xl mx-auto ${isProjectorMode ? 'p-4 sm:p-6' : ''}`}>
      {/* Top Bar: Progress, Moves, Timer, Controls */}
      <div className="bg-white border border-stone-200 rounded-2xl p-3 px-4 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs font-bold">
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg">
            Cocok: {matches} / {totalPairs}
          </span>
          <span className="bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg">
            Langkah: {moves}
          </span>
          <span className="bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {secondsElapsed}s
          </span>
        </div>

        {/* Team Turn Indicator */}
        {isTeam && (
          <div className="flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-lg">
            <Users className="w-3.5 h-3.5" />
            <span>Giliran: {teamNames[currentTeam]} ({teamScores[currentTeam]} Poin)</span>
          </div>
        )}

        {/* Sound & Fullscreen controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              const next = !soundMuted;
              setSoundMuted(next);
              soundManager.setMuted(next);
            }}
            className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
            title={soundMuted ? 'Nyalakan Efek Suara' : 'Matikan Suara'}
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
            title="Layar Penuh"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Preview countdown overlay alert */}
      {gameState === 'previewing' && (
        <div className="p-3 bg-indigo-600 text-white rounded-2xl text-center text-xs font-bold shadow-md animate-pulse">
          👀 Ingat posisi kartu ini! Permainan dimulai dalam <strong>{previewCountdown}</strong> detik...
        </div>
      )}

      {/* Cards Grid */}
      <div className={`grid ${gridColsClass} gap-3 sm:gap-4`}>
        {cards.map((card, idx) => {
          const isRevealed = card.isFlipped || card.isMatched;
          const imageMedia = card.mediaImageId ? mediaFiles[card.mediaImageId] : undefined;
          const imageUrl = imageMedia ? getMediaUrl(imageMedia) : undefined;

          return (
            <div
              key={card.instanceId}
              onClick={() => handleCardClick(idx)}
              className={`aspect-[3/4] sm:aspect-square rounded-2xl cursor-pointer select-none transition-all duration-300 transform perspective-1000 ${
                card.isMatched
                  ? 'opacity-85 ring-3 ring-emerald-500 scale-95 shadow-sm'
                  : isRevealed
                  ? 'shadow-md scale-100'
                  : 'hover:scale-102 hover:shadow-md'
              }`}
            >
              {isRevealed ? (
                /* Card Front (Revealed Content) */
                <div
                  className={`w-full h-full rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center text-center border-2 transition-all ${
                    card.isMatched
                      ? 'bg-emerald-50/90 border-emerald-500 text-emerald-950'
                      : card.cardType === 'arabic'
                      ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                      : 'bg-indigo-50/80 border-indigo-300 text-indigo-950'
                  }`}
                >
                  {card.cardType === 'arabic' ? (
                    <>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700/70 mb-1">
                        Kata Arab
                      </span>
                      <div
                        dir="rtl"
                        className={`text-2xl sm:text-3xl font-bold leading-relaxed ${fontClass}`}
                      >
                        {theme.showHarakat ? card.arabicText : removeHarakat(card.arabicText || '')}
                      </div>
                      {card.isMatched && (
                        <CheckCircle className="w-4 h-4 text-emerald-600 mt-2" />
                      )}
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700/70 mb-1">
                        Arti Kata
                      </span>
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt="Arti visual"
                          className="max-h-16 sm:max-h-20 rounded-lg object-contain mb-1"
                        />
                      )}
                      <div className="text-base sm:text-lg font-extrabold text-stone-900 leading-snug">
                        {card.meaningText}
                      </div>
                      {card.isMatched && (
                        <CheckCircle className="w-4 h-4 text-emerald-600 mt-2" />
                      )}
                    </>
                  )}
                </div>
              ) : (
                /* Card Back (Covered) */
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-indigo-700 via-indigo-800 to-indigo-950 text-white flex flex-col items-center justify-center border-2 border-indigo-600/50 shadow-inner group">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 flex items-center justify-center text-xl sm:text-2xl font-black text-indigo-200 group-hover:scale-110 transition-transform">
                    ض
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-indigo-300/80 font-semibold mt-1">
                    Teach Arab
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
