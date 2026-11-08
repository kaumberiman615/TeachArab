import { useState, useEffect } from 'react';
import { getPublicProjectByShareId } from '../services/cloudProjects';
import { CloudProject, TemplateType } from '../types';
import { getTemplateOrNull } from '../templates/registry';
import { AlertCircle, Maximize2, Minimize2, Sparkles, Home } from 'lucide-react';
import Logo, { LogoIcon } from '../components/Logo';

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
          <LogoIcon size={56} className="animate-pulse mx-auto" />
          <p className="text-navy-deep text-base font-black">Menyiapkan materi untuk belajar...</p>
          <p className="text-stone-500 text-xs font-bold">Teach<span className="text-[#FF3B8D]">Arab</span> · Pembelajaran Interaktif</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full text-center border-2 border-stone-200 shadow-xl">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-rose-200">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-navy-deep mb-2">Tautan Tidak Tersedia</h2>
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mb-6 font-medium">
            {error || 'Materi ini mungkin telah dihapus atau ditutup aksesnya oleh pembuat.'}
          </p>
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="w-full min-h-[46px] py-3 px-5 bg-pink-bubble hover:bg-pink-bubble/90 active:translate-y-0.5 active:shadow-none text-white font-black text-sm rounded-full shadow-[0_3px_0_#D81B60] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Kunjungi Beranda Teach Arab</span>
          </button>
        </div>
      </div>
    );
  }

  const templateDef = getTemplateOrNull(project.templateType);

  if (!templateDef) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full text-center border-2 border-stone-200 shadow-xl">
          <div className="w-16 h-16 bg-yellow-bubble/20 text-navy-deep rounded-3xl flex items-center justify-center mx-auto mb-4 border border-yellow-bubble">
            <AlertCircle className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-black text-navy-deep mb-2">Template Tidak Ditemukan</h2>
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mb-6 font-medium">
            Format materi ini (<code className="bg-stone-100 px-1.5 py-0.5 rounded font-mono font-bold text-navy-deep">{project.templateType}</code>) tidak terdaftar dalam Teach Arab.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="w-full min-h-[46px] py-3 px-5 bg-pink-bubble hover:bg-pink-bubble/90 active:translate-y-0.5 active:shadow-none text-white font-black text-sm rounded-full shadow-[0_3px_0_#D81B60] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </button>
        </div>
      </div>
    );
  }

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

  const isMateri = templateDef.category === 'materi';

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-stone-100 flex flex-col text-navy-deep">
      {/* Student App Bar */}
      <header className="bg-white/95 backdrop-blur-md border-b-2 border-stone-200 px-4 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3 overflow-hidden">
          <LogoIcon size={38} className="shadow-xs shrink-0" />
          <div className="overflow-hidden">
            <h1 className="text-sm sm:text-base font-black text-navy-deep truncate">
              {project.title}
            </h1>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold">
              <span
                className={`px-2 py-0.2 rounded-full text-[10px] font-black ${
                  isMateri
                    ? 'bg-cyan-ice text-cyan-bubble border border-cyan-bubble/30'
                    : 'bg-pink-100 text-pink-bubble border border-pink-bubble/30'
                }`}
              >
                {templateDef.name}
              </span>
              <span className="text-stone-500">· Mode Siswa</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="min-h-[42px] px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-navy-deep text-xs font-black rounded-full flex items-center gap-1.5 transition-colors cursor-pointer"
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

      {/* Minimal Footer with Teach Arab Branding */}
      <footer className="py-3 px-4 flex flex-wrap items-center justify-center gap-2 text-[11px] text-stone-500 border-t border-stone-200/80 bg-white/70">
        <span>Dibuat dengan</span>
        <Logo variant="full" size="xs" showTagline={false} />
        <span className="text-stone-300">·</span>
        <span>Materi & Game Interaktif Bahasa Arab</span>
      </footer>
    </div>
  );
}
