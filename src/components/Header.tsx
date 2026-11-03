import { useState, useRef, useEffect } from 'react';
import {
  Plus,
  FolderArchive,
  HelpCircle,
  Home,
  ChevronDown,
  BookOpen,
  HelpCircle as QuizIcon,
  GitFork,
  Cloud,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../services/authContext';
import { LoginExplanationModal } from './LoginExplanationModal';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export default function Header({ currentPath, onNavigate }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, isConfigured, signInWithGoogle, signOutUser } = useAuth();

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
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
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
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-stone-600">
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
              onClick={() => onNavigate('/materi-saya')}
              className={`whitespace-nowrap shrink-0 hover:text-stone-900 transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentPath.startsWith('/materi-saya') ? 'text-emerald-700 font-bold' : ''
              }`}
            >
              <Cloud className="w-4 h-4" />
              <span>Materi Saya</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/draf')}
              className={`whitespace-nowrap shrink-0 hover:text-stone-900 transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentPath.startsWith('/draf') ? 'text-emerald-700 font-bold' : ''
              }`}
            >
              <FolderArchive className="w-4 h-4" />
              <span>Draf Lokal</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/bantuan')}
              className={`whitespace-nowrap shrink-0 hover:text-stone-900 transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentPath.startsWith('/bantuan') ? 'text-emerald-700 font-bold' : ''
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Panduan</span>
            </button>
          </nav>

          {/* Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Primary Action Button with Template Picker Dropdown */}
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="px-3.5 sm:px-4 py-2 text-xs font-bold text-white bg-emerald-700 rounded-xl hover:bg-emerald-800 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
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

            {/* Auth Zone */}
            {user ? (
              <div className="flex items-center gap-2 pl-1 border-l border-stone-200">
                <button
                  type="button"
                  onClick={() => onNavigate('/materi-saya')}
                  className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-xl hover:bg-stone-100 transition-colors text-left cursor-pointer"
                  title="Lihat Materi Saya di Cloud"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Guru'}
                      className="w-7 h-7 rounded-full object-cover border border-emerald-300"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                    </div>
                  )}
                  <span className="hidden lg:inline text-xs font-bold text-stone-800 max-w-[100px] truncate">
                    {user.displayName?.split(' ')[0] || 'Akun'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={signOutUser}
                  className="p-1.5 sm:px-2 sm:py-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Keluar dari Akun"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowLoginModal(true)}
                className="px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Masuk dengan Google untuk menyimpan materi ke cloud"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V13.4h6.887C18.2 16.14 15.645 18 12.24 18c-3.315 0-6-2.685-6-6s2.685-6 6-6c1.61 0 3.09.62 4.225 1.635l2.4-2.4C17.065 3.51 14.79 2.5 12.24 2.5 7.02 2.5 2.76 6.76 2.76 12s4.26 9.5 9.48 9.5c5.46 0 9.1-3.84 9.1-9.26 0-.62-.06-1.22-.16-1.74H12.24z" />
                </svg>
                <span className="hidden sm:inline">Masuk</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Login Explanation Modal */}
      <LoginExplanationModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onConfirmLogin={async () => {
          setShowLoginModal(false);
          await signInWithGoogle();
        }}
        reason="general"
      />
    </>
  );
}
