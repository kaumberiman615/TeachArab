import React, { useState, useEffect, useRef } from 'react';
import { FillBlankItem, MediaItem, ThemeConfig, DraftSettings } from '../../types';
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
  Lightbulb,
  Keyboard,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import {
  GameStartScreen,
  GameTopBar,
  GameResultScreen,
} from '../../components/game/GameShared';

interface FillBlankPlayerProps {
  items: FillBlankItem[];
  theme: ThemeConfig;
  settings: DraftSettings;
  mediaFiles: Record<string, MediaItem>;
  isProjectorMode?: boolean;
}

export default function FillBlankPlayer({
  items,
  theme,
  settings,
  mediaFiles,
  isProjectorMode = false,
}: FillBlankPlayerProps) {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'finished'>('start');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [soundMuted, setSoundMuted] = useState(!theme.soundEnabled);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Runtime items (can be filtered or shuffled)
  const [runtimeItems, setRuntimeItems] = useState<FillBlankItem[]>([]);

  // Verification state
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Keyboard state
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const startGame = () => {
    let list = [...items].filter((item) => item.question && item.question.trim().length > 0);
    if (list.length === 0) list = [...items];
    if (settings.fbShuffle !== false) {
      list = list.sort(() => Math.random() - 0.5);
    }
    setRuntimeItems(list);
    setCurrentIndex(0);
    setUserAnswer('');
    setScore(0);
    setCurrentTeam(0);
    setTeamScores(Array(teamCount).fill(0));
    setIsEvaluated(false);
    setIsCorrect(false);
    setFeedbackMessage(null);
    setGameState('playing');
  };

  useEffect(() => {
    if (gameState === 'playing' && runtimeItems.length > 0) {
      setUserAnswer('');
      setIsEvaluated(false);
      setIsCorrect(false);
      setFeedbackMessage(null);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [gameState, currentIndex, runtimeItems]);

  // Handle typing from virtual keyboard
  const handleInsertChar = (char: string) => {
    setUserAnswer((prev) => prev + char);
    inputRef.current?.focus();
  };

  const handleBackspace = () => {
    setUserAnswer((prev) => prev.slice(0, -1));
    inputRef.current?.focus();
  };

  // Hint button: reveals first letter of the primary answer
  const handleHint = () => {
    if (isEvaluated && isCorrect || !currentItem) return;
    const primaryAns = currentItem.answers[0] || '';
    if (!primaryAns) return;

    // Cleaned first character
    const cleanLetters = removeHarakat(primaryAns).trim();
    if (cleanLetters.length > 0) {
      const firstChar = cleanLetters[0];
      setFeedbackMessage(`Petunjuk: Huruf pertama jawaban adalah "${firstChar}"`);
      if (soundMuted === false) soundManager.playClick();
    }
  };

  // Check answer
  const handleCheckAnswer = () => {
    if (!currentItem || !userAnswer.trim()) {
      setFeedbackMessage('Ketik jawaban Anda pada kolom yang tersedia!');
      setIsEvaluated(true);
      setIsCorrect(false);
      if (soundMuted === false) soundManager.playWrong();
      return;
    }

    const normOptions = {
      ignoreHarakat: !currentItem.strictHarakat && settings.fbIgnoreHarakat !== false,
      normalizeAlif: settings.fbNormalizeAlif !== false,
      normalizeTaMarbutah: settings.fbNormalizeTaMarbutah !== false,
      normalizeYa: settings.fbNormalizeYa !== false,
      removeTatweel: true,
      trimWhitespace: true,
    };

    const normalizedUser = normalizeArabicText(userAnswer, normOptions);

    const matches = currentItem.answers.some((ans) => {
      const normalizedTarget = normalizeArabicText(ans, normOptions);
      return normalizedTarget === normalizedUser;
    });

    setIsEvaluated(true);
    setIsCorrect(matches);

    const points = settings.fbPointsPerQuestion || 10;

    if (matches) {
      if (soundMuted === false) soundManager.playCorrect();
      setScore((s) => s + points);
      if (isTeam) {
        setTeamScores((prev) => {
          const next = [...prev];
          next[currentTeam] = (next[currentTeam] || 0) + points;
          return next;
        });
      }
      setFeedbackMessage('Jawaban Anda Benar! Mumtaz! 🎉');
    } else {
      if (soundMuted === false) soundManager.playWrong();
      setFeedbackMessage(
        `Kurang tepat. Jawaban yang benar: ${currentItem.answers[0] || ''}`
      );
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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const imageUrl = currentItem?.mediaImageId ? getMediaUrl(mediaFiles[currentItem.mediaImageId]) : null;
  const audioUrl = currentItem?.mediaAudioId ? getMediaUrl(mediaFiles[currentItem.mediaAudioId]) : null;

  const handleSpeak = () => {
    if (currentItem?.question) {
      speakArabic(currentItem.question.replace(/___/g, currentItem.answers[0] || ''));
    }
  };

  // Render question with styled blank slot
  const renderFormattedQuestion = () => {
    if (!currentItem?.question) return null;
    const parts = currentItem.question.split('___');

    if (parts.length === 1) {
      return (
        <span className={`${fontClass} text-2xl sm:text-3xl font-bold text-stone-900 leading-relaxed`}>
          {currentItem.question}
        </span>
      );
    }

    return (
      <div dir="rtl" className="flex items-center justify-center gap-2 flex-wrap text-2xl sm:text-3xl font-bold leading-relaxed">
        <span className={`${fontClass} text-stone-900`}>{parts[0]}</span>
        <span
          className={`inline-block px-3 py-1 rounded-xl border-2 transition-all min-w-[100px] text-center ${fontClass} ${
            userAnswer.trim()
              ? isEvaluated
                ? isCorrect
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                  : 'bg-rose-100 text-rose-900 border-rose-400'
                : 'bg-indigo-50 text-indigo-900 border-indigo-400'
              : 'border-dashed border-indigo-300 text-stone-300 bg-stone-50'
          }`}
        >
          {userAnswer.trim() || '......'}
        </span>
        {parts[1] && <span className={`${fontClass} text-stone-900`}>{parts[1]}</span>}
      </div>
    );
  };

  // START SCREEN
  if (gameState === 'start') {
    return (
      <GameStartScreen
        title="Isian Singkat (إِمْلَاءُ الْفَرَاغِ)"
        description="Lengkapi bagian kalimat yang rumpang dengan mengetik jawaban bahasa Arab yang tepat menggunakan keyboard virtual atau fisik."
        itemCount={items.length}
        itemLabel="Soal Isian"
        onStart={startGame}
        isTeam={isTeam}
        teamCount={teamCount}
        teamNames={teamNames}
        extraInfo={
          <div className="bg-slate-50 border border-[#0A254D]/15 rounded-2xl p-4 text-xs text-[#0A254D] flex items-center justify-around">
            <div>
              <span className="text-[#0A254D]/60 block text-[11px] font-bold">Keyboard Arab</span>
              <strong className="text-sm font-black text-[#0A254D]">Virtual & Fisik</strong>
            </div>
            <div className="h-6 w-px bg-[#0A254D]/15" />
            <div>
              <span className="text-[#0A254D]/60 block text-[11px] font-bold">Cek Harakat</span>
              <strong className="text-sm font-black text-[#00B4D8]">
                {settings.fbIgnoreHarakat === false ? 'Wajib Teliti' : 'Ditolerir'}
              </strong>
            </div>
            <div className="h-6 w-px bg-[#0A254D]/15" />
            <div>
              <span className="text-[#0A254D]/60 block text-[11px] font-bold">Mode Bermain</span>
              <strong className="text-sm font-black text-[#FF3B8D]">
                {isTeam ? 'Kompetisi Tim' : 'Mandiri'}
              </strong>
            </div>
          </div>
        }
      />
    );
  }

  // FINISHED SCREEN
  if (gameState === 'finished') {
    const totalPossible = runtimeItems.length * (settings.fbPointsPerQuestion || 10);

    return (
      <GameResultScreen
        title="Mumtaz! Latihan Isian Selesai!"
        message="Bagus sekali! Kamu telah menyelesaikan seluruh latihan isian singkat dan melengkapi kalimat dengan baik."
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
    <div className="flex flex-col w-full max-w-4xl mx-auto space-y-5">
      <GameTopBar
        score={score}
        scoreLabel="Poin"
        roundText={`Soal ${currentIndex + 1} / ${runtimeItems.length}`}
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

      {/* Main Game Card */}
      <div className="bg-white border-2 border-[#0A254D]/15 rounded-3xl p-6 sm:p-8 shadow-[0_8px_0_rgba(10,37,77,0.06)] flex flex-col items-center text-center space-y-6">
        {/* Media (Image or Audio) */}
        {imageUrl && (
          <div className="w-36 h-36 rounded-2xl overflow-hidden border-2 border-[#0A254D]/10 shadow-xs bg-slate-50 flex items-center justify-center">
            <img src={imageUrl} alt="Petunjuk soal" className="w-full h-full object-contain p-2" />
          </div>
        )}

        {/* Question display */}
        <div className="space-y-3 w-full max-w-2xl">
          <span className="text-xs font-black text-[#0A254D]/60 uppercase tracking-wider block">
            Lengkapi Kalimat di Bawah:
          </span>
          <div className="p-5 bg-sky-50/50 border-2 border-[#00B4D8]/30 rounded-3xl min-h-[96px] flex items-center justify-center">
            {renderFormattedQuestion()}
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleSpeak}
              className="px-4 py-2 bg-[#00B4D8]/10 hover:bg-[#00B4D8]/20 text-[#00B4D8] border border-[#00B4D8]/30 text-xs font-black rounded-full flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <Volume2 className="w-4 h-4" />
              <span>Dengarkan Kalimat</span>
            </button>
            {audioUrl && (
              <audio src={audioUrl} controls className="h-8 max-w-[200px]" />
            )}
          </div>
        </div>

        {/* Input Field Section */}
        <div className="w-full max-w-xl space-y-2.5">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              dir="rtl"
              value={userAnswer}
              onChange={(e) => {
                setUserAnswer(e.target.value);
                setIsEvaluated(false);
                setFeedbackMessage(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (isCorrect) handleNextQuestion();
                  else handleCheckAnswer();
                }
              }}
              placeholder="Ketik jawaban Arab di sini..."
              className={`w-full py-4 px-5 text-2xl sm:text-3xl font-extrabold bg-slate-50 border-2 rounded-2xl focus:bg-white focus:outline-hidden transition-all text-center ${fontClass} leading-[2.2] ${
                isEvaluated
                  ? isCorrect
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 shadow-[0_4px_0_#10B981]'
                    : 'border-rose-400 bg-rose-50/50 text-rose-950 shadow-[0_4px_0_#FB7185]'
                  : 'border-[#0A254D]/20 focus:border-[#00B4D8] shadow-[0_4px_0_rgba(10,37,77,0.06)]'
              }`}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-[#0A254D]/60 px-1 font-medium">
            <span>Dapat mengetik langsung atau gunakan keyboard virtual</span>
            <button
              type="button"
              onClick={() => setShowVirtualKeyboard(!showVirtualKeyboard)}
              className="text-[#00B4D8] hover:text-[#0096B4] font-black flex items-center gap-1.5 cursor-pointer"
            >
              <Keyboard className="w-4 h-4" />
              <span>{showVirtualKeyboard ? 'Sembunyikan Keyboard' : 'Tampilkan Keyboard'}</span>
            </button>
          </div>
        </div>

        {/* Feedback Message Banner */}
        {feedbackMessage && (
          <div
            className={`w-full max-w-xl p-4 rounded-2xl border-2 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 animate-in fade-in zoom-in-95 ${
              isCorrect
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
                : 'bg-rose-50 border-rose-300 text-rose-900 shadow-xs'
            }`}
          >
            {isCorrect ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Explanation (if answered) */}
        {isEvaluated && currentItem.explanation && (
          <div className="w-full max-w-xl p-3.5 bg-slate-50 border border-[#0A254D]/15 rounded-2xl text-left text-xs text-[#0A254D] leading-relaxed">
            <span className="font-black text-[#0A254D] block mb-0.5">Penjelasan:</span>
            {currentItem.explanation}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 justify-center pt-1">
          {!isCorrect ? (
            <>
              <button
                type="button"
                onClick={handleCheckAnswer}
                className="px-8 py-3.5 bg-[#00B4D8] hover:bg-[#0096b7] text-white font-black rounded-2xl border-2 border-[#0A254D] shadow-[0_4px_0_#0A254D] active:translate-y-1 transition-all flex items-center gap-2 cursor-pointer text-sm"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>Periksa Jawaban</span>
              </button>

              <button
                type="button"
                onClick={handleHint}
                className="px-5 py-3.5 bg-[#FED034] hover:bg-[#e0b820] text-[#0A254D] border-2 border-[#0A254D] font-black rounded-2xl shadow-[0_4px_0_#0A254D] active:translate-y-1 transition-all flex items-center gap-1.5 cursor-pointer text-sm"
                title="Buka huruf pertama"
              >
                <Lightbulb className="w-4 h-4 text-[#0A254D]" />
                <span>Petunjuk</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleNextQuestion}
              className="px-9 py-3.5 bg-[#FF3B8D] hover:bg-[#e02e7b] text-white font-black rounded-2xl border-2 border-[#0A254D] shadow-[0_5px_0_#0A254D] active:translate-y-1 transition-all flex items-center gap-2 cursor-pointer text-base animate-bounce"
            >
              <span>Soal Berikutnya</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>

      {/* Embedded Virtual Keyboard (if toggled) */}
      {showVirtualKeyboard && (
        <div className="bg-white border-2 border-[#0A254D]/15 rounded-3xl p-4 shadow-lg max-w-2xl mx-auto w-full">
          <ArabicKeyboard
            onInsertChar={handleInsertChar}
            onBackspace={handleBackspace}
            onEnter={isCorrect ? handleNextQuestion : handleCheckAnswer}
          />
        </div>
      )}
    </div>
  );
}
