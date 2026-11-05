import { useState, useEffect, useRef } from 'react';
import { Draft, TemplateType, MediaItem, ThemeConfig, DraftSettings, isMatchingTemplate, CloudProject } from '../types';
import { getTemplateOrNull } from '../templates/registry';
import { getCategoryByTemplateType } from '../templates/categories';
import { saveDraft, getDraft } from '../services/storage';
import { useAuth } from '../services/authContext';
import { saveDraftToCloud, getProjectById, toggleProjectPublic, type FailedFileUpload } from '../services/cloudProjects';
import { getCloudinaryConfigStatus } from '../services/cloudinary';
import ThemePanel from '../components/ThemePanel';
import QuickInputModal from '../components/QuickInputModal';
import ExportModal from '../components/ExportModal';
import ArabicKeyboard from '../components/ArabicKeyboard';
import { ShareModal } from '../components/ShareModal';
import { LoginExplanationModal } from '../components/LoginExplanationModal';
import { MigrateDraftModal } from '../components/MigrateDraftModal';
import {
  UploadProgressModal,
  type UploadProgressData,
  type CloudinaryConfigWarningData,
} from '../components/UploadProgressModal';
import {
  Save,
  Download,
  Play,
  Sliders,
  Sparkles,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  PenTool,
  Cloud,
  Share2,
  Loader2,
} from 'lucide-react';

interface EditorPageProps {
  templateType: string;
  initialDraftId?: string;
  initialCloudId?: string;
  onNavigate: (path: string) => void;
}

