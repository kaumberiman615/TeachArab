import React from 'react';
import { ReadingSentence, MediaItem, ThemeConfig, DraftSettings } from '../../types';
import { createEmptySentence } from './schema';
import MediaManager from '../../components/MediaManager';
import {
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Volume2,
  BookOpen,
  AlertCircle,
  FileAudio,
} from 'lucide-react';
import { speakArabic } from '../../utils/arabic';

interface ReadingEditorProps {
  items: ReadingSentence[];
  theme: ThemeConfig;
  settings?: DraftSettings;
  mediaFiles: Record<string, MediaItem>;
  onUpdateItems: (newItems: ReadingSentence[]) => void;
  onUpdateMediaFiles: (newMedia: Record<string, MediaItem>) => void;
  onOpenQuickInput: () => void;
  onUpdateSettings?: (newSettings: DraftSettings) => void;
}

export default function ReadingEditor({
  items = [],
  theme,
  settings,
  mediaFiles = {},
  onUpdateItems,
  onUpdateMediaFiles,
  onOpenQuickInput,
  onUpdateSettings,
}: ReadingEditorProps) {
  const fontClass =
    theme.fontFamily === 'Noto Naskh Arabic'
      ? 'font-noto'
      : theme.fontFamily === 'Scheherazade New'
      ? 'font-scheherazade'
      : 'font-amiri';

  const handleAddItem = () => {
    onUpdateItems([...items, createEmptySentence()]);
  };

  const handleDuplicateItem = (index: number) => {
    const item = items[index];
    const duplicated: ReadingSentence = {
      ...item,
      id: 'sent_' + Math.random().toString(36).substring(2, 9),
    };
    const updated = [...items];
    updated.splice(index + 1, 0, duplicated);
    onUpdateItems(updated);
  };

  const handleDeleteItem = (index: number) => {
    if (items.length <= 1) {
      alert('Teks bacaan minimal harus memiliki 1 kalimat.');
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

  const handleChangeField = (index: number, field: keyof ReadingSentence, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onUpdateItems(updated);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-stone-100 rounded-xl border border-stone-200">
        <div className="text-xs font-semibold text-stone-700">
          Total Kalimat Qira'ah: <span className="text-emerald-700 font-bold">{items.length} Kalimat</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenQuickInput}
            className="px-3 py-1.5 text-xs font-semibold bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Input Cepat (kalimat Arab | terjemah)</span>
          </button>

          <button
            type="button"
            onClick={handleAddItem}
            className="px-3 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Kalimat</span>
          </button>
        </div>
      </div>

      {/* Optional Full Audio Section */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
            <FileAudio className="w-4 h-4 text-emerald-700" />
            <span>Audio Lengkap Satu Bacaan Penuh (Opsional):</span>
          </div>
          {settings?.fullAudioId && onUpdateSettings && (
            <button
              type="button"
              onClick={() => onUpdateSettings({ ...settings, fullAudioId: undefined })}
              className="text-[11px] text-rose-600 hover:underline cursor-pointer"
            >
              Hapus Audio Penuh
            </button>
          )}
        </div>
        <p className="text-[11px] text-stone-500">
          Jika guru memiliki rekaman audio pembacaan teks utuh dari awal sampai akhir, rekam atau unggah di sini.
        </p>
        <MediaManager
          currentAudioId={settings?.fullAudioId}
          mediaFiles={mediaFiles}
          allowAudio={true}
          onAttachAudio={(mId, mItem) => {
            onUpdateMediaFiles({ ...mediaFiles, [mId]: mItem });
            if (onUpdateSettings && settings) {
              onUpdateSettings({ ...settings, fullAudioId: mId });
            }
          }}
          onRemoveAudio={() => {
            if (onUpdateSettings && settings) {
              onUpdateSettings({ ...settings, fullAudioId: undefined });
            }
          }}
          onAttachImage={() => {}}
          onRemoveImage={() => {}}
        />
      </div>

      {items.length === 0 && (
        <div className="p-8 bg-white border border-stone-200 rounded-2xl text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-stone-400 mx-auto" />
          <p className="text-stone-600 text-xs font-medium">Belum ada kalimat dalam teks bacaan ini.</p>
          <button
            type="button"
            onClick={handleAddItem}
            className="px-4 py-2 bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer"
          >
            Tambah Kalimat Pertama
          </button>
        </div>
      )}

      {/* Sentences List */}
      <div className="space-y-3">
        {items.map((sentence, index) => (
          <div
            key={sentence.id}
            className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-emerald-300 transition-all space-y-3"
          >
            {/* Header row */}
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="text-xs font-bold text-stone-700">Kalimat #{index + 1}</span>
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
                  title="Duplikat Kalimat"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteItem(index)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                  title="Hapus Kalimat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Arabic Sentence Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-stone-700">
                  Kalimat Arab (Lengkap Harakat):
                </label>
                {sentence.arabic && (
                  <button
                    type="button"
                    onClick={() => speakArabic(sentence.arabic)}
                    className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Uji Pelafalan</span>
                  </button>
                )}
              </div>
              <textarea
                rows={2}
                dir="rtl"
                value={sentence.arabic}
                onChange={(e) => handleChangeField(index, 'arabic', e.target.value)}
                placeholder="Tulis kalimat dalam bahasa Arab dengan harakat yang jelas..."
                className={`w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-base font-bold text-emerald-950 focus:outline-emerald-600 focus:bg-white text-right leading-loose resize-y ${fontClass}`}
              />
            </div>

            {/* Translation Input */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Terjemah Bahasa Indonesia:
              </label>
              <textarea
                rows={2}
                value={sentence.translation}
                onChange={(e) => handleChangeField(index, 'translation', e.target.value)}
                placeholder="Terjemahan kalimat dalam bahasa Indonesia..."
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-emerald-600 focus:bg-white resize-y text-stone-800"
              />
            </div>

            {/* Audio per kalimat */}
            <div className="pt-2 border-t border-stone-100">
              <span className="text-[11px] font-semibold text-stone-600 mb-1.5 block">
                Audio Rekaman Kalimat Ini (Opsional):
              </span>
              <MediaManager
                currentAudioId={sentence.mediaAudioId}
                mediaFiles={mediaFiles}
                allowAudio={true}
                onAttachAudio={(mId, mItem) => {
                  onUpdateMediaFiles({ ...mediaFiles, [mId]: mItem });
                  handleChangeField(index, 'mediaAudioId', mId);
                }}
                onRemoveAudio={() => handleChangeField(index, 'mediaAudioId', undefined)}
                onAttachImage={() => {}}
                onRemoveImage={() => {}}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
