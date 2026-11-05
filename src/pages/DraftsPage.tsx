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
  FileQuestion,
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
      <div className="p-3.5 bg-[#FFF8DC] border-2 border-[#FED034] rounded-2xl text-xs text-[#0A254D] flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-[#FED034] text-[#0A254D] flex items-center justify-center shrink-0 font-bold">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <span className="font-medium">
            <strong>Catatan Guru:</strong> Draf tersimpan di memori browser ini. Unduh berkas HTML atau ZIP agar aman jika cache peramban dibersihkan.
          </span>
        </div>
      </div>

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
              <FolderArchive className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0A254D] tracking-tight">
              Draf Lokal
            </h1>
          </div>
          <p className="text-stone-500 text-xs sm:text-sm mt-1 font-medium">
            Kelola seluruh materi dan game yang tersimpan di memori peramban perangkat ini ({drafts.length} draf)
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
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
            className="min-h-[44px] px-4 py-2.5 text-xs font-black bg-white hover:bg-stone-50 text-[#0A254D] border-2 border-stone-200 rounded-full flex items-center gap-2 transition-all cursor-pointer shadow-xs active:translate-y-0.5"
          >
            <Upload className="w-4 h-4 text-stone-500" />
            <span>Impor (.json)</span>
          </button>

          {/* Buat Baru Dropdown with 2 Groups */}
          <CreateTemplateDropdown onSelect={(type) => onNavigate(`/buat/${type}`)} />
        </div>
      </div>

      {importStatus && (
        <div className="p-3 bg-[#E6F7F5] border-2 border-[#00B4D8]/30 text-[#00B4D8] text-xs font-black rounded-2xl">
          {importStatus}
        </div>
      )}

      {/* Two-Tier Filter: Category Level (Semua | Materi | Game) + Template Sub-filter */}
      <div className="bg-white border-2 border-stone-100 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* Top Tier: Search Bar + Category Pills */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul draf..."
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
              <span>Semua ({drafts.length})</span>
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

      {/* Drafts List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#00B4D8] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-stone-500 text-xs font-bold">Memuat draf dari memori browser...</p>
        </div>
      ) : filteredDrafts.length === 0 ? (
        <div className="bg-white border-2 border-stone-200 rounded-[32px] p-12 text-center space-y-4 max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 bg-[#FFF8DC] text-[#0A254D] rounded-3xl flex items-center justify-center mx-auto border-2 border-[#FED034]">
            <FolderArchive className="w-8 h-8 text-[#0A254D]" />
          </div>
          <h3 className="font-black text-[#0A254D] text-lg">Belum Ada Draf yang Cocok</h3>
          <p className="text-stone-500 text-xs max-w-md mx-auto leading-relaxed">
            {searchQuery || selectedFilter !== 'all' || categoryFilter !== 'all'
              ? 'Tidak ditemukan draf dengan filter tersebut. Coba ubah kata kunci atau ganti filter kategori.'
              : 'Mulai rancang materi pelajaran atau game interaktif pertama Anda sekarang.'}
          </p>
          <div className="pt-2 flex justify-center">
            <CreateTemplateDropdown
              buttonLabel="Buat Draf Pertama"
              onSelect={(type) => onNavigate(`/buat/${type}`)}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                className={`bg-white rounded-3xl p-5 border-t-6 ${
                  isMateri ? 'border-t-[#00B4D8]' : 'border-t-[#FF3B8D]'
                } border-x border-b border-stone-200/80 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group`}
              >
                <div>
                  {/* Category and Template Badges */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Distinct Category Badge */}
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                          isMateri
                            ? 'bg-[#E6F7F5] text-[#00B4D8] border-[#00B4D8]/30'
                            : 'bg-[#FFF0F6] text-[#FF3B8D] border-[#FF3B8D]/30'
                        }`}
                      >
                        {isMateri ? 'Materi' : 'Game'}
                      </span>

                      {/* Template Name Badge */}
                      <span className="text-[11px] font-bold text-[#0A254D] bg-stone-100 border border-stone-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1.5">
                        <Icon className="w-3 h-3 text-stone-500" />
                        <span>{template.name}</span>
                      </span>
                    </div>

                    <span className="text-[11px] text-stone-500 font-black">
                      {d.itemCount} item
                    </span>
                  </div>

                  <h3 className="font-black text-[#0A254D] text-base group-hover:text-[#00B4D8] transition-colors line-clamp-1 mb-1">
                    {d.title}
                  </h3>

                  <p className="text-stone-500 text-xs line-clamp-2 min-h-[32px] leading-relaxed">
                    {d.description || 'Tidak ada deskripsi tambahan.'}
                  </p>

                  <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-stone-400" /> {updatedDate}
                    </span>
                  </div>
                </div>

                {/* Actions with tactile >=44px buttons */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onNavigate(`/main/${d.id}`)}
                      className="min-h-[44px] px-3.5 py-2 bg-[#0A254D] hover:bg-black text-white text-xs font-black rounded-full flex items-center gap-1.5 cursor-pointer shadow-xs active:translate-y-0.5 transition-all"
                      title="Buka Mode Proyektor"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Main</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate(`/buat/${d.templateType}?id=${d.id}`)}
                      className={`min-h-[44px] px-3.5 py-2 text-xs font-black rounded-full flex items-center gap-1.5 cursor-pointer transition-all border ${
                        isMateri
                          ? 'bg-[#E6F7F5] hover:bg-[#00B4D8] hover:text-white text-[#00B4D8] border-[#00B4D8]/30'
                          : 'bg-[#FFF0F6] hover:bg-[#FF3B8D] hover:text-white text-[#FF3B8D] border-[#FF3B8D]/30'
                      }`}
                      title="Buka Editor"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDuplicate(d.id)}
                      className="w-11 h-11 flex items-center justify-center text-stone-500 hover:text-[#0A254D] hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
                      title="Duplikat draf ini"
                      aria-label="Duplikat draf"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(d.id, d.title)}
                      className="w-11 h-11 flex items-center justify-center text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                      title="Hapus draf"
                      aria-label="Hapus draf"
                    >
                      <Trash2 className="w-4 h-4" />
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
