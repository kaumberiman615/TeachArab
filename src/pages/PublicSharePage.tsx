import { useState, useEffect } from 'react';
import { getPublicProjectByShareId } from '../services/cloudProjects';
import { CloudProject, TemplateType } from '../types';
import { getTemplateOrNull } from '../templates/registry';
import { AlertCircle, Maximize2, Minimize2, Sparkles, Home } from 'lucide-react';

interface PublicSharePageProps {
  shareId: string;
  onNavigate: (path: string) => void;
}

export default function PublicSharePage({ shareId, onNavigate }: PublicSharePageProps) {
  const [project, setProject] = useState<CloudProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadPublicProject() {
      try {
        setLoading(true);
        const data = await getPublicProjectByShareId(shareId);
        if (!isMounted) return;
        if (!data || !data.isPublic) {
          setError('Materi tidak ditemukan atau tautan berbagi telah dinonaktifkan oleh guru.');
        } else {
          setProject(data);
          document.title = `${data.title} - Teach Arab`;
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Gagal memuat materi publik:', err);
        setError('Terjadi kendala saat memuat materi. Pastikan Anda terhubung ke internet.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadPublicProject();
    return () => {
      isMounted = false;
    };
  }, [shareId]);

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
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-stone-700 text-sm font-bold">Menyiapkan materi untuk belajar...</p>
          <p className="text-stone-400 text-xs">Memuat konten langsung dari Teach Arab</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-stone-200 shadow-xl">
          <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">Tautan Tidak Tersedia</h2>
          <p className="text-stone-600 text-xs leading-relaxed mb-6">
            {error || 'Materi ini mungkin telah dihapus atau ditutup aksesnya oleh pembuat.'}
          </p>
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Kunjungi Beranda Teach Arab</span>
          </button>
        </div>
      </div>
    );
  }

  const templateDef = getTemplateOrNull(project.templateType) || getTemplateOrNull('flashcard')!;
  const PlayerComponent = templateDef.PlayerComponent;

  // Map mediaRefs and content.mediaUrls into mediaFiles shape expected by players
  const mediaFiles: Record<string, any> = {};
  const combinedRefs: Record<string, string> = {
    ...(project.content?.mediaUrls || {}),
    ...(project.mediaRefs || {}),
  };
  for (const [id, url] of Object.entries(combinedRefs)) {
    if (typeof url === 'string' && url.trim().length > 0) {
      mediaFiles[id] = {
        id,
        url: url.trim(),
        name: id,
      };
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 to-stone-50 flex flex-col">
      {/* Student App Bar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-stone-200 px-4 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-40 shadow-2xs">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 bg-emerald-700 text-white rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
            ض
          </div>
          <div className="overflow-hidden">
            <h1 className="text-xs sm:text-sm font-bold text-stone-900 truncate">
              {project.title}
            </h1>
            <div className="flex items-center gap-1.5 text-[10px] text-stone-500">
              <span className="font-semibold text-emerald-700">{templateDef.name}</span>
              <span>· Mode Siswa</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 sm:px-3 sm:py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Layar Penuh"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline">Layar Penuh</span>
          </button>
        </div>
      </header>

      {/* Responsive Player Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-6 md:p-8 flex flex-col justify-center">
        <PlayerComponent
          items={project.content.items}
          theme={project.content.theme}
          settings={project.content.settings}
          mediaFiles={mediaFiles}
          isProjectorMode={true}
        />
      </main>

      {/* Minimal Footer */}
      <footer className="py-3 text-center text-[11px] text-stone-600 border-t border-stone-200/80 bg-white/50">
        Dibuat dengan <strong className="text-stone-700">Teach Arab</strong> · Media & Game Interaktif Bahasa Arab
      </footer>
    </div>
  );
}
