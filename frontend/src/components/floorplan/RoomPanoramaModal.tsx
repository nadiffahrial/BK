import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Room } from '../../types';
import { 
  X, 
  RotateCw, 
  Pause, 
  Play, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  Compass, 
  RotateCcw,
  Sparkles,
  Smartphone,
  Eye,
  Info
} from 'lucide-react';

interface RoomPanoramaModalProps {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
}

export const RoomPanoramaModal: React.FC<RoomPanoramaModalProps> = ({
  room,
  isOpen,
  onClose
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isGyroActive, setIsGyroActive] = useState<boolean>(false);
  const [headingDeg, setHeadingDeg] = useState<number>(0);
  const [showInstructions, setShowInstructions] = useState<boolean>(true);

  // References for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Coordinate tracking for spherical panorama
  const lonRef = useRef<number>(0);
  const latRef = useRef<number>(0);
  const targetLonRef = useRef<number>(0);
  const targetLatRef = useRef<number>(0);
  const isPointerDownRef = useRef<boolean>(false);
  const onPointerDownPointerXRef = useRef<number>(0);
  const onPointerDownPointerYRef = useRef<number>(0);
  const onPointerDownLonRef = useRef<number>(0);
  const onPointerDownLatRef = useRef<number>(0);

  // Touch pinch-to-zoom tracking
  const touchDistanceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    setLoadError(null);
    setIsAutoRotate(true);

    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 1, 1100);
    cameraRef.current = camera;

    // 2. Inverted Sphere for 360 Panorama View
    const geometry = new THREE.SphereGeometry(500, 64, 32);
    // Invert the sphere so the texture renders on the inner faces
    geometry.scale(-1, 1, 1);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // 4. Load Equirectangular Panorama Texture
    const textureUrl = room.panoramaUrl || './panoramas/labkom-1j.jpg';
    const textureLoader = new THREE.TextureLoader();

    textureLoader.load(
      textureUrl,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;

        const material = new THREE.MeshBasicMaterial({ map: texture });
        const sphere = new THREE.Mesh(geometry, material);
        sphereRef.current = sphere;
        scene.add(sphere);

        setIsLoading(false);
      },
      undefined,
      (err) => {
        console.error('Failed to load 360 panorama image:', err);
        setLoadError('Gagal memuat file foto panorama 360°. Periksa ketersediaan gambar.');
        setIsLoading(false);
      }
    );

    // 5. Animation Loop with Smooth Damping
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      if (isAutoRotate && !isPointerDownRef.current && !isGyroActive) {
        targetLonRef.current += 0.08;
      }

      // Smooth camera motion (lerp)
      lonRef.current += (targetLonRef.current - lonRef.current) * 0.12;
      latRef.current += (targetLatRef.current - latRef.current) * 0.12;

      // Clamp vertical latitude between -85° and 85° to prevent camera flipping
      latRef.current = Math.max(-85, Math.min(85, latRef.current));

      const phi = THREE.MathUtils.degToRad(90 - latRef.current);
      const theta = THREE.MathUtils.degToRad(lonRef.current);

      const targetX = 500 * Math.sin(phi) * Math.cos(theta);
      const targetY = 500 * Math.cos(phi);
      const targetZ = 500 * Math.sin(phi) * Math.sin(theta);

      camera.lookAt(targetX, targetY, targetZ);
      renderer.render(scene, camera);

      // Keep heading deg 0-360 for UI compass
      const normalizedLon = ((Math.round(lonRef.current) % 360) + 360) % 360;
      setHeadingDeg(normalizedLon);
    };

    animate();

    // 6. Handle Window Resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const newWidth = containerRef.current.clientWidth || window.innerWidth;
      const newHeight = containerRef.current.clientHeight || window.innerHeight;

      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Auto-dismiss instructions after 5 seconds
    const timer = setTimeout(() => {
      setShowInstructions(false);
    }, 5000);

    // 7. Cleanup Function
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.remove();
        rendererRef.current.dispose();
      }
      geometry.dispose();
    };
  }, [isOpen, room.panoramaUrl, isAutoRotate, isGyroActive]);

  // Pointer / Mouse / Touch interaction handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isPointerDownRef.current = true;
    onPointerDownPointerXRef.current = e.clientX;
    onPointerDownPointerYRef.current = e.clientY;
    onPointerDownLonRef.current = targetLonRef.current;
    onPointerDownLatRef.current = targetLatRef.current;
    setShowInstructions(false);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current) return;
    const factor = (cameraRef.current?.fov || 75) / 500;
    targetLonRef.current = onPointerDownLonRef.current - (e.clientX - onPointerDownPointerXRef.current) * factor;
    targetLatRef.current = onPointerDownLatRef.current + (e.clientY - onPointerDownPointerYRef.current) * factor;
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
    touchDistanceRef.current = null;
  };

  // Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!cameraRef.current) return;
    const newFov = cameraRef.current.fov + e.deltaY * 0.05;
    cameraRef.current.fov = Math.max(30, Math.min(95, newFov));
    cameraRef.current.updateProjectionMatrix();
  };

  // Touch pinch zoom
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && cameraRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);

      if (touchDistanceRef.current !== null) {
        const delta = touchDistanceRef.current - dist;
        const newFov = cameraRef.current.fov + delta * 0.15;
        cameraRef.current.fov = Math.max(30, Math.min(95, newFov));
        cameraRef.current.updateProjectionMatrix();
      }
      touchDistanceRef.current = dist;
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (!cameraRef.current) return;
    cameraRef.current.fov = Math.max(30, cameraRef.current.fov - 10);
    cameraRef.current.updateProjectionMatrix();
  };

  const handleZoomOut = () => {
    if (!cameraRef.current) return;
    cameraRef.current.fov = Math.min(95, cameraRef.current.fov + 10);
    cameraRef.current.updateProjectionMatrix();
  };

  // Reset to original forward view
  const handleResetView = () => {
    targetLonRef.current = 0;
    targetLatRef.current = 0;
    if (cameraRef.current) {
      cameraRef.current.fov = 75;
      cameraRef.current.updateProjectionMatrix();
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Device orientation / Gyroscope toggle
  const toggleGyroscope = async () => {
    if (isGyroActive) {
      setIsGyroActive(false);
      return;
    }

    try {
      if (typeof (DeviceOrientationEvent as any)?.requestPermission === 'function') {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          enableGyroscope();
        } else {
          alert('Izin sensor orientasi tidak diberikan.');
        }
      } else {
        enableGyroscope();
      }
    } catch (e) {
      alert('Sensor orientasi / giroskop tidak didukung pada browser ini.');
    }
  };

  const enableGyroscope = () => {
    setIsGyroActive(true);
    setIsAutoRotate(false);

    const onDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null && e.beta !== null) {
        targetLonRef.current = 360 - e.alpha;
        targetLatRef.current = Math.max(-80, Math.min(80, e.beta - 90));
      }
    };

    window.addEventListener('deviceorientation', onDeviceOrientation, true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in select-none">
      
      {/* Panorama Canvas Container */}
      <div 
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        onTouchMove={handleTouchMove}
        className="relative w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
      >
        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 text-white z-20">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
            <div className="text-base font-extrabold flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-400 animate-pulse" />
              <span>Memuat Panorama 360°...</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{room.name}</p>
          </div>
        )}

        {/* Error Fallback */}
        {loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95 text-white z-20 p-6 text-center">
            <div className="p-4 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 mb-4 max-w-md">
              <p className="font-bold text-sm">{loadError}</p>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 font-bold text-xs cursor-pointer transition-colors"
            >
              Kembali ke Denah
            </button>
          </div>
        )}

        {/* Top HUD: Room Information & Quick Actions */}
        <div className="absolute top-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-start justify-between gap-4 z-10 pointer-events-none">
          <div className="pointer-events-auto">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-lg bg-emerald-500 text-slate-950 shadow-md">
                {room.code}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-lg bg-white/20 backdrop-blur-md text-white font-bold border border-white/20">
                {room.buildingId === 'gedung-a' ? 'Gedung LABTEK 1' : 'Gedung FT.1'} • Tingkat {room.floorNumber}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-lg bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>360° Panorama Interaktif</span>
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white drop-shadow-md">
              {room.name}
            </h2>
            <p className="text-xs text-slate-300 hidden sm:block mt-0.5 drop-shadow">
              {room.description}
            </p>
          </div>

          {/* Action buttons on top right */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={toggleFullscreen}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-md"
              title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-2xl bg-rose-500/80 hover:bg-rose-600 text-white backdrop-blur-md border border-rose-400/40 transition-all cursor-pointer shadow-md"
              title="Tutup Tampilan 360°"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Instructions Hint Overlay (auto-fades or dismissable) */}
        {showInstructions && !isLoading && !loadError && (
          <div 
            onClick={() => setShowInstructions(false)}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 p-4 rounded-3xl bg-black/75 backdrop-blur-md border border-emerald-500/30 text-white text-center shadow-2xl pointer-events-auto cursor-pointer animate-fade-in max-w-sm"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 mx-auto flex items-center justify-center mb-2.5 animate-pulse">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-white">Eksplorasi Ruangan 360°</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              <strong>Klik & geser mouse</strong> atau <strong>usap layar HP</strong> untuk melihat sekeliling. Gunakan scroll mouse atau cubit layar untuk zoom in/out.
            </p>
            <div className="mt-3 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 py-1 px-3 rounded-full border border-emerald-800 inline-block">
              Ketuk untuk memulai
            </div>
          </div>
        )}

        {/* Bottom Floating Control Bar */}
        <div className="absolute bottom-5 inset-x-0 flex flex-col items-center gap-2 z-10 pointer-events-none px-4">
          
          {/* Compass & Angle indicator */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[11px] font-mono font-bold shadow-md pointer-events-auto">
            <Compass className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
            <span>Sudut Pandang: {headingDeg}°</span>
          </div>

          {/* Main Control Pill */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/70 backdrop-blur-xl border border-white/20 text-white shadow-2xl pointer-events-auto flex-wrap justify-center">
            
            {/* Auto Rotate Button */}
            <button
              onClick={() => setIsAutoRotate(!isAutoRotate)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isAutoRotate 
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' 
                  : 'bg-white/10 hover:bg-white/20 text-slate-200'
              }`}
              title={isAutoRotate ? 'Jeda Putar Otomatis' : 'Aktifkan Putar Otomatis'}
            >
              {isAutoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span className="hidden sm:inline">{isAutoRotate ? 'Jeda Putar' : 'Putar Otomatis'}</span>
            </button>

            {/* Reset Angle Button */}
            <button
              onClick={handleResetView}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer"
              title="Reset Arah Depan"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-white/20 mx-0.5" />

            {/* Zoom In & Out */}
            <button
              onClick={handleZoomIn}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer"
              title="Perbesar Tampilan (Zoom In)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              onClick={handleZoomOut}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer"
              title="Perkecil Tampilan (Zoom Out)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            {/* Mobile Gyroscope Button */}
            <button
              onClick={toggleGyroscope}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isGyroActive 
                  ? 'bg-cyan-600 text-white shadow-md' 
                  : 'bg-white/10 hover:bg-white/20 text-slate-200'
              }`}
              title="Mode Giroskop Sensor HP"
            >
              <Smartphone className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-white/20 mx-0.5 hidden sm:block" />

            {/* Close Button on Pill */}
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer hidden sm:flex items-center gap-1.5"
            >
              <span>Tutup</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
