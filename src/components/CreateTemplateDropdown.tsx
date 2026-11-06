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
  buttonClassName = 'min-h-[44px] px-4 py-2 text-xs font-black bg-[#FF3B8D] hover:bg-[#e02e7b] text-white rounded-2xl border-2 border-[#0A254D] shadow-[0_3px_0_#0A254D] flex items-center gap-1.5 transition-all cursor-pointer active:translate-y-0.5 active:shadow-[0_1px_0_#0A254D]',
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
        <div className="absolute right-0 mt-2 w-72 sm:w-80 max-h-[80vh] overflow-y-auto bg-white border-2 border-[#0A254D] rounded-3xl shadow-[0_8px_0_#0A254D] p-3 z-50 text-left animate-in fade-in zoom-in-95 divide-y divide-stone-100">
          {/* GROUP 1: MATERI */}
          <div className="pb-2">
            <div className="px-3 pt-2 pb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#00B4D8]" />
                <span className="text-[11px] font-black text-[#0A254D] uppercase tracking-wider">
                  Materi
                </span>
              </div>
              <span className="text-[10px] bg-[#E0F7FA] text-[#0A254D] border border-[#00B4D8] px-2.5 py-0.5 rounded-full font-black">
                {materiTemplates.length} Format
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
                    className="w-full px-3 py-2 rounded-2xl hover:bg-[#E0F7FA] text-left flex items-start gap-2.5 cursor-pointer transition-colors group"
                  >
                    <div className="p-1.5 bg-[#E0F7FA] text-[#0A254D] border border-cyan-200 rounded-xl group-hover:bg-[#00B4D8] group-hover:text-white transition-colors shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-black text-[#0A254D] group-hover:text-[#00B4D8]">
                        {t.name}
                      </div>
                      <div className="text-[11px] text-stone-500 truncate font-medium">{t.badge}</div>
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
                <Gamepad2 className="w-3.5 h-3.5 text-[#FF3B8D]" />
                <span className="text-[11px] font-black text-[#0A254D] uppercase tracking-wider">
                  Game
                </span>
              </div>
              <span className="text-[10px] bg-[#FFE4EE] text-[#0A254D] border border-[#FF3B8D] px-2.5 py-0.5 rounded-full font-black">
                {gameTemplates.length} Permainan
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
                    className="w-full px-3 py-2 rounded-2xl hover:bg-[#FFE4EE] text-left flex items-start gap-2.5 cursor-pointer transition-colors group"
                  >
                    <div className="p-1.5 bg-[#FFE4EE] text-[#0A254D] border border-pink-200 rounded-xl group-hover:bg-[#FF3B8D] group-hover:text-white transition-colors shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-black text-[#0A254D] group-hover:text-[#FF3B8D]">
                        {t.name}
                      </div>
                      <div className="text-[11px] text-stone-500 truncate font-medium">{t.badge}</div>
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
