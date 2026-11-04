import React from 'react';
import { SentenceOrderItem, MediaItem, ThemeConfig, DraftSettings } from '../../types';
import { createEmptySentenceOrderItem } from './schema';
import MediaManager from '../../components/MediaManager';
import { splitArabicSentenceWords } from '../../utils/arabic';
import {
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Users,
  Shuffle,
  HelpCircle,
  Volume2,
  Info,
} from 'lucide-react';

interface SentenceOrderEditorProps {
  items: SentenceOrderItem[];
  mediaFiles: Record<string, MediaItem>;
  theme: ThemeConfig;
  settings?: DraftSettings;
  onUpdateItems: (items: SentenceOrderItem[]) => void;
  onUpdateMediaFiles: (media: Record<string, MediaItem>) => void;
  onAddMedia: (file: File, type: 'image' | 'audio' | 'video') => Promise<string>;
  onRemoveMedia: (id: string) => void;
  onOpenQuickInput: () => void;
  onUpdateSettings?: (settings: DraftSettings) => void;
}

export default function SentenceOrderEditor({
  items,
  mediaFiles,
  theme,
  settings = {},
  onUpdateItems,
  onUpdateMediaFiles,
  onOpenQuickInput,
  onUpdateSettings,
}: SentenceOrderEditorProps) {
  const updateItem = (index: number, updates: Partial<SentenceOrderItem>) => {
    const next = [...items];
    next[index] = { ...next[index], ...updates };
    onUpdateItems(next);
  };

  const addItem = () => {
    onUpdateItems([...items, createEmptySentenceOrderItem()]);
  };

  const duplicateItem = (index: number) => {
    const item = items[index];
    const copy: SentenceOrderItem = {
      ...item,
      id: 'so_' + Math.random().toString(36).substring(2, 9),
    };
    const next = [...items];
    next.splice(index + 1, 0, copy);
    onUpdateItems(next);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
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

  const updateSetting = (key: keyof DraftSettings, value: any) => {
    if (onUpdateSettings) {
      onUpdateSettings({ ...settings, [key]: value });
    }
  };

  const fontClass =
    theme.fontFamily === 'Amiri'
      ? 'font-amiri'
      : theme.fontFamily === 'Scheherazade New'
      ? 'font-scheherazade'
      : 'font-naskh';

  return (
    <div className="space-y-6">
      {/* Settings Card */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-4">
        <h3 className="font-bold text-xs uppercase tracking-wider text-stone-500">
          Pengaturan Susun Kalimat
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Shuffle Option */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-stone-200 bg-stone-50">
            <div>
              <label htmlFor="so-shuffle" className="font-bold text-xs text-stone-800 block cursor-pointer">
                Acak Urutan Soal Saat Main
              </label>
              <span className="text-[11px] text-stone-500">
                Tampilkan kalimat-kalimat secara acak untuk setiap sesi belajar
              </span>
            </div>
            <input
              id="so-shuffle"
              type="checkbox"
              checked={settings.sentenceShuffle !== false}
              onChange={(e) => updateSetting('sentenceShuffle', e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer shrink-0 ml-2"
            />
          </div>

          {/* Multiple Orders Info */}
          <div className="p-3 rounded-xl border border-indigo-100 bg-indigo-50/60 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
            <div className="text-[11px] text-indigo-900 leading-relaxed">
              <strong>Variasi Urutan Benar:</strong> Anda dapat mengizinkan lebih dari 1 susunan benar dengan memisahkannya menggunakan tanda garis miring (<code>/</code>).
            </div>
          </div>
        </div>

        {/* Team Mode Configuration */}
        <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-700" />
            <span className="text-xs font-bold text-stone-800">Mode Tim (Cerdas Cermat Kelas)</span>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.teamMode || false}
                onChange={(e) => updateSetting('teamMode', e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
              <span>Aktifkan Tim</span>
            </label>

            {settings.teamMode && (
              <select
                value={settings.teamCount || 2}
                onChange={(e) => updateSetting('teamCount', parseInt(e.target.value))}
                className="text-xs font-semibold px-2 py-1 bg-stone-100 border border-stone-300 rounded-lg"
              >
                <option value={2}>2 Tim</option>
                <option value={3}>3 Tim</option>
                <option value={4}>4 Tim</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-stone-900">Daftar Kalimat Target ({items.length})</h2>
          <p className="text-stone-500 text-xs">
            Setiap spasi akan memisahkan kata menjadi kartu interaktif yang harus disusun siswa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenQuickInput}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-indigo-200 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Input Cepat</span>
          </button>

          <button
            type="button"
            onClick={addItem}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Kalimat</span>
          </button>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-4">
        {items.map((item, idx) => {
          const firstVariant = item.sentenceArabic ? item.sentenceArabic.split('/')[0] : '';
          const words = firstVariant ? splitArabicSentenceWords(firstVariant) : [];
          const variants = item.sentenceArabic ? item.sentenceArabic.split('/').map((s) => s.trim()).filter(Boolean) : [];

          return (
            <div
              key={item.id}
              className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-4 transition-all"
            >
              {/* Item Card Header */}
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <span className="text-xs font-bold text-stone-400">Kalimat #{idx + 1}</span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveItem(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30 cursor-pointer"
                    title="Pindah ke atas"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(idx, 'down')}
                    disabled={idx === items.length - 1}
                    className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30 cursor-pointer"
                    title="Pindah ke bawah"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicateItem(idx)}
                    className="p-1 text-stone-400 hover:text-indigo-600 cursor-pointer"
                    title="Duplikat kalimat"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    disabled={items.length <= 1}
                    className="p-1 text-stone-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer"
                    title="Hapus kalimat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="space-y-3">
                {/* Target Arabic Sentence */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-stone-700">
                      Kalimat Arab Target <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-stone-400">Pisahkan alternatif urutan benar dengan tanda /</span>
                  </div>
                  <input
                    type="text"
                    dir="rtl"
                    value={item.sentenceArabic}
                    onChange={(e) => updateItem(idx, { sentenceArabic: e.target.value })}
                    placeholder="ذَهَبَ أَحْمَدُ إِلَى الْمَدْرَسَةِ / إِلَى الْمَدْرَسَةِ ذَهَبَ أَحْمَدُ"
                    className={`w-full p-2.5 text-xl font-bold bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-hidden ${fontClass}`}
                  />

                  {/* Word breakdown preview */}
                  {words.length > 0 && (
                    <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-stone-400 font-semibold">Pecahan Kata ({words.length} kata):</span>
                      <div dir="rtl" className="flex items-center gap-1 flex-wrap">
                        {words.map((word, wIdx) => (
                          <span
                            key={wIdx}
                            className={`px-2.5 py-1 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-lg text-xs font-bold ${fontClass}`}
                          >
                            {word}
                          </span>
                        ))}
                      </div>
                      {variants.length > 1 && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                          {variants.length} variasi urutan sah
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Translation / Hint */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Terjemahan / Petunjuk Bahasa Indonesia <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={item.translation}
                    onChange={(e) => updateItem(idx, { translation: e.target.value })}
                    placeholder="Ahmad pergi ke sekolah"
                    className="w-full p-2.5 text-sm font-semibold bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Media Manager (Audio Pronunciation) */}
              <div className="pt-2 border-t border-stone-100">
                <MediaManager
                  currentAudioId={item.mediaAudioId}
                  mediaFiles={mediaFiles}
                  onAttachImage={() => {}}
                  onRemoveImage={() => {}}
                  onAttachAudio={(mediaId, mediaItem) => {
                    onUpdateMediaFiles({ ...mediaFiles, [mediaId]: mediaItem });
                    updateItem(idx, { mediaAudioId: mediaId });
                  }}
                  onRemoveAudio={() => updateItem(idx, { mediaAudioId: undefined })}
                  allowAudio={true}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Add Button */}
      <button
        type="button"
        onClick={addItem}
        className="w-full py-3 border-2 border-dashed border-stone-300 hover:border-indigo-600 hover:bg-indigo-50/50 rounded-2xl text-xs font-bold text-stone-600 hover:text-indigo-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
      >
        <Plus className="w-4 h-4" />
        <span>Tambah Kalimat Baru</span>
      </button>
    </div>
  );
}
