import React, { useState } from 'react';
import { SlideItem, SlideLayout, MediaItem, ThemeConfig } from '../../types';
import { createEmptySlideItem } from './schema';
import MediaManager from '../../components/MediaManager';
import {
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Layout,
  FileText,
  Video,
  Sparkles,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface SlideEditorProps {
  items: SlideItem[];
  theme: ThemeConfig;
  mediaFiles: Record<string, MediaItem>;
  onUpdateItems: (newItems: SlideItem[]) => void;
  onUpdateMediaFiles: (newMedia: Record<string, MediaItem>) => void;
  onOpenQuickInput: () => void;
}

export default function SlideEditor({
  items = [],
  theme,
  mediaFiles = {},
  onUpdateItems,
  onUpdateMediaFiles,
  onOpenQuickInput,
}: SlideEditorProps) {
  const [expandedIndex, setExpandedIndex] = useState<number>(0);

  const fontClass =
    theme.fontFamily === 'Noto Naskh Arabic'
      ? 'font-noto'
      : theme.fontFamily === 'Scheherazade New'
      ? 'font-scheherazade'
      : 'font-amiri';

  const handleAddItem = () => {
    const newItem = createEmptySlideItem();
    const updated = [...items, newItem];
    onUpdateItems(updated);
    setExpandedIndex(updated.length - 1);
  };

  const handleDuplicateItem = (index: number) => {
    const source = items[index];
    const duplicated: SlideItem = {
      ...source,
      id: 'slide_' + Math.random().toString(36).substring(2, 9),
      title: `${source.title} (Salinan)`,
    };
    const updated = [...items];
    updated.splice(index + 1, 0, duplicated);
    onUpdateItems(updated);
    setExpandedIndex(index + 1);
  };

  const handleDeleteItem = (index: number) => {
    if (items.length <= 1) {
      alert('Slide materi minimal harus memiliki 1 slide.');
      return;
    }
    const updated = items.filter((_, i) => i !== index);
    onUpdateItems(updated);
    if (expandedIndex >= updated.length) {
      setExpandedIndex(Math.max(0, updated.length - 1));
    }
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
    setExpandedIndex(targetIdx);
  };

  const handleChangeField = (index: number, field: keyof SlideItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onUpdateItems(updated);
  };

  const layouts: Array<{ id: SlideLayout; label: string; desc: string }> = [
    { id: 'text-only', label: 'Teks Saja', desc: 'Fokus pada tulisan materi & penjelasan' },
    { id: 'image-left', label: 'Gambar Kiri', desc: 'Gambar di kiri, teks di kanan' },
    { id: 'image-right', label: 'Gambar Kanan', desc: 'Teks di kiri, gambar di kanan' },
    { id: 'image-full', label: 'Gambar Penuh', desc: 'Gambar besar dengan judul di atas' },
    { id: 'big-title', label: 'Judul Besar', desc: 'Slide pengantar bab / pembuka' },
  ];

  return (
    <div className="space-y-4">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-3xl border-2 border-[#0A254D] shadow-[0_4px_0_#0A254D]">
        <div className="text-xs sm:text-sm font-black text-[#0A254D]">
          Jumlah Slide: <span className="text-[#00B4D8] font-black">{items.length} Slide</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenQuickInput}
            className="min-h-[44px] px-3.5 py-2 text-xs font-black bg-white hover:bg-stone-50 text-[#0A254D] border-2 border-[#0A254D] rounded-2xl shadow-[0_2px_0_#0A254D] flex items-center gap-1.5 transition-all cursor-pointer active:translate-y-0.5 active:shadow-[0_1px_0_#0A254D]"
          >
            <Sparkles className="w-4 h-4 text-[#FED034]" />
            <span>Input Cepat (judul | isi)</span>
          </button>

          <button
            type="button"
            onClick={handleAddItem}
            className="min-h-[44px] px-4 py-2 text-xs font-black bg-[#00B4D8] hover:bg-[#0096b4] text-white rounded-2xl border-2 border-[#0A254D] shadow-[0_3px_0_#0A254D] flex items-center gap-1.5 transition-all cursor-pointer active:translate-y-0.5 active:shadow-[0_1px_0_#0A254D]"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Slide</span>
          </button>
        </div>
      </div>

      {items.length === 0 && (
        <div className="p-8 bg-white border-2 border-stone-200 rounded-3xl text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-stone-400 mx-auto" />
          <p className="text-stone-700 text-xs sm:text-sm font-bold">Belum ada slide materi.</p>
          <button
            type="button"
            onClick={handleAddItem}
            className="min-h-[44px] px-5 py-2.5 bg-[#00B4D8] hover:bg-[#0096b4] text-white font-black rounded-2xl border-2 border-[#0A254D] shadow-[0_3px_0_#0A254D] text-xs cursor-pointer active:translate-y-0.5 active:shadow-[0_1px_0_#0A254D]"
          >
            Tambah Slide Pertama
          </button>
        </div>
      )}

      {/* Slide Items List */}
      <div className="space-y-4">
        {items.map((slide, index) => {
          const isExpanded = expandedIndex === index;

          return (
            <div
              key={slide.id}
              className={`bg-white border-2 rounded-3xl p-4 sm:p-5 transition-all shadow-xs ${
                isExpanded ? 'border-[#0A254D] ring-2 ring-cyan-100 shadow-md' : 'border-stone-200 hover:border-[#0A254D]'
              }`}
            >
              {/* Header row */}
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-stone-100">
                <div
                  className="flex items-center gap-2 flex-1 cursor-pointer select-none"
                  onClick={() => setExpandedIndex(isExpanded ? -1 : index)}
                >
                  <span className="w-7 h-7 rounded-xl bg-[#E0F7FA] text-[#0A254D] border border-cyan-200 text-xs font-black flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <div className="overflow-hidden">
                    <h4 className="text-xs sm:text-sm font-black text-[#0A254D] truncate">
                      {slide.title || 'Slide Tanpa Judul'}
                    </h4>
                    <span className="text-xs text-stone-500 capitalize font-medium">
                      Tata Letak: {layouts.find((l) => l.id === slide.layout)?.label || 'Teks Saja'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
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
                    title="Duplikat Slide"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(index)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                    title="Hapus Slide"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpandedIndex(isExpanded ? -1 : index)}
                    className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg cursor-pointer ml-1"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Form Body */}
              {isExpanded && (
                <div className="pt-4 space-y-4">
                  {/* Layout Selector */}
                  <div>
                    <label className="block text-xs font-black text-[#0A254D] mb-1.5 flex items-center gap-1.5">
                      <Layout className="w-4 h-4 text-[#00B4D8]" />
                      <span>Pilihan Tata Letak Slide:</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {layouts.map((l) => (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => handleChangeField(index, 'layout', l.id)}
                          className={`p-2.5 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                            slide.layout === l.id
                              ? 'border-[#0A254D] bg-[#E0F7FA] text-[#0A254D] font-black shadow-xs'
                              : 'border-stone-200 bg-stone-50 hover:bg-white text-stone-700'
                          }`}
                        >
                          <div className="text-xs font-bold">{l.label}</div>
                          <div className="text-[10px] text-stone-500 font-medium leading-tight mt-0.5">
                            {l.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Slide Title */}
                  <div>
                    <label className="block text-xs font-black text-[#0A254D] mb-1">
                      Judul Slide (Teks Arab atau Indonesia):
                    </label>
                    <input
                      type="text"
                      dir="auto"
                      value={slide.title}
                      onChange={(e) => handleChangeField(index, 'title', e.target.value)}
                      placeholder="Contoh: مَرْحَبًا بِكُمْ / Mengenal Kosakata"
                      className={`w-full p-3 bg-white border-2 border-stone-300 rounded-xl text-lg font-bold text-[#0A254D] focus:border-[#0A254D] focus:outline-hidden ${fontClass}`}
                    />
                  </div>

                  {/* Slide Content */}
                  <div>
                    <label className="block text-xs font-black text-[#0A254D] mb-1">
                      Isi Materi / Penjelasan (Mendukung Teks Arab & Indonesia Multiline):
                    </label>
                    <textarea
                      rows={5}
                      dir="auto"
                      value={slide.content}
                      onChange={(e) => handleChangeField(index, 'content', e.target.value)}
                      placeholder="Tuliskan materi pelajaran, poin-poin penjelasan, atau teks Arab..."
                      className={`w-full px-4 py-3 bg-white border-2 border-stone-300 rounded-2xl text-2xl sm:text-3xl font-bold text-[#0A254D] focus:border-[#0A254D] focus:outline-hidden leading-[2.2] resize-y ${fontClass}`}
                    />
                  </div>

                  {/* Media (Image & Audio Recording/Upload) */}
                  <div className="p-4 bg-[#FAFCFC] border-2 border-stone-100 rounded-2xl space-y-3">
                    <div className="text-xs font-black text-[#0A254D]">
                      Media Pendukung (Gambar & Audio Pelafalan):
                    </div>
                    <MediaManager
                      currentImageId={slide.mediaImageId}
                      currentAudioId={slide.mediaAudioId}
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

                  {/* Optional Video / YouTube */}
                  <div className="p-4 bg-[#FAFCFC] border-2 border-stone-100 rounded-2xl space-y-2">
                    <label className="text-xs font-black text-[#0A254D] flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-[#00B4D8]" />
                      <span>Link Video YouTube (Opsional):</span>
                    </label>
                    <input
                      type="url"
                      value={slide.youtubeUrl || ''}
                      onChange={(e) => handleChangeField(index, 'youtubeUrl', e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                      className="w-full p-2.5 bg-white border-2 border-stone-300 rounded-xl text-xs sm:text-sm focus:border-[#0A254D] focus:outline-hidden text-[#0A254D] font-medium"
                    />
                    <p className="text-xs text-stone-500 font-medium">
                      Video YouTube akan tersemat rapi langsung di dalam slide kelas proyektor.
                    </p>
                  </div>

                  {/* Teacher Notes */}
                  <div>
                    <label className="block text-xs font-black text-[#0A254D] mb-1 flex items-center gap-1">
                      <FileText className="w-4 h-4 text-amber-500" />
                      <span>Catatan Guru (Hanya tampil saat tombol catatan ditekan / rahasia):</span>
                    </label>
                    <textarea
                      rows={2}
                      value={slide.teacherNotes || ''}
                      onChange={(e) => handleChangeField(index, 'teacherNotes', e.target.value)}
                      placeholder="Contoh: Ajak murid melafalkan bersama-sama 3 kali, lalu tunjuk siswa acak..."
                      className="w-full p-3 bg-amber-50/50 border-2 border-amber-200 rounded-xl text-xs sm:text-sm font-medium focus:border-[#0A254D] focus:outline-hidden resize-y text-stone-800"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
