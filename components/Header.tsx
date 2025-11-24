
import React, { useState, memo } from 'react';
import { useCurrentTime } from '../hooks/useCurrentTime';
import { LAYOUT } from '../constants/theme';

interface HeaderProps {
  logoUrl?: string | null;
}

/**
 * Header component displaying bank branding and current time
 * @component
 */
const Header: React.FC<HeaderProps> = ({ logoUrl }) => {
  const { timeString, dateString } = useCurrentTime();
  const [logoError, setLogoError] = useState(false);

  const handleLogoError = () => {
    console.warn('Failed to load logo image, using fallback');
    setLogoError(true);
  };

  const showLogo = logoUrl && !logoError;

  return (
    <header 
      className="z-10 px-6 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent flex-shrink-0 backdrop-blur-sm"
      style={{ height: LAYOUT.headerHeight }}
      role="banner"
      aria-label="Header utama"
    >
      {/* Left Side: Logo and Title */}
      <div className="flex items-center gap-4">
        {showLogo ? (
          <img 
            src={logoUrl} 
            alt="Logo Bank Perekonomian Rakyat" 
            className="h-12 w-auto object-contain drop-shadow-lg"
            onError={handleLogoError}
            loading="lazy"
          />
        ) : (
          <div 
            className="w-12 h-12 bg-gradient-to-tr from-amber-400 to-yellow-600 rounded-lg shadow-lg flex items-center justify-center flex-shrink-0 text-black font-bold text-xl"
            role="img"
            aria-label="Logo BPR"
          >
            BPR
          </div>
        )}
        
        <div>
          <h1 className="text-2xl font-bold tracking-wide text-white drop-shadow-md">
            Bank Perekonomian Rakyat
          </h1>
          <p className="text-sm font-medium text-amber-400 tracking-wider uppercase drop-shadow-sm">
            PT BPR BAPERA BATANG
          </p>
        </div>
      </div>

      {/* Right Side: Time and Date */}
      <div className="text-right text-white" role="timer" aria-live="off">
        <time 
          className="text-xl font-bold font-mono tracking-wide drop-shadow-md block"
          aria-label={`Waktu saat ini ${timeString}`}
        >
          {timeString}
        </time>
        <time 
          className="text-sm text-slate-300 uppercase tracking-wider block"
          aria-label={`Tanggal ${dateString}`}
        >
          {dateString}
        </time>
      </div>
    </header>
  );
};

export default memo(Header);
