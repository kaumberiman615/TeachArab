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
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-stone-100 rounded-xl border border-stone-200">
        <div className="text-xs font-semibold text-stone-700">
          Total Kosakata: <span className="text-emerald-700 font-bold">{items.length} Kartu</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenQuickInput}
            className="px-3 py-1.5 text-xs font-semibold bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Input Cepat (Tempel Banyak)</span>
          </button>
          <button
            type="button"
            onClick={handleAddItem}
            className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Kartu</span>
          </button>
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs relative transition-all hover:border-emerald-300"
          >
            {/* Item Card Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100 text-xs text-stone-500">
              <span className="font-bold text-stone-700">Kartu #{index + 1}</span>
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
                      className="text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 cursor-pointer font-medium"
                      title="Dengarkan pelafalan Web Speech"
                    >
                      <Volume2 className="w-3 h-3" /> Bacakan
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  dir="rtl"
                  value={item.arabic}
                  onChange={(e) => handleChangeField(index, 'arabic', e.target.value)}
                  placeholder="مثال: كِتَابٌ"
                  className={`w-full px-3 py-2 text-xl ${fontClass} border border-stone-300 rounded-lg focus:outline-emerald-600 bg-stone-50 focus:bg-white text-right leading-loose`}
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
                  className="w-full px-3 py-2.5 text-sm border border-stone-300 rounded-lg focus:outline-emerald-600 bg-stone-50 focus:bg-white"
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
                  className="w-full px-3 py-2.5 text-sm border border-stone-300 rounded-lg focus:outline-emerald-600 bg-stone-50 focus:bg-white font-medium"
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
                  className="w-full px-3 py-2.5 text-sm border border-stone-300 rounded-lg focus:outline-emerald-600 bg-stone-50 focus:bg-white text-stone-600"
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
        className="w-full py-3 bg-stone-100 hover:bg-stone-200 border-2 border-stone-300 border-dashed rounded-xl text-stone-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
      >
        <Plus className="w-4 h-4" /> Tambah Kartu Kosakata Baru
      </button>
    </div>
  );
}
