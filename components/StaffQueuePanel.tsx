
import React from 'react';
import type { QueueState } from '../types';
import { announceQueue } from '../utils/audio';

interface StaffQueuePanelProps {
  role: 'teller' | 'cs';
  queueState: QueueState;
  setQueueState: React.Dispatch<React.SetStateAction<QueueState>>;
}

const StaffQueuePanel: React.FC<StaffQueuePanelProps> = ({ role, queueState, setQueueState }) => {
  const isTeller = role === 'teller';
  const title = isTeller ? 'Panel Kontrol Teller' : 'Panel Kontrol Customer Service';
  const currentNumber = isTeller ? queueState.teller : queueState.cs;
  const prefix = isTeller ? 'A' : 'B';
  const colorClass = isTeller ? 'blue' : 'emerald';
  const locationName = isTeller ? 'Loket Satu' : 'Meja Customer Service';
  
  const handleNext = () => {
    const newVal = currentNumber + 1;
    setQueueState(prev => ({ ...prev, [role]: newVal }));
    // Menggunakan utility audio baru dengan efek chime + suara pramugari
    announceQueue(prefix, newVal, locationName);
  };

  const handleRecall = () => {
    if (currentNumber > 0) {
      announceQueue(prefix, currentNumber, locationName);
    }
  };

  const handleReset = () => {
     if(confirm(`Reset antrian ${isTeller ? 'Teller' : 'CS'} ke 0?`)) {
         setQueueState(prev => ({ ...prev, [role]: 0 }));
     }
  };

  return (
    <div className="min-h-screen bg-[#0a192f] flex items-center justify-center p-4">
      <div className={`bg-[#162842] w-full max-w-md rounded-2xl shadow-2xl border-t-4 border-${colorClass}-500 overflow-hidden`}>
        
        {/* Header */}
        <div className="bg-black/20 p-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
          <p className="text-slate-400 text-sm">BPR Digital Signage Controller</p>
        </div>

        {/* Display Number */}
        <div className="p-8 flex flex-col items-center justify-center bg-[#0f1c30]">
           <span className={`text-${colorClass}-400 text-sm uppercase tracking-widest font-semibold mb-2`}>
             Nomor Saat Ini
           </span>
           <div className="text-8xl font-bold text-white tracking-tighter">
             {prefix}-{String(currentNumber).padStart(3, '0')}
           </div>
        </div>

        {/* Controls */}
        <div className="p-6 grid gap-4">
          <button 
            onClick={handleNext}
            className={`w-full py-6 rounded-xl text-white font-bold text-xl shadow-lg transform transition active:scale-95 flex items-center justify-center gap-3
              ${isTeller ? 'bg-blue-600 hover:bg-blue-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
          >
            <span>PANGGIL BERIKUTNYA</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </button>

          <div className="grid grid-cols-2 gap-4">
             <button 
              onClick={handleRecall}
              className="py-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-lg transition flex flex-col items-center justify-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-sm">Panggil Ulang</span>
            </button>

             <button 
              onClick={handleReset}
              className="py-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold shadow-lg transition flex flex-col items-center justify-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="text-sm">Reset 0</span>
            </button>
          </div>
        </div>
        
        <div className="bg-black/20 p-4 text-center">
            <a href="/" className="text-slate-500 text-xs hover:text-white underline">Kembali ke Tampilan Layar Utama</a>
        </div>
      </div>
    </div>
  );
};

export default StaffQueuePanel;
