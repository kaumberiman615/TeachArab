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
      <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Columns className="w-4 h-4 text-emerald-700" />
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Pengaturan Kolom Tabel ({columns.length}/6 Kolom)
            </h3>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-stone-500 font-medium mr-1">Preset:</span>
            <button
              type="button"
              onClick={() => handleApplyPreset('mufradat')}
              className="px-2.5 py-1 text-[11px] font-semibold bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 rounded-lg border border-stone-200 transition-colors cursor-pointer"
            >
              Mufradat (3 Kolom)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('tashrif')}
              className="px-2.5 py-1 text-[11px] font-semibold bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 rounded-lg border border-stone-200 transition-colors cursor-pointer"
            >
              Tashrif Fi'il (5 Kolom)
            </button>
            <button
              type="button"
              onClick={handleAddColumn}
              disabled={columns.length >= 6}
              className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Tambah Kolom</span>
            </button>
          </div>
        </div>

        {/* Columns list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
          {columns.map((col, idx) => (
            <div
              key={col.id}
              className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl space-y-1.5"
            >
              <div className="flex items-center justify-between text-[11px] font-bold text-stone-500">
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
                className="w-full px-2 py-1 bg-white border border-stone-300 rounded-lg text-xs font-semibold focus:outline-emerald-600"
              />

              <label className="flex items-center gap-1.5 text-[11px] text-stone-600 cursor-pointer pt-0.5">
                <input
                  type="checkbox"
                  checked={col.isArabic ?? false}
                  onChange={() => handleToggleColumnArabic(col.id)}
                  className="rounded text-emerald-600 accent-emerald-600"
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
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-stone-100 rounded-xl border border-stone-200">
          <div className="text-xs font-semibold text-stone-700">
            Total Baris Data: <span className="text-emerald-700 font-bold">{items.length} Baris</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenQuickInput}
              className="px-3 py-1.5 text-xs font-semibold bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Input Cepat (Tempel Excel / | )</span>
            </button>

            <button
              type="button"
              onClick={handleAddRow}
              className="px-3 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Baris</span>
            </button>
          </div>
        </div>

        {items.length === 0 && (
          <div className="p-8 bg-white border border-stone-200 rounded-2xl text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-stone-400 mx-auto" />
            <p className="text-stone-600 text-xs font-medium">Belum ada baris data dalam tabel ini.</p>
            <button
              type="button"
              onClick={handleAddRow}
              className="px-4 py-2 bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              Tambah Baris Pertama
            </button>
          </div>
        )}

        {/* Rows List */}
        <div className="space-y-3">
          {items.map((row, index) => (
            <div
              key={row.id}
              className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs hover:border-emerald-300 transition-all space-y-3"
            >
              {/* Header row */}
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-xs font-bold text-stone-700">Baris #{index + 1}</span>
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
                    <label className="block text-[11px] font-semibold text-stone-600 truncate">
                      {col.name}
                    </label>
                    <input
                      type="text"
                      dir={col.isArabic ? 'rtl' : 'ltr'}
                      value={row.values[col.id] || ''}
                      onChange={(e) => handleChangeCell(index, col.id, e.target.value)}
                      placeholder={col.isArabic ? 'تَمْرِينٌ...' : 'Teks sel...'}
                      className={`w-full p-2 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-emerald-600 focus:bg-white ${
                        col.isArabic ? `font-bold text-emerald-950 text-right ${fontClass}` : ''
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
