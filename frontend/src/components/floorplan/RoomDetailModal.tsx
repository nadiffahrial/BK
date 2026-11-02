import React from 'react';
import { Room, RoomStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useGps } from '../../context/GpsContext';
import { 
  X, 
  Users, 
  Thermometer, 
  Wind, 
  Wifi, 
  Tv, 
  Cpu, 
  Calendar, 
  Clock, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Leaf
} from 'lucide-react';

interface RoomDetailModalProps {
  room: Room | null;
  onClose: () => void;
  onTogglePathGuide: (roomId: string) => void;
  isPathActive: boolean;
  onUpdateRoomStatus?: (roomId: string, newStatus: RoomStatus) => void;
  onOpenBooking?: (room: Room) => void;
}

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  room,
  onClose,
  onTogglePathGuide,
  isPathActive,
  onUpdateRoomStatus,
  onOpenBooking
}) => {
  const { user } = useAuth();
  const { setTargetRoom } = useGps();
  if (!room) return null;

  const isAdmin = user?.role === 'admin';

  const getStatusBadge = (status: RoomStatus) => {
    switch (status) {
      case 'available':
        return { label: 'Tersedia untuk Digunakan', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'occupied':
        return { label: 'Sedang Berlangsung Kegiatan', color: 'bg-rose-100 text-rose-800 border-rose-300' };
      case 'reserved':
        return { label: 'Sudah Direservasi', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'maintenance':
        return { label: 'Dalam Pemeliharaan / Servis', color: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  const badge = getStatusBadge(room.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl border border-emerald-100 dark:border-slate-800 shadow-2xl overflow-y-auto flex flex-col justify-between animate-slide-up text-slate-800 dark:text-slate-100 transition-colors"
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
              <span className={`text-xs px-2.5 py-1 rounded-lg border font-bold ${badge.color}`}>
                {badge.label}
              </span>
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
        <div className="p-6 space-y-6 text-sm text-slate-600">
          
          {/* ⭐ Petunjuk Arah Jalan untuk Mahasiswa (Student Wayfinding Guide) ⭐ */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white border border-emerald-200 shadow-xs">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-800 uppercase tracking-wider">
                <Navigation className="w-4 h-4 text-emerald-600" />
                <span>Panduan Menuju Ruangan Ini (Untuk Mahasiswa)</span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-white text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                Tingkat {room.floorNumber}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="font-extrabold text-emerald-800 shrink-0">1. Gedung:</span>
                <span>Masuk melalui Lobi Utama {room.buildingId === 'gedung-a' ? 'Gedung LABTEK 1' : 'Gedung FT.1'}.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-extrabold text-emerald-800 shrink-0">2. Akses Lantai:</span>
                <span>{room.floorNumber === 1 ? 'Ruangan berada di Lantai Dasar (Tingkat 1) sepanjang koridor utama.' : 'Gunakan Lift atau Tangga Utama naik 1 lantai menuju Tingkat 2.'}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-extrabold text-emerald-800 shrink-0">3. Posisi Ruang:</span>
                <span>{room.description}</span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-emerald-200/70 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-emerald-800 font-semibold">Tampilkan garis rute pejalan kaki di peta denah:</span>
              <button
                type="button"
                onClick={() => onTogglePathGuide(room.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isPathActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{isPathActive ? '✓ Rute Aktif di Denah' : 'Tampilkan Garis Rute Jalan'}</span>
              </button>
            </div>
          </div>
          
          {/* Admin Quick Status Switcher */}
          {isAdmin && onUpdateRoomStatus && (
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
              <div className="flex items-center gap-2 mb-2.5 text-xs font-bold text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Panel Kontrol Admin — Ubah Status Real-time:</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['available', 'occupied', 'reserved', 'maintenance'] as RoomStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => onUpdateRoomStatus(room.id, st)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                      room.status === st
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white hover:bg-emerald-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {st === 'available' ? 'Tersedia' : st === 'occupied' ? 'Digunakan' : st === 'reserved' ? 'Reservasi' : 'Servis'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <p className="text-slate-700 leading-relaxed text-sm font-medium">
            {room.description}
          </p>

          {/* Environmental Sensor Telemetry Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-white border border-emerald-100 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold">Kapasitas Maks</span>
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-lg font-extrabold text-slate-900">{room.capacity} <span className="text-xs font-normal text-slate-500">orang</span></div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-emerald-100 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold">Suhu Ruangan</span>
                <Thermometer className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-lg font-extrabold text-teal-700">{room.temperature ?? 22}°C</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-emerald-100 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold">Unit AC</span>
                <Wind className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-lg font-extrabold text-slate-900">{room.acUnits ?? 2} <span className="text-xs font-normal text-slate-500">Unit</span></div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-emerald-100 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold">WiFi Kampus</span>
                <Wifi className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-lg font-extrabold text-emerald-700">500 <span className="text-xs font-normal text-slate-500">Mbps</span></div>
            </div>
          </div>

          {/* Current Ongoing Activity */}
          {room.currentActivity && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wider mb-1">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Sedang Berlangsung Saat Ini ({room.currentActivity.startTime} - {room.currentActivity.endTime} WIB)</span>
              </div>
              <h4 className="text-base font-extrabold text-slate-900 mt-1">{room.currentActivity.title}</h4>
              <div className="mt-2 text-xs text-slate-700 space-y-0.5 font-medium">
                <p>👤 <span className="text-slate-500">Penanggung Jawab:</span> {room.currentActivity.personInCharge}</p>
                <p>🏛 <span className="text-slate-500">Departemen / Unit:</span> {room.currentActivity.department}</p>
              </div>
            </div>
          )}

          {/* Facilities List */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Fasilitas & Perlengkapan Ruangan
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {room.facilities.map((fac, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-800">{fac.name}</div>
                      {fac.spec && <div className="text-[10px] text-slate-500">{fac.spec}</div>}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                    Tersedia
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Agenda Timeline */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-600" />
              Jadwal & Agenda Hari Ini
            </h4>
            {room.schedule.length > 0 ? (
              <div className="space-y-2">
                {room.schedule.map((item) => (
                  <div key={item.id} className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-sm">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{item.title}</div>
                      <div className="text-[11px] text-slate-500">Penyelenggara: {item.organizer}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        {item.timeRange}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1">{item.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                Belum ada reservasi terjadwal lainnya untuk hari ini.
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                onTogglePathGuide(room.id);
                setTargetRoom(isPathActive ? null : room);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isPathActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
              }`}
            >
              <Navigation className="w-4 h-4 animate-pulse" />
              <span>{isPathActive ? 'Sembunyikan Rute Jalan' : 'Tampilkan Rute Jalan (IoT GPS)'}</span>
            </button>

            {onOpenBooking && (
              <button
                type="button"
                onClick={() => onOpenBooking(room)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Ajukan Peminjaman Ruang</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
