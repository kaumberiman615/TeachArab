import React, { useState } from 'react';
import { FillBlankItem, MediaItem, ThemeConfig, DraftSettings } from '../../types';
import { createEmptyFillBlankItem } from './schema';
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
  Users,
  Settings2,
  Check,
  X,
  FileQuestion,
  HelpCircle,
} from 'lucide-react';

interface FillBlankEditorProps {
  items: FillBlankItem[];
  mediaFiles: Record<string, MediaItem>;
  theme: ThemeConfig;
  settings?: DraftSettings;
  onUpdateItems: (items: FillBlankItem[]) => void;
  onUpdateMediaFiles: (media: Record<string, MediaItem>) => void;
  onAddMedia: (file: File, type: 'image' | 'audio' | 'video') => Promise<string>;
  onRemoveMedia: (id: string) => void;
  onOpenQuickInput: () => void;
  onOpenAiAssistant?: () => void;
  aiEnabled?: boolean;
  onUpdateSettings?: (settings: DraftSettings) => void;
}

export default function FillBlankEditor({
  items,
  mediaFiles,
  theme,
  settings = {},
  onUpdateItems,
  onUpdateMediaFiles,
  onOpenQuickInput,
  onOpenAiAssistant,
  aiEnabled = true,
  onUpdateSettings,
}: FillBlankEditorProps) {
  const [newAltAnswer, setNewAltAnswer] = useState<Record<number, string>>({});

  const updateItem = (index: number, updates: Partial<FillBlankItem>) => {
    const next = [...items];
    next[index] = { ...next[index], ...updates };
    onUpdateItems(next);
  };

  const addItem = () => {
    onUpdateItems([...items, createEmptyFillBlankItem()]);
  };

  const duplicateItem = (index: number) => {
    const item = items[index];
    const copy: FillBlankItem = {
      ...item,
      id: 'fb_' + Math.random().toString(36).substring(2, 9),
      answers: [...item.answers],
    };
    const next = [...items];
    next.splice(index + 1, 0, copy);
    onUpdateItems(next);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) {
      alert('Minimal harus ada 1 soal dalam game.');
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

  const insertBlank = (index: number) => {
    const current = items[index].question || '';
    updateItem(index, { question: current ? current + ' ___ ' : '___ ' });
  };

  const handleAddAltAnswer = (index: number) => {
    const val = (newAltAnswer[index] || '').trim();
    if (!val) return;
    const currentAnswers = items[index].answers || [];
    if (!currentAnswers.includes(val)) {
      updateItem(index, { answers: [...currentAnswers, val] });
    }
    setNewAltAnswer({ ...newAltAnswer, [index]: '' });
  };

  const handleRemoveAnswer = (itemIndex: number, answerIndex: number) => {
    const currentAnswers = items[itemIndex].answers || [];
    if (currentAnswers.length <= 1) {
      alert('Minimal harus ada 1 kunci jawaban yang benar.');
      return;
    }
    const nextAnswers = currentAnswers.filter((_, i) => i !== answerIndex);
    updateItem(itemIndex, { answers: nextAnswers });
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
          <Settings2 className="w-3.5 h-3.5 text-indigo-700" />
          <span>Pengaturan Penilaian & Toleransi Teks Arab</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {/* Harakat Normalization */}
          <div>
            <label className="block text-stone-600 font-semibold mb-1">Abaikan Harakat</label>
            <button
              type="button"
              onClick={() =>
                onUpdateSettings?.({
                  ...settings,
                  fbIgnoreHarakat: settings.fbIgnoreHarakat === false ? true : false,
                })
              }
              className={`w-full p-2.5 rounded-xl border-2 text-xs font-black flex items-center justify-between cursor-pointer transition-all ${
                settings.fbIgnoreHarakat !== false
                  ? 'bg-[#E0F7FA] text-[#0A254D] border-[#0A254D]'
                  : 'bg-rose-50 text-rose-800 border-rose-300'
              }`}
            >
              <span>{settings.fbIgnoreHarakat !== false ? 'Harakat Diabaikan (Fleksibel)' : 'Wajib Harakat Tepat'}</span>
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Alif-Hamzah Normalization */}
          <div>
            <label className="block text-[#0A254D] font-bold mb-1">Samakan Alif & Hamzah (أ إ آ ٱ)</label>
            <button
              type="button"
              onClick={() =>
                onUpdateSettings?.({
                  ...settings,
                  fbNormalizeAlif: settings.fbNormalizeAlif === false ? true : false,
                })
              }
              className={`w-full p-2.5 rounded-xl border-2 text-xs font-black flex items-center justify-between cursor-pointer transition-all ${
                settings.fbNormalizeAlif !== false
                  ? 'bg-[#E0F7FA] text-[#0A254D] border-[#0A254D]'
                  : 'bg-stone-50 text-stone-600 border-stone-200'
              }`}
            >
              <span>{settings.fbNormalizeAlif !== false ? 'Samakan Bentuk Alif' : 'Bedakan Persis'}</span>
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Ta Marbutah & Ya */}
          <div>
            <label className="block text-[#0A254D] font-bold mb-1">Samakan ة/ه & ى/ي</label>
            <button
              type="button"
              onClick={() => {
                const active = settings.fbNormalizeTaMarbutah !== false;
                onUpdateSettings?.({
                  ...settings,
                  fbNormalizeTaMarbutah: !active,
                  fbNormalizeYa: !active,
                });
              }}
              className={`w-full p-2.5 rounded-xl border-2 text-xs font-black flex items-center justify-between cursor-pointer transition-all ${
                settings.fbNormalizeTaMarbutah !== false
                  ? 'bg-[#E0F7FA] text-[#0A254D] border-[#0A254D]'
                  : 'bg-stone-50 text-stone-600 border-stone-200'
              }`}
            >
              <span>{settings.fbNormalizeTaMarbutah !== false ? 'Toleransi ة/ه & ى/ي' : 'Wajib Huruf Persis'}</span>
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Shuffle questions */}
          <div>
            <label className="block text-stone-600 font-semibold mb-1">Acak Urutan Soal</label>
            <button
              type="button"
              onClick={() => onUpdateSettings?.({ ...settings, fbShuffle: !settings.fbShuffle })}
              className={`w-full p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                settings.fbShuffle
                  ? 'bg-indigo-50 text-indigo-800 border-indigo-300 font-bold'
                  : 'bg-stone-50 text-stone-600 border-stone-200'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>{settings.fbShuffle ? 'Soal Diacak' : 'Urut Sesuai Daftar'}</span>
            </button>
          </div>

          {/* Points per Question */}
          <div>
            <label className="block text-stone-600 font-semibold mb-1">Skor per Soal</label>
            <input
              type="number"
              min={1}
              max={100}
              value={settings.fbPointsPerQuestion || 10}
              onChange={(e) =>
                onUpdateSettings?.({
                  ...settings,
                  fbPointsPerQuestion: parseInt(e.target.value) || 10,
                })
              }
              className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
            />
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
              <span>{settings.teamMode ? 'Mode Tim Aktif (2-4)' : 'Pemain Tunggal'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-3xl border-2 border-[#0A254D] shadow-[0_4px_0_#0A254D]">
        <div className="text-xs sm:text-sm text-[#0A254D] font-bold">
          Total: <strong className="text-[#FF3B8D] font-black">{items.length}</strong> kalimat rumpang
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {aiEnabled && onOpenAiAssistant && (
            <button
              type="button"
              onClick={onOpenAiAssistant}
              className="min-h-[44px] px-3.5 py-2 bg-[#FF3B8D] hover:bg-[#E62879] text-white font-black rounded-2xl text-xs flex items-center gap-1.5 border-2 border-[#0A254D] shadow-[0_2px_0_#0A254D] transition-all cursor-pointer active:translate-y-0.5"
            >
              <Sparkles className="w-4 h-4 text-[#FED034]" />
              <span>Bantuan AI</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenQuickInput}
            className="min-h-[44px] px-3.5 py-2 bg-white hover:bg-stone-50 text-[#0A254D] font-black rounded-2xl text-xs flex items-center gap-1.5 border-2 border-[#0A254D] shadow-[0_2px_0_#0A254D] transition-all cursor-pointer active:translate-y-0.5 active:shadow-[0_1px_0_#0A254D]"
          >
            <Sparkles className="w-4 h-4 text-[#FED034]" />
            <span>Input Cepat (Batch)</span>
          </button>

          <button
            type="button"
            onClick={addItem}
            className="min-h-[44px] px-4 py-2 bg-[#0A254D] hover:bg-black text-white font-black rounded-2xl text-xs flex items-center gap-1.5 border-2 border-[#0A254D] shadow-[0_3px_0_#0A254D] transition-all cursor-pointer active:translate-y-0.5 active:shadow-[0_1px_0_#0A254D]"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Soal</span>
          </button>
        </div>
      </div>

      {/* Items list */}
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-stone-300 rounded-3xl p-8 sm:p-12 text-center shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 border-2 border-[#0A254D] flex items-center justify-center mx-auto text-3xl font-black shadow-[0_3px_0_#0A254D]">
              📝
            </div>
            <div>
              <h3 className="text-lg font-black text-[#0A254D]">Belum Ada Kalimat Rumpang</h3>
              <p className="text-stone-500 text-xs sm:text-sm max-w-md mx-auto mt-1">
                Belum ada kalimat isian rumpang. Tambah kalimat atau gunakan Bantuan AI untuk membuat otomatis.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={addItem}
                className="min-h-[44px] px-5 py-2 text-xs font-black bg-[#0A254D] hover:bg-black text-white border-2 border-[#0A254D] rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_3px_0_#000] active:translate-y-0.5"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Soal Baru</span>
              </button>
              <button
                type="button"
                onClick={onOpenQuickInput}
                className="min-h-[44px] px-4.5 py-2 text-xs font-black bg-white hover:bg-stone-50 text-[#0A254D] border-2 border-[#0A254D] rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_2px_0_#0A254D] active:translate-y-0.5"
              >
                <Sparkles className="w-4 h-4 text-[#FF3B8D]" />
                <span>Input Cepat</span>
              </button>
              {aiEnabled && onOpenAiAssistant && (
                <button
                  type="button"
                  onClick={onOpenAiAssistant}
                  className="min-h-[44px] px-4.5 py-2 text-xs font-black bg-[#FF3B8D] hover:bg-[#E62879] text-white border-2 border-[#0A254D] rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_3px_0_#0A254D] active:translate-y-0.5"
                >
                  <Sparkles className="w-4 h-4 text-[#FED034]" />
                  <span>Bantuan AI</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          items.map((item, idx) => (
          <div
            key={item.id}
            className="bg-white border-2 border-stone-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4 hover:border-[#0A254D] transition-all"
          >
            {/* Header row */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-[#FFE4EE] text-[#0A254D] border border-pink-200 font-black text-xs flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="text-xs font-bold text-[#0A254D]">Soal #{idx + 1}</span>
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
                  title="Duplikat soal ini"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="p-1 text-stone-400 hover:text-rose-600 rounded cursor-pointer"
                  title="Hapus soal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Question Text with ___ helper */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-[#0A254D] flex items-center gap-1.5">
                  <FileQuestion className="w-4 h-4 text-[#FF3B8D]" />
                  <span>Kalimat Soal (Gunakan <code>___</code> untuk bagian rumpang) <span className="text-rose-500">*</span></span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => insertBlank(idx)}
                    className="px-3 py-1.5 bg-[#FFE4EE] hover:bg-[#ffcfdf] text-[#0A254D] font-black rounded-xl text-xs border border-pink-200 cursor-pointer flex items-center gap-1"
                    title="Sisipkan tanda kosong ___ di akhir teks"
                  >
                    <span>+ Sisipkan ___</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateItem(idx, { question: removeHarakat(item.question) })}
                    className="text-xs text-stone-500 hover:text-[#0A254D] underline cursor-pointer font-medium"
                  >
                    Hapus Harakat
                  </button>
                </div>
              </div>

              <input
                type="text"
                dir="rtl"
                value={item.question}
                onChange={(e) => updateItem(idx, { question: e.target.value })}
                placeholder="يَذْهَبُ الطَّالِبُ إِلَى ___ صَبَاحًا"
                className={`w-full px-4 py-3 text-2xl sm:text-3xl leading-[2.2] font-bold bg-white border-2 border-stone-300 rounded-2xl focus:border-[#0A254D] focus:outline-hidden text-[#0A254D] ${fontClass}`}
              />
            </div>

            {/* Acceptable Correct Answers (Multiple tags supported) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-[#0A254D]">
                  Kunci Jawaban Benar Yang Diterima <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-stone-500 font-medium">
                  Guru bisa memasukkan beberapa alternatif (misal: dengan/tanpa harakat)
                </span>
              </div>

              {/* Answers Tags List */}
              <div className="flex flex-wrap items-center gap-2 p-2.5 bg-[#FAFCFC] border-2 border-stone-100 rounded-2xl min-h-[46px]">
                {item.answers.map((ans, aIdx) => (
                  <span
                    key={aIdx}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-base font-bold border-2 ${
                      aIdx === 0
                        ? 'bg-[#FFE4EE] text-[#0A254D] border-[#FF3B8D]'
                        : 'bg-white text-[#0A254D] border-stone-300'
                    }`}
                  >
                    <span dir="rtl" className={fontClass}>
                      {ans}
                    </span>
                    {aIdx === 0 && (
                      <span className="text-[10px] font-black uppercase px-1.5 py-0.5 bg-[#FF3B8D] rounded text-white">
                        Utama
                      </span>
                    )}
                    {item.answers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAnswer(idx, aIdx)}
                        className="text-stone-400 hover:text-rose-600 rounded p-0.5 cursor-pointer"
                        title="Hapus jawaban alternatif"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </span>
                ))}

                {/* Add alternate answer input */}
                <div className="flex items-center gap-1 ml-auto">
                  <input
                    type="text"
                    dir="rtl"
                    placeholder="Tambah alternatif..."
                    value={newAltAnswer[idx] || ''}
                    onChange={(e) => setNewAltAnswer({ ...newAltAnswer, [idx]: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAltAnswer(idx);
                      }
                    }}
                    className={`px-2.5 py-1 text-sm bg-white border border-stone-300 rounded-lg focus:border-indigo-600 focus:outline-hidden ${fontClass}`}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddAltAnswer(idx)}
                    className="px-2.5 py-1 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    + Tambah
                  </button>
                </div>
              </div>

              {/* Strict Harakat Toggle for this item */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700">
                  <input
                    type="checkbox"
                    checked={item.strictHarakat || false}
                    onChange={(e) => updateItem(idx, { strictHarakat: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-semibold">Harakat wajib tepat untuk soal ini (Strict Harakat)</span>
                </label>
              </div>
            </div>

            {/* Explanation */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Penjelasan / Terjemah (Opsional - ditampilkan setelah siswa menjawab)
              </label>
              <textarea
                rows={2}
                value={item.explanation || ''}
                onChange={(e) => updateItem(idx, { explanation: e.target.value })}
                placeholder="Contoh: Siswa pergi ke sekolah di pagi hari untuk belajar..."
                className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-hidden resize-none"
              />
            </div>

            {/* Media Manager Attachment */}
            <div className="pt-2 border-t border-stone-100">
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
        )))}
      </div>

      {/* Bottom Add Button */}
      <button
        type="button"
        onClick={addItem}
        className="w-full py-3 border-2 border-dashed border-stone-300 hover:border-indigo-600 hover:bg-indigo-50/50 rounded-2xl text-xs font-bold text-stone-600 hover:text-indigo-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
      >
        <Plus className="w-4 h-4" />
        <span>Tambah Soal Baru</span>
      </button>
    </div>
  );
}
