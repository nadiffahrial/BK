import React from 'react';
import { GraduationCap, MapPin, Phone, Mail, Globe, Leaf } from 'lucide-react';
import unsilLogo from '../../assets/logo-unsil.png';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-emerald-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md mt-10 py-6 text-xs text-slate-500 dark:text-slate-400 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          {/* Brand info */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center shrink-0">
              <img
                src={unsilLogo}
                alt="Logo Universitas Siliwangi"
                className="w-8 h-8 object-contain drop-shadow-xs"
              />
            </div>
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
          <div className="flex items-center gap-6 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              Gedung LABTEK 1 & Gedung FT.1
            </span>
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
