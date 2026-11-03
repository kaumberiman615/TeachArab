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
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 text-center shadow-xs max-w-xl mx-auto my-4 space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto text-2xl font-black shadow-xs">
          ✓✗
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Game: Benar atau Salah?
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-2 leading-relaxed">
            Tentukan apakah pernyataan bahasa Arab yang ditampilkan adalah <strong>BENAR</strong> atau <strong>SALAH</strong>!
          </p>
        </div>

        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-xs text-stone-600 space-y-2 text-left">
          <div className="flex justify-between py-1 border-b border-stone-100">
            <span className="text-stone-500">Jumlah Pernyataan:</span>
            <span className="font-bold text-stone-900">{items.length} Soal</span>
          </div>
          <div className="flex justify-between py-1 border-b border-stone-100">
            <span className="text-stone-500">Batas Waktu per Soal:</span>
            <span className="font-bold text-stone-900">{timerLimit > 0 ? `${timerLimit} Detik` : 'Tanpa Batas'}</span>
          </div>
          {isTeam && (
            <div className="flex justify-between py-1">
              <span className="text-stone-500">Mode Tim:</span>
              <span className="font-bold text-indigo-700">{teamCount} Tim Kompetisi</span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={startGame}
          className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-base rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Mulai Bermain</span>
        </button>
      </div>
    );
  }

  // 2. FINISHED SCREEN
  if (gameState === 'finished') {
    const maxScore = runtimeQuestions.length * pointsPerQuestion;
    return (
      <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center shadow-md max-w-xl mx-auto my-4 space-y-6 animate-in fade-in zoom-in-95">
        <div className="w-20 h-20 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
          <Trophy className="w-10 h-10" />
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">Permainan Selesai!</h2>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Kerja bagus! Anda telah menyelesaikan seluruh pernyataan.
          </p>
        </div>

        {isTeam ? (
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Hasil Akhir Tim</h4>
            <div className="grid grid-cols-2 gap-3">
              {teamNames.map((name, idx) => (
                <div key={idx} className="p-3 bg-white border border-stone-200 rounded-xl">
                  <div className="text-xs font-semibold text-stone-600">{name}</div>
                  <div className="text-2xl font-black text-indigo-700 mt-1">{teamScores[idx]}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Skor Akhir</div>
            <div className="text-4xl sm:text-5xl font-black text-emerald-700 mt-1">
              {score} <span className="text-lg text-emerald-600 font-semibold">/ {maxScore}</span>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={startGame}
          className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Mainkan Lagi</span>
        </button>
      </div>
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
    <div className={`space-y-4 max-w-3xl mx-auto ${isProjectorMode ? 'p-4 sm:p-8' : ''}`}>
      {/* Top Bar: Progress, Timer, Team badge, Audio & Fullscreen */}
      <div className="bg-white border border-stone-200 rounded-2xl p-3 px-4 shadow-2xs flex items-center justify-between gap-3">
        {/* Question Counter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-stone-800 bg-stone-100 border border-stone-200 px-2.5 py-1 rounded-lg">
            Soal {currentIndex + 1} / {runtimeQuestions.length}
          </span>

          {timerLimit > 0 && !isAnswered && (
            <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg ${
              timeLeft <= 5 ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-stone-100 text-stone-700'
            }`}>
              <Clock className="w-3.5 h-3.5" />
              <span>{timeLeft}s</span>
            </div>
          )}
        </div>

        {/* Team Indicator */}
        {isTeam && (
          <div className="flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-lg">
            <Users className="w-3.5 h-3.5" />
            <span>Giliran: {teamNames[currentTeam]} ({teamScores[currentTeam]} Poin)</span>
          </div>
        )}

        {/* Controls: Sound & Fullscreen */}
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

      {/* Main Question Card */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-10 shadow-xs text-center space-y-6">
        {imageUrl && (
          <div className="flex justify-center">
            <img
              src={imageUrl}
              alt="Media soal"
              className="max-h-48 sm:max-h-56 rounded-2xl object-contain border border-stone-200 shadow-2xs"
            />
          </div>
        )}

        {/* Arabic Statement */}
        <div
          dir="rtl"
          className={`text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 leading-[1.8] ${fontClass}`}
        >
          {statementText}
        </div>

        {/* Indonesian translation */}
        {q.statementIndo && (
          <div className="text-sm sm:text-base text-stone-500 font-medium">
            "{q.statementIndo}"
          </div>
        )}

        {/* Listen / TTS Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => speakArabic(q.statementArabic)}
            className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Dengarkan Pelafalan</span>
          </button>
        </div>

        {/* Big Choice Buttons: BENAR (صَحِيح) & SALAH (خَطَأ) */}
        {!isAnswered ? (
          <div className="pt-4 grid grid-cols-2 gap-4 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => handleChoose(true)}
              className="py-5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-lg sm:text-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex flex-col items-center justify-center gap-1 active:scale-95"
            >
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              <span>BENAR</span>
              <span className="text-xs font-normal opacity-85">صَحِيح</span>
            </button>

            <button
              type="button"
              onClick={() => handleChoose(false)}
              className="py-5 px-6 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-lg sm:text-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex flex-col items-center justify-center gap-1 active:scale-95"
            >
              <XCircle className="w-8 h-8 stroke-[2.5]" />
              <span>SALAH</span>
              <span className="text-xs font-normal opacity-85">خَطَأ</span>
            </button>
          </div>
        ) : (
          /* Feedback Banner & Explanation */
          <div className="pt-4 space-y-4 max-w-lg mx-auto animate-in fade-in zoom-in-95">
            <div
              className={`p-4 rounded-2xl border flex items-center justify-center gap-2 font-bold text-sm sm:text-base ${
                isCorrect
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Jawaban Tepat! (+{pointsPerQuestion} Poin)</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-600" />
                  <span>
                    Jawaban Kurang Tepat! Jawaban yang benar adalah{' '}
                    <strong>{q.isTrue ? 'BENAR (صَحِيح)' : 'SALAH (خَطَأ)'}</strong>
                  </span>
                </>
              )}
            </div>

            {q.explanation && (
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-left text-xs text-stone-700 flex items-start gap-2">
                <Info className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900">Penjelasan:</strong> {q.explanation}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="w-full py-3.5 bg-stone-900 hover:bg-black text-white font-extrabold text-sm rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <span>{currentIndex < runtimeQuestions.length - 1 ? 'Soal Berikutnya' : 'Lihat Hasil Akhir'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
