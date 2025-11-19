
import React from 'react';
import { useCurrentTime } from '../hooks/useCurrentTime';

interface HeaderProps {
  logoUrl?: string | null;
}

const Header: React.FC<HeaderProps> = ({ logoUrl }) => {
  const { timeString, dateString } = useCurrentTime();

  return (
    <header className="z-10 px-6 flex items-center justify-between h-[72px] bg-gradient-to-b from-black/80 to-transparent flex-shrink-0 backdrop-blur-sm">
      {/* Left Side: Logo and Title */}
      <div className="flex items-center gap-4">
        {logoUrl ? (
            <img 
                src={logoUrl} 
                alt="Logo BPR" 
                className="h-12 w-auto object-contain drop-shadow-lg"
                onError={(e) => {
                    // Fallback if image fails to load
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                }}
            />
        ) : (
            <div className="w-12 h-12 bg-gradient-to-tr from-amber-400 to-yellow-600 rounded-lg shadow-lg flex items-center justify-center flex-shrink-0 text-black font-bold text-xl">
                BPR
            </div>
        )}
        {/* Fallback container - hidden by default if logo exists */}
        <div className={`${logoUrl ? 'hidden' : ''}`}>
          <h1 className="text-2xl font-bold tracking-wide text-white drop-shadow-md">
            Bank Perekonomian Rakyat
          </h1>
          <p className="text-sm font-medium text-amber-400 tracking-wider uppercase drop-shadow-sm">
            PT BPR BAPERA BATANG
          </p>
        </div>
        
        {/* Text is always shown next to logo if logo exists, adjusted layout */}
        {logoUrl && (
             <div>
                <h1 className="text-2xl font-bold tracking-wide text-white drop-shadow-md">
                    Bank Perekonomian Rakyat
                </h1>
                <p className="text-sm font-medium text-amber-400 tracking-wider uppercase drop-shadow-sm">
                    PT BPR BAPERA BATANG
                </p>
            </div>
        )}
      </div>

      {/* Right Side: Time and Date */}
      <div className="text-right text-white">
        <p className="text-xl font-bold font-mono tracking-wide drop-shadow-md">{timeString}</p>
        <p className="text-sm text-slate-300 uppercase tracking-wider">{dateString}</p>
      </div>
    </header>
  );
};

export default Header;
