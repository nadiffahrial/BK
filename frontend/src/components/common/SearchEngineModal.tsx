import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Building, Room, SearchResultRoom } from '../../types';

interface SearchEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildings: Building[];
  buildingLabels?: Record<string, string>;
  onNavigateToRoom: (buildingId: string, floorNumber: number, room: Room) => void;
}

export const SearchEngineModal: React.FC<SearchEngineModalProps> = ({ isOpen, onClose, buildings, buildingLabels = {}, onNavigateToRoom }) => {
  const [query, setQuery] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('all');
  const [floorFilter, setFloorFilter] = useState('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 50);
      return () => window.clearTimeout(timer);
    }
    setQuery('');
    setBuildingFilter('all');
    setFloorFilter('all');
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const allRooms = useMemo<SearchResultRoom[]>(() => buildings.flatMap(building =>
    building.floors.flatMap(floor => floor.rooms.map(room => ({
      ...room,
      buildingId: building.id,
      buildingName: building.name,
      buildingShortName: buildingLabels[building.id]?.trim() || building.shortName,
      floorNumber: floor.floorNumber,
      floorName: floor.name
    })))
  ), [buildings, buildingLabels]);

  const floors = useMemo(() => {
    const scope = buildingFilter === 'all' ? buildings : buildings.filter(building => building.id === buildingFilter);
    return [...new Set(scope.flatMap(building => building.floors.map(floor => floor.floorNumber)))].sort((a, b) => a - b);
  }, [buildings, buildingFilter]);

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('id-ID');
    return allRooms.filter(room => {
      if (buildingFilter !== 'all' && room.buildingId !== buildingFilter) return false;
      if (floorFilter !== 'all' && room.floorNumber !== Number(floorFilter)) return false;
      if (!normalized) return buildingFilter !== 'all' || floorFilter !== 'all';
      const searchableText = [
        room.code,
        room.name,
        room.description,
        room.buildingName || '',
        room.currentActivity?.title || '',
        room.currentActivity?.personInCharge || '',
        ...(room.schedule || []).flatMap(schedule => [schedule.title, schedule.organizer, schedule.className || '']),
        ...(room.facilities || []).flatMap(facility => [facility.name, facility.spec || ''])
      ].join(' ').toLocaleLowerCase('id-ID');
      return searchableText.includes(normalized);
    });
  }, [allRooms, buildingFilter, floorFilter, query]);

  const selectRoom = (room: SearchResultRoom) => {
    onNavigateToRoom(room.buildingId, room.floorNumber, room);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/55 p-3 pt-8 sm:pt-14" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="room-search-title" className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 id="room-search-title" className="text-base font-semibold text-slate-900 dark:text-white">Cari ruangan</h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Cari berdasarkan nama, kode, fasilitas, agenda, atau dosen.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup pencarian" className="rounded-lg px-2.5 py-1.5 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white">Tutup</button>
        </header>

        <div className="space-y-3 border-b border-slate-200 p-4 dark:border-slate-800 sm:p-5">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            onKeyDown={event => { if (event.key === 'Enter' && results[0]) selectRoom(results[0]); }}
            placeholder="Contoh: 1A, ruang seminar, atau Algoritma"
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Gedung
              <select value={buildingFilter} onChange={event => { setBuildingFilter(event.target.value); setFloorFilter('all'); }} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                <option value="all">Semua gedung</option>
                {buildings.map(building => <option key={building.id} value={building.id}>{buildingLabels[building.id]?.trim() || building.shortName}</option>)}
              </select>
            </label>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Lantai
              <select value={floorFilter} onChange={event => setFloorFilter(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                <option value="all">Semua lantai</option>
                {floors.map(floor => <option key={floor} value={floor}>Lantai {floor}</option>)}
              </select>
            </label>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {!query.trim() && buildingFilter === 'all' && floorFilter === 'all' ? (
            <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">Masukkan kata pencarian atau pilih gedung dan lantai.</p>
          ) : results.length ? (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              <p className="pb-3 text-xs text-slate-500 dark:text-slate-400">{results.length} ruangan ditemukan</p>
              {results.map(room => (
                <button key={room.id} type="button" onClick={() => selectRoom(room)} className="flex w-full items-start justify-between gap-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">{room.code} · {room.name}</span>
                    <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{room.buildingShortName} · Lantai {room.floorNumber} · Kapasitas {room.capacity}</span>
                    {room.currentActivity && <span className="mt-1 block truncate text-xs text-emerald-700 dark:text-emerald-300">{room.currentActivity.title} · {room.currentActivity.startTime}–{room.currentActivity.endTime}</span>}
                  </span>
                  <span className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-medium ${room.status === 'available' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' : room.status === 'occupied' ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300' : room.status === 'reserved' ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                    {room.status === 'available' ? 'Tersedia' : room.status === 'occupied' ? 'Digunakan' : room.status === 'reserved' ? 'Terjadwal' : room.status === 'maintenance' ? 'Perbaikan' : 'Rusak'}
                  </span>
                </button>
              ))}
            </div>
          ) : <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">Tidak ada ruangan yang sesuai dengan pencarian dan filter.</p>}
        </div>

        <footer className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400 sm:px-5">
          <span>Pilih ruangan untuk membuka detailnya.</span>
          <span><kbd className="rounded border border-slate-300 px-1.5 py-0.5 dark:border-slate-700">Enter</kbd> pilih <span className="mx-1">·</span> <kbd className="rounded border border-slate-300 px-1.5 py-0.5 dark:border-slate-700">Esc</kbd> tutup</span>
        </footer>
      </section>
    </div>
  );
};
