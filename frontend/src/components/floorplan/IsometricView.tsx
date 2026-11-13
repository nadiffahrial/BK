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
  Flame,
  User,
  Compass,
  Eye,
  SlidersHorizontal,
  RotateCcw
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
  const [tiltAngle, setTiltAngle] = useState<number>(30); // Default ke sudut samping yang nyaman
  const [rotateAngle, setRotateAngle] = useState<number>(-22);
  const [hoveredFloor, setHoveredFloor] = useState<number | null>(null);
  const [hoveredRoom, setHoveredRoom] = useState<Room | null>(null);

  // Vertical gap between Floor 1 and Floor 2
  const zGap = isExploded ? 210 : 110;

  // Extract all staircases from the building
  const stairRooms = (building.floors && building.floors[0] && building.floors[0].rooms)
    ? building.floors[0].rooms.filter(r => r.code === 'TANGGA')
    : [];

  // Helper: Pemisahan dan penulisan nama ruangan yang jelas, tegas, dan mudah dibaca (tanpa status)
  const getRoomDisplayNames = (room: Room, isCompact: boolean) => {
    if (room.code === 'TANGGA') return { line1: 'TANGGA', line2: '' };
    if (room.code === 'WC (LK)') return { line1: 'Toilet Pria', line2: 'WC (LK)' };
    if (room.code === 'WC (PRP)') return { line1: 'Toilet Wanita', line2: 'WC (PRP)' };
    if (room.code === 'WUDHU') return { line1: 'Tempat Wudhu', line2: 'Fasilitas' };
    if (room.code === 'MUSHOLA') {
      return { 
        line1: 'Mushola Kampus', 
        line2: room.name.toLowerCase().includes('perempuan') ? 'Muslimah' : 'Muslim' 
      };
    }
    if (room.code === 'R.panel') return { line1: 'Ruang Panel', line2: 'Listrik & UPS' };

    // Format ruang kuliah FT.1
    if (room.name.includes('Ruang Kuliah Besar')) {
      return { line1: 'Ruang Kuliah Besar', line2: room.code };
    }
    if (room.name.includes('Ruang Kuliah')) {
      return { line1: 'Ruang Kuliah', line2: room.code };
    }
    if (room.name.includes('Ruang Sidang')) {
      return { line1: 'Ruang Sidang', line2: 'Skripsi & Seminar' };
    }

    // Format Labkom LABKOM.1
    if (room.name.includes('Lab Komputer')) {
      const match = room.name.match(/\((.*?)\)/);
      const sub = match ? match[1] : '';
      const cleanSub = sub.length > 20 ? sub.substring(0, 18) + '..' : sub;
      return { line1: `Lab Komputer ${room.code}`, line2: cleanSub || 'Informatika' };
    }
    if (room.name.includes('Ruang Server')) {
      return { line1: 'Ruang Server 2N', line2: 'Pengelola Lab' };
    }

    // Default clean 2-line split
    const parts = room.name.split(' ');
    if (parts.length <= 2) return { line1: room.name, line2: '' };
    const mid = Math.ceil(parts.length / 2);
    return {
      line1: parts.slice(0, mid).join(' '),
      line2: parts.slice(mid).join(' ')
    };
  };

  // Helper: Visualisasi orang / mahasiswa & dosen di dalam ruangan kuliah / lab
  const renderPeopleInsideRoom = (room: Room, x: number, y: number, w: number, h: number) => {
    if (room.code === 'TANGGA' || room.code.startsWith('WC') || room.code === 'WUDHU' || room.code === 'R.panel') {
      return null;
    }

    const isLarge = w >= 115 && h >= 140;
    const lecturerX = x + w - 24;
    const lecturerY = y + 42;

    // Grid siswa / mahasiswa
    const studentCount = isLarge ? 6 : 4;
    const students: { sx: number; sy: number; color: string }[] = [];
    const startX = x + (isLarge ? 20 : 16);
    const startY = y + (isLarge ? 72 : 62);
    const stepX = isLarge ? 26 : 22;
    const stepY = isLarge ? 28 : 22;

    const colors = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#0284c7', '#0891b2'];

    for (let i = 0; i < studentCount; i++) {
      const col = i % (isLarge ? 3 : 2);
      const row = Math.floor(i / (isLarge ? 3 : 2));
      const sx = startX + col * stepX;
      const sy = startY + row * stepY;
      if (sx < x + w - 18 && sy < y + h - 22) {
        students.push({ sx, sy, color: colors[i % colors.length] });
      }
    }

    return (
      <g className="room-people-group" pointerEvents="none">
        {/* 👨‍🏫 Dosen / Pemateri di Depan Ruangan */}
        <g className="lecturer-avatar" transform={`translate(${lecturerX}, ${lecturerY})`}>
          <rect x="-6" y="6" width="12" height="4" rx="1.5" fill="#3b82f6" opacity="0.85" />
          <circle cx="0" cy="0" r="3.2" fill="#1e3a8a" />
          <path d="M -4 7 L -2 3.5 Q 0 3 2 3.5 L 4 7 Z" fill="#2563eb" />
          <rect x="-9" y="-9" width="18" height="6.5" rx="2" fill="#0f172a" opacity="0.9" />
          <text x="0" y="-4" textAnchor="middle" fill="#93c5fd" fontSize="5" fontWeight="bold" fontFamily="sans-serif">
            DOSEN
          </text>
        </g>

        {/* 👨‍🎓 Mahasiswa Duduk di Meja Kelas */}
        {students.map((st, idx) => (
          <g key={idx} className="student-avatar" transform={`translate(${st.sx}, ${st.sy})`}>
            <rect x="-7" y="5" width="14" height="4" rx="1.2" fill="#94a3b8" opacity="0.75" />
            <circle cx="0" cy="0" r="2.8" fill={st.color} />
            <path d="M -3.5 6 L -2 3 Q 0 2.5 2 3 L 3.5 6 Z" fill={st.color} />
          </g>
        ))}
      </g>
    );
  };

  return (
    <div
      id="isometric-3d-model-section"
      className="relative w-full bg-white dark:bg-slate-900 rounded-3xl border border-emerald-100 dark:border-slate-800 p-4 sm:p-6 shadow-sm overflow-hidden text-slate-800 dark:text-slate-100 transition-colors scroll-mt-20 ring-1 ring-emerald-500/20"
    >
      {/* Self-contained CSS animations for smooth 3D experience and animated people */}
      <style>{`
        @keyframes walkEast {
          0% { transform: translateX(80px); opacity: 0; }
          6% { opacity: 1; }
          94% { opacity: 1; }
          100% { transform: translateX(960px); opacity: 0; }
        }
        @keyframes walkWest {
          0% { transform: translateX(960px); opacity: 0; }
          6% { opacity: 1; }
          94% { opacity: 1; }
          100% { transform: translateX(80px); opacity: 0; }
        }
        .walking-student-east {
          animation: walkEast 18s linear infinite;
        }
        .walking-student-west {
          animation: walkWest 22s linear infinite;
        }
        .floor-slab-transition {
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                      opacity 0.6s ease,
                      box-shadow 0.6s ease,
                      border-color 0.4s ease;
        }
      `}</style>
      
      {/* 1. 3D Header Bar & Interactivity Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
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
                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Tangga 3D Nyata Menghubungkan Lantai
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Tangga 3D fisik menghubungkan Lantai 1 dan Lantai 2 sesuai cetak biru. Gunakan mode POV Samping untuk melihat struktur tangga dari sisi samping.
              </p>
            </div>
          </div>
        </div>

        {/* 3D Camera & Presentation Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Camera Angles - Termasuk POV Samping Sesuai Permintaan User */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => { setTiltAngle(26); setRotateAngle(-22); }}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                tiltAngle === 26 && rotateAngle === -22
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
              }`}
              title="Sudut Pandang Samping Nyata (Melihat Tangga 3D Menghubungkan Lantai)"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>POV Samping (Tangga 3D)</span>
            </button>
            <button
              onClick={() => { setTiltAngle(56); setRotateAngle(-28); }}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                tiltAngle === 56 && rotateAngle === -28
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
              }`}
              title="Sudut Pandang Isometrik Standar"
            >
              📐 Isometrik
            </button>
            <button
              onClick={() => { setTiltAngle(72); setRotateAngle(0); }}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                tiltAngle === 72 && rotateAngle === 0
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
              }`}
              title="Tampak Atas Denah"
            >
              🔝 Atas
            </button>
          </div>

          {/* Toggle Mode Pisah Lantai */}
          <button
            onClick={() => setIsExploded(!isExploded)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs border ${
              isExploded
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/25'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-emerald-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isExploded ? 'Mode Pisah 3D' : 'Mode Rapat'}</span>
          </button>

          {/* Slider Kemiringan / Tilt */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
            <span className="text-[11px] font-medium">Kemiringan:</span>
            <input
              type="range"
              min="15"
              max="75"
              value={tiltAngle}
              onChange={(e) => setTiltAngle(Number(e.target.value))}
              className="w-16 accent-emerald-600 cursor-pointer"
            />
            <span className="font-mono text-[10px] text-slate-400 w-6">{tiltAngle}°</span>
          </div>

          {/* Slider Rotasi */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
            <span className="text-[11px] font-medium">Rotasi:</span>
            <input
              type="range"
              min="-60"
              max="15"
              value={rotateAngle}
              onChange={(e) => setRotateAngle(Number(e.target.value))}
              className="w-16 accent-emerald-600 cursor-pointer"
            />
            <span className="font-mono text-[10px] text-slate-400 w-6">{rotateAngle}°</span>
          </div>
        </div>
      </div>

      {/* 2. 3D Staged Canvas with Dynamic Elevation & Physical 3D Stairs */}
      <div className="relative min-h-[660px] sm:min-h-[720px] flex items-center justify-center overflow-hidden py-16 bg-gradient-to-b from-emerald-50/40 via-slate-50/50 to-white dark:from-slate-900/90 dark:via-slate-950 dark:to-slate-900/90 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors">
        
        {/* Ambient atmospheric backdrop */}
        <div className="absolute w-[650px] h-[650px] bg-emerald-400/15 rounded-full blur-[140px] pointer-events-none" />

        {/* 🏷️ Floating Left Tabs for Direct One-Click Floor Selection (Tanpa Status 'Kosong') */}
        <div className="absolute top-6 left-6 z-40 flex flex-col gap-2.5 pointer-events-auto">
          {building.floors.map((fl) => {
            const isFlActive = fl.floorNumber === activeFloorNumber;
            return (
              <button
                key={fl.floorNumber}
                onClick={() => onSelectFloor(fl.floorNumber)}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all duration-300 shadow-md cursor-pointer border ${
                  isFlActive
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/30 ring-2 ring-emerald-400/40 translate-x-1 scale-105'
                    : 'bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400 hover:translate-x-0.5'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isFlActive ? 'bg-white animate-ping' : 'bg-slate-400'}`} />
                <span>Tingkat {fl.floorNumber}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                  isFlActive ? 'bg-emerald-700 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {fl.rooms.length} Ruang
                </span>
                {isFlActive && <span className="text-[10px] ml-1">▲ Timbul</span>}
              </button>
            );
          })}
        </div>

        {/* 3D Isometric Projection Root */}
        <div
          className="relative transition-transform duration-700 ease-smooth"
          style={{
            transform: `perspective(1400px) rotateX(${tiltAngle}deg) rotateZ(${rotateAngle}deg)`,
            transformStyle: 'preserve-3d',
            width: '820px',
            height: '380px'
          }}
        >

          {/* ============================================================== */}
          {/* 🪜 3D PHYSICAL STAIRWAYS (TANGGA 3D MENYAMBUNGKAN LANTAI)     */}
          {/* ============================================================== */}
          {stairRooms.map((stair) => {
            // Skala koordinat SVG (1100 x 500) ke wadah 3D (820 x 380)
            const posX = (stair.coordinates.x / 1100) * 820;
            const posY = (stair.coordinates.y / 500) * 380;
            const posW = (stair.coordinates.w / 1100) * 820;
            const posH = (stair.coordinates.h / 500) * 380;

            const stepsCount = 12;
            const hypot = Math.sqrt(posH * posH + zGap * zGap);
            const slopeAngle = Math.atan2(zGap, posH) * (180 / Math.PI);

            return (
              <div
                key={`3d-staircase-${stair.id}`}
                className="absolute"
                style={{
                  left: `${posX}px`,
                  top: `${posY}px`,
                  width: `${posW}px`,
                  height: `${posH}px`,
                  transformStyle: 'preserve-3d',
                  pointerEvents: 'none',
                  zIndex: 25
                }}
              >
                {/* 12 Anak Tangga 3D Bertingkat Menghubungkan Lantai 1 ke Lantai 2 */}
                {Array.from({ length: stepsCount }).map((_, stepIdx) => {
                  const progress = stepIdx / stepsCount;
                  const stepZ = progress * zGap;
                  const stepY = progress * posH;
                  const treadDepth = posH / stepsCount;
                  const riserHeight = zGap / stepsCount;

                  return (
                    <React.Fragment key={stepIdx}>
                      {/* Tapak Datar Anak Tangga (Horizontal Tread) */}
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: `${stepY}px`,
                          width: `${posW}px`,
                          height: `${treadDepth + 1.5}px`,
                          transform: `translateZ(${stepZ}px)`,
                          transformStyle: 'preserve-3d',
                          backgroundColor: isDark ? '#1e293b' : '#ffffff',
                          border: '1px solid #10b981',
                          borderBottom: '2.5px solid #059669',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.22)',
                        }}
                      >
                        {/* Garis anti-selip hijau menyala */}
                        <div className="w-full h-[1.8px] bg-emerald-400 mt-[2px]" />
                      </div>

                      {/* Tanjakan Tegak Anak Tangga (Vertical Riser) */}
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: `${stepY + treadDepth}px`,
                          width: `${posW}px`,
                          height: `${riserHeight}px`,
                          transformOrigin: 'top left',
                          transform: `translateZ(${stepZ}px) rotateX(-90deg)`,
                          backgroundColor: isDark ? '#0b1120' : '#cbd5e1',
                          borderLeft: '1.5px solid #059669',
                          borderRight: '1.5px solid #059669',
                          boxShadow: 'inset 0 0 5px rgba(0,0,0,0.35)',
                        }}
                      />
                    </React.Fragment>
                  );
                })}

                {/* Railing Kaca & Stainless Steel Sisi Kiri Tangga (Tampak Jelas dari POV Samping) */}
                <div
                  style={{
                    position: 'absolute',
                    left: '-2px',
                    top: 0,
                    width: '32px',
                    height: `${hypot}px`,
                    transformOrigin: 'top left',
                    transform: `rotateX(-${slopeAngle}deg) rotateY(90deg)`,
                    background: 'linear-gradient(to right, rgba(16, 185, 129, 0.35), rgba(6, 182, 212, 0.2))',
                    borderTop: '3.5px solid #10b981',
                    borderBottom: '1.5px solid rgba(16,185,129,0.4)',
                    boxShadow: '0 0 12px rgba(16,185,129,0.4)',
                  }}
                >
                  {/* Tiang Baluster Railing */}
                  {[0.2, 0.4, 0.6, 0.8].map((pos, pIdx) => (
                    <div
                      key={pIdx}
                      className="absolute w-[2px] h-full bg-emerald-400"
                      style={{ top: `${pos * 100}%` }}
                    />
                  ))}
                </div>

                {/* Railing Kaca & Stainless Steel Sisi Kanan Tangga */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${posW}px`,
                    top: 0,
                    width: '32px',
                    height: `${hypot}px`,
                    transformOrigin: 'top left',
                    transform: `rotateX(-${slopeAngle}deg) rotateY(90deg)`,
                    background: 'linear-gradient(to right, rgba(16, 185, 129, 0.35), rgba(6, 182, 212, 0.2))',
                    borderTop: '3.5px solid #10b981',
                    borderBottom: '1.5px solid rgba(16,185,129,0.4)',
                    boxShadow: '0 0 12px rgba(16,185,129,0.4)',
                  }}
                >
                  {[0.2, 0.4, 0.6, 0.8].map((pos, pIdx) => (
                    <div
                      key={pIdx}
                      className="absolute w-[2px] h-full bg-emerald-400"
                      style={{ top: `${pos * 100}%` }}
                    />
                  ))}
                </div>

                {/* Tag Tangga 3D Menghubungkan Lt.1 & Lt.2 */}
                <div
                  className="absolute hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-600 text-white font-mono text-[7px] font-extrabold shadow-md"
                  style={{
                    left: `${posW / 2 - 25}px`,
                    top: `${posH / 2}px`,
                    transform: `translateZ(${zGap / 2}px)`,
                  }}
                >
                  <span>🪜 TANGGA 3D</span>
                </div>
              </div>
            );
          })}

          {/* ============================================================== */}
          {/* 🏢 RENDERING LEMPENG LANTAI 3D                                 */}
          {/* ============================================================== */}
          {building.floors.map((floor) => {
            const isSelected = floor.floorNumber === activeFloorNumber;
            const isHovered = hoveredFloor === floor.floorNumber;
            const isUpperFloor = floor.floorNumber === 2;

            // Ketinggian vertikal fisik: Lantai 1 di dasar (0px), Lantai 2 di atas (zGap px)
            // Lantai yang dipilih mendapat sorotan 100% dan sedikit pembesaran
            const zDistance = isUpperFloor ? zGap : 0;
            const scale = isSelected ? 1.01 : 0.98;
            
            // Opasitas: jika lantai 1 aktif, lantai 2 menjadi semi-transparan sehingga tangga terlihat jelas
            let opacity = 1;
            if (!isSelected) {
              opacity = isUpperFloor ? (isDark ? 0.35 : 0.4) : (isDark ? 0.6 : 0.65);
              if (isHovered) opacity = 0.85;
            }

            return (
              <div
                key={floor.floorNumber}
                onMouseEnter={() => setHoveredFloor(floor.floorNumber)}
                onMouseLeave={() => setHoveredFloor(null)}
                onClick={() => onSelectFloor(floor.floorNumber)}
                className={`absolute inset-0 rounded-2xl cursor-pointer floor-slab-transition ${
                  isSelected
                    ? 'border-2 border-emerald-500 dark:border-emerald-400 shadow-[0_35px_70px_-10px_rgba(16,185,129,0.45)] ring-4 ring-emerald-500/25'
                    : isHovered
                    ? 'border-2 border-emerald-400 shadow-[0_20px_45px_rgba(16,185,129,0.25)]'
                    : 'border border-slate-300 dark:border-slate-700 shadow-[0_10px_25px_rgba(0,0,0,0.08)]'
                }`}
                style={{
                  transform: `translateZ(${zDistance}px) scale(${scale})`,
                  transformStyle: 'preserve-3d',
                  opacity,
                  zIndex: isSelected ? 30 : 10,
                  backgroundColor: isDark
                    ? isSelected
                      ? 'rgba(15, 23, 42, 0.98)'
                      : 'rgba(15, 23, 42, 0.85)'
                    : isSelected
                    ? 'rgba(255, 255, 255, 0.98)'
                    : 'rgba(255, 255, 255, 0.88)',
                  backdropFilter: 'blur(14px)',
                }}
              >
                
                {/* 🏷️ Side Floating Tab on Floor Slab (Left Edge) */}
                <div 
                  className={`absolute -left-36 top-3 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs shadow-md transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/30'
                      : 'bg-white/95 dark:bg-slate-800/95 text-slate-800 dark:text-slate-100 border-emerald-200 dark:border-slate-700'
                  }`}
                  style={{ transform: 'translateZ(20px)' }}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-white animate-ping' : 'bg-slate-400'}`} />
                  <span className="font-extrabold">
                    Tingkat {floor.floorNumber}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    isSelected ? 'bg-emerald-700 text-white' : 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80'
                  }`}>
                    {floor.rooms.length} Ruang
                  </span>
                </div>

                {/* 📋 Header Atas Lempeng Lantai 3D (Bersih Tanpa Status Ruangan) */}
                <div 
                  className={`px-4 py-2 border-b flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'border-emerald-100 dark:border-emerald-950/60 bg-emerald-50/50 dark:bg-emerald-950/30'
                      : 'border-slate-100 dark:border-slate-800'
                  }`}
                  style={{ transform: 'translateZ(10px)' }}
                >
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-[9.5px] font-extrabold px-2 py-0.5 rounded-md ${
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      TINGKAT {floor.floorNumber}
                    </span>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                      {floor.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10.5px] text-emerald-800 dark:text-emerald-300 font-extrabold">
                      Total {floor.rooms.length} Ruangan & Fasilitas
                    </span>
                    <span className={`text-[9.5px] font-mono font-extrabold px-2.5 py-0.5 rounded-full transition-all ${
                      isSelected 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {isSelected ? 'Lantai Aktif' : 'Pilih Lantai'}
                    </span>
                  </div>
                </div>

                {/* ============================================================== */}
                {/* 🗺️ SVG CETAK BIRU ARSITEKTUR & SIMULASI ORANG                  */}
                {/* ============================================================== */}
                <div 
                  className="p-2 relative w-full h-[320px]"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <svg
                    viewBox="0 0 1100 500"
                    className="w-full h-full"
                    style={{ transform: 'translateZ(6px)' }}
                  >
                    <defs>
                      <linearGradient id={`corridor-grad-${floor.floorNumber}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
                        <stop offset="50%" stopColor="#10b981" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.12" />
                      </linearGradient>
                      <filter id="emerald-glow-3d" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#10b981" floodOpacity="0.6" />
                      </filter>
                    </defs>

                    {/* Dinding Utama Beton Eksterior */}
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

                    {/* Lorong Koridor Tengah */}
                    <rect
                      x="28"
                      y="235"
                      width="1044"
                      height="30"
                      fill={`url(#corridor-grad-${floor.floorNumber})`}
                      stroke="#10b981"
                      strokeWidth="1.8"
                      strokeDasharray="6 3"
                    />
                    <text
                      x="550"
                      y="254"
                      textAnchor="middle"
                      fill={isDark ? '#34d399' : '#065f46'}
                      fontSize="10.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                      letterSpacing="3"
                    >
                      KORIDOR TENGAH LANTAI {floor.floorNumber}
                    </text>

                    {/* 🚶‍♂️ Simulasi Orang Berjalan di Koridor Tengah */}
                    {isSelected && (
                      <g className="corridor-walkers" pointerEvents="none">
                        <g className="walking-student-east">
                          <circle cx="0" cy="245" r="3.2" fill="#059669" />
                          <path d="M -3 252 L -1.5 248 Q 0 247 1.5 248 L 3 252 Z" fill="#047857" />
                          <rect x="-4.5" y="247" width="2.2" height="3.8" rx="0.8" fill="#f59e0b" />
                        </g>
                        <g className="walking-student-west">
                          <circle cx="0" cy="255" r="3.2" fill="#0284c7" />
                          <path d="M -3 262 L -1.5 258 Q 0 257 1.5 258 L 3 262 Z" fill="#0369a1" />
                          <rect x="2.5" y="257" width="2.2" height="3.8" rx="0.8" fill="#e11d48" />
                        </g>
                      </g>
                    )}

                    {/* 📍 Sinyal Lokasi Pengguna (IoT GPS Beacon) */}
                    {isSelected && deviceState && deviceState.floorNumber === floor.floorNumber && (
                      <g 
                        className="user-gps-beacon" 
                        transform={`translate(${deviceState.canvasX || 120}, ${deviceState.canvasY || 250})`}
                        pointerEvents="none"
                      >
                        <circle cx="0" cy="0" r="16" fill="rgba(16, 185, 129, 0.25)" className="animate-ping" />
                        <circle cx="0" cy="0" r="8" fill="#10b981" />
                        <circle cx="0" cy="0" r="4" fill="#ffffff" />
                        <rect x="-35" y="-22" width="70" height="15" rx="4" fill="#0f172a" />
                        <text x="0" y="-12" textAnchor="middle" fill="#34d399" fontSize="7" fontWeight="bold">
                          LOKASI ANDA
                        </text>
                      </g>
                    )}

                    {/* ============================================================== */}
                    {/* 🚪 DAFTAR RUANGAN LENGKAP (BERSIH DARI STATUS WARNA RUANGAN)   */}
                    {/* ============================================================== */}
                    {floor.rooms.map((room) => {
                      const { x, y, w, h, doorPosition } = room.coordinates;
                      const isRoomSelected = selectedRoom?.id === room.id;
                      const isRoomHovered = hoveredRoom?.id === room.id;
                      const isStairs = room.code === 'TANGGA';
                      const isCompact = w < 85 || h < 110;
                      const displayNames = getRoomDisplayNames(room, isCompact);

                      // Desain arsitektural netral dan elegan tanpa status 'Tersedia'/'Digunakan'
                      const roomFill = isRoomSelected
                        ? (isDark ? 'rgba(5, 150, 105, 0.45)' : '#d1fae5')
                        : isRoomHovered
                        ? (isDark ? 'rgba(5, 150, 105, 0.25)' : '#ecfdf5')
                        : (isDark ? '#1e293b' : '#f8fafc');

                      const roomStroke = isRoomSelected
                        ? '#059669'
                        : isRoomHovered
                        ? '#10b981'
                        : (isDark ? '#334155' : '#cbd5e1');

                      return (
                        <g
                          key={room.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectFloor(floor.floorNumber);
                            onSelectRoom(room);
                            setTargetRoom(room);
                          }}
                          onMouseEnter={() => setHoveredRoom(room)}
                          onMouseLeave={() => setHoveredRoom(null)}
                          className="cursor-pointer transition-all duration-200"
                        >
                          {/* Kotak Ruangan Utama */}
                          <rect
                            x={x}
                            y={y}
                            width={w}
                            height={h}
                            rx="8"
                            fill={roomFill}
                            stroke={roomStroke}
                            strokeWidth={isRoomSelected ? '3.5' : isRoomHovered ? '2.5' : '1.8'}
                            filter={isRoomSelected ? 'url(#emerald-glow-3d)' : undefined}
                          />

                          {/* Indikator Posisi Pintu Masuk Arsitektur */}
                          {doorPosition === 'bottom' && (
                            <line x1={x + w / 2 - 14} y1={y + h} x2={x + w / 2 + 14} y2={y + h} stroke="#059669" strokeWidth="3" />
                          )}
                          {doorPosition === 'top' && (
                            <line x1={x + w / 2 - 14} y1={y} x2={x + w / 2 + 14} y2={y} stroke="#059669" strokeWidth="3" />
                          )}
                          {doorPosition === 'left' && (
                            <line x1={x} y1={y + h / 2 - 14} x2={x} y2={y + h / 2 + 14} stroke="#059669" strokeWidth="3" />
                          )}
                          {doorPosition === 'right' && (
                            <line x1={x + w} y1={y + h / 2 - 14} x2={x + w} y2={y + h / 2 + 14} stroke="#059669" strokeWidth="3" />
                          )}

                          {isStairs ? (
                            /* 🪜 Gambar Tangga Arsitektural dengan Cross Chevron & Lubang Void */
                            <g pointerEvents="none">
                              <line x1={x + 4} y1={y + 4} x2={x + w - 4} y2={y + h - 4} stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="4 2" />
                              <line x1={x + w - 4} y1={y + 4} x2={x + 4} y2={y + h - 4} stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="4 2" />
                              <path d={`M ${x + w/2 - 12} ${y + h/2 + 8} L ${x + w/2} ${y + h/2 - 6} L ${x + w/2 + 12} ${y + h/2 + 8}`} fill="none" stroke="#059669" strokeWidth="2.8" />
                              <rect x={x + w/2 - 32} y={y + h - 22} width="64" height="16" rx="4" fill="#ffffff" stroke="#10b981" strokeWidth="1.2" />
                              <text x={x + w / 2} y={y + h - 10} textAnchor="middle" fill="#047857" fontSize="9" fontWeight="800" fontFamily="monospace">
                                {isUpperFloor ? 'VOID TANGGA' : 'TANGGA 3D'}
                              </text>
                            </g>
                          ) : (
                            /* 🏫 Konten Ruangan: Badge Kode, Nama Jelas, Orang, dan Kapasitas (Bersih Tanpa Status) */
                            <g pointerEvents="none">
                              
                              {/* 🏷️ Badge Kode Ruangan (Tegas & Kontras Tinggi) */}
                              <rect
                                x={x + (isCompact ? 4 : 8)}
                                y={y + 6}
                                width={isCompact ? Math.min(48, w - 8) : Math.min(56, w - 16)}
                                height="20"
                                rx="5"
                                fill={isDark ? '#0f172a' : '#ffffff'}
                                stroke={roomStroke}
                                strokeWidth="1.5"
                              />
                              <text
                                x={x + (isCompact ? 4 : 8) + (isCompact ? Math.min(48, w - 8) : Math.min(56, w - 16)) / 2}
                                y={y + 20}
                                textAnchor="middle"
                                fill={isDark ? '#ffffff' : '#0f172a'}
                                fontSize={room.code.length > 5 ? "9" : "10.5"}
                                fontWeight="800"
                                fontFamily="monospace"
                              >
                                {room.code}
                              </text>

                              {/* 📝 Penulisan Nama Ruangan yang Jelas & Terbaca (2 Baris Rapi) */}
                              <text
                                x={x + (isCompact ? 4 : 8)}
                                y={y + 38}
                                fill={isDark ? '#ffffff' : '#0f172a'}
                                fontSize={isCompact ? "9.5" : "11"}
                                fontWeight="800"
                                fontFamily="sans-serif"
                              >
                                <tspan x={x + (isCompact ? 4 : 8)} dy="0">
                                  {displayNames.line1}
                                </tspan>
                                {displayNames.line2 && (
                                  <tspan 
                                    x={x + (isCompact ? 4 : 8)} 
                                    dy="13" 
                                    fontSize={isCompact ? "8.5" : "9.5"} 
                                    fontWeight="600" 
                                    fill={isDark ? '#cbd5e1' : '#475569'}
                                  >
                                    {displayNames.line2}
                                  </tspan>
                                )}
                              </text>

                              {/* 👥 Simulasi Orang di Dalam Ruangan Kuliah / Lab */}
                              {renderPeopleInsideRoom(room, x, y, w, h)}

                              {/* Kapasitas Kursi di Pojok Bawah Ruang */}
                              <text
                                x={x + (isCompact ? 4 : 8)}
                                y={y + h - 10}
                                fill="#64748b"
                                fontSize="9"
                                fontWeight="700"
                              >
                                👥 {room.capacity} Kursi
                              </text>

                            </g>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* 📊 Bar Ringkasan Sisi Utara & Selatan di Bawah Lempeng Lantai */}
                <div 
                  className={`px-4 py-2 border-t flex items-center justify-between text-[9.5px] font-extrabold transition-colors ${
                    isSelected
                      ? 'border-emerald-100 dark:border-emerald-950/60 bg-emerald-50/30 dark:bg-emerald-950/20'
                      : 'border-slate-100 dark:border-slate-800'
                  }`}
                  style={{ transform: 'translateZ(10px)' }}
                >
                  <span className="text-emerald-700 dark:text-emerald-400">
                    ✦ Sisi Utara: {floor.rooms.filter(r => r.coordinates.y < 250).length} Ruang
                  </span>
                  <span className="text-teal-700 dark:text-teal-400">
                    ✦ Sisi Selatan: {floor.rooms.filter(r => r.coordinates.y >= 250).length} Ruang
                  </span>
                  <span className="text-slate-600 dark:text-slate-300 font-mono">
                    Total {floor.rooms.length} Ruang & Fasilitas
                  </span>
                </div>

              </div>
            );
          })}
        </div>

        {/* 💡 Tooltip Preview Ruangan Mengambang Saat Hover di Mode 3D (Bersih Tanpa Status) */}
        {hoveredRoom && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-emerald-500/40 flex items-center gap-3 animate-fade-in pointer-events-none">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <p className="text-xs font-extrabold text-white">
                {hoveredRoom.code} • {hoveredRoom.name}
              </p>
              <p className="text-[10px] text-slate-300">
                Kapasitas {hoveredRoom.capacity} Kursi • {hoveredRoom.description || 'Ruangan Fakultas'} • Klik untuk Navigasi Rute
              </p>
            </div>
          </div>
        )}

      </div>

      {/* 3. Footer Keterangan Interaktivitas */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <p className="flex items-center gap-2">
          <Leaf className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Denah 3D Arsitektur Presisi:</strong> Tangga 3D menghubungkan Lantai 1 dan Lantai 2 sesuai cetak biru. Tekan tombol <strong>"POV Samping (Tangga 3D)"</strong> untuk mengamati anak tangga dan railing dari samping.
          </span>
        </p>
        <button
          onClick={() => onSelectFloor(activeFloorNumber)}
          className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
        >
          <span>Tampilkan Denah 2D Tingkat {activeFloorNumber}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
