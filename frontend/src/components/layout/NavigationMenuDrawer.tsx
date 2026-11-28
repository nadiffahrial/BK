import React from 'react';
import { CampusLogo } from '../common/CampusLogo';
import { Building, User } from '../../types';
import { X, LogOut, LogIn } from 'lucide-react';

interface NavigationMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  buildings: Building[];
  activeBuildingId: string;
  onSelectBuilding: (buildingId: string) => void;
  activeFloorNumber: number;
  onSelectFloor: (floorNumber: number) => void;
  user: User | null;
  onLoginClick: () => void;
  logout: () => void;
}

export const NavigationMenuDrawer: React.FC<NavigationMenuDrawerProps> = ({
  isOpen,
  onClose,
  buildings,
  activeBuildingId,
  onSelectBuilding,
  activeFloorNumber,
  onSelectFloor,
  user,
  onLoginClick,
  logout
}) => {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeBuilding = buildings.find(b => b.id === activeBuildingId) || buildings[0];
  if (!activeBuilding) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop with blur */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-emerald-100 dark:border-slate-800 flex flex-col justify-between animate-slide-left text-slate-800 dark:text-slate-100 transition-colors">
          
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CampusLogo size="md" />
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                  {user?.role === 'admin' || user?.role === 'super_admin' ? 'Panel Admin Kampus' : 'Universitas Siliwangi'}
                </h2>
                <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  {user?.role === 'admin' || user?.role === 'super_admin' ? 'Manajemen ruang & layanan CS' : 'SILOKA • Siliwangi Location Assistant'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Switch building */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-2.5">
                Gedung
              </label>
              <div className="space-y-2">
                {buildings.slice(0, 2).map((b) => {
                  const isActive = b.id === activeBuildingId;
                  return (
                    <button
                      key={b.id}
                      onClick={() => {
                        onSelectBuilding(b.id);
                        onClose();
                      }}
                      className={`w-full p-3 rounded-lg border text-left transition-colors cursor-pointer flex items-center justify-between ${
                        isActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-600'
                          : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-semibold ${isActive ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-500'}`}>Blok {b.code}</span>
                        <div>
                          <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{b.shortName}</span>
                        </div>
                      </div>

                      <span className={`text-xs font-medium ${
                        isActive ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-500'
                      }`}>
                        {isActive ? 'Dipilih' : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Switch floor */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-2.5">
                Lantai · {activeBuilding.shortName}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {activeBuilding.floors.map((fl) => {
                  const isSelected = fl.floorNumber === activeFloorNumber;
                  return (
                  <button
                      key={fl.floorNumber}
                      onClick={() => onSelectFloor(fl.floorNumber)}
                    className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                        isSelected
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold text-sm">Lantai {fl.floorNumber}</div>
                      <div className={`text-xs mt-1 ${isSelected ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'}`}>{fl.rooms.length} ruangan</div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between gap-3">
            {user ? (
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer w-full justify-center"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar (Logout)</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onLoginClick();
                  onClose();
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer w-full justify-center"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk Administrator</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

