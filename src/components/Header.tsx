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
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-stone-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-3">
          {/* Brand Zone - Playful Bubble Bash Logo */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleNavClick('/')}
              className="flex items-center gap-3 text-left cursor-pointer group shrink-0"
            >
              <div className="relative w-10 h-10 bg-gradient-to-tr from-[#00B4D8] to-[#FED034] p-0.5 rounded-2xl shadow-xs group-hover:scale-105 transition-transform duration-200">
                <div className="w-full h-full bg-[#0A254D] text-[#FED034] rounded-[14px] flex items-center justify-center font-black text-xl font-amiri shadow-inner">
                  ض
                </div>
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#FF3B8D] rounded-full border-2 border-white animate-pulse" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg sm:text-xl font-black tracking-tight text-[#0A254D] whitespace-nowrap leading-tight">
                    Teach<span className="text-[#FF3B8D]">Arab</span>
                  </span>
                </div>
                <span className="text-[11px] text-stone-500 font-bold tracking-tight hidden sm:inline">
                  Materi & Game Interaktif
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Links (Desktop) - Playful clean pills */}
          <nav className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-stone-600 bg-stone-100/80 p-1.5 rounded-full border border-stone-200/60">
            <button
              type="button"
              onClick={() => handleNavClick('/')}
              className={`whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 cursor-pointer px-3.5 py-1.5 rounded-full ${
                currentPath === '/'
                  ? 'bg-white text-[#0A254D] shadow-xs font-black'
                  : 'hover:text-[#0A254D] hover:bg-white/60'
              }`}
            >
              <Home className="w-3.5 h-3.5 text-[#00B4D8]" />
              <span>Beranda</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('/materi')}
              className={`whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 cursor-pointer px-3.5 py-1.5 rounded-full ${
                currentPath.startsWith('/materi') && !currentPath.startsWith('/materi-saya')
                  ? 'bg-[#00B4D8] text-white shadow-xs font-black'
                  : 'hover:text-[#00B4D8] hover:bg-white/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Materi</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('/game')}
              className={`whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 cursor-pointer px-3.5 py-1.5 rounded-full ${
                currentPath.startsWith('/game')
                  ? 'bg-[#FF3B8D] text-white shadow-xs font-black'
                  : 'hover:text-[#FF3B8D] hover:bg-white/60'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Game</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('/draf')}
              className={`whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 cursor-pointer px-3.5 py-1.5 rounded-full ${
                currentPath.startsWith('/draf')
                  ? 'bg-white text-[#0A254D] shadow-xs font-black'
                  : 'hover:text-[#0A254D] hover:bg-white/60'
              }`}
            >
              <FolderArchive className="w-3.5 h-3.5 text-amber-500" />
              <span>Draf Lokal</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('/materi-saya')}
              className={`whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 cursor-pointer px-3.5 py-1.5 rounded-full ${
                currentPath.startsWith('/materi-saya')
                  ? 'bg-white text-[#0A254D] shadow-xs font-black'
                  : 'hover:text-[#0A254D] hover:bg-white/60'
              }`}
            >
              <Cloud className="w-3.5 h-3.5 text-[#00B4D8]" />
              <span>Materi Saya</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('/bantuan')}
              className={`whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 cursor-pointer px-3.5 py-1.5 rounded-full ${
                currentPath.startsWith('/bantuan')
                  ? 'bg-white text-[#0A254D] shadow-xs font-black'
                  : 'hover:text-[#0A254D] hover:bg-white/60'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
              <span>Panduan</span>
            </button>
          </nav>

          {/* Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Primary Action Button - Playful Hot Pink Pill Button with Drop Shadow */}
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="px-4 sm:px-5 py-2.5 text-xs font-black text-white bg-[#FF3B8D] hover:bg-[#E62879] rounded-full shadow-[0_3px_0_#C2185B] active:translate-y-0.5 active:shadow-[0_1px_0_#C2185B] transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Mulai Buat</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 max-h-[82vh] overflow-y-auto bg-white border-2 border-stone-200/80 rounded-3xl shadow-2xl p-3 z-50 text-left animate-in fade-in zoom-in-95 divide-y divide-stone-100">
                  {/* GROUP 1: MATERI (Cyan Theme) */}
                  <div className="pb-3">
                    <div className="px-3 pt-2 pb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-[#E6F7F5] text-[#00B4D8] flex items-center justify-center">
                          <BookOpen className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-black text-[#0A254D] uppercase tracking-wider">
                          Materi Pelajaran
                        </span>
                      </div>
                      <span className="text-[10px] bg-[#E6F7F5] text-[#00B4D8] font-black px-2.5 py-0.5 rounded-full border border-[#00B4D8]/20">
                        4 Format
                      </span>
                    </div>

                    <div className="space-y-1">
                      {materiTemplates.map((t) => {
                        const Icon = t.icon;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => handleSelectTemplate(t.id)}
                            className="w-full px-3 py-2.5 rounded-2xl hover:bg-[#E6F7F5] text-left flex items-start gap-3 cursor-pointer transition-all group"
                          >
                            <div className="p-2 bg-[#E6F7F5] text-[#00B4D8] rounded-xl group-hover:bg-[#00B4D8] group-hover:text-white transition-colors shrink-0 mt-0.5">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-[#0A254D] group-hover:text-[#00B4D8]">
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

                  {/* GROUP 2: GAME (Hot Pink Theme) */}
                  <div className="pt-3">
                    <div className="px-3 pt-1 pb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-[#FFF0F6] text-[#FF3B8D] flex items-center justify-center">
                          <Gamepad2 className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-black text-[#0A254D] uppercase tracking-wider">
                          Game Interaktif
                        </span>
                      </div>
                      <span className="text-[10px] bg-[#FFF0F6] text-[#FF3B8D] font-black px-2.5 py-0.5 rounded-full border border-[#FF3B8D]/20">
                        {gameTemplates.length} Game
                      </span>
                    </div>

                    <div className="space-y-1">
                      {gameTemplates.map((t) => {
                        const Icon = t.icon;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => handleSelectTemplate(t.id)}
                            className="w-full px-3 py-2.5 rounded-2xl hover:bg-[#FFF0F6] text-left flex items-start gap-3 cursor-pointer transition-all group"
                          >
                            <div className="p-2 bg-[#FFF0F6] text-[#FF3B8D] rounded-xl group-hover:bg-[#FF3B8D] group-hover:text-white transition-colors shrink-0 mt-0.5">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-[#0A254D] group-hover:text-[#FF3B8D]">
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
              <div className="flex items-center gap-1.5 pl-1.5 border-l-2 border-stone-200">
                <button
                  type="button"
                  onClick={() => handleNavClick('/materi-saya')}
                  className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-full hover:bg-stone-100 transition-colors text-left cursor-pointer"
                  title="Lihat Materi Saya di Cloud"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Guru'}
                      className="w-8 h-8 rounded-full object-cover border-2 border-[#00B4D8]"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#E6F7F5] text-[#00B4D8] flex items-center justify-center font-black text-xs">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                    </div>
                  )}
                  <span className="hidden xl:inline text-xs font-black text-[#0A254D] max-w-[100px] truncate">
                    {user.displayName?.split(' ')[0] || 'Akun'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={signOutUser}
                  className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                  title="Keluar dari Akun"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-2 text-xs font-black text-[#0A254D] bg-stone-100 hover:bg-stone-200 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Masuk dengan Google untuk menyimpan materi ke cloud"
              >
                <svg className="w-3.5 h-3.5 fill-current text-[#0A254D]" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V13.4h6.887C18.2 16.14 15.645 18 12.24 18c-3.315 0-6-2.685-6-6s2.685-6 6-6c1.61 0 3.09.62 4.225 1.635l2.4-2.4C17.065 3.51 14.79 2.5 12.24 2.5 7.02 2.5 2.76 6.76 2.76 12s4.26 9.5 9.48 9.5c5.46 0 9.1-3.84 9.1-9.26 0-.62-.06-1.22-.16-1.74H12.24z" />
                </svg>
                <span className="hidden sm:inline">Masuk</span>
              </button>
            )}

            {/* Mobile Hamburger Navigation Button */}
            <button
              type="button"
              onClick={() => setShowMobileNav(!showMobileNav)}
              className="lg:hidden p-2 text-stone-600 hover:text-[#0A254D] hover:bg-stone-100 rounded-2xl transition-colors cursor-pointer"
              aria-label="Buka menu navigasi"
            >
              {showMobileNav ? <X className="w-5 h-5 stroke-[2.5]" /> : <Menu className="w-5 h-5 stroke-[2.5]" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {showMobileNav && (
          <div
            ref={mobileNavRef}
            className="lg:hidden border-t-2 border-stone-100 bg-white px-4 py-4 space-y-1.5 shadow-xl animate-in slide-in-from-top-2 rounded-b-3xl"
          >
            <button
              type="button"
              onClick={() => handleNavClick('/')}
              className={`w-full px-4 py-3 rounded-2xl text-left text-xs font-bold flex items-center gap-3 ${
                currentPath === '/' ? 'bg-[#FED034]/20 text-[#0A254D] font-black' : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Home className="w-4 h-4 text-[#00B4D8]" />
              <span>Beranda</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('/materi')}
              className={`w-full px-4 py-3 rounded-2xl text-left text-xs font-bold flex items-center gap-3 ${
                currentPath.startsWith('/materi') && !currentPath.startsWith('/materi-saya')
                  ? 'bg-[#E6F7F5] text-[#00B4D8] font-black'
                  : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <BookOpen className="w-4 h-4 text-[#00B4D8]" />
              <span>Materi (Slide, Kosakata, Bacaan, Tabel)</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('/game')}
              className={`w-full px-4 py-3 rounded-2xl text-left text-xs font-bold flex items-center gap-3 ${
                currentPath.startsWith('/game') ? 'bg-[#FFF0F6] text-[#FF3B8D] font-black' : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Gamepad2 className="w-4 h-4 text-[#FF3B8D]" />
              <span>Game (10 Permainan Interaktif)</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('/draf')}
              className={`w-full px-4 py-3 rounded-2xl text-left text-xs font-bold flex items-center gap-3 ${
                currentPath.startsWith('/draf') ? 'bg-stone-100 text-[#0A254D] font-black' : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <FolderArchive className="w-4 h-4 text-amber-500" />
              <span>Draf Lokal</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('/materi-saya')}
              className={`w-full px-4 py-3 rounded-2xl text-left text-xs font-bold flex items-center gap-3 ${
                currentPath.startsWith('/materi-saya') ? 'bg-stone-100 text-[#0A254D] font-black' : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Cloud className="w-4 h-4 text-[#00B4D8]" />
              <span>Materi Saya (Cloud)</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('/bantuan')}
              className={`w-full px-4 py-3 rounded-2xl text-left text-xs font-bold flex items-center gap-3 ${
                currentPath.startsWith('/bantuan') ? 'bg-stone-100 text-[#0A254D] font-black' : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-purple-500" />
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
