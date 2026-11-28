import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Building, Room } from '../../types';

interface StudentRoomFinderProps {
  buildings: Building[];
  buildingLabels?: Record<string, string>;
  onSelectRoom: (buildingId: string, floorNumber: number, room: Room) => void;
  onOpenSearchEngine?: () => void;
}

export const StudentRoomFinder: React.FC<StudentRoomFinderProps> = ({ buildings, buildingLabels = {}, onSelectRoom }) => {
  const [query, setQuery] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('all');
  const [floorFilter, setFloorFilter] = useState('all');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allRooms = useMemo(() => buildings.flatMap(building =>
    building.floors.flatMap(floor => floor.rooms.map(room => ({
      ...room,
      buildingShortName: buildingLabels[building.id]?.trim() || building.shortName,
      floorName: `Lantai ${floor.floorNumber} ${buildingLabels[building.id]?.trim() || building.shortName}`
    })))
  ), [buildings, buildingLabels]);

  const floors = useMemo(() => {
    const scope = buildingFilter === 'all' ? buildings : buildings.filter(building => building.id === buildingFilter);
    return [...new Set(scope.flatMap(building => building.floors.map(floor => floor.floorNumber)))].sort((a, b) => a - b);
  }, [buildings, buildingFilter]);

  const filteredRooms = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('id-ID');
    return allRooms.filter(room => {
      if (buildingFilter !== 'all' && room.buildingId !== buildingFilter) return false;
      if (floorFilter !== 'all' && room.floorNumber !== Number(floorFilter)) return false;
      if (!normalized) return buildingFilter !== 'all' || floorFilter !== 'all';
      const content = [
        room.name,
        room.code,
        room.description,
        room.currentActivity?.title || '',
        room.currentActivity?.personInCharge || '',
        ...(room.schedule || []).flatMap(schedule => [schedule.title, schedule.organizer, schedule.className || '']),
        ...(room.facilities || []).flatMap(facility => [facility.name, facility.spec || '']),
        ...(room.schedule || []).flatMap(item => [item.title, item.organizer, item.className || '']),
        ...(room.facilities || []).flatMap(item => [item.name, item.spec || ''])
      ].join(' ').toLocaleLowerCase('id-ID');
      return content.includes(normalized);
    });
  }, [allRooms, buildingFilter, floorFilter, query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectRoom = (room: (typeof allRooms)[number]) => {
    onSelectRoom(room.buildingId, room.floorNumber, room);
    setIsOpen(false);
    setQuery('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIsOpen(true);
      setSelectedIndex(index => filteredRooms.length ? (index + 1) % filteredRooms.length : -1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex(index => filteredRooms.length ? (index <= 0 ? filteredRooms.length - 1 : index - 1) : -1);
    } else if (event.key === 'Enter' && filteredRooms.length) {
      event.preventDefault();
      selectRoom(filteredRooms[selectedIndex >= 0 ? selectedIndex : 0]);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className="relative z-30 mb-5">
      <div className={`flex items-center rounded-xl border bg-white transition-colors dark:bg-slate-900 ${isOpen ? 'border-emerald-600 ring-2 ring-emerald-600/10' : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'}`}>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={event => { setQuery(event.target.value); setIsOpen(true); setSelectedIndex(-1); }}
          onKeyDown={handleKeyDown}
          placeholder="Cari nama atau kode ruang, mata kuliah, dosen, dan fasilitas"
          aria-label="Cari ruangan"
          className="min-w-0 flex-1 rounded-xl bg-transparent px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
        />
        {query && <button type="button" onClick={() => { setQuery(''); setSelectedIndex(-1); inputRef.current?.focus(); }} className="mr-3 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200">Hapus</button>}
      </div>

      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span className="shrink-0">Gedung</span>
          <select value={buildingFilter} onChange={event => { setBuildingFilter(event.target.value); setFloorFilter('all'); setSelectedIndex(-1); setIsOpen(true); }} className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <option value="all">Semua gedung</option>
            {buildings.map(building => <option key={building.id} value={building.id}>{buildingLabels[building.id]?.trim() || building.shortName}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span className="shrink-0">Lantai</span>
          <select value={floorFilter} onChange={event => { setFloorFilter(event.target.value); setSelectedIndex(-1); setIsOpen(true); }} className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <option value="all">Semua lantai</option>
            {floors.map(floor => <option key={floor} value={floor}>Lantai {floor}</option>)}
          </select>
        </label>
      </div>

      {isOpen && (
        <section className="absolute left-0 right-0 top-full z-50 mt-2 flex max-h-[380px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900" aria-label="Hasil pencarian ruangan">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
            {query.trim() || buildingFilter !== 'all' || floorFilter !== 'all'
              ? `${filteredRooms.length} ruangan ditemukan`
              : 'Ketik pencarian atau pilih gedung dan lantai.'}
          </div>
          <div className="overflow-y-auto">
            {filteredRooms.map((room, index) => {
              const active = selectedIndex === index;
              const status = room.status === 'available' ? 'Tersedia' : room.status === 'occupied' ? 'Digunakan' : room.status === 'reserved' ? 'Terjadwal' : room.status === 'maintenance' ? 'Perbaikan' : 'Rusak';
              return <button key={room.id} type="button" onClick={() => selectRoom(room)} onMouseEnter={() => setSelectedIndex(index)} className={`flex w-full items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-0 dark:border-slate-800 ${active ? 'bg-emerald-700 text-white' : 'text-slate-800 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-800/70'}`}>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{room.code} · {room.name}</span>
                  <span className={`mt-0.5 block truncate text-xs ${active ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'}`}>{room.buildingShortName} · Lantai {room.floorNumber}{room.currentActivity ? ` · ${room.currentActivity.title}` : ''}</span>
                </span>
                <span className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-medium ${active ? 'bg-white/15 text-white' : room.status === 'available' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>{status} · {room.capacity} kursi</span>
              </button>;
            })}
            {!filteredRooms.length && (query.trim() || buildingFilter !== 'all' || floorFilter !== 'all') && <p className="px-4 py-7 text-center text-sm text-slate-500 dark:text-slate-400">Tidak ada ruangan yang sesuai.</p>}
          </div>
          {(query.trim() || buildingFilter !== 'all' || floorFilter !== 'all') && <div className="border-t border-slate-200 px-4 py-2 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">Gunakan tombol panah untuk memilih dan Enter untuk membuka.</div>}
        </section>
      )}
    </div>
  );
};
