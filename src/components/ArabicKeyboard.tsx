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
    <div className={`fixed bottom-3 right-3 sm:right-6 z-40 select-none ${isOpen ? 'max-w-xl w-[calc(100vw-1.5rem)] sm:w-[500px]' : 'w-auto'}`}>
      {/* Collapsed / Toggle Button */}
      <div className="flex justify-end mb-1.5">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 min-h-[44px] px-4 py-2 bg-[#0A254D] hover:bg-[#1E3A8A] active:translate-y-0.5 text-white border-2 border-[#FED034] rounded-full shadow-[0_3px_0_rgba(10,37,77,0.3)] transition-all text-xs font-black cursor-pointer"
          title="Buka / Tutup Keyboard Arab Virtual"
          aria-expanded={isOpen}
        >
          <Keyboard className="w-4 h-4 text-[#FED034]" />
          <span className="text-white">Keyboard Arab</span>
          <span className="px-2 py-0.5 rounded-full bg-[#FED034] text-[#0A254D] text-[10px] font-black">
            {isOpen ? 'Tutup' : 'Buka'}
          </span>
          {isOpen ? <ChevronDown className="w-4 h-4 text-[#FED034]" /> : <ChevronUp className="w-4 h-4 text-[#FED034]" />}
        </button>
      </div>

      {/* Keyboard Body */}
      {isOpen && (
        <div className="bg-white/98 border-2 border-stone-200 rounded-3xl shadow-2xl p-3 sm:p-4 backdrop-blur-md select-none text-navy-deep animate-in fade-in slide-in-from-bottom-2">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-stone-100 pb-2.5 mb-2.5">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('huruf')}
                className={`px-3 py-1.5 text-xs rounded-full font-black cursor-pointer transition-all ${
                  activeTab === 'huruf'
                    ? 'bg-cyan-ice text-cyan-bubble border border-cyan-bubble/40 shadow-xs'
                    : 'text-stone-600 hover:text-navy-deep'
                }`}
              >
                Huruf
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('harakat')}
                className={`px-3 py-1.5 text-xs rounded-full font-black cursor-pointer transition-all ${
                  activeTab === 'harakat'
                    ? 'bg-cyan-ice text-cyan-bubble border border-cyan-bubble/40 shadow-xs'
                    : 'text-stone-600 hover:text-navy-deep'
                }`}
              >
                Harakat
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('angka')}
                className={`px-3 py-1.5 text-xs rounded-full font-black cursor-pointer transition-all ${
                  activeTab === 'angka'
                    ? 'bg-cyan-ice text-cyan-bubble border border-cyan-bubble/40 shadow-xs'
                    : 'text-stone-600 hover:text-navy-deep'
                }`}
              >
                Angka & Simbol
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              {onBackspace && (
                <button
                  type="button"
                  onClick={onBackspace}
                  className="w-9 h-9 flex items-center justify-center text-stone-600 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                  title="Hapus (Backspace)"
                >
                  <Delete className="w-4 h-4" />
                </button>
              )}
              {onEnter && (
                <button
                  type="button"
                  onClick={onEnter}
                  className="w-9 h-9 flex items-center justify-center text-stone-600 hover:text-cyan-bubble hover:bg-cyan-ice rounded-full transition-colors"
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
                <div key={rowIdx} className="flex justify-center gap-1 sm:gap-1.5">
                  {row.map((char) => (
                    <button
                      key={char}
                      type="button"
                      onClick={() => onInsertChar(char)}
                      className="flex-1 min-w-[28px] sm:min-w-[34px] h-10 bg-stone-50 hover:bg-yellow-bubble/20 hover:border-yellow-bubble active:scale-95 border-2 border-stone-200 rounded-xl text-xl font-amiri font-bold flex items-center justify-center transition-all cursor-pointer shadow-xs text-navy-deep"
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
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {ARABIC_KEYBOARD_LAYOUT.harakat.map((item) => (
                <button
                  key={item.char}
                  type="button"
                  onClick={() => onInsertChar(item.char)}
                  className="h-12 bg-stone-50 hover:bg-cyan-ice hover:border-cyan-bubble active:scale-95 border-2 border-stone-200 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer p-1 text-navy-deep"
                >
                  <span className="text-2xl font-amiri font-bold leading-none">{item.label}</span>
                  <span className="text-[10px] text-stone-500 font-semibold mt-0.5">{item.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Numbers & Punctuation */}
          {activeTab === 'angka' && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-center gap-1 sm:gap-1.5" dir="rtl">
                {ARABIC_KEYBOARD_LAYOUT.numbers.map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => onInsertChar(num)}
                    className="flex-1 h-10 bg-stone-50 hover:bg-yellow-bubble/20 hover:border-yellow-bubble active:scale-95 border-2 border-stone-200 rounded-xl text-lg font-amiri font-bold flex items-center justify-center cursor-pointer text-navy-deep"
                  >
                    {num}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-1.5">
                {ARABIC_KEYBOARD_LAYOUT.punctuation.map((punc) => (
                  <button
                    key={punc}
                    type="button"
                    onClick={() => onInsertChar(punc)}
                    className="w-9 h-9 bg-stone-50 hover:bg-yellow-bubble/20 hover:border-yellow-bubble border-2 border-stone-200 rounded-xl text-sm font-bold flex items-center justify-center cursor-pointer text-navy-deep"
                  >
                    {punc}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Space & Harakat shortcut row */}
          <div className="mt-2.5 pt-2.5 border-t border-stone-100 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onInsertChar(' ')}
              className="flex-1 min-h-[38px] py-1.5 bg-stone-100 hover:bg-stone-200 border-2 border-stone-200 rounded-full text-xs font-bold text-navy-deep cursor-pointer text-center"
            >
              Spasi
            </button>
            <button
              type="button"
              onClick={() => onInsertChar('\u064E')}
              className="min-h-[38px] px-3 bg-cyan-ice hover:bg-cyan-bubble hover:text-white border border-cyan-bubble/30 rounded-full text-sm font-amiri font-bold cursor-pointer transition-colors"
              title="Fathah"
            >
              ـَ
            </button>
            <button
              type="button"
              onClick={() => onInsertChar('\u0650')}
              className="min-h-[38px] px-3 bg-cyan-ice hover:bg-cyan-bubble hover:text-white border border-cyan-bubble/30 rounded-full text-sm font-amiri font-bold cursor-pointer transition-colors"
              title="Kasrah"
            >
              ـِ
            </button>
            <button
              type="button"
              onClick={() => onInsertChar('\u064F')}
              className="min-h-[38px] px-3 bg-cyan-ice hover:bg-cyan-bubble hover:text-white border border-cyan-bubble/30 rounded-full text-sm font-amiri font-bold cursor-pointer transition-colors"
              title="Dammah"
            >
              ـُ
            </button>
            <button
              type="button"
              onClick={() => onInsertChar('\u0652')}
              className="min-h-[38px] px-3 bg-cyan-ice hover:bg-cyan-bubble hover:text-white border border-cyan-bubble/30 rounded-full text-sm font-amiri font-bold cursor-pointer transition-colors"
              title="Sukun"
            >
              ـْ
            </button>
            <button
              type="button"
              onClick={() => onInsertChar('\u0651')}
              className="min-h-[38px] px-3 bg-cyan-ice hover:bg-cyan-bubble hover:text-white border border-cyan-bubble/30 rounded-full text-sm font-amiri font-bold cursor-pointer transition-colors"
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
