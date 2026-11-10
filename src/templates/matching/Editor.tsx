import { MatchingPair, MediaItem, ThemeConfig } from '../../types';
import { createEmptyMatchingPair } from './schema';
import MediaManager from '../../components/MediaManager';
import { removeHarakat, speakArabic } from '../../utils/arabic';
import { Plus, Trash2, Copy, ArrowUp, ArrowDown, Volume2, Sparkles, AlertCircle } from 'lucide-react';

interface MatchingEditorProps {
  items: MatchingPair[];
  theme: ThemeConfig;
  mediaFiles: Record<string, MediaItem>;
  onUpdateItems: (newItems: MatchingPair[]) => void;
  onUpdateMediaFiles: (newMedia: Record<string, MediaItem>) => void;
  onOpenQuickInput: () => void;
}

export default function MatchingEditor({
  items,
  theme,
  mediaFiles,
  onUpdateItems,
  onUpdateMediaFiles,
  onOpenQuickInput,
}: MatchingEditorProps) {
  const fontClass =
    theme.fontFamily === 'Noto Naskh Arabic'
      ? 'font-noto'
      : theme.fontFamily === 'Scheherazade New'
      ? 'font-scheherazade'
      : 'font-amiri';

  const handleAddItem = () => {
    onUpdateItems([...items, createEmptyMatchingPair()]);
  };

  const handleDuplicateItem = (index: number) => {
    const item = items[index];
    const newItem: MatchingPair = {
      ...item,
      id: 'match_' + Math.random().toString(36).substring(2, 9),
    };
    const newItems = [...items];
    newItems.splice(index + 1, 0, newItem);
    onUpdateItems(newItems);
  };

  const handleDeleteItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onUpdateItems(newItems);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;
    onUpdateItems(newItems);
  };

  const handleChangeField = (index: number, field: keyof MatchingPair, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onUpdateItems(newItems);
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-3xl border-2 border-[#0A254D] shadow-[0_4px_0_#0A254D]">
        <div className="text-xs sm:text-sm font-black text-[#0A254D]">
          Total Pasangan Kata: <span className="text-[#FF3B8D] font-black">{items.length} Pasang</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenQuickInput}
            className="min-h-[44px] px-3.5 py-2 text-xs font-black bg-white hover:bg-stone-50 text-[#0A254D] border-2 border-[#0A254D] rounded-2xl shadow-[0_2px_0_#0A254D] flex items-center gap-1.5 transition-all cursor-pointer active:translate-y-0.5 active:shadow-[0_1px_0_#0A254D]"
          >
            <Sparkles className="w-4 h-4 text-[#FED034]" />
            <span>Input Cepat (Tempel Banyak)</span>
          </button>
          <button
            type="button"
            onClick={handleAddItem}
            className="min-h-[44px] px-4 py-2 text-xs font-black bg-[#FF3B8D] hover:bg-[#e02e7b] text-white rounded-2xl border-2 border-[#0A254D] shadow-[0_3px_0_#0A254D] flex items-center gap-1.5 transition-all cursor-pointer active:translate-y-0.5 active:shadow-[0_1px_0_#0A254D]"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pasangan</span>
          </button>
        </div>
      </div>

      {items.length === 0 && (
        <div className="p-8 bg-white border-2 border-stone-200 rounded-3xl text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-stone-400 mx-auto" />
          <p className="text-stone-700 text-xs sm:text-sm font-bold">Belum ada pasangan kata yang ditambahkan.</p>
          <button
            type="button"
            onClick={handleAddItem}
            className="min-h-[44px] px-5 py-2.5 bg-[#FF3B8D] hover:bg-[#e02e7b] text-white font-black rounded-2xl border-2 border-[#0A254D] shadow-[0_3px_0_#0A254D] text-xs cursor-pointer active:translate-y-0.5 active:shadow-[0_1px_0_#0A254D]"
          >
            Tambah Pasangan Pertama
          </button>
        </div>
      )}

      {/* Pairs list */}
      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="bg-white border-2 border-stone-200 rounded-3xl p-4 sm:p-5 shadow-xs relative transition-all hover:border-[#0A254D]"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100 text-xs text-stone-500">
              <span className="font-bold text-stone-700">Pasangan #{index + 1}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleMove(index, 'up')}
                  disabled={index === 0}
                  className="p-1 hover:text-stone-800 disabled:opacity-30 cursor-pointer"
                  title="Pindah ke Atas"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(index, 'down')}
                  disabled={index === items.length - 1}
                  className="p-1 hover:text-stone-800 disabled:opacity-30 cursor-pointer"
                  title="Pindah ke Bawah"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDuplicateItem(index)}
                  className="p-1.5 hover:text-[#0A254D] cursor-pointer"
                  title="Duplikat Pasangan"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteItem(index)}
                  className="p-1.5 hover:text-rose-600 cursor-pointer"
                  title="Hapus Pasangan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Split layout: Kiri (Kata Arab) & Kanan (Arti / Gambar) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sisi Kiri: Kata Arab */}
              <div className="p-4 bg-[#FAFCFC] border-2 border-stone-100 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#0A254D] flex items-center gap-1">
                    <span>Sisi Kiri: Kata Arab</span>
                  </span>
                  <div className="flex items-center gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => handleChangeField(index, 'arabic', removeHarakat(item.arabic))}
                      className="text-stone-500 hover:text-[#0A254D] cursor-pointer underline font-medium"
                      title="Hapus Harakat"
                    >
                      Hapus Baris
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => speakArabic(item.arabic)}
                      className="text-[#00B4D8] hover:text-[#0A254D] flex items-center gap-1 cursor-pointer font-black"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Bacakan
                    </button>
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    dir="rtl"
                    value={item.arabic}
                    onChange={(e) => handleChangeField(index, 'arabic', e.target.value)}
                    placeholder="مثال: بَابٌ"
                    className={`w-full px-4 py-3 text-2xl sm:text-3xl leading-[2.2] ${fontClass} border-2 border-stone-300 rounded-2xl focus:border-[#0A254D] focus:outline-hidden bg-white text-right`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0A254D] mb-1">
                    Transliterasi Latin (Opsional):
                  </label>
                  <input
                    type="text"
                    value={item.latin || ''}
                    onChange={(e) => handleChangeField(index, 'latin', e.target.value)}
                    placeholder="Contoh: baabun"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm border-2 border-stone-300 rounded-xl focus:border-[#0A254D] focus:outline-hidden bg-white font-medium"
                  />
                </div>
              </div>

              {/* Sisi Kanan: Arti Teks atau Gambar */}
              <div className="p-4 bg-[#FAFCFC] border-2 border-stone-100 rounded-2xl space-y-3">
                <span className="text-xs font-black text-[#0A254D] block">
                  Sisi Kanan: Arti Kata atau Gambar
                </span>

                <div>
                  <label className="block text-xs font-bold text-[#0A254D] mb-1">
                    Arti Kata (Teks):
                  </label>
                  <input
                    type="text"
                    value={item.meaning}
                    onChange={(e) => handleChangeField(index, 'meaning', e.target.value)}
                    placeholder="Contoh: Pintu"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-bold border-2 border-stone-300 rounded-xl focus:border-[#0A254D] focus:outline-hidden bg-white text-[#0A254D]"
                  />
                </div>

                {/* Media Manager for photo matching */}
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-0.5">
                    Unggah Gambar (Pengganti / Pendukung Arti):
                  </label>
                  <MediaManager
                    currentImageId={item.mediaImageId}
                    mediaFiles={mediaFiles}
                    onAttachImage={(mediaId, mediaItem) => {
                      onUpdateMediaFiles({ ...mediaFiles, [mediaId]: mediaItem });
                      handleChangeField(index, 'mediaImageId', mediaId);
                    }}
                    onRemoveImage={() => handleChangeField(index, 'mediaImageId', undefined)}
                    onAttachAudio={() => {}}
                    onRemoveAudio={() => {}}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Add Button */}
      <button
        type="button"
        onClick={handleAddItem}
        className="w-full py-3 bg-stone-100 hover:bg-stone-200 border-2 border-stone-300 border-dashed rounded-xl text-stone-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
      >
        <Plus className="w-4 h-4" /> Tambah Pasangan Kata Baru
      </button>
    </div>
  );
}
