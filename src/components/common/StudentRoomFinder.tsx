import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Building, Room } from '../../types';
import { 
  Search, 
  Sparkles, 
  ArrowRight, 
  GraduationCap, 
  Laptop, 
  FileText, 
  Compass, 
  X,
  Navigation,
  CornerDownLeft
} from 'lucide-react';

interface StudentRoomFinderProps {
  buildings: Building[];
  onSelectRoom: (buildingId: string, floorNumber: number, room: Room) => void;
  onOpenSearchEngine?: () => void;
}

export const StudentRoomFinder: React.FC<StudentRoomFinderProps> = ({
  buildings,
  onSelectRoom,
  onOpenSearchEngine
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Flatten all rooms across buildings & floors
  const allRooms = useMemo(() => {
    return buildings.flatMap(b =>
      b.floors.flatMap(f =>
        f.rooms.map(r => ({
          ...r,
          buildingName: b.name,
          buildingShortName: b.shortName,
          buildingCode: b.code,
          floorName: f.name
        }))
      )
    );
  }, [buildings]);

  // Simple, practical categories
  const categories = [
    { id: 'all', label: 'Semua' },
    { id: 'classroom', label: 'Kelas Kuliah', icon: GraduationCap },
    { id: 'laboratory', label: 'Lab Komputer & Riset', icon: Laptop },
    { id: 'skripsi', label: 'Ruang Sidang', icon: FileText },
    { id: 'office', label: 'Layanan Kampus', icon: Compass },
  ];

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    let result = allRooms;

    if (activeCategory === 'classroom') {
      result = result.filter(r => r.type === 'classroom' || r.type === 'auditorium');
    } else if (activeCategory === 'laboratory') {
      result = result.filter(r => r.type === 'laboratory' || r.name.toLowerCase().includes('lab'));
    } else if (activeCategory === 'skripsi') {
      result = result.filter(r => r.name.toLowerCase().includes('skripsi') || r.name.toLowerCase().includes('sidang'));
    } else if (activeCategory === 'office') {
      result = result.filter(r => r.type === 'office' || r.name.toLowerCase().includes('baak') || r.name.toLowerCase().includes('dosen'));
    }

    if (query.trim().length > 0) {
      const q = query.toLowerCase();
      result = result.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        (r.currentActivity && (
          r.currentActivity.title.toLowerCase().includes(q) ||
          r.currentActivity.personInCharge.toLowerCase().includes(q)
        ))
      );
    }

    return result;
  }, [allRooms, query, activeCategory]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation (ArrowDown, ArrowUp, Enter, Escape)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredRooms.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredRooms.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < filteredRooms.length) {
        handleSelect(filteredRooms[selectedIndex]);
      } else if (filteredRooms.length > 0) {
        handleSelect(filteredRooms[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleSelect = (room: typeof allRooms[0]) => {
    onSelectRoom(room.buildingId, room.floorNumber, room);
    setIsOpen(false);
    setQuery('');
  };

  // Quick recommendations when user first focuses
  const recommendations = useMemo(() => {
    return allRooms.filter(r => 
      r.id === 'labtek1-102' || // Lab Pemrograman
      r.id === 'labtek1-201' || // Lab AI
      r.id === 'labtek1-206' || // Ruang Sidang Skripsi
      r.id === 'labtek1-106' || // BAAK
      r.id === 'ft1-101'        // Smart Classroom Dekanat
    ).slice(0, 4);
  }, [allRooms]);

  return (
    <div ref={containerRef} className="mb-5 relative z-30">
      
      {/* Sleek, Minimalist Interactive Search Bar */}
      <div className={`relative flex items-center bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 shadow-xs ${
        isOpen
          ? 'border-emerald-500 ring-4 ring-emerald-500/10 shadow-md'
          : 'border-slate-200/90 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-slate-700'
      }`}>
        
        {/* Left: Interactive Search Icon */}
        <div className="pl-4 pr-2 text-emerald-600 dark:text-emerald-400 flex items-center pointer-events-none">
          <Search className={`w-4 h-4 transition-transform ${isOpen ? 'scale-110 text-emerald-600' : 'text-slate-400'}`} />
        </div>

        {/* Search Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Cari ruang kuliah, lab, ruang sidang skripsi, BAAK, atau dosen..."
          className="flex-1 py-3 px-1 text-xs sm:text-sm bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none font-medium"
        />

        {/* Clear Button (appears when query has text) */}
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="p-1.5 mr-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Hapus pencarian"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Quick Keyboard Shortcut / Modal Trigger */}
        <div className="pr-3 flex items-center gap-1.5 shrink-0">
          {onOpenSearchEngine && (
            <button
              type="button"
              onClick={onOpenSearchEngine}
              className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-700 text-[10px] font-mono font-bold transition-all border border-slate-200/80 dark:border-slate-700 cursor-pointer"
              title="Buka Search Engine Lengkap (Ctrl + K)"
            >
              <span>Ctrl</span>
              <span>K</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Quick Category Pills (Compact & Simple) */}
      <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isCatActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveCategory(cat.id);
                setIsOpen(true);
                setSelectedIndex(-1);
              }}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold shrink-0 transition-all cursor-pointer border ${
                isCatActive
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs scale-102'
                  : 'bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Floating Interactive Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl rounded-2xl border border-emerald-100 dark:border-slate-800 shadow-2xl overflow-hidden animate-slide-down max-h-[380px] flex flex-col z-50">
          
          {/* Header count */}
          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <span>
              {query ? `Hasil pencarian (${filteredRooms.length})` : 'Pilihan Ruangan Cepat'}
            </span>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CornerDownLeft className="w-3 h-3" /> Tekan Enter untuk navigasi
            </span>
          </div>

          {/* Results List */}
          <div className="overflow-y-auto p-2 space-y-1">
            {filteredRooms.length > 0 ? (
              filteredRooms.map((room, idx) => {
                const isSelected = selectedIndex === idx;
                const isAvail = room.status === 'available';
                const isOcc = room.status === 'occupied';
                const isRes = room.status === 'reserved';

                return (
                  <div
                    key={room.id}
                    onClick={() => handleSelect(room)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between group ${
                      isSelected
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'hover:bg-emerald-50/80 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`font-mono text-xs font-black px-2 py-1 rounded-lg shrink-0 transition-colors ${
                        isSelected 
                          ? 'bg-white text-emerald-900' 
                          : 'bg-slate-100 dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 border border-slate-200 dark:border-slate-700'
                      }`}>
                        {room.code}
                      </span>
                      <div className="min-w-0">
                        <div className={`text-xs sm:text-sm font-extrabold truncate ${
                          isSelected ? 'text-white' : 'text-slate-900 dark:text-white'
                        }`}>
                          {room.name}
                        </div>
                        <div className={`text-[10px] truncate flex items-center gap-1.5 mt-0.5 ${
                          isSelected ? 'text-emerald-100' : 'text-slate-400'
                        }`}>
                          <span>{room.buildingShortName} • Tingkat {room.floorNumber}</span>
                          {room.currentActivity && (
                            <span>• {room.currentActivity.title}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected 
                          ? 'bg-white/20 text-white' 
                          : isAvail ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                          : isOcc ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300'
                          : isRes ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {isAvail ? 'Tersedia' : isOcc ? 'Kuliah' : isRes ? 'Reservasi' : 'Servis'}
                      </span>
                      <ArrowRight className={`w-3.5 h-3.5 transition-transform ${
                        isSelected ? 'text-white translate-x-1' : 'text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-600'
                      }`} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                Tidak ada ruangan ditemukan untuk "{query}". Coba ketik "LAB" atau "A-101".
              </div>
            )}
          </div>

          {/* Quick Recommendations Footer when empty query */}
          {!query && recommendations.length > 0 && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Rekomendasi Ruangan Terpopuler:
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {recommendations.map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleSelect(r)}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-emerald-800 text-[11px] font-semibold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  >
                    {r.code} - {r.name.split('(')[0]}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
