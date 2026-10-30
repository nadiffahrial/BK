import React, { useState } from 'react';
import { useGps } from '../../context/GpsContext';
import { 
  Navigation, 
  MapPin, 
  Play, 
  Square, 
  X, 
  CheckCircle2,
  CornerDownRight,
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
    availableBeacons 
  } = useGps();
  
  const [showBeaconSelector, setShowBeaconSelector] = useState<boolean>(false);

  // Jika tidak sedang menavigasi ke ruangan, sembunyikan bar agar tampilan tetap simple dan rapih
  if (!routeInfo || !targetRoom) {
    return null;
  }

  return (
    <div className="mb-4 relative z-20 animate-slide-down">
      {/* Sleek, Clean Route Guidance Banner */}
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
