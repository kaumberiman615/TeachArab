import React, { useState, useEffect, useRef } from 'react';
import { GuessItem, MediaItem, ThemeConfig, DraftSettings } from '../../types';
import { normalizeArabicText, speakArabic, removeHarakat } from '../../utils/arabic';
import { soundManager } from '../../utils/sound';
import { getMediaUrl } from '../../utils/media';
import ArabicKeyboard from '../../components/ArabicKeyboard';
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
  Eye,
  EyeOff,
  Image as ImageIcon,
  Headphones,
  Keyboard,
  Clock,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import {
  GameStartScreen,
  GameTopBar,
  GameResultScreen,
} from '../../components/game/GameShared';

interface GuessPlayerProps {
  items: GuessItem[];
  theme: ThemeConfig;
  settings: DraftSettings;
  mediaFiles: Record<string, MediaItem>;
  isProjectorMode?: boolean;
}

export default function GuessPlayer({
  items,
  theme,
  settings,
  mediaFiles,
  isProjectorMode = false,
}: GuessPlayerProps) {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'finished'>('start');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [soundMuted, setSoundMuted] = useState(!theme.soundEnabled);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Runtime questions
  const [runtimeItems, setRuntimeItems] = useState<GuessItem[]>([]);
  const [shuffledChoices, setShuffledChoices] = useState<string[]>([]);

  // Text input mode
  const [userAnswer, setUserAnswer] = useState('');
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // State evaluation
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Progressive blur
  const isBlurMode = settings.guessBlurMode || false;
  const [blurLevel, setBlurLevel] = useState(20);

  // Timer
  const timerLimit = settings.guessTimerSeconds || 0;
  const [timeLeft, setTimeLeft] = useState(timerLimit);

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
  const currentMode = currentItem?.answerMode || settings.guessAnswerMode || 'choice';

  const startGame = () => {
    let list = [...items].filter((i) => i.answer && i.answer.trim().length > 0);
    if (list.length === 0) list = [...items];
    if (settings.guessShuffle !== false) {
      list = list.sort(() => Math.random() - 0.5);
    }
    setRuntimeItems(list);
    setCurrentIndex(0);
    setScore(0);
    setCurrentTeam(0);
    setTeamScores(Array(teamCount).fill(0));
    setGameState('playing');
  };

  // Build choices for current item
  useEffect(() => {
    if (gameState !== 'playing' || !currentItem) return;

    setUserAnswer('');
    setSelectedChoice(null);
    setIsEvaluated(false);
    setIsCorrect(false);
    setBlurLevel(isBlurMode ? 20 : 0);
    setTimeLeft(timerLimit);

    if (currentMode === 'choice') {
      let pool = currentItem.wrongChoices?.filter((c) => c && c.trim()) || [];
      // If teacher didn't provide enough wrong choices, fill from other items
      if (pool.length < 3) {
        const otherAnswers = items
          .filter((it) => it.id !== currentItem.id && it.answer)
          .map((it) => it.answer);
        const shuffledOthers = [...otherAnswers].sort(() => Math.random() - 0.5);
        for (const other of shuffledOthers) {
          if (!pool.includes(other) && other !== currentItem.answer) {
            pool.push(other);
          }
          if (pool.length >= 3) break;
        }
      }

      const allChoices = Array.from(new Set([currentItem.answer, ...pool])).sort(
        () => Math.random() - 0.5
      );
      setShuffledChoices(allChoices);
    } else {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [gameState, currentIndex, runtimeItems]);

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'playing' || timerLimit === 0 || isEvaluated) return;

    if (timeLeft <= 0) {
      handleTimeOut();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, timeLeft, timerLimit, isEvaluated]);

  // Progressive unblur timer (stepwise decrease blur if blur mode active)
  useEffect(() => {
    if (gameState !== 'playing' || !isBlurMode || isEvaluated) return;

    const blurInterval = setInterval(() => {
      setBlurLevel((b) => (b > 2 ? Math.max(0, b - 3) : 0));
    }, 2500);

    return () => clearInterval(blurInterval);
  }, [gameState, isBlurMode, isEvaluated]);

  const handleTimeOut = () => {
    setIsEvaluated(true);
    setIsCorrect(false);
    setBlurLevel(0);
    if (!soundMuted) soundManager.playWrong();
  };

  const handleSelectChoice = (choice: string) => {
    if (isEvaluated) return;
    setSelectedChoice(choice);
    setIsEvaluated(true);
    setBlurLevel(0); // clear blur immediately on submit

    const normOpts = { ignoreHarakat: true, normalizeAlif: true, normalizeTaMarbutah: true };
    const correct =
      normalizeArabicText(choice, normOpts) ===
      normalizeArabicText(currentItem.answer, normOpts);

    setIsCorrect(correct);

    const points = 10;
    if (correct) {
      if (!soundMuted) soundManager.playCorrect();
      setScore((s) => s + points);
      if (isTeam) {
        setTeamScores((prev) => {
          const next = [...prev];
          next[currentTeam] = (next[currentTeam] || 0) + points;
          return next;
        });
      }
    } else {
      if (!soundMuted) soundManager.playWrong();
    }
  };

  const handleCheckTextAnswer = () => {
    if (isEvaluated || !userAnswer.trim()) return;
    setIsEvaluated(true);
    setBlurLevel(0);

    const normOpts = { ignoreHarakat: true, normalizeAlif: true, normalizeTaMarbutah: true };
    const correct =
      normalizeArabicText(userAnswer, normOpts) ===
      normalizeArabicText(currentItem.answer, normOpts);

    setIsCorrect(correct);

    const points = 10;
    if (correct) {
      if (!soundMuted) soundManager.playCorrect();
      setScore((s) => s + points);
      if (isTeam) {
        setTeamScores((prev) => {
          const next = [...prev];
          next[currentTeam] = (next[currentTeam] || 0) + points;
          return next;
        });
      }
    } else {
      if (!soundMuted) soundManager.playWrong();
    }
  };

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

  const reduceBlurManually = () => {
    setBlurLevel((b) => Math.max(0, b - 6));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const imageUrl = currentItem?.mediaImageId ? getMediaUrl(mediaFiles[currentItem.mediaImageId]) : null;
  const audioUrl = currentItem?.mediaAudioId ? getMediaUrl(mediaFiles[currentItem.mediaAudioId]) : null;

  const audioRef = useRef<HTMLAudioElement>(null);
  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else if (!audioUrl) {
      speakArabic(currentItem?.answer || '');
    }
  };

  // START SCREEN
  if (gameState === 'start') {
    return (
      <GameStartScreen
        title="Tebak Gambar & Audio"
        description="Perhatikan gambar petunjuk atau dengarkan suara, lalu tebak kosa kata bahasa Arab yang tepat!"
        itemCount={items.length}
        itemLabel="Tebakan"
        onStart={startGame}
        isTeam={isTeam}
        teamCount={teamCount}
        teamNames={teamNames}
        extraInfo={
          <div className="bg-slate-50 border border-[#0A254D]/15 rounded-2xl p-4 text-xs text-[#0A254D] flex items-center justify-around">
            <div>
              <span className="text-[#0A254D]/60 block text-[11px] font-bold">Mode Buram</span>
              <strong className="text-sm font-black text-[#0A254D]">
                {isBlurMode ? 'Aktif (Misterius)' : 'Gambar Jelas'}
              </strong>
            </div>
            <div className="h-6 w-px bg-[#0A254D]/15" />
            <div>
              <span className="text-[#0A254D]/60 block text-[11px] font-bold">Metode Jawab</span>
              <strong className="text-sm font-black text-[#00B4D8]">
                {settings.guessAnswerMode === 'text' ? 'Ketik Mandiri' : 'Pilihan Ganda'}
              </strong>
            </div>
            <div className="h-6 w-px bg-[#0A254D]/15" />
            <div>
              <span className="text-[#0A254D]/60 block text-[11px] font-bold">Waktu</span>
              <strong className="text-sm font-black text-[#FF3B8D]">
                {timerLimit > 0 ? `${timerLimit} Detik` : 'Bebas'}
              </strong>
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
        title="Mumtaz! Tebak Gambar Selesai!"
        message="Luar biasa! Kamu telah berhasil menyelesaikan seluruh tebakan kosakata bahasa Arab."
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
  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto space-y-5">
      <GameTopBar
        score={score}
        scoreLabel="Poin"
        roundText={`Tebakan ${currentIndex + 1} / ${runtimeItems.length}`}
        timerSeconds={timerLimit > 0 && !isEvaluated ? timeLeft : undefined}
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

      {/* Main Game Stage */}
      <div className="bg-white border-2 border-[#0A254D]/15 rounded-3xl p-6 sm:p-8 shadow-[0_8px_0_rgba(10,37,77,0.06)] flex flex-col items-center text-center space-y-6">
        {/* Media Clue Area (Image or Audio) */}
        <div className="w-full flex flex-col items-center">
          {imageUrl ? (
            <div className="relative group max-w-sm w-full h-64 sm:h-72 rounded-3xl overflow-hidden border-2 border-[#0A254D]/15 bg-slate-100 flex items-center justify-center shadow-inner">
              <img
                src={imageUrl}
                alt="Petunjuk tebakan"
                style={{
                  filter: `blur(${blurLevel}px)`,
                  transition: 'filter 0.5s ease-out',
                }}
                className="w-full h-full object-contain p-2"
              />

              {isBlurMode && blurLevel > 0 && !isEvaluated && (
                <button
                  type="button"
                  onClick={reduceBlurManually}
                  className="absolute bottom-3 right-3 px-3.5 py-2 bg-[#0A254D]/85 hover:bg-[#0A254D] text-white text-xs font-black rounded-full backdrop-blur-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
                  title="Pertajam gambar sedikit"
                >
                  <Eye className="w-4 h-4 text-[#FED034]" />
                  <span>Pertajam Gambar</span>
                </button>
              )}
            </div>
          ) : audioUrl ? (
            <div className="w-full max-w-md p-8 bg-sky-50/70 border-2 border-dashed border-[#00B4D8]/40 rounded-3xl flex flex-col items-center justify-center space-y-4">
              <div className="w-20 h-20 bg-[#00B4D8] text-white rounded-full flex items-center justify-center shadow-[0_4px_0_#007791] animate-pulse">
                <Headphones className="w-10 h-10" />
              </div>
              <button
                type="button"
                onClick={playAudio}
                className="px-6 py-3 bg-[#00B4D8] hover:bg-[#0096B4] text-white font-black rounded-full text-sm flex items-center gap-2 cursor-pointer shadow-[0_4px_0_#007791] active:translate-y-1 transition-all"
              >
                <Volume2 className="w-4 h-4" />
                <span>Putar Ulang Audio Clue</span>
              </button>
              <audio ref={audioRef} src={audioUrl} />
            </div>
          ) : (
            <div className="w-full max-w-md p-8 bg-slate-50 border-2 border-[#0A254D]/15 rounded-3xl flex flex-col items-center justify-center space-y-3">
              <div className="w-16 h-16 bg-[#FED034]/40 text-[#0A254D] rounded-2xl flex items-center justify-center">
                <ImageIcon className="w-8 h-8" />
              </div>
              <span className="text-xs text-[#0A254D]/60 font-black">Tebak berdasarkan petunjuk berikut:</span>
              <button
                type="button"
                onClick={() => speakArabic(currentItem.answer)}
                className="px-4 py-2 bg-[#00B4D8]/10 hover:bg-[#00B4D8]/20 text-[#00B4D8] border border-[#00B4D8]/30 rounded-full text-xs font-black flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Volume2 className="w-4 h-4" />
                <span>Dengarkan Pelafalan</span>
              </button>
            </div>
          )}

          {/* Hint text if present */}
          {currentItem.hint && (
            <div className="mt-3 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs font-bold max-w-md">
              💡 <strong>Petunjuk:</strong> {currentItem.hint}
            </div>
          )}
        </div>

        {/* Answer Stage: Choice or Text */}
        {currentMode === 'choice' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-xl">
            {shuffledChoices.map((choice, cIdx) => {
              const isSelected = selectedChoice === choice;
              const isAnswer =
                normalizeArabicText(choice, { ignoreHarakat: true }) ===
                normalizeArabicText(currentItem.answer, { ignoreHarakat: true });

              let btnStyle =
                'bg-white hover:bg-sky-50/50 hover:border-[#00B4D8] border-2 border-[#0A254D]/20 text-[#0A254D] shadow-[0_4px_0_#0A254D] active:translate-y-1';
              if (isEvaluated) {
                if (isAnswer) {
                  btnStyle = 'bg-[#10B981] text-white border-2 border-[#0A254D] font-black shadow-[0_4px_0_#0A254D]';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'bg-rose-500 text-white border-2 border-[#0A254D] font-black shadow-[0_4px_0_#0A254D]';
                } else {
                  btnStyle = 'bg-slate-100 text-[#0A254D]/30 border-2 border-[#0A254D]/10 opacity-60';
                }
              }

              return (
                <button
                  key={cIdx}
                  type="button"
                  disabled={isEvaluated}
                  onClick={() => handleSelectChoice(choice)}
                  className={`p-4.5 rounded-2xl border-2 text-2xl sm:text-3xl transition-all cursor-pointer flex items-center justify-center font-extrabold leading-[2.2] ${fontClass} ${btnStyle}`}
                >
                  <span dir="rtl">{choice}</span>
                </button>
              );
            })}
          </div>
        ) : (
          /* Text input typing mode */
          <div className="w-full max-w-xl space-y-3">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                dir="rtl"
                disabled={isEvaluated}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (isEvaluated) handleNextQuestion();
                    else handleCheckTextAnswer();
                  }
                }}
                placeholder="Ketik nama benda / kata Arab di sini..."
                className={`w-full py-4 px-5 text-2xl sm:text-3xl font-extrabold bg-slate-50 border-2 rounded-2xl focus:bg-white focus:outline-hidden transition-all text-center leading-[2.2] ${fontClass} ${
                  isEvaluated
                    ? isCorrect
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-950 shadow-[0_4px_0_#10B981]'
                      : 'border-rose-400 bg-rose-50 text-rose-950 shadow-[0_4px_0_#FB7185]'
                    : 'border-[#0A254D]/20 focus:border-[#00B4D8] shadow-[0_4px_0_rgba(10,37,77,0.06)]'
                }`}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-[#0A254D]/60 px-1 font-medium">
              <span>Bisa mengetik atau memakai keyboard virtual</span>
              <button
                type="button"
                onClick={() => setShowVirtualKeyboard(!showVirtualKeyboard)}
                className="text-[#00B4D8] hover:text-[#0096B4] font-black flex items-center gap-1.5 cursor-pointer"
              >
                <Keyboard className="w-4 h-4" />
                <span>{showVirtualKeyboard ? 'Tutup Keyboard' : 'Keyboard Arab'}</span>
              </button>
            </div>

            {!isEvaluated && (
              <button
                type="button"
                onClick={handleCheckTextAnswer}
                className="w-full py-3.5 bg-[#00B4D8] hover:bg-[#0096b7] text-white font-black rounded-2xl border-2 border-[#0A254D] shadow-[0_4px_0_#0A254D] active:translate-y-1 transition-all cursor-pointer text-sm flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>Kirim Jawaban</span>
              </button>
            )}
          </div>
        )}

        {/* Feedback Banner */}
        {isEvaluated && (
          <div
            className={`w-full max-w-xl p-5 rounded-3xl border-2 flex flex-col items-center justify-center gap-2 animate-in fade-in zoom-in-95 ${
              isCorrect
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xs'
                : 'bg-rose-50 border-rose-300 text-rose-950 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-2 font-black text-base sm:text-lg">
              {isCorrect ? <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 stroke-[2.5]" /> : <XCircle className="w-6 h-6 text-rose-600 shrink-0 stroke-[2.5]" />}
              <span>{isCorrect ? 'Tebakan Tepat! Mumtaz! 🎉' : 'Sayang sekali, tebakan kurang tepat.'}</span>
            </div>

            {!isCorrect && (
              <div className="text-sm font-medium">
                Jawaban yang benar:{' '}
                <strong dir="rtl" className={`text-xl text-[#0A254D] mx-1 font-extrabold ${fontClass}`}>
                  {currentItem.answer}
                </strong>
              </div>
            )}

            <button
              type="button"
              onClick={handleNextQuestion}
              className="mt-2 px-7 py-3.5 bg-[#FF3B8D] hover:bg-[#e02e7b] text-white font-black rounded-2xl border-2 border-[#0A254D] shadow-[0_4px_0_#0A254D] active:translate-y-1 cursor-pointer flex items-center gap-2 text-sm animate-bounce"
            >
              <span>Lanjut ke Tebakan Berikutnya</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        )}
      </div>

      {/* Embedded Virtual Keyboard (if toggled) */}
      {showVirtualKeyboard && currentMode === 'text' && (
        <div className="bg-white border border-stone-200 rounded-2xl p-3 shadow-md max-w-2xl mx-auto w-full">
          <ArabicKeyboard
            onInsertChar={(char) => {
              setUserAnswer((prev) => prev + char);
              inputRef.current?.focus();
            }}
            onBackspace={() => {
              setUserAnswer((prev) => prev.slice(0, -1));
              inputRef.current?.focus();
            }}
            onEnter={isEvaluated ? handleNextQuestion : handleCheckTextAnswer}
          />
        </div>
      )}
    </div>
  );
}
