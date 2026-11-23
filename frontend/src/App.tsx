import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { Navbar } from './components/layout/Navbar';
import { NavigationMenuDrawer } from './components/layout/NavigationMenuDrawer';
import { Footer } from './components/layout/Footer';
import { BuildingCardSelector } from './components/layout/BuildingCardSelector';
import { StudentRoomFinder } from './components/common/StudentRoomFinder';
import { SearchEngineModal } from './components/common/SearchEngineModal';
import { CustomerServiceModal } from './components/common/CustomerServiceModal';
import { UserGuideModal } from './components/common/UserGuideModal';
import { PanoramaRoomsModal } from './components/common/PanoramaRoomsModal';
import { RoomPanoramaModal } from './components/floorplan/RoomPanoramaModal';
import { FloorMapSvg } from './components/floorplan/FloorMapSvg';
import { IsometricView } from './components/floorplan/IsometricView';
import { Campus3DBuildingViewer } from './components/floorplan/Campus3DBuildingViewer';
import { RoomCardGrid } from './components/floorplan/RoomCardGrid';
import { RoomDetailModal } from './components/floorplan/RoomDetailModal';
import { MobileRotateDisplay } from './components/common/MobileRotateDisplay';
import { BUILDINGS_DATA } from './data/buildingsData';
import { CsTicket, Room, RoomStatus, ViewMode } from './types';
import { apiService } from './services/api';
import { 
  Building2, 
  MapPin, 
  Layers, 
  Box, 
  ListFilter,
  CheckCircle2,
  Sparkles,
  Server,
  SlidersHorizontal,
  Clock,
  Compass,
  Headphones,
  BookOpen,
  TicketCheck,
  Wrench,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';

export const App: React.FC = () => {
  const { isAuthenticated, user, token, logout } = useAuth();

  const [buildings, setBuildings] = useState(BUILDINGS_DATA);
  const [activeBuildingId, setActiveBuildingId] = useState<string>('gedung-a');
  const [activeFloorNumber, setActiveFloorNumber] = useState<number>(1);
  // Default to '3d' view so 3D isometric model appears immediately
  const [viewMode, setViewMode] = useState<ViewMode>('3d');
  // Sub-mode untuk tampilan 3D: 'building' (eksterior bangunan 3D Three.js) atau 'floorplan' (denah lantai isometrik)
  const [view3DSubMode, setView3DSubMode] = useState<'building' | 'floorplan'>('floorplan');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RoomStatus | 'all'>('all');
  
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [activePathRoomId, setActivePathRoomId] = useState<string | null>(null);
  const [recentNotification, setRecentNotification] = useState<string | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [isCsModalOpen, setIsCsModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);
  const [isPanoramaModalOpen, setIsPanoramaModalOpen] = useState<boolean>(false);
  const [directPanoramaRoom, setDirectPanoramaRoom] = useState<Room | null>(null);
  const [adminTickets, setAdminTickets] = useState<CsTicket[]>([]);
  const [isLoadingAdminTickets, setIsLoadingAdminTickets] = useState(false);
  const isAdmin = isAuthenticated && (user?.role === 'admin' || user?.role === 'super_admin');

  // Global shortcut Ctrl+K or Cmd+K to open Search Engine modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isAdmin || !token) {
      setAdminTickets([]);
      return;
    }
    let active = true;
    setIsLoadingAdminTickets(true);
    apiService.getCsTickets(undefined, undefined, token)
      .then(tickets => { if (active) setAdminTickets(tickets); })
      .catch(error => console.warn('Ringkasan tiket admin gagal dimuat:', error))
      .finally(() => { if (active) setIsLoadingAdminTickets(false); });
    return () => { active = false; };
  }, [isAdmin, token, isCsModalOpen]);

  // Load buildings from Node.js backend on mount
  useEffect(() => {
    let isMounted = true;
    apiService.checkHealth().then(connected => {
      if (isMounted) setIsBackendConnected(connected);
    });

    apiService.getBuildings().then(data => {
      if (isMounted && data && data.length > 0) {
        setBuildings(data);
      }
    });

    // Subscribe to SSE real-time events from Node.js backend
    const unsubscribe = apiService.subscribeToEvents((event) => {
      if (event.type === 'ROOM_STATUS_UPDATED') {
        const { roomId, newStatus, roomCode } = event.data;
        setBuildings(prev =>
          prev.map(b => ({
            ...b,
            floors: b.floors.map(f => ({
              ...f,
              rooms: f.rooms.map(r => r.id === roomId ? { ...r, status: newStatus } : r)
            }))
          }))
        );
        setSelectedRoom(prev => {
          if (prev && prev.id === roomId) {
            return { ...prev, status: newStatus as RoomStatus };
          }
          return prev;
        });
        setRecentNotification(`[Live Node.js] Status ${roomCode} diperbarui ke '${newStatus}'.`);
        setTimeout(() => setRecentNotification(null), 4000);
      } else if (event.type === 'NEW_CS_TICKET') {
        const { ticket, message } = event.data;
        setRecentNotification(`🎧 [Layanan CS] ${message || `Tiket #${ticket?.id} diterima!`}`);
        setTimeout(() => setRecentNotification(null), 6000);
      } else if (event.type === 'CS_STATUS_UPDATED') {
        const { message } = event.data;
        setRecentNotification(`🎧 [Layanan CS] ${message}`);
        setTimeout(() => setRecentNotification(null), 6000);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const activeBuilding = (buildings && buildings.find(b => b.id === activeBuildingId)) || (buildings && buildings[0]) || BUILDINGS_DATA[0];
  const activeFloor = (activeBuilding && activeBuilding.floors && activeBuilding.floors.find(f => f.floorNumber === activeFloorNumber)) || (activeBuilding && activeBuilding.floors && activeBuilding.floors[0]) || BUILDINGS_DATA[0].floors[0];
  const floorRooms = activeFloor?.rooms || [];
  const allRooms = buildings.flatMap(building => building.floors.flatMap(floor => floor.rooms));
  const roomStatusCounts = {
    available: allRooms.filter(room => room.status === 'available').length,
    occupied: allRooms.filter(room => room.status === 'occupied').length,
    reserved: allRooms.filter(room => room.status === 'reserved').length,
    maintenance: allRooms.filter(room => room.status === 'maintenance').length
  };
  const activeCsTickets = adminTickets.filter(ticket => ticket.status !== 'resolved').length;

  const openRoomOperations = (status: RoomStatus | 'all' = 'all') => {
    setStatusFilter(status);
    setViewMode('list');
    window.setTimeout(() => document.getElementById('room-operations')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const scrollTo3DModel = () => {
    const tryScroll = () => {
      const el = document.getElementById('isometric-3d-model-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return true;
      }
      return false;
    };

    if (!tryScroll()) {
      setTimeout(tryScroll, 100);
    }
  };

  const handleSelectBuilding = (buildingId: string) => {
    setActiveBuildingId(buildingId);
    // ⭐ Langsung beralih ke Model 3D Isometrik saat tap button gedung!
    setViewMode('3d');
    setActivePathRoomId(null);
    setSelectedRoom(null);
    scrollTo3DModel();
  };

  const handleSelectFloor = (floorNumber: number) => {
    setActiveFloorNumber(floorNumber);
    setActivePathRoomId(null);
    // ⭐ Memastikan tampilan beralih ke denah 3D
    setViewMode('3d');
    scrollTo3DModel();
  };

  const handleChangeViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    if (mode === '3d') {
      scrollTo3DModel();
    }
  };

  const handleSelectRoomById = (roomId: string) => {
    const targetRoom = activeBuilding.floors
      .flatMap(f => f.rooms)
      .find(r => r.id === roomId);
    if (targetRoom) {
      setSelectedRoom(targetRoom);
    }
  };

  const handleTogglePathGuide = (roomId: string) => {
    setActivePathRoomId(prev => prev === roomId ? null : roomId);
    if (viewMode !== '2d') {
      setViewMode('2d');
    }
  };

  const handleUpdateRoomStatus = async (roomId: string, newStatus: RoomStatus) => {
    if (!token) {
      throw new Error('Sesi administrator tidak ditemukan. Silakan login kembali.');
    }

    await apiService.updateRoomStatus(roomId, newStatus, token);

    setBuildings(prevBuildings =>
      prevBuildings.map(b => ({
        ...b,
        floors: b.floors.map(f => ({
          ...f,
          rooms: f.rooms.map(r => {
            if (r.id === roomId) {
              const updated = { ...r, status: newStatus };
              if (selectedRoom?.id === roomId) {
                setSelectedRoom(updated);
              }
              return updated;
            }
            return r;
          })
        }))
      }))
    );

    setRecentNotification(`Status ${roomId.toUpperCase()} berhasil diubah ke '${newStatus}'.`);
    setTimeout(() => setRecentNotification(null), 4000);
  };

  const handleNavigateFromSearch = (buildingId: string, floorNumber: number, room: Room) => {
    setActiveBuildingId(buildingId);
    setActiveFloorNumber(floorNumber);
    setViewMode('3d');
    setSelectedRoom(room);
    setActivePathRoomId(room.id);
    const bldgName = buildingId === 'gedung-a' ? 'LABTEK 1' : 'FT.1';
    setRecentNotification(`Menavigasi ke ${room.code} - ${room.name} (${bldgName}, Tingkat ${floorNumber})`);
    setTimeout(() => setRecentNotification(null), 4000);
    scrollTo3DModel();
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-300">
      
      {/* 1. Sleek Modern Navbar with Dedicated Menu Button & Search Trigger */}
      <Navbar
        buildings={buildings}
        activeBuildingId={activeBuildingId}
        onSelectBuilding={handleSelectBuilding}
        activeFloorNumber={activeFloorNumber}
        onSelectFloor={handleSelectFloor}
        viewMode={viewMode}
        onChangeViewMode={handleChangeViewMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onSelectRoomById={handleSelectRoomById}
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenGuide={() => setIsGuideModalOpen(true)}
        onOpenPanoramaRooms={() => setIsPanoramaModalOpen(true)}
      />

      {/* 2. Slide-over Navigation Menu Drawer */}
      <NavigationMenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        buildings={buildings}
        activeBuildingId={activeBuildingId}
        onSelectBuilding={(id) => handleSelectBuilding(id)}
        activeFloorNumber={activeFloorNumber}
        onSelectFloor={(num) => handleSelectFloor(num)}
        viewMode={viewMode}
        onChangeViewMode={handleChangeViewMode}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectRoomById={handleSelectRoomById}
        user={user}
        onLoginClick={() => setShowLogin(true)}
        logout={logout}
        isBackendConnected={isBackendConnected}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenCs={() => setIsCsModalOpen(true)}
        onOpenGuide={() => setIsGuideModalOpen(true)}
        onOpenPanoramaRooms={() => setIsPanoramaModalOpen(true)}
      />

      {/* 3. Main Workspace Area (Clean & Simple) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5">

        {isAdmin && (
          <section className="mb-7 overflow-hidden rounded-[28px] border border-slate-800 bg-slate-950 text-white shadow-xl shadow-slate-900/10">
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-900 px-5 py-6 sm:px-8 sm:py-8">
              <div className="absolute -right-16 -top-28 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-white/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-200">
                    <ShieldCheck className="h-3.5 w-3.5" /> Konsol Pengelola Kampus
                  </div>
                  <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Selamat datang, {user?.name?.split(' ')[0]}</h1>
                  <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-300 sm:text-sm">Pantau kondisi ruang dan tangani laporan pengunjung dari satu tempat.</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-bold">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${isBackendConnected ? 'bg-emerald-400/15 text-emerald-200' : 'bg-amber-400/15 text-amber-200'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${isBackendConnected ? 'bg-emerald-300' : 'bg-amber-300'}`} />
                      Backend {isBackendConnected ? 'terhubung' : 'offline'}
                    </span>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-slate-300">{user?.department || 'Administrator'}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setIsCsModalOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-xs font-extrabold text-slate-950 transition hover:bg-emerald-300">
                    <TicketCheck className="h-4 w-4" /> Buka antrean CS
                    <span className="rounded-full bg-slate-950/15 px-1.5 py-0.5 text-[10px]">{isLoadingAdminTickets ? '…' : activeCsTickets}</span>
                  </button>
                  <button type="button" onClick={() => openRoomOperations()} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/15">
                    <Wrench className="h-4 w-4" /> Kelola status ruang
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-y divide-slate-800 sm:grid-cols-4 sm:divide-y-0">
              {[
                { label: 'Total ruang', value: allRooms.length, hint: 'di seluruh gedung', status: 'all' as const, color: 'text-white' },
                { label: 'Tersedia', value: roomStatusCounts.available, hint: 'siap digunakan', status: 'available' as const, color: 'text-emerald-300' },
                { label: 'Sedang digunakan', value: roomStatusCounts.occupied, hint: 'ruang terisi', status: 'occupied' as const, color: 'text-rose-300' },
                { label: 'Perlu servis', value: roomStatusCounts.maintenance, hint: 'pemeliharaan', status: 'maintenance' as const, color: 'text-amber-300' }
              ].map(item => (
                <button key={item.label} type="button" onClick={() => openRoomOperations(item.status)} className="p-4 text-left transition hover:bg-white/5 sm:px-6">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</div>
                  <div className={`mt-1 text-2xl font-black ${item.color}`}>{item.value}</div>
                  <div className="text-[10px] text-slate-500">{item.hint}</div>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-slate-800 px-4 py-3 text-[10px] text-slate-400 sm:px-6">
              <span>{activeCsTickets} tiket CS masih perlu ditangani</span>
              <button type="button" disabled={isLoadingAdminTickets || !token} onClick={() => {
                if (!token) return;
                setIsLoadingAdminTickets(true);
                apiService.getCsTickets(undefined, undefined, token).then(setAdminTickets).catch(error => setRecentNotification(error.message)).finally(() => setIsLoadingAdminTickets(false));
              }} className="inline-flex items-center gap-1.5 font-bold text-emerald-300 hover:text-emerald-200 disabled:opacity-50">
                <RefreshCw className={`h-3 w-3 ${isLoadingAdminTickets ? 'animate-spin' : ''}`} /> Segarkan ringkasan
              </button>
            </div>
          </section>
        )}
        
        {/* Toast Alert Banner if status updated */}
        {recentNotification && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-md animate-modal-spring border border-emerald-300 dark:border-emerald-700/60">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{recentNotification}</span>
            </div>
            <button
              onClick={() => setRecentNotification(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {isAdmin && (
          <div id="room-operations" className="mb-3 scroll-mt-20 flex items-end justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-700">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">Operasional Kampus</div>
              <h2 className="mt-1 text-lg font-black text-slate-900 dark:text-white">Peta dan pengelolaan ruang</h2>
            </div>
            <span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 sm:inline-flex">{activeBuilding.shortName} · Tingkat {activeFloorNumber}</span>
          </div>
        )}

        {/* Student Room Finder Bar (Mempermudah Mahasiswa Menemukan Ruangan Cepat) */}
        <StudentRoomFinder
          buildings={buildings}
          onSelectRoom={handleNavigateFromSearch}
          onOpenSearchEngine={() => setIsSearchModalOpen(true)}
        />

        {/* Dual Building Buttons (Gedung A & Gedung B) */}
        <BuildingCardSelector
          buildings={buildings}
          activeBuildingId={activeBuildingId}
          onSelectBuilding={handleSelectBuilding}
          activeFloorNumber={activeFloorNumber}
          onSelectFloor={handleSelectFloor}
          onSelectRoom={(room) => setSelectedRoom(room)}
        />

        {/* 📱 Fitur Display Rotate Horizontal di Mobile (Banner, FAB, & Fullscreen Landscape) */}
        <MobileRotateDisplay
          building={activeBuilding}
          activeFloorNumber={activeFloorNumber}
          onSelectFloor={handleSelectFloor}
          viewMode={viewMode}
          onChangeViewMode={handleChangeViewMode}
          selectedRoom={selectedRoom}
          onSelectRoom={(room) => setSelectedRoom(room)}
        />

        {/* 4. Interactive Visual Stage */}
        {viewMode === '2d' && (
          <div className="space-y-4">
            <FloorMapSvg
              floor={activeFloor}
              selectedRoom={selectedRoom}
              onSelectRoom={setSelectedRoom}
              statusFilter={statusFilter}
              activePathRoomId={activePathRoomId}
              onTogglePathGuide={handleTogglePathGuide}
              onOpen3dView={() => handleChangeViewMode('3d')}
            />
          </div>
        )}

        {viewMode === '3d' && (
          <div className="space-y-4">
            {/* 🏛️ Sub-Mode Selector: Model Bangunan 3D Eksterior vs Denah Lantai Isometrik */}
            <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 max-w-lg mx-auto shadow-xs">
              <button
                onClick={() => setView3DSubMode('building')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  view3DSubMode === 'building'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 ring-1 ring-emerald-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Model Bangunan 3D</span>
                <span className="text-[10px] opacity-80">(LABTEK 1 & FT.1)</span>
              </button>

              <button
                onClick={() => setView3DSubMode('floorplan')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  view3DSubMode === 'floorplan'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 ring-1 ring-emerald-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Denah Lantai Isometrik</span>
                <span className="text-[10px] opacity-80">(Tingkat 1 & 2)</span>
              </button>
            </div>

            {view3DSubMode === 'building' ? (
              <Campus3DBuildingViewer
                buildings={buildings}
                activeBuildingId={activeBuildingId}
                onSelectBuilding={(id) => handleSelectBuilding(id)}
                activeFloorNumber={activeFloorNumber}
                onSelectFloor={(num) => {
                  handleSelectFloor(num);
                  setView3DSubMode('floorplan');
                }}
                onSelectRoom={(room) => setSelectedRoom(room)}
                onSwitchToFloorPlan={() => setView3DSubMode('floorplan')}
              />
            ) : (
              <IsometricView
                building={activeBuilding}
                activeFloorNumber={activeFloorNumber}
                onSelectFloor={(num) => setActiveFloorNumber(num)}
                onSelectRoom={(room) => setSelectedRoom(room)}
                selectedRoom={selectedRoom}
                onChangeViewMode={handleChangeViewMode}
                onSwitchToBuildingView={() => setView3DSubMode('building')}
              />
            )}
          </div>
        )}

        {viewMode === 'list' && (
          <RoomCardGrid
            rooms={isAdmin ? allRooms : activeFloor.rooms}
            selectedRoom={selectedRoom}
            onSelectRoom={setSelectedRoom}
            statusFilter={statusFilter}
            onNavigateRoom={(room) => {
              setSelectedRoom(room);
              setActiveBuildingId(room.buildingId);
              setActiveFloorNumber(room.floorNumber);
              setActivePathRoomId(room.id);
            }}
          />
        )}

        {/* 5. Clean Horizontal Quick-Select Strip for the 6 Rooms */}
        <div className="mt-4 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 shadow-xs transition-colors">
          <div className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Pilih Cepat Ruangan di Tingkat {activeFloorNumber}:
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">Klik untuk lihat agenda kegiatan ruangan</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {floorRooms.map((room) => {
              const isSelected = selectedRoom?.id === room.id;
              return (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className={`p-2 rounded-xl text-left transition-all cursor-pointer border flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-600 dark:border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                      : 'bg-slate-50/70 dark:bg-slate-800/60 hover:bg-emerald-50/50 dark:hover:bg-slate-700/80 border-slate-200/80 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] font-extrabold text-slate-800 dark:text-slate-100">
                      {room.code}
                    </span>
                    <span className="text-[9px] font-semibold text-slate-400">
                      {room.capacity} krs
                    </span>
                  </div>
                  <div className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 truncate">
                    {room.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </main>

      {/* Room Detail Modal / Drawer */}
      {selectedRoom && (
        <RoomDetailModal
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
          onTogglePathGuide={handleTogglePathGuide}
          isPathActive={activePathRoomId === selectedRoom.id}
          onUpdateRoomStatus={handleUpdateRoomStatus}
        />
      )}

      {/* Universal Search Engine Modal (Spotlight Ctrl+K) */}
      <SearchEngineModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        buildings={buildings}
        onNavigateToRoom={handleNavigateFromSearch}
      />

            {/* 📖 Floating Panduan Pengguna Button */}
      <button
        type="button"
        onClick={() => setIsGuideModalOpen(true)}
        className="smooth-btn fixed bottom-5 right-36 sm:right-40 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-md hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-extrabold text-xs shadow-lg shadow-slate-900/10 dark:shadow-black/40 hover:shadow-emerald-500/20 hover:-translate-y-1 active:translate-y-0.5 cursor-pointer group border border-emerald-200/90 dark:border-slate-700"
        title="Buka Buku Panduan Pengguna (F1 / ?)"
      >
        <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
        <span className="inline font-bold">Panduan</span>
        <kbd className="hidden md:inline text-[9px] font-mono bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-600">
          F1
        </kbd>
      </button>

      {/* 🎧 Floating Customer Service (CS) & Pengaduan Button */}
      <button
        type="button"
        onClick={() => setIsCsModalOpen(true)}
        className="smooth-btn fixed bottom-5 right-5 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-700/35 hover:shadow-emerald-600/50 hover:-translate-y-1 active:translate-y-0.5 cursor-pointer group border border-white/25"
        title="Buka Layanan CS & Pengaduan Kampus"
      >
        <Headphones className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
        <span className="hidden sm:inline">Layanan CS</span>
        <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
      </button>

      {/* Modal Layanan Customer Service (CS) & Pengaduan Kampus */}
      <CustomerServiceModal
        isOpen={isCsModalOpen}
        onClose={() => setIsCsModalOpen(false)}
        isBackendConnected={isBackendConnected}
        onNotificationSent={(msg) => {
          setRecentNotification(`🎧 [Layanan CS] ${msg}`);
          setTimeout(() => setRecentNotification(null), 5000);
        }}
      />

            {/* 📖 Modal Buku Panduan Pengguna Interaktif */}
      <UserGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenCs={() => setIsCsModalOpen(true)}
      />

      {/* 🌐 Modal Menu Katalog Ruangan Berfitur 360° */}
      <PanoramaRoomsModal
        isOpen={isPanoramaModalOpen}
        onClose={() => setIsPanoramaModalOpen(false)}
        buildings={buildings}
        onOpenPanorama={(room) => setDirectPanoramaRoom(room)}
        onNavigateToRoom={(bId, fNum, r) => handleNavigateFromSearch(bId, fNum, r)}
        onOpenCs={() => setIsCsModalOpen(true)}
      />

      {/* 🌐 Direct Fullscreen 360 Panorama Modal */}
      {directPanoramaRoom && (
        <RoomPanoramaModal
          room={directPanoramaRoom}
          isOpen={Boolean(directPanoramaRoom)}
          onClose={() => setDirectPanoramaRoom(null)}
        />
      )}

      {/* Minimalist Clean Footer */}
              <Footer onOpenGuide={() => setIsGuideModalOpen(true)} />

      {/* Login Administrator */}
      {showLogin && (
        <LoginPage
          onClose={() => setShowLogin(false)}
        />
      )}
    </div>
  );
};
