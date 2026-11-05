import React from 'react';
import { GuessItem, MediaItem, ThemeConfig, DraftSettings } from '../../types';
import { createEmptyGuessItem } from './schema';
import MediaManager from '../../components/MediaManager';
import { removeHarakat } from '../../utils/arabic';
import {
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Shuffle,
  Clock,
  Eye,
  Users,
  Settings2,
  HelpCircle,
  FileQuestion,
  ListFilter,
} from 'lucide-react';

interface GuessEditorProps {
  items: GuessItem[];
  mediaFiles: Record<string, MediaItem>;
  theme: ThemeConfig;
  settings?: DraftSettings;
  onUpdateItems: (items: GuessItem[]) => void;
  onUpdateMediaFiles: (media: Record<string, MediaItem>) => void;
  onAddMedia: (file: File, type: 'image' | 'audio' | 'video') => Promise<string>;
  onRemoveMedia: (id: string) => void;
  onOpenQuickInput: () => void;
  onUpdateSettings?: (settings: DraftSettings) => void;
}

export default function GuessEditor({
  items,
  mediaFiles,
  theme,
  settings = {},
  onUpdateItems,
  onUpdateMediaFiles,
  onOpenQuickInput,
  onUpdateSettings,
}: GuessEditorProps) {
  const updateItem = (index: number, updates: Partial<GuessItem>) => {
    const next = [...items];
    next[index] = { ...next[index], ...updates };
    onUpdateItems(next);
  };

  const addItem = () => {
    onUpdateItems([...items, createEmptyGuessItem()]);
  };

  const duplicateItem = (index: number) => {
    const item = items[index];
    const copy: GuessItem = {
      ...item,
      id: 'guess_' + Math.random().toString(36).substring(2, 9),
      wrongChoices: item.wrongChoices ? [...item.wrongChoices] : ['', '', ''],
    };
    const next = [...items];
    next.splice(index + 1, 0, copy);
    onUpdateItems(next);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) {
      alert('Minimal harus ada 1 tebakan dalam game.');
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

  const updateWrongChoice = (itemIndex: number, choiceIndex: number, value: string) => {
    const current = items[itemIndex].wrongChoices || ['', '', ''];
    const next = [...current];
    next[choiceIndex] = value;
    updateItem(itemIndex, { wrongChoices: next });
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
          <Settings2 className="w-3.5 h-3.5 text-emerald-700" />
          <span>Pengaturan Game Tebak Gambar & Audio</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          {/* Answer Mode */}
          <div>
            <label className="block text-stone-600 font-semibold mb-1">Metode Menjawab</label>
            <select
              value={settings.guessAnswerMode || 'choice'}
              onChange={(e) =>
                onUpdateSettings?.({
                  ...settings,
                  guessAnswerMode: e.target.value as 'choice' | 'text',
                })
              }
              className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
            >
              <option value="choice">Pilihan Ganda (Tombol)</option>
              <option value="text">Ketik Mandiri (Input Teks)</option>
            </select>
          </div>

          {/* Blur Mode (Progressive Unblur) */}
          <div>
            <label className="block text-stone-600 font-semibold mb-1">Efek Gambar Buram</label>
            <button
              type="button"
              onClick={() =>
                onUpdateSettings?.({
                  ...settings,
                  guessBlurMode: !settings.guessBlurMode,
                })
              }
              className={`w-full p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                settings.guessBlurMode
                  ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold'
                  : 'bg-stone-50 text-stone-600 border-stone-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{settings.guessBlurMode ? 'Buram ke Jelas (Aktif)' : 'Tanpa Buram'}</span>
            </button>
          </div>

          {/* Timer */}
          <div>
            <label className="block text-stone-600 font-semibold mb-1">Timer per Tebakan</label>
            <select
              value={settings.guessTimerSeconds || 0}
              onChange={(e) =>
                onUpdateSettings?.({
                  ...settings,
                  guessTimerSeconds: parseInt(e.target.value) || 0,
                })
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
              onClick={() =>
                onUpdateSettings?.({ ...settings, guessShuffle: !settings.guessShuffle })
              }
              className={`w-full p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                settings.guessShuffle
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                  : 'bg-stone-50 text-stone-600 border-stone-200'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>{settings.guessShuffle ? 'Soal Diacak' : 'Urut Daftar'}</span>
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
              <span>{settings.teamMode ? 'Mode Tim Aktif' : 'Pemain Tunggal'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-stone-500 font-medium">
          Total: <strong className="text-stone-900">{items.length}</strong> tebakan
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
            <span>Tambah Tebakan</span>
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
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="text-xs font-bold text-stone-700">Tebakan #{idx + 1}</span>
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
                  title="Duplikat item ini"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="p-1 text-stone-400 hover:text-rose-600 rounded cursor-pointer"
                  title="Hapus tebakan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Correct Answer & Hint */}
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-stone-800">
                      Jawaban Benar (Arab) <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => updateItem(idx, { answer: removeHarakat(item.answer) })}
                      className="text-[10px] text-stone-400 hover:text-stone-700 underline cursor-pointer"
                    >
                      Hapus Harakat
                    </button>
                  </div>
                  <input
                    type="text"
                    dir="rtl"
                    value={item.answer}
                    onChange={(e) => updateItem(idx, { answer: e.target.value })}
                    placeholder="جَمَلٌ..."
                    className={`w-full p-2.5 text-xl font-bold bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden ${fontClass}`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Petunjuk / Arti (Indonesia)
                  </label>
                  <input
                    type="text"
                    value={item.hint || ''}
                    onChange={(e) => updateItem(idx, { hint: e.target.value })}
                    placeholder="Hewan gurun pasir berpunuk (Unta)..."
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Right Column: Wrong Choices */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-800">
                    Pilihan Salah (Pengecoh)
                  </label>
                  <span className="text-[10px] text-stone-400">
                    Bila dikosongkan, otomatis diambil dari soal lain
                  </span>
                </div>

                <div className="space-y-1.5">
                  {[0, 1, 2].map((cIdx) => (
                    <input
                      key={cIdx}
                      type="text"
                      dir="rtl"
                      value={item.wrongChoices?.[cIdx] || ''}
                      onChange={(e) => updateWrongChoice(idx, cIdx, e.target.value)}
                      placeholder={`Pilihan salah ${cIdx + 1} (Arab)...`}
                      className={`w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm font-semibold focus:bg-white focus:border-emerald-600 focus:outline-hidden ${fontClass}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Media Manager Attachment (Image or Audio Clue) */}
            <div className="pt-2 border-t border-stone-100">
              <div className="mb-2 text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <FileQuestion className="w-3.5 h-3.5 text-emerald-700" />
                <span>Media Petunjuk (Unggah Foto atau Audio Clue):</span>
              </div>
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
        className="w-full py-3 border-2 border-dashed border-stone-300 hover:border-emerald-700 hover:bg-emerald-50/50 rounded-2xl text-xs font-bold text-stone-600 hover:text-emerald-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
      >
        <Plus className="w-4 h-4" />
        <span>Tambah Tebakan Baru</span>
      </button>
    </div>
  );
}
