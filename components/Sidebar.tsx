
import React, { useState, useEffect, useRef } from 'react';
import type { CurrencyRate, GoldPrice, KreditPromo, InterestRate, DepositoRate, QueueState } from '../types';
import { useCurrentTime } from '../hooks/useCurrentTime';

// --- Reusable Carousel Component ---
const InfoCarousel: React.FC<{ items: React.ReactNode[], interval?: number }> = ({ items, interval = 5000 }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (items.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % items.length);
        }, interval);
        return () => clearInterval(timer);
    }, [items.length, interval]);

    if (items.length === 0) return null;

    return (
        <div className="relative h-full flex flex-col justify-between">
            <div>{items[currentIndex]}</div>
            {items.length > 1 && (
                <div className="flex justify-center items-center gap-2 pt-2">
                    {items.map((_, index) => (
                        <div
                            key={index}
                            className={`w-2 h-2 rounded-full transition-colors ${
                                index === currentIndex ? 'bg-amber-400' : 'bg-slate-600'
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Individual Widget Components ---

const Widget: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-[#080f69] rounded-2xl p-4 text-white shadow-2xl shadow-black/50 ${className}`}>
        {children}
    </div>
);

const QueueWidget: React.FC<{ state: QueueState }> = ({ state }) => (
    <div className="flex flex-col gap-3 mb-4 flex-shrink-0">
        <div className="bg-gradient-to-br from-blue-600 to-blue-900 rounded-xl p-4 shadow-lg border-l-4 border-blue-400 flex justify-between items-center relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-10">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4V6zm19 2h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-1 9h-4v-7h4v7z"/></svg>
            </div>
            <div>
                <p className="text-blue-200 text-sm font-medium uppercase tracking-wider">Antrian Teller</p>
                <p className="text-blue-100 text-xs mt-1">Menuju Loket 1</p>
            </div>
            <div className="text-5xl font-bold text-white tracking-tight z-10">
                A-{String(state.teller).padStart(3, '0')}
            </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-emerald-900 rounded-xl p-4 shadow-lg border-l-4 border-emerald-400 flex justify-between items-center relative overflow-hidden">
             <div className="absolute right-0 top-0 p-4 opacity-10">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z"/></svg>
            </div>
            <div>
                <p className="text-emerald-200 text-sm font-medium uppercase tracking-wider">Antrian CS</p>
                <p className="text-emerald-100 text-xs mt-1">Menuju CS 1</p>
            </div>
             <div className="text-5xl font-bold text-white tracking-tight z-10">
                B-{String(state.cs).padStart(3, '0')}
            </div>
        </div>
    </div>
);

const KreditUsahaMikro: React.FC<{promos: KreditPromo[]}> = ({ promos }) => (
    <Widget>
        <InfoCarousel items={promos.map(promo => (
            <div key={promo.title}>
                <h3 className="font-semibold text-white text-lg">{promo.title}</h3>
                <p className="text-sm text-slate-300">{promo.description}</p>
                <p className="text-5xl font-bold text-white mt-1">{promo.rate}</p>
            </div>
        ))} />
    </Widget>
);


const TabunganInfo: React.FC<{rates: InterestRate[]}> = ({ rates }) => {
    const items = rates.map(rate => (
        <div key={rate.product} className="flex flex-col h-full">
             <h3 className="font-semibold text-lg">{rate.product}</h3>
             <div className="flex-1 flex flex-col justify-center items-center">
                <p className="text-6xl font-bold text-amber-400 my-2">{rate.rate}</p>
                <p className="text-xs text-slate-400">Suku Bunga p.a</p>
            </div>
        </div>
    ));

    return (
        <Widget className="flex flex-col">
            <InfoCarousel items={items} />
        </Widget>
    );
};

const DepositoInfo: React.FC<{rates: DepositoRate[]}> = ({ rates }) => {
    const items = rates.map(deposito => (
        <div key={deposito.tenor} className="text-center">
            <h4 className="font-semibold text-white text-lg">{deposito.tenor}</h4>
            <p className="text-4xl font-bold text-white mt-1">{deposito.rate}</p>
            <p className="text-xs text-slate-400">Suku Bunga p.a</p>
        </div>
    ));

    return (
        <Widget>
            <h3 className="font-semibold text-lg mb-2 text-center">Deposito</h3>
            <InfoCarousel items={items} interval={4000} />
        </Widget>
    );
};

const CurrencyWidget: React.FC<{ rates: CurrencyRate[] }> = ({ rates }) => {
    const { timeString } = useCurrentTime();
    return (
        <Widget>
            <h3 className="font-semibold text-lg mb-3 text-amber-400 border-b border-white/10 pb-2">Kurs Valas</h3>
            <div className="space-y-4">
                {rates.map(rate => (
                    <div key={rate.currency} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-xl text-white bg-white/10 px-2 rounded">{rate.currency}</span>
                        </div>
                        <div className="text-right">
                            <div className="flex gap-4">
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] uppercase text-slate-400">Beli</span>
                                    <span className="font-mono font-semibold text-green-400">{Number(rate.buy).toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] uppercase text-slate-400">Jual</span>
                                    <span className="font-mono font-semibold text-red-400">{Number(rate.sell).toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
             <p className="text-[10px] text-slate-500 text-right mt-3">Update: {timeString}</p>
        </Widget>
    );
};

const GoldWidget: React.FC<{ gold: GoldPrice | null }> = ({ gold }) => (
    <Widget className="bg-gradient-to-br from-amber-900/40 to-yellow-900/20 border border-amber-500/20 relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-20 h-20 bg-yellow-500/10 rounded-full blur-xl"></div>
        <div className="flex items-center justify-between mb-2 relative z-10">
            <h3 className="font-semibold text-lg text-amber-400">Harga Emas</h3>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">Antam</span>
        </div>
        {gold ? (
            <div className="flex flex-col items-center py-3 relative z-10">
                <p className="text-4xl font-bold text-white tracking-tight drop-shadow-lg">
                    Rp {gold.price.toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-amber-200/70 mt-1 uppercase tracking-wider">Per 1 Gram</p>
            </div>
        ) : (
            <p className="text-center text-slate-400 py-4">Data tidak tersedia</p>
        )}
    </Widget>
);

// --- Main Sidebar Component ---
interface SidebarProps {
  currencyRates: CurrencyRate[];
  goldPrice: GoldPrice | null;
  kreditPromos: KreditPromo[];
  savingsRates: InterestRate[];
  depositoRates: DepositoRate[];
  queueState: QueueState;
}

const Sidebar: React.FC<SidebarProps> = (props) => {
  const { currencyRates, goldPrice, kreditPromos, savingsRates, depositoRates, queueState } = props;
  const contentRef = useRef<HTMLDivElement>(null);
  const [animationDuration, setAnimationDuration] = useState('50s');

  useEffect(() => {
    const calculateDuration = () => {
      if (contentRef.current) {
        const height = contentRef.current.scrollHeight;
        if (height > 0) {
          // Speed factor (pixels per second), e.g., 40px/s
          setAnimationDuration(`${height / 40}s`);
        }
      }
    };
    
    // Recalculate after a short delay to allow DOM to update
    const timeoutId = setTimeout(calculateDuration, 100);
    window.addEventListener('resize', calculateDuration);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', calculateDuration);
    };
  }, [currencyRates, goldPrice, kreditPromos, savingsRates, depositoRates]);


  const sidebarContent = (
    <>
      <KreditUsahaMikro promos={kreditPromos} />
      <div className="grid grid-cols-2 gap-4">
        <TabunganInfo rates={savingsRates} />
        <DepositoInfo rates={depositoRates} />
      </div>
      <CurrencyWidget rates={currencyRates} />
      <GoldWidget gold={goldPrice} />
    </>
  );

  return (
    <aside className="w-full h-full text-white flex flex-col overflow-hidden">
      <QueueWidget state={queueState} />
      
      <div className="flex-1 relative overflow-hidden rounded-2xl">
          <div 
            className="sidebar-scroll-wrapper absolute w-full"
            style={{ animationDuration }}
          >
            <div ref={contentRef} className="flex flex-col gap-4">
              {sidebarContent}
            </div>
            {/* Always duplicate content for a seamless animation loop */}
            <div className="flex flex-col gap-4 pt-4">
              {sidebarContent}
            </div>
          </div>
      </div>
    </aside>
  );
};

export default Sidebar;
