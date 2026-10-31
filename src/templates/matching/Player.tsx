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

interface MatchingPlayerProps {
  items: MatchingPair[];
  theme: ThemeConfig;
  settings: DraftSettings;
  mediaFiles: Record<string, MediaItem>;
  isProjectorMode?: boolean;
}

function ImageBlobPreview({ blob, alt }: { blob: Blob; alt: string }) {
  const [objectUrl, setObjectUrl] = useState<string>('');

  useEffect(() => {
    const url = URL.createObjectURL(blob);
    setObjectUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [blob]);

  if (!objectUrl) return null;
  return (
    <img
      src={objectUrl}
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
      <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
        <p className="text-stone-500 font-medium">Belum ada pasangan kata untuk dicocokkan.</p>
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
      <div className="bg-white border border-stone-200 rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mb-2">
          Game Mencocokkan Kata
        </h2>
        <p className="text-stone-600 text-sm mb-6">
          Hubungkan kata Arab di sisi kiri dengan arti atau gambar yang tepat di sisi kanan lewat <strong>klik</strong> atau <strong>drag and drop</strong>.
        </p>

        {isTeam ? (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl max-w-md mx-auto text-xs text-left space-y-2">
            <div className="font-bold text-emerald-900 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-700" /> Mode Kompetisi Tim ({teamCount} Tim):
            </div>
            <p className="text-emerald-800">
              Tim bergantian memilih pasangan. Setiap pasangan yang berhasil dicocokkan bernilai 10 poin!
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {teamNames.map((name, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-white border border-emerald-300 rounded-md font-semibold text-emerald-800"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-6 flex justify-center gap-4 text-xs text-stone-500">
            <span>{items.length} Pasangan Kata</span>
            <span>·</span>
            <span>
              {pairsPerRound > 0 ? `${pairsPerRound} Pasang per Ronde` : 'Semua Pasang Sekaligus'}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={handleStartGame}
          className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-base shadow-md cursor-pointer transition-all inline-flex items-center gap-2"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Mulai Bermain</span>
        </button>
      </div>
    );
  }

  // 2. FINISHED / RESULT SCREEN
  if (gameState === 'finished') {
    return (
      <div className="bg-white border border-stone-200 rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm">
        <div className="text-5xl mb-3">🏆</div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mb-2">
          Mumtaz! Semua Pasangan Cocok!
        </h2>
        <p className="text-stone-600 text-sm mb-6">
          Selamat! Kamu berhasil mencocokkan semua kata dalam {attempts} kali percobaan.
        </p>

        {isTeam ? (
          <div className="space-y-3 max-w-md mx-auto mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 text-left">
              Papan Skor Tim:
            </h3>
            {teamNames.map((name, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 bg-stone-50 border border-stone-200 rounded-xl"
              >
                <div className="flex items-center gap-2 font-bold text-stone-800">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-extrabold">
                    {idx + 1}
                  </span>
                  <span>{name}</span>
                </div>
                <div className="text-lg font-extrabold text-emerald-700">
                  {teamScores[idx]} Poin
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 max-w-sm mx-auto mb-8">
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
              Hasil Permainan
            </div>
            <div className="text-4xl font-extrabold text-emerald-700">
              {items.length} / {items.length} Cocok
            </div>
            <div className="text-xs text-stone-600 mt-2">
              Selesai dalam {attempts} kali percobaan tebakan
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleStartGame}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md cursor-pointer transition-all inline-flex items-center gap-2 active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Mainkan Lagi</span>
        </button>
      </div>
    );
  }

  // 3. PLAYING BOARD (Two columns with Click & Drag-and-Drop)
  return (
    <div className={`flex flex-col select-none ${isProjectorMode ? 'max-w-4xl mx-auto py-2' : 'w-full'}`}>
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-stone-700 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200">
            Cocok: {matchedIds.size} / {activePairs.length}
          </span>
          {pairsPerRound > 0 && (
            <span className="font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
              Ronde {roundIndex + 1}
            </span>
          )}
          <span className="font-semibold text-stone-500 bg-stone-100 px-2.5 py-1.5 rounded-lg border border-stone-200">
            Percobaan: {attempts}
          </span>
        </div>

        {/* Team Scoreboard or status */}
        {isTeam ? (
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {teamNames.map((tName, idx) => {
              const isTurn = idx === currentTeamIdx;
              return (
                <div
                  key={idx}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-all flex items-center gap-1 ${
                    isTurn
                      ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-300 shadow-xs'
                      : 'bg-white text-stone-600 border-stone-200'
                  }`}
                >
                  <span>{tName}</span>
                  <span className={isTurn ? 'text-emerald-100' : 'text-emerald-700'}>
                    ({teamScores[idx]})
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1">
            <MoveHorizontal className="w-3.5 h-3.5" />
            <span>Klik atau Tarik (Drag & Drop)</span>
          </div>
        )}

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSoundMuted(!soundMuted)}
            className="p-1.5 bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-lg cursor-pointer transition-colors"
            title={soundMuted ? 'Nyalakan Efek Suara' : 'Matikan Efek Suara'}
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-stone-400" /> : <Volume2 className="w-4 h-4 text-emerald-700" />}
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-lg cursor-pointer transition-colors"
            title="Layar Penuh Proyektor"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isTeam && (
        <div className="mb-3 text-center">
          <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-bold">
            Giliran Menjawab: {teamNames[currentTeamIdx]}
          </span>
        </div>
      )}

      {/* Progress Bar */}
      <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden mb-5">
        <div
          className="bg-emerald-600 h-full transition-all duration-300"
          style={{ width: `${(matchedIds.size / activePairs.length) * 100}%` }}
        />
      </div>

      {/* Two-Column Matching Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Left Column: Arabic words (Draggable & Clickable) */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-stone-500 uppercase tracking-wider text-center sm:text-right px-1">
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
                className={`w-full min-h-[75px] sm:min-h-[85px] p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center select-none ${
                  isMatched
                    ? 'border-stone-200 bg-stone-100 opacity-40 cursor-not-allowed text-stone-400'
                    : isWrong
                    ? 'border-rose-500 bg-rose-50 text-rose-900 ring-3 ring-rose-200 animate-bounce'
                    : isSelected
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-3 ring-emerald-200 scale-[1.02] cursor-pointer'
                    : 'border-stone-200 bg-white hover:border-emerald-400 hover:bg-stone-50 text-stone-800 cursor-grab active:cursor-grabbing shadow-xs'
                }`}
              >
                <div
                  className={`arabic-text ${fontClass} text-2xl sm:text-3xl font-bold leading-loose`}
                >
                  {displayText}
                </div>
                {theme.showLatin && item.latin && !isMatched && (
                  <div className="text-xs text-stone-500 italic mt-0.5">
                    {item.latin}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column: Meaning / Picture Cards (Droppable & Clickable) */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-stone-500 uppercase tracking-wider text-center sm:text-left px-1">
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
                className={`w-full min-h-[75px] sm:min-h-[85px] p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center select-none ${
                  isMatched
                    ? 'border-stone-200 bg-stone-100 opacity-40 cursor-not-allowed text-stone-400'
                    : isWrong
                    ? 'border-rose-500 bg-rose-50 text-rose-900 ring-3 ring-rose-200 animate-bounce'
                    : isSelected
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-3 ring-emerald-200 scale-[1.02] cursor-pointer'
                    : 'border-stone-200 bg-white hover:border-emerald-400 hover:bg-stone-50 text-stone-800 cursor-pointer shadow-xs'
                }`}
              >
                {attachedImg && (
                  <ImageBlobPreview blob={attachedImg.blob} alt="Gambar Arti" />
                )}
                <div className="text-base sm:text-lg font-bold">
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
