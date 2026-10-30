import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Sparkles } from 'lucide-react';

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'switch';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  showLabel = false,
  className = '',
  size = 'md',
  variant = 'button'
}) => {
  const { isDark, toggleTheme } = useTheme();

  // Variant: Interactive Pill Switch Slider (Perfect for settings/drawer)
  if (variant === 'switch') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`relative inline-flex items-center h-8 w-16 p-1 rounded-full cursor-pointer transition-colors duration-500 ease-out focus:outline-none focus:ring-2 focus:ring-emerald-500/40 select-none ${
          isDark
            ? 'bg-slate-800 border border-slate-700 shadow-inner'
            : 'bg-emerald-100/90 border border-emerald-300 shadow-inner'
        } ${className}`}
        title={isDark ? 'Beralih ke Mode Terang (Light Mode)' : 'Beralih ke Mode Gelap (Dark Mode)'}
        aria-label="Toggle Dark Mode"
      >
        {/* Background icon hints */}
        <div className="absolute inset-0 flex items-center justify-between px-2 text-[10px] pointer-events-none">
          <Sun className={`w-3.5 h-3.5 transition-opacity duration-300 ${isDark ? 'text-slate-500 opacity-40' : 'text-amber-500 opacity-0'}`} />
          <Moon className={`w-3.5 h-3.5 transition-opacity duration-300 ${isDark ? 'text-amber-300 opacity-0' : 'text-emerald-700 opacity-40'}`} />
        </div>

        {/* Sliding Thumb */}
        <span
          className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center transform transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) shadow-md ${
            isDark
              ? 'translate-x-8 bg-slate-900 text-amber-300 border border-slate-700 shadow-[0_0_12px_rgba(251,191,36,0.35)]'
              : 'translate-x-0 bg-white text-amber-500 border border-amber-200 shadow-[0_2px_8px_rgba(0,0,0,0.12)]'
          }`}
        >
          {isDark ? (
            <Moon className="w-3.5 h-3.5 transform transition-transform duration-500 rotate-0" />
          ) : (
            <Sun className="w-3.5 h-3.5 transform transition-transform duration-500 rotate-0" />
          )}
        </span>
      </button>
    );
  }

  // Variant: Modern Flexible Button (Default for Navbar & Header)
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center gap-2 rounded-2xl transition-all duration-500 ease-out cursor-pointer select-none group border focus:outline-none focus:ring-2 focus:ring-emerald-500/40 active:scale-95 overflow-hidden ${
        isDark
          ? 'bg-slate-800/90 hover:bg-slate-700 text-amber-300 border-slate-700 shadow-sm shadow-black/20 hover:shadow-[0_0_16px_rgba(251,191,36,0.18)]'
          : 'bg-slate-100 hover:bg-emerald-50/80 text-slate-700 hover:text-emerald-800 border-slate-200/90 hover:border-emerald-300 shadow-xs hover:shadow-[0_0_16px_rgba(16,185,129,0.14)]'
      } ${
        size === 'sm' ? 'px-2 py-1.5 text-xs' : 'px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold'
      } ${className}`}
      title={isDark ? 'Mode Gelap Aktif — Klik untuk Mode Terang' : 'Mode Terang Aktif — Klik untuk Mode Gelap'}
      aria-label="Toggle Dark Mode"
    >
      {/* Dual morphing icon container */}
      <div className="relative w-4 h-4 flex items-center justify-center">
        {/* Sun Icon (Fades and rotates smoothly out in dark mode) */}
        <Sun
          className={`w-4 h-4 text-amber-500 absolute inset-0 transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${
            isDark
              ? 'opacity-0 rotate-90 scale-0 pointer-events-none'
              : 'opacity-100 rotate-0 scale-100 group-hover:rotate-45'
          }`}
        />

        {/* Moon Icon (Fades and rotates smoothly in in dark mode) */}
        <Moon
          className={`w-4 h-4 text-amber-300 absolute inset-0 transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${
            isDark
              ? 'opacity-100 rotate-0 scale-100 group-hover:-rotate-12'
              : 'opacity-0 -rotate-90 scale-0 pointer-events-none'
          }`}
        />
      </div>

      {showLabel && (
        <span className="text-xs font-bold transition-colors duration-300">
          {isDark ? 'Mode Gelap' : 'Mode Terang'}
        </span>
      )}

      {/* Floating pulsing theme aura */}
      <span
        className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
          isDark
            ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)] scale-110'
            : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] scale-100'
        }`}
      />
    </button>
  );
};
