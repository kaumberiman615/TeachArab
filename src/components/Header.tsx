import { useState, useRef, useEffect } from 'react';
import { Plus, FolderArchive, HelpCircle, Home, ChevronDown, BookOpen, HelpCircle as QuizIcon, GitFork } from 'lucide-react';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export default function Header({ currentPath, onNavigate }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (template: string) => {
    setShowDropdown(false);
    onNavigate(`/buat/${template}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Brand Zone */}
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="flex items-center gap-2.5 text-left cursor-pointer group shrink-0"
        >
          <div className="w-9 h-9 bg-emerald-700 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-xs group-hover:bg-emerald-800 transition-colors">
            ض
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-stone-900 whitespace-nowrap leading-tight">
              Teach Arab
            </span>
            <span className="text-[10px] text-stone-600 tracking-wide font-medium">
              Perangkat Ajar & Game Bahasa Arab
            </span>
          </div>
        </button>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className={`whitespace-nowrap shrink-0 hover:text-stone-900 transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentPath === '/' ? 'text-emerald-700 font-bold' : ''
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Beranda</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/draf')}
            className={`whitespace-nowrap shrink-0 hover:text-stone-900 transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentPath.startsWith('/draf') ? 'text-emerald-700 font-bold' : ''
            }`}
          >
            <FolderArchive className="w-4 h-4" />
            <span>Draf Saya</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/bantuan')}
            className={`whitespace-nowrap shrink-0 hover:text-stone-900 transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentPath.startsWith('/bantuan') ? 'text-emerald-700 font-bold' : ''
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Panduan & Bantuan</span>
          </button>
        </nav>

        {/* Primary Action Button with Template Picker Dropdown */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 rounded-xl hover:bg-emerald-800 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Mulai Buat</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-stone-200 rounded-2xl shadow-xl p-2 z-50 text-left animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                Pilih Jenis Template:
              </div>

              <button
                type="button"
                onClick={() => handleSelect('flashcard')}
                className="w-full px-3 py-2.5 rounded-xl hover:bg-emerald-50 text-left flex items-start gap-2.5 cursor-pointer transition-colors group"
              >
                <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900 group-hover:text-emerald-900">
                    Flashcard Kosakata
                  </div>
                  <div className="text-[11px] text-stone-500">
                    Kartu hafalan mufrodat & arti
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelect('kuis')}
                className="w-full px-3 py-2.5 rounded-xl hover:bg-emerald-50 text-left flex items-start gap-2.5 cursor-pointer transition-colors group"
              >
                <div className="p-1.5 bg-indigo-100 text-indigo-800 rounded-lg group-hover:bg-indigo-700 group-hover:text-white transition-colors">
                  <QuizIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900 group-hover:text-indigo-900">
                    Kuis Pilihan Ganda
                  </div>
                  <div className="text-[11px] text-stone-500">
                    Soal pilihan ganda & timer
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelect('matching')}
                className="w-full px-3 py-2.5 rounded-xl hover:bg-emerald-50 text-left flex items-start gap-2.5 cursor-pointer transition-colors group"
              >
                <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg group-hover:bg-amber-700 group-hover:text-white transition-colors">
                  <GitFork className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900 group-hover:text-amber-900">
                    Mencocokkan Kata
                  </div>
                  <div className="text-[11px] text-stone-500">
                    Pasangkan kata Arab & gambar
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
