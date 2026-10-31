import { useState, useEffect, useRef } from 'react';
import { DraftSummary, TemplateType, isMatchingTemplate } from '../types';
import { getAllDrafts, deleteDraft, duplicateDraft, saveDraft } from '../services/storage';
import { importDraftFromJson } from '../utils/export';
import { getTemplate } from '../templates/registry';
import {
  FolderArchive,
  Plus,
  Play,
  Edit,
  Copy,
  Trash2,
  Upload,
  AlertTriangle,
  Search,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

interface DraftsPageProps {
  onNavigate: (path: string) => void;
}

export default function DraftsPage({ onNavigate }: DraftsPageProps) {
  const [drafts, setDrafts] = useState<DraftSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredDrafts = drafts.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === 'all' ||
      d.templateType === selectedFilter ||
      (isMatchingTemplate(selectedFilter) && isMatchingTemplate(d.templateType));
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Teacher Warning Banner (IndexedDB Reminder) */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Perhatian:</strong> Draf hanya tersimpan di memori browser ini (IndexedDB). Unduh file materi (HTML / ZIP) agar materi aman dan tidak hilang jika cache browser dibersihkan.
          </span>
        </div>
      </div>

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <FolderArchive className="w-6 h-6 text-emerald-700" />
            <span>Draf Saya</span>
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            Kelola seluruh materi dan game yang telah Anda rancang di perangkat ini
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
            <span>Impor Proyek (.json)</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/buat/flashcard')}
            className="px-4 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Baru</span>
          </button>
        </div>
      </div>

      {importStatus && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl">
          {importStatus}
        </div>
      )}

      {/* Search and Filter bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white border border-stone-200 rounded-xl shadow-2xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul materi..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-emerald-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto text-xs font-medium">
          <button
            type="button"
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-lg border cursor-pointer transition-colors whitespace-nowrap ${
              selectedFilter === 'all'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
            }`}
          >
            Semua ({drafts.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('flashcard')}
            className={`px-3 py-1.5 rounded-lg border cursor-pointer transition-colors whitespace-nowrap ${
              selectedFilter === 'flashcard'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
            }`}
          >
            Flashcard
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('kuis')}
            className={`px-3 py-1.5 rounded-lg border cursor-pointer transition-colors whitespace-nowrap ${
              selectedFilter === 'kuis'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
            }`}
          >
            Kuis
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter(selectedFilter === 'matching' || selectedFilter === 'mencocokkan' ? 'all' : 'matching')}
            className={`px-3 py-1.5 rounded-lg border cursor-pointer transition-colors whitespace-nowrap ${
              selectedFilter === 'matching' || selectedFilter === 'mencocokkan'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
            }`}
          >
            Mencocokkan
          </button>
        </div>
      </div>

      {/* Drafts List */}
      {loading ? (
        <div className="p-12 text-center text-stone-400 text-xs">
          Memuat daftar draf dari browser...
        </div>
      ) : filteredDrafts.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 bg-stone-100 text-stone-400 rounded-xl flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-stone-800 text-base">Belum Ada Draf Tersimpan</h3>
          <p className="text-stone-500 text-xs">
            {searchQuery
              ? 'Tidak ditemukan draf dengan kata kunci tersebut.'
              : 'Mulai rancang materi kosakata atau kuis interaktif pertama Anda sekarang.'}
          </p>
          <button
            type="button"
            onClick={() => onNavigate('/buat/flashcard')}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Buat Materi Pertama</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDrafts.map((d) => {
            const template = getTemplate(d.templateType);
            const Icon = template.icon;
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
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Icon className="w-3 h-3" />
                      {template.name}
                    </span>
                    <span className="text-[10px] text-stone-600 font-mono">
                      {d.itemCount} item
                    </span>
                  </div>

                  <h3 className="font-bold text-stone-900 text-sm line-clamp-1 mb-1">
                    {d.title}
                  </h3>

                  <p className="text-stone-500 text-xs line-clamp-2 min-h-[32px]">
                    {d.description || 'Tidak ada deskripsi tambahan.'}
                  </p>

                  <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-stone-600" /> {updatedDate}
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

                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => handleDuplicate(d.id)}
                      className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg cursor-pointer transition-colors"
                      title="Duplikat Draf"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(d.id, d.title)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                      title="Hapus Draf"
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
