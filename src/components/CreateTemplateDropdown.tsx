import { useState, useRef, useEffect } from 'react';
import { Plus, ChevronDown, BookOpen, Gamepad2 } from 'lucide-react';
import { getAllMateriTemplates, getAllGameTemplates } from '../templates/registry';

interface CreateTemplateDropdownProps {
  onSelect: (templateId: string) => void;
  buttonLabel?: string;
  buttonClassName?: string;
}

export default function CreateTemplateDropdown({
  onSelect,
  buttonLabel = 'Buat Baru',
  buttonClassName = 'px-4 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer active:scale-95',
}: CreateTemplateDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const materiTemplates = getAllMateriTemplates();
  const gameTemplates = getAllGameTemplates();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChoose = (id: string) => {
    setIsOpen(false);
    onSelect(id);
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClassName}
        title="Pilih template untuk membuat materi atau game baru"
      >
        <Plus className="w-4 h-4" />
        <span>{buttonLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 max-h-[80vh] overflow-y-auto bg-white border border-stone-200 rounded-2xl shadow-xl p-2 z-50 text-left animate-in fade-in zoom-in-95 divide-y divide-stone-100">
          {/* GROUP 1: MATERI */}
          <div className="pb-2">
            <div className="px-3 pt-2 pb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                <span className="text-[11px] font-extrabold text-emerald-900 uppercase tracking-wider">
                  Materi
                </span>
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                4 Format
              </span>
            </div>

            <div className="space-y-0.5">
              {materiTemplates.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleChoose(t.id)}
                    className="w-full px-3 py-2 rounded-xl hover:bg-emerald-50 text-left flex items-start gap-2.5 cursor-pointer transition-colors group"
                  >
                    <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg group-hover:bg-emerald-700 group-hover:text-white transition-colors shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-stone-900 group-hover:text-emerald-900">
                        {t.name}
                      </div>
                      <div className="text-[11px] text-stone-500 truncate">{t.badge}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* GROUP 2: GAME */}
          <div className="pt-2">
            <div className="px-3 pt-1 pb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Gamepad2 className="w-3.5 h-3.5 text-indigo-700" />
                <span className="text-[11px] font-extrabold text-indigo-950 uppercase tracking-wider">
                  Game
                </span>
              </div>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-bold">
                3 Permainan
              </span>
            </div>

            <div className="space-y-0.5">
              {gameTemplates.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleChoose(t.id)}
                    className="w-full px-3 py-2 rounded-xl hover:bg-indigo-50 text-left flex items-start gap-2.5 cursor-pointer transition-colors group"
                  >
                    <div className="p-1.5 bg-indigo-100 text-indigo-800 rounded-lg group-hover:bg-indigo-700 group-hover:text-white transition-colors shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-stone-900 group-hover:text-indigo-950">
                        {t.name}
                      </div>
                      <div className="text-[11px] text-stone-500 truncate">{t.badge}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
