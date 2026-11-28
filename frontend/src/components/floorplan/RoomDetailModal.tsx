import React, { useState } from 'react';
import { Room, RoomStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { RoomPanoramaModal } from './RoomPanoramaModal';
import { X, Users, Clock, MapPin, Navigation, ArrowRight, ShieldCheck, Eye } from 'lucide-react';

interface RoomDetailModalProps {
  room: Room | null;
  onClose: () => void;
  onTogglePathGuide: (roomId: string) => void;
  isPathActive: boolean;
  onUpdateRoomStatus?: (roomId: string, newStatus: RoomStatus) => void;
}

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  room,
  onClose,
  onTogglePathGuide,
  isPathActive,
  onUpdateRoomStatus
}) => {
  const { user } = useAuth();
  const [isPanoramaOpen, setIsPanoramaOpen] = useState<boolean>(false);
  if (!room) return null;

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isUtilityRoom = /\b(wc|toilet|kamar mandi|tangga|r\.?\s*panel|ruang panel|panel listrik|wudhu|mushola|musala)\b/i.test(room.name);
  const statusOptions: RoomStatus[] = isUtilityRoom
    ? ['available', 'maintenance', 'broken']
    : ['available', 'occupied', 'reserved', 'maintenance', 'broken'];

  const getStatusBadge = (status: RoomStatus) => {
    switch (status) {
      case 'available':
        return { label: 'Tersedia untuk Digunakan', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'occupied':
        return { label: 'Sedang Berlangsung Kegiatan', color: 'bg-rose-100 text-rose-800 border-rose-300' };
      case 'reserved':
        return { label: 'Memiliki Jadwal', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'maintenance':
        return { label: 'Dalam Maintenance', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'broken':
        return { label: 'Rusak', color: 'bg-rose-100 text-rose-800 border-rose-300' };
    }
  };

  const badge = getStatusBadge(room.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl border border-emerald-100 dark:border-slate-800 shadow-2xl overflow-y-auto flex flex-col justify-between animate-modal-spring text-slate-800 dark:text-slate-100 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {room.code}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border dark:border-slate-700">
                {room.buildingId === 'gedung-a' ? 'Gedung LABTEK 1' : 'Gedung FT.1'} • Tingkat {room.floorNumber}
              </span>
              {!isUtilityRoom && <span className={`text-xs px-2.5 py-1 rounded-lg border font-bold ${badge.color}`}>{badge.label}</span>}
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{room.name}</h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 text-sm text-slate-600 dark:text-slate-300">
          
          {isUtilityRoom ? (
            <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60" aria-live="polite">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Status fasilitas</div>
              <div className="mt-2 flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${room.status === 'broken' ? 'bg-rose-600' : room.status === 'maintenance' ? 'bg-amber-500' : 'bg-emerald-600'}`} />
                <span className="text-base font-bold text-slate-900 dark:text-white">{badge.label}</span>
              </div>
            </section>
          ) : (
          <>
          {/* Panorama details are shown only for regular rooms. */}
          {room.panoramaUrl && (
            <div className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/70 dark:bg-emerald-950/25 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-700 dark:bg-slate-900 dark:text-emerald-300">
                  <Eye className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">Panorama 360°</h4>
                  <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">Lihat foto panorama ruangan ini.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPanoramaOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-700 bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-800 dark:border-emerald-600 dark:bg-emerald-700 dark:hover:bg-emerald-600"
              >
                Buka panorama <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <div className="mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">Lokasi & akses</h4>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs text-slate-500 dark:text-slate-400">{room.buildingId === 'gedung-a' ? 'Gedung LABTEK 1' : 'Gedung FT.1'} · Lantai {room.floorNumber}</p>
                {!isUtilityRoom && <p className="mt-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{room.description}</p>}
              </div>
            </div>
          </section>
          
          {/* Admin Quick Status Switcher */}
          {isAdmin && onUpdateRoomStatus && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <ShieldCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                <span>Ubah status ruangan</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {statusOptions.map((st) => (
                  <button
                    key={st}
                    onClick={() => onUpdateRoomStatus(room.id, st)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                      room.status === st
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'border border-slate-300 bg-white text-slate-700 hover:border-emerald-500 hover:bg-emerald-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    {st === 'available' ? (isUtilityRoom ? 'Baik' : 'Tersedia') : st === 'occupied' ? 'Digunakan' : st === 'reserved' ? 'Terjadwal' : st === 'maintenance' ? 'Maintenance' : 'Rusak'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Room details for rooms with occupancy and equipment. */}
          {/* Room capacity and equipment availability */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {[
              { label: 'Kapasitas', value: `${room.capacity} orang` },
              { label: 'Penghuni', value: `${room.currentOccupancy ?? 0} orang` },
              { label: 'Peralatan tersedia', value: `${room.facilities.filter(item => item.available).length} dari ${room.facilities.length}` }
            ].map(item => (
              <div key={item.label} className="rounded-lg border border-slate-200 bg-white px-3.5 py-3 dark:border-slate-700 dark:bg-slate-800/50">
                <div className="text-xs text-slate-500 dark:text-slate-400">{item.label}</div>
                <div className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{item.value}</div>
              </div>
            ))}
          </div>

          {/* Current Ongoing Activity */}
          {room.currentActivity && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/20">
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
                <Clock className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                <span>Sedang Berlangsung Saat Ini ({room.currentActivity.startTime} - {room.currentActivity.endTime} WIB)</span>
              </div>
              <h4 className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">{room.currentActivity.title}</h4>
              <div className="mt-2 space-y-0.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                <p><span className="text-slate-500 dark:text-slate-400">Penanggung jawab:</span> {room.currentActivity.personInCharge}</p>
                <p><span className="text-slate-500 dark:text-slate-400">Unit:</span> {room.currentActivity.department}</p>
              </div>
            </div>
          )}

          {/* Facilities List */}
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Peralatan
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {room.facilities.map((fac, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2.5">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${fac.available ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                    <div>
                      <div className="text-xs font-medium text-slate-800 dark:text-slate-100">{fac.name}</div>
                      {fac.spec && <div className="text-[10px] text-slate-500 dark:text-slate-400">{fac.spec}</div>}
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold ${fac.available ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                    {fac.available ? 'Tersedia' : 'Tidak tersedia'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          </>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/80 sm:px-6">
          {isUtilityRoom ? (
            <button
              type="button"
              onClick={() => onTogglePathGuide(room.id)}
              className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors ${isPathActive ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-emerald-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'}`}
            >
              <Navigation className="h-4 w-4" />
              {isPathActive ? 'Sembunyikan rute' : 'Tampilkan rute'}
            </button>
          ) : <span />}
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Tutup
          </button>
        </div>

      </div>

      {/* 360 Degree Panorama Virtual Tour Modal */}
      {room.panoramaUrl && (
        <RoomPanoramaModal
          room={room}
          isOpen={isPanoramaOpen}
          onClose={() => setIsPanoramaOpen(false)}
        />
      )}
    </div>
  );
};
