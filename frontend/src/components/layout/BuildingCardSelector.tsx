import React from 'react';
import { Building, Room } from '../../types';
import { BuildingPlanButton } from './BuildingPlanButton';
import { Compass, Sparkles, Box } from 'lucide-react';

interface BuildingCardSelectorProps {
  buildings: Building[];
  activeBuildingId: string;
  onSelectBuilding: (buildingId: string) => void;
  activeFloorNumber?: number;
  onSelectFloor?: (floorNumber: number) => void;
  onSelectRoom?: (room: Room) => void;
}

export const BuildingCardSelector: React.FC<BuildingCardSelectorProps> = ({
  buildings,
  activeBuildingId,
  onSelectBuilding,
  activeFloorNumber = 1,
  onSelectFloor
}) => {
  return (
    <div className="mb-6">
      {/* Title bar - Clean & Minimalist */}
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
            <Box className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          </span>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
              Pilihan Gedung Universitas Siliwangi
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Ketuk ikon gedung untuk beralih denah 3D isometrik
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 hidden sm:flex items-center gap-1.5 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          Beralih ke Denah 3D
        </span>
      </div>

      {/* Standalone Building Icons (NO CARD CONTAINER) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 py-2">
        {buildings.slice(0, 2).map((b) => (
          <BuildingPlanButton
            key={b.id}
            building={b}
            isActive={b.id === activeBuildingId}
            onSelect={() => onSelectBuilding(b.id)}
            activeFloorNumber={activeFloorNumber}
            onSelectFloor={onSelectFloor}
          />
        ))}
      </div>
    </div>
  );
};
