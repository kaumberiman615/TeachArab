import { useState, useEffect } from 'react';
import { Draft } from '../types';
import { getDraft } from '../services/storage';
import { getTemplateOrNull } from '../templates/registry';
import ExportModal from '../components/ExportModal';
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  Download,
  AlertCircle,
  Edit3,
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
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-stone-600 text-sm font-semibold">Memuat materi untuk proyektor...</p>
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
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
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
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
          >
            Kembali ke Draf Saya
          </button>
        </div>
      </div>
    );
  }

  const PlayerComponent = templateDef.PlayerComponent;

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      {/* Classroom Projector Header */}
      <header className="bg-white border-b border-stone-200 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate(`/buat/${draft.templateType}?id=${draft.id}`)}
            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
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
            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ubah Materi</span>
          </button>

          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer border border-emerald-200"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Unduh Offline</span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            title="Layar Penuh Proyektor"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>Layar Penuh</span>
          </button>
        </div>
      </header>

      {/* Main Full-Scale Canvas */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center">
        <PlayerComponent
          items={draft.items}
          theme={draft.theme}
          settings={draft.settings}
          mediaFiles={draft.mediaFiles}
          isProjectorMode={true}
        />
      </main>

      <ExportModal
        isOpen={showExportModal}
        draft={draft}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
}
