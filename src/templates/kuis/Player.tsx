import { useState, useEffect, useRef } from 'react';
import { QuizItem, MediaItem, ThemeConfig, DraftSettings, QuizChoice } from '../../types';
import { speakArabic, removeHarakat } from '../../utils/arabic';
import { soundManager } from '../../utils/sound';
import { normalizeQuizChoices } from './schema';
import { getMediaUrl } from '../../utils/media';
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
import {
  GameStartScreen,
  GameTopBar,
  GameFeedbackBanner,
  GameResultScreen,
} from '../../components/game/GameShared';

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

  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border-2 border-dashed border-stone-200 flex flex-col items-center justify-center space-y-3 min-h-[360px]">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center text-3xl font-black">
          ❓
        </div>
        <h3 className="text-lg font-black text-[#0A254D]">Belum Ada Soal Kuis</h3>
        <p className="text-stone-500 text-xs sm:text-sm max-w-sm">
          Belum ada soal kuis untuk dimainkan. Tambahkan pertanyaan di editor terlebih dahulu.
        </p>
      </div>
    );
  }

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
      <GameStartScreen
        title="Kuis Pilihan Ganda"
        description={`Uji pemahaman bahasa Arab dengan ${items.length} pertanyaan pilihan ganda interaktif dan seru!`}
        badge="Game Cerdas Cermat"
        itemsCount={items.length}
        itemsLabel="Soal"
        timerSeconds={settings.timerSeconds}
        pointsPerQuestion={pointsPerQuestion}
        isTeam={isTeam}
        teamCount={teamCount}
        teamNames={teamNames}
        icon={<Trophy className="w-10 h-10 text-pink-bubble" />}
        onStart={handleStartGame}
      />
    );
  }

  // 2. FINISHED / RESULT SCREEN
  if (gameState === 'finished') {
    return (
      <GameResultScreen
        title="Kuis Selesai! Mumtaz!"
        subtitle="Alhamdulillah, seluruh pertanyaan kuis berhasil dijawab."
        score={score}
        maxScore={items.length * pointsPerQuestion}
        isTeam={isTeam}
        teamNames={teamNames}
        teamScores={teamScores}
        onRestart={handleStartGame}
      />
    );
  }

  // 3. PLAYING SCREEN (1 question per screen)
  const displayArabicQuestion = theme.showHarakat
    ? currentQuestion.questionArabic
    : removeHarakat(currentQuestion.questionArabic);

  const choiceLetters = ['A', 'B', 'C', 'D', 'E'];
  const isCorrect = selectedChoice !== null && currentQuestion.choices[selectedChoice]?.isOriginalCorrect;
  const correctChoiceIdx = currentQuestion.choices.findIndex((c) => c.isOriginalCorrect);

  return (
    <div className={`flex flex-col select-none text-navy-deep ${isProjectorMode ? 'max-w-4xl mx-auto py-2' : 'w-full'}`}>
      {/* Top Bar with Bubble Bash styling */}
      <GameTopBar
        progressText={`Soal ${currentIndex + 1} / ${runtimeQuestions.length}`}
        progressPercent={((currentIndex + 1) / runtimeQuestions.length) * 100}
        timerLimit={settings.timerSeconds || 0}
        timeLeft={timeLeft}
        score={score}
        isTeam={isTeam}
        teamNames={teamNames}
        teamScores={teamScores}
        currentTeamIdx={currentTeamIdx}
        soundMuted={soundMuted}
        onToggleSound={() => setSoundMuted(!soundMuted)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* Question Card */}
      <div className="bg-white border-2 border-stone-200 rounded-3xl p-6 sm:p-10 mb-5 shadow-xs text-center relative overflow-hidden">
        {isTeam && (
          <div className="mb-4 inline-block px-4 py-1.5 bg-yellow-bubble/25 text-navy-deep border border-yellow-bubble rounded-full text-xs font-black shadow-xs">
            🎯 Giliran Menjawab: {teamNames[currentTeamIdx]}
          </div>
        )}

        {getMediaUrl(currentImage) && (
          <img
            src={getMediaUrl(currentImage)!}
            alt="Soal"
            className="max-h-40 sm:max-h-52 mx-auto mb-4 rounded-2xl object-contain border-2 border-stone-100 shadow-sm"
          />
        )}

        {currentQuestion.questionArabic && (
          <div
            className={`arabic-text ${fontClass} text-3xl sm:text-4xl md:text-5xl font-black text-navy-deep leading-relaxed`}
          >
            {displayArabicQuestion}
          </div>
        )}

        {currentQuestion.questionIndo && (
          <div className="text-base sm:text-xl font-bold text-stone-700 mt-3">
            {currentQuestion.questionIndo}
          </div>
        )}

        <div className="flex justify-center items-center gap-2 mt-5">
          {currentQuestion.questionArabic && (
            <button
              type="button"
              onClick={() => speakArabic(currentQuestion.questionArabic)}
              className="min-h-[40px] px-4 py-2 bg-cyan-ice hover:bg-cyan-bubble hover:text-white text-cyan-bubble border border-cyan-bubble/30 rounded-full text-xs font-black flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              <span>Bacakan Pertanyaan</span>
            </button>
          )}

          {getMediaUrl(currentAudio) && (
            <button
              type="button"
              onClick={() => {
                const url = getMediaUrl(currentAudio);
                if (url) new Audio(url).play();
              }}
              className="min-h-[40px] px-4 py-2 bg-stone-100 hover:bg-stone-200 text-navy-deep border border-stone-200 rounded-full text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Volume2 className="w-4 h-4 text-cyan-bubble" />
              <span>Audio Guru</span>
            </button>
          )}
        </div>
      </div>

      {/* Choices Grid (2 to 5 choices) with big tactile buttons */}
      <div
        className={`grid gap-3.5 mb-6 ${
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
            'border-stone-200 bg-white hover:border-yellow-bubble hover:bg-yellow-bubble/10 text-navy-deep hover:shadow-sm';

          if (hasAnswered) {
            if (isCorrectChoice) {
              btnStyle =
                'border-emerald-500 bg-emerald-50 text-emerald-950 ring-3 ring-emerald-300 font-black shadow-xs';
            } else if (isSelected && !isCorrectChoice) {
              btnStyle =
                'border-rose-500 bg-rose-50 text-rose-950 ring-3 ring-rose-200 font-black shadow-xs';
            } else {
              btnStyle = 'border-stone-200 bg-stone-50 text-stone-400 opacity-50';
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
              className={`min-h-[64px] p-4 sm:p-5 rounded-2xl border-2 text-left flex items-center gap-3.5 transition-all cursor-pointer ${btnStyle} active:scale-98`}
            >
              <span
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border transition-colors ${
                  hasAnswered && isCorrectChoice
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : hasAnswered && isSelected
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-stone-100 text-navy-deep border-stone-200'
                }`}
              >
                {choiceLetters[idx]}
              </span>

              <div className="flex-1 flex items-center gap-3 overflow-hidden">
                {getMediaUrl(choiceImg) && (
                  <img
                    src={getMediaUrl(choiceImg)!}
                    alt="Foto Pilihan"
                    className="w-14 h-14 object-cover rounded-xl border border-stone-200 shrink-0"
                  />
                )}
                <span
                  className={`${
                    isChoiceArabic
                      ? `${fontClass} arabic-text text-2xl font-bold leading-loose text-navy-deep`
                      : 'text-base sm:text-lg font-bold'
                  }`}
                >
                  {theme.showHarakat ? choice.text : removeHarakat(choice.text)}
                </span>
              </div>

              {hasAnswered && isCorrectChoice && (
                <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
              )}
              {hasAnswered && isSelected && !isCorrectChoice && (
                <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Answer feedback & Next button */}
      {hasAnswered && (
        <GameFeedbackBanner
          isCorrect={Boolean(isCorrect)}
          pointsAwarded={pointsPerQuestion}
          correctAnswerText={correctChoiceIdx >= 0 ? `Pilihan ${choiceLetters[correctChoiceIdx]}: ${currentQuestion.choices[correctChoiceIdx].text}` : undefined}
          explanation={currentQuestion.explanation}
          onNext={handleNextQuestion}
          nextButtonText={currentIndex === runtimeQuestions.length - 1 ? 'Lihat Hasil Akhir →' : 'Soal Berikutnya →'}
        />
      )}
    </div>
  );
}
