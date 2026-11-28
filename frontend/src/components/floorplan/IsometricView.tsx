import React, { useState } from 'react';
import { Building, Room } from '../../types';
import { Building2, Layers, Eye, RotateCcw, ChevronRight, MousePointer2, Move3d, DoorOpen } from 'lucide-react';
import { ObservedBuildingModel } from './ObservedBuildingModel';

interface IsometricViewProps {
  building: Building;
  activeFloorNumber: number;
  onSelectFloor: (floorNumber: number) => void;
  onSelectRoom: (room: Room) => void;
  selectedRoom?: Room | null;
  onChangeViewMode?: (mode: '2d' | '3d' | 'list') => void;
  onSwitchToBuildingView?: () => void;
}

export const IsometricView: React.FC<IsometricViewProps> = ({
  building,
  activeFloorNumber,
  onSelectFloor,
  onSelectRoom,
  selectedRoom,
  onChangeViewMode,
  onSwitchToBuildingView
}) => {
  const [cameraMode, setCameraMode] = useState<'iso' | 'top' | 'side'>('iso');
  const [showOtherFloors, setShowOtherFloors] = useState(true);
  const activeFloor = building.floors.find(floor => floor.floorNumber === activeFloorNumber) || building.floors[0];

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="rounded-xl bg-emerald-700 p-2 text-white"><Building2 className="h-5 w-5" /></div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-extrabold text-slate-900 dark:text-white">Model potongan 3D · {building.shortName}</h2>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">Posisi ruang dari denah observasi. Pilih ruang untuk membuka detail.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {onSwitchToBuildingView && <button onClick={onSwitchToBuildingView} className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 sm:inline-flex"><Building2 className="h-3.5 w-3.5"/>Model gedung</button>}
          <button onClick={() => setCameraMode('iso')} className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${cameraMode === 'iso' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}><Move3d className="mr-1 inline h-3.5 w-3.5"/>Isometrik</button>
          <button onClick={() => setCameraMode('top')} className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${cameraMode === 'top' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}><Eye className="mr-1 inline h-3.5 w-3.5"/>Atas</button>
          <button onClick={() => setCameraMode('side')} className={`hidden rounded-lg px-3 py-2 text-xs font-bold transition-colors sm:inline-flex ${cameraMode === 'side' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}>Samping</button>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-950/50 sm:px-5">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Pilih lantai">
          {building.floors.map(floor => {
            const active = floor.floorNumber === activeFloorNumber;
            return <button key={floor.floorNumber} onClick={() => onSelectFloor(floor.floorNumber)} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${active ? 'border-emerald-700 bg-emerald-700 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-400 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'}`}><span>Lantai {floor.floorNumber}</span><span className={`rounded px-1.5 py-0.5 text-[10px] ${active ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>{floor.rooms.length} ruang</span></button>;
          })}
        </div>
        <button onClick={() => setShowOtherFloors(value => !value)} className="inline-flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-white hover:text-emerald-800 dark:text-slate-300 dark:hover:bg-slate-900"><Layers className="h-4 w-4"/>{showOtherFloors ? 'Lantai lain diredupkan' : 'Tampilkan lantai lain'}</button>
      </div>

      <div className="relative h-[min(68vh,680px)] min-h-[430px] overflow-hidden bg-slate-100 dark:bg-slate-950">
        <ObservedBuildingModel building={building} activeFloorNumber={activeFloor?.floorNumber || activeFloorNumber} showOtherFloors={showOtherFloors} cameraMode={cameraMode} selectedRoom={selectedRoom} onSelectRoom={onSelectRoom} />
        <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-white/60 bg-white/90 px-3 py-2 text-[10px] font-medium text-slate-600 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-300 sm:bottom-4 sm:left-4 sm:text-[11px]">
          <span className="inline-flex items-center gap-1.5"><Move3d className="h-3.5 w-3.5 text-emerald-700"/>Geser untuk putar</span>
          <span className="inline-flex items-center gap-1.5"><RotateCcw className="h-3.5 w-3.5 text-emerald-700"/>Scroll untuk zoom</span>
          <span className="inline-flex items-center gap-1.5"><MousePointer2 className="h-3.5 w-3.5 text-emerald-700"/>Klik ruang untuk detail</span>
        </div>
        <div className="absolute right-3 top-3 rounded-lg border border-white/60 bg-white/90 px-3 py-2 text-[10px] font-bold text-slate-600 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-300 sm:right-4 sm:top-4 sm:text-xs">
          {activeFloor?.name} · {activeFloor?.rooms.length} ruang
        </div>
        <div className="absolute bottom-3 right-3 hidden items-center gap-1.5 rounded-lg border border-white/60 bg-white/90 px-3 py-2 text-[10px] font-medium text-slate-600 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-300 sm:flex"><DoorOpen className="h-3.5 w-3.5 text-emerald-700"/>Dinding potongan · pintu terbuka</div>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-5">
        <p className="text-[11px] text-slate-500 dark:text-slate-400">Lantai aktif tampak penuh; lantai lain tetap tersambung dan transparan.</p>
        {onChangeViewMode && <button onClick={() => onChangeViewMode('2d')} className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 transition-colors hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-200">Buka denah 2D<ChevronRight className="h-4 w-4"/></button>}
      </footer>
    </section>
  );
};
