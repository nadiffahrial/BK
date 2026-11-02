import React from 'react';
import { MapPin, Mail, BookOpen } from 'lucide-react';
import { CampusLogo } from '../common/CampusLogo';

interface FooterProps {
  onOpenGuide?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenGuide }) => {
  return (
    <footer className="w-full border-t border-emerald-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md mt-10 py-6 text-xs text-slate-500 dark:text-slate-400 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          {/* Brand info */}
          <div className="flex items-center gap-3">
            <CampusLogo size="sm" />
            <div>
              <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                SmartCampus<span className="text-emerald-600 dark:text-emerald-400">3D</span> • Universitas Siliwangi
              </span>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Sistem Tata Ruang Gedung LABTEK 1 & FT.1 • Universitas Siliwangi
              </p>
            </div>
          </div>

          {/* Quick links & Contact */}
          <div className="flex items-center gap-4 sm:gap-6 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              LABTEK 1 & FT.1
            </span>
            {onOpenGuide && (
              <button
                type="button"
                onClick={onOpenGuide}
                className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 hover:underline font-bold cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Panduan Pengguna
              </button>
            )}
            <span className="hidden sm:flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-emerald-600" />
              sarpras@kampus.ac.id
            </span>
          </div>

          {/* Copyright */}
          <div className="text-[10px] text-slate-400">
            © {new Date().getFullYear()} SmartCampus3D • Terintegrasi MySQL & Node.js
          </div>

        </div>
      </div>
    </footer>
  );
};
