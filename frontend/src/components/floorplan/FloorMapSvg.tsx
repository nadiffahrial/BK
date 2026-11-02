import React, { useState } from 'react';
import { Room, Floor } from '../../types';
import { useGps } from '../../context/GpsContext';
import { 
  Users, 
  Thermometer, 
  Navigation, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  Leaf,
  Radio,
  Crosshair,
  Compass
} from 'lucide-react';

interface FloorMapSvgProps {
  floor: Floor;
  selectedRoom: Room | null;
  onSelectRoom: (room: Room) => void;
  statusFilter: string;
  activePathRoomId: string | null;
  onTogglePathGuide: (roomId: string) => void;
}

export const FloorMapSvg: React.FC<FloorMapSvgProps> = ({
  floor,
  selectedRoom,
  onSelectRoom,
  statusFilter,
  activePathRoomId,
  onTogglePathGuide
}) => {
  const { 
    deviceState, 
    setTargetRoom, 
    availableBeacons, 
    routeInfo,
    requestCompassPermission,
    setManualHeading
  } = useGps();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredRoom, setHoveredRoom] = useState<Room | null>(null);

  const { width, height } = floor.dimensions;
  const entrancePoint = { x: 90, y: 250 };

  const getStatusFill = (status: Room['status'], isSelected: boolean) => {
    if (isSelected) return 'rgba(16, 185, 129, 0.22)';
    switch (status) {
      case 'available':
        return '#f0fdf4'; // Lightest emerald
      case 'occupied':
        return '#fff1f2'; // Light rose
      case 'reserved':
        return '#fffbeb'; // Light amber
      case 'maintenance':
        return '#f8fafc'; // Light slate
      default:
        return '#ffffff';
    }
  };

  const getStatusStroke = (status: Room['status'], isSelected: boolean) => {
    if (isSelected) return '#059669';
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

  const getPathToRoom = (room: Room) => {
    const isSameFloor = deviceState.floorNumber === floor.floorNumber;
    const startX = isSameFloor ? deviceState.canvasX : entrancePoint.x;
    const startY = isSameFloor ? deviceState.canvasY : entrancePoint.y;
    const rx = room.coordinates.x + room.coordinates.w / 2;
    const ry = room.coordinates.y + room.coordinates.h / 2;
    const midY = 250;
    return `M ${startX} ${startY} L ${startX} ${midY} L ${rx} ${midY} L ${rx} ${ry}`;
  };

  return (
    <div className="relative w-full bg-white dark:bg-slate-900 rounded-3xl border border-emerald-100 dark:border-slate-800 p-4 sm:p-6 shadow-sm overflow-hidden select-none transition-colors">
      
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">{floor.name}</h3>
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                Skala 1:100 • 2D Blueprint
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{floor.description}</p>
          </div>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.75, prev - 0.15))}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors"
              title="Perkecil (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold px-2 text-slate-700 dark:text-slate-300">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(1.5, prev + 0.15))}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors"
              title="Perbesar (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors ml-1"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas Map Area with Green/White Blueprint look */}
      <div className="relative w-full overflow-x-auto overflow-y-hidden bg-[#fafcfb] dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-2 sm:p-4 transition-colors">
        
        {/* Subtle Green Blueprint Grid Pattern */}
        <div className="absolute inset-0 bg-grid-blueprint opacity-60 pointer-events-none" />

        {/* Floating Real-Time Compass Rose (Top-Right of Map) */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2.5 py-1.5 rounded-2xl border border-emerald-200/80 dark:border-slate-700 shadow-sm transition-all">
          <button
            type="button"
            onClick={() => {
              if (deviceState.isCompassActive) {
                setManualHeading(0);
              } else {
                requestCompassPermission();
              }
            }}
            className="relative w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-transform active:scale-95"
            title={`Arah Kompas: ${deviceState.heading}° (${deviceState.compassDirectionName}) - Klik untuk atur`}
          >
            {/* Rotating Needle */}
            <div 
              className="absolute inset-0 flex items-center justify-center transition-transform duration-200"
              style={{ transform: `rotate(${-deviceState.heading}deg)` }}
            >
              <div className="w-1 h-3 bg-rose-500 rounded-t-xs" />
              <div className="w-1 h-3 bg-slate-300 dark:bg-slate-500 rounded-b-xs" />
            </div>
            <span className="absolute top-0.5 text-[6.5px] font-black text-rose-500">N</span>
            <div className="w-1 h-1 rounded-full bg-slate-800 dark:bg-white z-10" />
          </button>

          <div className="text-[10px] font-mono font-black text-slate-800 dark:text-slate-100 leading-none">
            <div>{deviceState.heading}°</div>
            <div className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {deviceState.compassDirectionName.split(' ')[0]}
            </div>
          </div>
        </div>

        <div 
          className="mx-auto transition-transform duration-300 origin-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto max-h-[640px] drop-shadow-md"
            style={{ minWidth: '720px' }}
          >
            <defs>
              <pattern id="corridor-light" width="20" height="20" patternUnits="userSpaceOnUse">
                <rect width="20" height="20" fill="#f1f5f9" />
                <path d="M 0 10 L 20 10 M 10 0 L 10 20" stroke="rgba(16, 185, 129, 0.08)" strokeWidth="1" />
              </pattern>

              <filter id="emerald-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              {/* Flashlight / Vision Cone Gradient for Real-Time Compass Navigation */}
              <radialGradient id="user-flashlight-beam" cx="50%" cy="100%" r="100%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.55" />
                <stop offset="45%" stopColor="#38bdf8" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Building Outer Wall Outline (Forest Green Tint) */}
            <rect
              x="20"
              y="20"
              width={width - 40}
              height={height - 40}
              rx="16"
              fill="#ffffff"
              stroke="#0f766e"
              strokeWidth="4"
            />

            {/* Central Corridor / Hallway */}
            <rect
              x="30"
              y="235"
              width={width - 60}
              height="30"
              fill="url(#corridor-light)"
              stroke="#a7f3d0"
              strokeDasharray="4 4"
              strokeWidth="1.5"
            />
            {/* Walkway label */}
            <text
              x={width / 2 + 40}
              y="254"
              textAnchor="middle"
              fill="#065f46"
              fontSize="10"
              fontFamily="monospace"
              fontWeight="bold"
              letterSpacing="2"
            >
              KORIDOR UTAMA LANTAI {floor.floorNumber}
            </text>

            {/* Entrance / Elevator / Staircase Zone */}
            <g transform={`translate(35, 237)`}>
              <rect
                width="110"
                height="26"
                rx="6"
                fill="#065f46"
                stroke="#047857"
                strokeWidth="1.5"
              />
              <circle cx="14" cy="13" r="4" fill="#34d399" />
              <text x="26" y="17" fill="#ffffff" fontSize="9" fontWeight="bold">
                LIFT & TANGGA
              </text>
            </g>

            {/* Render Rooms */}
            {floor.rooms.map((room) => {
              const { x, y, w, h, doorPosition } = room.coordinates;
              const isSelected = selectedRoom?.id === room.id;
              const isHovered = hoveredRoom?.id === room.id;
              const matchesFilter = statusFilter === 'all' || room.status === statusFilter;
              const opacity = matchesFilter ? 1 : 0.25;

              return (
                <g
                  key={room.id}
                  onClick={() => onSelectRoom(room)}
                  onMouseEnter={() => setHoveredRoom(room)}
                  onMouseLeave={() => setHoveredRoom(null)}
                  className="cursor-pointer transition-all duration-300"
                  style={{ opacity }}
                >
                  {/* Room Base Rectangle */}
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    rx="12"
                    fill={getStatusFill(room.status, isSelected)}
                    stroke={getStatusStroke(room.status, isSelected)}
                    strokeWidth={isSelected ? '3.5' : isHovered ? '2.5' : '1.5'}
                    className="transition-all duration-300"
                    filter={isSelected ? 'url(#emerald-glow)' : undefined}
                  />

                  {/* Corner Accent Markings */}
                  <path
                    d={`M ${x + 6} ${y + 14} L ${x + 6} ${y + 6} L ${x + 14} ${y + 6}`}
                    fill="none"
                    stroke={getStatusStroke(room.status, isSelected)}
                    strokeWidth="1.5"
                  />
                  <path
                    d={`M ${x + w - 14} ${y + 6} L ${x + w - 6} ${y + 6} L ${x + w - 6} ${y + 14}`}
                    fill="none"
                    stroke={getStatusStroke(room.status, isSelected)}
                    strokeWidth="1.5"
                  />

                  {/* Door Graphic Arc */}
                  {doorPosition === 'bottom' && (
                    <g transform={`translate(${x + w / 2 - 14}, ${y + h - 2})`}>
                      <rect width="28" height="4" fill="#ffffff" />
                      <line x1="0" y1="2" x2="28" y2="2" stroke="#059669" strokeWidth="2" strokeDasharray="3 2" />
                      <path d="M 0 0 A 14 14 0 0 1 14 -14" fill="none" stroke="#059669" strokeWidth="1.2" strokeDasharray="2 2" />
                    </g>
                  )}
                  {doorPosition === 'top' && (
                    <g transform={`translate(${x + w / 2 - 14}, ${y - 2})`}>
                      <rect width="28" height="4" fill="#ffffff" />
                      <line x1="0" y1="2" x2="28" y2="2" stroke="#059669" strokeWidth="2" strokeDasharray="3 2" />
                      <path d="M 0 4 A 14 14 0 0 0 14 18" fill="none" stroke="#059669" strokeWidth="1.2" strokeDasharray="2 2" />
                    </g>
                  )}
                  {doorPosition === 'left' && (
                    <g transform={`translate(${x - 2}, ${y + h / 2 - 14})`}>
                      <rect width="4" height="28" fill="#ffffff" />
                      <line x1="2" y1="0" x2="2" y2="28" stroke="#059669" strokeWidth="2" strokeDasharray="3 2" />
                    </g>
                  )}

                  {/* Room Code Badge */}
                  <g transform={`translate(${x + 14}, ${y + 14})`}>
                    <rect
                      width="54"
                      height="22"
                      rx="6"
                      fill="#ffffff"
                      stroke={getStatusStroke(room.status, isSelected)}
                      strokeWidth="1.5"
                    />
                    <text
                      x="27"
                      y="15"
                      textAnchor="middle"
                      fill="#0f172a"
                      fontSize="11"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {room.code}
                    </text>
                  </g>

                  {/* Status Indicator Dot */}
                  <circle
                    cx={x + w - 20}
                    cy={y + 24}
                    r="5"
                    fill={getStatusStroke(room.status, false)}
                    className={room.status === 'occupied' ? 'animate-pulse' : ''}
                  />

                  {/* Room Title */}
                  <foreignObject
                    x={x + 14}
                    y={y + 44}
                    width={w - 28}
                    height={h - 80}
                  >
                    <div className="h-full flex flex-col justify-start overflow-hidden">
                      <p className="text-slate-900 font-bold text-xs leading-tight line-clamp-2">
                        {room.name}
                      </p>
                      {room.currentActivity && (
                        <p className="text-amber-700 font-semibold text-[10px] mt-1 truncate">
                          ▶ {room.currentActivity.title}
                        </p>
                      )}
                    </div>
                  </foreignObject>

                  {/* Room Bottom Meta Icons (Capacity & Temp) */}
                  <g transform={`translate(${x + 14}, ${y + h - 26})`}>
                    <rect width={w - 28} height="18" rx="4" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
                    <text x="8" y="13" fill="#475569" fontSize="10" fontWeight="bold">
                      👥 {room.capacity} org
                    </text>
                    {room.temperature && (
                      <text x={w - 60} y="13" fill="#0284c7" fontSize="10" fontWeight="bold">
                        ❄ {room.temperature}°C
                      </text>
                    )}
                  </g>

                  {/* Pulsing Selection Pin if Selected */}
                  {isSelected && (
                    <g transform={`translate(${x + w / 2 - 12}, ${y + 8})`}>
                      <circle cx="12" cy="12" r="10" fill="#10b981" fillOpacity="0.4" className="animate-ping" />
                      <circle cx="12" cy="12" r="6" fill="#059669" />
                    </g>
                  )}
                </g>
              );
            })}

            {/* IoT BLE Anchor Beacons Installed along the Corridor */}
            {availableBeacons.map(bcn => (
              <g key={bcn.id} transform={`translate(${bcn.x}, ${bcn.y})`} className="opacity-80">
                <circle r="8" fill="#0284c7" opacity="0.15" className="animate-pulse" />
                <circle r="3.5" fill="#0284c7" stroke="#ffffff" strokeWidth="1" />
                <text x="0" y="11" textAnchor="middle" fill="#0369a1" fontSize="6" fontWeight="bold">
                  {bcn.id}
                </text>
              </g>
            ))}

            {/* Live IoT GPS User Marker (All Devices: Phone, Tablet, PC) */}
            {deviceState.floorNumber === floor.floorNumber && (
              <g transform={`translate(${deviceState.canvasX}, ${deviceState.canvasY})`} className="transition-all duration-300">
                {/* Flashlight / Vision Cone pointing towards device heading */}
                <g transform={`rotate(${deviceState.heading})`}>
                  <path
                    d="M 0 0 L -38 -76 A 85 85 0 0 1 38 -76 Z"
                    fill="url(#user-flashlight-beam)"
                    className="transition-transform duration-150"
                  />
                  {/* Sharp Heading Pointer Arrow */}
                  <polygon
                    points="0,-22 5.5,-12 -5.5,-12"
                    fill="#0284c7"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                </g>

                {/* Radar pulse rings */}
                <circle r="22" fill="#0284c7" opacity="0.25" className="animate-ping" />
                <circle r="13" fill="#0284c7" opacity="0.35" />
                <circle r="8.5" fill="#0284c7" stroke="#ffffff" strokeWidth="2" filter="drop-shadow(0 2px 5px rgba(2,132,199,0.5))" />
                <circle r="3.5" fill="#ffffff" />

                {/* User Location Label with Heading */}
                <g transform="translate(0, 20)">
                  <rect x="-42" y="0" width="84" height="16" rx="4" fill="#0369a1" />
                  <text x="0" y="11" textAnchor="middle" fill="#ffffff" fontSize="7.5" fontWeight="bold">
                    LOKASI ANDA • {deviceState.heading}°
                  </text>
                </g>
              </g>
            )}

            {/* Animated Walking Path Guide (if active) in vibrant Emerald Green */}
            {activePathRoomId && (() => {
              const target = floor.rooms.find(r => r.id === activePathRoomId);
              if (!target) return null;
              return (
                <g>
                  {/* Glowing wide line */}
                  <path
                    d={getPathToRoom(target)}
                    fill="none"
                    stroke="#a7f3d0"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.8"
                  />
                  {/* Animated dotted walking path */}
                  <path
                    d={getPathToRoom(target)}
                    fill="none"
                    stroke="#059669"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="6 8"
                    style={{
                      strokeDashoffset: '100',
                      animation: 'dash 1.5s linear infinite'
                    }}
                  />
                  {/* Target beacon */}
                  <circle
                    cx={target.coordinates.x + target.coordinates.w / 2}
                    cy={target.coordinates.y + target.coordinates.h / 2}
                    r="14"
                    fill="#10b981"
                    opacity="0.4"
                    className="animate-ping"
                  />
                  <circle
                    cx={target.coordinates.x + target.coordinates.w / 2}
                    cy={target.coordinates.y + target.coordinates.h / 2}
                    r="6"
                    fill="#059669"
                  />
                </g>
              );
            })()}

          </svg>
        </div>

      </div>

      {/* Floor Plan Legend & Quick Navigation Action */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
        
        {/* Legend */}
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-slate-500 font-bold">Legenda Warna:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-700 font-medium">Tersedia</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-slate-700 font-medium">Sedang Digunakan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-700 font-medium">Reservasi Terjadwal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span className="text-slate-700 font-medium">Pemeliharaan / Servis</span>
          </div>
        </div>

        {/* Selected Room Quick Action */}
        {selectedRoom && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onTogglePathGuide(selectedRoom.id);
                setTargetRoom(activePathRoomId === selectedRoom.id ? null : selectedRoom);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activePathRoomId === selectedRoom.id
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}
            >
              <Navigation className="w-3.5 h-3.5 animate-pulse" />
              <span>{activePathRoomId === selectedRoom.id ? 'Sembunyikan Jalur' : 'Rute IoT GPS ke Ruangan'}</span>
            </button>
          </div>
        )}

      </div>

      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -40;
          }
        }
      `}</style>
    </div>
  );
};
