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
      <div className="flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto my-auto min-h-[460px]">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-3xl flex items-center justify-center mb-6 shadow-inner animate-bounce">
          <Eye className="w-10 h-10" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mb-2">
          Game Tebak Gambar & Audio
        </h1>
        <p className="text-stone-600 text-sm leading-relaxed mb-6 max-w-md">
          Perhatikan gambar petunjuk atau dengarkan suara, lalu tebak kosa kata bahasa Arab yang tepat!
        </p>

        {isTeam && (
          <div className="w-full bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 text-left">
            <div className="flex items-center gap-2 font-bold text-xs text-emerald-900 mb-2 uppercase tracking-wider">
              <Users className="w-4 h-4 text-emerald-700" />
              <span>Kompetisi Mode Tim ({teamCount} Tim)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {teamNames.map((name, i) => (
                <div key={i} className="bg-white p-2 rounded-lg border border-emerald-100 font-semibold text-stone-800">
                  {name}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 w-full mb-6 text-xs text-stone-600 flex items-center justify-around">
          <div>
            <span className="text-stone-400 block text-[11px]">Jumlah Tebakan</span>
            <strong className="text-sm font-bold text-stone-900">{items.length} Soal</strong>
          </div>
          <div className="h-6 w-px bg-stone-200" />
          <div>
            <span className="text-stone-400 block text-[11px]">Mode Buram</span>
            <strong className="text-sm font-bold text-stone-900">
              {isBlurMode ? 'Aktif (Misterius)' : 'Gambar Jelas'}
            </strong>
          </div>
          <div className="h-6 w-px bg-stone-200" />
          <div>
            <span className="text-stone-400 block text-[11px]">Metode Jawab</span>
            <strong className="text-sm font-bold text-stone-900">
              {settings.guessAnswerMode === 'text' ? 'Ketik Mandiri' : 'Pilihan Ganda'}
            </strong>
          </div>
        </div>

        <button
          type="button"
          onClick={startGame}
          className="w-full sm:w-auto px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold rounded-2xl shadow-lg shadow-emerald-700/30 flex items-center justify-center gap-2 cursor-pointer transition-all text-base"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Mulai Menebak</span>
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
        <p className="text-xs text-stone-500 mb-6">Hebat! Kamu telah menyelesaikan tebakan dengan baik.</p>

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
                  <span className="font-extrabold text-base text-emerald-700">{teamScores[idx]} Poin</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6">
            <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Total Skor</div>
            <div className="text-4xl font-black text-emerald-700 mb-1">
              {score} <span className="text-lg font-medium text-emerald-400">/ {totalPossible}</span>
            </div>
            <div className="text-xs font-semibold text-emerald-800">Ketepatan: {pct}%</div>
          </div>
        )}

        <button
          type="button"
          onClick={startGame}
          className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Main Lagi</span>
        </button>
      </div>
    );
  }

  // PLAYING SCREEN
  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto space-y-4">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between bg-white border border-stone-200 rounded-2xl p-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-100">
            Tebakan {currentIndex + 1} / {runtimeItems.length}
          </div>
          {isTeam && (
            <div className="px-3 py-1 bg-amber-50 text-amber-900 rounded-xl text-xs font-bold border border-amber-200 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-700" />
              <span>Giliran: {teamNames[currentTeam]}</span>
            </div>
          )}
          {timerLimit > 0 && (
            <div
              className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 border ${
                timeLeft <= 5
                  ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                  : 'bg-stone-50 text-stone-700 border-stone-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{timeLeft}s</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-stone-100 text-stone-800 rounded-xl text-xs font-bold">
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

      {/* Main Game Stage */}
      <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-8 shadow-xs flex flex-col items-center text-center space-y-6">
        {/* Media Clue Area (Image or Audio) */}
        <div className="w-full flex flex-col items-center">
          {imageUrl ? (
            <div className="relative group max-w-sm w-full h-64 sm:h-72 rounded-3xl overflow-hidden border-2 border-stone-200 bg-stone-100 flex items-center justify-center shadow-inner">
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
                  className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/70 hover:bg-black/85 text-white text-xs font-bold rounded-xl backdrop-blur-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                  title="Pertajam gambar sedikit"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Pertajam Gambar</span>
                </button>
              )}
            </div>
          ) : audioUrl ? (
            <div className="w-full max-w-md p-8 bg-emerald-50/60 border-2 border-dashed border-emerald-200 rounded-3xl flex flex-col items-center justify-center space-y-4">
              <div className="w-20 h-20 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-md animate-pulse">
                <Headphones className="w-10 h-10" />
              </div>
              <button
                type="button"
                onClick={playAudio}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl text-sm flex items-center gap-2 cursor-pointer shadow-sm transition-all"
              >
                <Volume2 className="w-4 h-4" />
                <span>Putar Ulang Audio Clue</span>
              </button>
              <audio ref={audioRef} src={audioUrl} />
            </div>
          ) : (
            <div className="w-full max-w-md p-8 bg-stone-50 border-2 border-stone-200 rounded-3xl flex flex-col items-center justify-center space-y-3">
              <div className="w-16 h-16 bg-stone-200 text-stone-500 rounded-2xl flex items-center justify-center">
                <ImageIcon className="w-8 h-8" />
              </div>
              <span className="text-xs text-stone-400 font-semibold">Tebak berdasarkan petunjuk berikut:</span>
              <button
                type="button"
                onClick={() => speakArabic(currentItem.answer)}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Dengarkan Pelafalan</span>
              </button>
            </div>
          )}

          {/* Hint text if present */}
          {currentItem.hint && (
            <div className="mt-3 px-4 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-medium max-w-md">
              💡 <strong>Petunjuk:</strong> {currentItem.hint}
            </div>
          )}
        </div>

        {/* Answer Stage: Choice or Text */}
        {currentMode === 'choice' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
            {shuffledChoices.map((choice, cIdx) => {
              const isSelected = selectedChoice === choice;
              const isAnswer =
                normalizeArabicText(choice, { ignoreHarakat: true }) ===
                normalizeArabicText(currentItem.answer, { ignoreHarakat: true });

              let btnStyle = 'bg-stone-50 hover:bg-emerald-50/60 border-stone-200 text-stone-800 hover:border-emerald-300';
              if (isEvaluated) {
                if (isAnswer) {
                  btnStyle = 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-sm';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'bg-rose-500 text-white border-rose-500 font-bold';
                } else {
                  btnStyle = 'bg-stone-100 text-stone-400 border-stone-200 opacity-60';
                }
              }

              return (
                <button
                  key={cIdx}
                  type="button"
                  disabled={isEvaluated}
                  onClick={() => handleSelectChoice(choice)}
                  className={`p-4 rounded-2xl border-2 text-2xl sm:text-3xl transition-all cursor-pointer flex items-center justify-center ${fontClass} ${btnStyle}`}
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
                className={`w-full py-3.5 px-4 text-2xl font-bold bg-stone-50 border-2 rounded-2xl focus:bg-white focus:outline-hidden transition-all text-center ${fontClass} ${
                  isEvaluated
                    ? isCorrect
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                      : 'border-rose-400 bg-rose-50 text-rose-900'
                    : 'border-stone-300 focus:border-emerald-600'
                }`}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-stone-500 px-1">
              <span>Bisa mengetik atau memakai keyboard virtual</span>
              <button
                type="button"
                onClick={() => setShowVirtualKeyboard(!showVirtualKeyboard)}
                className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Keyboard className="w-3.5 h-3.5" />
                <span>{showVirtualKeyboard ? 'Tutup Keyboard' : 'Keyboard Arab'}</span>
              </button>
            </div>

            {!isEvaluated && (
              <button
                type="button"
                onClick={handleCheckTextAnswer}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer text-sm flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Kirim Jawaban</span>
              </button>
            )}
          </div>
        )}

        {/* Feedback Banner */}
        {isEvaluated && (
          <div
            className={`w-full max-w-xl p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 animate-fadeIn ${
              isCorrect
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
              {isCorrect ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
              <span>{isCorrect ? 'Tebakan Tepat! Mumtaz! 🎉' : 'Sayang sekali, tebakan kurang tepat.'}</span>
            </div>

            {!isCorrect && (
              <div className="text-xs">
                Jawaban yang benar:{' '}
                <strong dir="rtl" className={`text-base text-stone-900 mx-1 ${fontClass}`}>
                  {currentItem.answer}
                </strong>
              </div>
            )}

            <button
              type="button"
              onClick={handleNextQuestion}
              className="mt-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 text-xs sm:text-sm animate-pulse"
            >
              <span>Lanjut ke Tebakan Berikutnya</span>
              <ArrowRight className="w-4 h-4" />
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
