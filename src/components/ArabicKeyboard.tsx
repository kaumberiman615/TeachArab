import { useState } from 'react';
import { ARABIC_KEYBOARD_LAYOUT } from '../utils/arabic';
import { Keyboard, ChevronDown, ChevronUp, Delete, CornerDownLeft } from 'lucide-react';

interface ArabicKeyboardProps {
  onInsertChar: (char: string) => void;
  onBackspace?: () => void;
  onEnter?: () => void;
}

export default function ArabicKeyboard({
  onInsertChar,
  onBackspace,
  onEnter,
}: ArabicKeyboardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'huruf' | 'harakat' | 'angka'>('huruf');

  return (
    <div className="fixed bottom-3 right-3 sm:right-6 z-40 max-w-xl w-[calc(100vw-1.5rem)] sm:w-[480px]">
      {/* Collapsed / Toggle Button */}
      <div className="flex justify-end mb-1">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 bg-emerald-700 text-white rounded-lg shadow-md hover:bg-emerald-800 transition-colors text-xs font-semibold cursor-pointer"
        >
          <Keyboard className="w-4 h-4" />
          <span>Keyboard Arab Virtual</span>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Keyboard Body */}
      {isOpen && (
        <div className="bg-white border border-stone-200 rounded-xl shadow-xl p-2.5 backdrop-blur-sm select-none">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('huruf')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium cursor-pointer transition-colors ${
                  activeTab === 'huruf'
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Huruf
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('harakat')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium cursor-pointer transition-colors ${
                  activeTab === 'harakat'
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Harakat
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('angka')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium cursor-pointer transition-colors ${
                  activeTab === 'angka'
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Angka & Simbol
              </button>
            </div>

            <div className="flex items-center gap-1">
              {onBackspace && (
                <button
                  type="button"
                  onClick={onBackspace}
                  className="p-1.5 text-stone-600 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                  title="Hapus (Backspace)"
                >
                  <Delete className="w-4 h-4" />
                </button>
              )}
              {onEnter && (
                <button
                  type="button"
                  onClick={onEnter}
                  className="p-1.5 text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                  title="Enter / Baris Baru"
                >
                  <CornerDownLeft className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Letter Keys */}
          {activeTab === 'huruf' && (
            <div className="flex flex-col gap-1.5" dir="rtl">
              {ARABIC_KEYBOARD_LAYOUT.letters.map((row, rowIdx) => (
                <div key={rowIdx} className="flex justify-center gap-1">
                  {row.map((char) => (
                    <button
                      key={char}
                      type="button"
                      onClick={() => onInsertChar(char)}
                      className="flex-1 min-w-[28px] sm:min-w-[32px] h-9 bg-stone-50 hover:bg-emerald-50 hover:text-emerald-800 active:bg-emerald-100 border border-stone-200 hover:border-emerald-300 rounded-lg text-lg font-amiri font-bold flex items-center justify-center transition-all cursor-pointer shadow-xs"
                    >
                      {char}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Harakat Keys */}
          {activeTab === 'harakat' && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
              {ARABIC_KEYBOARD_LAYOUT.harakat.map((item) => (
                <button
                  key={item.char}
                  type="button"
                  onClick={() => onInsertChar(item.char)}
                  className="h-11 bg-stone-50 hover:bg-emerald-50 hover:text-emerald-800 active:bg-emerald-100 border border-stone-200 hover:border-emerald-300 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer p-1"
                >
                  <span className="text-xl font-amiri font-bold">{item.label}</span>
                  <span className="text-[10px] text-stone-500">{item.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Numbers & Punctuation */}
          {activeTab === 'angka' && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-center gap-1" dir="rtl">
                {ARABIC_KEYBOARD_LAYOUT.numbers.map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => onInsertChar(num)}
                    className="flex-1 h-9 bg-stone-50 hover:bg-emerald-50 hover:text-emerald-800 border border-stone-200 rounded-lg text-base font-amiri font-bold flex items-center justify-center cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-1">
                {ARABIC_KEYBOARD_LAYOUT.punctuation.map((punc) => (
                  <button
                    key={punc}
                    type="button"
                    onClick={() => onInsertChar(punc)}
                    className="w-8 h-8 bg-stone-50 hover:bg-emerald-50 hover:text-emerald-800 border border-stone-200 rounded-lg text-sm font-semibold flex items-center justify-center cursor-pointer"
                  >
                    {punc}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Space & Harakat shortcut row */}
          <div className="mt-2 pt-2 border-t border-stone-100 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onInsertChar(' ')}
              className="flex-1 py-1 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-lg text-xs font-medium text-stone-700 cursor-pointer text-center"
            >
              Spasi
            </button>
            <button
              type="button"
              onClick={() => onInsertChar('\u064E')}
              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-sm font-amiri cursor-pointer"
              title="Fathah"
            >
              ـَ
            </button>
            <button
              type="button"
              onClick={() => onInsertChar('\u0650')}
              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-sm font-amiri cursor-pointer"
              title="Kasrah"
            >
              ـِ
            </button>
            <button
              type="button"
              onClick={() => onInsertChar('\u064F')}
              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-sm font-amiri cursor-pointer"
              title="Dammah"
            >
              ـُ
            </button>
            <button
              type="button"
              onClick={() => onInsertChar('\u0652')}
              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-sm font-amiri cursor-pointer"
              title="Sukun"
            >
              ـْ
            </button>
            <button
              type="button"
              onClick={() => onInsertChar('\u0651')}
              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-sm font-amiri cursor-pointer"
              title="Shaddah"
            >
              ـّ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
