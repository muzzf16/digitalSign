

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import NewsTicker from './components/NewsTicker';
import AdminPanel from './components/AdminPanel';
import SettingsIcon from './components/icons/SettingsIcon';
import { fetchEconomicData } from './services/economicDataService';
import type { EconomicData, KreditPromo, InterestRate, DepositoRate } from './types';
import { MOCK_CURRENCY_RATES, MOCK_GOLD_PRICE, MOCK_NEWS_ITEMS, MOCK_STOCK_DATA, KREDIT_PROMOS, PROMO_IMAGES, SAVINGS_RATES, MOCK_DEPOSITO_RATES } from './constants';
import PromoCarousel from './components/PromoCarousel';

// Helper to load data from localStorage or return a default value
const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        const storedValue = localStorage.getItem(key);
        if (storedValue) {
            return JSON.parse(storedValue);
        }
    } catch (error) {
        console.error(`Error parsing localStorage key "${key}":`, error);
    }
    return defaultValue;
};


const PromoContent: React.FC<{ promos: KreditPromo[], currentIndex: number }> = ({ promos, currentIndex }) => {
  const currentPromo = promos[currentIndex % promos.length];
  if (!currentPromo) return null;

  return (
    <div className="relative w-full h-full flex flex-col justify-end p-12 text-white">
      <div className="mb-4">
        <div className="flex gap-2">
          {promos.map((_, index) => (
            <div key={index} className={`w-3 h-3 rounded-full transition-colors ${index === (currentIndex % promos.length) ? 'bg-amber-400' : 'bg-white/50'}`}></div>
          ))}
        </div>
      </div>
      <h2 className="text-6xl font-bold leading-tight drop-shadow-lg">{currentPromo.title}</h2>
      <p className="text-3xl font-light drop-shadow-md">{currentPromo.description}</p>
      <p className="text-8xl font-bold text-amber-400 mt-4 drop-shadow-xl">{currentPromo.rate}</p>
    </div>
  );
};

const App: React.FC = () => {
  // State for external data
  const [economicData, setEconomicData] = useState<Omit<EconomicData, 'newsItems'>>({
    currencyRates: MOCK_CURRENCY_RATES,
    goldPrice: MOCK_GOLD_PRICE,
    stockData: MOCK_STOCK_DATA,
  });
  const [newsItems, setNewsItems] = useState(MOCK_NEWS_ITEMS);
  
  // State for admin-managed content
  const [kreditPromos, setKreditPromos] = useState<KreditPromo[]>(() => loadFromLocalStorage('bpr_kreditPromos', KREDIT_PROMOS));
  const [savingsRates, setSavingsRates] = useState<InterestRate[]>(() => loadFromLocalStorage('bpr_savingsRates', SAVINGS_RATES));
  const [depositoRates, setDepositoRates] = useState<DepositoRate[]>(() => loadFromLocalStorage('bpr_depositoRates', MOCK_DEPOSITO_RATES));
  const [promoImages, setPromoImages] = useState<string[]>(() => loadFromLocalStorage('bpr_promoImages', PROMO_IMAGES));

  const [promoIndex, setPromoIndex] = useState(0);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);

  useEffect(() => {
    const promoCount = kreditPromos.length || 1;
    const imageCount = promoImages.length || 1;
    const totalCycles = promoCount * imageCount;
    if (totalCycles === 0) return;

    const timer = setInterval(() => {
        setPromoIndex((prevIndex) => (prevIndex + 1) % totalCycles);
    }, 7000);
    return () => clearInterval(timer);
  }, [kreditPromos.length, promoImages.length]);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchEconomicData();
      setEconomicData({
          currencyRates: data.currencyRates,
          goldPrice: data.goldPrice,
          stockData: data.stockData
      });
      setNewsItems(data.newsItems);
    };

    getData();
    const intervalId = setInterval(getData, 15 * 60 * 1000); 

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
      const handleMouseMove = (event: MouseEvent) => {
          const hotZoneWidth = 100; // apx 100px from right edge
          const shouldBeVisible = window.innerWidth - event.clientX < hotZoneWidth;
          if (shouldBeVisible !== isSettingsVisible) {
              setIsSettingsVisible(shouldBeVisible);
          }
      };

      window.addEventListener('mousemove', handleMouseMove);
      return () => {
          window.removeEventListener('mousemove', handleMouseMove);
      };
  }, [isSettingsVisible]);

  return (
    <div className="bg-[#0a192f] w-screen h-screen relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        <PromoCarousel images={promoImages} currentIndex={promoIndex % (promoImages.length || 1)} />
      </div>

      <div className="absolute inset-0 w-full h-full flex flex-col">
        <Header />
        <main className="flex-1 grid grid-cols-3 gap-4 px-4 pb-4 min-h-0">
            <div className="col-span-2 h-full">
                <PromoContent promos={kreditPromos} currentIndex={promoIndex} />
            </div>
            <div className="col-span-1 h-full overflow-hidden">
                <Sidebar 
                  currencyRates={economicData.currencyRates} 
                  goldPrice={economicData.goldPrice} 
                  stockData={economicData.stockData}
                  kreditPromos={kreditPromos}
                  savingsRates={savingsRates}
                  depositoRates={depositoRates}
                />
            </div>
        </main>
        <NewsTicker items={newsItems} />
      </div>

      {/* Admin Panel and Trigger Button */}
      {isAdminPanelOpen && (
          <AdminPanel
              kreditPromos={kreditPromos}
              setKreditPromos={setKreditPromos}
              savingsRates={savingsRates}
              setSavingsRates={setSavingsRates}
              depositoRates={depositoRates}
              setDepositoRates={setDepositoRates}
              promoImages={promoImages}
              setPromoImages={setPromoImages}
              onClose={() => setIsAdminPanelOpen(false)}
          />
      )}
      <button 
        onClick={() => setIsAdminPanelOpen(true)}
        className={`absolute bottom-16 right-6 p-2 rounded-full bg-black/40 hover:bg-black/70 transition-opacity duration-300 ease-in-out z-50 ${isSettingsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-label="Buka Pengaturan Konten"
      >
          <SettingsIcon className="w-8 h-8 text-white" />
      </button>

    </div>
  );
};

export default App;