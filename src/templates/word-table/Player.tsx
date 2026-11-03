import React, { useState } from 'react';
import { WordTableRow, WordTableColumn, ThemeConfig, DraftSettings } from '../../types';
import { removeHarakat, speakArabic } from '../../utils/arabic';
import { PRESET_TASHRIF_COLUMNS } from './schema';
import {
  Printer,
  Eye,
  EyeOff,
  Volume2,
  Table,
  CheckCircle2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface WordTablePlayerProps {
  items: WordTableRow[];
  theme: ThemeConfig;
  settings?: DraftSettings;
  mediaFiles?: Record<string, any>;
  isProjectorMode?: boolean;
}

export default function WordTablePlayer({
  items = [],
  theme,
  settings,
  isProjectorMode = false,
}: WordTablePlayerProps) {
  const columns: WordTableColumn[] =
    settings?.columns && settings.columns.length > 0
      ? settings.columns
      : PRESET_TASHRIF_COLUMNS;

  const [hiddenColumnIds, setHiddenColumnIds] = useState<Set<string>>(new Set());
  const [revealedCellKeys, setRevealedCellKeys] = useState<Set<string>>(new Set());
  const [showHarakat, setShowHarakat] = useState(theme.showHarakat !== false);

  const fontClass =
    theme.fontFamily === 'Noto Naskh Arabic'
      ? 'font-noto'
      : theme.fontFamily === 'Scheherazade New'
      ? 'font-scheherazade'
      : 'font-amiri';

  const filterText = (text?: string) => {
    if (!text) return '';
    return showHarakat ? text : removeHarakat(text);
  };

  const toggleHideColumn = (colId: string) => {
    setHiddenColumnIds((prev) => {
      const next = new Set(prev);
      if (next.has(colId)) {
        next.delete(colId);
      } else {
        next.add(colId);
      }
      return next;
    });
  };

  const toggleRevealCell = (cellKey: string) => {
    setRevealedCellKeys((prev) => {
      const next = new Set(prev);
      if (next.has(cellKey)) {
        next.delete(cellKey);
      } else {
        next.add(cellKey);
      }
      return next;
    });
  };

  const handleResetMemorization = () => {
    setRevealedCellKeys(new Set());
  };

  const handlePrint = () => {
    window.print();
  };

  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
        <Table className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-stone-800">Tabel Masih Kosong</h3>
        <p className="text-xs text-stone-500 mt-1">Tambahkan baris kata di panel editor.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Print Stylesheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-word-table, #printable-word-table * {
            visibility: visible;
          }
          #printable-word-table {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          table {
            border-collapse: collapse;
            width: 100%;
          }
          th, td {
            border: 1px solid #333 !important;
            padding: 8px 12px !important;
            color: black !important;
          }
        }
      `}</style>

      {/* Toolbar (Excluded from Print) */}
      <div className="no-print bg-white border border-stone-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left: Memorization Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5 mr-1">
            <EyeOff className="w-4 h-4 text-emerald-700" />
            <span>Sembunyikan Kolom Hafalan:</span>
          </span>

          {columns.map((col) => {
            const isHidden = hiddenColumnIds.has(col.id);
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => toggleHideColumn(col.id)}
                className={`px-2.5 py-1 text-xs rounded-lg border font-semibold transition-colors cursor-pointer ${
                  isHidden
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
                title="Klik untuk sembunyikan/tampilkan kolom ini saat latihan menghafal"
              >
                {isHidden ? '🙈 ' : ''}
                {col.name}
              </button>
            );
          })}

          {hiddenColumnIds.size > 0 && (
            <button
              type="button"
              onClick={handleResetMemorization}
              className="px-2.5 py-1 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 rounded-lg flex items-center gap-1 cursor-pointer"
              title="Tutup kembali semua sel yang sudah dibuka"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Jawaban</span>
            </button>
          )}
        </div>

        {/* Right: Print & Harakat */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHarakat(!showHarakat)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
              showHarakat
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-stone-100 text-stone-600 border-stone-200'
            }`}
          >
            {showHarakat ? 'Harakat: Aktif' : 'Harakat: Mati'}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
            title="Cetak lembar tabel bersih untuk dibagikan ke siswa"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Tabel</span>
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div
        id="printable-word-table"
        className="bg-white rounded-3xl border border-stone-200 shadow-md overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-emerald-700 text-white border-b border-emerald-800">
                <th className="py-3.5 px-4 text-xs font-extrabold w-12 text-center">No</th>
                {columns.map((col) => (
                  <th
                    key={col.id}
                    className={`py-3.5 px-4 text-xs font-bold tracking-wide ${
                      col.isArabic ? 'text-right' : 'text-left'
                    }`}
                  >
                    {col.name}
                  </th>
                ))}
                <th className="no-print py-3.5 px-4 text-xs font-bold w-16 text-center">Audio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800">
              {items.map((row, rowIdx) => (
                <tr
                  key={row.id}
                  className={`transition-colors ${
                    rowIdx % 2 === 0 ? 'bg-white' : 'bg-stone-50/60'
                  } hover:bg-emerald-50/30`}
                >
                  {/* Row Number */}
                  <td className="py-3 px-4 text-xs font-bold text-stone-500 text-center">
                    {rowIdx + 1}
                  </td>

                  {/* Columns */}
                  {columns.map((col) => {
                    const rawVal = row.values[col.id] || '';
                    const cellKey = `${row.id}_${col.id}`;
                    const isColHidden = hiddenColumnIds.has(col.id);
                    const isCellRevealed = revealedCellKeys.has(cellKey);
                    const shouldMask = isColHidden && !isCellRevealed;

                    return (
                      <td
                        key={col.id}
                        onClick={() => {
                          if (isColHidden) toggleRevealCell(cellKey);
                        }}
                        className={`py-3 px-4 text-sm ${
                          col.isArabic ? `text-right text-base font-bold ${fontClass}` : ''
                        } ${shouldMask ? 'cursor-pointer select-none bg-amber-50/70 hover:bg-amber-100/70' : ''}`}
                        dir={col.isArabic ? 'rtl' : 'ltr'}
                      >
                        {shouldMask ? (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-800 font-semibold italic bg-amber-100/90 px-2 py-0.5 rounded-md shadow-2xs">
                            <span>❓ Klik buka</span>
                          </span>
                        ) : (
                          <span>{filterText(rawVal)}</span>
                        )}
                      </td>
                    );
                  })}

                  {/* Audio column (Speaks the first Arabic cell or entire row) */}
                  <td className="no-print py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        // Find first arabic column
                        const arabCol = columns.find((c) => c.isArabic);
                        if (arabCol && row.values[arabCol.id]) {
                          speakArabic(row.values[arabCol.id]);
                        } else {
                          // fallback first value
                          const firstVal = Object.values(row.values)[0];
                          if (firstVal) speakArabic(firstVal);
                        }
                      }}
                      className="p-1.5 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                      title="Dengarkan Pelafalan"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
