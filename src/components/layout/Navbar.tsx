import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Menu,
  Layers, 
  Box, 
  ListFilter, 
  GraduationCap,
  Search
} from 'lucide-react';
import { Building, RoomStatus, ViewMode } from '../../types';
import { ThemeToggle } from '../common/ThemeToggle';

interface NavbarProps {
  buildings?: Building[];
  activeBuildingId?: string;
  onSelectBuilding?: (buildingId: string) => void;
  activeFloorNumber?: number;
  onSelectFloor?: (floorNumber: number) => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  statusFilter?: RoomStatus | 'all';
  onStatusFilterChange?: (status: RoomStatus | 'all') => void;
  onSelectRoomById?: (roomId: string) => void;
  onOpenMenu: () => void;
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  onChangeViewMode,
  onOpenMenu,
  onOpenSearch
}) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-emerald-100/90 dark:border-slate-800 shadow-xs transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* 1. Brand Logo & Campus Name - Universitas Siliwangi */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="relative flex items-center justify-center shrink-0">
              <img
                src="/logo-unsil.png"
                alt="Logo Universitas Siliwangi"
                className="w-9 h-9 sm:w-11 sm:h-11 object-contain drop-shadow-xs transition-transform hover:scale-105"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm sm:text-base tracking-tight text-slate-900 dark:text-white transition-colors leading-tight">
                  SmartCampus<span className="text-emerald-600 dark:text-emerald-400">3D</span>
                </span>
                <span className="hidden lg:inline-flex text-[9px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Denah 3D
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 tracking-tight leading-none mt-0.5">
                Universitas Siliwangi
              </span>
            </div>
          </div>

          {/* 2. Compact View Mode Switcher (2D / 3D / Daftar) */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 transition-colors">
            <button
              onClick={() => onChangeViewMode('2d')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === '2d'
                  ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs border border-emerald-200 dark:border-emerald-600/40'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Tampilan 2D Denah"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>2D Denah</span>
            </button>

            <button
              onClick={() => onChangeViewMode('3d')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === '3d'
                  ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs border border-emerald-200 dark:border-emerald-600/40'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Tampilan 3D Isometrik"
            >
              <Box className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>3D Model</span>
            </button>

            <button
              onClick={() => onChangeViewMode('list')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs border border-emerald-200 dark:border-emerald-600/40'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Direktori Ruangan"
            >
              <ListFilter className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Daftar</span>
            </button>
          </div>

          {/* 3. Search Engine Trigger, Dark Mode Toggle, User Avatar & Prominent Menu Button */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* 🔍 Search Engine Trigger Button */}
            {onOpenSearch && (
              <button
                onClick={onOpenSearch}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-500/50 text-xs font-bold transition-all cursor-pointer group"
                title="Buka Search Engine (Ctrl + K)"
              >
                <Search className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Cari</span>
                <kbd className="hidden lg:inline text-[9px] font-mono bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  Ctrl+K
                </kbd>
              </button>
            )}

            {/* 🌙 ⭐ DEDICATED DARK MODE BUTTON ⭐ ☀️ */}
            <ThemeToggle showLabel={false} />

            {/* User Chip */}
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs transition-colors">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center font-bold text-[10px] text-white">
                {user?.name ? user.name.charAt(0) : 'U'}
              </div>
              <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[100px]">
                {user?.name?.split(' ')[0]}
              </span>
            </div>

            {/* ⭐ PROMINENT TOMBOL MENU UTAMA ⭐ */}
            <button
              onClick={onOpenMenu}
              className="flex items-center gap-2 px-3.5 py-1.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white shadow-sm shadow-emerald-600/25 transition-all duration-200 cursor-pointer active:scale-95 group font-bold text-xs"
              title="Buka Menu Lengkap"
            >
              <Menu className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
              <span>Menu</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
