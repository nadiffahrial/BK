import React from 'react';
import { Building, Room, ViewMode } from '../../types';
import { BuildingPlanButton } from './BuildingPlanButton';
import { Box, MapPin } from 'lucide-react';

interface BuildingCardSelectorProps {
  buildings: Building[];
  activeBuildingId: string;
  onSelectBuilding: (buildingId: string) => void;
  activeFloorNumber?: number;
  onSelectFloor?: (floorNumber: number) => void;
  onSelectRoom?: (room: Room) => void;
  viewMode?: ViewMode;
}

export const BuildingCardSelector: React.FC<BuildingCardSelectorProps> = ({
  buildings,
  activeBuildingId,
  onSelectBuilding,
  activeFloorNumber = 1,
  onSelectFloor,
  viewMode = '3d'
}) => {
  return (
    <div className="mb-6">
      {/* Title bar - Clean & Minimalist */}
      <div className="flex items-center justify-between mb-2.5 px-1 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
            <Box className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                Pilihan Gedung Universitas Siliwangi
              </h3>
              <a
                href="https://maps.app.goo.gl/rPbFcGqnjGcag6i66"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/80 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors shadow-2xs group"
                title="Buka Lokasi Kampus 2 Mugarsari di Google Maps"
              >
                <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Kampus 2 Mugarsari ↗</span>
              </a>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Gedung LABTEK 1 & FT.1 • Pilih gedung untuk memperbarui denah yang sedang dibuka
            </p>
          </div>
        </div>

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
            viewMode={viewMode}
          />
        ))}
      </div>
    </div>
  );
};
