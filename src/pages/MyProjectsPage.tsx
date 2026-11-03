import { useState, useEffect } from 'react';
import { useAuth } from '../services/authContext';
import {
  getUserProjects,
  deleteCloudProject,
  duplicateCloudProject,
  toggleProjectPublic,
} from '../services/cloudProjects';
import { CloudProject, TemplateType, isMatchingTemplate } from '../types';
import { getTemplateOrNull } from '../templates/registry';
import { getCategoryByTemplateType } from '../templates/categories';
import CreateTemplateDropdown from '../components/CreateTemplateDropdown';
import { ShareModal } from '../components/ShareModal';
import { LoginExplanationModal } from '../components/LoginExplanationModal';
import {
  Cloud,
  Share2,
  Trash2,
  Copy,
  Edit3,
  Play,
  Globe,
  Lock,
  Loader2,
  FolderArchive,
  Calendar,
  Layers,
  Search,
  BookOpen,
  Gamepad2,
} from 'lucide-react';

interface MyProjectsPageProps {
  onNavigate: (path: string) => void;
}

export default function MyProjectsPage({ onNavigate }: MyProjectsPageProps) {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const [projects, setProjects] = useState<CloudProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'materi' | 'game'>('all');
  const [selectedFilter, setSelectedFilter] = useState<'all' | TemplateType>('all');
  const [selectedShareProject, setSelectedShareProject] = useState<CloudProject | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const fetchProjects = async (uid: string) => {
    try {
      setLoading(true);
      const list = await getUserProjects(uid);
      setProjects(list);
    } catch (err) {
      console.error('Gagal mengambil daftar proyek:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects(user.uid);
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleTogglePublic = async (projectId: string, currentStatus: boolean, shareId: string) => {
    try {
      const nextStatus = !currentStatus;
      await toggleProjectPublic(projectId, nextStatus, shareId);
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, isPublic: nextStatus } : p))
      );
      if (selectedShareProject && selectedShareProject.id === projectId) {
        setSelectedShareProject((prev) => (prev ? { ...prev, isPublic: nextStatus } : null));
      }
    } catch (err) {
      console.error('Gagal mengubah status publik:', err);
      alert('Gagal memperbarui status link berbagi.');
    }
  };

  const handleDelete = async (projectId: string, title: string) => {
    if (!confirm(`Yakin ingin menghapus materi "${title}" dari cloud? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }
    setDeletingId(projectId);
    try {
      await deleteCloudProject(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (err) {
      console.error('Gagal menghapus proyek:', err);
      alert('Gagal menghapus materi.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDuplicate = async (projectId: string) => {
    if (!user) return;
    setDuplicatingId(projectId);
    try {
      const dup = await duplicateCloudProject(projectId, user);
      setProjects((prev) => [dup, ...prev]);
    } catch (err) {
      console.error('Gagal menduplikasi proyek:', err);
      alert('Gagal menduplikasi materi.');
    } finally {
      setDuplicatingId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-9 h-9 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-stone-600 text-xs font-semibold">Memeriksa status akun...</p>
        </div>
      </div>
    );
  }

  // Guest State - Requires Login to view cloud materials
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
        <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center shadow-sm max-w-xl mx-auto">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-xs">
            <Cloud className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight mb-2">
            Materi Saya di Cloud
          </h2>
          <p className="text-stone-600 text-sm leading-relaxed mb-6">
            Masuk dengan Google untuk mengelola materi yang tersimpan di cloud, membagikan link interaktif ke siswa, dan mengunduh kode QR untuk kelas.
          </p>

          <div className="space-y-3 mb-8">
            <button
              type="button"
              onClick={() => setShowLoginModal(true)}
              className="w-full py-3.5 px-6 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-98"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.24 10.285V13.4h6.887C18.2 16.14 15.645 18 12.24 18c-3.315 0-6-2.685-6-6s2.685-6 6-6c1.61 0 3.09.62 4.225 1.635l2.4-2.4C17.065 3.51 14.79 2.5 12.24 2.5 7.02 2.5 2.76 6.76 2.76 12s4.26 9.5 9.48 9.5c5.46 0 9.1-3.84 9.1-9.26 0-.62-.06-1.22-.16-1.74H12.24z" />
              </svg>
              <span>Masuk dengan Akun Google</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/draf')}
              className="w-full py-3 px-6 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs rounded-2xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <FolderArchive className="w-4 h-4 text-stone-500" />
              <span>Buka Draf Tersimpan di Browser Lokal (Tanpa Login)</span>
            </button>
          </div>

          <p className="text-[11px] text-stone-600">
            Draf materi Anda di browser tetap aman dan tidak akan hilang saat masuk.
          </p>
        </div>

        <LoginExplanationModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onConfirmLogin={async () => {
            setShowLoginModal(false);
            await signInWithGoogle();
          }}
          reason="save"
        />
      </div>
    );
  }

  // Count by category
  const materiCount = projects.filter((p) => getCategoryByTemplateType(p.templateType) === 'materi').length;
  const gameCount = projects.filter((p) => getCategoryByTemplateType(p.templateType) === 'game').length;

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const projCategory = getCategoryByTemplateType(p.templateType);
    const matchesCategory = categoryFilter === 'all' || projCategory === categoryFilter;

    const matchesTemplate =
      selectedFilter === 'all' ||
      p.templateType === selectedFilter ||
      (isMatchingTemplate(selectedFilter) && isMatchingTemplate(p.templateType));

    return matchesSearch && matchesCategory && matchesTemplate;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">
              Materi Saya
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {projects.length} Proyek Cloud
            </span>
          </div>
          <p className="text-xs text-stone-500">
            Tersimpan di akun Google: <strong className="text-stone-700">{user.email}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigate('/draf')}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FolderArchive className="w-4 h-4 text-stone-500" />
            <span>Draf Lokal</span>
          </button>

          {/* Buat Baru Dropdown with 2 Groups */}
          <CreateTemplateDropdown onSelect={(type) => onNavigate(`/buat/${type}`)} />
        </div>
      </div>

      {/* Two-Tier Filter: Category Level (Semua | Materi | Game) + Template Sub-filter */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-3 mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari materi tersimpan..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-emerald-600 focus:bg-white"
            />
          </div>

          {/* Primary Category Filter (Semua | Materi | Game) */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl border border-stone-200 w-full sm:w-auto overflow-x-auto text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setCategoryFilter('all');
                setSelectedFilter('all');
              }}
              className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                categoryFilter === 'all'
                  ? 'bg-white text-stone-900 shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Semua ({projects.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCategoryFilter('materi');
                setSelectedFilter('all');
              }}
              className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                categoryFilter === 'materi'
                  ? 'bg-emerald-700 text-white shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Materi ({materiCount})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCategoryFilter('game');
                setSelectedFilter('all');
              }}
              className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                categoryFilter === 'game'
                  ? 'bg-indigo-700 text-white shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Game ({gameCount})</span>
            </button>
          </div>
        </div>

        {/* Sub-filter per template */}
        <div className="pt-2 border-t border-stone-100 flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider shrink-0 mr-1">
            Format:
          </span>

          <button
            type="button"
            onClick={() => setSelectedFilter('all')}
            className={`px-2.5 py-1 rounded-lg border text-xs cursor-pointer transition-colors whitespace-nowrap ${
              selectedFilter === 'all'
                ? 'bg-stone-900 text-white border-stone-900 font-bold'
                : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
            }`}
          >
            Semua Format
          </button>

          {(categoryFilter === 'all' || categoryFilter === 'materi') && (
            <>
              <button
                type="button"
                onClick={() => setSelectedFilter(selectedFilter === 'slide' ? 'all' : 'slide')}
                className={`px-2.5 py-1 rounded-lg border text-xs cursor-pointer transition-colors whitespace-nowrap ${
                  selectedFilter === 'slide'
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Slide
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter(selectedFilter === 'vocab-picture' ? 'all' : 'vocab-picture')}
                className={`px-2.5 py-1 rounded-lg border text-xs cursor-pointer transition-colors whitespace-nowrap ${
                  selectedFilter === 'vocab-picture'
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Kosakata Gambar
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter(selectedFilter === 'reading' ? 'all' : 'reading')}
                className={`px-2.5 py-1 rounded-lg border text-xs cursor-pointer transition-colors whitespace-nowrap ${
                  selectedFilter === 'reading'
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Qira'ah
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter(selectedFilter === 'word-table' ? 'all' : 'word-table')}
                className={`px-2.5 py-1 rounded-lg border text-xs cursor-pointer transition-colors whitespace-nowrap ${
                  selectedFilter === 'word-table'
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Tabel / Tashrif
              </button>
            </>
          )}

          {(categoryFilter === 'all' || categoryFilter === 'game') && (
            <>
              <button
                type="button"
                onClick={() => setSelectedFilter(selectedFilter === 'flashcard' ? 'all' : 'flashcard')}
                className={`px-2.5 py-1 rounded-lg border text-xs cursor-pointer transition-colors whitespace-nowrap ${
                  selectedFilter === 'flashcard'
                    ? 'bg-indigo-100 text-indigo-900 border-indigo-300 font-bold'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Flashcard
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter(selectedFilter === 'kuis' ? 'all' : 'kuis')}
                className={`px-2.5 py-1 rounded-lg border text-xs cursor-pointer transition-colors whitespace-nowrap ${
                  selectedFilter === 'kuis'
                    ? 'bg-indigo-100 text-indigo-900 border-indigo-300 font-bold'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Kuis
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter(isMatchingTemplate(selectedFilter) ? 'all' : 'matching')}
                className={`px-2.5 py-1 rounded-lg border text-xs cursor-pointer transition-colors whitespace-nowrap ${
                  isMatchingTemplate(selectedFilter)
                    ? 'bg-indigo-100 text-indigo-900 border-indigo-300 font-bold'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Mencocokkan
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-stone-500 text-xs font-medium">Memuat materi cloud Anda...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-14 h-14 bg-stone-100 text-stone-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Layers className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 mb-1">
            Belum Ada Materi yang Cocok
          </h3>
          <p className="text-stone-500 text-xs leading-relaxed mb-6">
            {searchQuery || selectedFilter !== 'all' || categoryFilter !== 'all'
              ? 'Tidak ditemukan proyek materi dengan filter pencarian tersebut.'
              : 'Materi yang Anda buat di editor dapat disimpan ke akun cloud atau dibagikan langsung ke siswa lewat link publik.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
            <CreateTemplateDropdown onSelect={(type) => onNavigate(`/buat/${type}`)} />
            <button
              type="button"
              onClick={() => onNavigate('/draf')}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Lihat Draf Browser
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => {
            const templateDef = getTemplateOrNull(proj.templateType) || getTemplateOrNull('flashcard')!;
            const Icon = templateDef.icon;
            const category = getCategoryByTemplateType(proj.templateType);
            const isMateri = category === 'materi';
            const itemCount = Array.isArray(proj.content?.items) ? proj.content.items.length : 0;
            const updatedDate = new Date(proj.updatedAt || proj.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={proj.id}
                className="bg-white rounded-2xl border border-stone-200 hover:border-emerald-300 transition-all p-5 shadow-xs flex flex-col justify-between group"
              >
                <div>
                  {/* Top tags: Category Badge + Template Badge + Privacy Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Category Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isMateri
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                        }`}
                      >
                        {isMateri ? 'Materi' : 'Game'}
                      </span>

                      {/* Template Name */}
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[11px] font-bold border border-stone-200">
                        <Icon className="w-3 h-3 text-stone-600" />
                        <span>{templateDef.name}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTogglePublic(proj.id, proj.isPublic, proj.shareId)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                        proj.isPublic
                          ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                      title={proj.isPublic ? 'Klik untuk matikan link' : 'Klik untuk aktifkan link'}
                    >
                      {proj.isPublic ? <Globe className="w-3 h-3 text-emerald-600" /> : <Lock className="w-3 h-3" />}
                      <span>{proj.isPublic ? 'Publik' : 'Privat'}</span>
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-stone-900 group-hover:text-emerald-800 transition-colors line-clamp-1 mb-1">
                    {proj.title}
                  </h3>

                  {proj.description && (
                    <p className="text-xs text-stone-500 line-clamp-2 mb-3">
                      {proj.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-stone-600 mb-5">
                    <span>{itemCount} Butir</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {updatedDate}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onNavigate(`/buat/${proj.templateType}?cloudId=${proj.id}`)}
                      className="p-2 hover:bg-emerald-50 text-stone-600 hover:text-emerald-800 rounded-xl transition-colors cursor-pointer"
                      title="Ubah di Editor"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigate(`/p/${proj.shareId}`)}
                      className="p-2 hover:bg-emerald-50 text-stone-600 hover:text-emerald-800 rounded-xl transition-colors cursor-pointer"
                      title="Main / Pratinjau Siswa"
                    >
                      <Play className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      disabled={duplicatingId === proj.id}
                      onClick={() => handleDuplicate(proj.id)}
                      className="p-2 hover:bg-stone-100 text-stone-600 hover:text-stone-900 rounded-xl transition-colors cursor-pointer"
                      title="Duplikat Materi"
                    >
                      {duplicatingId === proj.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-stone-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={deletingId === proj.id}
                      onClick={() => handleDelete(proj.id, proj.title)}
                      className="p-2 hover:bg-rose-50 text-stone-400 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
                      title="Hapus Materi"
                    >
                      {deletingId === proj.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-stone-500" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedShareProject(proj)}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-95"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Bagikan</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Share Modal Dialog */}
      {selectedShareProject && (
        <ShareModal
          isOpen={true}
          onClose={() => setSelectedShareProject(null)}
          shareId={selectedShareProject.shareId}
          title={selectedShareProject.title}
          isPublic={selectedShareProject.isPublic}
          onTogglePublic={async (status) => {
            await handleTogglePublic(
              selectedShareProject.id,
              selectedShareProject.isPublic,
              selectedShareProject.shareId
            );
          }}
        />
      )}
    </div>
  );
}
