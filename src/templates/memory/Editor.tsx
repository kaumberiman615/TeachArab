import React from 'react';
import { MemoryCardPair, MediaItem, ThemeConfig, DraftSettings } from '../../types';
import { createEmptyMemoryPair } from './schema';
import MediaManager from '../../components/MediaManager';
import { removeHarakat } from '../../utils/arabic';
import {
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Users,
  Eye,
  Layers,
} from 'lucide-react';

interface MemoryEditorProps {
  items: MemoryCardPair[];
  mediaFiles: Record<string, MediaItem>;
  theme: ThemeConfig;
  settings?: DraftSettings;
  onUpdateItems: (items: MemoryCardPair[]) => void;
  onUpdateMediaFiles: (media: Record<string, MediaItem>) => void;
  onAddMedia: (file: File, type: 'image' | 'audio' | 'video') => Promise<string>;
  onRemoveMedia: (id: string) => void;
  onOpenQuickInput: () => void;
  onUpdateSettings?: (settings: DraftSettings) => void;
}

export default function MemoryEditor({
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
}: MemoryEditorProps) {
  const updateItem = (index: number, updates: Partial<MemoryCardPair>) => {
    const next = [...items];
    next[index] = { ...next[index], ...updates };
    onUpdateItems(next);
  };

  const addItem = () => {
    onUpdateItems([...items, createEmptyMemoryPair()]);
  };

  const duplicateItem = (index: number) => {
    const item = items[index];
    const copy: MemoryCardPair = {
      ...item,
      id: 'mem_' + Math.random().toString(36).substring(2, 9),
    };
    const next = [...items];
    next.splice(index + 1, 0, copy);
    onUpdateItems(next);
  };

  const removeItem = (index: number) => {
    if (items.length <= 2) {
      alert('Minimal harus ada 2 pasangan kartu dalam game Memory.');
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
    const current = items[index].arabic;
    updateItem(index, { arabic: removeHarakat(current) });
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
          <Layers className="w-3.5 h-3.5 text-indigo-700" />
          <span>Pengaturan Game Memory Card</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Default pairs count */}
          <div>
            <label className="block text-stone-600 font-semibold mb-1">
              Jumlah Pasangan per Game
            </label>
            <select
              value={settings.memoryPairsPerGame || 6}
              onChange={(e) =>
                onUpdateSettings?.({
                  ...settings,
                  memoryPairsPerGame: parseInt(e.target.value) || 6,
                })
              }
              className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
            >
              <option value={4}>4 Pasangan (8 Kartu - Mudah)</option>
              <option value={6}>6 Pasangan (12 Kartu - Sedang)</option>
              <option value={8}>8 Pasangan (16 Kartu - Tantangan)</option>
              <option value={10}>10 Pasangan (20 Kartu - Ahli)</option>
            </select>
          </div>

          {/* Preview cards toggle */}
          <div>
            <label className="block text-stone-600 font-semibold mb-1">
              Pratinjau Kartu di Awal
            </label>
            <button
              type="button"
              onClick={() =>
                onUpdateSettings?.({
                  ...settings,
                  memoryPreviewBriefly: !settings.memoryPreviewBriefly,
                })
              }
              className={`w-full p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                settings.memoryPreviewBriefly
                  ? 'bg-indigo-50 text-indigo-800 border-indigo-300 font-bold'
                  : 'bg-stone-50 text-stone-600 border-stone-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{settings.memoryPreviewBriefly ? 'Buka 3 Detik di Awal' : 'Langsung Tertutup'}</span>
            </button>
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
          Daftar Pasangan Kartu ({items.length} pasangan tersedia)
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenQuickInput}
            className="px-4 py-2 bg-white hover:bg-stone-50 text-[#0A254D] font-bold rounded-2xl border-2 border-[#0A254D] text-xs flex items-center gap-2 shadow-[0_2px_0_#0A254D] cursor-pointer transition-transform active:translate-y-0.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#00B4D8]" />
            <span>Input Cepat (Batch)</span>
          </button>

          <button
            type="button"
            onClick={addItem}
            className="px-4 py-2 bg-[#FF3B8D] hover:bg-[#e02e7b] text-white font-black rounded-2xl border-2 border-[#0A254D] text-xs flex items-center gap-1.5 shadow-[0_3px_0_#0A254D] cursor-pointer transition-transform active:translate-y-0.5"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Tambah Pasangan</span>
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
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="text-xs font-bold text-stone-700">Pasangan Kartu #{idx + 1}</span>
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
                  title="Duplikat pasangan ini"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="p-1 text-stone-400 hover:text-rose-600 rounded cursor-pointer"
                  title="Hapus pasangan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Inputs Grid: Sisi A (Arab) vs Sisi B (Arti / Gambar) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Sisi A: Kata Arab */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-amber-900 flex items-center gap-1">
                    <span>Sisi A: Kata Arab</span>
                    <span className="text-rose-500">*</span>
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
                  value={item.arabic}
                  onChange={(e) => updateItem(idx, { arabic: e.target.value })}
                  placeholder="كِتَابٌ..."
                  className={`w-full px-4 py-3 text-2xl sm:text-3xl font-extrabold bg-stone-50 border-2 border-stone-300 rounded-2xl focus:bg-white focus:border-[#0A254D] focus:outline-hidden leading-[2.2] transition-colors ${fontClass}`}
                />
              </div>

              {/* Sisi B: Arti / Gambar */}
              <div>
                <label className="block text-xs font-bold text-indigo-900 mb-1">
                  Sisi B: Arti Kata (Bahasa Indonesia) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={item.meaning}
                  onChange={(e) => updateItem(idx, { meaning: e.target.value })}
                  placeholder="Buku..."
                  className="w-full p-2.5 text-base font-bold bg-indigo-50/50 border border-indigo-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Media Manager for Sisi B (Visual) */}
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
        className="w-full py-3.5 border-2 border-dashed border-[#0A254D]/30 hover:border-[#FF3B8D] hover:bg-[#FFE4EE]/30 rounded-2xl text-xs font-black text-[#0A254D] hover:text-[#FF3B8D] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
      >
        <Plus className="w-4 h-4 stroke-[3]" />
        <span>Tambah Pasangan Kartu Baru</span>
      </button>
    </div>
  );
}
