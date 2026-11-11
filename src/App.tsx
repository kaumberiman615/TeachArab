import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Logo from './components/Logo';
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
import ErrorBoundary from './components/ErrorBoundary';

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
        <main className="flex-1">
          <ErrorBoundary onNavigateBack={() => navigate('/')}>
            {content}
          </ErrorBoundary>
        </main>

        {/* Playful Footer */}
        {/* Footer with App Version, Feedback link, and Privacy note */}
        {!isStandaloneView && <Footer onNavigate={navigate} />}
      </div>
    </AuthProvider>
  );
}
