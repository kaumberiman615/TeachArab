import { useState, useEffect, useRef } from 'react';
import { QuizItem, MediaItem, ThemeConfig, DraftSettings, QuizChoice } from '../../types';
import { speakArabic, removeHarakat } from '../../utils/arabic';
import { soundManager } from '../../utils/sound';
import { normalizeQuizChoices } from './schema';
import {
  Volume2,
  Trophy,
  RotateCcw,
  Maximize2,
  Minimize2,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Play,
  VolumeX,
} from 'lucide-react';

interface QuizPlayerProps {
  items: QuizItem[];
  theme: ThemeConfig;
  settings: DraftSettings;
  mediaFiles: Record<string, MediaItem>;
  isProjectorMode?: boolean;
}

interface RuntimeQuestion {
  id: string;
  questionArabic: string;
  questionIndo?: string;
  choices: { text: string; mediaImageId?: string; isOriginalCorrect: boolean }[];
  explanation?: string;
  mediaImageId?: string;
  mediaAudioId?: string;
}

export default function QuizPlayer({
  items,
  theme,
  settings,
  mediaFiles,
  isProjectorMode = false,
}: QuizPlayerProps) {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'finished'>('start');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(settings.timerSeconds || 0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundMuted, setSoundMuted] = useState(!theme.soundEnabled);

  // Runtime questions list (prepared after shuffle settings applied)
  const [runtimeQuestions, setRuntimeQuestions] = useState<RuntimeQuestion[]>([]);

  // Team mode state
  const isTeam = settings.teamMode;
  const teamCount = settings.teamCount || 2;
  const teamNames = settings.teamNames || ['Tim Merah', 'Tim Biru', 'Tim Hijau', 'Tim Kuning'].slice(0, teamCount);
  const [currentTeamIdx, setCurrentTeamIdx] = useState(0);
  const [teamScores, setTeamScores] = useState<number[]>(Array(teamCount).fill(0));

  const timerRef = useRef<number | null>(null);

  // Points per question
  const pointsPerQuestion = settings.pointsPerQuestion || 10;

  useEffect(() => {
    soundManager.setMuted(soundMuted);
  }, [soundMuted]);

  // Prepare questions for a game session
  const prepareQuestions = () => {
    let list = (items || []).map((q) => {
      const normalizedChoices = normalizeQuizChoices(q.choices);
      // Map choices with indicator of whether it's correct
      let choicesMapped = normalizedChoices.map((c, idx) => ({
        text: c.text,
        mediaImageId: c.mediaImageId,
        isOriginalCorrect: idx === q.correctIndex,
      }));

      // Shuffle choices if enabled
      if (settings.shuffleChoices) {
        choicesMapped = [...choicesMapped].sort(() => Math.random() - 0.5);
      }

      return {
        id: q.id,
        questionArabic: q.questionArabic,
        questionIndo: q.questionIndo,
        choices: choicesMapped,
        explanation: q.explanation,
        mediaImageId: q.mediaImageId,
        mediaAudioId: q.mediaAudioId,
      };
    });

    // Shuffle questions if enabled
    if (settings.shuffleQuestions) {
      list = [...list].sort(() => Math.random() - 0.5);
    }

    setRuntimeQuestions(list);
  };

  useEffect(() => {
    prepareQuestions();
  }, [items, settings.shuffleQuestions, settings.shuffleChoices]);

  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
        <p className="text-stone-500 font-medium">Belum ada soal kuis untuk dimainkan.</p>
      </div>
    );
  }

  const currentQuestion = runtimeQuestions[currentIndex] || {
    id: 'placeholder',
    questionArabic: '',
    choices: [],
  };

  const fontClass =
    theme.fontFamily === 'Noto Naskh Arabic'
      ? 'font-noto'
      : theme.fontFamily === 'Scheherazade New'
      ? 'font-scheherazade'
      : 'font-amiri';

  // Timer countdown
  useEffect(() => {
    if (
      gameState !== 'playing' ||
      hasAnswered ||
      !settings.timerSeconds ||
      settings.timerSeconds <= 0
    ) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setTimeLeft(settings.timerSeconds);
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAnswer(-1); // Timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, currentIndex, hasAnswered, settings.timerSeconds]);

  // Start Game
  const handleStartGame = () => {
    prepareQuestions();
    setGameState('playing');
    setCurrentIndex(0);
    setScore(0);
    setHasAnswered(false);
    setSelectedChoice(null);
    setCurrentTeamIdx(0);
    setTeamScores(Array(teamCount).fill(0));
    soundManager.playClick();
  };

  // Answer handler
  const handleAnswer = (choiceIdx: number) => {
    if (hasAnswered) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedChoice(choiceIdx);
    setHasAnswered(true);

    const isCorrect =
      choiceIdx >= 0 &&
      currentQuestion.choices[choiceIdx] &&
      currentQuestion.choices[choiceIdx].isOriginalCorrect;

    if (isCorrect) {
      soundManager.playCorrect();
      if (isTeam) {
        setTeamScores((prev) => {
          const next = [...prev];
          next[currentTeamIdx] += pointsPerQuestion;
          return next;
        });
      } else {
        setScore((prev) => prev + pointsPerQuestion);
      }
    } else {
      soundManager.playIncorrect();
    }
  };

  // Next Question
  const handleNextQuestion = () => {
    soundManager.playClick();
    if (isTeam) {
      setCurrentTeamIdx((prev) => (prev + 1) % teamCount);
    }

    if (currentIndex < runtimeQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedChoice(null);
      setHasAnswered(false);
    } else {
      soundManager.playVictory();
      setGameState('finished');
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const currentImage = currentQuestion.mediaImageId ? mediaFiles[currentQuestion.mediaImageId] : null;
  const currentAudio = currentQuestion.mediaAudioId ? mediaFiles[currentQuestion.mediaAudioId] : null;

  // 1. START SCREEN
  if (gameState === 'start') {
    return (
      <div className="bg-white border border-stone-200 rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mb-2">
          Kuis Pilihan Ganda
        </h2>
        <p className="text-stone-600 text-sm mb-6">
          Uji pemahaman bahasa Arab dengan {items.length} pertanyaan pilihan ganda interaktif.
        </p>

        {isTeam ? (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl max-w-md mx-auto text-xs text-left space-y-2">
            <div className="font-bold text-emerald-900 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-700" /> Mode Kompetisi Tim ({teamCount} Tim):
            </div>
            <p className="text-emerald-800">
              Setiap soal dijawab bergiliran oleh tim. Poin akan ditambahkan ke tim yang menjawab benar.
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
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-emerald-600" />
              {settings.timerSeconds ? `${settings.timerSeconds} Detik / Soal` : 'Tanpa Timer'}
            </span>
            <span>·</span>
            <span>{pointsPerQuestion} Poin / Soal Benar</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleStartGame}
          className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-base shadow-md cursor-pointer transition-all inline-flex items-center gap-2"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Mulai Kuis Sekarang</span>
        </button>
      </div>
    );
  }

  // 2. FINISHED / RESULT SCREEN
  if (gameState === 'finished') {
    return (
      <div className="bg-white border border-stone-200 rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm">
        <div className="text-5xl mb-3">🎉</div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mb-2">
          Kuis Selesai!
        </h2>
        <p className="text-stone-600 text-sm mb-6">
          Mumtaz! Seluruh pertanyaan telah selesai dijawab.
        </p>

        {isTeam ? (
          <div className="space-y-3 max-w-md mx-auto mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 text-left">
              Papan Skor Akhir Tim:
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
              Skor Perolehan
            </div>
            <div className="text-5xl font-black text-emerald-700">{score}</div>
            <div className="text-xs text-stone-600 mt-2">
              dari total {items.length * pointsPerQuestion} poin maksimal
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleStartGame}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md cursor-pointer transition-all inline-flex items-center gap-2 active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Ulangi Kuis dari Awal</span>
        </button>
      </div>
    );
  }

  // 3. PLAYING SCREEN (1 question per screen)
  const displayArabicQuestion = theme.showHarakat
    ? currentQuestion.questionArabic
    : removeHarakat(currentQuestion.questionArabic);

  const choiceLetters = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className={`flex flex-col select-none ${isProjectorMode ? 'max-w-4xl mx-auto py-2' : 'w-full'}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-stone-700 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200">
            Soal {currentIndex + 1} / {runtimeQuestions.length}
          </span>
          {settings.timerSeconds && settings.timerSeconds > 0 && (
            <span
              className={`flex items-center gap-1 font-bold px-2.5 py-1 rounded-lg border ${
                timeLeft <= 5
                  ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                  : 'bg-stone-100 text-stone-700 border-stone-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{timeLeft}s</span>
            </span>
          )}
        </div>

        {/* Team Scoreboard or Single Score */}
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
          <div className="font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            Skor: {score}
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

      {/* Progress Bar */}
      <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden mb-4">
        <div
          className="bg-emerald-600 h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / runtimeQuestions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white border-2 border-stone-200 rounded-2xl p-6 sm:p-8 mb-5 shadow-xs text-center">
        {isTeam && (
          <div className="mb-3 inline-block px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-bold">
            Giliran Menjawab: {teamNames[currentTeamIdx]}
          </div>
        )}

        {currentImage && (
          <img
            src={URL.createObjectURL(currentImage.blob)}
            alt="Soal"
            className="max-h-36 sm:max-h-48 mx-auto mb-4 rounded-xl object-contain border border-stone-200"
          />
        )}

        {currentQuestion.questionArabic && (
          <div
            className={`arabic-text ${fontClass} text-2xl sm:text-4xl font-bold text-emerald-800 leading-loose`}
          >
            {displayArabicQuestion}
          </div>
        )}

        {currentQuestion.questionIndo && (
          <div className="text-base sm:text-xl font-semibold text-stone-800 mt-2">
            {currentQuestion.questionIndo}
          </div>
        )}

        <div className="flex justify-center items-center gap-2 mt-4">
          {currentQuestion.questionArabic && (
            <button
              type="button"
              onClick={() => speakArabic(currentQuestion.questionArabic)}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Bacakan Pertanyaan</span>
            </button>
          )}

          {currentAudio && (
            <button
              type="button"
              onClick={() => {
                const url = URL.createObjectURL(currentAudio.blob);
                new Audio(url).play();
              }}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Audio Rekaman Guru</span>
            </button>
          )}
        </div>
      </div>

      {/* Choices Grid (2 to 5 choices) */}
      <div
        className={`grid gap-3 mb-6 ${
          currentQuestion.choices.length <= 2
            ? 'grid-cols-1 sm:grid-cols-2'
            : currentQuestion.choices.length === 3
            ? 'grid-cols-1 sm:grid-cols-3'
            : 'grid-cols-1 sm:grid-cols-2'
        }`}
      >
        {currentQuestion.choices.map((choice, idx) => {
          const isSelected = selectedChoice === idx;
          const isCorrectChoice = choice.isOriginalCorrect;
          let btnStyle =
            'border-stone-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/40 text-stone-800';

          if (hasAnswered) {
            if (isCorrectChoice) {
              btnStyle =
                'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-300 font-bold';
            } else if (isSelected && !isCorrectChoice) {
              btnStyle =
                'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-200 font-bold';
            } else {
              btnStyle = 'border-stone-200 bg-stone-50 text-stone-400 opacity-60';
            }
          }

          const isChoiceArabic = /[\u0600-\u06FF]/.test(choice.text);
          const choiceImg = choice.mediaImageId ? mediaFiles[choice.mediaImageId] : null;

          return (
            <button
              key={idx}
              type="button"
              disabled={hasAnswered}
              onClick={() => handleAnswer(idx)}
              className={`p-4 rounded-xl border-2 text-left flex items-center gap-3 transition-all cursor-pointer shadow-2xs ${btnStyle}`}
            >
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                  hasAnswered && isCorrectChoice
                    ? 'bg-emerald-600 text-white'
                    : hasAnswered && isSelected
                    ? 'bg-rose-600 text-white'
                    : 'bg-stone-100 text-stone-700'
                }`}
              >
                {choiceLetters[idx]}
              </span>

              <div className="flex-1 flex items-center gap-2 overflow-hidden">
                {choiceImg && (
                  <img
                    src={URL.createObjectURL(choiceImg.blob)}
                    alt="Foto Pilihan"
                    className="w-12 h-12 object-cover rounded border border-stone-200 shrink-0"
                  />
                )}
                <span
                  className={`${
                    isChoiceArabic
                      ? `${fontClass} arabic-text text-xl leading-loose`
                      : 'text-base font-medium'
                  }`}
                >
                  {theme.showHarakat ? choice.text : removeHarakat(choice.text)}
                </span>
              </div>

              {hasAnswered && isCorrectChoice && (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              )}
              {hasAnswered && isSelected && !isCorrectChoice && (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Answer feedback & Next button */}
      {hasAnswered && (
        <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
          <div className="text-xs sm:text-sm text-stone-700">
            {selectedChoice !== null &&
            selectedChoice >= 0 &&
            currentQuestion.choices[selectedChoice]?.isOriginalCorrect ? (
              <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Jawaban Tepat! (+{pointsPerQuestion} Poin)
              </span>
            ) : (
              <span className="font-bold text-rose-700 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" /> Belum Tepat.{' '}
                {currentQuestion.choices.findIndex((c) => c.isOriginalCorrect) >= 0 && (
                  <>
                    Kunci jawaban: Pilihan{' '}
                    {
                      choiceLetters[
                        currentQuestion.choices.findIndex((c) => c.isOriginalCorrect)
                      ]
                    }
                  </>
                )}
              </span>
            )}
            {currentQuestion.explanation && (
              <p className="mt-1 text-stone-600 text-xs">
                <strong>Penjelasan:</strong> {currentQuestion.explanation}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleNextQuestion}
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm cursor-pointer shadow-md transition-all shrink-0"
          >
            {currentIndex === runtimeQuestions.length - 1
              ? 'Lihat Hasil Akhir →'
              : 'Soal Berikutnya →'}
          </button>
        </div>
      )}
    </div>
  );
}
