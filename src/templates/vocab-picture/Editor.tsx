import React from 'react';
import { VocabPictureItem, MediaItem, ThemeConfig } from '../../types';
import { createEmptyVocabItem } from './schema';
import MediaManager from '../../components/MediaManager';
import {
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Volume2,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { speakArabic } from '../../utils/arabic';

interface VocabPictureEditorProps {
  items: VocabPictureItem[];
  theme: ThemeConfig;
  mediaFiles: Record<string, MediaItem>;
  onUpdateItems: (newItems: VocabPictureItem[]) => void;
  onUpdateMediaFiles: (newMedia: Record<string, MediaItem>) => void;
  onOpenQuickInput: () => void;
}

export default function VocabPictureEditor({
  items = [],
  theme,
  mediaFiles = {},
  onUpdateItems,
  onUpdateMediaFiles,
  onOpenQuickInput,
}: VocabPictureEditorProps) {
  const fontClass =
    theme.fontFamily === 'Noto Naskh Arabic'
      ? 'font-noto'
      : theme.fontFamily === 'Scheherazade New'
      ? 'font-scheherazade'
      : 'font-amiri';

  const handleAddItem = () => {
    onUpdateItems([...items, createEmptyVocabItem()]);
  };

  const handleDuplicateItem = (index: number) => {
    const item = items[index];
    const duplicated: VocabPictureItem = {
      ...item,
      id: 'vocab_' + Math.random().toString(36).substring(2, 9),
    };
    const updated = [...items];
    updated.splice(index + 1, 0, duplicated);
    onUpdateItems(updated);
  };

  const handleDeleteItem = (index: number) => {
    if (items.length <= 1) {
      alert('Kosakata bergambar minimal harus memiliki 1 item.');
      return;
    }
    const updated = items.filter((_, i) => i !== index);
    onUpdateItems(updated);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    onUpdateItems(updated);
  };

  const handleChangeField = (index: number, field: keyof VocabPictureItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onUpdateItems(updated);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-stone-100 rounded-xl border border-stone-200">
        <div className="text-xs font-semibold text-stone-700">
          Total Kosakata: <span className="text-emerald-700 font-bold">{items.length} Item</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenQuickInput}
            className="px-3 py-1.5 text-xs font-semibold bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Input Cepat (kata Arab | latin | arti)</span>
          </button>

          <button
            type="button"
            onClick={handleAddItem}
            className="px-3 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Kosakata</span>
          </button>
        </div>
      </div>

      {items.length === 0 && (
        <div className="p-8 bg-white border border-stone-200 rounded-2xl text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-stone-400 mx-auto" />
          <p className="text-stone-600 text-xs font-medium">Belum ada kosakata bergambar.</p>
          <button
            type="button"
            onClick={handleAddItem}
            className="px-4 py-2 bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer"
          >
            Tambah Item Pertama
          </button>
        </div>
      )}

      {/* Item List */}
      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-emerald-300 transition-all space-y-4"
          >
            {/* Header row */}
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="text-xs font-bold text-stone-700">
                  {item.meaning ? `Kartu: ${item.meaning}` : `Kosakata #${index + 1}`}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => handleMove(index, 'up')}
                  className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 disabled:opacity-30 rounded-lg cursor-pointer"
                  title="Pindahkan Ke Atas"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={index === items.length - 1}
                  onClick={() => handleMove(index, 'down')}
                  className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 disabled:opacity-30 rounded-lg cursor-pointer"
                  title="Pindahkan Ke Bawah"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDuplicateItem(index)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg cursor-pointer"
                  title="Duplikat Item"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteItem(index)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                  title="Hapus Item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              {/* Media Section: Image & Audio */}
              <div className="md:col-span-5 bg-stone-50 p-3 rounded-2xl border border-stone-200 space-y-2">
                <div className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Gambar & Rekaman Audio:</span>
                </div>
                <MediaManager
                  currentImageId={item.mediaImageId}
                  currentAudioId={item.mediaAudioId}
                  mediaFiles={mediaFiles}
                  allowAudio={true}
                  onAttachImage={(mId, mItem) => {
                    onUpdateMediaFiles({ ...mediaFiles, [mId]: mItem });
                    handleChangeField(index, 'mediaImageId', mId);
                  }}
                  onRemoveImage={() => handleChangeField(index, 'mediaImageId', undefined)}
                  onAttachAudio={(mId, mItem) => {
                    onUpdateMediaFiles({ ...mediaFiles, [mId]: mItem });
                    handleChangeField(index, 'mediaAudioId', mId);
                  }}
                  onRemoveAudio={() => handleChangeField(index, 'mediaAudioId', undefined)}
                />
              </div>

              {/* Text Fields */}
              <div className="md:col-span-7 space-y-3">
                {/* Kata Arab */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-stone-700">
                      Kata Arab (dengan Harakat):
                    </label>
                    {item.arabic && (
                      <button
                        type="button"
                        onClick={() => speakArabic(item.arabic)}
                        className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Coba Bunyi</span>
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    dir="rtl"
                    value={item.arabic}
                    onChange={(e) => handleChangeField(index, 'arabic', e.target.value)}
                    placeholder="Contoh: أَسَدٌ / سَيَّارَةٌ"
                    className={`w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-lg font-bold text-emerald-950 focus:outline-emerald-600 focus:bg-white text-right ${fontClass}`}
                  />
                </div>

                {/* Latin & Arti */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Transliterasi Latin:
                    </label>
                    <input
                      type="text"
                      value={item.latin || ''}
                      onChange={(e) => handleChangeField(index, 'latin', e.target.value)}
                      placeholder="Contoh: Asadun"
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-emerald-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Arti Kata (Indonesia):
                    </label>
                    <input
                      type="text"
                      value={item.meaning}
                      onChange={(e) => handleChangeField(index, 'meaning', e.target.value)}
                      placeholder="Contoh: Singa"
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm font-semibold text-stone-900 focus:outline-emerald-600 focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
