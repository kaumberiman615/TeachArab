import { useState, useEffect, useRef } from 'react';
import { TrueFalseItem, MediaItem, ThemeConfig, DraftSettings } from '../../types';
import { speakArabic, removeHarakat } from '../../utils/arabic';
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
  Clock,
  Play,
  Trophy,
  Users,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  GameStartScreen,
  GameTopBar,
  GameFeedbackBanner,
  GameResultScreen,
} from '../../components/game/GameShared';

interface TrueFalsePlayerProps {
  items: TrueFalseItem[];
  theme: ThemeConfig;
  settings: DraftSettings;
  mediaFiles: Record<string, MediaItem>;
  isProjectorMode?: boolean;
}

export default function TrueFalsePlayer({
  items,
  theme,
  settings,
  mediaFiles,
  isProjectorMode = false,
}: TrueFalsePlayerProps) {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'finished'>('start');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundMuted, setSoundMuted] = useState(!theme.soundEnabled);

  // Timer per question
  const timerLimit = settings.tfTimerSeconds || 0;
  const [timeLeft, setTimeLeft] = useState<number>(timerLimit);

  // Runtime questions (can be shuffled or limited)
  const [runtimeQuestions, setRuntimeQuestions] = useState<TrueFalseItem[]>([]);

  // Team mode
  const isTeam = settings.teamMode;
  const teamCount = settings.teamCount || 2;
  const teamNames = settings.teamNames || ['Tim Merah', 'Tim Biru', 'Tim Hijau', 'Tim Kuning'].slice(0, teamCount);
  const [currentTeam, setCurrentTeam] = useState(0);
  const [teamScores, setTeamScores] = useState<number[]>(Array(teamCount).fill(0));

  const pointsPerQuestion = settings.tfPointsPerQuestion || 10;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Font class
  const fontClass =
    theme.fontFamily === 'Amiri'
      ? 'font-amiri'
      : theme.fontFamily === 'Scheherazade New'
      ? 'font-scheherazade'
      : 'font-naskh';

  // Prepare questions on game start
  const startGame = () => {
    let qList = [...items];
    if (settings.tfShuffle) {
      qList = qList.sort(() => Math.random() - 0.5);
    }
    if (settings.tfQuestionsPerGame && settings.tfQuestionsPerGame > 0) {
      qList = qList.slice(0, settings.tfQuestionsPerGame);
    }
    setRuntimeQuestions(qList);
    setCurrentIndex(0);
    setScore(0);
    setHasAnswered(false);
    setSelectedAnswer(null);
    setCurrentTeam(0);
    setTeamScores(Array(teamCount).fill(0));
    setTimeLeft(timerLimit);
    setGameState('playing');
  };

  // Timer effect
  useEffect(() => {
    if (gameState !== 'playing' || hasAnswered || timerLimit <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, currentIndex, hasAnswered, timerLimit]);

  const handleTimeOut = () => {
    if (hasAnswered) return;
    setHasAnswered(true);
    setSelectedAnswer(null);
    if (!soundMuted) soundManager.playIncorrect();
  };

  const handleChoose = (answer: boolean) => {
    if (hasAnswered) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const currentQ = runtimeQuestions[currentIndex];
    setSelectedAnswer(answer);
    setHasAnswered(true);

    const isCorrect = answer === currentQ.isTrue;
    if (isCorrect) {
      if (!soundMuted) soundManager.playCorrect();
      setScore((prev) => prev + pointsPerQuestion);
      if (isTeam) {
        setTeamScores((prev) => {
          const next = [...prev];
          next[currentTeam] = (next[currentTeam] || 0) + pointsPerQuestion;
          return next;
        });
      }
    } else {
      if (!soundMuted) soundManager.playIncorrect();
    }
  };

  const handleNext = () => {
    if (currentIndex < runtimeQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setHasAnswered(false);
      setTimeLeft(timerLimit);
      if (isTeam) {
        setCurrentTeam((prev) => (prev + 1) % teamCount);
      }
    } else {
      setGameState('finished');
      if (!soundMuted) soundManager.playVictory();
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
        Belum ada pernyataan dalam game Benar atau Salah ini. Silakan tambahkan soal di editor.
      </div>
    );
  }

  // 1. START SCREEN
  if (gameState === 'start') {
    return (
      <GameStartScreen
        title="Game: Benar atau Salah?"
        description="Tentukan apakah pernyataan bahasa Arab yang ditampilkan adalah BENAR (صَحِيح) atau SALAH (خَطَأ)!"
        itemCount={items.length}
        itemLabel="Pernyataan"
        onStart={startGame}
        isTeam={isTeam}
        teamCount={teamCount}
        teamNames={teamNames}
      />
    );
  }

  // 2. FINISHED SCREEN
  if (gameState === 'finished') {
    const maxScore = runtimeQuestions.length * pointsPerQuestion;
    return (
      <GameResultScreen
        title="Permainan Selesai!"
        message="Mumtaz! Kamu telah menyelesaikan seluruh latihan Benar atau Salah."
        score={score}
        maxScore={maxScore}
        scoreLabel="Poin"
        onRestart={startGame}
        isTeam={isTeam}
        teamNames={teamNames}
        teamScores={teamScores}
      />
    );
  }

  // 3. PLAYING SCREEN
  const q = runtimeQuestions[currentIndex];
  const statementText = theme.showHarakat ? q.statementArabic : removeHarakat(q.statementArabic);
  const isCorrect = selectedAnswer === q.isTrue;
  const isAnswered = hasAnswered;
  const imageMedia = q.mediaImageId ? mediaFiles[q.mediaImageId] : undefined;
  const imageUrl = imageMedia ? getMediaUrl(imageMedia) : undefined;

  return (
    <div className={`space-y-5 max-w-3xl mx-auto ${isProjectorMode ? 'p-4 sm:p-8' : ''}`}>
      <GameTopBar
        score={score}
        scoreLabel="Poin"
        roundText={`Soal ${currentIndex + 1} / ${runtimeQuestions.length}`}
        timerSeconds={timerLimit > 0 && !isAnswered ? timeLeft : undefined}
        soundMuted={soundMuted}
        onToggleSound={() => {
          const next = !soundMuted;
          setSoundMuted(next);
          soundManager.setMuted(next);
        }}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onReset={startGame}
        isTeam={isTeam}
        teamNames={teamNames}
        teamScores={teamScores}
        currentTeamIdx={currentTeam}
      />

      {/* Main Statement Card */}
      <div className="bg-white border-2 border-[#0A254D]/15 rounded-3xl p-6 sm:p-10 shadow-[0_8px_0_rgba(10,37,77,0.06)] text-center space-y-6">
        {imageUrl && (
          <div className="flex justify-center">
            <img
              src={imageUrl}
              alt="Media soal"
              className="max-h-48 sm:max-h-56 rounded-2xl object-contain border-2 border-[#0A254D]/10 shadow-xs"
            />
          </div>
        )}

        {/* Arabic Statement */}
        <div
          dir="rtl"
          className={`text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0A254D] leading-[2.1] ${fontClass}`}
        >
          {statementText}
        </div>

        {/* Indonesian translation */}
        {q.statementIndo && (
          <div className="text-base sm:text-lg text-[#0A254D]/70 font-semibold bg-slate-50 py-2 px-4 rounded-xl inline-block max-w-xl mx-auto">
            "{q.statementIndo}"
          </div>
        )}

        {/* Listen / TTS Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => speakArabic(q.statementArabic)}
            className="px-4 py-2 bg-[#00B4D8]/10 hover:bg-[#00B4D8]/20 text-[#00B4D8] border border-[#00B4D8]/30 text-xs font-black rounded-full transition-all cursor-pointer inline-flex items-center gap-2 active:scale-95"
          >
            <Volume2 className="w-4 h-4" />
            <span>Dengarkan Pelafalan</span>
          </button>
        </div>

        {/* Big Choice Buttons: BENAR (صَحِيح) & SALAH (خَطَأ) */}
        {!isAnswered ? (
          <div className="pt-4 grid grid-cols-2 gap-4 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => handleChoose(true)}
              className="py-5 px-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-3xl font-black text-xl shadow-[0_6px_0_#059669] hover:shadow-[0_8px_0_#059669] active:translate-y-1.5 active:shadow-[0_2px_0_#059669] transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
              <span className="tracking-wide">BENAR</span>
              <span className="text-sm font-bold opacity-90 font-amiri">صَحِيح</span>
            </button>

            <button
              type="button"
              onClick={() => handleChoose(false)}
              className="py-5 px-6 bg-[#FF3B8D] hover:bg-[#E02674] text-white rounded-3xl font-black text-xl shadow-[0_6px_0_#C7175E] hover:shadow-[0_8px_0_#C7175E] active:translate-y-1.5 active:shadow-[0_2px_0_#C7175E] transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5"
            >
              <XCircle className="w-9 h-9 stroke-[2.5]" />
              <span className="tracking-wide">SALAH</span>
              <span className="text-sm font-bold opacity-90 font-amiri">خَطَأ</span>
            </button>
          </div>
        ) : (
          /* Feedback Banner & Explanation */
          <div className="pt-4 space-y-4 max-w-lg mx-auto animate-in fade-in zoom-in-95">
            <GameFeedbackBanner
              isCorrect={isCorrect}
              title={isCorrect ? 'Jawaban Tepat!' : 'Kurang Tepat!'}
              message={
                isCorrect
                  ? `Pernyataan ini memang ${q.isTrue ? 'BENAR' : 'SALAH'}! (+${pointsPerQuestion} Poin)`
                  : `Jawaban yang benar adalah ${q.isTrue ? 'BENAR (صَحِيح)' : 'SALAH (خَطَأ)'}.`
              }
              explanation={q.explanation}
              actionLabel={currentIndex < runtimeQuestions.length - 1 ? 'Soal Berikutnya' : 'Lihat Hasil Akhir'}
              onAction={handleNext}
            />
          </div>
        )}
      </div>
    </div>
  );
}
