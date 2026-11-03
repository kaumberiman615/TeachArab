import React from 'react';
import { WheelEntry, MediaItem, ThemeConfig, DraftSettings } from '../../types';
import { createEmptyWheelEntry, WHEEL_COLORS } from './schema';
import { removeHarakat } from '../../utils/arabic';
import {
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Users,
  Compass,
  Check,
} from 'lucide-react';

interface WheelEditorProps {
  items: WheelEntry[];
  mediaFiles: Record<string, MediaItem>;
  theme: ThemeConfig;
  settings?: DraftSettings;
  onUpdateItems: (items: WheelEntry[]) => void;
  onUpdateMediaFiles: (media: Record<string, MediaItem>) => void;
  onAddMedia: (file: File, type: 'image' | 'audio' | 'video') => Promise<string>;
  onRemoveMedia: (id: string) => void;
  onOpenQuickInput: () => void;
  onUpdateSettings?: (settings: DraftSettings) => void;
}

export default function WheelEditor({
  items,
  theme,
  settings = {},
  onUpdateItems,
  onOpenQuickInput,
  onUpdateSettings,
}: WheelEditorProps) {
  const updateItem = (index: number, updates: Partial<WheelEntry>) => {
    const next = [...items];
    next[index] = { ...next[index], ...updates };
    onUpdateItems(next);
  };

  const addItem = () => {
    onUpdateItems([...items, createEmptyWheelEntry(items.length)]);
  };

  const duplicateItem = (index: number) => {
    const item = items[index];
    const copy: WheelEntry = {
      ...item,
      id: 'wh_' + Math.random().toString(36).substring(2, 9),
    };
    const next = [...items];
    next.splice(index + 1, 0, copy);
    onUpdateItems(next);
  };

  const removeItem = (index: number) => {
    if (items.length <= 2) {
      alert('Minimal harus ada 2 entri pada roda putar.');
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
    const current = items[index].text;
    updateItem(index, { text: removeHarakat(current) });
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
          <Compass className="w-3.5 h-3.5 text-emerald-700" />
          <span>Pengaturan Roda Acak / Spinner</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Eliminate drawn entry */}
          <div>
            <label className="block text-stone-600 font-semibold mb-1">
              Hapus Entri Setelah Terpilih
            </label>
            <button
              type="button"
              onClick={() =>
                onUpdateSettings?.({
                  ...settings,
                  wheelEliminateOnPick: !settings.wheelEliminateOnPick,
                })
              }
              className={`w-full p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                settings.wheelEliminateOnPick
                  ? 'bg-rose-50 text-rose-800 border-rose-300 font-bold'
                  : 'bg-stone-50 text-stone-600 border-stone-200'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{settings.wheelEliminateOnPick ? 'Dihapus dari Roda' : 'Tetap Ada di Roda'}</span>
            </button>
          </div>

          {/* Wheel Mode */}
          <div>
            <label className="block text-stone-600 font-semibold mb-1">Mode Roda</label>
            <select
              value={settings.wheelMode || 'questions'}
              onChange={(e) =>
                onUpdateSettings?.({
                  ...settings,
                  wheelMode: e.target.value as 'students' | 'questions',
                })
              }
              className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
            >
              <option value="questions">Kuis / Soal & Tantangan</option>
              <option value="students">Nama Siswa / Giliran</option>
            </select>
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
              <span>{settings.teamMode ? 'Tim Bergiliran (2-4)' : 'Pemain Tunggal'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-stone-500 font-medium">
          Daftar Irisan Roda ({items.length} entri)
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
            <span>Tambah Entri</span>
          </button>
        </div>
      </div>

      {/* Items list */}
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-3 hover:border-stone-300 transition-all"
          >
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-2xs"
                  style={{ backgroundColor: item.color || '#059669' }}
                >
                  {idx + 1}
                </span>
                <span className="text-xs font-bold text-stone-800">Entri #{idx + 1}</span>
              </div>

              {/* Color choices & action icons */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1">
                  {WHEEL_COLORS.slice(0, 6).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => updateItem(idx, { color: c })}
                      className="w-4 h-4 rounded-full border border-white shadow-xs cursor-pointer flex items-center justify-center"
                      style={{ backgroundColor: c }}
                      title={`Pilih warna ${c}`}
                    >
                      {item.color === c && <Check className="w-2.5 h-2.5 text-white" />}
                    </button>
                  ))}
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
                    title="Duplikat entri ini"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="p-1 text-stone-400 hover:text-rose-600 rounded cursor-pointer"
                    title="Hapus entri"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Inputs: Text & Optional Explanation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-stone-800">
                    Teks Roda (Arab / Nama / Soal) <span className="text-rose-500">*</span>
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
                  dir="auto"
                  value={item.text}
                  onChange={(e) => updateItem(idx, { text: e.target.value })}
                  placeholder="Contoh: كَيْفَ حَالُكَ؟ atau Nama Siswa..."
                  className={`w-full p-2.5 text-base font-bold bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden ${fontClass}`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Kunci Jawaban / Penjelasan (Opsional)
                </label>
                <input
                  type="text"
                  value={item.answerOrExplanation || ''}
                  onChange={(e) => updateItem(idx, { answerOrExplanation: e.target.value })}
                  placeholder="Contoh: Jawab dengan: بِخَيْرٍ وَالْحَمْدُ لِلَّهِ..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
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
        <span>Tambah Entri Roda Baru</span>
      </button>
    </div>
  );
}
