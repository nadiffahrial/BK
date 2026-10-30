import React from 'react';
import { Building, Floor, RoomStatus } from '../../types';
import { 
  Building2, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Layers,
  Leaf
} from 'lucide-react';

interface StatsOverviewProps {
  building: Building;
  activeFloor: Floor;
  activeFilter: RoomStatus | 'all';
  onFilterChange: (status: RoomStatus | 'all') => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  building,
  activeFloor,
  activeFilter,
  onFilterChange
}) => {
  const allRooms = building.floors.flatMap(f => f.rooms);
  const totalRooms = allRooms.length;
  const availableRooms = allRooms.filter(r => r.status === 'available').length;
  const occupiedRooms = allRooms.filter(r => r.status === 'occupied').length;
  const reservedRooms = allRooms.filter(r => r.status === 'reserved').length;
  const maintenanceRooms = allRooms.filter(r => r.status === 'maintenance').length;
  const totalPeople = allRooms.reduce((acc, r) => acc + (r.currentOccupancy || 0), 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      
      {/* Total Rooms Card */}
      <div 
        onClick={() => onFilterChange('all')}
        className={`p-3.5 rounded-2xl bg-white border transition-all cursor-pointer shadow-sm ${
          activeFilter === 'all'
            ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40'
            : 'border-slate-200/80 hover:border-emerald-300 hover:shadow-md'
        }`}
      >
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Total Ruang</span>
          <Layers className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="text-2xl font-extrabold text-slate-900">{totalRooms}</div>
        <div className="text-[10px] text-slate-500 mt-0.5">{activeFloor.rooms.length} di Lt {activeFloor.floorNumber}</div>
      </div>

      {/* Available Rooms Card */}
      <div 
        onClick={() => onFilterChange('available')}
        className={`p-3.5 rounded-2xl bg-white border transition-all cursor-pointer shadow-sm ${
          activeFilter === 'available'
            ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/50'
            : 'border-slate-200/80 hover:border-emerald-300 hover:shadow-md'
        }`}
      >
        <div className="flex items-center justify-between text-emerald-700 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">Tersedia</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="text-2xl font-extrabold text-emerald-700">{availableRooms}</div>
        <div className="text-[10px] text-emerald-600 mt-0.5">Siap digunakan</div>
      </div>

      {/* Occupied Rooms Card */}
      <div 
        onClick={() => onFilterChange('occupied')}
        className={`p-3.5 rounded-2xl bg-white border transition-all cursor-pointer shadow-sm ${
          activeFilter === 'occupied'
            ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/50'
            : 'border-slate-200/80 hover:border-rose-300 hover:shadow-md'
        }`}
      >
        <div className="flex items-center justify-between text-rose-700 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">Digunakan</span>
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
        </div>
        <div className="text-2xl font-extrabold text-rose-700">{occupiedRooms}</div>
        <div className="text-[10px] text-rose-600 mt-0.5">Kuliah & Rapat</div>
      </div>

      {/* Reserved Rooms Card */}
      <div 
        onClick={() => onFilterChange('reserved')}
        className={`p-3.5 rounded-2xl bg-white border transition-all cursor-pointer shadow-sm ${
          activeFilter === 'reserved'
            ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/50'
            : 'border-slate-200/80 hover:border-amber-300 hover:shadow-md'
        }`}
      >
        <div className="flex items-center justify-between text-amber-700 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">Reservasi</span>
          <Clock className="w-4 h-4 text-amber-600" />
        </div>
        <div className="text-2xl font-extrabold text-amber-700">{reservedRooms}</div>
        <div className="text-[10px] text-amber-600 mt-0.5">Jadwal hari ini</div>
      </div>

      {/* Maintenance Rooms Card */}
      <div 
        onClick={() => onFilterChange('maintenance')}
        className={`p-3.5 rounded-2xl bg-white border transition-all cursor-pointer shadow-sm ${
          activeFilter === 'maintenance'
            ? 'border-slate-500 ring-2 ring-slate-500/20 bg-slate-100'
            : 'border-slate-200/80 hover:border-slate-300 hover:shadow-md'
        }`}
      >
        <div className="flex items-center justify-between text-slate-600 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">Servis</span>
          <AlertTriangle className="w-4 h-4 text-slate-500" />
        </div>
        <div className="text-2xl font-extrabold text-slate-700">{maintenanceRooms}</div>
        <div className="text-[10px] text-slate-500 mt-0.5">Pemeliharaan</div>
      </div>

      {/* Estimated Occupants Card */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between text-teal-700 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">Populasi</span>
          <Users className="w-4 h-4 text-teal-600" />
        </div>
        <div className="text-2xl font-extrabold text-slate-900">~{totalPeople}</div>
        <div className="text-[10px] text-slate-500 mt-0.5">Orang di gedung</div>
      </div>

    </div>
  );
};
