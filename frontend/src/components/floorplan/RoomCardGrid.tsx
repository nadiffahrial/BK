import React, { useState } from 'react';
import { Room, RoomStatus } from '../../types';

interface RoomCardGridProps {
  rooms: Room[];
  selectedRoom: Room | null;
  onSelectRoom: (room: Room) => void;
  onNavigateRoom?: (room: Room) => void;
  statusFilter?: RoomStatus | 'all';
}

const utilityRoomPattern = /\b(wc|toilet|kamar mandi|tangga|r\.?\s*panel|ruang panel|panel listrik|wudhu|mushola|musala)\b/i;

const statusLabels: Record<RoomStatus, string> = {
  available: 'Tersedia',
  occupied: 'Sedang digunakan',
  reserved: 'Terjadwal',
  maintenance: 'Dalam perbaikan',
  broken: 'Tidak dapat digunakan'
};

export const RoomCardGrid: React.FC<RoomCardGridProps> = ({
  rooms,
  selectedRoom,
  onSelectRoom,
  statusFilter = 'all'
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'code' | 'capacity' | 'name'>('code');

  const filters = [
    { id: 'all', label: 'Semua' },
    { id: 'panorama', label: 'Panorama 360°' },
    { id: 'classroom', label: 'Kelas' },
    { id: 'laboratory', label: 'Laboratorium' },
    { id: 'meeting', label: 'Rapat' },
    { id: 'auditorium', label: 'Auditorium' },
    { id: 'facility', label: 'Fasilitas' },
    { id: 'lounge', label: 'Lounge' }
  ];

  const filtered = rooms
    .filter(room => {
      if (statusFilter !== 'all' && room.status !== statusFilter) return false;
      if (filterType === 'all') return true;
      if (filterType === 'panorama') return Boolean(room.panoramaUrl);
      return room.type === filterType;
    })
    .sort((a, b) => {
      if (sortBy === 'capacity') return b.capacity - a.capacity;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return a.code.localeCompare(b.code);
    });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:pb-0">
          <span className="shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400">Jenis ruang</span>
          {filters.map(filter => (
            <button
              key={filter.id}
              type="button"
              aria-pressed={filterType === filter.id}
              onClick={() => setFilterType(filter.id)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${filterType === filter.id
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <label className="flex shrink-0 items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Urutkan</span>
          <select
            value={sortBy}
            onChange={event => setSortBy(event.target.value as typeof sortBy)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="code">Kode ruang</option>
            <option value="capacity">Kapasitas</option>
            <option value="name">Nama ruang</option>
          </select>
        </label>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(room => {
            const isSelected = selectedRoom?.id === room.id;
            const isUtilityRoom = utilityRoomPattern.test(room.name);
            const facilities = room.facilities.slice(0, 2).map(facility => facility.name);
            const remainingFacilities = Math.max(0, room.facilities.length - facilities.length);

            return (
              <article
                key={room.id}
                onClick={() => onSelectRoom(room)}
                className={`flex cursor-pointer flex-col rounded-xl border bg-white p-4 transition-colors dark:bg-slate-900 ${isSelected
                  ? 'border-emerald-600 ring-1 ring-emerald-600/30'
                  : 'border-slate-200 hover:border-emerald-400 dark:border-slate-800 dark:hover:border-emerald-700'}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs font-semibold text-emerald-800 dark:text-emerald-300">{room.code}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Kapasitas {room.capacity}</span>
                </div>

                {room.panoramaUrl && <span className="mt-2 self-start text-[11px] text-slate-500 dark:text-slate-400">Panorama 360°</span>}
                <h2 className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">{room.name}</h2>
                <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600 dark:text-slate-400">{room.description}</p>

                <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                  {isUtilityRoom ? (
                    <p className={`text-xs font-medium ${room.status === 'broken' ? 'text-rose-700 dark:text-rose-300' : room.status === 'maintenance' ? 'text-amber-700 dark:text-amber-300' : 'text-emerald-700 dark:text-emerald-300'}`}>
                      {statusLabels[room.status]}
                    </p>
                  ) : room.currentActivity ? (
                    <div>
                      <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Sedang berlangsung · {room.currentActivity.startTime}–{room.currentActivity.endTime}</p>
                      <p className="mt-1 truncate text-sm font-medium text-slate-800 dark:text-slate-200">{room.currentActivity.title}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{room.currentActivity.className ? `Kelas ${room.currentActivity.className} · ` : ''}{room.currentActivity.personInCharge}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400">{statusLabels[room.status]}</p>
                  )}
                </div>

                {facilities.length > 0 && (
                  <p className="mt-3 truncate text-xs text-slate-500 dark:text-slate-400" title={room.facilities.map(facility => facility.name).join(', ')}>
                    {facilities.join(' · ')}{remainingFacilities > 0 ? ` · +${remainingFacilities}` : ''}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Lantai {room.floorNumber}</span>
                  <button
                    type="button"
                    onClick={event => {
                      event.stopPropagation();
                      onSelectRoom(room);
                    }}
                    className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-800"
                  >
                    Lihat detail
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          Tidak ada ruangan yang sesuai dengan filter.
        </p>
      )}
    </div>
  );
};
