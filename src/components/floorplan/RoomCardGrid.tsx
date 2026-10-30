import React, { useState } from 'react';
import { Room, RoomType, RoomStatus } from '../../types';
import { 
  Users, 
  Thermometer, 
  Tv, 
  Wifi, 
  Cpu, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  Filter
} from 'lucide-react';

interface RoomCardGridProps {
  rooms: Room[];
  selectedRoom: Room | null;
  onSelectRoom: (room: Room) => void;
  onNavigateRoom?: (room: Room) => void;
}

export const RoomCardGrid: React.FC<RoomCardGridProps> = ({
  rooms,
  selectedRoom,
  onSelectRoom,
  onNavigateRoom
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'code' | 'capacity' | 'name'>('code');

  const filtered = rooms
    .filter(r => filterType === 'all' || r.type === filterType)
    .sort((a, b) => {
      if (sortBy === 'capacity') return b.capacity - a.capacity;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return a.code.localeCompare(b.code);
    });

  const getStatusBadge = (status: RoomStatus) => {
    switch (status) {
      case 'available':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">Tersedia</span>;
      case 'occupied':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">Digunakan</span>;
      case 'reserved':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">Reservasi</span>;
      case 'maintenance':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">Servis</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters & Sorters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-emerald-100 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-emerald-600" /> Tipe Ruang:
          </span>
          {[
            { id: 'all', label: 'Semua Tipe' },
            { id: 'classroom', label: 'Kelas Teori' },
            { id: 'laboratory', label: 'Laboratorium' },
            { id: 'meeting', label: 'Ruang Rapat' },
            { id: 'auditorium', label: 'Auditorium' },
            { id: 'facility', label: 'Fasilitas' },
            { id: 'lounge', label: 'Lounge' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span>Urutkan:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-800 font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="code">Kode Ruangan</option>
            <option value="capacity">Kapasitas Terbesar</option>
            <option value="name">Nama Ruangan</option>
          </select>
        </div>
      </div>

      {/* Room Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((room) => {
          const isSelected = selectedRoom?.id === room.id;

          return (
            <div
              key={room.id}
              onClick={() => onSelectRoom(room)}
              className={`p-5 rounded-2xl bg-white border transition-all duration-200 flex flex-col justify-between cursor-pointer group hover:-translate-y-1 shadow-sm ${
                isSelected
                  ? 'border-emerald-600 ring-2 ring-emerald-600/30 shadow-md'
                  : 'border-slate-200/90 hover:border-emerald-400 hover:shadow-md'
              }`}
            >
              <div>
                {/* Top Code & Status */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {room.code}
                  </span>
                  {getStatusBadge(room.status)}
                </div>

                {/* Title & Description */}
                <h4 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {room.name}
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {room.description}
                </p>

                {/* Current Activity Banner */}
                {room.currentActivity ? (
                  <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                    <div className="text-[10px] uppercase font-bold text-amber-800 tracking-wider flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" /> Sedang Berlangsung ({room.currentActivity.startTime} - {room.currentActivity.endTime})
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-0.5 truncate">
                      {room.currentActivity.title}
                    </div>
                    <div className="text-[10px] text-slate-600 truncate">
                      {room.currentActivity.personInCharge}
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tidak ada agenda perkuliahan aktif.</span>
                  </div>
                )}

                {/* Facility Tags */}
                <div className="flex items-center gap-1.5 flex-wrap mt-3">
                  {room.facilities.slice(0, 3).map((f, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50/60 text-slate-700 border border-emerald-100 truncate max-w-[150px] font-medium"
                    >
                      {f.name}
                    </span>
                  ))}
                  {room.facilities.length > 3 && (
                    <span className="text-[10px] text-slate-400 font-medium">
                      +{room.facilities.length - 3} lagi
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Card Actions & Specs */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-slate-600 font-semibold">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-emerald-600" /> {room.capacity}
                  </span>
                  {room.temperature && (
                    <span className="flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5 text-teal-600" /> {room.temperature}°C
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRoom(room);
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    Pilih Ruang
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
