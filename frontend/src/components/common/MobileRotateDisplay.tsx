import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  RotateCw, 
  Maximize2, 
  Minimize2, 
  X, 
  Check, 
  Box, 
  Layers, 
  Compass,
  Sparkles
} from 'lucide-react';
import { Building, Room, ViewMode } from '../../types';
import { IsometricView } from '../floorplan/IsometricView';
import { FloorMapSvg } from '../floorplan/FloorMapSvg';

interface MobileRotateDisplayProps {
  building: Building;
  activeFloorNumber: number;
  onSelectFloor: (floorNumber: number) => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  selectedRoom: Room | null;
  onSelectRoom: (room: Room) => void;
  onOpen3dView?: () => void;
}

export const MobileRotateDisplay: React.FC<MobileRotateDisplayProps> = ({
  building,
  activeFloorNumber,
  onSelectFloor,
  viewMode,
  onChangeViewMode,
  selectedRoom,
  onSelectRoom
}) => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isLandscape, setIsLandscape] = useState<boolean>(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState<boolean>(false);
  const [isVirtualLandscapeOpen, setIsVirtualLandscapeOpen] = useState<boolean>(false);
  const [showRotatedNotification, setShowRotatedNotification] = useState<boolean>(false);

  // Deteksi ukuran layar HP & Orientasi Layar Real-time
  useEffect(() => {
    const checkOrientation = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobileDevice = width < 768 || (width < 1024 && height < 500);
      const isLandscapeMode = width > height;

      setIsMobile(isMobileDevice);
      setIsLandscape(isLandscapeMode);

      if (isLandscapeMode && isMobileDevice) {
        setShowRotatedNotification(true);
        const timer = setTimeout(() => setShowRotatedNotification(false), 3000);
        return () => clearTimeout(timer);
      }
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Handler untuk mengaktifkan Rotasi Horizontal Layar
  const handleActivateHorizontalMode = async () => {
    // 1. Coba memanggil API Fullscreen & Screen Orientation Lock bawaan browser mobile
    try {
      const docEl = document.documentElement as any;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen();
      }

      const scr = screen as any;
      if (scr.orientation && scr.orientation.lock) {
        await scr.orientation.lock('landscape');
      }
    } catch {
      // Jika browser membatasi lock otomatis (misal iOS Safari), aktifkan Virtual Landscape Container
    }

    // 2. Buka Virtual Landscape Modal jika orientasi fisik masih portrait
    setIsVirtualLandscapeOpen(true);
  };

  const handleCloseHorizontalMode = async () => {
    setIsVirtualLandscapeOpen(false);

    try {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
      const scr = screen as any;
      if (scr.orientation && scr.orientation.unlock) {
        scr.orientation.unlock();
      }
    } catch {
      // Ignore
    }
  };

  const activeFloor = building.floors.find(f => f.floorNumber === activeFloorNumber) || building.floors[0];

  return (
    <>
      {/* Animasi CSS Rotasi HP Horizontal */}
      <style>{`
        @keyframes phoneTilt {
          0%, 15% { transform: rotate(0deg); }
          45%, 75% { transform: rotate(90deg); }
          95%, 100% { transform: rotate(0deg); }
        }
        .animate-phone-tilt {
          animation: phoneTilt 3.2s ease-in-out infinite;
        }
      `}</style>

      {/* 1. 📱 Banner Pintar di Mode Portrait Mobile */}
      {isMobile && !isLandscape && !isBannerDismissed && (
        <div className="md:hidden mb-4 p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg border border-emerald-400/40 animate-modal-spring flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
              <Smartphone className="w-5 h-5 text-emerald-100 animate-phone-tilt" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] font-extrabold tracking-wide">
                  Tampilan Horizontal (Landscape)
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/25 font-bold uppercase">
                  Lebih Luas
                </span>
              </div>
              <p className="text-[10.5px] text-emerald-100 leading-snug mt-0.5">
                Putar HP Anda ke posisi tidur (horizontal) atau klik tombol untuk tampilan denah 3D maksimal.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleActivateHorizontalMode}
              className="px-2.5 py-1.5 rounded-xl bg-white text-emerald-800 text-[11px] font-extrabold shadow-sm active:scale-95 transition-transform flex items-center gap-1 cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Putar</span>
            </button>
            <button
              onClick={() => setIsBannerDismissed(true)}
              className="w-7 h-7 rounded-xl bg-emerald-800/60 hover:bg-emerald-800 text-emerald-200 flex items-center justify-center text-xs cursor-pointer"
              title="Tutup Saran"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 2. ✓ Notifikasi Konfirmasi Saat HP Sudah Berada di Posisi Horizontal */}
      {showRotatedNotification && isLandscape && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-emerald-700/95 text-white text-xs font-extrabold shadow-xl backdrop-blur-md flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>Mode Horizontal Aktif: Tampilan Denah & 3D Maksimal</span>
        </div>
      )}

      {/* 3. 🔘 Tombol Mengambang (Floating Action Button) Rotasi Horizontal di Mobile */}
      {isMobile && !isVirtualLandscapeOpen && (
        <button
          onClick={handleActivateHorizontalMode}
          className="md:hidden fixed bottom-6 right-5 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-xl shadow-emerald-600/35 border border-emerald-400/40 active:scale-95 transition-all cursor-pointer"
          title="Tampilkan Denah Mode Horizontal"
        >
          <Smartphone className="w-4 h-4 text-emerald-200 animate-phone-tilt" />
          <span>Putar Horizontal</span>
        </button>
      )}

      {/* 4. 📺 Modal / Kontainer Virtual Horizontal Mode Penuh di Layar HP */}
      {isVirtualLandscapeOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col text-slate-100 overflow-hidden">
          
          {/* Header Kontrol Horizontal Ringkas & Elegan */}
          <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <h3 className="font-extrabold text-xs sm:text-sm text-white">
                {building.shortName} • Tingkat {activeFloorNumber}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                Mode Horizontal
              </span>
            </div>

            {/* Quick Switcher Tingkat & View */}
            <div className="flex items-center gap-2">
              {/* Floor Switcher */}
              <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-xs">
                {building.floors.map((fl) => (
                  <button
                    key={fl.floorNumber}
                    onClick={() => onSelectFloor(fl.floorNumber)}
                    className={`px-2.5 py-1 rounded-lg font-extrabold text-[11px] transition-all cursor-pointer ${
                      fl.floorNumber === activeFloorNumber
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Lt {fl.floorNumber}
                  </button>
                ))}
              </div>

              {/* 2D / 3D Switcher */}
              <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-xs">
                <button
                  onClick={() => onChangeViewMode('3d')}
                  className={`px-2 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
                    viewMode === '3d'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>3D</span>
                </button>
                <button
                  onClick={() => onChangeViewMode('2d')}
                  className={`px-2 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
                    viewMode === '2d'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>2D</span>
                </button>
              </div>

              {/* Close / Return to Vertical Mode */}
              <button
                onClick={handleCloseHorizontalMode}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all cursor-pointer ml-1"
                title="Tutup Mode Horizontal"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Tutup</span>
              </button>
            </div>
          </div>

          {/* Area Konten Denah Horizontal Luas */}
          <div className="flex-1 w-full h-full overflow-auto p-2 sm:p-4 flex items-center justify-center">
            {viewMode === '3d' ? (
              <div className="w-full max-w-6xl mx-auto">
                <IsometricView
                  building={building}
                  activeFloorNumber={activeFloorNumber}
                  onSelectFloor={onSelectFloor}
                  onSelectRoom={onSelectRoom}
                  selectedRoom={selectedRoom}
                  onChangeViewMode={onChangeViewMode}
                />
              </div>
            ) : (
              <div className="w-full max-w-6xl mx-auto">
                <FloorMapSvg
                  floor={activeFloor}
                  selectedRoom={selectedRoom}
                  onSelectRoom={onSelectRoom}
                  statusFilter="all"
                  activePathRoomId={null}
                  onTogglePathGuide={() => {}}
                  onOpen3dView={() => onChangeViewMode('3d')}
                />
              </div>
            )}
          </div>

          {/* Bottom helper footnote */}
          <div className="px-4 py-1.5 bg-slate-900/60 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between shrink-0">
            <span>💡 Tips: Putar HP Anda ke posisi tidur (landscape) untuk kenyamanan penuh.</span>
            <span className="font-mono text-emerald-400">SmartCampus 3D Mobile View</span>
          </div>

        </div>
      )}
    </>
  );
};
