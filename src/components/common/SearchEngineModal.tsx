import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  X, 
  MapPin, 
  Compass, 
  Sparkles, 
  ArrowRight, 
  GraduationCap, 
  Laptop, 
  FileText, 
  Clock, 
  Users, 
  CheckCircle2, 
  History, 
  Building2, 
  Calendar,
  Layers,
  Flame,
  CornerDownLeft
} from 'lucide-react';
import { Building, Room, SearchResultRoom, RoomStatus } from '../../types';
import { apiService } from '../../services/api';

interface SearchEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildings: Building[];
  onNavigateToRoom: (buildingId: string, floorNumber: number, room: Room) => void;
}

export const SearchEngineModal: React.FC<SearchEngineModalProps> = ({
  isOpen,
  onClose,
  buildings,
  onNavigateToRoom
}) => {
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchResults, setSearchResults] = useState<SearchResultRoom[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('smartspace_recent_searches');
      return saved ? JSON.parse(saved) : ['A-101', 'Lab AI', 'Sidang Skripsi', 'BAAK'];
    } catch {
      return ['A-101', 'Lab AI', 'Sidang Skripsi', 'BAAK'];
    }
  });

  const inputRef = useRef<HTMLInputElement>(null);

  // Popular search tags for university students
  const popularTags = [
    { label: 'A-101 (Kuliah Teori)', q: 'A-101' },
    { label: 'A-201 (Lab AI)', q: 'A-201' },
    { label: 'A-204 (Sidang Skripsi)', q: 'A-204' },
    { label: 'A-104 (Layanan BAAK)', q: 'BAAK' },
    { label: 'B-201 (Lab Robotika)', q: 'Robotika' },
    { label: 'Dr. Budi Santoso', q: 'Budi' },
    { label: 'Algoritma & Pemrograman', q: 'Algoritma' }
  ];

  // Auto focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Global keyboard shortcut: Ctrl+K or Cmd+K or '/' to toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open via document event or parent handler if needed
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search query
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const results = await apiService.searchRooms(query);
        setSearchResults(results);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Save to recent searches
  const recordSearch = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    setRecentSearches(prev => {
      const updated = [clean, ...prev.filter(item => item.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
      try {
        localStorage.setItem('smartspace_recent_searches', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('smartspace_recent_searches');
    } catch {}
  };

  // Flatten all rooms from buildings as base dataset
  const allRoomsFromBuildings: SearchResultRoom[] = useMemo(() => {
    return (buildings || []).flatMap(b =>
      (b.floors || []).flatMap(f =>
        (f.rooms || []).map(r => ({
          ...r,
          buildingId: b.id,
          buildingName: b.name,
          buildingShortName: b.shortName,
          floorNumber: f.floorNumber,
          floorName: f.name
        }))
      )
    );
  }, [buildings]);

  // Filter results by category pills
  const filteredResults = useMemo(() => {
    const baseList = query.trim().length > 0 ? searchResults : allRoomsFromBuildings;
    if (selectedFilter === 'all') {
      return query.trim().length > 0 ? baseList : [];
    }
    if (selectedFilter === 'gedung-a') return baseList.filter(r => r.buildingId === 'gedung-a');
    if (selectedFilter === 'gedung-b') return baseList.filter(r => r.buildingId === 'gedung-b');
    if (selectedFilter === 'classroom') return baseList.filter(r => r.type === 'classroom' || r.type === 'auditorium');
    if (selectedFilter === 'lab') return baseList.filter(r => r.type === 'laboratory' || r.name.toLowerCase().includes('lab'));
    if (selectedFilter === 'dosen') return baseList.filter(r => r.type === 'office' || r.name.toLowerCase().includes('dekan') || (r.matchReason && r.matchReason.toLowerCase().includes('dosen')));
    return baseList;
  }, [searchResults, allRoomsFromBuildings, selectedFilter, query]);

  const handleSelectRoom = (room: SearchResultRoom) => {
    recordSearch(room.code + ' ' + room.name);
    onNavigateToRoom(room.buildingId, room.floorNumber, room);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-16 p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Search Palette Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-emerald-100 dark:border-slate-800 overflow-hidden z-10 animate-slide-down flex flex-col max-h-[85vh] text-slate-800 dark:text-slate-100 transition-colors">
        
        {/* Top Search Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-b from-emerald-50/50 dark:from-slate-800/80 to-white dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600 dark:bg-emerald-500 text-white shadow-md shadow-emerald-600/20">
              <Search className="w-5 h-5 animate-pulse" />
            </div>

            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && filteredResults.length > 0) {
                    handleSelectRoom(filteredResults[0]);
                  }
                }}
                placeholder="Ketik ruang (A-101), lab, dosen, mata kuliah, atau fasilitas..."
                className="w-full text-sm sm:text-base font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 bg-transparent border-none outline-none focus:ring-0 pr-8"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <kbd className="hidden sm:inline-block px-2 py-1 text-[10px] font-bold font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs">
                ESC
              </kbd>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Tutup Pencarian"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-0.5 scrollbar-none">
            {[
              { id: 'all', label: 'Semua Hasil' },
              { id: 'gedung-a', label: '🏛️ LABTEK 1' },
              { id: 'gedung-b', label: '🏛️ FT.1' },
              { id: 'classroom', label: '🎓 Ruang Kuliah' },
              { id: 'lab', label: '💻 Lab & Riset' },
              { id: 'dosen', label: '👨‍🏫 Ruang Dosen & Dekanat' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  selectedFilter === tab.id
                    ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* State 1: Typing Query OR Category Filter Selected */}
          {query.trim().length > 0 || selectedFilter !== 'all' ? (
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 px-1 mb-2">
                <span>
                  {isLoading 
                    ? 'Sedang mencari di sistem kampus...' 
                    : query.trim().length > 0 
                      ? `Ditemukan ${filteredResults.length} Ruangan & Fasilitas`
                      : `Ditemukan ${filteredResults.length} Ruangan dalam Kategori`}
                </span>
                <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <CornerDownLeft className="w-3.5 h-3.5" /> Tekan Enter untuk pilih yang teratas
                </span>
              </div>

              {filteredResults.length > 0 ? (
                <div className="space-y-2">
                  {filteredResults.map((room, idx) => {
                    const isAvail = room.status === 'available';
                    const isOcc = room.status === 'occupied';
                    const isRes = room.status === 'reserved';

                    return (
                      <div
                        key={room.id}
                        onClick={() => handleSelectRoom(room)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                          idx === 0 
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 shadow-xs hover:border-emerald-500' 
                            : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Room Code Badge */}
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-mono font-black text-sm flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                            {room.code}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition-colors">
                                {room.name}
                              </h4>
                              {room.matchReason && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                  {room.matchReason}
                                </span>
                              )}
                            </div>

                            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1 flex-wrap">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {room.buildingShortName || (room.buildingId === 'gedung-a' ? 'LABTEK 1' : 'FT.1')}
                              </span>
                              <span>•</span>
                              <span>Tingkat {room.floorNumber}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3 text-slate-400" /> Kapasitas {room.capacity}
                              </span>
                            </div>

                            {room.currentActivity && (
                              <div className="mt-1.5 text-[11px] font-medium text-emerald-900 dark:text-emerald-200 bg-emerald-100/60 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md inline-flex items-center gap-1.5">
                                <Clock className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                                <span>{room.currentActivity.title} ({room.currentActivity.startTime} - {room.currentActivity.endTime})</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status & Jump Button */}
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            isAvail ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                            isOcc ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800' :
                            isRes ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800' :
                            'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}>
                            {isAvail ? 'Tersedia' : isOcc ? 'Sedang Digunakan' : isRes ? 'Dipesan' : 'Pemeliharaan'}
                          </span>

                          <button className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer">
                            <span>Buka di 3D</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                !isLoading && (
                  <div className="text-center py-10 px-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Ruangan tidak ditemukan</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                      Tidak ada hasil yang sesuai dengan kriteria pencarian.
                    </p>
                  </div>
                )
              )}
            </div>
          ) : (
            /* State 2: Query is Empty -> Show Quick Suggestions, Popular Tags, and Recent History */
            <div className="space-y-5">
              
              {/* Popular Quick Searches for Students */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2.5">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Paling Sering Dicari Mahasiswa</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map(tag => (
                    <button
                      key={tag.q}
                      onClick={() => {
                        setQuery(tag.q);
                        recordSearch(tag.q);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>{tag.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                    <div className="flex items-center gap-1.5">
                      <History className="w-4 h-4 text-emerald-600" />
                      <span>Riwayat Pencarian Anda</span>
                    </div>
                    <button
                      onClick={clearRecentSearches}
                      className="text-[11px] text-slate-400 hover:text-rose-600 font-medium cursor-pointer"
                    >
                      Hapus Riwayat
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {recentSearches.map((term, i) => (
                      <div
                        key={i}
                        onClick={() => setQuery(term)}
                        className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 hover:border-emerald-300 text-xs font-medium text-slate-700 flex items-center justify-between cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{term}</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Campus Shortcuts Overview */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-extrabold text-slate-900">
                      Sistem Pencarian Kampus Cerdas
                    </h5>
                    <p className="text-[11px] text-slate-600">
                      Mencakup 2 Gedung (LABTEK 1 & FT.1), 4 Lantai, 24 Ruangan, Jadwal Kuliah & Ruang Sidang.
                    </p>
                  </div>
                </div>

                <div className="hidden sm:block font-mono text-[11px] font-bold text-emerald-800 bg-white/80 px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                  MySQL XAMPP Live
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Shortcut Helper */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 px-5">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-mono text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-mono text-[10px]">↓</kbd> Navigasi
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-mono text-[10px]">↵</kbd> Pilih Ruang
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-mono text-[10px]">ESC</kbd> Tutup
            </span>
          </div>

          <span className="font-semibold text-emerald-700">
            SmartCampus3D Wayfinding
          </span>
        </div>

      </div>
    </div>
  );
};

