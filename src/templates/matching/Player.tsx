import { useState, useEffect } from 'react';
import { MatchingPair, MediaItem, ThemeConfig, DraftSettings } from '../../types';
import { removeHarakat } from '../../utils/arabic';
import { soundManager } from '../../utils/sound';
import {
  Trophy,
  RotateCcw,
  Maximize2,
  Minimize2,
  Users,
  Volume2,
  VolumeX,
  Play,
  Sparkles,
  MoveHorizontal,
} from 'lucide-react';
import {
  GameStartScreen,
  GameTopBar,
  GameResultScreen,
} from '../../components/game/GameShared';

import { getMediaUrl } from '../../utils/media';

interface MatchingPlayerProps {
  items: MatchingPair[];
  theme: ThemeConfig;
  settings: DraftSettings;
  mediaFiles: Record<string, MediaItem>;
  isProjectorMode?: boolean;
}

function ImageMediaPreview({ media, alt }: { media: any; alt: string }) {
  const url = getMediaUrl(media);
  if (!url) return null;
  return (
    <img
      src={url}
      alt={alt}
      className="max-h-16 max-w-full object-contain mb-2 rounded"
    />
  );
}

export default function MatchingPlayer({
  items,
  theme,
  settings,
  mediaFiles,
  isProjectorMode = false,
}: MatchingPlayerProps) {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'finished'>('start');
  const [selectedArabicId, setSelectedArabicId] = useState<string | null>(null);
  const [selectedMeaningId, setSelectedMeaningId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [wrongPairIds, setWrongPairIds] = useState<{ arabic: string; meaning: string } | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [roundIndex, setRoundIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundMuted, setSoundMuted] = useState(!theme.soundEnabled);

  // Active round pairs
  const [activePairs, setActivePairs] = useState<MatchingPair[]>([]);
  const [shuffledArabic, setShuffledArabic] = useState<MatchingPair[]>([]);
  const [shuffledMeaning, setShuffledMeaning] = useState<MatchingPair[]>([]);

  // Team mode
  const isTeam = settings.teamMode;
  const teamCount = settings.teamCount || 2;
  const teamNames = settings.teamNames || ['Tim Merah', 'Tim Biru', 'Tim Hijau', 'Tim Kuning'].slice(0, teamCount);
  const [currentTeamIdx, setCurrentTeamIdx] = useState(0);
  const [teamScores, setTeamScores] = useState<number[]>(Array(teamCount).fill(0));

  useEffect(() => {
    soundManager.setMuted(soundMuted);
  }, [soundMuted]);

  // Round slicing calculation
  const pairsPerRound = settings.pairsPerRound && settings.pairsPerRound > 0 ? settings.pairsPerRound : 0;

  // Initialize game session
  const initGame = () => {
    setSelectedArabicId(null);
    setSelectedMeaningId(null);
    setWrongPairIds(null);
    setMatchedIds(new Set());
    setAttempts(0);
    setRoundIndex(0);
    setCurrentTeamIdx(0);
    setTeamScores(Array(teamCount).fill(0));

    loadRound(0);
  };

  const loadRound = (round: number) => {
    let roundItems: MatchingPair[] = [];
    if (pairsPerRound > 0) {
      const start = round * pairsPerRound;
      roundItems = items.slice(start, start + pairsPerRound);
      if (roundItems.length === 0) {
        roundItems = items.slice(0, pairsPerRound);
      }
    } else {
      roundItems = [...items];
    }

    setActivePairs(roundItems);
    setMatchedIds(new Set());
    setSelectedArabicId(null);
    setSelectedMeaningId(null);

    // Shuffle positions
    const shouldShuffle = settings.shufflePositions !== false;
    const left = shouldShuffle ? [...roundItems].sort(() => Math.random() - 0.5) : [...roundItems];
    const right = shouldShuffle ? [...roundItems].sort(() => Math.random() - 0.5) : [...roundItems];
    setShuffledArabic(left);
    setShuffledMeaning(right);
  };

  const handleStartGame = () => {
    initGame();
    setGameState('playing');
    soundManager.playClick();
  };

  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border-2 border-dashed border-stone-200 flex flex-col items-center justify-center space-y-3 min-h-[360px]">
        <div className="w-16 h-16 rounded-2xl bg-cyan-50 text-[#00B4D8] flex items-center justify-center text-3xl font-black">
          🔗
        </div>
        <h3 className="text-lg font-black text-[#0A254D]">Belum Ada Pasangan Kata</h3>
        <p className="text-stone-500 text-xs sm:text-sm max-w-sm">
          Belum ada pasangan kata untuk dicocokkan. Tambahkan pasangan kata di editor terlebih dahulu.
        </p>
      </div>
    );
  }

  const fontClass =
    theme.fontFamily === 'Noto Naskh Arabic'
      ? 'font-noto'
      : theme.fontFamily === 'Scheherazade New'
      ? 'font-scheherazade'
      : 'font-amiri';

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Check matching logic
  const checkMatch = (arabicId: string, meaningId: string) => {
    if (matchedIds.has(arabicId)) return;
    setAttempts((prev) => prev + 1);

    if (arabicId === meaningId) {
      // MATCH!
      soundManager.playCorrect();
      setMatchedIds((prev) => {
        const next = new Set(prev);
        next.add(arabicId);

        // Check if round or whole game finished
        if (next.size === activePairs.length) {
          const totalRounds = pairsPerRound > 0 ? Math.ceil(items.length / pairsPerRound) : 1;
          if (roundIndex + 1 < totalRounds) {
            // Next round
            setTimeout(() => {
              setRoundIndex((r) => {
                const nextR = r + 1;
                loadRound(nextR);
                return nextR;
              });
            }, 800);
          } else {
            // Victory
            setTimeout(() => {
              soundManager.playVictory();
              setGameState('finished');
            }, 600);
          }
        }
        return next;
      });

      if (isTeam) {
        setTeamScores((prev) => {
          const next = [...prev];
          next[currentTeamIdx] += 10;
          return next;
        });
      }

      setSelectedArabicId(null);
      setSelectedMeaningId(null);
    } else {
      // WRONG!
      soundManager.playIncorrect();
      setWrongPairIds({ arabic: arabicId, meaning: meaningId });
      setTimeout(() => {
        setWrongPairIds(null);
        setSelectedArabicId(null);
        setSelectedMeaningId(null);
        if (isTeam) {
          setCurrentTeamIdx((prev) => (prev + 1) % teamCount);
        }
      }, 600);
    }
  };

  // Click on Arabic card
  const handleSelectArabic = (id: string) => {
    if (matchedIds.has(id)) return;
    soundManager.playClick();
    setSelectedArabicId(id);

    if (selectedMeaningId) {
      checkMatch(id, selectedMeaningId);
    }
  };

  // Click on Meaning card
  const handleSelectMeaning = (id: string) => {
    if (matchedIds.has(id)) return;
    soundManager.playClick();
    setSelectedMeaningId(id);

    if (selectedArabicId) {
      checkMatch(selectedArabicId, id);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setSelectedArabicId(id);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const draggedArabicId = e.dataTransfer.getData('text/plain');
    if (draggedArabicId) {
      checkMatch(draggedArabicId, targetId);
    }
  };

  // 1. START SCREEN
  if (gameState === 'start') {
    return (
      <GameStartScreen
        title="Game Mencocokkan Kata"
        description="Hubungkan kata Arab di sisi kiri dengan arti atau gambar yang tepat di sisi kanan lewat klik atau drag-and-drop."
        itemCount={items.length}
        itemLabel="Pasangan Kata"
        onStart={handleStartGame}
        isTeam={isTeam}
        teamCount={teamCount}
        teamNames={teamNames}
      />
    );
  }

  // 2. FINISHED / RESULT SCREEN
  if (gameState === 'finished') {
    return (
      <GameResultScreen
        title="Mumtaz! Semua Pasangan Cocok!"
        message={`Selamat! Kamu berhasil menyelesaikan semua pasangan kata dalam ${attempts} kali percobaan.`}
        score={items.length}
        maxScore={items.length}
        scoreLabel="Pasangan Cocok"
        onRestart={handleStartGame}
        isTeam={isTeam}
        teamNames={teamNames}
        teamScores={teamScores}
      />
    );
  }

  // 3. PLAYING BOARD (Two columns with Click & Drag-and-Drop)
  return (
    <div className={`flex flex-col select-none ${isProjectorMode ? 'max-w-4xl mx-auto py-2' : 'w-full'}`}>
      <GameTopBar
        score={matchedIds.size}
        scoreLabel="Cocok"
        roundText={pairsPerRound > 0 ? `Ronde ${roundIndex + 1}` : undefined}
        soundMuted={soundMuted}
        onToggleSound={() => setSoundMuted(!soundMuted)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onReset={handleStartGame}
        isTeam={isTeam}
        teamNames={teamNames}
        teamScores={teamScores}
        currentTeamIdx={currentTeamIdx}
      />

      {!isTeam && (
        <div className="mb-4 flex items-center justify-between text-xs text-[#0A254D]/70 font-bold px-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#00B4D8]/10 text-[#00B4D8] border border-[#00B4D8]/20 rounded-full">
            <MoveHorizontal className="w-3.5 h-3.5" />
            <span>Klik atau Tarik (Drag & Drop) untuk memasangkan</span>
          </span>
          <span className="px-3 py-1 bg-white border border-[#0A254D]/15 rounded-full shadow-xs">
            Percobaan: {attempts}
          </span>
        </div>
      )}

      {/* Progress Bar */}
      <div className="w-full bg-[#0A254D]/10 h-3 rounded-full overflow-hidden mb-6 p-0.5 border border-[#0A254D]/15">
        <div
          className="bg-gradient-to-r from-[#00B4D8] to-[#FF3B8D] h-full rounded-full transition-all duration-300"
          style={{ width: `${(matchedIds.size / activePairs.length) * 100}%` }}
        />
      </div>

      {/* Two-Column Matching Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Left Column: Arabic words (Draggable & Clickable) */}
        <div className="space-y-3">
          <div className="text-xs font-black text-[#0A254D]/60 uppercase tracking-wider text-center sm:text-right px-2">
            Kolom Kata Arab (Tarik atau Klik)
          </div>
          {shuffledArabic.map((item) => {
            const isMatched = matchedIds.has(item.id);
            const isSelected = selectedArabicId === item.id;
            const isWrong = wrongPairIds?.arabic === item.id;
            const displayText = theme.showHarakat ? item.arabic : removeHarakat(item.arabic);

            return (
              <div
                key={item.id}
                draggable={!isMatched}
                onDragStart={(e) => handleDragStart(e, item.id)}
                onClick={() => handleSelectArabic(item.id)}
                className={`w-full min-h-[80px] sm:min-h-[92px] p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center select-none ${
                  isMatched
                    ? 'border-[#0A254D]/10 bg-slate-100 opacity-40 cursor-not-allowed text-[#0A254D]/40'
                    : isWrong
                    ? 'border-rose-500 bg-rose-50 text-rose-900 ring-4 ring-rose-200 animate-bounce'
                    : isSelected
                    ? 'border-[#00B4D8] bg-[#00B4D8]/10 text-[#0A254D] ring-4 ring-[#00B4D8]/30 scale-[1.02] shadow-[0_4px_0_#00B4D8] cursor-pointer'
                    : 'border-[#0A254D]/15 bg-white hover:border-[#00B4D8] hover:bg-sky-50/50 text-[#0A254D] cursor-grab active:cursor-grabbing shadow-[0_4px_0_rgba(10,37,77,0.08)] active:translate-y-0.5'
                }`}
              >
                <div
                  className={`arabic-text ${fontClass} text-2xl sm:text-3xl font-extrabold leading-loose`}
                >
                  {displayText}
                </div>
                {theme.showLatin && item.latin && !isMatched && (
                  <div className="text-xs text-[#0A254D]/60 italic mt-0.5 font-medium">
                    {item.latin}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column: Meaning / Picture Cards (Droppable & Clickable) */}
        <div className="space-y-3">
          <div className="text-xs font-black text-[#0A254D]/60 uppercase tracking-wider text-center sm:text-left px-2">
            Kolom Arti / Gambar (Lepaskan atau Klik)
          </div>
          {shuffledMeaning.map((item) => {
            const isMatched = matchedIds.has(item.id);
            const isSelected = selectedMeaningId === item.id;
            const isWrong = wrongPairIds?.meaning === item.id;
            const attachedImg = item.mediaImageId ? mediaFiles[item.mediaImageId] : null;

            return (
              <div
                key={item.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, item.id)}
                onClick={() => handleSelectMeaning(item.id)}
                className={`w-full min-h-[80px] sm:min-h-[92px] p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center select-none ${
                  isMatched
                    ? 'border-[#0A254D]/10 bg-slate-100 opacity-40 cursor-not-allowed text-[#0A254D]/40'
                    : isWrong
                    ? 'border-rose-500 bg-rose-50 text-rose-900 ring-4 ring-rose-200 animate-bounce'
                    : isSelected
                    ? 'border-[#FF3B8D] bg-[#FF3B8D]/10 text-[#0A254D] ring-4 ring-[#FF3B8D]/30 scale-[1.02] shadow-[0_4px_0_#FF3B8D] cursor-pointer'
                    : 'border-[#0A254D]/15 bg-white hover:border-[#FF3B8D] hover:bg-pink-50/50 text-[#0A254D] cursor-pointer shadow-[0_4px_0_rgba(10,37,77,0.08)] active:translate-y-0.5'
                }`}
              >
                {attachedImg && (
                  <ImageMediaPreview media={attachedImg} alt="Gambar Arti" />
                )}
                <div className="text-base sm:text-lg font-bold text-[#0A254D]">
                  {item.meaning}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
