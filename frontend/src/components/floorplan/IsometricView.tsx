import React, { useState } from 'react';
import { Building, Floor, Room } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useGps } from '../../context/GpsContext';
import { 
  Box, 
  Layers, 
  ChevronRight, 
  Leaf,
  Radio,
  Sparkles,
  MapPin,
  Users,
  CheckCircle2,
  Tv,
  Droplets,
  Zap,
  Flame
} from 'lucide-react';

interface IsometricViewProps {
  building: Building;
  activeFloorNumber: number;
  onSelectFloor: (floorNumber: number) => void;
  onSelectRoom: (room: Room) => void;
  selectedRoom?: Room | null;
}

export const IsometricView: React.FC<IsometricViewProps> = ({
  building,
  activeFloorNumber,
  onSelectFloor,
  onSelectRoom,
  selectedRoom
}) => {
  const { isDark } = useTheme();
  const { deviceState, targetRoom: gpsTargetRoom, setTargetRoom } = useGps();

  const [isExploded, setIsExploded] = useState<boolean>(true);
  const [tiltAngle, setTiltAngle] = useState<number>(56);
  const [rotateAngle, setRotateAngle] = useState<number>(-28);
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

  const getStatusFill = (status: Room['status'], isSelected: boolean, isHovered: boolean) => {
    if (isSelected) return isDark ? 'rgba(5, 150, 105, 0.45)' : 'rgba(16, 185, 129, 0.35)';
    if (isHovered) return isDark ? 'rgba(5, 150, 105, 0.3)' : 'rgba(16, 185, 129, 0.2)';
    switch (status) {
      case 'available':
        return isDark ? 'rgba(16, 185, 129, 0.18)' : '#f0fdf4';
      case 'occupied':
        return isDark ? 'rgba(244, 63, 94, 0.22)' : '#fff1f2';
      case 'reserved':
        return isDark ? 'rgba(245, 158, 11, 0.2)' : '#fffbeb';
      case 'maintenance':
        return isDark ? 'rgba(148, 163, 184, 0.15)' : '#f8fafc';
      default:
        return isDark ? '#1e293b' : '#ffffff';
    }
  };

  const getStatusStroke = (status: Room['status'], isSelected: boolean, isHovered: boolean) => {
    if (isSelected) return '#059669';
    if (isHovered) return '#10b981';
    switch (status) {
      case 'available':
        return '#10b981';
      case 'occupied':
        return '#f43f5e';
      case 'reserved':
        return '#f59e0b';
      case 'maintenance':
        return '#94a3b8';
      default:
        return '#cbd5e1';
    }
  };

  // Vertical distance between stacked 3D floor slabs
  const zStepDistance = isExploded ? 180 : 50;

  return (
    <div
      id="isometric-3d-model-section"
      className="relative w-full bg-white dark:bg-slate-900 rounded-3xl border border-emerald-100 dark:border-slate-800 p-4 sm:p-6 shadow-sm overflow-hidden text-slate-800 dark:text-slate-100 transition-colors scroll-mt-20 ring-1 ring-emerald-500/20"
    >
      
      {/* 1. 3D Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Model 3D Multi-Lantai Isometrik ({building.shortName})
                </h3>
                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Denah Arsitektur Asli 3D
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Visualisasi 3D cetak biru arsitektur {building.name} ({building.floorsCount} Lantai) • Universitas Siliwangi
              </p>
            </div>
          </div>
        </div>

        {/* 3D Interactive Controls: Exploded Mode & Rotation Sliders */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsExploded(!isExploded)}
            className={`smooth-btn flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
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
      <div className="relative min-h-[620px] flex items-center justify-center overflow-hidden py-16 perspective-1000 bg-gradient-to-b from-emerald-50/30 via-slate-50/50 to-white dark:from-slate-900/90 dark:via-slate-950 dark:to-slate-900/90 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors">
        
        {/* Ambient green blur backdrop */}
        <div className="absolute w-[600px] h-[600px] bg-emerald-300/15 rounded-full blur-[120px] pointer-events-none" />

        {/* 3D Isometric Stack Container */}
        <div
          className="relative transition-transform duration-700 ease-smooth"
          style={{
            transform: `perspective(1300px) rotateX(${tiltAngle}deg) rotateZ(${rotateAngle}deg)`,
            transformStyle: 'preserve-3d',
            width: '780px',
            height: '355px'
          }}
        >
          {/* ============================================================== */}
          {/* 🏢 RENDERING LEMPENG LANTAI CETAK BIRU 3D MULTI-LANTAI         */}
          {/* ============================================================== */}
          {building.floors.map((floor, index) => {
            const isSelected = floor.floorNumber === activeFloorNumber;
            const isHovered = hoveredFloor === floor.floorNumber;
            const stats = getFloorStats(floor);
            // Height elevation for 3D stacking
            const zDistance = index * zStepDistance;

            return (
              <div
                key={floor.floorNumber}
                onMouseEnter={() => setHoveredFloor(floor.floorNumber)}
                onMouseLeave={() => setHoveredFloor(null)}
                onClick={() => onSelectFloor(floor.floorNumber)}
                className={`absolute inset-0 rounded-2xl cursor-pointer transition-all duration-700 ease-smooth ${
                  isSelected
                    ? 'border-2 border-emerald-600 shadow-[0_30px_60px_rgba(16,185,129,0.38)] ring-4 ring-emerald-500/20'
                    : isHovered
                    ? 'border-2 border-emerald-400 shadow-[0_20px_40px_rgba(16,185,129,0.22)]'
                    : 'border border-slate-300/90 dark:border-slate-700 shadow-[0_15px_30px_rgba(0,0,0,0.12)]'
                }`}
                style={{
                  transform: `translateZ(${zDistance}px)`,
                  transformStyle: 'preserve-3d',
                  backgroundColor: isDark
                    ? isSelected
                      ? 'rgba(15, 23, 42, 0.98)'
                      : isHovered
                      ? 'rgba(15, 23, 42, 0.92)'
                      : 'rgba(15, 23, 42, 0.88)'
                    : isSelected
                    ? 'rgba(255, 255, 255, 0.98)'
                    : isHovered
                    ? 'rgba(255, 255, 255, 0.95)'
                    : 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                
                {/* 🏷️ Floor Label Banner on Left (Outside slab in 3D) */}
                <div 
                  className="absolute -left-40 top-3 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-slate-800/95 backdrop-blur border border-emerald-200 dark:border-slate-700 text-xs shadow-md transition-transform"
                  style={{ transform: 'translateZ(15px)' }}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-emerald-600 animate-ping' : 'bg-slate-400'}`} />
                  <span className="font-extrabold text-slate-800 dark:text-slate-100">
                    Tingkat {floor.floorNumber}
                  </span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded font-bold">
                    {stats.available} kosong
                  </span>
                </div>

                {/* 📋 Floor Details Header in 3D */}
                <div 
                  className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between"
                  style={{ transform: 'translateZ(8px)' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9.5px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                      TINGKAT {floor.floorNumber}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {floor.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9.5px] text-emerald-700 dark:text-emerald-400 font-bold">
                      {stats.available} Tersedia • {stats.occupied} Digunakan
                    </span>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}>
                      {isSelected ? 'Lantai Aktif' : 'Pilih Lantai'}
                    </span>
                  </div>
                </div>

                {/* ============================================================== */}
                {/* 🗺️ ACTUAL ARCHITECTURAL BLUEPRINT SVG PROJECTED IN 3D SLAB   */}
                {/* ============================================================== */}
                <div 
                  className="p-2 relative w-full h-[300px]"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <svg
                    viewBox="0 0 1100 500"
                    className="w-full h-full"
                    style={{ transform: 'translateZ(4px)' }}
                  >
                    <defs>
                      <linearGradient id={`corridor-grad-${floor.floorNumber}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
                        <stop offset="50%" stopColor="#10b981" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
                      </linearGradient>
                    </defs>

                    {/* Outer Building Concrete Walls */}
                    <rect
                      x="18"
                      y="18"
                      width="1064"
                      height="464"
                      rx="14"
                      fill={isDark ? '#0b1120' : '#ffffff'}
                      stroke={isSelected ? '#059669' : '#334155'}
                      strokeWidth="3.5"
                    />

                    {/* Central Corridor Hallway */}
                    <rect
                      x="28"
                      y="235"
                      width="1044"
                      height="30"
                      fill={`url(#corridor-grad-${floor.floorNumber})`}
                      stroke="#10b981"
                      strokeWidth="1.5"
                      strokeDasharray="5 3"
                    />
                    <text
                      x="550"
                      y="254"
                      textAnchor="middle"
                      fill={isDark ? '#34d399' : '#065f46'}
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                      letterSpacing="3"
                    >
                      KORIDOR TENGAH LANTAI {floor.floorNumber}
                    </text>

                    {/* All Blueprint Rooms Rendered at exact coordinates */}
                    {floor.rooms.map((room) => {
                      const { x, y, w, h, doorPosition } = room.coordinates;
                      const isRoomSelected = selectedRoom?.id === room.id;
                      const isRoomHovered = hoveredRoomId === room.id;
                      const isStairs = room.code === 'TANGGA';
                      const isCompact = w < 85 || h < 110;

                      return (
                        <g
                          key={room.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectFloor(floor.floorNumber);
                            onSelectRoom(room);
                            setTargetRoom(room);
                          }}
                          onMouseEnter={() => setHoveredRoomId(room.id)}
                          onMouseLeave={() => setHoveredRoomId(null)}
                          className="cursor-pointer transition-all duration-200"
                        >
                          {/* Room Box */}
                          <rect
                            x={x}
                            y={y}
                            width={w}
                            height={h}
                            rx="8"
                            fill={getStatusFill(room.status, isRoomSelected, isRoomHovered)}
                            stroke={getStatusStroke(room.status, isRoomSelected, isRoomHovered)}
                            strokeWidth={isRoomSelected ? '3.5' : isRoomHovered ? '2.5' : '1.5'}
                            filter={isRoomSelected ? 'drop-shadow(0 0 8px rgba(16,185,129,0.6))' : undefined}
                          />

                          {/* Door indicator */}
                          {doorPosition === 'bottom' && (
                            <line x1={x + w / 2 - 12} y1={y + h} x2={x + w / 2 + 12} y2={y + h} stroke="#059669" strokeWidth="2.5" />
                          )}
                          {doorPosition === 'top' && (
                            <line x1={x + w / 2 - 12} y1={y} x2={x + w / 2 + 12} y2={y} stroke="#059669" strokeWidth="2.5" />
                          )}
                          {doorPosition === 'left' && (
                            <line x1={x} y1={y + h / 2 - 12} x2={x} y2={y + h / 2 + 12} stroke="#059669" strokeWidth="2.5" />
                          )}
                          {doorPosition === 'right' && (
                            <line x1={x + w} y1={y + h / 2 - 12} x2={x + w} y2={y + h / 2 + 12} stroke="#059669" strokeWidth="2.5" />
                          )}

                          {isStairs ? (
                            /* Architectural Staircase Chevron Cross */
                            <g pointerEvents="none">
                              <line x1={x + 3} y1={y + 3} x2={x + w - 3} y2={y + h - 3} stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="3 2" />
                              <line x1={x + w - 3} y1={y + 3} x2={x + 3} y2={y + h - 3} stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="3 2" />
                              <path d={`M ${x + w/2 - 10} ${y + h/2 + 6} L ${x + w/2} ${y + h/2 - 6} L ${x + w/2 + 10} ${y + h/2 + 6}`} fill="none" stroke="#059669" strokeWidth="2.5" />
                              <text x={x + w / 2} y={y + h - 14} textAnchor="middle" fill="#047857" fontSize="9" fontWeight="bold" fontFamily="monospace">
                                TANGGA
                              </text>
                            </g>
                          ) : (
                            /* Regular Room Labels */
                            <g pointerEvents="none">
                              {/* Room Code Badge */}
                              <rect
                                x={x + (isCompact ? 4 : 8)}
                                y={y + 6}
                                width={isCompact ? Math.min(46, w - 8) : Math.min(54, w - 16)}
                                height="18"
                                rx="4"
                                fill={isDark ? '#1e293b' : '#ffffff'}
                                stroke={getStatusStroke(room.status, isRoomSelected, isRoomHovered)}
                                strokeWidth="1.2"
                              />
                              <text
                                x={x + (isCompact ? 4 : 8) + (isCompact ? Math.min(46, w - 8) : Math.min(54, w - 16)) / 2}
                                y={y + 18}
                                textAnchor="middle"
                                fill={isDark ? '#f1f5f9' : '#0f172a'}
                                fontSize={room.code.length > 5 ? "8" : "9.5"}
                                fontWeight="bold"
                                fontFamily="monospace"
                              >
                                {room.code}
                              </text>

                              {/* Status dot */}
                              <circle
                                cx={x + w - (isCompact ? 8 : 12)}
                                cy={y + 14}
                                r="3.5"
                                fill={getStatusStroke(room.status, false, false)}
                              />

                              {/* Room Name Text */}
                              <text
                                x={x + (isCompact ? 4 : 8)}
                                y={y + 36}
                                fill={isDark ? '#e2e8f0' : '#1e293b'}
                                fontSize={isCompact ? "8.5" : "10"}
                                fontWeight="bold"
                              >
                                {room.name.length > 18 ? room.name.substring(0, 16) + '..' : room.name}
                              </text>

                              {/* Capacity */}
                              <text
                                x={x + (isCompact ? 4 : 8)}
                                y={y + h - 12}
                                fill="#64748b"
                                fontSize="8.5"
                                fontWeight="600"
                              >
                                👥 {room.capacity}
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* 📊 Bottom summary bar on slab */}
                <div 
                  className="px-4 py-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[9px] font-bold text-slate-500 dark:text-slate-400"
                  style={{ transform: 'translateZ(8px)' }}
                >
                  <span className="text-emerald-700 dark:text-emerald-400">
                    ✦ Sisi Utara: {floor.rooms.filter(r => r.coordinates.y < 250).length} Ruang
                  </span>
                  <span className="text-teal-700 dark:text-teal-400">
                    ✦ Sisi Selatan: {floor.rooms.filter(r => r.coordinates.y >= 250).length} Ruang
                  </span>
                  <span className="text-slate-600 dark:text-slate-300">
                    Total {floor.rooms.length} Ruang & Fasilitas
                  </span>
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
            <strong>Denah 3D Arsitektur Presisi:</strong> Model 3D ini memetakan seluruh ruangan ({building.shortName}) di sisi Utara & Selatan sesuai cetak biru asli. Ketuk ruangan manapun di model 3D untuk memilih dan melihat rute.
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
