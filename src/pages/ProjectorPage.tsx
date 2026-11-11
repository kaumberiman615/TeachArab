import { useState, useEffect, Suspense } from 'react';
import { Draft } from '../types';
import { getDraft } from '../services/storage';
import { getTemplateOrNull } from '../templates/registry';
import ExportModal from '../components/ExportModal';
import { LogoIcon } from '../components/Logo';
import ErrorBoundary from '../components/ErrorBoundary';
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  Download,
  AlertCircle,
  Edit3,
  Loader2,
} from 'lucide-react';

interface ProjectorPageProps {
  draftId: string;
  onNavigate: (path: string) => void;
}

export default function ProjectorPage({ draftId, onNavigate }: ProjectorPageProps) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    getDraft(draftId).then((loaded) => {
      setDraft(loaded);
      setLoading(false);
    });
  }, [draftId]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <LogoIcon size={56} className="animate-pulse mx-auto shadow-xs" />
          <p className="text-[#0A254D] text-sm font-black">Memuat materi untuk proyektor kelas...</p>
        </div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center border border-stone-200 shadow-md">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-stone-900 mb-1">Materi Tidak Ditemukan</h2>
          <p className="text-stone-500 text-xs mb-6">
            Draf ini mungkin sudah terhapus atau belum tersimpan di browser ini.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('/draf')}
            className="min-h-[44px] px-6 py-2.5 bg-[#FF3B8D] hover:bg-[#e02e7b] text-white font-black rounded-2xl border-2 border-[#0A254D] shadow-[0_3px_0_#0A254D] text-xs cursor-pointer transition-all active:translate-y-0.5 active:shadow-[0_1px_0_#0A254D]"
          >
            Kembali ke Draf Saya
          </button>
        </div>
      </div>
    );
  }

  const templateDef = getTemplateOrNull(draft.templateType);
  if (!templateDef) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center border border-stone-200 shadow-md">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-stone-900 mb-1">Template Tidak Ditemukan</h2>
          <p className="text-stone-500 text-xs mb-6">
            Format template "{draft.templateType}" tidak terdaftar dalam Teach Arab.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('/draf')}
            className="min-h-[44px] px-6 py-2.5 bg-[#FF3B8D] hover:bg-[#e02e7b] text-white font-black rounded-2xl border-2 border-[#0A254D] shadow-[0_3px_0_#0A254D] text-xs cursor-pointer transition-all active:translate-y-0.5 active:shadow-[0_1px_0_#0A254D]"
          >
            Kembali ke Draf Saya
          </button>
        </div>
      </div>
    );
  }

  const PlayerComponent = templateDef.PlayerComponent;

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col text-navy-deep">
      {/* Classroom Projector Header */}
      <header className="bg-white/95 backdrop-blur-md border-b-2 border-stone-200 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate(`/buat/${draft.templateType}?id=${draft.id}`)}
            className="min-h-[44px] px-3.5 py-2 text-stone-600 hover:text-navy-deep hover:bg-stone-100 rounded-full transition-colors cursor-pointer flex items-center gap-2 text-xs font-black"
            title="Kembali ke Editor"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Kembali ke Editor</span>
          </button>
          <div className="h-4 w-px bg-stone-200 hidden sm:block" />
          <div>
            <h1 className="text-sm sm:text-base font-bold text-stone-900 truncate max-w-xs sm:max-w-md">
              {draft.title}
            </h1>
            <p className="text-[10px] text-stone-500">{templateDef.name} · Mode Proyektor Kelas</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate(`/buat/${draft.templateType}?id=${draft.id}`)}
            className="min-h-[44px] px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-navy-deep text-xs font-bold rounded-full flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ubah Materi</span>
          </button>

          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            className="min-h-[44px] px-3.5 py-2 bg-cyan-ice hover:bg-cyan-bubble hover:text-white text-cyan-bubble text-xs font-black rounded-full flex items-center gap-1.5 cursor-pointer border border-cyan-bubble/30 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Unduh Offline</span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="min-h-[44px] px-4 py-2 bg-pink-bubble hover:bg-pink-bubble/90 active:translate-y-0.5 active:shadow-none text-white text-xs font-black rounded-full flex items-center gap-1.5 cursor-pointer shadow-[0_3px_0_#D81B60] transition-all"
            title="Layar Penuh Proyektor"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>Layar Penuh</span>
          </button>
        </div>
      </header>

      {/* Main Full-Scale Canvas */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center">
        <ErrorBoundary
          title="Terjadi kesalahan pada tampilan proyektor"
          fallbackMessage="Mode proyektor mengalami kendala rendering materi ini."
          onNavigateBack={() => onNavigate(`/buat/${draft.templateType}?id=${draft.id}`)}
        >
          <Suspense
            fallback={
              <div className="p-16 flex flex-col items-center justify-center min-h-[400px] text-stone-400 space-y-4">
                <Loader2 className="w-10 h-10 text-[#00B4D8] animate-spin" />
                <span className="text-sm font-bold text-stone-600">Memuat mode proyektor...</span>
              </div>
            }
          >
            <PlayerComponent
              items={Array.isArray(draft.items) ? draft.items : []}
              theme={draft.theme}
              settings={draft.settings}
              mediaFiles={draft.mediaFiles || {}}
              isProjectorMode={true}
            />
          </Suspense>
        </ErrorBoundary>
      </main>

      <ExportModal
        isOpen={showExportModal}
        draft={draft}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
}
