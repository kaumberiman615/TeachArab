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
import {
  GameStartScreen,
  GameTopBar,
  GameResultScreen,
} from '../../components/game/GameShared';

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
      <GameStartScreen
        title="Game: Memory Card Kosakata"
        description="Buka dua kartu yang tertutup dan temukan pasangan kata Arab serta artinya yang cocok!"
        itemCount={items.length}
        itemLabel="Pasang Tersedia"
        onStart={() => startNewGame(pairCount)}
        isTeam={isTeam}
        teamCount={teamCount}
        teamNames={teamNames}
        extraInfo={
          <div className="bg-slate-50 border border-[#0A254D]/15 rounded-2xl p-4 space-y-2 text-left">
            <label className="block text-xs font-black text-[#0A254D] uppercase tracking-wider">
              Pilih Jumlah Pasangan Kartu:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[4, 6, 8, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPairCount(num)}
                  className={`py-2 px-3 rounded-xl border-2 text-xs font-black transition-all cursor-pointer text-center ${
                    pairCount === num
                      ? 'bg-[#00B4D8] text-white border-[#00B4D8] shadow-[0_3px_0_#007791]'
                      : 'bg-white text-[#0A254D] border-[#0A254D]/15 hover:bg-slate-100'
                  }`}
                >
                  {num} Pasang
                  <span className="block text-[10px] opacity-80 font-normal">({num * 2} Kartu)</span>
                </button>
              ))}
            </div>
          </div>
        }
      />
    );
  }

  // 2. FINISHED SCREEN
  if (gameState === 'finished') {
    const totalPairs = cards.length / 2;
    return (
      <GameResultScreen
        title="Mumtaz! Semua Kartu Terbuka!"
        message={`Daya ingat dan pemahaman kosakata luar biasa! Selesai dalam ${moves} langkah (${secondsElapsed} detik).`}
        score={totalPairs}
        maxScore={totalPairs}
        scoreLabel="Pasang Cocok"
        onRestart={() => startNewGame(pairCount)}
        isTeam={isTeam}
        teamNames={teamNames}
        teamScores={teamScores}
      />
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
      <GameTopBar
        score={matches}
        scoreLabel="Cocok"
        roundText={`Langkah: ${moves} · ${secondsElapsed}s`}
        soundMuted={soundMuted}
        onToggleSound={() => {
          const next = !soundMuted;
          setSoundMuted(next);
          soundManager.setMuted(next);
        }}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onReset={() => startNewGame(pairCount)}
        isTeam={isTeam}
        teamNames={teamNames}
        teamScores={teamScores}
        currentTeamIdx={currentTeam}
      />

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
                      ? 'bg-emerald-50 border-2 border-[#10B981] text-[#065F46] shadow-[0_4px_0_#10B981]'
                      : card.cardType === 'arabic'
                      ? 'bg-cyan-50/80 border-[#00B4D8] text-[#0A254D] shadow-[0_4px_0_#00B4D8]'
                      : 'bg-pink-50/80 border-[#FF3B8D] text-[#0A254D] shadow-[0_4px_0_#FF3B8D]'
                  }`}
                >
                  {card.cardType === 'arabic' ? (
                    <>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#00B4D8] mb-1">
                        Kata Arab
                      </span>
                      <div
                        dir="rtl"
                        className={`text-2xl sm:text-3xl font-extrabold leading-[2.2] ${fontClass}`}
                      >
                        {theme.showHarakat ? card.arabicText : removeHarakat(card.arabicText || '')}
                      </div>
                      {card.isMatched && (
                        <CheckCircle className="w-5 h-5 text-emerald-600 mt-2 stroke-[2.5]" />
                      )}
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#FF3B8D] mb-1">
                        Arti Kata
                      </span>
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt="Arti visual"
                          className="max-h-16 sm:max-h-20 rounded-xl object-contain mb-1 border border-[#0A254D]/10"
                        />
                      )}
                      <div className="text-base sm:text-lg font-black text-[#0A254D] leading-snug">
                        {card.meaningText}
                      </div>
                      {card.isMatched && (
                        <CheckCircle className="w-5 h-5 text-emerald-600 mt-2 stroke-[2.5]" />
                      )}
                    </>
                  )}
                </div>
              ) : (
                /* Card Back (Covered - Bubble Bash theme) */
                <div className="w-full h-full rounded-2xl bg-[#0A254D] text-white flex flex-col items-center justify-center border-2 border-[#00B4D8] shadow-[0_5px_0_#061730] group hover:-translate-y-0.5 transition-all">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#FED034] text-[#0A254D] flex items-center justify-center text-xl sm:text-2xl font-black shadow-[0_3px_0_#E5B800] group-hover:scale-110 transition-transform font-amiri">
                    ض
                  </div>
                  <span className="text-[10px] text-[#00B4D8] font-black tracking-wider uppercase mt-1.5">
                    Kartu
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
