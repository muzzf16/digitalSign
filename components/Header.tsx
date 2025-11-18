import React from 'react';
import { useCurrentTime } from '../hooks/useCurrentTime';

const Header: React.FC = () => {
  const { timeString, dateString } = useCurrentTime();

  return (
    <header className="z-10 px-6 flex items-center justify-between h-[72px] bg-gradient-to-b from-black/60 to-transparent flex-shrink-0">
      {/* Left Side: Logo and Title */}
      <div className="flex items-center gap-4">
        <img
          src="/logo.png"
          alt="Bank Logo"
          className="w-12 h-12 rounded-full flex-shrink-0 object-contain"
        />
        <div>
          <h1 className="text-2xl font-semibold tracking-wide text-white">
            Bank Perekonomian Rakyat
          </h1>
          <p className="text-md font-light text-amber-400 tracking-wider">
            PT BPR BAPERA BATANG
          </p>
        </div>
      </div>

      {/* Right Side: Time and Date */}
      <div className="text-right text-white">
        <p className="text-xl font-bold">{timeString}</p>
        <p className="text-lg text-slate-300">{dateString}</p>
      </div>
    </header>
  );
};

export default Header;