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
  ArrowRight,
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
          <div className="w-10 h-10 border-4 border-[#00B4D8] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-stone-600 text-xs font-bold">Memeriksa status akun...</p>
        </div>
      </div>
    );
  }

  // Guest State - Friendly Bubble Bash card prompting login
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
        <div className="bg-white rounded-[36px] border-2 border-stone-100 p-8 sm:p-12 text-center shadow-lg max-w-xl mx-auto space-y-6 relative overflow-hidden">
          <div aria-hidden="true" className="absolute -top-10 -right-10 w-32 h-32 bg-[#E6F7F5] rounded-full blur-md pointer-events-none" />
          <div aria-hidden="true" className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#FFF0F6] rounded-full blur-md pointer-events-none" />

          <div className="w-18 h-18 bg-[#E6F7F5] text-[#00B4D8] rounded-3xl flex items-center justify-center mx-auto shadow-xs border-2 border-white relative z-10">
            <Cloud className="w-9 h-9" />
          </div>

          <div className="relative z-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-[#0A254D] tracking-tight">
              Materi Saya di Cloud
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
              Masuk dengan Google untuk mengelola materi yang tersimpan di cloud, membagikan link interaktif ke siswa, dan mengunduh kode QR untuk kelas.
            </p>
          </div>

          <div className="space-y-3 relative z-10 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => setShowLoginModal(true)}
              className="w-full min-h-[48px] py-3.5 px-6 bg-[#00B4D8] hover:bg-[#0096C7] text-white font-black text-sm rounded-full shadow-[0_4px_0_#0077B6] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                <path d="M12.24 10.285V13.4h6.887C18.2 16.14 15.645 18 12.24 18c-3.315 0-6-2.685-6-6s2.685-6 6-6c1.61 0 3.09.62 4.225 1.635l2.4-2.4C17.065 3.51 14.79 2.5 12.24 2.5 7.02 2.5 2.76 6.76 2.76 12s4.26 9.5 9.48 9.5c5.46 0 9.1-3.84 9.1-9.26 0-.62-.06-1.22-.16-1.74H12.24z" />
              </svg>
              <span>Masuk dengan Akun Google</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/draf')}
              className="w-full min-h-[44px] py-3 px-6 bg-stone-100 hover:bg-stone-200 text-[#0A254D] font-bold text-xs rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <FolderArchive className="w-4 h-4 text-stone-500" />
              <span>Buka Draf Tersimpan di Browser Lokal (Tanpa Login)</span>
            </button>
          </div>

          <p className="text-[11px] text-stone-400 font-medium relative z-10">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-[#E6F7F5] text-[#00B4D8] flex items-center justify-center shadow-xs">
              <Cloud className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0A254D]">
              Materi Saya
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-[#E6F7F5] text-[#00B4D8] border border-[#00B4D8]/20">
              {projects.length} Proyek Cloud
            </span>
          </div>
          <p className="text-xs text-stone-500 font-medium">
            Tersimpan di akun Google: <strong className="text-[#0A254D]">{user.email}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => onNavigate('/draf')}
            className="min-h-[44px] px-4 py-2 bg-stone-100 hover:bg-stone-200 text-[#0A254D] text-xs font-bold rounded-full transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FolderArchive className="w-4 h-4 text-stone-500" />
            <span>Draf Lokal</span>
          </button>

          {/* Buat Baru Dropdown */}
          <CreateTemplateDropdown onSelect={(type) => onNavigate(`/buat/${type}`)} />
        </div>
      </div>

      {/* Two-Tier Filter: Category Level (Semua | Materi | Game) + Template Sub-filter */}
      <div className="bg-white border-2 border-stone-100 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari materi tersimpan..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-stone-50 border-2 border-stone-200 rounded-full focus:outline-[#00B4D8] focus:bg-white text-[#0A254D] font-medium"
            />
          </div>

          {/* Primary Category Filter (Semua | Materi | Game) */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-full border border-stone-200/80 w-full sm:w-auto overflow-x-auto text-xs font-black">
            <button
              type="button"
              onClick={() => {
                setCategoryFilter('all');
                setSelectedFilter('all');
              }}
              className={`min-h-[38px] px-4 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                categoryFilter === 'all'
                  ? 'bg-white text-[#0A254D] shadow-xs'
                  : 'text-stone-600 hover:text-[#0A254D]'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-stone-500" />
              <span>Semua ({projects.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCategoryFilter('materi');
                setSelectedFilter('all');
              }}
              className={`min-h-[38px] px-4 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                categoryFilter === 'materi'
                  ? 'bg-[#00B4D8] text-white shadow-xs'
                  : 'text-stone-600 hover:text-[#00B4D8]'
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
              className={`min-h-[38px] px-4 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                categoryFilter === 'game'
                  ? 'bg-[#FF3B8D] text-white shadow-xs'
                  : 'text-stone-600 hover:text-[#FF3B8D]'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Game ({gameCount})</span>
            </button>
          </div>
        </div>

        {/* Sub-filter per template */}
        <div className="pt-3 border-t border-stone-100 flex items-center gap-2 overflow-x-auto text-xs pb-1">
          <span className="text-[11px] font-black text-stone-400 uppercase tracking-wider shrink-0 mr-1">
            Format:
          </span>

          <button
            type="button"
            onClick={() => setSelectedFilter('all')}
            className={`min-h-[32px] px-3.5 py-1 rounded-full border text-xs cursor-pointer transition-all whitespace-nowrap font-bold ${
              selectedFilter === 'all'
                ? 'bg-[#0A254D] text-white border-[#0A254D]'
                : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
            }`}
          >
            Semua
          </button>

          {(categoryFilter === 'all' || categoryFilter === 'materi') && (
            <>
              <button
                type="button"
                onClick={() => setSelectedFilter(selectedFilter === 'slide' ? 'all' : 'slide')}
                className={`min-h-[32px] px-3.5 py-1 rounded-full border text-xs cursor-pointer transition-all whitespace-nowrap font-bold ${
                  selectedFilter === 'slide'
                    ? 'bg-[#E6F7F5] text-[#00B4D8] border-[#00B4D8]'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Slide
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter(selectedFilter === 'vocab-picture' ? 'all' : 'vocab-picture')}
                className={`min-h-[32px] px-3.5 py-1 rounded-full border text-xs cursor-pointer transition-all whitespace-nowrap font-bold ${
                  selectedFilter === 'vocab-picture'
                    ? 'bg-[#E6F7F5] text-[#00B4D8] border-[#00B4D8]'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Kosakata Gambar
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter(selectedFilter === 'reading' ? 'all' : 'reading')}
                className={`min-h-[32px] px-3.5 py-1 rounded-full border text-xs cursor-pointer transition-all whitespace-nowrap font-bold ${
                  selectedFilter === 'reading'
                    ? 'bg-[#E6F7F5] text-[#00B4D8] border-[#00B4D8]'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Qira'ah
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter(selectedFilter === 'word-table' ? 'all' : 'word-table')}
                className={`min-h-[32px] px-3.5 py-1 rounded-full border text-xs cursor-pointer transition-all whitespace-nowrap font-bold ${
                  selectedFilter === 'word-table'
                    ? 'bg-[#E6F7F5] text-[#00B4D8] border-[#00B4D8]'
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
                className={`min-h-[32px] px-3.5 py-1 rounded-full border text-xs cursor-pointer transition-all whitespace-nowrap font-bold ${
                  selectedFilter === 'flashcard'
                    ? 'bg-[#FFF0F6] text-[#FF3B8D] border-[#FF3B8D]'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Flashcard
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter(selectedFilter === 'kuis' ? 'all' : 'kuis')}
                className={`min-h-[32px] px-3.5 py-1 rounded-full border text-xs cursor-pointer transition-all whitespace-nowrap font-bold ${
                  selectedFilter === 'kuis'
                    ? 'bg-[#FFF0F6] text-[#FF3B8D] border-[#FF3B8D]'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Kuis
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter(isMatchingTemplate(selectedFilter) ? 'all' : 'matching')}
                className={`min-h-[32px] px-3.5 py-1 rounded-full border text-xs cursor-pointer transition-all whitespace-nowrap font-bold ${
                  isMatchingTemplate(selectedFilter)
                    ? 'bg-[#FFF0F6] text-[#FF3B8D] border-[#FF3B8D]'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Mencocokkan
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter(selectedFilter === 'true-false' ? 'all' : 'true-false')}
                className={`min-h-[32px] px-3.5 py-1 rounded-full border text-xs cursor-pointer transition-all whitespace-nowrap font-bold ${
                  selectedFilter === 'true-false'
                    ? 'bg-[#FFF0F6] text-[#FF3B8D] border-[#FF3B8D]'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Benar/Salah
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter(selectedFilter === 'memory' ? 'all' : 'memory')}
                className={`min-h-[32px] px-3.5 py-1 rounded-full border text-xs cursor-pointer transition-all whitespace-nowrap font-bold ${
                  selectedFilter === 'memory'
                    ? 'bg-[#FFF0F6] text-[#FF3B8D] border-[#FF3B8D]'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Memory Card
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter(selectedFilter === 'wheel' ? 'all' : 'wheel')}
                className={`min-h-[32px] px-3.5 py-1 rounded-full border text-xs cursor-pointer transition-all whitespace-nowrap font-bold ${
                  selectedFilter === 'wheel'
                    ? 'bg-[#FFF0F6] text-[#FF3B8D] border-[#FF3B8D]'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Roda Acak
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter(selectedFilter === 'letter-order' ? 'all' : 'letter-order')}
                className={`min-h-[32px] px-3.5 py-1 rounded-full border text-xs cursor-pointer transition-all whitespace-nowrap font-bold ${
                  selectedFilter === 'letter-order'
                    ? 'bg-[#FFF0F6] text-[#FF3B8D] border-[#FF3B8D]'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Susun Huruf
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter(selectedFilter === 'sentence-order' ? 'all' : 'sentence-order')}
                className={`min-h-[32px] px-3.5 py-1 rounded-full border text-xs cursor-pointer transition-all whitespace-nowrap font-bold ${
                  selectedFilter === 'sentence-order'
                    ? 'bg-[#FFF0F6] text-[#FF3B8D] border-[#FF3B8D]'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Susun Kalimat
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter(selectedFilter === 'fill-blank' ? 'all' : 'fill-blank')}
                className={`min-h-[32px] px-3.5 py-1 rounded-full border text-xs cursor-pointer transition-all whitespace-nowrap font-bold ${
                  selectedFilter === 'fill-blank'
                    ? 'bg-[#FFF0F6] text-[#FF3B8D] border-[#FF3B8D]'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Isian Singkat
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter(selectedFilter === 'guess' ? 'all' : 'guess')}
                className={`min-h-[32px] px-3.5 py-1 rounded-full border text-xs cursor-pointer transition-all whitespace-nowrap font-bold ${
                  selectedFilter === 'guess'
                    ? 'bg-[#FFF0F6] text-[#FF3B8D] border-[#FF3B8D]'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Tebak Media
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#00B4D8] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-stone-500 text-xs font-bold">Memuat materi cloud Anda...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-[32px] border-2 border-stone-200 p-12 text-center max-w-lg mx-auto shadow-xs space-y-4">
          <div className="w-16 h-16 bg-[#E6F7F5] text-[#00B4D8] rounded-3xl flex items-center justify-center mx-auto border-2 border-[#00B4D8]/30">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-[#0A254D]">
            Belum Ada Materi yang Cocok
          </h3>
          <p className="text-stone-500 text-xs leading-relaxed max-w-sm mx-auto">
            {searchQuery || selectedFilter !== 'all' || categoryFilter !== 'all'
              ? 'Tidak ditemukan materi cloud dengan filter pencarian tersebut.'
              : 'Materi yang Anda buat di editor dapat disimpan ke akun cloud atau dibagikan langsung ke siswa lewat link publik.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
            <CreateTemplateDropdown onSelect={(type) => onNavigate(`/buat/${type}`)} />
            <button
              type="button"
              onClick={() => onNavigate('/draf')}
              className="min-h-[44px] px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-[#0A254D] text-xs font-bold rounded-full transition-colors cursor-pointer"
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
                className={`bg-white rounded-3xl p-5 border-t-6 ${
                  isMateri ? 'border-t-[#00B4D8]' : 'border-t-[#FF3B8D]'
                } border-x border-b border-stone-200/80 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group`}
              >
                <div>
                  {/* Top tags: Category Badge + Template Badge + Privacy Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Category Badge */}
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                          isMateri
                            ? 'bg-[#E6F7F5] text-[#00B4D8] border-[#00B4D8]/30'
                            : 'bg-[#FFF0F6] text-[#FF3B8D] border-[#FF3B8D]/30'
                        }`}
                      >
                        {isMateri ? 'Materi' : 'Game'}
                      </span>

                      {/* Template Name */}
                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-stone-100 text-[#0A254D] text-[11px] font-bold border border-stone-200">
                        <Icon className="w-3 h-3 text-stone-500" />
                        <span>{templateDef.name}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTogglePublic(proj.id, proj.isPublic, proj.shareId)}
                      className={`min-h-[28px] px-2.5 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer ${
                        proj.isPublic
                          ? 'bg-[#E6F7F5] text-[#00B4D8] hover:bg-[#00B4D8] hover:text-white border border-[#00B4D8]/30'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200'
                      }`}
                      title={proj.isPublic ? 'Klik untuk matikan link publik' : 'Klik untuk aktifkan link publik'}
                    >
                      {proj.isPublic ? <Globe className="w-3 h-3 text-[#00B4D8]" /> : <Lock className="w-3 h-3" />}
                      <span>{proj.isPublic ? 'Publik' : 'Privat'}</span>
                    </button>
                  </div>

                  <h3 className="text-base font-black text-[#0A254D] group-hover:text-[#00B4D8] transition-colors line-clamp-1 mb-1">
                    {proj.title}
                  </h3>

                  {proj.description && (
                    <p className="text-xs text-stone-500 line-clamp-2 mb-3 leading-relaxed">
                      {proj.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-stone-400 mb-4">
                    <span className="font-bold text-stone-600">{itemCount} Butir</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {updatedDate}
                    </span>
                  </div>
                </div>

                {/* Card Actions with >=44px buttons */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onNavigate(`/buat/${proj.templateType}?cloudId=${proj.id}`)}
                      className="w-11 h-11 flex items-center justify-center hover:bg-[#E6F7F5] text-stone-600 hover:text-[#00B4D8] rounded-full transition-colors cursor-pointer"
                      title="Ubah di Editor"
                      aria-label="Ubah di Editor"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigate(`/p/${proj.shareId}`)}
                      className="w-11 h-11 flex items-center justify-center hover:bg-[#E6F7F5] text-stone-600 hover:text-[#00B4D8] rounded-full transition-colors cursor-pointer"
                      title="Main / Pratinjau Siswa"
                      aria-label="Main atau Pratinjau Siswa"
                    >
                      <Play className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      disabled={duplicatingId === proj.id}
                      onClick={() => handleDuplicate(proj.id)}
                      className="w-11 h-11 flex items-center justify-center hover:bg-stone-100 text-stone-600 hover:text-[#0A254D] rounded-full transition-colors cursor-pointer"
                      title="Duplikat Materi"
                      aria-label="Duplikat Materi"
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
                      className="w-11 h-11 flex items-center justify-center hover:bg-rose-50 text-stone-400 hover:text-rose-600 rounded-full transition-colors cursor-pointer"
                      title="Hapus Materi"
                      aria-label="Hapus Materi"
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
                    className="min-h-[44px] px-4 py-2 bg-[#FF3B8D] hover:bg-[#E62879] text-white text-xs font-black rounded-full flex items-center gap-1.5 shadow-[0_3px_0_#C2185B] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
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
