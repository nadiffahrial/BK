import React from 'react';
import { ThemeToggle } from '../common/ThemeToggle';
import unsilLogo from '../../assets/logo-unsil.png';
import { 
  Building, 
  Floor, 
  Room, 
  RoomStatus, 
  ViewMode, 
  User 
} from '../../types';
import { 
  X, 
  Building2, 
  Layers, 
  Box, 
  ListFilter, 
  SlidersHorizontal, 
  Search, 
  Bell, 
  UserCheck, 
  LogOut, 
  ShieldCheck, 
  CheckCircle2, 
  Server, 
  MapPin, 
  Clock, 
  Users, 
  GraduationCap, 
  Microscope, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  ChevronRight,
  Compass,
  Headphones
} from 'lucide-react';

interface NavigationMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  buildings: Building[];
  activeBuildingId: string;
  onSelectBuilding: (buildingId: string) => void;
  activeFloorNumber: number;
  onSelectFloor: (floorNumber: number) => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  statusFilter: RoomStatus | 'all';
  onStatusFilterChange: (filter: RoomStatus | 'all') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectRoomById: (roomId: string) => void;
  user: User | null;
  quickLogin: (role: User['role']) => void;
  logout: () => void;
  isBackendConnected: boolean;
  onOpenSearch?: () => void;
  onOpenCs?: () => void;
}

