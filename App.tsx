// Fix: Corrected the import statement for React and its hooks.
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
// Fix: Added curly braces to the catch block to correctly scope the error variable and fix a syntax error.
        console.error(`Error parsing localStorage key "${key}":`, error);
    }
    return defaultValue;
};


const PromoContent: React.FC<{ promo: KreditPromo | null }> = ({ promo }) => {
  if (!promo) return null;

  // Jika promo memiliki gambar (mode poster), tampilkan hanya gambar.
  if (promo.backgroundImage) {
    return (
      <div className="relative w-full h-full overflow-hidden rounded-lg">
        <img
          src={promo.backgroundImage}
          alt={promo.title}
          className="object-contain w-full h-full shadow-2xl"
        />
      </div>
    );
  }

  // Jika promo berbasis teks, tampilkan teks dengan ukuran lebih besar.
  return (
    <div className="relative w-full h-full flex flex-col justify-center p-12 text-white overflow-hidden">
      <h2 className="text-6xl font-bold leading-tight drop-shadow-lg">{promo.title}</h2>
      <p className="text-3xl font-light drop-shadow-md mt-4">{promo.description}</p>
      <p className="text-8xl font-bold text-amber-400 mt-8 drop-shadow-xl">{promo.rate}</p>
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
    const promoCount = kreditPromos.length;
    if (promoCount === 0) return;

    const timer = setInterval(() => {
        setPromoIndex((prevIndex) => (prevIndex + 1) % promoCount);
    }, 7000);
    return () => clearInterval(timer);
  }, [kreditPromos.length]);

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

  // Auto-refresh interval for background images (e.g., every 30 minutes) - set to 0 to disable
  const BG_REFRESH_INTERVAL = 3 * 60 * 1000; // 30 minutes in milliseconds (set to 0 to disable)

  useEffect(() => {
      if (BG_REFRESH_INTERVAL > 0) {
          const bgRefreshTimer = setInterval(() => {
              // Force refresh of background images by adding timestamp to URLs
              setPromoImages(prevImages =>
                prevImages.map(img =>
                  img.includes('?') ? `${img}&t=${Date.now()}` : `${img}?t=${Date.now()}`
                )
              );
          }, BG_REFRESH_INTERVAL);

          return () => {
              clearInterval(bgRefreshTimer);
          };
      }
  }, []);

  // Full page refresh interval (e.g., every 6 hours) - set to 0 to disable
  const PAGE_REFRESH_INTERVAL = 1 * 60 * 60 * 1000; // 6 hours in milliseconds (set to 0 to disable)

  useEffect(() => {
      if (PAGE_REFRESH_INTERVAL > 0) {
          const pageRefreshTimer = setInterval(() => {
              window.location.reload();
          }, PAGE_REFRESH_INTERVAL);

          return () => {
              clearInterval(pageRefreshTimer);
          };
      }
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
  
  const currentPromo = kreditPromos.length > 0 ? kreditPromos[promoIndex] : null;

  return (
    <div className="w-screen h-screen relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        <PromoCarousel 
          images={promoImages.length > 0 ? promoImages : ['https://picsum.photos/1920/1080?grayscale']} 
          currentIndex={promoImages.length > 0 ? promoIndex % promoImages.length : 0} 
        />
      </div>

      <div className="absolute inset-0 w-full h-full flex flex-col">
        <Header />
        <main className="flex-1 grid grid-cols-3 gap-4 px-4 pb-4 min-h-0">
            <div className="col-span-2 h-full min-h-0">
                <PromoContent promo={currentPromo} />
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