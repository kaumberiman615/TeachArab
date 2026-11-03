import { useState, useEffect } from 'react';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import EditorPage from './pages/EditorPage';
import ProjectorPage from './pages/ProjectorPage';
import DraftsPage from './pages/DraftsPage';
import HelpPage from './pages/HelpPage';
import MyProjectsPage from './pages/MyProjectsPage';
import PublicSharePage from './pages/PublicSharePage';
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

        {/* Footer (Clean, unboxed, quiet) */}
        {!isStandaloneView && (
          <footer className="bg-white border-t border-stone-200 py-6 px-4 sm:px-6 text-center text-xs text-stone-600">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-800">Teach Arab</span>
                <span aria-hidden="true">·</span>
                <span>Perangkat Ajar & Game Bahasa Arab Interaktif</span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/materi-saya')}
                  className="hover:text-stone-900 transition-colors cursor-pointer text-emerald-800 font-semibold"
                >
                  Materi Saya
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => navigate('/draf')}
                  className="hover:text-stone-900 transition-colors cursor-pointer"
                >
                  Draf Lokal
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => navigate('/bantuan')}
                  className="hover:text-stone-900 transition-colors cursor-pointer"
                >
                  Panduan
                </button>
                <span aria-hidden="true">·</span>
                <span>Mode Tamu 100% Offline Didukung</span>
              </div>
            </div>
          </footer>
        )}
      </div>
    </AuthProvider>
  );
}