export const NavigationMenuDrawer: React.FC<NavigationMenuDrawerProps> = ({
  isOpen,
  onClose,
  buildings,
  activeBuildingId,
  onSelectBuilding,
  activeFloorNumber,
  onSelectFloor,
  viewMode,
  onChangeViewMode,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchChange,
  onSelectRoomById,
  user,
  quickLogin,
  logout,
  isBackendConnected,
  onOpenSearch,
  onOpenCs
}) => {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeBuilding = buildings.find(b => b.id === activeBuildingId) || buildings[0];
  const allRoomsInActiveBuilding = activeBuilding.floors.flatMap(f => f.rooms);
  const availableRooms = allRoomsInActiveBuilding.filter(r => r.status === 'available').length;
  const occupiedRooms = allRoomsInActiveBuilding.filter(r => r.status === 'occupied').length;
  const reservedRooms = allRoomsInActiveBuilding.filter(r => r.status === 'reserved').length;

  const searchResults = searchQuery.trim().length > 1
    ? buildings.flatMap(b =>
        b.floors.flatMap(f =>
          f.rooms
            .filter(r => 
              r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
              r.description.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map(r => ({ ...r, buildingName: b.name, buildingCode: b.code }))
        )
      ).slice(0, 4)
    : [];

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">ADMIN UNIVERSITAS</span>;
      case 'staff':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300">DOSEN / STAFF</span>;
      case 'student':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800 border border-green-300">MAHASISWA</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">TAMU</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop with blur */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-emerald-100 dark:border-slate-800 flex flex-col justify-between animate-slide-left text-slate-800 dark:text-slate-100 transition-colors">
          
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-emerald-50/70 dark:from-slate-800/80 via-white dark:via-slate-900 to-slate-50 dark:to-slate-800/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center shrink-0">
                <img
                  src={unsilLogo}
                  alt="Logo Universitas Siliwangi"
                  className="w-10 h-10 object-contain drop-shadow-xs"
                />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                  Universitas Siliwangi
                </h2>
                <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  SmartCampus3D • LABTEK 1 & FT.1
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {/* 1. Quick Search Inside Menu */}
            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
                Pencarian Cepat Ruangan
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Ketik nama / kode ruang (mis: A-101, Lab, Skripsi)..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>

              {/* Search Suggestions */}
              {searchResults.length > 0 && (
                <div className="mt-2 space-y-1 bg-emerald-50/50 p-2 rounded-xl border border-emerald-100">
                  {searchResults.map(room => (
                    <button
                      key={room.id}
                      onClick={() => {
                        onSelectBuilding(room.buildingId);
                        onSelectFloor(room.floorNumber);
                        onSelectRoomById(room.id);
                        onClose();
                      }}
                      className="w-full text-left p-2 rounded-lg bg-white hover:bg-emerald-100/70 border border-slate-200/60 transition-all flex items-center justify-between text-xs cursor-pointer group"
                    >
                      <div>
                        <span className="font-mono font-bold text-emerald-800 mr-2">{room.code}</span>
                        <span className="font-semibold text-slate-700 group-hover:text-emerald-900">{room.name}</span>
                        <div className="text-[10px] text-slate-400">Tingkat {room.floorNumber} • Gedung {room.buildingCode}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-transform" />
                    </button>
                  ))}
                </div>
              )}

              {/* Spotlight Search Engine Shortcut */}
              {onOpenSearch && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenSearch();
                  }}
                  className="mt-2.5 w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>Search Engine Lengkap</span>
                  </div>
                  <kbd className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">Ctrl+K</kbd>
                </button>
              )}

              {/* Layanan CS & Pengaduan Kampus Shortcut */}
              {onOpenCs && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenCs();
                  }}
                  className="mt-2 w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 hover:text-emerald-800 dark:hover:text-emerald-300 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span>Layanan CS & Pengaduan Kampus</span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                    Online
                  </span>
                </button>
              )}
            </div>

            {/* 2. Switch Building (2 Gedung Universitas) */}
            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2.5">
                Pilihan Gedung Universitas (2 Gedung)
              </label>
              <div className="space-y-2">
                {buildings.slice(0, 2).map((b) => {
                  const isActive = b.id === activeBuildingId;
                  const isGedungA = b.code === 'A';
                  return (
                    <button
                      key={b.id}
                      onClick={() => {
                        onSelectBuilding(b.id);
                        onChangeViewMode('3d');
                        onClose();
                      }}
                      className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between group ${
                        isActive
                          ? 'bg-emerald-50/90 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-800'
                        }`}>
                          {isGedungA ? <GraduationCap className="w-4 h-4" /> : <Microscope className="w-4 h-4" />}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                              Blok {b.code}
                            </span>
                            <span className="font-extrabold text-xs text-slate-900">
                              {b.shortName}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{b.tagline}</p>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {isActive ? 'Aktif' : 'Pilih'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Switch Floor (Tingkat 1 & Tingkat 2) */}
            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2.5">
                Pilihan Tingkat Lantai ({activeBuilding.shortName})
              </label>
              <div className="grid grid-cols-2 gap-2">
                {activeBuilding.floors.map((fl) => {
                  const isSelected = fl.floorNumber === activeFloorNumber;
                  return (
                    <button
                      key={fl.floorNumber}
                      onClick={() => onSelectFloor(fl.floorNumber)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                          : 'bg-white hover:bg-emerald-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          LT {fl.floorNumber}
                        </span>
                        <span className={`text-[10px] font-bold ${isSelected ? 'text-emerald-100' : 'text-emerald-700'}`}>
                          {fl.rooms.length} Ruang
                        </span>
                      </div>
                      <div className="font-extrabold text-xs">
                        Tingkat {fl.floorNumber}
                      </div>
                      <div className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                        {fl.name.replace(/Lantai \d - /, '')}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Switch View Mode (2D / 3D / Direktori) */}
            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2.5">
                Mode Tampilan Visual
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onChangeViewMode('2d')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    viewMode === '2d'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span className="text-xs font-bold">2D Denah</span>
                </button>

                <button
                  onClick={() => onChangeViewMode('3d')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    viewMode === '3d'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <Box className="w-4 h-4" />
                  <span className="text-xs font-bold">3D Isometrik</span>
                </button>

                <button
                  onClick={() => onChangeViewMode('list')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    viewMode === 'list'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <ListFilter className="w-4 h-4" />
                  <span className="text-xs font-bold">Direktori</span>
                </button>
              </div>
            </div>

            {/* 5. Filter Status Ruangan */}
            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2.5">
                Filter Status Ketersediaan Ruang
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: 'Semua Status' },
                  { id: 'available', label: 'Tersedia', dot: 'bg-emerald-500' },
                  { id: 'occupied', label: 'Kuliah/Terisi', dot: 'bg-rose-500' },
                  { id: 'reserved', label: 'Reservasi', dot: 'bg-amber-500' },
                  { id: 'maintenance', label: 'Servis', dot: 'bg-slate-400' }
                ].map(item => {
                  const isFilterActive = statusFilter === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onStatusFilterChange(item.id as RoomStatus | 'all')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isFilterActive
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.dot && <span className={`w-2 h-2 rounded-full ${item.dot}`} />}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. Quick Stats Summary */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Ringkasan {activeBuilding.shortName}
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                  {allRoomsInActiveBuilding.length} Ruang Total
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs mt-3">
                <div className="p-2 rounded-xl bg-white border border-emerald-100 shadow-xs">
                  <div className="text-emerald-700 font-extrabold text-sm">{availableRooms}</div>
                  <div className="text-[10px] text-slate-500 font-medium">Kosong</div>
                </div>
                <div className="p-2 rounded-xl bg-white border border-rose-100 shadow-xs">
                  <div className="text-rose-600 font-extrabold text-sm">{occupiedRooms}</div>
                  <div className="text-[10px] text-slate-500 font-medium">Terisi</div>
                </div>
                <div className="p-2 rounded-xl bg-white border border-amber-100 shadow-xs">
                  <div className="text-amber-600 font-extrabold text-sm">{reservedRooms}</div>
                  <div className="text-[10px] text-slate-500 font-medium">Reservasi</div>
                </div>
              </div>
            </div>

            {/* 7. Profil Civitas & Switch Role */}
            <div className="pt-2 border-t border-slate-100">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
                Profil Pengguna & Ganti Peran
              </label>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 mb-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center font-bold text-sm text-white shrink-0">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user?.name.charAt(0) || 'U'}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-extrabold text-slate-900 truncate">{user?.name}</div>
                  <div className="text-[10px] text-slate-500 truncate">{user?.department}</div>
                  <div className="mt-1">{getRoleBadge(user?.role)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {(['admin', 'staff', 'student', 'guest'] as const).map(role => (
                  <button
                    key={role}
                    onClick={() => quickLogin(role)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer text-left ${
                      user?.role === role
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {role === 'staff' ? 'Dosen' : role}
                  </button>
                ))}
              </div>
            </div>

            {/* 8. Mode Tampilan (Dark / Light Mode) */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between transition-colors">
              <div>
                <div className="font-extrabold text-slate-800 dark:text-slate-100 text-xs">Tema Antarmuka</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Pilih Mode Terang atau Gelap</div>
              </div>
              <ThemeToggle variant="switch" />
            </div>

            {/* 9. Server & Database Status */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between transition-colors">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="font-bold text-slate-800 text-[11px]">MySQL XAMPP & Node.js</div>
                  <div className="text-[10px] text-slate-500">Database: smartspace_db (3306)</div>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                isBackendConnected
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {isBackendConnected ? 'Online' : 'Offline'}
              </span>
            </div>

          </div>

          {/* Drawer Footer with Logout */}
          <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between gap-3">
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer w-full justify-center"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar (Logout)</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

