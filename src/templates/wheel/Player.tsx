import { useState, useEffect, useRef } from 'react';
import { WheelEntry, MediaItem, ThemeConfig, DraftSettings } from '../../types';
import { speakArabic, removeHarakat } from '../../utils/arabic';
import { soundManager } from '../../utils/sound';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  Trophy,
  Users,
  Play,
  Sparkles,
  Trash2,
  CheckCircle2,
  History,
  Info,
  ChevronRight,
} from 'lucide-react';

interface WheelPlayerProps {
  items: WheelEntry[];
  theme: ThemeConfig;
  settings: DraftSettings;
  mediaFiles: Record<string, MediaItem>;
  isProjectorMode?: boolean;
}

export default function WheelPlayer({
  items,
  theme,
  settings,
  isProjectorMode = false,
}: WheelPlayerProps) {
  const [activeEntries, setActiveEntries] = useState<WheelEntry[]>(items);
  const [history, setHistory] = useState<WheelEntry[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<WheelEntry | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundMuted, setSoundMuted] = useState(!theme.soundEnabled);

  // Settings
  const eliminateOnPick = settings.wheelEliminateOnPick ?? false;

  // Team mode
  const isTeam = settings.teamMode;
  const teamCount = settings.teamCount || 2;
  const teamNames = settings.teamNames || ['Tim Merah', 'Tim Biru', 'Tim Hijau', 'Tim Kuning'].slice(0, teamCount);
  const [currentTeam, setCurrentTeam] = useState(0);
  const [teamScores, setTeamScores] = useState<number[]>(Array(teamCount).fill(0));

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationAngleRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  // Synchronize items on prop update
  useEffect(() => {
    setActiveEntries(items);
    setHistory([]);
    setSelectedEntry(null);
  }, [items]);

  const fontClass =
    theme.fontFamily === 'Amiri'
      ? 'Amiri'
      : theme.fontFamily === 'Scheherazade New'
      ? 'Scheherazade New'
      : 'Noto Naskh Arabic';

  // Draw wheel on canvas
  const drawWheel = (angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 18;

    ctx.clearRect(0, 0, width, height);

    if (activeEntries.length === 0) {
      // Empty wheel placeholder
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#f5f5f4';
      ctx.fill();
      ctx.strokeStyle = '#d6d3d1';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#78716c';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Semua entri telah selesai!', centerX, centerY);
      return;
    }

    const numSlices = activeEntries.length;
    const sliceAngle = (Math.PI * 2) / numSlices;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);

    for (let i = 0; i < numSlices; i++) {
      const entry = activeEntries[i];
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      // Slice background
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = entry.color || '#059669';
      ctx.fill();

      // Border between slices
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Text inside slice
      ctx.save();
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';

      // Font size adjusted by slice count
      const fontSize = numSlices > 18 ? 12 : numSlices > 12 ? 14 : 16;
      ctx.font = `bold ${fontSize}px "${fontClass}", sans-serif`;

      // Shadow for readability
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      const rawText = theme.showHarakat ? entry.text : removeHarakat(entry.text);
      // Truncate if too long
      const textToRender = rawText.length > 22 ? rawText.substring(0, 20) + '...' : rawText;

      ctx.fillText(textToRender, radius - 20, 0);
      ctx.restore();
    }

    ctx.restore();

    // Outer wheel border ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Center hub
    ctx.beginPath();
    ctx.arc(centerX, centerY, 28, 0, Math.PI * 2);
    ctx.fillStyle = '#1c1917';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center text/icon
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ض', centerX, centerY);

    // Indicator needle (arrow at top: 12 o'clock, pointing down)
    ctx.save();
    ctx.translate(centerX, centerY - radius);
    ctx.beginPath();
    ctx.moveTo(0, 16);
    ctx.lineTo(-14, -14);
    ctx.lineTo(14, -14);
    ctx.closePath();
    ctx.fillStyle = '#dc2626'; // bright red
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  };

  useEffect(() => {
    drawWheel(rotationAngleRef.current);
  }, [activeEntries, theme]);

  // Spin physics engine
  const spinWheel = () => {
    if (isSpinning || activeEntries.length === 0) return;

    setIsSpinning(true);
    setShowResultModal(false);
    setShowExplanation(false);
    setSelectedEntry(null);

    const spinDuration = 4500; // ms
    const startTime = performance.now();
    const initialAngle = rotationAngleRef.current;

    // Pick winning slice randomly
    const winningIndex = Math.floor(Math.random() * activeEntries.length);
    const sliceAngle = (Math.PI * 2) / activeEntries.length;

    // Target angle points to 12 o'clock (top pointer = 3 * PI / 2)
    const targetSliceCenter = winningIndex * sliceAngle + sliceAngle / 2;
    const pointerAngle = (3 * Math.PI) / 2; // 12 o'clock in standard canvas rotation
    let targetRelativeAngle = pointerAngle - targetSliceCenter;
    while (targetRelativeAngle < 0) targetRelativeAngle += Math.PI * 2;

    // Full rotations (5 to 8 full spins)
    const extraRotations = (5 + Math.floor(Math.random() * 3)) * Math.PI * 2;
    const totalAngleDelta = extraRotations + (targetRelativeAngle - (initialAngle % (Math.PI * 2)));

    let lastTickAngle = initialAngle;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);

      // Quartic ease out for very realistic deceleration
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const currentAngle = initialAngle + totalAngleDelta * easeOut;

      rotationAngleRef.current = currentAngle;
      drawWheel(currentAngle);

      // Sound click on sector cross
      if (!soundMuted && Math.abs(currentAngle - lastTickAngle) >= sliceAngle) {
        soundManager.playClick();
        lastTickAngle = currentAngle;
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Spin finished!
        setIsSpinning(false);
        const winningEntry = activeEntries[winningIndex];
        setSelectedEntry(winningEntry);
        setShowResultModal(true);
        setHistory((prev) => [winningEntry, ...prev]);

        if (!soundMuted) soundManager.playVictory();
        if (winningEntry.text) {
          speakArabic(winningEntry.text);
        }
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const handleEliminateDrawnEntry = () => {
    if (!selectedEntry) return;
    setActiveEntries((prev) => prev.filter((e) => e.id !== selectedEntry.id));
    setShowResultModal(false);
  };

  const handleResetEntries = () => {
    setActiveEntries(items);
    setHistory([]);
    setSelectedEntry(null);
    setShowResultModal(false);
  };

  const awardTeamScore = (points: number) => {
    if (!isTeam) return;
    setTeamScores((prev) => {
      const next = [...prev];
      next[currentTeam] = (next[currentTeam] || 0) + points;
      return next;
    });
    // Advance to next team
    setCurrentTeam((prev) => (prev + 1) % teamCount);
    setShowResultModal(false);
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

  return (
    <div className={`space-y-4 max-w-5xl mx-auto ${isProjectorMode ? 'p-4 sm:p-6' : ''}`}>
      {/* Top Header Controls */}
      <div className="bg-white border-2 border-[#0A254D]/15 rounded-3xl p-3 px-5 shadow-[0_4px_0_rgba(10,37,77,0.06)] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-[#0A254D] bg-[#00B4D8]/10 border border-[#00B4D8]/20 px-3 py-1.5 rounded-full">
            Sisa Entri: {activeEntries.length} / {items.length}
          </span>

          <button
            type="button"
            onClick={handleResetEntries}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#0A254D] text-xs font-black rounded-full flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            title="Reset entri roda kembali utuh"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Roda</span>
          </button>
        </div>

        {/* Team Mode Turn Indicator */}
        {isTeam && (
          <div className="flex items-center gap-1.5 text-xs font-black text-[#0A254D] bg-[#FED034]/30 border border-[#FED034] px-4 py-1.5 rounded-full shadow-xs">
            <Users className="w-4 h-4 text-[#0A254D]" />
            <span>Giliran: {teamNames[currentTeam]} ({teamScores[currentTeam]} Poin)</span>
          </div>
        )}

        {/* Audio & Fullscreen */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const next = !soundMuted;
              setSoundMuted(next);
              soundManager.setMuted(next);
            }}
            className="w-10 h-10 rounded-full border border-[#0A254D]/15 flex items-center justify-center text-[#0A254D] hover:bg-slate-100 transition-colors cursor-pointer"
            title={soundMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-[#00B4D8]" />}
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="w-10 h-10 rounded-full border border-[#0A254D]/15 flex items-center justify-center text-[#0A254D] hover:bg-slate-100 transition-colors cursor-pointer"
            title="Layar Penuh"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Wheel Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left 3 cols: Canvas Wheel */}
        <div className="lg:col-span-3 bg-white border-2 border-[#0A254D]/15 rounded-3xl p-6 sm:p-8 shadow-[0_8px_0_rgba(10,37,77,0.06)] flex flex-col items-center justify-center relative overflow-hidden">
          <div className="relative mb-6">
            <canvas
              ref={canvasRef}
              width={480}
              height={480}
              className="max-w-full aspect-square drop-shadow-lg select-none"
            />
          </div>

          <button
            type="button"
            disabled={isSpinning || activeEntries.length === 0}
            onClick={spinWheel}
            className="px-10 py-4.5 bg-[#FF3B8D] hover:bg-[#E02674] disabled:opacity-50 text-white font-black text-xl rounded-full shadow-[0_6px_0_#C7175E] hover:shadow-[0_8px_0_#C7175E] active:translate-y-1.5 active:shadow-[0_2px_0_#C7175E] transition-all cursor-pointer flex items-center justify-center gap-2.5 tracking-wider uppercase"
          >
            <Sparkles className="w-6 h-6 fill-current" />
            <span>{isSpinning ? 'Sedang Berputar...' : 'PUTAR RODA!'}</span>
          </button>
        </div>

        {/* Right col: History & Controls */}
        <div className="space-y-4">
          {/* History Card */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <History className="w-4 h-4 text-emerald-700" />
                <span>Riwayat Terpilih</span>
              </span>
              <span className="text-[10px] text-stone-400 font-mono">{history.length} kali</span>
            </div>

            {history.length === 0 ? (
              <p className="text-xs text-stone-400 py-3 text-center">
                Belum ada hasil putaran roda.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {history.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs flex items-center justify-between gap-2"
                  >
                    <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span
                      dir="rtl"
                      className="font-bold text-stone-900 truncate flex-1 text-right font-amiri text-sm"
                    >
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Team Scores Card (if team mode active) */}
          {isTeam && (
            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-700" />
                <span>Papan Skor Tim</span>
              </h4>
              <div className="space-y-2">
                {teamNames.map((name, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      idx === currentTeam
                        ? 'bg-indigo-50 border-indigo-300 font-bold text-indigo-900'
                        : 'bg-stone-50 border-stone-200 text-stone-700'
                    }`}
                  >
                    <span>{name}</span>
                    <span className="font-extrabold text-indigo-700">{teamScores[idx]} Poin</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* POPUP RESULT MODAL */}
      {showResultModal && selectedEntry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center shadow-2xl space-y-6 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto text-2xl font-black shadow-xs">
              🎯
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                Hasil Terpilih!
              </span>

              {/* Big Result Text */}
              <div
                dir="rtl"
                className={`text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-900 mt-4 leading-relaxed font-amiri`}
              >
                {theme.showHarakat ? selectedEntry.text : removeHarakat(selectedEntry.text)}
              </div>
            </div>

            {/* Answer / Explanation Reveal */}
            {selectedEntry.answerOrExplanation && (
              <div className="space-y-2">
                {!showExplanation ? (
                  <button
                    type="button"
                    onClick={() => setShowExplanation(true)}
                    className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold rounded-xl border border-indigo-200 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>Lihat Kunci Jawaban / Penjelasan</span>
                  </button>
                ) : (
                  <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl text-left text-xs text-indigo-950 animate-in fade-in">
                    <strong className="block text-indigo-900 mb-1">Kunci / Penjelasan:</strong>
                    {selectedEntry.answerOrExplanation}
                  </div>
                )}
              </div>
            )}

            {/* Team Award Score Options */}
            {isTeam && (
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-2">
                <span className="font-semibold text-stone-700 block">
                  Beri Poin untuk <strong>{teamNames[currentTeam]}</strong>:
                </span>
                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => awardTeamScore(10)}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    +10 Poin (Benar)
                  </button>
                  <button
                    type="button"
                    onClick={() => awardTeamScore(0)}
                    className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    0 Poin (Lewati)
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              {eliminateOnPick && (
                <button
                  type="button"
                  onClick={handleEliminateDrawnEntry}
                  className="flex-1 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Hapus Entri dari Roda</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowResultModal(false);
                  if (isTeam) setCurrentTeam((prev) => (prev + 1) % teamCount);
                }}
                className="flex-1 py-3 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Tutup & Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
