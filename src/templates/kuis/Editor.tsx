import { QuizItem, QuizChoice, MediaItem, ThemeConfig } from '../../types';
import { createEmptyQuizItem, normalizeQuizChoices } from './schema';
import MediaManager from '../../components/MediaManager';
import { speakArabic, removeHarakat } from '../../utils/arabic';
import { compressImage, MAX_PHOTO_SIZE } from '../../utils/media';
import { formatBytes } from '../../services/storage';
import {
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Volume2,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon,
  X,
} from 'lucide-react';

interface QuizEditorProps {
  items: QuizItem[];
  theme: ThemeConfig;
  mediaFiles: Record<string, MediaItem>;
  onUpdateItems: (newItems: QuizItem[]) => void;
  onUpdateMediaFiles: (newMedia: Record<string, MediaItem>) => void;
  onOpenQuickInput: () => void;
}

export default function QuizEditor({
  items,
  theme,
  mediaFiles,
  onUpdateItems,
  onUpdateMediaFiles,
  onOpenQuickInput,
}: QuizEditorProps) {
  const fontClass =
    theme.fontFamily === 'Noto Naskh Arabic'
      ? 'font-noto'
      : theme.fontFamily === 'Scheherazade New'
      ? 'font-scheherazade'
      : 'font-amiri';

  // Ensure items have normalized choices
  const normalizedItems: QuizItem[] = (items || []).map((it) => ({
    ...it,
    choices: normalizeQuizChoices(it.choices),
  }));

  const handleAddItem = () => {
    onUpdateItems([...normalizedItems, createEmptyQuizItem()]);
  };

  const handleDuplicateItem = (index: number) => {
    const item = normalizedItems[index];
    const newItem: QuizItem = {
      ...item,
      id: 'quiz_' + Math.random().toString(36).substring(2, 9),
      choices: item.choices.map((c) => ({ ...c })),
    };
    const newItems = [...normalizedItems];
    newItems.splice(index + 1, 0, newItem);
    onUpdateItems(newItems);
  };

  const handleDeleteItem = (index: number) => {
    const newItems = normalizedItems.filter((_, i) => i !== index);
    onUpdateItems(newItems);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === normalizedItems.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const newItems = [...normalizedItems];
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;
    onUpdateItems(newItems);
  };

  const handleChangeField = (index: number, field: keyof QuizItem, value: any) => {
    const newItems = [...normalizedItems];
    newItems[index] = { ...newItems[index], [field]: value };
    onUpdateItems(newItems);
  };

  // Choice Text Change
  const handleChoiceTextChange = (itemIndex: number, choiceIndex: number, text: string) => {
    const newItems = [...normalizedItems];
    const choices = [...newItems[itemIndex].choices];
    choices[choiceIndex] = { ...choices[choiceIndex], text };
    newItems[itemIndex] = { ...newItems[itemIndex], choices };
    onUpdateItems(newItems);
  };

  // Choice Image Upload
  const handleChoiceImageUpload = async (
    itemIndex: number,
    choiceIndex: number,
    file: File
  ) => {
    if (file.size > MAX_PHOTO_SIZE) {
      alert(`Ukuran foto melebihi batas 5 MB (${formatBytes(file.size)})`);
      return;
    }
    try {
      const { blob, mimeType } = await compressImage(file);
      const mediaId = 'img_ch_' + Math.random().toString(36).substring(2, 9);
      const mediaItem: MediaItem = {
        id: mediaId,
        name: file.name,
        type: 'image',
        mimeType,
        blob,
        size: blob.size,
      };
      onUpdateMediaFiles({ ...mediaFiles, [mediaId]: mediaItem });

      const newItems = [...normalizedItems];
      const choices = [...newItems[itemIndex].choices];
      choices[choiceIndex] = { ...choices[choiceIndex], mediaImageId: mediaId };
      newItems[itemIndex] = { ...newItems[itemIndex], choices };
      onUpdateItems(newItems);
    } catch (err: any) {
      alert('Gagal memproses gambar pilihan: ' + err.message);
    }
  };

  const handleRemoveChoiceImage = (itemIndex: number, choiceIndex: number) => {
    const newItems = [...normalizedItems];
    const choices = [...newItems[itemIndex].choices];
    choices[choiceIndex] = { ...choices[choiceIndex], mediaImageId: undefined };
    newItems[itemIndex] = { ...newItems[itemIndex], choices };
    onUpdateItems(newItems);
  };

  // Add choice to an item (max 5)
  const handleAddChoice = (itemIndex: number) => {
    const item = normalizedItems[itemIndex];
    if (item.choices.length >= 5) {
      alert('Maksimal 5 pilihan jawaban per soal.');
      return;
    }
    const newItems = [...normalizedItems];
    const choices = [...item.choices, { text: '' }];
    newItems[itemIndex] = { ...item, choices };
    onUpdateItems(newItems);
  };

  // Remove choice from an item (min 2)
  const handleRemoveChoice = (itemIndex: number, choiceIndex: number) => {
    const item = normalizedItems[itemIndex];
    if (item.choices.length <= 2) {
      alert('Minimal 2 pilihan jawaban per soal.');
      return;
    }
    const newItems = [...normalizedItems];
    const choices = item.choices.filter((_, i) => i !== choiceIndex);
    // adjust correctIndex if needed
    let newCorrect = item.correctIndex;
    if (choiceIndex === item.correctIndex) {
      newCorrect = 0;
    } else if (choiceIndex < item.correctIndex) {
      newCorrect = item.correctIndex - 1;
    }
    newItems[itemIndex] = {
      ...item,
      choices,
      correctIndex: Math.max(0, Math.min(choices.length - 1, newCorrect)),
    };
    onUpdateItems(newItems);
  };

  const choiceLabels = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white rounded-2xl border-2 border-stone-200 shadow-2xs">
        <div className="text-xs font-black text-[#0A254D] flex items-center gap-2">
          <span>Total Soal Kuis:</span>
          <span className="px-3 py-1 rounded-full bg-[#FED034]/30 text-[#0A254D] border border-[#FED034] font-black">{normalizedItems.length} Soal</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenQuickInput}
            className="min-h-[44px] px-4 py-2 text-xs font-black bg-white hover:bg-stone-50 text-[#0A254D] border-2 border-[#0A254D] rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_2px_0_#0A254D] active:translate-y-0.5"
          >
            <Sparkles className="w-4 h-4 text-[#FF3B8D]" />
            <span>Input Cepat (Tempel Soal)</span>
          </button>
          <button
            type="button"
            onClick={handleAddItem}
            className="min-h-[44px] px-5 py-2 text-xs font-black bg-[#FF3B8D] hover:bg-[#E62879] text-white border-2 border-[#0A254D] rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_3px_0_#0A254D] active:translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Soal</span>
          </button>
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {normalizedItems.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-stone-300 rounded-3xl p-8 sm:p-12 text-center shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 border-2 border-[#0A254D] flex items-center justify-center mx-auto text-3xl font-black shadow-[0_3px_0_#0A254D]">
              ❓
            </div>
            <div>
              <h3 className="text-lg font-black text-[#0A254D]">Belum Ada Soal Kuis</h3>
              <p className="text-stone-500 text-xs sm:text-sm max-w-md mx-auto mt-1">
                Belum ada pertanyaan kuis. Tambah pertanyaan atau gunakan Input Cepat.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleAddItem}
                className="min-h-[44px] px-5 py-2 text-xs font-black bg-[#0A254D] hover:bg-black text-white border-2 border-[#0A254D] rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_3px_0_#000] active:translate-y-0.5"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Pertanyaan</span>
              </button>
              <button
                type="button"
                onClick={onOpenQuickInput}
                className="min-h-[44px] px-4.5 py-2 text-xs font-black bg-white hover:bg-stone-50 text-[#0A254D] border-2 border-[#0A254D] rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_2px_0_#0A254D] active:translate-y-0.5"
              >
                <Sparkles className="w-4 h-4 text-[#FF3B8D]" />
                <span>Input Cepat</span>
              </button>
            </div>
          </div>
        ) : (
          normalizedItems.map((item, index) => (
          <div
            key={item.id}
            className="bg-white border-2 border-stone-200 rounded-3xl p-5 shadow-xs relative transition-all hover:border-[#00B4D8]"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100 text-xs text-stone-500">
              <span className="font-bold text-stone-700">Soal #{index + 1}</span>
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
                  disabled={index === normalizedItems.length - 1}
                  className="p-1 hover:text-stone-800 disabled:opacity-30 cursor-pointer"
                  title="Pindah ke Bawah"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDuplicateItem(index)}
                  className="p-1 hover:text-[#0A254D] cursor-pointer"
                  title="Duplikat Soal"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteItem(index)}
                  className="p-1 hover:text-rose-600 cursor-pointer"
                  title="Hapus Soal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Question Text Fields */}
            <div className="space-y-3 mb-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-stone-700">
                    Pertanyaan dalam Bahasa Arab (RTL)
                  </label>
                  <div className="flex items-center gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() =>
                        handleChangeField(index, 'questionArabic', removeHarakat(item.questionArabic))
                      }
                      className="text-stone-500 hover:text-stone-800 cursor-pointer underline"
                      title="Hapus Harakat"
                    >
                      Hapus Harakat
                    </button>
                    <span>·</span>
                    {item.questionArabic && (
                      <button
                        type="button"
                        onClick={() => speakArabic(item.questionArabic)}
                        className="text-[#00B4D8] hover:text-[#0096C7] flex items-center gap-1 cursor-pointer font-bold"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> Bacakan
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="text"
                  dir="rtl"
                  value={item.questionArabic}
                  onChange={(e) => handleChangeField(index, 'questionArabic', e.target.value)}
                  placeholder="مثال: مَا اسْمُ هَذَا؟"
                  className={`w-full px-4 py-3 text-2xl sm:text-3xl ${fontClass} border-2 border-stone-300 rounded-2xl focus:border-[#0A254D] focus:bg-white bg-stone-50 text-right leading-[2.2] transition-all`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Petunjuk / Pertanyaan Terjemah Bahasa Indonesia (Opsional)
                </label>
                <input
                  type="text"
                  value={item.questionIndo || ''}
                  onChange={(e) => handleChangeField(index, 'questionIndo', e.target.value)}
                  placeholder="Contoh: Pilih arti kata yang tepat di bawah ini:"
                  className="w-full px-3 py-2.5 text-sm border-2 border-stone-200 rounded-xl focus:border-[#00B4D8] focus:outline-hidden bg-stone-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Multiple Choice Options (2 to 5 choices) with Correct Key Radio & Choice Images */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-stone-700">
                  Pilihan Jawaban (2 sampai 5 pilihan. Klik lingkaran untuk menandai jawaban benar):
                </label>
                <span className="text-xs font-black text-[#0A254D] bg-[#FED034]/40 px-3 py-0.5 rounded-full border border-[#FED034]">
                  Kunci: {choiceLabels[item.correctIndex] || 'A'}
                </span>
              </div>

              <div className="space-y-2">
                {item.choices.map((choice, choiceIdx) => {
                  const isCorrect = item.correctIndex === choiceIdx;
                  const choiceImg = choice.mediaImageId ? mediaFiles[choice.mediaImageId] : null;

                  return (
                    <div
                      key={choiceIdx}
                      className={`p-2.5 rounded-2xl border-2 transition-all ${
                        isCorrect
                          ? 'border-[#0A254D] bg-[#FED034]/20 shadow-xs'
                          : 'border-stone-200 bg-stone-50/70'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {/* Radio button to mark correct answer */}
                        <button
                          type="button"
                          onClick={() => handleChangeField(index, 'correctIndex', choiceIdx)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 cursor-pointer transition-all ${
                            isCorrect
                              ? 'bg-[#0A254D] text-white shadow-xs'
                              : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                          }`}
                          title="Klik untuk jadikan jawaban benar"
                        >
                          {choiceLabels[choiceIdx]}
                        </button>

                        {/* Choice text input */}
                        <input
                          type="text"
                          value={choice.text}
                          onChange={(e) =>
                            handleChoiceTextChange(index, choiceIdx, e.target.value)
                          }
                          placeholder={`Pilihan ${choiceLabels[choiceIdx]}`}
                          className="flex-1 px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:border-[#00B4D8] focus:outline-hidden"
                        />

                        {/* Image upload button for choice */}
                        <label
                          className={`p-2 border rounded-xl cursor-pointer transition-colors ${
                            choice.mediaImageId
                              ? 'bg-[#E6F7F5] text-[#00B4D8] border-[#00B4D8]'
                              : 'bg-white text-stone-500 hover:text-stone-800 border-stone-200'
                          }`}
                          title="Lampirkan Gambar untuk Pilihan Ini"
                        >
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleChoiceImageUpload(index, choiceIdx, file);
                            }}
                          />
                          <ImageIcon className="w-4 h-4" />
                        </label>

                        {/* Remove choice button (if more than 2) */}
                        {item.choices.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveChoice(index, choiceIdx)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 rounded-full cursor-pointer"
                            title="Hapus Pilihan Ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-[#00B4D8] shrink-0" />
                        )}
                      </div>

                      {/* Attached Image preview for choice */}
                      {choiceImg && (
                        <div className="mt-2 ml-10 flex items-center gap-2 p-1.5 bg-white border border-stone-200 rounded-xl inline-flex">
                          <img
                            src={URL.createObjectURL(choiceImg.blob)}
                            alt="Gambar Pilihan"
                            className="w-10 h-10 object-cover rounded-lg"
                          />
                          <span className="text-[10px] font-bold text-stone-600 max-w-[120px] truncate">
                            {choiceImg.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveChoiceImage(index, choiceIdx)}
                            className="p-1 text-stone-400 hover:text-rose-600 cursor-pointer"
                            title="Hapus Gambar Pilihan"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add choice button if under 5 */}
              {item.choices.length < 5 && (
                <button
                  type="button"
                  onClick={() => handleAddChoice(index)}
                  className="mt-2.5 text-xs font-black text-[#00B4D8] hover:text-[#0096C7] flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Pilihan {choiceLabels[item.choices.length]}</span>
                </button>
              )}
            </div>

            {/* Explanation */}
            <div className="mt-3">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Penjelasan / Alasan Jawaban Benar (Muncul setelah murid menjawab):
              </label>
              <input
                type="text"
                value={item.explanation || ''}
                onChange={(e) => handleChangeField(index, 'explanation', e.target.value)}
                placeholder="Contoh: Jawaban benar adalah A karena kitaabun bermakna buku."
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:border-[#00B4D8] focus:outline-hidden bg-stone-50 focus:bg-white"
              />
            </div>

            {/* Media Manager for question image or question audio */}
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
        )))}
      </div>

      {/* Bottom Add Button */}
      <button
        type="button"
        onClick={handleAddItem}
        className="w-full min-h-[48px] py-3 bg-white hover:bg-stone-50 border-2 border-[#0A254D] border-dashed rounded-2xl text-[#0A254D] text-xs font-black flex items-center justify-center gap-2 shadow-[0_2px_0_#0A254D] active:translate-y-0.5 transition-all cursor-pointer"
      >
        <Plus className="w-4 h-4 text-[#FF3B8D]" />
        <span>Tambah Soal Kuis Baru</span>
      </button>
    </div>
  );
}
