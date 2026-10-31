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
import { FloorMapSvg } from './components/floorplan/FloorMapSvg';
import { IsometricView } from './components/floorplan/IsometricView';
import { RoomCardGrid } from './components/floorplan/RoomCardGrid';
import { RoomDetailModal } from './components/floorplan/RoomDetailModal';
import { IotGpsControlBar } from './components/navigation/IotGpsControlBar';
import { useGps } from './context/GpsContext';
import { BUILDINGS_DATA } from './data/buildingsData';
import { Room, RoomStatus, ViewMode } from './types';
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
  Menu,
  Clock,
  Compass,
  Headphones
} from 'lucide-react';

export const App: React.FC = () => {
  const { isAuthenticated, user, quickLogin, logout } = useAuth();
  const { setTargetRoom, deviceState } = useGps();

  const [buildings, setBuildings] = useState(BUILDINGS_DATA);
  const [activeBuildingId, setActiveBuildingId] = useState<string>('gedung-a');
  const [activeFloorNumber, setActiveFloorNumber] = useState<number>(1);
  // Default to '3d' view so 3D isometric model appears immediately
  const [viewMode, setViewMode] = useState<ViewMode>('3d');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RoomStatus | 'all'>('all');
  
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [activePathRoomId, setActivePathRoomId] = useState<string | null>(null);
  const [recentNotification, setRecentNotification] = useState<string | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [isCsModalOpen, setIsCsModalOpen] = useState<boolean>(false);

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
      } else if (event.type === 'NEW_BOOKING_CREATED') {
        const { booking } = event.data;
        setBuildings(prev =>
          prev.map(b => ({
            ...b,
            floors: b.floors.map(f => ({
              ...f,
              rooms: f.rooms.map(r => {
                if (r.id === booking.roomId) {
                  return {
                    ...r,
                    status: 'reserved',
                    schedule: [
                      ...r.schedule,
                      {
                        id: booking.id,
                        title: booking.purpose,
                        organizer: booking.userName,
                        timeRange: `${booking.startTime} - ${booking.endTime}`,
                        type: 'Reservasi Baru'
                      }
                    ]
                  };
                }
                return r;
              })
            }))
          }))
        );
        setRecentNotification(`[Live Node.js] Peminjaman baru untuk ${booking.roomCode}: ${booking.purpose}`);
        setTimeout(() => setRecentNotification(null), 5000);
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

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const activeBuilding = (buildings && buildings.find(b => b.id === activeBuildingId)) || (buildings && buildings[0]) || BUILDINGS_DATA[0];
  const activeFloor = (activeBuilding && activeBuilding.floors && activeBuilding.floors.find(f => f.floorNumber === activeFloorNumber)) || (activeBuilding && activeBuilding.floors && activeBuilding.floors[0]) || BUILDINGS_DATA[0].floors[0];

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
    setActivePathRoomId(prev => {
      const nextId = prev === roomId ? null : roomId;
      const target = activeBuilding.floors.flatMap(f => f.rooms).find(r => r.id === roomId);
      setTargetRoom(nextId && target ? target : null);
      return nextId;
    });
    if (viewMode !== '2d') {
      setViewMode('2d');
    }
  };

  const handleUpdateRoomStatus = async (roomId: string, newStatus: RoomStatus) => {
    await apiService.updateRoomStatus(roomId, newStatus);

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
    setTargetRoom(room);
    const bldgName = buildingId === 'gedung-a' ? 'LABTEK 1' : 'FT.1';
    setRecentNotification(`Menavigasi ke ${room.code} - ${room.name} (${bldgName}, Tingkat ${floorNumber})`);
    setTimeout(() => setRecentNotification(null), 4000);
    scrollTo3DModel();
  };

  // Quick stats for active floor safely guarded
  const floorRooms = activeFloor?.rooms || [];
  const floorAvailable = floorRooms.filter(r => r.status === 'available').length;
  const floorOccupied = floorRooms.filter(r => r.status === 'occupied').length;
  const floorReserved = floorRooms.filter(r => r.status === 'reserved').length;

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
        quickLogin={quickLogin}
        logout={logout}
        isBackendConnected={isBackendConnected}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenCs={() => setIsCsModalOpen(true)}
      />

      {/* 3. Main Workspace Area (Clean & Simple) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5">
        
        {/* Toast Alert Banner if status updated */}
        {recentNotification && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-slide-up">
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

        {/* 🧭 Panduan Rute Navigasi Aktif (Muncul otomatis dan rapih hanya saat rute jalan aktif) */}
        <IotGpsControlBar />

        {/* Clean, Simple Floor Info & Quick Action Bar */}
        <div className="mb-4 p-3.5 sm:px-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 transition-colors">
          
          {/* Left: Building & Floor Indicator */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Blok {activeBuilding.code} • Tingkat {activeFloorNumber}
            </span>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                {activeFloor.name}
              </h2>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs ml-2 border-l border-slate-200 dark:border-slate-700 pl-3">
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {floorAvailable} Kosong
              </span>
              <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                {floorOccupied} Terisi
              </span>
              {floorReserved > 0 && (
                <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  {floorReserved} Reservasi
                </span>
              )}
            </div>

            {/* Subtle live location indicator without any bulky IoT menu */}
            {deviceState && (
              <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 ml-1 border-l border-slate-200 dark:border-slate-700 pl-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Posisi: <strong className="text-slate-700 dark:text-slate-200">{deviceState.nearestBeacon?.zone || 'Lobby Utama'}</strong></span>
              </div>
            )}
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Pill */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 font-medium hidden md:inline">Filter:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as RoomStatus | 'all')}
                className="px-2.5 py-1 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="available">Tersedia Saja</option>
                <option value="occupied">Sedang Kuliah</option>
                <option value="reserved">Reservasi</option>
                <option value="maintenance">Servis</option>
              </select>
            </div>

            {/* Quick Open Menu Button */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-800 dark:hover:text-emerald-300 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <Menu className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Menu Lengkap</span>
            </button>
          </div>

        </div>

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
            />
          </div>
        )}

        {viewMode === '3d' && (
          <IsometricView
            building={activeBuilding}
            activeFloorNumber={activeFloorNumber}
            onSelectFloor={(num) => setActiveFloorNumber(num)}
            onSelectRoom={(room) => setSelectedRoom(room)}
          />
        )}

        {viewMode === 'list' && (
          <RoomCardGrid
            rooms={activeFloor.rooms}
            selectedRoom={selectedRoom}
            onSelectRoom={setSelectedRoom}
            onNavigateRoom={(room) => {
              setSelectedRoom(room);
              setActivePathRoomId(room.id);
              setTargetRoom(room);
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
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">Klik untuk lihat agenda & reservasi</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {floorRooms.map((room) => {
              const isSelected = selectedRoom?.id === room.id;
              const isAvail = room.status === 'available';
              const isOcc = room.status === 'occupied';
              const isRes = room.status === 'reserved';
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
                    <span className={`w-2 h-2 rounded-full ${
                      isAvail ? 'bg-emerald-500' :
                      isOcc ? 'bg-rose-500' :
                      isRes ? 'bg-amber-500' : 'bg-slate-400'
                    }`} />
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

      {/* 🎧 Floating Customer Service (CS) & Pengaduan Button */}
      <button
        type="button"
        onClick={() => setIsCsModalOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-700/30 transition-all hover:scale-105 active:scale-95 cursor-pointer group border border-white/20"
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

      {/* Minimalist Clean Footer */}
      <Footer />
    </div>
  );
};
