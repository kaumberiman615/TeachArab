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
    if (items.length <= 2) {
      alert('Game mencocokkan minimal memerlukan 2 pasangan kata agar dapat dimainkan.');
      return;
    }
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
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-stone-100 rounded-xl border border-stone-200">
        <div className="text-xs font-semibold text-stone-700">
          Total Pasangan Kata: <span className="text-emerald-700 font-bold">{items.length} Pasang</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenQuickInput}
            className="px-3 py-1.5 text-xs font-semibold bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Input Cepat (kata Arab | arti)</span>
          </button>
          <button
            type="button"
            onClick={handleAddItem}
            className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Pasangan</span>
          </button>
        </div>
      </div>

      {items.length === 0 && (
        <div className="p-8 bg-white border border-stone-200 rounded-xl text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-stone-400 mx-auto" />
          <p className="text-stone-600 text-xs font-medium">Belum ada pasangan kata yang ditambahkan.</p>
          <button
            type="button"
            onClick={handleAddItem}
            className="px-4 py-2 bg-emerald-700 text-white font-bold rounded-lg text-xs"
          >
            Tambah Pasangan Pertama
          </button>
        </div>
      )}

      {/* Pairs list */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs relative transition-all hover:border-emerald-300"
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
                  className="p-1 hover:text-emerald-700 cursor-pointer"
                  title="Duplikat Pasangan"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteItem(index)}
                  className="p-1 hover:text-rose-600 cursor-pointer"
                  title="Hapus Pasangan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Split layout: Kiri (Kata Arab) & Kanan (Arti / Gambar) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sisi Kiri: Kata Arab */}
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                    <span>Sisi Kiri: Kata Arab</span>
                  </span>
                  <div className="flex items-center gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => handleChangeField(index, 'arabic', removeHarakat(item.arabic))}
                      className="text-stone-500 hover:text-stone-800 cursor-pointer underline"
                      title="Hapus Harakat"
                    >
                      Hapus Baris
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => speakArabic(item.arabic)}
                      className="text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 cursor-pointer font-medium"
                    >
                      <Volume2 className="w-3 h-3" /> Bacakan
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
                    className={`w-full px-3 py-2 text-xl ${fontClass} border border-stone-300 rounded-lg focus:outline-emerald-600 bg-white text-right leading-loose`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-0.5">
                    Transliterasi Latin (Opsional):
                  </label>
                  <input
                    type="text"
                    value={item.latin || ''}
                    onChange={(e) => handleChangeField(index, 'latin', e.target.value)}
                    placeholder="Contoh: baabun"
                    className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg focus:outline-emerald-600 bg-white"
                  />
                </div>
              </div>

              {/* Sisi Kanan: Arti Teks atau Gambar */}
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-2.5">
                <span className="text-xs font-bold text-stone-800 block">
                  Sisi Kanan: Arti Kata atau Gambar
                </span>

                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-0.5">
                    Arti Kata (Teks):
                  </label>
                  <input
                    type="text"
                    value={item.meaning}
                    onChange={(e) => handleChangeField(index, 'meaning', e.target.value)}
                    placeholder="Contoh: Pintu"
                    className="w-full px-2.5 py-2 text-sm font-semibold border border-stone-300 rounded-lg focus:outline-emerald-600 bg-white"
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
