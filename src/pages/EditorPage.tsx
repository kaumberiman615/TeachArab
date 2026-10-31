import { useState, useEffect, useRef } from 'react';
import { Draft, TemplateType, MediaItem, ThemeConfig, DraftSettings, isMatchingTemplate } from '../types';
import { getTemplateOrNull } from '../templates/registry';
import { saveDraft, getDraft } from '../services/storage';
import ThemePanel from '../components/ThemePanel';
import QuickInputModal from '../components/QuickInputModal';
import ExportModal from '../components/ExportModal';
import ArabicKeyboard from '../components/ArabicKeyboard';
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
} from 'lucide-react';

interface EditorPageProps {
  templateType: string;
  initialDraftId?: string;
  onNavigate: (path: string) => void;
}

export default function EditorPage({
  templateType,
  initialDraftId,
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

  // Initialize draft based on valid templateDef
  const [draft, setDraft] = useState<Draft>(() => {
    return templateDef.createDefaultDraft();
  });

  const [activeMobileTab, setActiveMobileTab] = useState<'edit' | 'preview'>('edit');
  const [showThemePanel, setShowThemePanel] = useState(false);
  const [showQuickInput, setShowQuickInput] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  // Load existing draft if draftId provided and matches type
  useEffect(() => {
    if (initialDraftId) {
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
  }, [initialDraftId, templateDef.id]);

  // Debounced Auto-save to IndexedDB
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

  const handleUpdateTheme = (newTheme: ThemeConfig) => {
    setDraft((prev) => ({ ...prev, theme: newTheme }));
  };

  const handleUpdateSettings = (newSettings: DraftSettings) => {
    setDraft((prev) => ({ ...prev, settings: newSettings }));
  };

  const handleApplyQuickItems = (newItems: any[], mode: 'replace' | 'append') => {
    if (mode === 'replace') {
      setDraft((prev) => ({ ...prev, items: newItems }));
    } else {
      setDraft((prev) => ({ ...prev, items: [...prev.items, ...newItems] }));
    }
  };

  // Specific Editor and Player from registry
  const EditorComponent = templateDef.EditorComponent;
  const PlayerComponent = templateDef.PlayerComponent;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-stone-50">
      {/* Top Action Toolbar */}
      <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-3 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Back & Title input */}
          <div className="flex items-center gap-3 flex-1 min-w-[240px]">
            <button
              type="button"
              onClick={() => onNavigate('/draf')}
              className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
              title="Kembali ke Daftar Draf"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex-1">
              <input
                type="text"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Judul Materi / Game..."
                className="w-full text-base sm:text-lg font-bold text-stone-900 bg-transparent border-b border-transparent hover:border-stone-300 focus:border-emerald-600 focus:bg-stone-50 px-1 py-0.5 rounded transition-all focus:outline-hidden"
              />
              <div className="flex items-center gap-2 text-[11px] text-stone-500 px-1">
                <span className="font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                  {templateDef.name}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  {saveStatus === 'saved' ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Tersimpan di Browser
                    </>
                  ) : (
                    <>
                      <Save className="w-3 h-3 text-amber-600 animate-spin" /> Menyimpan...
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions & Mobile Tabs */}
          <div className="flex items-center gap-2">
            {/* Mobile Tab Switcher */}
            <div className="flex lg:hidden bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveMobileTab('edit')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors ${
                  activeMobileTab === 'edit'
                    ? 'bg-white text-stone-900 shadow-2xs font-bold'
                    : 'text-stone-600'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMobileTab('preview')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors ${
                  activeMobileTab === 'preview'
                    ? 'bg-white text-stone-900 shadow-2xs font-bold'
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
              className="hidden sm:flex px-3 py-2 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Input Cepat</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={() => setShowThemePanel(!showThemePanel)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                showThemePanel
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
              }`}
              title="Pengaturan Tema & Kelas"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Play Fullscreen (Projector Mode) */}
            <button
              type="button"
              onClick={() => onNavigate(`/main/${draft.id}`)}
              className="px-3.5 py-2 text-xs font-bold bg-stone-900 hover:bg-black text-white rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer active:scale-95"
              title="Mode Main Layar Penuh untuk Proyektor"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Mode Proyektor</span>
            </button>

            {/* Export & Download Button */}
            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="px-4 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Unduh / Ekspor</span>
            </button>
          </div>
        </div>
      </div>

      {/* Teacher Warning Notice */}
      <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-1.5 text-center text-[12px] text-amber-900 flex items-center justify-center gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>Draf hanya tersimpan di browser ini. Unduh file materi agar aman dibuka kapan saja.</span>
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
            <ThemePanel
              templateType={draft.templateType}
              theme={draft.theme}
              settings={draft.settings}
              onChangeTheme={handleUpdateTheme}
              onChangeSettings={handleUpdateSettings}
            />
          )}

          {/* Template-specific Editor Component */}
          <EditorComponent
            items={draft.items}
            theme={draft.theme}
            mediaFiles={draft.mediaFiles}
            onUpdateItems={handleUpdateItems}
            onUpdateMediaFiles={handleUpdateMediaFiles}
            onOpenQuickInput={() => setShowQuickInput(true)}
          />
        </div>

        {/* Right Column: Live Interactive Preview */}
        <div
          className={`lg:col-span-5 ${
            activeMobileTab === 'preview' ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="lg:sticky lg:top-36 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-600 px-1">
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-emerald-700" />
                <span>Pratinjau Langsung ({templateDef.name})</span>
              </span>
              <button
                type="button"
                onClick={() => onNavigate(`/main/${draft.id}`)}
                className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Perbesar Proyektor</span>
                <Play className="w-3 h-3 fill-current" />
              </button>
            </div>

            {/* Preview Viewport Container */}
            <div className="bg-stone-100 border-2 border-stone-200 rounded-2xl p-4 min-h-[480px] flex flex-col justify-center items-center shadow-inner">
              <PlayerComponent
                items={draft.items}
                theme={draft.theme}
                settings={draft.settings}
                mediaFiles={draft.mediaFiles}
                isProjectorMode={false}
              />
            </div>

            <p className="text-[11px] text-stone-600 text-center">
              Semua perubahan di editor sebelah kiri langsung terlihat di pratinjau ini secara instan.
            </p>
          </div>
        </div>
      </div>

      {/* Arabic Virtual Keyboard Component */}
      <ArabicKeyboard
        onInsertChar={handleInsertChar}
        onBackspace={handleBackspace}
      />

      {/* Quick Input Modal */}
      <QuickInputModal
        isOpen={showQuickInput}
        templateType={draft.templateType}
        onClose={() => setShowQuickInput(false)}
        onApplyItems={handleApplyQuickItems}
      />

      {/* Export / Download Modal */}
      <ExportModal
        isOpen={showExportModal}
        draft={draft}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
}
