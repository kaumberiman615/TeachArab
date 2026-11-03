import { useState, useEffect, useRef } from 'react';
import { DraftSummary, TemplateType, isMatchingTemplate } from '../types';
import { getAllDrafts, deleteDraft, duplicateDraft, saveDraft } from '../services/storage';
import { importDraftFromJson } from '../utils/export';
import { getTemplate, getTemplateOrNull } from '../templates/registry';
import { getCategoryByTemplateType } from '../templates/categories';
import CreateTemplateDropdown from '../components/CreateTemplateDropdown';
import {
  FolderArchive,
  Play,
  Edit,
  Copy,
  Trash2,
  Upload,
  AlertTriangle,
  Search,
  Calendar,
  Sparkles,
  BookOpen,
  Gamepad2,
  Layers,
} from 'lucide-react';

interface DraftsPageProps {
  onNavigate: (path: string) => void;
}

export default function DraftsPage({ onNavigate }: DraftsPageProps) {
  const [drafts, setDrafts] = useState<DraftSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'materi' | 'game'>('all');
  const [selectedFilter, setSelectedFilter] = useState<'all' | TemplateType>('all');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDrafts = async () => {
    setLoading(true);
    try {
      const list = await getAllDrafts();
      setDrafts(list);
    } catch (err) {
      console.error('Failed to load drafts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrafts();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus draf "${title}"? Tindakan ini tidak dapat dibatalkan.`)) {
      await deleteDraft(id);
      loadDrafts();
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateDraft(id);
      loadDrafts();
    } catch (err: any) {
      alert('Gagal menduplikat draf: ' + err.message);
    }
  };

  // Import JSON project file
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus('Memproses file impor...');
    try {
      const imported = await importDraftFromJson(file);
      await saveDraft(imported);
      setImportStatus('Berhasil mengimpor draf!');
      setTimeout(() => setImportStatus(null), 3000);
      loadDrafts();
      // Redirect to newly imported draft
      onNavigate(`/buat/${imported.templateType}?id=${imported.id}`);
    } catch (err: any) {
      alert('Gagal mengimpor file: ' + err.message);
      setImportStatus(null);
    }
  };

  // Count by category
  const materiCount = drafts.filter((d) => getCategoryByTemplateType(d.templateType) === 'materi').length;
  const gameCount = drafts.filter((d) => getCategoryByTemplateType(d.templateType) === 'game').length;

  const filteredDrafts = drafts.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase());

    const draftCategory = getCategoryByTemplateType(d.templateType);
    const matchesCategory = categoryFilter === 'all' || draftCategory === categoryFilter;

    const matchesTemplate =
      selectedFilter === 'all' ||
      d.templateType === selectedFilter ||
      (isMatchingTemplate(selectedFilter) && isMatchingTemplate(d.templateType));

    return matchesSearch && matchesCategory && matchesTemplate;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Teacher Warning Banner (IndexedDB Reminder) */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Perhatian:</strong> Draf hanya tersimpan di browser ini. Unduh agar aman (HTML atau ZIP) jika cache browser dibersihkan.
          </span>
        </div>
      </div>

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <FolderArchive className="w-6 h-6 text-emerald-700" />
            <span>Draf Lokal</span>
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            Kelola seluruh materi dan game yang tersimpan di memori browser perangkat ini
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImportFile}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 text-xs font-semibold bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 text-stone-500" />
            <span>Impor (.json)</span>
          </button>

          {/* Buat Baru Dropdown with 2 Groups (Materi and Game) */}
          <CreateTemplateDropdown onSelect={(type) => onNavigate(`/buat/${type}`)} />
        </div>
      </div>

      {importStatus && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl">
          {importStatus}
        </div>
      )}

      {/* Two-Tier Filter: Category Level (Semua | Materi | Game) + Template Sub-filter */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-3">
        {/* Top Tier: Search Bar + Category Pills */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul draf..."
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
              <span>Semua ({drafts.length})</span>
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

      {/* Drafts List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-stone-500 text-xs font-medium">Memuat draf dari browser...</p>
        </div>
      ) : filteredDrafts.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center space-y-4">
          <div className="w-14 h-14 bg-stone-100 text-stone-400 rounded-2xl flex items-center justify-center mx-auto">
            <FolderArchive className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-stone-800 text-base">Belum Ada Draf yang Cocok</h3>
          <p className="text-stone-500 text-xs max-w-md mx-auto">
            {searchQuery || selectedFilter !== 'all' || categoryFilter !== 'all'
              ? 'Tidak ditemukan draf dengan filter tersebut. Coba ubah kata kunci atau ganti filter.'
              : 'Mulai rancang materi pelajaran atau game interaktif pertama Anda sekarang.'}
          </p>
          <div className="pt-2">
            <CreateTemplateDropdown
              buttonLabel="Buat Draf Pertama"
              onSelect={(type) => onNavigate(`/buat/${type}`)}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDrafts.map((d) => {
            const template = getTemplateOrNull(d.templateType) || getTemplate('flashcard');
            const Icon = template.icon;
            const category = getCategoryByTemplateType(d.templateType);
            const isMateri = category === 'materi';

            const updatedDate = new Date(d.updatedAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={d.id}
                className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Category and Template Badges */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1.5">
                      {/* Distinct Category Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isMateri
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                        }`}
                      >
                        {isMateri ? 'Materi' : 'Game'}
                      </span>

                      {/* Template Name Badge */}
                      <span className="text-[11px] font-semibold text-stone-700 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Icon className="w-3 h-3 text-stone-600" />
                        <span>{template.name}</span>
                      </span>
                    </div>

                    <span className="text-[10px] text-stone-500 font-mono">
                      {d.itemCount} item
                    </span>
                  </div>

                  <h3 className="font-bold text-stone-900 text-sm line-clamp-1 mb-1">
                    {d.title}
                  </h3>

                  <p className="text-stone-500 text-xs line-clamp-2 min-h-[32px]">
                    {d.description || 'Tidak ada deskripsi tambahan.'}
                  </p>

                  <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-stone-400" /> {updatedDate}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onNavigate(`/main/${d.id}`)}
                      className="px-2.5 py-1.5 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                      title="Buka Mode Proyektor"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Main</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate(`/buat/${d.templateType}?id=${d.id}`)}
                      className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors border border-emerald-200"
                      title="Buka Editor"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDuplicate(d.id)}
                      className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                      title="Duplikat draf ini"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(d.id, d.title)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus draf"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
