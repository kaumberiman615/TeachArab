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
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-3xl border-2 border-[#0A254D] shadow-[0_4px_0_#0A254D]">
        <div className="text-xs sm:text-sm font-black text-[#0A254D]">
          Total Kosakata: <span className="text-[#00B4D8] font-black">{items.length} Item</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenQuickInput}
            className="min-h-[44px] px-3.5 py-2 text-xs font-black bg-white hover:bg-stone-50 text-[#0A254D] border-2 border-[#0A254D] rounded-2xl shadow-[0_2px_0_#0A254D] flex items-center gap-1.5 transition-all cursor-pointer active:translate-y-0.5 active:shadow-[0_1px_0_#0A254D]"
          >
            <Sparkles className="w-4 h-4 text-[#FED034]" />
            <span>Input Cepat (kata Arab | latin | arti)</span>
          </button>

          <button
            type="button"
            onClick={handleAddItem}
            className="min-h-[44px] px-4 py-2 text-xs font-black bg-[#00B4D8] hover:bg-[#0096b4] text-white rounded-2xl border-2 border-[#0A254D] shadow-[0_3px_0_#0A254D] flex items-center gap-1.5 transition-all cursor-pointer active:translate-y-0.5 active:shadow-[0_1px_0_#0A254D]"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kosakata</span>
          </button>
        </div>
      </div>

      {items.length === 0 && (
        <div className="p-8 bg-white border-2 border-stone-200 rounded-3xl text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-stone-400 mx-auto" />
          <p className="text-stone-700 text-xs sm:text-sm font-bold">Belum ada kosakata bergambar.</p>
          <button
            type="button"
            onClick={handleAddItem}
            className="min-h-[44px] px-5 py-2.5 bg-[#00B4D8] hover:bg-[#0096b4] text-white font-black rounded-2xl border-2 border-[#0A254D] shadow-[0_3px_0_#0A254D] text-xs cursor-pointer active:translate-y-0.5 active:shadow-[0_1px_0_#0A254D]"
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
            className="bg-white border-2 border-stone-200 rounded-3xl p-4 sm:p-5 shadow-xs hover:border-[#0A254D] transition-all space-y-4"
          >
            {/* Header row */}
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-[#E0F7FA] text-[#0A254D] border border-cyan-200 text-xs font-black flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="text-xs font-bold text-[#0A254D]">
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
              <div className="md:col-span-5 bg-[#FAFCFC] p-4 rounded-2xl border-2 border-stone-100 space-y-2">
                <div className="text-xs font-black text-[#0A254D] flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#00B4D8]" />
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
                    <label className="text-xs font-black text-[#0A254D]">
                      Kata Arab (dengan Harakat):
                    </label>
                    {item.arabic && (
                      <button
                        type="button"
                        onClick={() => speakArabic(item.arabic)}
                        className="text-xs text-[#00B4D8] hover:text-[#0A254D] font-black flex items-center gap-1 cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
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
                    className={`w-full px-4 py-3 text-2xl sm:text-3xl leading-[2.2] bg-white border-2 border-stone-300 rounded-2xl font-bold text-[#0A254D] focus:border-[#0A254D] focus:outline-hidden text-right ${fontClass}`}
                  />
                </div>

                {/* Latin & Arti */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#0A254D] mb-1">
                      Transliterasi Latin:
                    </label>
                    <input
                      type="text"
                      value={item.latin || ''}
                      onChange={(e) => handleChangeField(index, 'latin', e.target.value)}
                      placeholder="Contoh: Asadun"
                      className="w-full p-2.5 bg-white border-2 border-stone-300 rounded-xl text-xs sm:text-sm font-medium focus:border-[#0A254D] focus:outline-hidden text-[#0A254D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0A254D] mb-1">
                      Arti Kata (Indonesia):
                    </label>
                    <input
                      type="text"
                      value={item.meaning}
                      onChange={(e) => handleChangeField(index, 'meaning', e.target.value)}
                      placeholder="Contoh: Singa"
                      className="w-full p-2.5 bg-white border-2 border-stone-300 rounded-xl text-xs sm:text-sm font-bold text-[#0A254D] focus:border-[#0A254D] focus:outline-hidden"
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
