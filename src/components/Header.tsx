import { useState, useRef, useEffect } from 'react';
import {
  Plus,
  FolderArchive,
  HelpCircle,
  Home,
  ChevronDown,
  Cloud,
  LogOut,
  User as UserIcon,
  BookOpen,
  Gamepad2,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../services/authContext';
import { LoginExplanationModal } from './LoginExplanationModal';
import { getAllMateriTemplates, getAllGameTemplates } from '../templates/registry';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export default function Header({ currentPath, onNavigate }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const { user, signInWithGoogle, signOutUser } = useAuth();

  const materiTemplates = getAllMateriTemplates();
  const gameTemplates = getAllGameTemplates();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      if (mobileNavRef.current && !mobileNavRef.current.contains(e.target as Node)) {
        // Only if clicking outside
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTemplate = (templateId: string) => {
    setShowDropdown(false);
    setShowMobileNav(false);
    onNavigate(`/buat/${templateId}`);
  };

  const handleNavClick = (path: string) => {
    setShowMobileNav(false);
    onNavigate(path);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Brand Zone */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleNavClick('/')}
              className="flex items-center gap-2.5 text-left cursor-pointer group shrink-0"
            >
              <div className="w-9 h-9 bg-emerald-700 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-xs group-hover:bg-emerald-800 transition-colors">
                ض
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-bold tracking-tight text-stone-900 whitespace-nowrap leading-tight">
                  Teach Arab
                </span>
                <span className="text-[10px] text-stone-600 tracking-wide font-medium hidden sm:inline">
                  Materi & Game Bahasa Arab
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Links (Desktop) */}
          {/* Order: Beranda | Materi | Game | Draf Lokal | Materi Saya | Panduan */}
          <nav className="hidden lg:flex items-center gap-4 text-sm font-medium text-stone-600">
            <button
              type="button"
              onClick={() => handleNavClick('/')}
              className={`whitespace-nowrap shrink-0 hover:text-stone-900 transition-colors flex items-center gap-1.5 cursor-pointer py-1 ${
                currentPath === '/' ? 'text-emerald-700 font-bold border-b-2 border-emerald-700' : ''
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Beranda</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('/materi')}
              className={`whitespace-nowrap shrink-0 hover:text-stone-900 transition-colors flex items-center gap-1.5 cursor-pointer py-1 ${
                currentPath.startsWith('/materi') && !currentPath.startsWith('/materi-saya')
                  ? 'text-emerald-700 font-bold border-b-2 border-emerald-700'
                  : ''
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <span>Materi</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('/game')}
              className={`whitespace-nowrap shrink-0 hover:text-stone-900 transition-colors flex items-center gap-1.5 cursor-pointer py-1 ${
                currentPath.startsWith('/game') ? 'text-indigo-700 font-bold border-b-2 border-indigo-700' : ''
              }`}
            >
              <Gamepad2 className="w-4 h-4 text-indigo-700" />
              <span>Game</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('/draf')}
              className={`whitespace-nowrap shrink-0 hover:text-stone-900 transition-colors flex items-center gap-1.5 cursor-pointer py-1 ${
                currentPath.startsWith('/draf') ? 'text-emerald-700 font-bold border-b-2 border-emerald-700' : ''
              }`}
            >
              <FolderArchive className="w-4 h-4" />
              <span>Draf Lokal</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('/materi-saya')}
              className={`whitespace-nowrap shrink-0 hover:text-stone-900 transition-colors flex items-center gap-1.5 cursor-pointer py-1 ${
                currentPath.startsWith('/materi-saya') ? 'text-emerald-700 font-bold border-b-2 border-emerald-700' : ''
              }`}
            >
              <Cloud className="w-4 h-4" />
              <span>Materi Saya</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('/bantuan')}
              className={`whitespace-nowrap shrink-0 hover:text-stone-900 transition-colors flex items-center gap-1.5 cursor-pointer py-1 ${
                currentPath.startsWith('/bantuan') ? 'text-emerald-700 font-bold border-b-2 border-emerald-700' : ''
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Panduan</span>
            </button>
          </nav>

          {/* Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Primary Action Button with Template Picker Dropdown (2 Groups: MATERI and GAME) */}
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="px-3 sm:px-4 py-2 text-xs font-bold text-white bg-emerald-700 rounded-xl hover:bg-emerald-800 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Mulai Buat</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 max-h-[82vh] overflow-y-auto bg-white border border-stone-200 rounded-2xl shadow-xl p-2 z-50 text-left animate-in fade-in zoom-in-95 divide-y divide-stone-100">
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
                            onClick={() => handleSelectTemplate(t.id)}
                            className="w-full px-3 py-2 rounded-xl hover:bg-emerald-50 text-left flex items-start gap-2.5 cursor-pointer transition-colors group"
                          >
                            <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg group-hover:bg-emerald-700 group-hover:text-white transition-colors shrink-0 mt-0.5">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-stone-900 group-hover:text-emerald-900">
                                {t.name}
                              </div>
                              <div className="text-[11px] text-stone-500 truncate">
                                {t.badge}
                              </div>
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
                            onClick={() => handleSelectTemplate(t.id)}
                            className="w-full px-3 py-2 rounded-xl hover:bg-indigo-50 text-left flex items-start gap-2.5 cursor-pointer transition-colors group"
                          >
                            <div className="p-1.5 bg-indigo-100 text-indigo-800 rounded-lg group-hover:bg-indigo-700 group-hover:text-white transition-colors shrink-0 mt-0.5">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-stone-900 group-hover:text-indigo-950">
                                {t.name}
                              </div>
                              <div className="text-[11px] text-stone-500 truncate">
                                {t.badge}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Auth Zone */}
            {user ? (
              <div className="flex items-center gap-1.5 pl-1 border-l border-stone-200">
                <button
                  type="button"
                  onClick={() => handleNavClick('/materi-saya')}
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
                  <span className="hidden xl:inline text-xs font-bold text-stone-800 max-w-[100px] truncate">
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

            {/* Mobile Hamburger Navigation Button */}
            <button
              type="button"
              onClick={() => setShowMobileNav(!showMobileNav)}
              className="lg:hidden p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
              aria-label="Buka menu navigasi"
            >
              {showMobileNav ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {showMobileNav && (
          <div
            ref={mobileNavRef}
            className="lg:hidden border-t border-stone-200 bg-white px-4 py-3 space-y-1 shadow-lg animate-in slide-in-from-top-2"
          >
            <button
              type="button"
              onClick={() => handleNavClick('/')}
              className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 ${
                currentPath === '/' ? 'bg-emerald-50 text-emerald-800' : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Home className="w-4 h-4 text-emerald-700" />
              <span>Beranda</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('/materi')}
              className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 ${
                currentPath.startsWith('/materi') && !currentPath.startsWith('/materi-saya')
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <span>Materi (Slide, Kosakata, Bacaan, Tabel)</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('/game')}
              className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 ${
                currentPath.startsWith('/game') ? 'bg-indigo-50 text-indigo-800' : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Gamepad2 className="w-4 h-4 text-indigo-700" />
              <span>Game (Flashcard, Kuis, Mencocokkan)</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('/draf')}
              className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 ${
                currentPath.startsWith('/draf') ? 'bg-emerald-50 text-emerald-800' : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <FolderArchive className="w-4 h-4 text-stone-600" />
              <span>Draf Lokal</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('/materi-saya')}
              className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 ${
                currentPath.startsWith('/materi-saya') ? 'bg-emerald-50 text-emerald-800' : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Cloud className="w-4 h-4 text-emerald-700" />
              <span>Materi Saya (Cloud)</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('/bantuan')}
              className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 ${
                currentPath.startsWith('/bantuan') ? 'bg-emerald-50 text-emerald-800' : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-stone-600" />
              <span>Panduan</span>
            </button>
          </div>
        )}
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
