import { FlashcardItem, MediaItem, ThemeConfig } from '../../types';
import { createEmptyFlashcard } from './schema';
import MediaManager from '../../components/MediaManager';
import { removeHarakat, speakArabic } from '../../utils/arabic';
import { Plus, Trash2, Copy, ArrowUp, ArrowDown, Volume2, Sparkles } from 'lucide-react';

interface FlashcardEditorProps {
  items: FlashcardItem[];
  theme: ThemeConfig;
  mediaFiles: Record<string, MediaItem>;
  onUpdateItems: (newItems: FlashcardItem[]) => void;
  onUpdateMediaFiles: (newMedia: Record<string, MediaItem>) => void;
  onOpenQuickInput: () => void;
  onSelectArabicInput?: (inputEl: HTMLInputElement) => void;
}

export default function FlashcardEditor({
  items,
  theme,
  mediaFiles,
  onUpdateItems,
  onUpdateMediaFiles,
  onOpenQuickInput,
}: FlashcardEditorProps) {
  const fontClass =
    theme.fontFamily === 'Noto Naskh Arabic'
      ? 'font-noto'
      : theme.fontFamily === 'Scheherazade New'
      ? 'font-scheherazade'
      : 'font-amiri';

  const handleAddItem = () => {
    onUpdateItems([...items, createEmptyFlashcard()]);
  };

  const handleDuplicateItem = (index: number) => {
    const item = items[index];
    const newItem: FlashcardItem = {
      ...item,
      id: 'fc_' + Math.random().toString(36).substring(2, 9),
    };
    const newItems = [...items];
    newItems.splice(index + 1, 0, newItem);
    onUpdateItems(newItems);
  };

  const handleDeleteItem = (index: number) => {
    if (items.length <= 1) {
      alert('Materi minimal memiliki 1 kartu kosakata.');
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

  const handleChangeField = (index: number, field: keyof FlashcardItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onUpdateItems(newItems);
  };

  const handleStripHarakat = (index: number) => {
    const current = items[index].arabic;
    handleChangeField(index, 'arabic', removeHarakat(current));
  };

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white rounded-2xl border-2 border-stone-200 shadow-2xs">
        <div className="text-xs font-black text-[#0A254D] flex items-center gap-2">
          <span>Total Kosakata:</span>
          <span className="px-3 py-1 rounded-full bg-[#FED034]/30 text-[#0A254D] border border-[#FED034] font-black">{items.length} Kartu</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenQuickInput}
            className="min-h-[44px] px-4 py-2 text-xs font-black bg-white hover:bg-stone-50 text-[#0A254D] border-2 border-[#0A254D] rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_2px_0_#0A254D] active:translate-y-0.5"
          >
            <Sparkles className="w-4 h-4 text-[#FF3B8D]" />
            <span>Input Cepat (Tempel Banyak)</span>
          </button>
          <button
            type="button"
            onClick={handleAddItem}
            className="min-h-[44px] px-5 py-2 text-xs font-black bg-[#FF3B8D] hover:bg-[#E62879] text-white border-2 border-[#0A254D] rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_3px_0_#0A254D] active:translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kartu</span>
          </button>
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="bg-white border-2 border-stone-200 rounded-3xl p-5 shadow-xs relative transition-all hover:border-[#00B4D8]"
          >
            {/* Item Card Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100 text-xs text-stone-500">
              <span className="font-black text-[#0A254D] text-sm">Kartu #{index + 1}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleMove(index, 'up')}
                  disabled={index === 0}
                  className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-[#0A254D] hover:bg-stone-100 rounded-full disabled:opacity-30 cursor-pointer"
                  title="Pindah ke Atas"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(index, 'down')}
                  disabled={index === items.length - 1}
                  className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-[#0A254D] hover:bg-stone-100 rounded-full disabled:opacity-30 cursor-pointer"
                  title="Pindah ke Bawah"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDuplicateItem(index)}
                  className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-[#00B4D8] hover:bg-cyan-50 rounded-full cursor-pointer"
                  title="Duplikat Kartu"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteItem(index)}
                  className="p-1 hover:text-rose-600 cursor-pointer"
                  title="Hapus Kartu"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Arabic Text (RTL) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-stone-700">
                    Teks Arab (Wajib)
                  </label>
                  <div className="flex items-center gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => handleStripHarakat(index)}
                      className="text-stone-500 hover:text-stone-800 cursor-pointer underline"
                      title="Hapus semua baris/harakat"
                    >
                      Hapus Harakat
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => speakArabic(item.arabic)}
                      className="text-[#00B4D8] hover:text-[#0096C7] flex items-center gap-1 cursor-pointer font-bold"
                      title="Dengarkan pelafalan Web Speech"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Bacakan
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  dir="rtl"
                  value={item.arabic}
                  onChange={(e) => handleChangeField(index, 'arabic', e.target.value)}
                  placeholder="مثال: كِتَابٌ"
                  className={`w-full px-4 py-3 text-2xl sm:text-3xl ${fontClass} border-2 border-stone-300 rounded-2xl focus:border-[#0A254D] focus:bg-white bg-stone-50 text-right leading-[2.2] transition-all`}
                />
              </div>

              {/* Latin Pronunciation */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Transliterasi Latin
                </label>
                <input
                  type="text"
                  value={item.latin}
                  onChange={(e) => handleChangeField(index, 'latin', e.target.value)}
                  placeholder="Contoh: kitaabun"
                  className="w-full px-3 py-2.5 text-sm border-2 border-stone-200 rounded-xl focus:border-[#00B4D8] focus:outline-hidden bg-stone-50 focus:bg-white transition-all"
                />
              </div>

              {/* Meaning in Indonesian */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Arti Bahasa Indonesia (Wajib)
                </label>
                <input
                  type="text"
                  value={item.meaning}
                  onChange={(e) => handleChangeField(index, 'meaning', e.target.value)}
                  placeholder="Contoh: Buku"
                  className="w-full px-3 py-2.5 text-sm border-2 border-stone-200 rounded-xl focus:border-[#00B4D8] focus:outline-hidden bg-stone-50 focus:bg-white font-medium transition-all"
                />
              </div>

              {/* Notes / Example sentence */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Catatan Tambahan / Contoh Kalimat
                </label>
                <input
                  type="text"
                  value={item.notes || ''}
                  onChange={(e) => handleChangeField(index, 'notes', e.target.value)}
                  placeholder="Contoh: Jamak: كُتُبٌ (Kutubun)"
                  className="w-full px-3 py-2.5 text-sm border-2 border-stone-200 rounded-xl focus:border-[#00B4D8] focus:outline-hidden bg-stone-50 focus:bg-white text-stone-600 transition-all"
                />
              </div>
            </div>

            {/* Media Manager for this item */}
            <MediaManager
              currentImageId={item.mediaImageId}
              currentAudioId={item.mediaAudioId}
              mediaFiles={mediaFiles}
              onAttachImage={(mediaId, mediaItem) => {
                onUpdateMediaFiles({ ...mediaFiles, [mediaId]: mediaItem });
                handleChangeField(index, 'mediaImageId', mediaId);
              }}
              onRemoveImage={() => handleChangeField(index, 'mediaImageId', undefined)}
              onAttachAudio={(mediaId, mediaItem) => {
                onUpdateMediaFiles({ ...mediaFiles, [mediaId]: mediaItem });
                handleChangeField(index, 'mediaAudioId', mediaId);
              }}
              onRemoveAudio={() => handleChangeField(index, 'mediaAudioId', undefined)}
            />
          </div>
        ))}
      </div>

      {/* Bottom Add Button */}
      <button
        type="button"
        onClick={handleAddItem}
        className="w-full min-h-[48px] py-3 bg-white hover:bg-stone-50 border-2 border-[#0A254D] border-dashed rounded-2xl text-[#0A254D] text-xs font-black flex items-center justify-center gap-2 shadow-[0_2px_0_#0A254D] active:translate-y-0.5 transition-all cursor-pointer"
      >
        <Plus className="w-4 h-4 text-[#FF3B8D]" />
        <span>Tambah Kartu Kosakata Baru</span>
      </button>
    </div>
  );
}
