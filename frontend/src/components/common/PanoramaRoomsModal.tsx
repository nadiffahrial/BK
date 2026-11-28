import React, { useState } from 'react';
import { Building, Room } from '../../types';
import { 
  X, 
  Eye, 
  Sparkles, 
  Layers, 
  Box, 
  ArrowRight, 
  Compass, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Tv, 
  Headphones,
  Maximize2,
  Building2,
  Laptop,
  GraduationCap
} from 'lucide-react';

interface PanoramaRoomsModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildings: Building[];
  onOpenPanorama: (room: Room) => void;
  onNavigateToRoom: (buildingId: string, floorNumber: number, room: Room) => void;
  onOpenCs?: () => void;
}

export const PanoramaRoomsModal: React.FC<PanoramaRoomsModalProps> = ({
  isOpen,
  onClose,
  buildings,
  onOpenPanorama,
  onNavigateToRoom,
  onOpenCs
}) => {
  const [selectedBuildingFilter, setSelectedBuildingFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Collect all rooms that have panoramaUrl
  const allPanoramaRooms = buildings.flatMap(b =>
    b.floors.flatMap(f =>
      f.rooms
        .filter(r => Boolean(r.panoramaUrl))
        .map(r => ({
          ...r,
          buildingName: b.name,
          buildingCode: b.code,
          buildingShortName: b.shortName
        }))
    )
  );

  // Filtered available 360 rooms
  const filteredRooms = allPanoramaRooms.filter(r => {
    const matchesBuilding = selectedBuildingFilter === 'all' || r.buildingId === selectedBuildingFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      r.name.toLowerCase().includes(q) || 
      r.code.toLowerCase().includes(q) || 
      r.description.toLowerCase().includes(q);
    return matchesBuilding && matchesSearch;
  });

  // Upcoming rooms scheduled for 360 capture
  const upcomingRooms = [
    {
      code: '1D',
      name: 'R. Lab Pembelajaran Mesin & NLP',
      buildingName: 'Gedung LABTEK 1',
      floorNumber: 1,
      buildingId: 'gedung-a',
      status: 'Tahap Penjadwalan Foto',
      eta: 'Segera Hadir'
    },
    {
      code: '1K',
      name: 'R. Lab Riset Robotika & Sistem Cerdas (ROSTER)',
      buildingName: 'Gedung LABTEK 1',
      floorNumber: 1,
      buildingId: 'gedung-a',
      status: 'Tahap Penjadwalan Foto',
      eta: 'Segera Hadir'
    },
    {
      code: '1B',
      name: 'R. Sidang 1 Fakultas Teknik',
      buildingName: 'Gedung FT.1',
      floorNumber: 1,
      buildingId: 'gedung-b',
      status: 'Tahap Penjadwalan Foto',
      eta: 'Segera Hadir'
    },
    {
      code: '2F',
      name: 'R. Lab Riset Internet of Things (IoT)',
      buildingName: 'Gedung LABTEK 1',
      floorNumber: 2,
      buildingId: 'gedung-a',
      status: 'Tahap Penjadwalan Foto',
      eta: 'Segera Hadir'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-fade-in select-none">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-modal-spring"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Section */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-emerald-50/90 via-white dark:from-slate-800/90 dark:via-slate-900 to-teal-50/40 dark:to-slate-800/60 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20 shrink-0">
              <Eye className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  Fitur Virtual Tour Kampus
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                  {allPanoramaRooms.length} Ruangan Siap Jelajah
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Menu Ruangan Berfitur Panorama 360°
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                Jelajahi suasana ruangan kampus Universitas Siliwangi secara imersif dan interaktif dalam format Ultra-HD tanpa distorsi.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Tutup Menu 360°"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="px-5 sm:px-6 py-3 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">Gedung:</span>
            {[
              { id: 'all', label: 'Semua Gedung' },
              { id: 'gedung-a', label: 'LABTEK 1' },
              { id: 'gedung-b', label: 'FT.1' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedBuildingFilter(tab.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedBuildingFilter === tab.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mode Ultra-HD Silinder & Bola 360° Tersedia</span>
          </div>
        </div>

        {/* Scrollable Room Cards Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Section 1: Ready 360 Rooms */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Ruangan dengan Fitur 360° Siap Digunakan
              </h3>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                {filteredRooms.length} Ruangan Aktif
              </span>
            </div>

            {filteredRooms.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500">Tidak ada ruangan 360° yang cocok dengan filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredRooms.map(room => (
                  <div
                    key={room.id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-800/80 border border-emerald-200 dark:border-slate-700 shadow-md hover:shadow-xl hover:border-emerald-500 transition-all group flex flex-col md:flex-row gap-5 items-stretch"
                  >
                    {/* Visual Preview / Thumbnail Banner */}
                    <div className="relative md:w-72 h-44 md:h-auto rounded-2xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200 dark:border-slate-700">
                      <img
                        src={room.panoramaUrl || './panoramas/labkom-1j.jpg'}
                        alt={room.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-black/20 to-transparent" />
                      
                      {/* 360 Floating Badge */}
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md text-white text-[11px] font-black border border-white/20 flex items-center gap-1.5 shadow-md">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>360° Ultra-HD</span>
                      </div>

                      {/* Compass Heading Tag */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px] font-bold drop-shadow">
                        <span className="flex items-center gap-1">
                          <Compass className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Panorama Lengkung & 360°</span>
                        </span>
                        <span className="bg-emerald-600/90 px-2 py-0.5 rounded-md text-[10px]">
                          Aktif
                        </span>
                      </div>
                    </div>

                    {/* Room Metadata & Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        {/* Badges row */}
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-lg bg-emerald-500 text-slate-950 shadow-xs">
                            {room.code}
                          </span>
                          <span className="text-xs px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-600">
                            {room.buildingId === 'gedung-a' ? 'Gedung LABTEK 1' : 'Gedung FT.1'} • Tingkat {room.floorNumber}
                          </span>
                          {room.status === 'available' && (
                            <span className="text-xs px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                              Tersedia untuk Digunakan
                            </span>
                          )}
                          {room.status === 'reserved' && (
                            <span className="text-xs px-2.5 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800">
                              Memiliki Jadwal
                            </span>
                          )}
                          {room.status === 'occupied' && (
                            <span className="text-xs px-2.5 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800">
                              Sedang Digunakan
                            </span>
                          )}
                          {room.status === 'maintenance' && (
                            <span className="text-xs px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-300 dark:border-slate-700">
                              Pemeliharaan
                            </span>
                          )}
                          {room.status === 'broken' && (
                            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">Rusak</span>
                          )}
                        </div>

                        <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                          {room.name}
                        </h4>
                        
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                          {room.description}
                        </p>

                        {/* Facilities snippet */}
                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-bold text-slate-400">Fasilitas Utama:</span>
                          {room.facilities && room.facilities.length > 0 ? (
                            room.facilities.slice(0, 2).map((fac, fIdx) => (
                              <span 
                                key={fIdx}
                                className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700/60 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1"
                              >
                                <Tv className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                {fac.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700/60 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                              Workstation Komputer & AC
                            </span>
                          )}
                          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700/60 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                            Kapasitas: {room.capacity} Mahasiswa
                          </span>
                        </div>
                      </div>

                      {/* Action CTA Buttons */}
                      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2.5 flex-wrap">
                        <button
                          onClick={() => {
                            onClose();
                            onOpenPanorama(room);
                          }}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer group"
                        >
                          <Eye className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform" />
                          <span>Buka Tur 360° Sekarang</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            onClose();
                            onNavigateToRoom(room.buildingId, room.floorNumber, room);
                          }}
                          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold text-xs transition-colors cursor-pointer"
                        >
                          <Box className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Tampilkan di Denah 3D</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Upcoming Rooms in Development */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                Ruangan Tahap Penambahan Tur 360° Berikutnya
              </h3>
              <span className="text-[11px] font-bold text-slate-400">
                Dalam Proses Dokumentasi
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {upcomingRooms.map((upRoom, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-mono font-black text-xs flex items-center justify-center shrink-0">
                      {upRoom.code}
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                        {upRoom.name}
                      </h5>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {upRoom.buildingName} • Tingkat {upRoom.floorNumber}
                      </span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0">
                    {upRoom.eta}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Usulkan Ruangan Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-800 border border-emerald-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-sm shrink-0 hidden sm:block">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-extrabold text-slate-900 dark:text-white">
                  Ingin Ruangan Anda Ditambahkan ke Tur 360°?
                </h5>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Dosen, pengelola lab, atau himpunan mahasiswa dapat mengajukan dokumentasi foto panorama 360° melalui Layanan CS Kampus.
                </p>
              </div>
            </div>

            {onOpenCs && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCs();
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shrink-0 cursor-pointer shadow-xs"
              >
                Hubungi CS Kampus
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
