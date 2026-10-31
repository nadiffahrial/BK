import React, { useState } from 'react';
import unsilLogo from '../../assets/logo-unsil.png';

interface CampusLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CampusLogo: React.FC<CampusLogoProps> = ({
  className = '',
  size = 'md'
}) => {
  const [hasError, setHasError] = useState(false);

  const dimensionClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10 sm:w-11 sm:h-11',
    lg: 'w-12 h-12 sm:w-14 sm:h-14'
  }[size];

  if (hasError) {
    // Elegant SVG Fallback if image path or network fails
    return (
      <div 
        className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-600 text-white shadow-md shadow-emerald-700/20 font-black shrink-0 ${dimensionClasses} ${className}`}
        title="Universitas Siliwangi"
      >
        <svg viewBox="0 0 48 48" className="w-4/5 h-4/5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M24 4L7 11V23C7 33.5 14.3 43.1 24 45.5C33.7 43.1 41 33.5 41 23V11L24 4Z" 
            fill="#065f46" 
            stroke="#fbbf24" 
            strokeWidth="2.5" 
          />
          <path 
            d="M24 9L11 15V23C11 31.2 16.6 38.8 24 40.8C31.4 38.8 37 31.2 37 23V15L24 9Z" 
            fill="#047857" 
          />
          <text 
            x="24" 
            y="28" 
            textAnchor="middle" 
            fill="#ffffff" 
            fontSize="10" 
            fontWeight="900" 
            fontFamily="sans-serif"
            letterSpacing="0.5"
          >
            UNSIL
          </text>
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <img
        src={unsilLogo}
        alt="Logo Universitas Siliwangi"
        onError={() => setHasError(true)}
        className={`${dimensionClasses} object-contain drop-shadow-xs transition-transform hover:scale-105`}
        loading="eager"
      />
    </div>
  );
};

