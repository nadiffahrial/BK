import React from 'react';
import { Building } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { Box, Sparkles, ArrowDownRight } from 'lucide-react';

interface BuildingPlanButtonProps {
  building: Building;
  isActive: boolean;
  onSelect: () => void;
  activeFloorNumber: number;
  onSelectFloor?: (floorNumber: number) => void;
}

export const BuildingPlanButton: React.FC<BuildingPlanButtonProps> = ({
  building,
  isActive,
  onSelect,
  activeFloorNumber,
  onSelectFloor
}) => {
  const { isDark } = useTheme();
  const isGedungA = building.code === 'A';
  const allRooms = building.floors.flatMap(f => f.rooms);
  const availableRooms = allRooms.filter(r => r.status === 'available').length;
  const occupiedRooms = allRooms.filter(r => r.status === 'occupied').length;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      title={`Ketuk untuk langsung beralih ke Denah 3D Multi-Lantai ${building.name}`}
      className={`relative cursor-pointer transition-all duration-300 ease-out transform select-none group flex flex-col items-center focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded-2xl p-2 ${
        isActive
          ? 'scale-[1.02] -translate-y-1'
          : 'hover:scale-[1.03] hover:-translate-y-1.5 opacity-90 hover:opacity-100'
      }`}
    >
      {/* Visual Architectural Building SVG Icon (Directly matching the uploaded image, NO card container) */}
      <div className="relative w-full max-w-[420px]">
        {/* Top 3D Floating Mode Indicator Badge */}
        <div className="flex items-center justify-between mb-1.5 px-1">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
            <span className={`text-[11px] font-extrabold ${isActive ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-300'}`}>
              {building.shortName}
            </span>
          </div>

          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1.5 transition-all shadow-xs ${
            isActive
              ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-500/20'
              : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 group-hover:bg-emerald-600 group-hover:text-white'
          }`}>
            <Box className="w-3 h-3 text-emerald-300 group-hover:text-white" />
            <span>{isActive ? '✦ Denah 3D Aktif' : 'Tap untuk Denah 3D'}</span>
          </span>
        </div>
        <svg 
          viewBox="0 0 340 120" 
          className={`w-full h-auto transition-all duration-300 ${
            isActive
              ? 'drop-shadow-[0_12px_22px_rgba(16,185,129,0.35)]'
              : 'drop-shadow-[0_4px_10px_rgba(0,0,0,0.08)] group-hover:drop-shadow-[0_10px_20px_rgba(16,185,129,0.22)]'
          }`}
        >
          <defs>
            {/* Shaded roof slope hatching pattern (like the architectural site plan in user's image) */}
            <pattern id={`roof-hatch-pure-${building.code}`} width="7" height="7" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="7" stroke={isActive ? '#059669' : '#64748b'} strokeWidth="1" strokeOpacity={isActive ? '0.4' : '0.25'} />
            </pattern>

            {/* Facet gradients */}
            <linearGradient id={`facet-top-pure-${building.code}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isActive ? '#34d399' : '#cbd5e1'} stopOpacity={isActive ? '0.55' : '0.4'} />
              <stop offset="100%" stopColor={isActive ? '#10b981' : '#94a3b8'} stopOpacity={isActive ? '0.35' : '0.25'} />
            </linearGradient>

            <linearGradient id={`facet-bottom-pure-${building.code}`} x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor={isActive ? '#059669' : '#64748b'} stopOpacity={isActive ? '0.55' : '0.45'} />
              <stop offset="100%" stopColor={isActive ? '#10b981' : '#94a3b8'} stopOpacity={isActive ? '0.38' : '0.3'} />
            </linearGradient>
          </defs>

          {/* 1. Semicircular Atrium / Courtyard Canopy (Top building feature from image) */}
          {isGedungA ? (
            <g transform="translate(170, 24)">
              <circle
                cx="0"
                cy="0"
                r="20"
                fill={isDark ? '#1e293b' : '#ffffff'}
                stroke={isActive ? '#059669' : '#475569'}
                strokeWidth={isActive ? '2.5' : '1.5'}
              />
              <circle
                cx="0"
                cy="0"
                r="13"
                fill="none"
                stroke={isActive ? '#10b981' : '#94a3b8'}
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              {/* Entrance corridor neck */}
              <rect
                x="-10"
                y="10"
                width="20"
                height="14"
                fill={isDark ? '#1e293b' : '#ffffff'}
                stroke={isActive ? '#059669' : '#475569'}
                strokeWidth={isActive ? '2' : '1.2'}
              />
              <text x="0" y="3" textAnchor="middle" fontSize="7" fontWeight="bold" fill={isActive ? (isDark ? '#34d399' : '#065f46') : (isDark ? '#cbd5e1' : '#64748b')}>
                LOBBY
              </text>
            </g>
          ) : (
            /* Gedung B: Circular Dome on Right */
            <g transform="translate(265, 24)">
              <circle
                cx="0"
                cy="0"
                r="18"
                fill={isDark ? '#1e293b' : '#ffffff'}
                stroke={isActive ? '#059669' : '#475569'}
                strokeWidth={isActive ? '2.5' : '1.5'}
              />
              <circle
                cx="0"
                cy="0"
                r="11"
                fill="none"
                stroke={isActive ? '#10b981' : '#94a3b8'}
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <text x="0" y="3" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill={isActive ? (isDark ? '#34d399' : '#065f46') : (isDark ? '#cbd5e1' : '#64748b')}>
                SENAT
              </text>
            </g>
          )}

          {/* 2. Left Staircase / Fins (as shown on left side in user's image) */}
          <g transform="translate(14, 30)">
            <rect
              x="0"
              y="0"
              width="14"
              height="68"
              rx="2"
              fill="#ffffff"
              stroke={isActive ? '#059669' : '#475569'}
              strokeWidth="1.5"
            />
            {/* Stair treads */}
            {[8, 16, 24, 32, 40, 48, 56].map(offset => (
              <line
                key={offset}
                x1="0"
                y1={offset}
                x2="14"
                y2={offset}
                stroke={isActive ? '#059669' : '#64748b'}
                strokeWidth="1"
                strokeOpacity="0.75"
              />
            ))}
          </g>

          {/* 3. Main Rectangular Building Body with Hipped Roof Facets */}
          <g id={`pure-roof-${building.code}`}>
            {/* Outer Wall Border */}
            <rect
              x="30"
              y="30"
              width="294"
              height="68"
              rx="4"
              fill="#ffffff"
              stroke={isActive ? '#059669' : '#334155'}
              strokeWidth={isActive ? '3' : '2'}
            />

            {/* Facet 1: Top Trapezoid (Sloping downwards) */}
            <polygon
              points="30,30 324,30 292,48 62,48"
              fill={`url(#facet-top-pure-${building.code})`}
              stroke={isActive ? '#059669' : '#64748b'}
              strokeWidth="1"
            />
            <polygon
              points="30,30 324,30 292,48 62,48"
              fill={`url(#roof-hatch-pure-${building.code})`}
            />

            {/* Facet 2: Bottom Trapezoid (Sloping upwards) */}
            <polygon
              points="30,98 324,98 292,80 62,80"
              fill={`url(#facet-bottom-pure-${building.code})`}
              stroke={isActive ? '#059669' : '#64748b'}
              strokeWidth="1"
            />
            <polygon
              points="30,98 324,98 292,80 62,80"
              fill={`url(#roof-hatch-pure-${building.code})`}
            />

            {/* Facet 3: Left Trapezoid */}
            <polygon
              points="30,30 62,48 62,80 30,98"
              fill={isActive ? '#6ee7b7' : '#cbd5e1'}
              fillOpacity={isActive ? '0.5' : '0.35'}
              stroke={isActive ? '#059669' : '#64748b'}
              strokeWidth="1"
            />

            {/* Facet 4: Right Trapezoid */}
            <polygon
              points="324,30 292,48 292,80 324,98"
              fill={isActive ? '#059669' : '#64748b'}
              fillOpacity={isActive ? '0.5' : '0.4'}
              stroke={isActive ? '#059669' : '#64748b'}
              strokeWidth="1"
            />

            {/* Central Flat Roof Deck */}
            <rect
              x="62"
              y="48"
              width="230"
              height="32"
              fill={isDark ? '#0f172a' : '#ffffff'}
              stroke={isActive ? '#059669' : '#64748b'}
              strokeWidth="1.2"
            />

            {/* Roof grid lines */}
            <line x1="120" y1="48" x2="120" y2="80" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="177" y1="48" x2="177" y2="80" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="235" y1="48" x2="235" y2="80" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2 2" />

            {/* 4. ⭐ Yellow Building Label Badge (as seen in the uploaded user image!) ⭐ */}
            <g transform="translate(42, 38)" className="transition-transform group-hover:scale-105">
              <rect
                x="0"
                y="0"
                width="100"
                height="20"
                rx="3.5"
                fill="#fef08a"
                stroke="#ca8a04"
                strokeWidth="1.2"
                filter="drop-shadow(0 1px 2px rgba(0,0,0,0.15))"
              />
              <text
                x="8"
                y="14"
                fontSize="9.5"
                fontWeight="900"
                fontFamily="sans-serif"
                fill="#713f12"
                letterSpacing="0.2"
              >
                {isGedungA ? 'Gd. LABTEK 1' : 'Gd. FT.1'}
              </text>
            </g>

            {/* 5. ⭐ Red Circular Location Pin (as seen in the uploaded user image!) ⭐ */}
            <g transform={isGedungA ? 'translate(255, 64)' : 'translate(177, 64)'}>
              {/* Radar pulse ring */}
              <circle
                cx="0"
                cy="0"
                r="11"
                fill="#ef4444"
                fillOpacity="0.3"
                className="animate-ping"
              />
              {/* Red pin */}
              <circle
                cx="0"
                cy="0"
                r="8"
                fill="#ef4444"
                stroke="#ffffff"
                strokeWidth="1.5"
                filter="drop-shadow(0 2px 4px rgba(239,68,68,0.4))"
              />
              {/* Inner white dot */}
              <circle
                cx="0"
                cy="0"
                r="3"
                fill="#ffffff"
              />
            </g>

            {/* Active animated stroke along center deck */}
            {isActive && (
              <line
                x1="62"
                y1="64"
                x2="292"
                y2="64"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                className="animate-pulse"
              />
            )}
          </g>
        </svg>
      </div>

      {/* Clean Minimalist Controls Directly Attached to the Building Icon (NO card container) */}
      <div className="mt-2.5 flex items-center justify-between w-full max-w-[420px] px-2 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer shadow-2xs ${
              isActive
                ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-emerald-600/30 ring-1 ring-emerald-400'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
            title="Klik untuk langsung membuka Model Denah 3D"
          >
            <Box className="w-3 h-3" />
            <span>Denah 3D</span>
          </button>
          <span className="text-[10.5px] text-slate-400 dark:text-slate-500 font-medium hidden sm:inline">
            • {availableRooms} Kosong
          </span>
        </div>

        {/* Tingkat 1 & Tingkat 2 Mini Switcher Pills */}
        <div className="flex items-center gap-1.5">
          {building.floors.map((fl) => {
            const isFlSelected = isActive && fl.floorNumber === activeFloorNumber;
            return (
              <button
                key={fl.floorNumber}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect();
                  if (onSelectFloor) {
                    onSelectFloor(fl.floorNumber);
                  }
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                  isFlSelected
                    ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-xs scale-105 ring-2 ring-emerald-500/20'
                    : 'bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
                title={`Buka Denah 3D Tingkat ${fl.floorNumber}`}
              >
                Lt {fl.floorNumber}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
