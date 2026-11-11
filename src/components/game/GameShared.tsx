import React from 'react';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  Clock,
  Play,
  Users,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { LogoIcon } from '../Logo';

/* =========================================================================
   1. GAME START SCREEN
   ========================================================================= */
export interface GameStartScreenProps {
  title: string;
  description: string;
  badge?: string;
  itemsCount?: number;
  itemCount?: number; // alias
  itemsLabel?: string;
  itemLabel?: string; // alias
  timerSeconds?: number;
  pointsPerQuestion?: number;
  isTeam?: boolean;
  teamCount?: number;
  teamNames?: string[];
  icon?: React.ReactNode;
  onStart: () => void;
  extraInfo?: React.ReactNode;
}

export const GameStartScreen: React.FC<GameStartScreenProps> = ({
  title,
  description,
  badge = 'Game Interaktif',
  itemsCount,
  itemCount,
  itemsLabel = 'Soal',
  itemLabel,
  timerSeconds,
  pointsPerQuestion,
  isTeam = false,
  teamCount = 2,
  teamNames = ['Tim Merah', 'Tim Biru'],
  icon,
  onStart,
  extraInfo,
}) => {
  const actualCount = itemsCount !== undefined ? itemsCount : itemCount;
  const actualLabel = itemLabel || itemsLabel || 'Soal';
  return (
    <div className="bg-white border-2 border-stone-200 rounded-3xl p-6 sm:p-10 md:p-12 text-center max-w-2xl mx-auto shadow-xl relative overflow-hidden my-4">
      {/* Playful background decorative bubbles */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-bubble/20 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-cyan-ice rounded-full blur-xl pointer-events-none" />

      {/* Floating Logo/Icon Badge */}
      <div className="relative mx-auto mb-5 w-20 h-20 rounded-3xl bg-yellow-bubble/20 border-2 border-yellow-bubble/50 flex items-center justify-center text-navy-deep shadow-sm">
        {icon ? icon : <LogoIcon size={52} className="shadow-xs" />}
      </div>

      <span className="inline-block px-3.5 py-1 rounded-full text-xs font-black tracking-wide bg-pink-100 text-pink-bubble mb-3 uppercase">
        {badge}
      </span>

      <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-navy-deep tracking-tight mb-3">
        {title}
      </h2>

      <p className="text-sm sm:text-base text-stone-600 max-w-lg mx-auto leading-relaxed mb-6 font-medium">
        {description}
      </p>

      {/* Rules / Configuration Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mb-7">
        {actualCount !== undefined && actualCount > 0 && (
          <div className="px-3.5 py-1.5 rounded-full bg-stone-100 text-navy-deep font-bold text-xs border border-stone-200">
            📝 {actualCount} {actualLabel}
          </div>
        )}
        {timerSeconds !== undefined && timerSeconds > 0 ? (
          <div className="px-3.5 py-1.5 rounded-full bg-cyan-ice text-cyan-bubble font-bold text-xs border border-cyan-bubble/30 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{timerSeconds} Detik / Giliran</span>
          </div>
        ) : (
          <div className="px-3.5 py-1.5 rounded-full bg-stone-100 text-stone-600 font-bold text-xs border border-stone-200">
            ⏳ Santai (Tanpa Batas Waktu)
          </div>
        )}
        {pointsPerQuestion !== undefined && pointsPerQuestion > 0 && (
          <div className="px-3.5 py-1.5 rounded-full bg-yellow-bubble/20 text-navy-deep font-bold text-xs border border-yellow-bubble/50">
            ⭐ +{pointsPerQuestion} Poin
          </div>
        )}
      </div>

      {/* Team mode notice if active */}
      {isTeam && (
        <div className="mb-7 p-4 bg-cyan-ice/70 border-2 border-dashed border-cyan-bubble/30 rounded-2xl max-w-md mx-auto text-left">
          <div className="font-black text-navy-deep text-xs flex items-center gap-2 mb-1.5">
            <Users className="w-4 h-4 text-cyan-bubble" />
            <span>Mode Kompetisi {teamCount} Tim Aktif:</span>
          </div>
          <p className="text-xs text-stone-700 leading-relaxed mb-3">
            Pemain akan menjawab secara bergiliran. Tim yang paling banyak mengumpulkan poin akan memenangkan piala!
          </p>
          <div className="flex flex-wrap gap-2">
            {teamNames.map((name, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full text-xs font-black shadow-xs border bg-white"
                style={{
                  color: ['#FF3B8D', '#00B4D8', '#B45309', '#059669'][idx % 4],
                  borderColor: ['#FF3B8D', '#00B4D8', '#FED034', '#10B981'][idx % 4],
                }}
              >
                ● {name}
              </span>
            ))}
          </div>
        </div>
      )}

      {extraInfo}

      {/* Big Tactile Start Button */}
      <button
        type="button"
        onClick={onStart}
        className="w-full sm:w-auto min-h-[50px] px-10 py-4 bg-pink-bubble hover:bg-pink-bubble/90 active:translate-y-0.5 active:shadow-none text-white font-black text-base sm:text-lg rounded-full shadow-[0_4px_0_#D81B60] transition-all cursor-pointer inline-flex items-center justify-center gap-3"
      >
        <Play className="w-5 h-5 fill-current" />
        <span>Mulai Mainkan Sekarang</span>
      </button>
    </div>
  );
};

/* =========================================================================
   2. GAME TOP BAR
   ========================================================================= */
export interface GameTopBarProps {
  progressText?: string;
  roundText?: string; // alias
  progressPercent?: number;
  timeLeft?: number;
  timerSeconds?: number; // alias
  timerLimit?: number;
  score?: number;
  scoreLabel?: string; // alias
  isTeam?: boolean;
  teamNames?: string[];
  teamScores?: number[];
  currentTeamIdx?: number;
  soundMuted?: boolean;
  onToggleSound?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onExit?: () => void;
  onReset?: () => void; // alias
  extraControls?: React.ReactNode;
}

export const GameTopBar: React.FC<GameTopBarProps> = ({
  progressText,
  roundText,
  progressPercent,
  timeLeft,
  timerSeconds,
  timerLimit = 0,
  score,
  scoreLabel,
  isTeam = false,
  teamNames = [],
  teamScores = [],
  currentTeamIdx = 0,
  soundMuted = false,
  onToggleSound,
  isFullscreen = false,
  onToggleFullscreen,
  onExit,
  onReset,
  extraControls,
}) => {
  const displayProgress = progressText || roundText || '';
  const displayTime = timeLeft !== undefined ? timeLeft : timerSeconds;
  const handleExit = onExit || onReset;

  return (
    <div className="space-y-2 mb-4">
      <div className="bg-white border-2 border-stone-200 rounded-2xl p-2.5 sm:p-3 px-4 shadow-xs flex flex-wrap items-center justify-between gap-2.5 text-xs">
        {/* Left: Progress chip & Timer */}
        <div className="flex items-center gap-2">
          {handleExit && (
            <button
              type="button"
              onClick={handleExit}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-500 hover:text-navy-deep rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
              title="Keluar / Kembali"
              aria-label="Keluar / Kembali"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          {displayProgress && (
            <span className="font-black text-navy-deep bg-stone-100 px-3 py-1.5 rounded-full border border-stone-200">
              {displayProgress}
            </span>
          )}

          {(timerLimit > 0 || timerSeconds !== undefined) && displayTime !== undefined && (
            <span
              className={`flex items-center gap-1.5 font-black px-3 py-1.5 rounded-full border transition-all ${
                displayTime <= 5
                  ? 'bg-rose-100 text-rose-700 border-rose-300 animate-pulse'
                  : 'bg-cyan-ice text-cyan-bubble border-cyan-bubble/30'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{displayTime}s</span>
            </span>
          )}
        </div>

        {/* Center: Team Scoreboard or Single Score */}
        {isTeam && teamNames.length > 0 ? (
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {teamNames.map((name, idx) => {
              const isTurn = idx === currentTeamIdx;
              const colors = [
                { bg: 'bg-pink-50', text: 'text-pink-bubble', border: 'border-pink-bubble/40', active: 'bg-pink-bubble text-white border-pink-bubble shadow-[0_2px_0_#D81B60]' },
                { bg: 'bg-cyan-50', text: 'text-cyan-bubble', border: 'border-cyan-bubble/40', active: 'bg-cyan-bubble text-white border-cyan-bubble shadow-[0_2px_0_#0087A2]' },
                { bg: 'bg-yellow-50', text: 'text-amber-700', border: 'border-yellow-bubble', active: 'bg-yellow-bubble text-navy-deep border-yellow-bubble shadow-[0_2px_0_#E6B800]' },
                { bg: 'bg-indigo-50', text: 'text-[#0A254D]', border: 'border-indigo-300', active: 'bg-[#0A254D] text-white border-[#0A254D] shadow-[0_2px_0_#061730]' },
              ][idx % 4];

              return (
                <div
                  key={idx}
                  className={`px-3 py-1 rounded-full border text-xs font-black transition-all flex items-center gap-1.5 ${
                    isTurn ? colors.active : `${colors.bg} ${colors.text} ${colors.border}`
                  }`}
                >
                  {isTurn && <span className="w-2 h-2 rounded-full bg-white animate-ping" />}
                  <span>{name}</span>
                  <span className="opacity-90">({teamScores[idx] || 0})</span>
                </div>
              );
            })}
          </div>
        ) : score !== undefined ? (
          <div className="font-black text-navy-deep bg-yellow-bubble/30 px-3.5 py-1.5 rounded-full border border-yellow-bubble/60 shadow-2xs">
            ⭐ Skor: <span className="text-pink-bubble">{score}</span>
          </div>
        ) : null}

        {/* Right: Sound, Fullscreen, extra */}
        <div className="flex items-center gap-1.5">
          {extraControls}

          {onToggleSound && (
            <button
              type="button"
              onClick={onToggleSound}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center bg-stone-100 hover:bg-stone-200 text-navy-deep rounded-full transition-colors cursor-pointer"
              title={soundMuted ? 'Nyalakan Efek Suara' : 'Matikan Efek Suara'}
              aria-label={soundMuted ? 'Nyalakan Efek Suara' : 'Matikan Efek Suara'}
            >
              {soundMuted ? <VolumeX className="w-4 h-4 text-stone-400" /> : <Volume2 className="w-4 h-4 text-cyan-bubble" />}
            </button>
          )}

          {onToggleFullscreen && (
            <button
              type="button"
              onClick={onToggleFullscreen}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center bg-stone-100 hover:bg-stone-200 text-navy-deep rounded-full transition-colors cursor-pointer"
              title="Layar Penuh Proyektor"
              aria-label="Layar Penuh Proyektor"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {progressPercent !== undefined && (
        <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden shadow-inner">
          <div
            className="bg-cyan-bubble h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   3. GAME FEEDBACK BANNER
   ========================================================================= */
export interface GameFeedbackBannerProps {
  isCorrect: boolean;
  title?: string; // alias
  message?: string; // alias
  pointsAwarded?: number;
  correctAnswerText?: string;
  explanation?: string;
  onNext?: () => void;
  onAction?: () => void; // alias
  nextButtonText?: string;
  actionLabel?: string; // alias
}

export const GameFeedbackBanner: React.FC<GameFeedbackBannerProps> = ({
  isCorrect,
  title,
  message,
  pointsAwarded,
  correctAnswerText,
  explanation,
  onNext,
  onAction,
  nextButtonText,
  actionLabel,
}) => {
  const handleNext = onNext || onAction || (() => {});
  const buttonText = nextButtonText || actionLabel || 'Soal Berikutnya →';

  return (
    <div
      className={`p-4 sm:p-5 rounded-3xl border-2 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in zoom-in-95 shadow-md ${
        isCorrect
          ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
          : 'bg-rose-50 border-rose-300 text-rose-950'
      }`}
    >
      <div className="space-y-1 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2 text-base sm:text-lg font-black">
          {isCorrect ? (
            <>
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <span>{title || 'Mumtaz! Jawaban Tepat!'}</span>
              {pointsAwarded !== undefined && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                  +{pointsAwarded} Poin
                </span>
              )}
            </>
          ) : (
            <>
              <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
              <span>{title || 'Belum Tepat! Tetap Semangat!'}</span>
            </>
          )}
        </div>

        {message && <p className="text-xs font-semibold text-stone-600 mt-1">{message}</p>}

        {!isCorrect && correctAnswerText && (
          <p className="text-xs sm:text-sm font-bold text-rose-900 mt-1">
            Kunci Jawaban: <span className="underline">{correctAnswerText}</span>
          </p>
        )}

        {explanation && (
          <p className="text-xs text-stone-600 mt-1 max-w-xl">
            <strong>Penjelasan:</strong> {explanation}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={handleNext}
        className="w-full sm:w-auto min-h-[46px] px-8 py-3 bg-pink-bubble hover:bg-pink-bubble/90 active:translate-y-0.5 active:shadow-none text-white font-black text-sm rounded-full shadow-[0_3px_0_#D81B60] transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
      >
        <span>{buttonText}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

/* =========================================================================
   4. GAME RESULT SCREEN
   ========================================================================= */
export interface GameResultScreenProps {
  title?: string;
  subtitle?: string;
  message?: string; // alias
  score?: number;
  maxScore?: number;
  scoreLabel?: string; // alias
  attempts?: number;
  secondsElapsed?: number;
  isTeam?: boolean;
  teamNames?: string[];
  teamScores?: number[];
  onRestart: () => void;
  onBack?: () => void;
}

export const GameResultScreen: React.FC<GameResultScreenProps> = ({
  title = 'Permainan Selesai!',
  subtitle,
  message,
  score,
  maxScore,
  scoreLabel,
  attempts,
  secondsElapsed,
  isTeam = false,
  teamNames = [],
  teamScores = [],
  onRestart,
  onBack,
}) => {
  const displaySubtitle = subtitle || message || 'Alhamdulillah, seluruh soal berhasil kamu selesaikan!';
  return (
    <div className="bg-white border-2 border-stone-200 rounded-3xl p-6 sm:p-10 md:p-12 text-center max-w-xl mx-auto shadow-2xl space-y-6 animate-in fade-in zoom-in-95 my-4 relative overflow-hidden">
      {/* Playful background accents */}
      <div className="absolute -top-12 -left-12 w-36 h-36 bg-yellow-bubble/20 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-cyan-ice rounded-full blur-xl pointer-events-none" />

      {/* Custom SVG Medal / Ribbon */}
      <div className="relative mx-auto w-24 h-24 rounded-full bg-yellow-bubble/20 border-3 border-yellow-bubble flex items-center justify-center shadow-md">
        <svg className="w-14 h-14 text-yellow-bubble drop-shadow-sm" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="9" r="6" />
          <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" fill="#FED034" stroke="#0A254D" strokeWidth="1.5" />
        </svg>
      </div>

      <div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-navy-deep tracking-tight">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-md mx-auto">
          {displaySubtitle}
        </p>
      </div>

      {/* Team Podium or Single Score */}
      {isTeam && teamNames.length > 0 ? (
        <div className="p-5 bg-stone-50 border-2 border-stone-200 rounded-2xl space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-navy-deep text-left">
            🏆 Papan Peringkat Tim:
          </h4>
          <div className="space-y-2">
            {teamNames.map((name, idx) => {
              const teamScore = teamScores[idx] || 0;
              return (
                <div
                  key={idx}
                  className="p-3 bg-white border-2 border-stone-200 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5 font-bold text-navy-deep text-sm">
                    <span className="w-7 h-7 rounded-full bg-yellow-bubble/30 text-navy-deep font-black text-xs flex items-center justify-center border border-yellow-bubble">
                      #{idx + 1}
                    </span>
                    <span>{name}</span>
                  </div>
                  <span className="text-base font-black text-pink-bubble">
                    {teamScore} Poin
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : score !== undefined ? (
        <div className="p-6 bg-yellow-bubble/15 border-2 border-yellow-bubble/40 rounded-2xl max-w-sm mx-auto">
          <div className="text-xs font-black text-navy-deep uppercase tracking-wider">
            Total Skor Perolehan
          </div>
          <div className="text-5xl font-black text-pink-bubble mt-1">
            {score}
            {maxScore !== undefined && (
              <span className="text-lg font-bold text-navy-deep/60"> / {maxScore}</span>
            )}
          </div>
          <div className="flex justify-center gap-4 mt-3 text-xs text-stone-600 font-semibold">
            {attempts !== undefined && <span>Percobaan: {attempts}</span>}
            {secondsElapsed !== undefined && <span>Waktu: {secondsElapsed}s</span>}
          </div>
        </div>
      ) : null}

      {/* Bottom Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onRestart}
          className="w-full sm:flex-1 min-h-[48px] py-3.5 px-6 bg-pink-bubble hover:bg-pink-bubble/90 active:translate-y-0.5 active:shadow-none text-white font-black text-sm rounded-full shadow-[0_4px_0_#D81B60] transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Ulangi Permainan</span>
        </button>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto min-h-[48px] py-3.5 px-6 bg-stone-100 hover:bg-stone-200 text-navy-deep font-bold text-sm rounded-full transition-colors cursor-pointer"
          >
            Kembali
          </button>
        )}
      </div>
    </div>
  );
};
