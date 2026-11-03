import React from 'react';
import { TrueFalseItem, MediaItem, ThemeConfig, DraftSettings } from '../../types';
import { createEmptyTrueFalseItem } from './schema';
import MediaManager from '../../components/MediaManager';
import { removeHarakat } from '../../utils/arabic';
import {
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Shuffle,
  Users,
} from 'lucide-react';

interface TrueFalseEditorProps {
  items: TrueFalseItem[];
  mediaFiles: Record<string, MediaItem>;
  theme: ThemeConfig;
  settings?: DraftSettings;
  onUpdateItems: (items: TrueFalseItem[]) => void;
  onUpdateMediaFiles: (media: Record<string, MediaItem>) => void;
  onAddMedia: (file: File, type: 'image' | 'audio' | 'video') => Promise<string>;
  onRemoveMedia: (id: string) => void;
  onOpenQuickInput: () => void;
  onUpdateSettings?: (settings: DraftSettings) => void;
}

export default function TrueFalseEditor({
  items,
  mediaFiles,
  theme,
  settings = {},
  onUpdateItems,
  onUpdateMediaFiles,
  onAddMedia,
  onRemoveMedia,
  onOpenQuickInput,
  onUpdateSettings,
}: TrueFalseEditorProps) {
  const updateItem = (index: number, updates: Partial<TrueFalseItem>) => {
    const next = [...items];
    next[index] = { ...next[index], ...updates };
    onUpdateItems(next);
  };

  const addItem = () => {
    onUpdateItems([...items, createEmptyTrueFalseItem()]);
  };

  const duplicateItem = (index: number) => {
    const item = items[index];
    const copy: TrueFalseItem = {
      ...item,
      id: 'tf_' + Math.random().toString(36).substring(2, 9),
    };
    const next = [...items];
    next.splice(index + 1, 0, copy);
    onUpdateItems(next);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) {
      alert('Minimal harus ada 1 pernyataan dalam game.');
      return;
    }
    const next = items.filter((_, i) => i !== index);
    onUpdateItems(next);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const next = [...items];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    onUpdateItems(next);
  };

  const handleStripHarakat = (index: number) => {
    const current = items[index].statementArabic;
    updateItem(index, { statementArabic: removeHarakat(current) });
  };

  const fontClass =
    theme.fontFamily === 'Amiri'
      ? 'font-amiri'
      : theme.fontFamily === 'Scheherazade New'
      ? 'font-scheherazade'
      : 'font-naskh';

  return (
    <div className="space-y-6">
      {/* Settings Bar */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-emerald-700" />
          <span>Pengaturan Game Benar atau Salah</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* Timer */}
          <div>
            <label className="block text-stone-600 font-semibold mb-1">Batas Waktu per Soal</label>
            <select
              value={settings.tfTimerSeconds || 0}
              onChange={(e) =>
                onUpdateSettings?.({ ...settings, tfTimerSeconds: parseInt(e.target.value) || 0 })
              }
              className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
            >
              <option value={0}>Tanpa Timer</option>
              <option value={10}>10 Detik</option>
              <option value={15}>15 Detik</option>
              <option value={20}>20 Detik</option>
              <option value={30}>30 Detik</option>
            </select>
          </div>

          {/* Shuffle */}
          <div>
            <label className="block text-stone-600 font-semibold mb-1">Acak Soal</label>
            <button
              type="button"
              onClick={() => onUpdateSettings?.({ ...settings, tfShuffle: !settings.tfShuffle })}
              className={`w-full p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                settings.tfShuffle
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                  : 'bg-stone-50 text-stone-600 border-stone-200'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>{settings.tfShuffle ? 'Soal Diacak' : 'Urut Sesuai Daftar'}</span>
            </button>
          </div>

          {/* Points */}
          <div>
            <label className="block text-stone-600 font-semibold mb-1">Skor per Soal</label>
            <input
              type="number"
              min={1}
              max={100}
              value={settings.tfPointsPerQuestion || 10}
              onChange={(e) =>
                onUpdateSettings?.({
                  ...settings,
                  tfPointsPerQuestion: parseInt(e.target.value) || 10,
                })
              }
              className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
            />
          </div>

          {/* Team Mode */}
          <div>
            <label className="block text-stone-600 font-semibold mb-1">Mode Kompetisi Tim</label>
            <button
              type="button"
              onClick={() =>
                onUpdateSettings?.({
                  ...settings,
                  teamMode: !settings.teamMode,
                  teamCount: settings.teamCount || 2,
                })
              }
              className={`w-full p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                settings.teamMode
                  ? 'bg-indigo-50 text-indigo-800 border-indigo-300 font-bold'
                  : 'bg-stone-50 text-stone-600 border-stone-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{settings.teamMode ? 'Mode Tim Aktif (2-4)' : 'Pemain Tunggal'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-stone-500 font-medium">
          Total: <strong className="text-stone-900">{items.length}</strong> pernyataan
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenQuickInput}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-emerald-200 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Input Cepat (Batch)</span>
          </button>

          <button
            type="button"
            onClick={addItem}
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Pernyataan</span>
          </button>
        </div>
      </div>

      {/* Items list */}
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 hover:border-stone-300 transition-all"
          >
            {/* Header row */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-700 font-bold text-xs flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="text-xs font-bold text-stone-700">Pernyataan #{idx + 1}</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveItem(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30 rounded cursor-pointer"
                  title="Pindah ke atas"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(idx, 'down')}
                  disabled={idx === items.length - 1}
                  className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30 rounded cursor-pointer"
                  title="Pindah ke bawah"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => duplicateItem(idx)}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded cursor-pointer"
                  title="Duplikat pernyataan ini"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="p-1 text-stone-400 hover:text-rose-600 rounded cursor-pointer"
                  title="Hapus pernyataan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Arabic statement & Harakat */}
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-stone-800">
                      Teks Pernyataan (Arab) <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleStripHarakat(idx)}
                      className="text-[10px] text-stone-400 hover:text-stone-700 underline cursor-pointer"
                    >
                      Hapus Harakat
                    </button>
                  </div>
                  <input
                    type="text"
                    dir="rtl"
                    value={item.statementArabic}
                    onChange={(e) => updateItem(idx, { statementArabic: e.target.value })}
                    placeholder="كَتَبَ التِّلْمِيذُ الدَّرْسَ..."
                    className={`w-full p-2.5 text-xl font-bold bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden ${fontClass}`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Terjemah / Keterangan (Indonesia)
                  </label>
                  <input
                    type="text"
                    value={item.statementIndo || ''}
                    onChange={(e) => updateItem(idx, { statementIndo: e.target.value })}
                    placeholder="Murid menulis pelajaran..."
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Right Column: Correct Answer Selector & Explanation */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Kunci Jawaban Yang Benar:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => updateItem(idx, { isTrue: true })}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        item.isTrue
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>BENAR (صَحِيح)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateItem(idx, { isTrue: false })}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        !item.isTrue
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      <span>SALAH (خَطَأ)</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Penjelasan Jawaban (Opsional - tampil saat siswa selesai menjawab)
                  </label>
                  <textarea
                    rows={2}
                    value={item.explanation || ''}
                    onChange={(e) => updateItem(idx, { explanation: e.target.value })}
                    placeholder="Contoh: Salah karena ikan hidup di air, bukan di darat..."
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-hidden resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Media Manager Attachment */}
            <div className="pt-2 border-t border-stone-100">
              <MediaManager
                currentImageId={item.mediaImageId}
                currentAudioId={item.mediaAudioId}
                mediaFiles={mediaFiles}
                onAttachImage={(mediaId, mediaItem) => {
                  onUpdateMediaFiles({ ...mediaFiles, [mediaId]: mediaItem });
                  updateItem(idx, { mediaImageId: mediaId });
                }}
                onRemoveImage={() => updateItem(idx, { mediaImageId: undefined })}
                onAttachAudio={(mediaId, mediaItem) => {
                  onUpdateMediaFiles({ ...mediaFiles, [mediaId]: mediaItem });
                  updateItem(idx, { mediaAudioId: mediaId });
                }}
                onRemoveAudio={() => updateItem(idx, { mediaAudioId: undefined })}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Add Button */}
      <button
        type="button"
        onClick={addItem}
        className="w-full py-3 border-2 border-dashed border-stone-300 hover:border-emerald-600 hover:bg-emerald-50/50 rounded-2xl text-xs font-bold text-stone-600 hover:text-emerald-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
      >
        <Plus className="w-4 h-4" />
        <span>Tambah Pernyataan Baru</span>
      </button>
    </div>
  );
}
