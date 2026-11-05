import { useState, useEffect } from 'react';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import EditorPage from './pages/EditorPage';
import ProjectorPage from './pages/ProjectorPage';
import DraftsPage from './pages/DraftsPage';
import HelpPage from './pages/HelpPage';
import MyProjectsPage from './pages/MyProjectsPage';
import PublicSharePage from './pages/PublicSharePage';
import MateriGalleryPage from './pages/MateriGalleryPage';
import GameGalleryPage from './pages/GameGalleryPage';
import { AuthProvider } from './services/authContext';
import { TemplateType } from './types';
import { getTemplate } from './templates/registry';
import { saveDraft } from './services/storage';

export default function App() {
  // Parse current route from window.location.hash or fallback to '/'
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const hash = window.location.hash.replace(/^#/, '');
    return hash || '/';
  });

  // Sync route on popstate / hashchange
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '');
      setCurrentRoute(hash || '/');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
    setCurrentRoute(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper for starting template from home
  const handleSelectTemplate = async (type: TemplateType, useSampleData: boolean) => {
    const templateDef = getTemplate(type);
    const draft = templateDef.createDefaultDraft();
    if (!useSampleData) {
      draft.items = [];
    }
    // Save to IndexedDB so it has an ID right away
    await saveDraft(draft);
    navigate(`/buat/${templateDef.id}?id=${draft.id}`);
  };

  // Parse path and query parameters
  const [pathOnly, queryString] = currentRoute.split('?');
  const queryParams = new URLSearchParams(queryString || '');
  const draftIdParam = queryParams.get('id') || undefined;
  const cloudIdParam = queryParams.get('cloudId') || undefined;

  // Route matching
  let content = null;
  let isStandaloneView = false;

  if (pathOnly === '/' || pathOnly === '') {
    content = <HomePage onNavigate={navigate} onSelectTemplate={handleSelectTemplate} />;
  } else if (pathOnly === '/materi' || pathOnly === '/materi/') {
    content = <MateriGalleryPage onNavigate={navigate} onSelectTemplate={handleSelectTemplate} />;
  } else if (pathOnly === '/game' || pathOnly === '/game/') {
    content = <GameGalleryPage onNavigate={navigate} onSelectTemplate={handleSelectTemplate} />;
  } else if (pathOnly.startsWith('/buat/')) {
    const typeStr = pathOnly.replace('/buat/', '');
    content = (
      <EditorPage
        key={`editor_${typeStr}_${draftIdParam || cloudIdParam || 'new'}`}
        templateType={typeStr}
        initialDraftId={draftIdParam}
        initialCloudId={cloudIdParam}
        onNavigate={navigate}
      />
    );
  } else if (pathOnly.startsWith('/main/')) {
    const mainDraftId = pathOnly.replace('/main/', '');
    isStandaloneView = true;
    content = (
      <ProjectorPage
        key={`projector_${mainDraftId}`}
        draftId={mainDraftId}
        onNavigate={navigate}
      />
    );
  } else if (pathOnly.startsWith('/p/')) {
    // Public share route for students without login
    const shareId = pathOnly.replace('/p/', '');
    isStandaloneView = true;
    content = (
      <PublicSharePage
        key={`public_${shareId}`}
        shareId={shareId}
        onNavigate={navigate}
      />
    );
  } else if (pathOnly === '/materi-saya' || pathOnly.startsWith('/materi-saya')) {
    content = <MyProjectsPage onNavigate={navigate} />;
  } else if (pathOnly === '/draf' || pathOnly.startsWith('/draf')) {
    content = <DraftsPage onNavigate={navigate} />;
  } else if (pathOnly === '/bantuan' || pathOnly.startsWith('/bantuan')) {
    content = <HelpPage onNavigate={navigate} />;
  } else {
    // Fallback to Home
    content = <HomePage onNavigate={navigate} onSelectTemplate={handleSelectTemplate} />;
  }

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans antialiased">
        {/* Hide standard header in projector view or student public view */}
        {!isStandaloneView && (
          <Header currentPath={pathOnly} onNavigate={navigate} />
        )}

        {/* Main Content Area */}
        <main className="flex-1">{content}</main>

        {/* Playful Footer */}
        {!isStandaloneView && (
          <footer className="bg-white border-t-2 border-stone-100 py-8 px-4 sm:px-6 text-center text-xs text-stone-600">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#0A254D] text-[#FED034] font-black font-amiri flex items-center justify-center text-sm">
                  ض
                </div>
                <span className="font-black text-[#0A254D] text-sm">Teach<span className="text-[#FF3B8D]">Arab</span></span>
                <span className="text-stone-300" aria-hidden="true">·</span>
                <span className="font-medium text-stone-500">Materi & Game Bahasa Arab Interaktif</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 font-bold text-xs text-stone-600">
                <button
                  type="button"
                  onClick={() => navigate('/materi-saya')}
                  className="hover:text-[#00B4D8] transition-colors cursor-pointer text-[#0A254D]"
                >
                  Materi Saya
                </button>
                <span className="text-stone-300" aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => navigate('/draf')}
                  className="hover:text-[#0A254D] transition-colors cursor-pointer"
                >
                  Draf Lokal
                </button>
                <span className="text-stone-300" aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => navigate('/bantuan')}
                  className="hover:text-[#FF3B8D] transition-colors cursor-pointer"
                >
                  Panduan
                </button>
                <span className="text-stone-300" aria-hidden="true">·</span>
                <span className="text-stone-400 font-semibold">100% Offline & Mandiri</span>
              </div>
            </div>
          </footer>
        )}
      </div>
    </AuthProvider>
  );
}
