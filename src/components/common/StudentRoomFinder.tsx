import React, { useState, useMemo } from 'react';
import { Building, Room } from '../../types';
import { 
  Search, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  GraduationCap, 
  Laptop, 
  FileText, 
  Coffee, 
  X,
  Compass,
  Navigation,
  Clock,
  CheckCircle2
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
  const [isFocused, setIsFocused] = useState(false);

  // Flatten all rooms across all buildings and floors
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

  // Quick categories tailored for student needs
  const studentCategories = [
    { id: 'all', label: 'Semua Ruangan', icon: Sparkles },
    { id: 'classroom', label: 'Ruang Kuliah Teori', icon: GraduationCap },
    { id: 'laboratory', label: 'Lab Komputer & Riset', icon: Laptop },
    { id: 'skripsi', label: 'Ruang Sidang Skripsi', icon: FileText },
    { id: 'office', label: 'Layanan BAAK & Dosen', icon: Compass },
    { id: 'lounge', label: 'Lounge / Belajar Mandiri', icon: Coffee },
  ];

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    let result = allRooms;

    // Filter by student category
    if (activeCategory === 'classroom') {
      result = result.filter(r => r.type === 'classroom' || r.type === 'auditorium');
    } else if (activeCategory === 'laboratory') {
      result = result.filter(r => r.type === 'laboratory' || r.name.toLowerCase().includes('lab'));
    } else if (activeCategory === 'skripsi') {
      result = result.filter(r => r.name.toLowerCase().includes('skripsi') || r.name.toLowerCase().includes('sidang'));
    } else if (activeCategory === 'office') {
      result = result.filter(r => r.type === 'office' || r.name.toLowerCase().includes('baak') || r.name.toLowerCase().includes('dosen'));
    } else if (activeCategory === 'lounge') {
      result = result.filter(r => r.type === 'lounge' || r.name.toLowerCase().includes('lounge') || r.type === 'facility');
    }

    // Filter by query string
    if (query.trim().length > 0) {
      const q = query.toLowerCase();
      result = result.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.facilities.some(fac => fac.name.toLowerCase().includes(q)) ||
        (r.currentActivity && (
          r.currentActivity.title.toLowerCase().includes(q) ||
          r.currentActivity.personInCharge.toLowerCase().includes(q)
        ))
      );
    }

    return result;
  }, [allRooms, query, activeCategory]);

  return (
    <div className="mb-6 relative z-30">
      
      {/* Student Friendly Finder Bar Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-emerald-100 dark:border-slate-800 p-4 sm:p-5 shadow-sm transition-all focus-within:shadow-md focus-within:border-emerald-300 dark:focus-within:border-emerald-500">
        
        {/* Header Tagline */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
              <Compass className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            </span>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Pencarian Ruangan</span>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Cepat & Mudah
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Ketik nama atau kode ruang (misal A-101), lab, atau layanan kampus
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenSearchEngine && (
              <button
                type="button"
                onClick={onOpenSearchEngine}
                className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 px-2.5 py-1 rounded-xl border border-emerald-300 dark:border-slate-700 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="Buka Search Engine Layar Penuh (Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Search Engine Modal</span>
                <kbd className="text-[9px] bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 px-1 rounded font-mono">Ctrl+K</kbd>
              </button>
            )}
            <span className="hidden sm:flex text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800 items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Petunjuk Arah Otomatis
            </span>
          </div>
        </div>

        {/* Search Input Box */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onFocus={() => setIsFocused(true)}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik ruang kuliah (A-101), Lab AI, Ruang Sidang Skripsi, Loket BAAK, nama dosen..."
            className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Filter Categories for Students */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {studentCategories.map((cat) => {
            const Icon = cat.icon;
            const isCatActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  isCatActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-800 dark:hover:text-emerald-300 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Autocomplete / Instant Results Drawer when searching or filtering */}
        {(query.trim().length > 0 || (isFocused && activeCategory !== 'all')) && (
          <div className="mt-3.5 pt-3.5 border-t border-slate-100 max-h-72 overflow-y-auto space-y-1.5">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-1 mb-1 flex items-center justify-between">
              <span>Hasil Ruangan Ditemukan ({filteredRooms.length})</span>
              <span className="text-emerald-700 font-semibold lowercase">klik untuk navigasi langsung</span>
            </div>

            {filteredRooms.length > 0 ? (
              filteredRooms.map((room) => {
                const isAvail = room.status === 'available';
                const isOcc = room.status === 'occupied';
                const isRes = room.status === 'reserved';

                return (
                  <div
                    key={room.id}
                    onClick={() => {
                      onSelectRoom(room.buildingId, room.floorNumber, room);
                      setIsFocused(false);
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/80 border border-slate-200/80 hover:border-emerald-300 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-extrabold px-2 py-1 rounded-lg bg-white text-emerald-800 border border-slate-200 shadow-xs">
                        {room.code}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">
                          {room.name}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{room.buildingShortName} • Tingkat {room.floorNumber}</span>
                          {room.currentActivity && (
                            <span className="text-amber-700 font-medium truncate max-w-[200px]">
                              ▶ {room.currentActivity.title}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-right">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isAvail ? 'bg-emerald-100 text-emerald-800' :
                        isOcc ? 'bg-rose-100 text-rose-800' :
                        isRes ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {isAvail ? 'Tersedia' : isOcc ? 'Sedang Kuliah' : isRes ? 'Reservasi' : 'Servis'}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">
                Tidak ada ruangan yang cocok dengan kata kunci "{query}". Coba cari kode ruang seperti "A-101" atau "Lab".
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

