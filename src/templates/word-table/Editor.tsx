import React from 'react';
import { WordTableRow, WordTableColumn, ThemeConfig, DraftSettings } from '../../types';
import {
  PRESET_MUFRADAT_COLUMNS,
  PRESET_TASHRIF_COLUMNS,
  createEmptyRow,
} from './schema';
import {
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Columns,
  Table,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface WordTableEditorProps {
  items: WordTableRow[];
  theme: ThemeConfig;
  settings?: DraftSettings;
  onUpdateItems: (newItems: WordTableRow[]) => void;
  onOpenQuickInput: () => void;
  onUpdateSettings?: (newSettings: DraftSettings) => void;
}

export default function WordTableEditor({
  items = [],
  theme,
  settings,
  onUpdateItems,
  onOpenQuickInput,
  onUpdateSettings,
}: WordTableEditorProps) {
  const columns: WordTableColumn[] =
    settings?.columns && settings.columns.length > 0
      ? settings.columns
      : PRESET_TASHRIF_COLUMNS;

  const fontClass =
    theme.fontFamily === 'Noto Naskh Arabic'
      ? 'font-noto'
      : theme.fontFamily === 'Scheherazade New'
      ? 'font-scheherazade'
      : 'font-amiri';

  const setColumns = (newCols: WordTableColumn[]) => {
    if (onUpdateSettings) {
      onUpdateSettings({ ...settings, columns: newCols });
    }
  };

  const handleAddColumn = () => {
    if (columns.length >= 6) {
      alert('Maksimal 6 kolom per tabel agar tetap rapi saat ditampilkan atau dicetak.');
      return;
    }
    const newColId = 'col_' + Math.random().toString(36).substring(2, 7);
    const newCols: WordTableColumn[] = [
      ...columns,
      { id: newColId, name: `Kolom ${columns.length + 1}`, isArabic: false },
    ];
    setColumns(newCols);
  };

  const handleRemoveColumn = (colId: string) => {
    if (columns.length <= 2) {
      alert('Tabel minimal memerlukan 2 kolom.');
      return;
    }
    const newCols = columns.filter((c) => c.id !== colId);
    setColumns(newCols);
  };

  const handleUpdateColumnName = (colId: string, name: string) => {
    const newCols = columns.map((c) => (c.id === colId ? { ...c, name } : c));
    setColumns(newCols);
  };

  const handleToggleColumnArabic = (colId: string) => {
    const newCols = columns.map((c) =>
      c.id === colId ? { ...c, isArabic: !c.isArabic } : c
    );
    setColumns(newCols);
  };

  const handleApplyPreset = (preset: 'mufradat' | 'tashrif') => {
    if (
      confirm(
        `Ganti struktur kolom dengan ${
          preset === 'mufradat' ? 'Preset Mufradat' : 'Preset Tashrif'
        }? Kolom yang ada akan disesuaikan.`
      )
    ) {
      if (preset === 'mufradat') {
        setColumns(PRESET_MUFRADAT_COLUMNS);
      } else {
        setColumns(PRESET_TASHRIF_COLUMNS);
      }
    }
  };

  const handleAddRow = () => {
    onUpdateItems([...items, createEmptyRow(columns)]);
  };

  const handleDuplicateRow = (index: number) => {
    const row = items[index];
    const duplicated: WordTableRow = {
      id: 'row_' + Math.random().toString(36).substring(2, 9),
      values: { ...row.values },
    };
    const updated = [...items];
    updated.splice(index + 1, 0, duplicated);
    onUpdateItems(updated);
  };

  const handleDeleteRow = (index: number) => {
    if (items.length <= 1) {
      alert('Tabel minimal harus memiliki 1 baris.');
      return;
    }
    const updated = items.filter((_, i) => i !== index);
    onUpdateItems(updated);
  };

  const handleMoveRow = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    onUpdateItems(updated);
  };

  const handleChangeCell = (rowIndex: number, colId: string, value: string) => {
    const updated = [...items];
    updated[rowIndex] = {
      ...updated[rowIndex],
      values: {
        ...updated[rowIndex].values,
        [colId]: value,
      },
    };
    onUpdateItems(updated);
  };

  return (
    <div className="space-y-5">
      {/* 1. Column Configuration Section */}
      <div className="bg-white border-2 border-stone-200 rounded-3xl p-5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Columns className="w-4 h-4 text-[#00B4D8]" />
            <h3 className="text-xs font-black text-[#0A254D] uppercase tracking-wider">
              Pengaturan Kolom Tabel ({columns.length}/6 Kolom)
            </h3>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-stone-500 font-bold mr-1">Preset:</span>
            <button
              type="button"
              onClick={() => handleApplyPreset('mufradat')}
              className="px-3 py-1.5 text-xs font-bold bg-stone-100 hover:bg-[#E0F7FA] hover:text-[#0A254D] rounded-xl border border-stone-200 transition-colors cursor-pointer text-[#0A254D]"
            >
              Mufradat (3 Kolom)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('tashrif')}
              className="px-3 py-1.5 text-xs font-bold bg-stone-100 hover:bg-[#E0F7FA] hover:text-[#0A254D] rounded-xl border border-stone-200 transition-colors cursor-pointer text-[#0A254D]"
            >
              Tashrif Fi'il (5 Kolom)
            </button>
            <button
              type="button"
              onClick={handleAddColumn}
              disabled={columns.length >= 6}
              className="px-3 py-1.5 text-xs font-black bg-[#00B4D8] hover:bg-[#0096b4] disabled:opacity-40 text-white rounded-xl border border-[#0A254D] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Kolom</span>
            </button>
          </div>
        </div>

        {/* Columns list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
          {columns.map((col, idx) => (
            <div
              key={col.id}
              className="p-3 bg-[#FAFCFC] border-2 border-stone-100 rounded-2xl space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs font-bold text-[#0A254D]">
                <span>Kolom {idx + 1}</span>
                {columns.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveColumn(col.id)}
                    className="text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Hapus Kolom"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <input
                type="text"
                value={col.name}
                onChange={(e) => handleUpdateColumnName(col.id, e.target.value)}
                placeholder="Nama kolom..."
                className="w-full px-3 py-1.5 bg-white border-2 border-stone-300 rounded-xl text-xs font-bold focus:border-[#0A254D] focus:outline-hidden text-[#0A254D]"
              />

              <label className="flex items-center gap-1.5 text-xs text-[#0A254D] font-bold cursor-pointer pt-0.5">
                <input
                  type="checkbox"
                  checked={col.isArabic ?? false}
                  onChange={() => handleToggleColumnArabic(col.id)}
                  className="rounded accent-[#00B4D8] w-4 h-4 cursor-pointer"
                />
                <span>Kolom Teks Arab (RTL)</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Rows / Data Section */}
      <div className="space-y-3">
        {/* Table Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-3xl border-2 border-[#0A254D] shadow-[0_4px_0_#0A254D]">
          <div className="text-xs sm:text-sm font-black text-[#0A254D]">
            Total Baris Data: <span className="text-[#00B4D8] font-black">{items.length} Baris</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpenQuickInput}
              className="min-h-[44px] px-3.5 py-2 text-xs font-black bg-white hover:bg-stone-50 text-[#0A254D] border-2 border-[#0A254D] rounded-2xl shadow-[0_2px_0_#0A254D] flex items-center gap-1.5 transition-all cursor-pointer active:translate-y-0.5 active:shadow-[0_1px_0_#0A254D]"
            >
              <Sparkles className="w-4 h-4 text-[#FED034]" />
              <span>Input Cepat (Tempel Excel / | )</span>
            </button>

            <button
              type="button"
              onClick={handleAddRow}
              className="min-h-[44px] px-4 py-2 text-xs font-black bg-[#00B4D8] hover:bg-[#0096b4] text-white rounded-2xl border-2 border-[#0A254D] shadow-[0_3px_0_#0A254D] flex items-center gap-1.5 transition-all cursor-pointer active:translate-y-0.5 active:shadow-[0_1px_0_#0A254D]"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Baris</span>
            </button>
          </div>
        </div>

        {items.length === 0 && (
          <div className="p-8 bg-white border-2 border-stone-200 rounded-3xl text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-stone-400 mx-auto" />
            <p className="text-stone-700 text-xs sm:text-sm font-bold">Belum ada baris data dalam tabel ini.</p>
            <button
              type="button"
              onClick={handleAddRow}
              className="min-h-[44px] px-5 py-2.5 bg-[#00B4D8] hover:bg-[#0096b4] text-white font-black rounded-2xl border-2 border-[#0A254D] shadow-[0_3px_0_#0A254D] text-xs cursor-pointer active:translate-y-0.5 active:shadow-[0_1px_0_#0A254D]"
            >
              Tambah Baris Pertama
            </button>
          </div>
        )}

        {/* Rows List */}
        <div className="space-y-4">
          {items.map((row, index) => (
            <div
              key={row.id}
              className="bg-white border-2 border-stone-200 rounded-3xl p-4 sm:p-5 shadow-xs hover:border-[#0A254D] transition-all space-y-3"
            >
              {/* Header row */}
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-[#E0F7FA] text-[#0A254D] border border-cyan-200 text-xs font-black flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-xs font-bold text-[#0A254D]">Baris #{index + 1}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveRow(index, 'up')}
                    className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 disabled:opacity-30 rounded-lg cursor-pointer"
                    title="Pindahkan Ke Atas"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === items.length - 1}
                    onClick={() => handleMoveRow(index, 'down')}
                    className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 disabled:opacity-30 rounded-lg cursor-pointer"
                    title="Pindahkan Ke Bawah"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDuplicateRow(index)}
                    className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg cursor-pointer"
                    title="Duplikat Baris"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteRow(index)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                    title="Hapus Baris"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Grid of Columns Inputs for this row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {columns.map((col) => (
                  <div key={col.id} className="space-y-1">
                    <label className="block text-xs font-bold text-[#0A254D] truncate">
                      {col.name}
                    </label>
                    <input
                      type="text"
                      dir={col.isArabic ? 'rtl' : 'ltr'}
                      value={row.values[col.id] || ''}
                      onChange={(e) => handleChangeCell(index, col.id, e.target.value)}
                      placeholder={col.isArabic ? 'تَمْرِينٌ...' : 'Teks sel...'}
                      className={`w-full bg-white border-2 border-stone-300 rounded-xl focus:border-[#0A254D] focus:outline-hidden ${
                        col.isArabic
                          ? `text-xl sm:text-2xl leading-[2.2] px-3.5 py-2.5 font-bold text-[#0A254D] text-right ${fontClass}`
                          : 'text-xs sm:text-sm font-semibold p-2.5 text-[#0A254D]'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
