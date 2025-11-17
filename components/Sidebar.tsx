
import React, { useState, useEffect, useRef } from 'react';
import type { CurrencyRate, GoldPrice, StockData, KreditPromo, InterestRate, DepositoRate } from '../types';
import { useCurrentTime } from '../hooks/useCurrentTime';
import SunIcon from './icons/SunIcon';

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


const MarketInfo: React.FC<{ rates: CurrencyRate[]; gold: GoldPrice | null; stock: StockData | null }> = ({ rates, gold, stock }) => {
    const { timeString } = useCurrentTime();
    return (
        <Widget className="flex flex-col">
            <div className="space-y-3 text-lg flex-1">
                {rates.slice(0, 2).map(rate => (
                    <div key={rate.currency} className="flex justify-between items-baseline">
                        <span className="font-medium text-slate-300">{rate.currency}</span>
                        <span className="font-semibold">Rp {Number(rate.buy).toLocaleString('id-ID')}</span>
                    </div>
                ))}
                 {gold && (
                    <div className="flex justify-between items-baseline">
                        <span className="font-medium text-slate-300">Emas / gram</span>
                        <span className="font-semibold">Rp {gold.price.toLocaleString('id-ID')}</span>
                    </div>
                )}
                 {stock && (
                    <div className="flex justify-between items-baseline">
                        <span className="font-medium text-slate-300">IHSG</span>
                        <span className="font-semibold">{stock.regularMarketPrice.toLocaleString('id-ID', {minimumFractionDigits: 3})}</span>
                    </div>
                )}
            </div>
            <p className="text-xs text-slate-500 text-right mt-3">Update: {new Date().toLocaleDateString('id-ID')} {timeString}</p>
        </Widget>
    );
};

// --- Main Sidebar Component ---
interface SidebarProps {
  currencyRates: CurrencyRate[];
  goldPrice: GoldPrice | null;
  stockData: StockData | null;
  kreditPromos: KreditPromo[];
  savingsRates: InterestRate[];
  depositoRates: DepositoRate[];
}

const Sidebar: React.FC<SidebarProps> = (props) => {
  const { currencyRates, goldPrice, stockData, kreditPromos, savingsRates, depositoRates } = props;
  const viewportRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      const viewport = viewportRef.current;
      const content = contentRef.current;
      if (viewport && content) {
        const isContentTaller = content.scrollHeight > viewport.clientHeight;
        if (isContentTaller !== isOverflowing) {
          setIsOverflowing(isContentTaller);
        }
      }
    };
    
    const timeoutId = setTimeout(checkOverflow, 100);
    window.addEventListener('resize', checkOverflow);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [isOverflowing, currencyRates, goldPrice, stockData, kreditPromos, savingsRates, depositoRates]);


  const sidebarContent = (
    <>
      <KreditUsahaMikro promos={kreditPromos} />
      <div className="grid grid-cols-2 gap-4">
        <TabunganInfo rates={savingsRates} />
        <DepositoInfo rates={depositoRates} />
      </div>
      <MarketInfo rates={currencyRates} gold={goldPrice} stock={stockData} />
    </>
  );

  const animationDuration = contentRef.current ? `${contentRef.current.scrollHeight / 40}s` : '50s';

  return (
    <aside ref={viewportRef} className="w-full h-full text-white overflow-hidden">
      <div 
        className={isOverflowing ? "sidebar-scroll-wrapper" : ""}
        style={isOverflowing ? { animationDuration } : {}}
      >
        <div ref={contentRef} className="flex flex-col gap-4">
          {sidebarContent}
        </div>
        {isOverflowing && (
          <div className="flex flex-col gap-4 pt-4">
            {sidebarContent}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;