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
import { CAMPUS_MODEL_LABELS } from './data/campusModelLabels';
import { Building, CsTicket, Room, RoomStatus, ViewMode } from './types';
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
  ShieldCheck,
  LayoutDashboard,
  ClipboardList,
  LogOut,
  CalendarDays,
  Users
} from 'lucide-react';
import { CampusLogo } from './components/common/CampusLogo';
import { ThemeToggle } from './components/common/ThemeToggle';
import { AdminWorkspace } from './components/layout/AdminWorkspace';

export const App: React.FC = () => {
  const { isAuthenticated, user, token, logout } = useAuth();

  const [buildings, setBuildings] = useState(BUILDINGS_DATA);
  const [campusModelLabels, setCampusModelLabels] = useState<Record<string, string>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('siloka_campus_model_labels') || '{}') as Record<string, string>;
      const legacyDefaults: Record<string, string> = { 'gedung-a': 'LABTEK 1', 'gedung-b': 'FT.1', 'dekanat-ft': 'DEKANAT FT', 'gedung-ft2': 'FT.2' };
      Object.entries(legacyDefaults).forEach(([id, value]) => {
        if (saved[id] === value) delete saved[id];
      });
      return { ...CAMPUS_MODEL_LABELS, ...saved };
    } catch { return CAMPUS_MODEL_LABELS; }
  });
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
  const [visitCount, setVisitCount] = useState(0);
  const [adminSection, setAdminSection] = useState<'overview' | 'rooms' | 'schedule' | 'admins'>('overview');
  const isAdmin = isAuthenticated && (user?.role === 'admin' || user?.role === 'super_admin');

  useEffect(() => {
    fetch('/api/analytics/visit', { method: 'POST' })
      .then(response => response.ok ? response.json() : Promise.reject(new Error('Analytics unavailable')))
      .then(data => setVisitCount(Number(data.totalVisits) || 0))
      .catch(() => {
        const count = Number(localStorage.getItem('siloka_visit_count') || 0) + 1;
        localStorage.setItem('siloka_visit_count', String(count));
        setVisitCount(count);
      });
  }, []);

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

    const inventoryKey = (source: Building[]) => source.map(building => building.floors.map(floor => floor.rooms.length).join(',')).join('|');
    const observedInventoryKey = inventoryKey(BUILDINGS_DATA);
    apiService.getAdminBuildings().then(override => {
      if (!isMounted) return;
      let cached: Building[] | null = null;
      try {
        const stored = localStorage.getItem('siloka_admin_buildings');
        cached = stored ? JSON.parse(stored) as Building[] : null;
      } catch { cached = null; }
      const validOverride = override && inventoryKey(override) === observedInventoryKey ? override : null;
      const validCache = cached && inventoryKey(cached) === observedInventoryKey ? cached : null;
      // Ignore old database/browser snapshots whose room counts do not match
      // the directly observed floor plans. Keep the measured inventory fixed.
      const selectedData = validOverride || validCache || BUILDINGS_DATA;
      setBuildings(selectedData);
      localStorage.setItem('siloka_admin_buildings', JSON.stringify(selectedData));
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

  const handleAdminBuildingsChange = (next: typeof buildings) => {
    setBuildings(next);
    localStorage.setItem('siloka_admin_buildings', JSON.stringify(next));
    if (token) apiService.saveAdminBuildings(next, token).catch(error => setRecentNotification(error.message));
  };

  const handleCampusModelLabelsChange = (next: Record<string, string>) => {
    setCampusModelLabels(next);
    localStorage.setItem('siloka_campus_model_labels', JSON.stringify(next));
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
    const shouldScrollTo3D = viewMode === '3d';
    setActiveBuildingId(buildingId);
    // ⭐ Langsung beralih ke Model 3D Isometrik saat tap button gedung!
    setActivePathRoomId(null);
    setSelectedRoom(null);
    if (shouldScrollTo3D) scrollTo3DModel();
  };

  const handleSelectFloor = (floorNumber: number) => {
    const shouldScrollTo3D = viewMode === '3d';
    setActiveFloorNumber(floorNumber);
    setActivePathRoomId(null);
    // ⭐ Memastikan tampilan beralih ke denah 3D
    if (shouldScrollTo3D) scrollTo3DModel();
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

    const nextBuildings = buildings.map(b => ({
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
      }));
    setBuildings(nextBuildings);
    localStorage.setItem('siloka_admin_buildings', JSON.stringify(nextBuildings));
    apiService.saveAdminBuildings(nextBuildings, token).catch(error => console.warn('Gagal menyimpan status ke ringkasan kampus:', error));

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

  const openAdminSection = (section: 'overview' | 'rooms' | 'schedule' | 'admins') => {
    setAdminSection(section);
    window.dispatchEvent(new CustomEvent('admin-section', { detail: section }));
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-300">
      
      {isAdmin && (
        <>
          <aside className="fixed inset-x-0 top-0 z-40 border-b border-emerald-100 bg-white/95 px-4 py-2 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95 md:inset-y-0 md:right-auto md:w-64 md:border-b-0 md:border-r md:px-5 md:py-6">
            <div className="flex items-center justify-between md:h-full md:flex-col md:items-stretch">
              <div className="flex items-center gap-3">
                <CampusLogo size="sm" />
                <div className="leading-tight">
                  <div className="text-sm font-black tracking-tight text-slate-900 dark:text-white">SILOKA</div>
                  <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{user?.role === 'super_admin' ? 'Super Admin' : 'Administrasi kampus'}</div>
                </div>
              </div>
              <nav aria-label="Navigasi admin" className="flex items-center gap-1 md:mt-10 md:flex-col md:items-stretch">
                <button type="button" onClick={() => openAdminSection('overview')} className="inline-flex items-center gap-3 rounded-lg bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-800 transition-colors hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900 md:w-full">
                  <LayoutDashboard className="h-4 w-4" /><span className="hidden md:inline">Ringkasan</span>
                </button>
                <button type="button" onClick={() => openAdminSection('rooms')} className="inline-flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-emerald-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-emerald-300 md:w-full">
                  <ClipboardList className="h-4 w-4" /><span className="hidden md:inline">Ruang & fasilitas</span>
                </button>
                <button type="button" onClick={() => openAdminSection('schedule')} className="inline-flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-emerald-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-emerald-300 md:w-full">
                  <CalendarDays className="h-4 w-4" /><span className="hidden md:inline">Jadwal ruangan</span>
                </button>
                <button type="button" onClick={() => setIsCsModalOpen(true)} className="inline-flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-emerald-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-emerald-300 md:w-full"><TicketCheck className="h-4 w-4"/><span className="hidden md:inline">Antrean layanan</span><span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] dark:bg-slate-800">{activeCsTickets}</span></button>
                {user?.role === 'super_admin' && <button type="button" onClick={() => openAdminSection('admins')} className="inline-flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-900 transition-colors hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200 dark:hover:bg-emerald-900 md:w-full"><Users className="h-4 w-4"/><span className="hidden md:inline">Kelola Admin</span></button>}
              </nav>
              <div className="hidden border-t border-slate-200 pt-4 dark:border-slate-800 md:mt-auto md:block">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700 text-sm font-bold text-white">{user?.name?.charAt(0) || 'A'}</div>
                  <div className="min-w-0"><div className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">{user?.name}</div><div className="truncate text-[10px] text-slate-500">{user?.department || 'Administrator'}</div></div>
                </div>
                <div className="flex items-center justify-between"><ThemeToggle showLabel /><button type="button" onClick={logout} aria-label="Keluar" title="Keluar" className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40"><LogOut className="h-4 w-4" /></button></div>
              </div>
            </div>
          </aside>
          <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95 md:hidden">
            <ThemeToggle showLabel={false} size="sm" />
            <button type="button" onClick={logout} className="rounded-lg p-2 text-slate-500 hover:text-rose-600" aria-label="Keluar"><LogOut className="h-4 w-4" /></button>
          </div>
        </>
      )}

      {/* Public navigation */}
      {!isAdmin && <Navbar
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
      />}

      {/* 2. Slide-over Navigation Menu Drawer */}
      {!isAdmin && <NavigationMenuDrawer
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
      />}

      {/* 3. Main Workspace Area (Clean & Simple) */}
      <main className={`flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 ${isAdmin ? 'pt-16 pb-16 md:ml-64 md:pt-6 md:pb-6' : 'pt-5'}`}>

        {isAdmin && <AdminWorkspace buildings={buildings} onBuildingsChange={handleAdminBuildingsChange} campusModelLabels={campusModelLabels} onCampusModelLabelsChange={handleCampusModelLabelsChange} isSuperAdmin={user?.role === 'super_admin'} token={token || ''} onSectionChange={setAdminSection} ticketCount={activeCsTickets} visitCount={visitCount} onOpenTickets={() => setIsCsModalOpen(true)} />}
        {!(isAdmin && adminSection === 'admins') && <>
        
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
          viewMode={viewMode}
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
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Pilih lantai</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Denah 2D {activeBuilding.shortName}</p>
              </div>
              <div className="flex items-center gap-2">
                {activeBuilding.floors.map((floor) => (
                  <button
                    key={floor.floorNumber}
                    type="button"
                    onClick={() => handleSelectFloor(floor.floorNumber)}
                    aria-pressed={activeFloorNumber === floor.floorNumber}
                    className={`rounded-xl border px-4 py-2 text-sm font-bold transition-colors ${activeFloorNumber === floor.floorNumber
                      ? 'border-emerald-700 bg-emerald-700 text-white shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-400 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Lantai {floor.floorNumber}
                  </button>
                ))}
              </div>
            </div>
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
                buildingLabels={campusModelLabels}
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

        </>}
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
        <span className="w-2 h-2 rounded-full bg-emerald-300" />
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
      <div className={isAdmin ? 'md:ml-64' : ''}><Footer onOpenGuide={() => setIsGuideModalOpen(true)} /></div>

      {/* Login Administrator */}
      {showLogin && (
        <LoginPage
          onClose={() => setShowLogin(false)}
        />
      )}
    </div>
  );
};
