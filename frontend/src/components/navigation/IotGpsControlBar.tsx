import React, { useState } from 'react';
import { useGps } from '../../context/GpsContext';
import { 
  Navigation, 
  MapPin, 
  Play, 
  Square, 
  X, 
  Compass,
  RotateCcw,
  RotateCw,
  ArrowUp,
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  ArrowUpLeft,
  ArrowDown,
  Smartphone,
  Sliders,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const IotGpsControlBar: React.FC = () => {
  const { 
    deviceState, 
    routeInfo, 
    targetRoom, 
    isSimulatingWalk, 
    setAnchorBeacon, 
    setTargetRoom, 
    startSimulatedWalk, 
    stopSimulatedWalk, 
    availableBeacons,
    requestCompassPermission,
    setManualHeading
  } = useGps();
  
  const [showBeaconSelector, setShowBeaconSelector] = useState<boolean>(false);
  const [showManualHeading, setShowManualHeading] = useState<boolean>(false);
  const [isRequestingSensor, setIsRequestingSensor] = useState<boolean>(false);

  // Jika tidak sedang menavigasi ke ruangan, sembunyikan bar agar tampilan tetap simple dan rapih
  if (!routeInfo || !targetRoom) {
    return null;
  }

  const handleRequestCompass = async () => {
    setIsRequestingSensor(true);
    await requestCompassPermission();
    setIsRequestingSensor(false);
  };

  const getTurnIcon = (instruction?: string | null) => {
    if (!instruction) return <ArrowUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    if (instruction.includes('kanan')) {
      if (instruction.includes('Serong')) return <ArrowUpRight className="w-5 h-5 text-amber-500" />;
      return <ArrowRight className="w-5 h-5 text-amber-500" />;
    }
    if (instruction.includes('kiri')) {
      if (instruction.includes('Serong')) return <ArrowUpLeft className="w-5 h-5 text-amber-500" />;
      return <ArrowLeft className="w-5 h-5 text-amber-500" />;
    }
    if (instruction.includes('Putar balik')) {
      return <ArrowDown className="w-5 h-5 text-rose-500" />;
    }
    return <ArrowUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
  };

  return (
    <div className="mb-4 relative z-20 animate-slide-down">
      {/* Sleek, Clean Route Guidance Banner with Compass Integration */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-emerald-200 dark:border-slate-800 p-3.5 sm:p-4 shadow-sm transition-all duration-300">
        
        {/* Header: Destination & Metrics */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-emerald-100 dark:border-slate-800">
          
          {/* Destination info */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs shrink-0">
              <Navigation className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  {targetRoom.code}
                </span>
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                  {targetRoom.name}
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                <span>{targetRoom.buildingId === 'gedung-a' ? 'Gedung LABTEK 1' : 'Gedung FT.1'}</span>
                <span>•</span>
                <span>Tingkat {targetRoom.floorNumber}</span>
                <span>•</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                  Mulai dari: {deviceState.nearestBeacon?.zone || 'Lobby Utama'}
                </span>
              </p>
            </div>
          </div>

          {/* Action & Metric controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Distance badge */}
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
              <div className="text-[9px] text-slate-400 font-bold uppercase">Jarak</div>
              <div className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                {routeInfo.totalDistanceMeters} m
              </div>
            </div>

            {/* Time badge */}
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
              <div className="text-[9px] text-slate-400 font-bold uppercase">Estimasi</div>
              <div className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                ~{routeInfo.estimatedSeconds} dtk
              </div>
            </div>

            {/* Change start point button */}
            <button
              type="button"
              onClick={() => setShowBeaconSelector(!showBeaconSelector)}
              className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-slate-200 dark:border-slate-700"
              title="Ganti Titik Awal Mulai Jalan"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Titik Awal</span>
            </button>

            {/* Simulate Walking Button */}
            <button
              type="button"
              onClick={() => {
                if (isSimulatingWalk) {
                  stopSimulatedWalk();
                } else {
                  startSimulatedWalk();
                }
              }}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer ${
                isSimulatingWalk
                  ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
              title="Simulasikan langkah navigasi ke ruangan"
            >
              {isSimulatingWalk ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isSimulatingWalk ? 'Hentikan' : 'Mulai Jalan'}</span>
            </button>

            {/* Close Route Navigation */}
            <button
              type="button"
              onClick={() => setTargetRoom(null)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/50 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
              title="Tutup Navigasi Rute"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Change start point ribbon */}
        {showBeaconSelector && (
          <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2 animate-slide-down">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
              Pilih Titik Awal:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {availableBeacons.map(beacon => {
                const isSelected = deviceState.nearestBeacon?.id === beacon.id;
                return (
                  <button
                    key={beacon.id}
                    type="button"
                    onClick={() => {
                      setAnchorBeacon(beacon.id);
                      setShowBeaconSelector(false);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-white dark:bg-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    {beacon.zone}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 🧭 LIVE REAL-TIME DEVICE COMPASS & TURN-BY-TURN DIRECTION BANNER */}
        <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 dark:from-slate-800/80 dark:via-slate-800/50 dark:to-slate-800/80 border border-emerald-200/70 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
          
          {/* Left: Direction Instruction (Relative to User Device Heading) */}
          <div className="flex items-center gap-3">
            {/* Live Animated Turn Arrow Icon */}
            <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-slate-700 shadow-xs flex items-center justify-center shrink-0">
              {getTurnIcon(deviceState.relativeTurnInstruction)}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-800">
                  Petunjuk Arah Real-Time
                </span>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  (Sesuai Arah HP Anda)
                </span>
              </div>
              <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
                <span>{deviceState.relativeTurnInstruction || 'Lurus ke depan ikuti koridor'}</span>
                {deviceState.relativeBearingToTarget !== null && (
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-semibold">
                    ({deviceState.relativeBearingToTarget > 0 ? `+${deviceState.relativeBearingToTarget}°` : `${deviceState.relativeBearingToTarget}°`})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Live Compass Dial & Calibration Trigger */}
          <div className="flex items-center gap-2.5 flex-wrap">
            
            {/* Mini Compass Rose Dial */}
            <div 
              className="relative w-10 h-10 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center select-none"
              title={`Kompas Arah: ${deviceState.heading}° (${deviceState.compassDirectionName})`}
            >
              {/* Rotating Compass Needle (Points North) */}
              <div 
                className="absolute inset-0 flex items-center justify-center transition-transform duration-150 ease-out"
                style={{ transform: `rotate(${-deviceState.heading}deg)` }}
              >
                <div className="w-1 h-3.5 bg-rose-500 rounded-t-sm shadow-2xs" />
                <div className="w-1 h-3.5 bg-slate-300 dark:bg-slate-600 rounded-b-sm" />
              </div>
              {/* North label */}
              <span className="absolute top-0.5 text-[7px] font-black text-rose-500">N</span>
              {/* Center pivot dot */}
              <div className="w-1.5 h-1.5 rounded-full bg-slate-800 dark:bg-white z-10" />
            </div>

            {/* Degree Readout & Direction Name */}
            <div className="text-left">
              <div className="text-xs font-black text-slate-800 dark:text-slate-100 font-mono">
                {deviceState.heading}°
              </div>
              <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                {deviceState.compassDirectionName}
              </div>
            </div>

            {/* Mobile Sensor Activation / Calibration Button */}
            <button
              type="button"
              onClick={handleRequestCompass}
              disabled={isRequestingSensor}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                deviceState.isCompassActive
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50'
              }`}
              title="Aktifkan atau Sinkronkan Sensor Kompas HP"
            >
              <Smartphone className={`w-3.5 h-3.5 ${deviceState.isCompassActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{deviceState.isCompassActive ? 'Sensor HP Aktif' : 'Aktifkan Kompas HP'}</span>
            </button>

            {/* Desktop / Manual Rotate Toggle Button */}
            <button
              type="button"
              onClick={() => setShowManualHeading(!showManualHeading)}
              className="p-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs transition-colors cursor-pointer"
              title="Tes Putar Manual (Khusus Laptop / PC)"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Manual heading test controls for Desktop / PC */}
        {showManualHeading && (
          <div className="mt-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs animate-slide-down">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              Simulasi Arah Kompas (Tes Desktop):
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setManualHeading(deviceState.heading - 30)}
                className="px-2 py-1 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer flex items-center gap-1 text-[11px]"
              >
                <RotateCcw className="w-3 h-3" /> -30°
              </button>
              <button
                type="button"
                onClick={() => setManualHeading(deviceState.heading + 30)}
                className="px-2 py-1 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer flex items-center gap-1 text-[11px]"
              >
                <RotateCw className="w-3 h-3" /> +30°
              </button>
              <button
                type="button"
                onClick={() => setManualHeading(0)}
                className="px-2 py-1 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-bold text-rose-600 hover:bg-slate-100 cursor-pointer text-[11px]"
              >
                0° Utara
              </button>
              <button
                type="button"
                onClick={() => setManualHeading(90)}
                className="px-2 py-1 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-bold text-emerald-600 hover:bg-slate-100 cursor-pointer text-[11px]"
              >
                90° Timur
              </button>
              <button
                type="button"
                onClick={() => setManualHeading(180)}
                className="px-2 py-1 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-bold text-sky-600 hover:bg-slate-100 cursor-pointer text-[11px]"
              >
                180° Selatan
              </button>
              <button
                type="button"
                onClick={() => setManualHeading(270)}
                className="px-2 py-1 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-bold text-amber-600 hover:bg-slate-100 cursor-pointer text-[11px]"
              >
                270° Barat
              </button>
            </div>
          </div>
        )}

        {/* Turn-by-Turn Guidance Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-3">
          {routeInfo.steps.map((step, idx) => (
            <div 
              key={idx}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                {idx + 1}
              </div>
              <span className="font-semibold text-slate-700 dark:text-slate-200 text-[11px] leading-tight">
                {step.instruction}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
