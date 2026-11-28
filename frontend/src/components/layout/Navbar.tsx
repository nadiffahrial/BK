import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Layers, Box, ListFilter, ShieldCheck, LogIn, Search, House, Compass, BookOpen } from 'lucide-react';
import { ViewMode } from '../../types';
import { ThemeToggle } from '../common/ThemeToggle';
import { CampusLogo } from '../common/CampusLogo';

interface NavbarProps {
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  onLoginClick: () => void;
  onOpenSearch: () => void;
  onOpenPanorama: () => void;
  onOpenGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  onChangeViewMode,
  onLoginClick,
  onOpenSearch,
  onOpenPanorama,
  onOpenGuide
}) => {
  const { user } = useAuth();

  return (
    <>
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-emerald-100/90 dark:border-slate-800 shadow-xs transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-2 py-2.5 lg:flex lg:h-16 lg:justify-between lg:py-0">
          
          {/* 1. Brand Logo & Campus Name - Universitas Siliwangi */}
          <div className="flex items-center gap-2.5 sm:gap-3 group cursor-pointer select-none">
            <div className="transition-transform duration-300 group-hover:scale-105">
              <CampusLogo size="md" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm sm:text-base tracking-tight text-slate-900 dark:text-white transition-colors leading-tight">
                  <span className="text-emerald-700 dark:text-emerald-300">SILO</span><span className="text-teal-600 dark:text-teal-300">KA</span>
                </span>
                {(user?.role === 'admin' || user?.role === 'super_admin') && (
                  <span className="hidden lg:inline-flex items-center gap-1 text-[9px] font-semibold text-indigo-700 dark:text-indigo-300">
                    <ShieldCheck className="h-3 w-3" /> PANEL ADMIN
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 tracking-tight leading-none mt-0.5">
                Siliwangi Location Assistant
              </span>
            </div>
          </div>

          {/* 2. Compact View Mode Switcher (2D / 3D / Daftar) with smooth-btn transitions */}
          <div className="col-span-2 row-start-2 flex max-w-full justify-self-center overflow-x-auto p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 transition-colors shadow-2xs lg:col-span-1 lg:row-auto lg:justify-self-auto lg:flex">
            <button
              onClick={() => onChangeViewMode('2d')}
              className={`smooth-btn shrink-0 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === '2d'
                  ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs border border-emerald-200 dark:border-emerald-600/40 scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Tampilan 2D Denah"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>2D Denah</span>
            </button>

            <button
              onClick={() => onChangeViewMode('3d')}
              className={`smooth-btn shrink-0 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === '3d'
                  ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs border border-emerald-200 dark:border-emerald-600/40 scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Tampilan 3D Isometrik"
            >
              <Box className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>3D Model</span>
            </button>

            <button
              onClick={() => onChangeViewMode('list')}
              className={`smooth-btn shrink-0 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs border border-emerald-200 dark:border-emerald-600/40 scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Direktori Ruangan"
            >
              <ListFilter className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Daftar</span>
            </button>
          </div>

          {/* Theme and sign in */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button type="button" onClick={onOpenSearch} className="smooth-btn inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-700 transition-colors hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:text-emerald-300 lg:h-auto lg:w-auto lg:gap-1.5 lg:px-3 lg:py-2" title="Cari ruangan" aria-label="Cari ruangan"><Search className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /><span className="hidden text-xs font-bold lg:inline">Cari</span></button>
            <ThemeToggle showLabel={false} />

            <button
              onClick={onLoginClick}
              className="smooth-btn inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 sm:h-auto sm:w-auto sm:gap-2 sm:px-3.5 sm:py-2"
              title="Masuk ke akun administrator"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Login</span>
            </button>
          </div>

        </div>
      </div>
    </header>
    <nav aria-label="Menu cepat" className="fixed bottom-16 left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-[30rem] -translate-x-1/2 rounded-2xl border border-slate-200/90 bg-white/95 p-1.5 shadow-xl shadow-slate-900/15 backdrop-blur-lg dark:border-slate-700 dark:bg-slate-900/95 lg:hidden">
        <div className="grid grid-cols-3 gap-0.5">
          <button type="button" onClick={() => { onChangeViewMode('2d'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex min-w-0 flex-col items-center gap-1 rounded-xl px-0.5 py-2 text-[9px] font-semibold text-slate-600 transition-colors hover:bg-emerald-50 hover:text-emerald-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-emerald-300"><House className="h-5 w-5" /><span className="truncate">Beranda</span></button>
          <button type="button" onClick={onOpenPanorama} className="flex min-w-0 flex-col items-center gap-1 rounded-xl px-0.5 py-2 text-[9px] font-semibold text-slate-600 transition-colors hover:bg-emerald-50 hover:text-emerald-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-emerald-300"><Compass className="h-5 w-5" /><span className="truncate">Jelajah</span></button>
          <button type="button" onClick={onOpenGuide} className="flex min-w-0 flex-col items-center gap-1 rounded-xl px-0.5 py-2 text-[9px] font-semibold text-slate-600 transition-colors hover:bg-emerald-50 hover:text-emerald-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-emerald-300"><BookOpen className="h-5 w-5" /><span className="truncate">Panduan</span></button>
        </div>
    </nav>
    </>
  );
};
