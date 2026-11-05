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
      <div className="flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto my-auto min-h-[460px]">
        <div className="w-20 h-20 bg-indigo-100 text-indigo-700 rounded-3xl flex items-center justify-center mb-6 shadow-inner animate-bounce">
          <Sparkles className="w-10 h-10" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mb-2">
          Game Isian Singkat & Lengkapi Kalimat
        </h1>
        <p className="text-stone-600 text-sm leading-relaxed mb-6 max-w-md">
          Lengkapi bagian kalimat yang rumpang dengan mengetik jawaban bahasa Arab yang tepat menggunakan keyboard virtual atau fisik.
        </p>

        {isTeam && (
          <div className="w-full bg-indigo-50 border border-indigo-200 rounded-2xl p-4 mb-6 text-left">
            <div className="flex items-center gap-2 font-bold text-xs text-indigo-900 mb-2 uppercase tracking-wider">
              <Users className="w-4 h-4 text-indigo-700" />
              <span>Kompetisi Mode Tim ({teamCount} Tim)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {teamNames.map((name, i) => (
                <div key={i} className="bg-white p-2 rounded-lg border border-indigo-100 font-semibold text-stone-800">
                  {name}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 w-full mb-6 text-xs text-stone-600 flex items-center justify-around">
          <div>
            <span className="text-stone-400 block text-[11px]">Jumlah Soal</span>
            <strong className="text-sm font-bold text-stone-900">{items.length} Soal</strong>
          </div>
          <div className="h-6 w-px bg-stone-200" />
          <div>
            <span className="text-stone-400 block text-[11px]">Keyboard Arab</span>
            <strong className="text-sm font-bold text-stone-900">Virtual & Fisik</strong>
          </div>
          <div className="h-6 w-px bg-stone-200" />
          <div>
            <span className="text-stone-400 block text-[11px]">Cek Harakat</span>
            <strong className="text-sm font-bold text-stone-900">
              {settings.fbIgnoreHarakat === false ? 'Wajib Teliti' : 'Ditolerir'}
            </strong>
          </div>
        </div>

        <button
          type="button"
          onClick={startGame}
          className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all text-base"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Mulai Menjawab</span>
        </button>
      </div>
    );
  }

  // FINISHED SCREEN
  if (gameState === 'finished') {
    const totalPossible = runtimeItems.length * (settings.fbPointsPerQuestion || 10);
    const pct = Math.round((score / totalPossible) * 100) || 0;

    return (
      <div className="flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto my-auto min-h-[460px]">
        <div className="w-20 h-20 bg-amber-100 text-amber-700 rounded-3xl flex items-center justify-center mb-4 shadow-sm animate-bounce">
          <Trophy className="w-10 h-10" />
        </div>

        <h2 className="text-2xl font-extrabold text-stone-900 mb-1">Latihan Selesai!</h2>
        <p className="text-xs text-stone-500 mb-6">Kamu telah melengkapi seluruh kalimat dengan baik.</p>

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
                  <span className="font-extrabold text-base text-indigo-700">{teamScores[idx]} Poin</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full bg-indigo-50 border border-indigo-200 rounded-2xl p-6 mb-6">
            <div className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1">Skor Akhir</div>
            <div className="text-4xl font-black text-indigo-700 mb-1">
              {score} <span className="text-lg font-medium text-indigo-400">/ {totalPossible}</span>
            </div>
            <div className="text-xs font-semibold text-indigo-800">Tingkat Ketepatan: {pct}%</div>
          </div>
        )}

        <button
          type="button"
          onClick={startGame}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Latihan Lagi</span>
        </button>
      </div>
    );
  }

  // PLAYING SCREEN
  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto space-y-4">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between bg-white border border-stone-200 rounded-2xl p-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-indigo-50 text-indigo-800 rounded-xl text-xs font-bold border border-indigo-100">
            Soal {currentIndex + 1} / {runtimeItems.length}
          </div>
          {isTeam && (
            <div className="px-3 py-1 bg-amber-50 text-amber-900 rounded-xl text-xs font-bold border border-amber-200 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-700" />
              <span>Giliran: {teamNames[currentTeam]}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-100">
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

      {/* Main Game Card */}
      <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-8 shadow-xs flex flex-col items-center text-center space-y-6">
        {/* Media (Image or Audio) */}
        {imageUrl && (
          <div className="w-36 h-36 rounded-2xl overflow-hidden border border-stone-200 shadow-2xs bg-stone-50">
            <img src={imageUrl} alt="Petunjuk soal" className="w-full h-full object-contain p-2" />
          </div>
        )}

        {/* Question display */}
        <div className="space-y-3 w-full max-w-2xl">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Lengkapi Kalimat:</span>
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl min-h-[90px] flex items-center justify-center">
            {renderFormattedQuestion()}
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleSpeak}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Dengarkan Kalimat</span>
            </button>
            {audioUrl && (
              <audio src={audioUrl} controls className="h-8 max-w-[200px]" />
            )}
          </div>
        </div>

        {/* Input Field Section */}
        <div className="w-full max-w-xl space-y-2">
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
              className={`w-full py-3.5 px-4 text-2xl font-bold bg-stone-50 border-2 rounded-2xl focus:bg-white focus:outline-hidden transition-all text-center ${fontClass} ${
                isEvaluated
                  ? isCorrect
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900'
                    : 'border-rose-400 bg-rose-50/50 text-rose-900'
                  : 'border-stone-300 focus:border-indigo-600'
              }`}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-stone-500 px-1">
            <span>Dapat mengetik langsung atau gunakan keyboard virtual</span>
            <button
              type="button"
              onClick={() => setShowVirtualKeyboard(!showVirtualKeyboard)}
              className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>{showVirtualKeyboard ? 'Sembunyikan Keyboard' : 'Tampilkan Keyboard'}</span>
            </button>
          </div>
        </div>

        {/* Feedback Message Banner */}
        {feedbackMessage && (
          <div
            className={`w-full max-w-xl p-3.5 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 animate-fadeIn ${
              isCorrect
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {isCorrect ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Explanation (if answered) */}
        {isEvaluated && currentItem.explanation && (
          <div className="w-full max-w-xl p-3 bg-stone-50 border border-stone-200 rounded-xl text-left text-xs text-stone-700 leading-relaxed">
            <span className="font-bold text-stone-900 block mb-0.5">Penjelasan:</span>
            {currentItem.explanation}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 justify-center">
          {!isCorrect ? (
            <>
              <button
                type="button"
                onClick={handleCheckAnswer}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer text-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Periksa Jawaban</span>
              </button>

              <button
                type="button"
                onClick={handleHint}
                className="px-4 py-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer text-sm"
                title="Buka huruf pertama"
              >
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span>Petunjuk</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleNextQuestion}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer text-sm animate-pulse"
            >
              <span>Soal Berikutnya</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Embedded Virtual Keyboard (if toggled) */}
      {showVirtualKeyboard && (
        <div className="bg-white border border-stone-200 rounded-2xl p-3 shadow-md max-w-2xl mx-auto w-full">
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
