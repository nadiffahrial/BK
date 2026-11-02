import React, { useState } from 'react';
import { Building, Floor, Room } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useGps } from '../../context/GpsContext';
import { 
  Box, 
  Layers, 
  Eye, 
  Maximize2, 
  Sliders, 
  Sparkles, 
  ArrowRight, 
  ChevronRight, 
  Leaf,
  Navigation,
  Compass,
  Radio,
  Users,
  CheckCircle2
} from 'lucide-react';

interface IsometricViewProps {
  building: Building;
  activeFloorNumber: number;
  onSelectFloor: (floorNumber: number) => void;
  onSelectRoom: (room: Room) => void;
}

export const IsometricView: React.FC<IsometricViewProps> = ({
  building,
  activeFloorNumber,
  onSelectFloor,
  onSelectRoom
}) => {
  const { isDark } = useTheme();
  const { deviceState, targetRoom: gpsTargetRoom, setTargetRoom } = useGps();

  const [isExploded, setIsExploded] = useState<boolean>(true);
  const [tiltAngle, setTiltAngle] = useState<number>(56);
  const [rotateAngle, setRotateAngle] = useState<number>(-30);
  const [hoveredFloor, setHoveredFloor] = useState<number | null>(null);
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);

  const getFloorStats = (floor: Floor) => {
    const total = floor.rooms.length;
    const occupied = floor.rooms.filter(r => r.status === 'occupied').length;
    const available = floor.rooms.filter(r => r.status === 'available').length;
    const reserved = floor.rooms.filter(r => r.status === 'reserved').length;
    const maintenance = floor.rooms.filter(r => r.status === 'maintenance').length;
    return { total, occupied, available, reserved, maintenance };
  };

  // Staircase step count and height calculation
  const zStepDistance = isExploded ? 145 : 45;
  const stairStepsCount = 7;

  return (
    <div
      id="isometric-3d-model-section"
      className="relative w-full bg-white dark:bg-slate-900 rounded-3xl border border-emerald-100 dark:border-slate-800 p-4 sm:p-6 shadow-sm overflow-hidden text-slate-800 dark:text-slate-100 transition-colors scroll-mt-20 ring-1 ring-emerald-500/20"
    >
      
      {/* 1. 3D Header Bar (Matching original user design) */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Model 3D Multi-Lantai Isometrik
                </h3>
                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Simulasi Tangga & Sekat
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Visualisasi tumpukan arsitektur {building.name} ({building.floorsCount} Lantai) • Universitas Siliwangi
              </p>
            </div>
          </div>
        </div>

        {/* 3D Interactive Controls: Exploded Mode & Rotation Sliders */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsExploded(!isExploded)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
              isExploded
                ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-emerald-600/25 ring-2 ring-emerald-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{isExploded ? 'Mode Pisah Lantai (Expanded)' : 'Mode Rapat (Compact)'}</span>
          </button>

          {/* Sudut Rotasi Slider */}
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 font-medium">
            <span>Sudut Rotasi:</span>
            <input
              type="range"
              min="-60"
              max="10"
              value={rotateAngle}
              onChange={(e) => setRotateAngle(Number(e.target.value))}
              className="w-20 accent-emerald-600 cursor-pointer"
            />
            <span className="font-mono text-[10px] text-slate-400 w-6">{rotateAngle}°</span>
          </div>

          {/* Kemiringan Slider */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 font-medium">
            <span>Kemiringan:</span>
            <input
              type="range"
              min="35"
              max="70"
              value={tiltAngle}
              onChange={(e) => setTiltAngle(Number(e.target.value))}
              className="w-16 accent-emerald-600 cursor-pointer"
            />
            <span className="font-mono text-[10px] text-slate-400 w-6">{tiltAngle}°</span>
          </div>
        </div>
      </div>

      {/* 2. 3D Staged Canvas with Multi-Lantai Layers */}
      <div className="relative min-h-[580px] flex items-center justify-center overflow-hidden py-14 perspective-1000 bg-gradient-to-b from-emerald-50/30 via-slate-50/50 to-white dark:from-slate-900/90 dark:via-slate-950 dark:to-slate-900/90 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors">
        
        {/* Ambient green blur backdrop */}
        <div className="absolute w-[500px] h-[500px] bg-emerald-300/15 rounded-full blur-[110px] pointer-events-none" />

        {/* 3D Isometric Stack Container */}
        <div
          className="relative transition-transform duration-700 ease-out"
          style={{
            transform: `perspective(1200px) rotateX(${tiltAngle}deg) rotateZ(${rotateAngle}deg)`,
            transformStyle: 'preserve-3d',
            width: '520px',
            height: '320px'
          }}
        >
          {/* ============================================================== */}
          {/* 🪜 SIMULASI TANGGA PENGHUBUNG 3D (Connecting Stairs Column)   */}
          {/* ============================================================== */}
          <div 
            className="absolute left-1 top-10 w-24 h-60 pointer-events-none transition-all duration-700"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Stair Column Foundation Shaft */}
            <div 
              className="absolute inset-0 rounded-2xl border-2 border-dashed border-emerald-400/60 dark:border-emerald-600/40 bg-emerald-50/30 dark:bg-emerald-950/20 backdrop-blur-xs flex flex-col justify-between p-2"
              style={{
                transform: `translateZ(${zStepDistance / 2}px)`,
                transformStyle: 'preserve-3d'
              }}
            >
              <div className="text-[9px] font-black text-emerald-800 dark:text-emerald-300 tracking-wider font-mono uppercase text-center bg-white/90 dark:bg-slate-900/90 px-1.5 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-700 shadow-2xs">
                AKSES TANGGA
              </div>
              <div className="text-[8px] text-emerald-600 dark:text-emerald-400 font-bold text-center">
                Lt 1 ↔ Lt 2
              </div>
            </div>

            {/* Stepped Stair Treads (Anak Tangga 3D Bertingkat) */}
            {Array.from({ length: stairStepsCount }).map((_, stepIdx) => {
              const currentStepZ = ((stepIdx + 1) * zStepDistance) / (stairStepsCount + 1);
              const stepY = 25 + stepIdx * 24;

              return (
                <div
                  key={stepIdx}
                  className="absolute left-2.5 w-18 h-4 rounded-md transition-all duration-700 border flex items-center justify-between px-1.5 shadow-sm"
                  style={{
                    transform: `translate3d(0, ${stepY}px, ${currentStepZ}px)`,
                    transformStyle: 'preserve-3d',
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    borderColor: '#10b981'
                  }}
                >
                  {/* Step Tread Indicator */}
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[7.5px] font-mono font-bold text-emerald-700 dark:text-emerald-300">
                      Tk.{stepIdx + 1}
                    </span>
                  </div>
                  {/* Step Height Notch */}
                  <span className="text-[6.5px] text-slate-400 font-bold">
                    ▲
                  </span>
                </div>
              );
            })}
          </div>

          {/* ============================================================== */}
          {/* 🏢 RENDERING LEMPENG LANTAI (TINGKAT 1 & TINGKAT 2)           */}
          {/* ============================================================== */}
          {building.floors.map((floor, index) => {
            const isSelected = floor.floorNumber === activeFloorNumber;
            const isHovered = hoveredFloor === floor.floorNumber;
            const stats = getFloorStats(floor);
            // Height elevation for 3D stacking
            const zDistance = index * zStepDistance;

            // Separate North (Rooms 1-3) and South (Rooms 4-6)
            const northRooms = floor.rooms.slice(0, 3);
            const southRooms = floor.rooms.slice(3, 6);

            return (
              <div
                key={floor.floorNumber}
                onMouseEnter={() => setHoveredFloor(floor.floorNumber)}
                onMouseLeave={() => setHoveredFloor(null)}
                onClick={() => onSelectFloor(floor.floorNumber)}
                className={`absolute inset-0 rounded-3xl cursor-pointer transition-all duration-700 ease-out ${
                  isSelected
                    ? 'border-2 border-emerald-600 shadow-[0_25px_50px_rgba(16,185,129,0.35)] ring-4 ring-emerald-500/15'
                    : isHovered
                    ? 'border-2 border-emerald-400 shadow-[0_15px_35px_rgba(16,185,129,0.22)]'
                    : 'border border-slate-200/90 dark:border-slate-700 shadow-[0_12px_28px_rgba(0,0,0,0.08)]'
                }`}
                style={{
                  transform: `translateZ(${zDistance}px)`,
                  transformStyle: 'preserve-3d',
                  backgroundColor: isDark
                    ? isSelected
                      ? 'rgba(30, 41, 59, 0.98)'
                      : isHovered
                      ? 'rgba(30, 41, 59, 0.92)'
                      : 'rgba(15, 23, 42, 0.92)'
                    : isSelected
                    ? 'rgba(255, 255, 255, 0.98)'
                    : isHovered
                    ? 'rgba(255, 255, 255, 0.95)'
                    : 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                
                {/* 🏷️ Floor Label Banner on Left (as in user screenshot) */}
                <div 
                  className="absolute -left-36 top-3 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-slate-800/95 backdrop-blur border border-emerald-200 dark:border-slate-700 text-xs shadow-md transition-transform"
                  style={{ transform: 'translateZ(10px)' }}
                >
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-600 animate-ping' : 'bg-slate-400'}`} />
                  <span className="font-extrabold text-slate-800 dark:text-slate-100">
                    Tingkat {floor.floorNumber}
                  </span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded font-bold">
                    {stats.available} kosong
                  </span>
                </div>

                {/* 📋 Floor Details Header */}
                <div 
                  className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between"
                  style={{ transform: 'translateZ(6px)' }}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9.5px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                        TINGKAT {floor.floorNumber}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[260px]">
                        {floor.name}
                      </h4>
                    </div>
                  </div>
                  <span className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}>
                    {isSelected ? 'Lantai Aktif' : 'Pilih Lantai'}
                  </span>
                </div>

                {/* ============================================================== */}
                {/* 🧱 SEKAT RUANGAN ARSITEKTURAL 3D (Dividers & Partition Walls) */}
                {/* ============================================================== */}
                <div 
                  className="p-3 flex flex-col justify-between h-[230px]"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  
                  {/* --- SISI UTARA (NORTH WING: 3 RUANGAN) --- */}
                  <div className="relative">
                    {/* Sekat Tepi Dinding Utara */}
                    <div className="absolute -top-1 left-0 right-0 h-1 bg-emerald-500/30 rounded-t-sm" />

                    <div className="grid grid-cols-3 gap-2 relative">
                      {northRooms.map((room, rIdx) => {
                        const isOcc = room.status === 'occupied';
                        const isAvail = room.status === 'available';
                        const isRes = room.status === 'reserved';
                        const isRoomHovered = hoveredRoomId === room.id;
                        const isTargetGps = gpsTargetRoom?.id === room.id;

                        return (
                          <div
                            key={room.id}
                            onMouseEnter={() => setHoveredRoomId(room.id)}
                            onMouseLeave={() => setHoveredRoomId(null)}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectFloor(floor.floorNumber);
                              onSelectRoom(room);
                              setTargetRoom(room);
                            }}
                            className={`relative p-2 rounded-xl text-left border-2 transition-all duration-300 cursor-pointer ${
                              isOcc
                                ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
                                : isAvail
                                ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-700'
                                : isRes
                                ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-700'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                            } ${
                              isRoomHovered || isTargetGps
                                ? 'scale-105 shadow-md -translate-y-1 ring-2 ring-emerald-500'
                                : 'shadow-2xs'
                            }`}
                            style={{
                              transform: `translateZ(${isRoomHovered || isTargetGps ? 14 : 4}px)`,
                              transformStyle: 'preserve-3d'
                            }}
                          >
                            {/* Sekat Dinding Vertikal Antar Ruangan (Partition Wall Lip) */}
                            {rIdx < 2 && (
                              <div className="absolute -right-2 top-0 bottom-0 w-1 bg-slate-300 dark:bg-slate-600 rounded-full opacity-60 pointer-events-none" />
                            )}

                            {/* Bukaan Kusen Pintu Sisi Koridor */}
                            <div className="absolute -bottom-1 left-4 w-4 h-1 bg-emerald-500 rounded-sm" title="Pintu Masuk Ruangan" />

                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[9px] font-black text-slate-800 dark:text-slate-100">
                                {room.code}
                              </span>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                isOcc ? 'bg-rose-500 animate-pulse' :
                                isAvail ? 'bg-emerald-500' :
                                isRes ? 'bg-amber-500' : 'bg-slate-400'
                              }`} />
                            </div>
                            <div className="text-[9.5px] text-slate-700 dark:text-slate-200 font-bold truncate mt-0.5">
                              {room.name}
                            </div>
                            <div className="text-[8px] text-slate-400 mt-1 flex items-center justify-between">
                              <span>{room.capacity} Kursi</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Detail →</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* --- 🚶 KORIDOR / SELASAR TENGAH DENGAN DINDING SEKAT --- */}
                  <div 
                    className="relative my-1 py-1.5 px-3 rounded-lg bg-emerald-500/10 dark:bg-emerald-950/30 border-y border-dashed border-emerald-300 dark:border-emerald-700/60 flex items-center justify-between"
                    style={{ transform: 'translateZ(6px)' }}
                  >
                    <div className="flex items-center gap-1.5 text-[8.5px] font-mono font-bold text-emerald-800 dark:text-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>KORIDOR TENGAH LT {floor.floorNumber}</span>
                    </div>

                    {/* IoT GPS Beacon on Corridor */}
                    {deviceState.floorNumber === floor.floorNumber && (
                      <div className="flex items-center gap-1 text-[8px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/80 px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-800 animate-pulse">
                        <Radio className="w-2.5 h-2.5 text-sky-500" />
                        <span>LOKASI ANDA</span>
                      </div>
                    )}

                    <span className="text-[8px] text-slate-400 font-bold">Selasar Utama</span>
                  </div>

                  {/* --- SISI SELATAN (SOUTH WING: 3 RUANGAN) --- */}
                  <div className="relative">
                    <div className="grid grid-cols-3 gap-2 relative">
                      {southRooms.map((room, rIdx) => {
                        const isOcc = room.status === 'occupied';
                        const isAvail = room.status === 'available';
                        const isRes = room.status === 'reserved';
                        const isRoomHovered = hoveredRoomId === room.id;
                        const isTargetGps = gpsTargetRoom?.id === room.id;

                        return (
                          <div
                            key={room.id}
                            onMouseEnter={() => setHoveredRoomId(room.id)}
                            onMouseLeave={() => setHoveredRoomId(null)}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectFloor(floor.floorNumber);
                              onSelectRoom(room);
                              setTargetRoom(room);
                            }}
                            className={`relative p-2 rounded-xl text-left border-2 transition-all duration-300 cursor-pointer ${
                              isOcc
                                ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
                                : isAvail
                                ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-700'
                                : isRes
                                ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-700'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                            } ${
                              isRoomHovered || isTargetGps
                                ? 'scale-105 shadow-md -translate-y-1 ring-2 ring-emerald-500'
                                : 'shadow-2xs'
                            }`}
                            style={{
                              transform: `translateZ(${isRoomHovered || isTargetGps ? 14 : 4}px)`,
                              transformStyle: 'preserve-3d'
                            }}
                          >
                            {/* Sekat Dinding Vertikal Antar Ruangan (Partition Wall Lip) */}
                            {rIdx < 2 && (
                              <div className="absolute -right-2 top-0 bottom-0 w-1 bg-slate-300 dark:bg-slate-600 rounded-full opacity-60 pointer-events-none" />
                            )}

                            {/* Bukaan Kusen Pintu Sisi Koridor */}
                            <div className="absolute -top-1 left-4 w-4 h-1 bg-emerald-500 rounded-sm" title="Pintu Masuk Ruangan" />

                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[9px] font-black text-slate-800 dark:text-slate-100">
                                {room.code}
                              </span>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                isOcc ? 'bg-rose-500 animate-pulse' :
                                isAvail ? 'bg-emerald-500' :
                                isRes ? 'bg-amber-500' : 'bg-slate-400'
                              }`} />
                            </div>
                            <div className="text-[9.5px] text-slate-700 dark:text-slate-200 font-bold truncate mt-0.5">
                              {room.name}
                            </div>
                            <div className="text-[8px] text-slate-400 mt-1 flex items-center justify-between">
                              <span>{room.capacity} Kursi</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Detail →</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Sekat Tepi Dinding Selatan */}
                    <div className="absolute -bottom-1 left-0 right-0 h-1 bg-emerald-500/30 rounded-b-sm" />
                  </div>

                </div>

                {/* 📊 Floor Footnotes & Mini Stats */}
                <div 
                  className="px-3.5 py-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[9.5px] font-bold text-slate-500 dark:text-slate-400"
                  style={{ transform: 'translateZ(6px)' }}
                >
                  <span className="text-emerald-700 dark:text-emerald-400">{stats.available} Ruang Kosong</span>
                  <span className="text-rose-600 dark:text-rose-400">{stats.occupied} Digunakan</span>
                  <span className="text-slate-500">{stats.total} Total Ruangan</span>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* 3. 3D Explanatory Footer */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <p className="flex items-center gap-2">
          <Leaf className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Tip Interaktif:</strong> Klik langsung pada balok lempeng lantai untuk berpindah tingkat, gunakan slider rotasi untuk memutar sudut pandang 3D, atau klik ruangan di dalam sekat untuk melihat rute jalan.
          </span>
        </p>
        <button
          onClick={() => onSelectFloor(activeFloorNumber)}
          className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
        >
          <span>Buka Denah 2D Skematik Tingkat {activeFloorNumber}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