export default function EditorPage({
  templateType,
  initialDraftId,
  initialCloudId,
  onNavigate,
}: EditorPageProps) {
  // Check if template exists in registry
  const templateDef = getTemplateOrNull(templateType);

  // If template is not recognized, show "Template tidak ditemukan"
  if (!templateDef) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-stone-50">
        <div className="bg-white border border-stone-200 rounded-2xl p-8 max-w-md w-full text-center shadow-md space-y-4">
          <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900">Template Tidak Ditemukan</h2>
            <p className="text-stone-600 text-xs mt-1.5 leading-relaxed">
              Jenis template <code className="bg-stone-100 px-1.5 py-0.5 rounded font-mono text-stone-800">"{templateType}"</code> tidak terdaftar dalam Teach Arab.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs transition-colors"
            >
              Lihat Galeri Template
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/draf')}
              className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-xs cursor-pointer transition-colors"
            >
              Buka Draf Saya
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { user, signInWithGoogle } = useAuth();

  // Initialize draft based on valid templateDef
  const [draft, setDraft] = useState<Draft>(() => {
    return templateDef.createDefaultDraft();
  });

  const [activeMobileTab, setActiveMobileTab] = useState<'edit' | 'preview'>('edit');
  const [showThemePanel, setShowThemePanel] = useState(false);
  const [showQuickInput, setShowQuickInput] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  // Cloud & Sharing states
  const [cloudProjectId, setCloudProjectId] = useState<string | null>(initialCloudId || null);
  const [cloudShareId, setCloudShareId] = useState<string>('');
  const [isCloudPublic, setIsCloudPublic] = useState<boolean>(false);
  const [isSavingToCloud, setIsSavingToCloud] = useState<boolean>(false);
  const [cloudSaveMessage, setCloudSaveMessage] = useState<string | null>(null);

  // Modals
  const [showShareModal, setShowShareModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginModalReason, setLoginModalReason] = useState<'share' | 'save' | 'general'>('save');
  const [showMigrateModal, setShowMigrateModal] = useState(false);

  // Cloudinary Upload Progress Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadModalStatus, setUploadModalStatus] = useState<
    'config_missing' | 'uploading' | 'saving_firestore' | 'partial_success' | 'completed' | 'error'
  >('uploading');
  const [uploadProgressData, setUploadProgressData] = useState<UploadProgressData | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadErrorTitle, setUploadErrorTitle] = useState<string | null>(null);
  const [uploadErrorSuggestion, setUploadErrorSuggestion] = useState<string | null>(null);
  const [failedFilesList, setFailedFilesList] = useState<FailedFileUpload[]>([]);
  const [cloudinaryWarning, setCloudinaryWarning] = useState<CloudinaryConfigWarningData | null>(null);
  const [pendingActionAfterRetry, setPendingActionAfterRetry] = useState<'save' | 'share' | null>(null);

  // Track previous auth state to trigger migration prompt on fresh login
  const prevUserRef = useRef(user);

  // Load cloud project if cloudId provided
  useEffect(() => {
    if (initialCloudId) {
      getProjectById(initialCloudId).then((project) => {
        if (!project) return;
        setCloudProjectId(project.id);
        setCloudShareId(project.shareId);
        setIsCloudPublic(project.isPublic);

        // Populate draft from cloud project
        setDraft((prev) => ({
          ...prev,
          id: project.id,
          title: project.title,
          description: project.description || '',
          theme: project.content?.theme || prev.theme,
          settings: project.content?.settings || prev.settings,
          items: project.content?.items || [],
          mediaFiles: {}, // Media URLs are referenced in project.mediaRefs
        }));
      });
    }
  }, [initialCloudId]);

  // Load existing local draft if initialDraftId provided
  useEffect(() => {
    if (initialDraftId && !initialCloudId) {
      getDraft(initialDraftId).then((loaded) => {
        if (!loaded) return;
        const matchesTemplate =
          loaded.templateType === templateDef.id ||
          (isMatchingTemplate(loaded.templateType) && isMatchingTemplate(templateDef.id));
        if (matchesTemplate) {
          setDraft(loaded);
        }
      });
    }
  }, [initialDraftId, initialCloudId, templateDef.id]);

  // Keep URL in sync with draft ID so page refresh reloads this exact draft with media
  useEffect(() => {
    if (!initialDraftId && !initialCloudId && draft.id) {
      const targetHash = `#/buat/${templateDef.id}?id=${draft.id}`;
      if (window.location.hash !== targetHash) {
        window.history.replaceState(null, '', targetHash);
      }
    }
  }, [draft.id, initialDraftId, initialCloudId, templateDef.id]);

  // Offer migration when user logs in during draft editing
  useEffect(() => {
    if (!prevUserRef.current && user && !cloudProjectId && draft.items.length > 0) {
      setShowMigrateModal(true);
    }
    prevUserRef.current = user;
  }, [user, cloudProjectId, draft.items.length]);

  // Debounced Auto-save to IndexedDB (keeps offline copy safe)
  const autoSaveTimeoutRef = useRef<number | null>(null);
  useEffect(() => {
    setSaveStatus('saving');
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = window.setTimeout(async () => {
      try {
        await saveDraft(draft);
        setSaveStatus('saved');
      } catch (err) {
        console.error('Auto-save error:', err);
      }
    }, 600);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [draft]);

  // Save to Cloud & Share via Link handler with Cloudinary upload progress and error handling
  const executeSaveToCloud = async (action: 'save' | 'share') => {
    if (!user) {
      setLoginModalReason(action);
      setShowLoginModal(true);
      return;
    }

    setPendingActionAfterRetry(action);

    // Identify local media blobs that need uploading to Cloudinary
    const mediaEntries = Object.entries(draft.mediaFiles || {});
    const blobsToUpload = mediaEntries.filter(([, item]) => {
      if (!item?.blob) return false;
      const existingUrl = (item as any).url;
      // Skip if already has remote URL (prevent duplicate upload)
      if (existingUrl && (existingUrl.startsWith('http://') || existingUrl.startsWith('https://'))) {
        return false;
      }
      return true;
    });

    // If there are media files to upload, check Cloudinary configuration first
    if (blobsToUpload.length > 0) {
      const configStatus = getCloudinaryConfigStatus();
      if (!configStatus.isReady) {
        console.warn('[EditorPage] Cloudinary configuration is missing:', configStatus);
        setCloudinaryWarning(configStatus);
        setUploadModalStatus('config_missing');
        setShowUploadModal(true);
        return;
      }

      setShowUploadModal(true);
      setUploadModalStatus('uploading');
      setUploadError(null);
      setUploadErrorTitle(null);
      setUploadErrorSuggestion(null);
      setFailedFilesList([]);
      setUploadProgressData({
        currentIndex: 1,
        totalItems: blobsToUpload.length,
        fileName: blobsToUpload[0][1]?.name || 'Berkas media',
        itemPercent: 0,
        failedCount: 0,
      });
    } else {
      setIsSavingToCloud(true);
    }

    try {
      const result = await saveDraftToCloud(
        draft,
        user,
        cloudProjectId || undefined,
        (info) => {
          setUploadProgressData(info);
        }
      );

      const savedProj = result.project;
      const failedFiles = result.failedFiles;
      const succeededCount = result.succeededMediaCount;

      if (blobsToUpload.length > 0) {
        setUploadModalStatus('saving_firestore');
      }

      setCloudProjectId(savedProj.id);
      setCloudShareId(savedProj.shareId);

      if (action === 'share') {
        await toggleProjectPublic(savedProj.id, true, savedProj.shareId);
        setIsCloudPublic(true);
      } else {
        setIsCloudPublic(savedProj.isPublic);
      }

      // Check for partial or complete media upload failures
      if (failedFiles && failedFiles.length > 0) {
        console.warn('[EditorPage] Berkas media gagal diunggah:', {
          total: blobsToUpload.length,
          succeeded: succeededCount,
          failed: failedFiles,
        });

        setFailedFilesList(failedFiles);

        if (succeededCount > 0) {
          // Partial success: some files succeeded, some failed
          setUploadModalStatus('partial_success');
        } else {
          // All files failed
          setUploadModalStatus('error');
          setUploadError(failedFiles[0].error);
          setUploadErrorTitle(failedFiles[0].title || 'Gagal Mengunggah Media (Cloudinary)');
          setUploadErrorSuggestion(failedFiles[0].suggestion || 'Periksa format berkas atau koneksi internet Anda.');
        }
      } else {
        // All files succeeded
        if (blobsToUpload.length > 0) {
          setUploadModalStatus('completed');
          setTimeout(() => {
            setShowUploadModal(false);
            if (action === 'share') {
              setShowShareModal(true);
            } else {
              setCloudSaveMessage('Tersimpan di Cloud!');
              setTimeout(() => setCloudSaveMessage(null), 3500);
            }
          }, 450);
        } else {
          if (action === 'share') {
            setShowShareModal(true);
          } else {
            setCloudSaveMessage('Tersimpan di Cloud!');
            setTimeout(() => setCloudSaveMessage(null), 3500);
          }
        }
      }
    } catch (err: unknown) {
      console.error('[EditorPage executeSaveToCloud Error]:', err);
      const isFirestore =
        (err as any)?.isFirestoreError ||
        (err instanceof Error && (err.name === 'FirestoreSaveError' || err.message.includes('Firestore')));

      const errorTitle = isFirestore
        ? 'Gagal Menyimpan Data (Firestore)'
        : 'Gagal Mengunggah Media (Cloudinary)';

      const msg = err instanceof Error ? err.message : String(err);
      const suggestion = isFirestore
        ? 'Terjadi kendala saat menyimpan dokumen ke database Firestore. Pastikan koneksi stabil dan izin akses akun Anda valid.'
        : 'Periksa pengaturan Cloudinary atau koneksi internet Anda, lalu coba lagi.';

      setShowUploadModal(true);
      setUploadModalStatus('error');
      setUploadError(msg);
      setUploadErrorTitle(errorTitle);
      setUploadErrorSuggestion(suggestion);
    } finally {
      setIsSavingToCloud(false);
    }
  };

  const handleSaveToCloud = () => executeSaveToCloud('save');
  const handleShareViaLink = () => executeSaveToCloud('share');

  const handleRetryUpload = () => {
    if (pendingActionAfterRetry) {
      executeSaveToCloud(pendingActionAfterRetry);
    } else {
      executeSaveToCloud('save');
    }
  };

  // Active input ref for virtual keyboard insertion
  const lastFocusedInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        lastFocusedInputRef.current = e.target;
      }
    };
    document.addEventListener('focusin', handleFocusIn);
    return () => document.removeEventListener('focusin', handleFocusIn);
  }, []);

  const handleInsertChar = (char: string) => {
    const el = lastFocusedInputRef.current;
    if (!el) return;

    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const val = el.value;
    const newVal = val.substring(0, start) + char + val.substring(end);

    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )?.set;
    if (nativeSetter) {
      nativeSetter.call(el, newVal);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      el.value = newVal;
    }

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + char.length, start + char.length);
    }, 10);
  };

  const handleBackspace = () => {
    const el = lastFocusedInputRef.current;
    if (!el) return;
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const val = el.value;
    if (start === 0 && end === 0) return;

    let newVal = '';
    let newPos = start;
    if (start === end) {
      newVal = val.substring(0, start - 1) + val.substring(end);
      newPos = start - 1;
    } else {
      newVal = val.substring(0, start) + val.substring(end);
      newPos = start;
    }

    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )?.set;
    if (nativeSetter) {
      nativeSetter.call(el, newVal);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      el.value = newVal;
    }

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(newPos, newPos);
    }, 10);
  };

  // Updaters
  const handleUpdateItems = (newItems: any[]) => {
    setDraft((prev) => ({ ...prev, items: newItems }));
  };

  const handleUpdateMediaFiles = (newMedia: Record<string, MediaItem>) => {
    setDraft((prev) => ({ ...prev, mediaFiles: newMedia }));
  };

  const handleAddMedia = (file: File, type: 'image' | 'audio' | 'video'): Promise<string> => {
    return new Promise((resolve) => {
      const mediaId = 'media_' + Math.random().toString(36).substring(2, 9);
      const mediaItem: MediaItem = {
        id: mediaId,
        name: file.name,
        type,
        mimeType: file.type,
        blob: file,
        size: file.size,
      };

      setDraft((prev) => ({
        ...prev,
        mediaFiles: {
          ...prev.mediaFiles,
          [mediaId]: mediaItem,
        },
      }));

      resolve(mediaId);
    });
  };

  const handleRemoveMedia = (mediaId: string) => {
    setDraft((prev) => {
      const nextMedia = { ...prev.mediaFiles };
      delete nextMedia[mediaId];
      return {
        ...prev,
        mediaFiles: nextMedia,
      };
    });
  };

  const handleUpdateTheme = (newTheme: Partial<ThemeConfig>) => {
    setDraft((prev) => ({
      ...prev,
      theme: { ...prev.theme, ...newTheme },
    }));
  };

  const handleUpdateSettings = (newSettings: Partial<DraftSettings>) => {
    setDraft((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
    }));
  };

  const EditorComponent = templateDef.EditorComponent;
  const PlayerComponent = templateDef.PlayerComponent;

  const category = getCategoryByTemplateType(draft.templateType);
  const isMateri = category === 'materi';
  const categoryLabel = isMateri ? 'Materi' : 'Game';
  const backRoute = isMateri ? '/materi' : '/game';

  return (
    <div className="min-h-screen bg-[#FAFCFC] flex flex-col pb-32">
      {/* Top Action Toolbar */}
      <div className="bg-white border-b-2 border-stone-100 px-4 sm:px-6 py-3 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Back & Title input */}
          <div className="flex items-center gap-3 flex-1 min-w-[260px]">
            <button
              type="button"
              onClick={() => onNavigate(backRoute)}
              className="w-11 h-11 flex items-center justify-center text-stone-500 hover:text-[#0A254D] hover:bg-stone-100 rounded-full transition-colors cursor-pointer shrink-0"
              title={`Kembali ke Galeri ${categoryLabel}`}
              aria-label={`Kembali ke Galeri ${categoryLabel}`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex-1 min-w-0">
              {/* Breadcrumb & Category Badge */}
              <div className="flex items-center gap-2 text-xs text-stone-400 px-1 mb-0.5">
                <button
                  type="button"
                  onClick={() => onNavigate(backRoute)}
                  className={`font-black hover:underline cursor-pointer ${
                    isMateri ? 'text-[#00B4D8]' : 'text-[#FF3B8D]'
                  }`}
                >
                  {categoryLabel}
                </button>
                <span>/</span>
                <span className="font-bold text-stone-700">{templateDef.name}</span>
                <span
                  className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase ml-1 ${
                    isMateri
                      ? 'bg-[#E6F7F5] text-[#00B4D8] border-[#00B4D8]/30'
                      : 'bg-[#FFF0F6] text-[#FF3B8D] border-[#FF3B8D]/30'
                  }`}
                >
                  {categoryLabel}
                </span>
              </div>

              <input
                type="text"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Judul Materi / Game..."
                className="w-full text-base sm:text-lg font-black text-[#0A254D] bg-transparent border-b-2 border-transparent hover:border-stone-300 focus:border-[#00B4D8] focus:bg-stone-50 px-1 py-0.5 rounded-lg transition-all focus:outline-hidden"
              />
              <div className="flex items-center gap-2 text-[11px] text-stone-500 px-1 font-medium">
                <span className="flex items-center gap-1.5">
                  {saveStatus === 'saved' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Tersimpan di Browser
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5 text-amber-600 animate-spin" /> Menyimpan...
                    </>
                  )}
                </span>
                {cloudSaveMessage && (
                  <span className="text-[#00B4D8] font-black bg-[#E6F7F5] px-2 py-0.5 rounded-full animate-pulse">
                    · {cloudSaveMessage}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Mobile Tab Switcher */}
            <div className="flex lg:hidden bg-stone-100 p-1 rounded-full border border-stone-200 text-xs font-black">
              <button
                type="button"
                onClick={() => setActiveMobileTab('edit')}
                className={`min-h-[40px] px-4 py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer transition-all ${
                  activeMobileTab === 'edit'
                    ? 'bg-white text-[#0A254D] shadow-xs'
                    : 'text-stone-600'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMobileTab('preview')}
                className={`min-h-[40px] px-4 py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer transition-all ${
                  activeMobileTab === 'preview'
                    ? 'bg-white text-[#0A254D] shadow-xs'
                    : 'text-stone-600'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Pratinjau</span>
              </button>
            </div>

            {/* Quick Input Button */}
            <button
              type="button"
              onClick={() => setShowQuickInput(true)}
              className="hidden sm:flex min-h-[44px] px-4 py-2 text-xs font-black bg-[#E6F7F5] hover:bg-[#00B4D8] text-[#00B4D8] hover:text-white border border-[#00B4D8]/30 rounded-full items-center gap-1.5 transition-all cursor-pointer active:translate-y-0.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Input Cepat</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={() => setShowThemePanel(!showThemePanel)}
              className={`min-h-[44px] min-w-[44px] p-2.5 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ${
                showThemePanel
                  ? 'bg-[#00B4D8] text-white border-[#00B4D8] shadow-xs'
                  : 'bg-white hover:bg-stone-50 text-[#0A254D] border-stone-200'
              }`}
              title="Pengaturan Tema & Kelas"
              aria-label="Pengaturan Tema"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Simpan ke Akun Button */}
            <button
              type="button"
              disabled={isSavingToCloud}
              onClick={handleSaveToCloud}
              className="min-h-[44px] px-4 py-2 text-xs font-black bg-stone-100 hover:bg-stone-200 text-[#0A254D] rounded-full flex items-center gap-1.5 transition-all cursor-pointer border border-stone-200 active:translate-y-0.5"
              title="Simpan ke akun Google"
            >
              {isSavingToCloud ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00B4D8]" />
              ) : (
                <Cloud className="w-3.5 h-3.5 text-[#00B4D8]" />
              )}
              <span className="hidden sm:inline">
                {cloudProjectId ? 'Perbarui di Akun' : 'Simpan ke Akun'}
              </span>
            </button>

            {/* Bagikan lewat Link Button */}
            <button
              type="button"
              disabled={isSavingToCloud}
              onClick={handleShareViaLink}
              className="min-h-[44px] px-4 sm:px-5 py-2 text-xs font-black bg-[#FF3B8D] hover:bg-[#E62879] text-white rounded-full flex items-center gap-1.5 shadow-[0_3px_0_#C2185B] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              title="Bagikan tautan interaktif dan kode QR ke siswa"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Bagikan Link</span>
            </button>

            {/* Play Fullscreen (Projector Mode) */}
            <button
              type="button"
              onClick={() => onNavigate(`/main/${draft.id}`)}
              className="min-h-[44px] px-4 py-2 text-xs font-black bg-[#0A254D] hover:bg-black text-white rounded-full flex items-center gap-1.5 shadow-[0_3px_0_#000] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              title="Mode Main Layar Penuh untuk Proyektor"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden md:inline">Proyektor</span>
            </button>

            {/* Export & Download Button */}
            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="min-h-[44px] px-4 py-2 text-xs font-black bg-white hover:bg-stone-50 text-[#0A254D] border-2 border-stone-200 rounded-full flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:translate-y-0.5"
              title="Unduh file HTML atau ZIP offline"
            >
              <Download className="w-4 h-4 text-stone-600" />
              <span className="hidden lg:inline">Unduh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Teacher Warning Notice */}
      <div className="bg-[#FFF8DC] border-b border-[#FED034]/60 px-4 py-2 text-center text-xs text-[#0A254D] flex items-center justify-center gap-2 font-medium">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          {cloudProjectId
            ? 'Tersimpan di Cloud Akun Google · Draf lokal peramban tetap dicadangkan secara otomatis.'
            : 'Draf tersimpan di peramban ini. Unduh HTML mandiri atau simpan ke akun Google agar bebas risiko terhapus.'}
        </span>
      </div>

      {/* Main Split Layout: Editor (Left) & Live Preview (Right) */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Editor & Settings */}
        <div
          className={`lg:col-span-7 space-y-4 ${
            activeMobileTab === 'edit' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Description input */}
          <div className="bg-white border border-stone-200 rounded-xl p-3 shadow-2xs">
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Deskripsi Singkat Materi:
            </label>
            <input
              type="text"
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="Contoh: Bab 3 - Kosakata Perlengkapan Sekolah Kelas 7..."
              className="w-full text-xs text-stone-700 bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 focus:outline-emerald-600 focus:bg-white"
            />
          </div>

          {/* Theme & Settings Accordion / Panel */}
          {showThemePanel && (
            <div className="mb-4">
              <ThemePanel
                theme={draft.theme}
                settings={draft.settings}
                templateType={draft.templateType}
                onChangeTheme={(newTheme) => setDraft((prev) => ({ ...prev, theme: newTheme }))}
                onChangeSettings={(newSettings) => setDraft((prev) => ({ ...prev, settings: newSettings }))}
              />
            </div>
          )}

          {/* Template-Specific Editor Component */}
          <EditorComponent
            items={draft.items}
            mediaFiles={draft.mediaFiles || {}}
            theme={draft.theme}
            settings={draft.settings}
            onUpdateItems={handleUpdateItems}
            onUpdateMediaFiles={handleUpdateMediaFiles}
            onAddMedia={handleAddMedia}
            onRemoveMedia={handleRemoveMedia}
            onOpenQuickInput={() => setShowQuickInput(true)}
            onUpdateSettings={(newSettings: DraftSettings) =>
              setDraft((prev) => ({ ...prev, settings: newSettings }))
            }
          />
        </div>

        {/* Right Column: Live Interactive Player Preview */}
        <div
          className={`lg:col-span-5 ${
            activeMobileTab === 'preview' ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="sticky top-32 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-stone-600 px-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Pratinjau Langsung Siswa
              </span>
              <span className="text-[11px] text-stone-500 font-normal">
                Interaktif & responsif
              </span>
            </div>

            <div className="bg-stone-50 border-2 border-stone-200 rounded-3xl p-3 sm:p-5 shadow-sm min-h-[500px] flex flex-col justify-center">
              <PlayerComponent
                items={draft.items}
                theme={draft.theme}
                settings={draft.settings}
                mediaFiles={draft.mediaFiles}
                isProjectorMode={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Arabic Keyboard */}
      <ArabicKeyboard onInsertChar={handleInsertChar} onBackspace={handleBackspace} />

      {/* Quick Input Modal */}
      <QuickInputModal
        isOpen={showQuickInput}
        templateType={draft.templateType}
        onClose={() => setShowQuickInput(false)}
        onApplyItems={(items: any[], mode: 'replace' | 'append') => {
          if (mode === 'replace') {
            handleUpdateItems(items);
          } else {
            handleUpdateItems([...draft.items, ...items]);
          }
        }}
      />

      {/* Offline Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        draft={draft}
        onClose={() => setShowExportModal(false)}
      />

      {/* Cloud Share Modal */}
      {showShareModal && cloudShareId && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          title={draft.title}
          shareId={cloudShareId}
          isPublic={isCloudPublic}
          onTogglePublic={async (newStatus) => {
            if (cloudProjectId) {
              await toggleProjectPublic(cloudProjectId, newStatus, cloudShareId);
              setIsCloudPublic(newStatus);
            }
          }}
        />
      )}

      {/* Login Explanation Modal */}
      <LoginExplanationModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onConfirmLogin={async () => {
          setShowLoginModal(false);
          const loggedUser = await signInWithGoogle();
          if (loggedUser) {
            if (loginModalReason === 'share') {
              // Proceed to share
              setTimeout(handleShareViaLink, 300);
            } else if (loginModalReason === 'save') {
              // Proceed to save
              setTimeout(handleSaveToCloud, 300);
            }
          }
        }}
        reason={loginModalReason}
      />

      {/* Migrate Draft Modal */}
      <MigrateDraftModal
        isOpen={showMigrateModal}
        draftTitle={draft.title}
        onConfirm={async () => {
          setShowMigrateModal(false);
          await handleSaveToCloud();
        }}
        onDismiss={() => setShowMigrateModal(false)}
      />

      {/* Cloudinary Media Upload Progress Modal */}
      <UploadProgressModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        status={uploadModalStatus}
        progress={uploadProgressData}
        error={uploadError}
        errorTitle={uploadErrorTitle}
        errorSuggestion={uploadErrorSuggestion}
        failedFiles={failedFilesList}
        configWarning={cloudinaryWarning}
        onRetry={handleRetryUpload}
        onProceedAnyway={() => {
          setShowUploadModal(false);
          if (pendingActionAfterRetry === 'share') {
            setShowShareModal(true);
          } else {
            setCloudSaveMessage('Tersimpan di Cloud!');
            setTimeout(() => setCloudSaveMessage(null), 3500);
          }
        }}
        onOpenExport={() => setShowExportModal(true)}
      />
    </div>
  );
}
