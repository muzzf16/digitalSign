
// Fix: Corrected the import statement for React and its hooks.
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import NewsTicker from './components/NewsTicker';
import AdminPanel from './components/AdminPanel';
import StaffQueuePanel from './components/StaffQueuePanel';
import SettingsIcon from './components/icons/SettingsIcon';
import { fetchEconomicData } from './services/economicDataService';
import type { EconomicData, KreditPromo, InterestRate, DepositoRate, QueueState } from './types';
import { MOCK_CURRENCY_RATES, MOCK_GOLD_PRICE, MOCK_NEWS_ITEMS, MOCK_STOCK_DATA, KREDIT_PROMOS, PROMO_IMAGES, SAVINGS_RATES, MOCK_DEPOSITO_RATES } from './constants';
import PromoCarousel from './components/PromoCarousel';
import { initAppData } from './utils/imageStorage';

// Helper to load data from localStorage or return a default value
// Note: We keep this for lightweight data like Queue and Audio Settings
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


const PromoContent: React.FC<{ promo: KreditPromo | null }> = ({ promo }) => {
  if (!promo) return null;

  // Generate a unique key based on content to trigger animation re-render
  const animationKey = `${promo.title}-${promo.rate}`;

  // Jika promo memiliki gambar (mode poster), tampilkan hanya gambar.
  if (promo.backgroundImage) {
    return (
      <div key={animationKey} className="relative w-full h-full overflow-hidden rounded-lg animate-content-enter flex items-center justify-center">
        <img
          src={promo.backgroundImage}
          alt={promo.title}
          className="object-contain max-w-full max-h-full shadow-2xl rounded-lg"
        />
      </div>
    );
  }

  // Jika promo berbasis teks, tampilkan teks dengan ukuran lebih besar.
  return (
    <div key={animationKey} className="relative w-full h-full flex flex-col justify-center p-12 text-white overflow-hidden animate-content-enter">
      <h2 className="text-6xl font-bold leading-tight drop-shadow-lg">{promo.title}</h2>
      <p className="text-3xl font-light drop-shadow-md mt-4">{promo.description}</p>
      <p className="text-8xl font-bold text-amber-400 mt-8 drop-shadow-xl">{promo.rate}</p>
    </div>
  );
};


const App: React.FC = () => {
  // --- View Mode Logic (Standard vs Teller vs CS) ---
  const [viewMode, setViewMode] = useState<'standard' | 'teller' | 'cs'>('standard');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    if (mode === 'teller') setViewMode('teller');
    else if (mode === 'cs') setViewMode('cs');
    else setViewMode('standard');
  }, []);

  // State for external data
  const [economicData, setEconomicData] = useState<Omit<EconomicData, 'newsItems'>>({
    currencyRates: MOCK_CURRENCY_RATES,
    goldPrice: MOCK_GOLD_PRICE,
    stockData: MOCK_STOCK_DATA,
  });
  const [newsItems, setNewsItems] = useState(MOCK_NEWS_ITEMS);
  
  // State for admin-managed content (Initialized with defaults, then hydrated from DB)
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [kreditPromos, setKreditPromos] = useState<KreditPromo[]>(KREDIT_PROMOS);
  const [savingsRates, setSavingsRates] = useState<InterestRate[]>(SAVINGS_RATES);
  const [depositoRates, setDepositoRates] = useState<DepositoRate[]>(MOCK_DEPOSITO_RATES);
  const [promoImages, setPromoImages] = useState<string[]>(PROMO_IMAGES);
  
  // State for Queue (Kept in LocalStorage for Tab Sync)
  const [queueState, setQueueState] = useState<QueueState>(() => loadFromLocalStorage('bpr_queue', { teller: 0, cs: 0 }));

  const [promoIndex, setPromoIndex] = useState(0);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);

  // --- Hydrate Data from IndexedDB on Mount ---
  useEffect(() => {
      const loadData = async () => {
          try {
              const data = await initAppData();
              if (data.logo) setLogoUrl(data.logo);
              if (data.promos && data.promos.length > 0) setKreditPromos(data.promos);
              if (data.carouselImages && data.carouselImages.length > 0) setPromoImages(data.carouselImages);
              if (data.savings && data.savings.length > 0) setSavingsRates(data.savings);
              if (data.deposito && data.deposito.length > 0) setDepositoRates(data.deposito);
          } catch (error) {
              console.error("Failed to load content from DB", error);
          }
      };
      loadData();
  }, []);


  useEffect(() => {
    const promoCount = kreditPromos.length;
    if (promoCount === 0) return;

    const timer = setInterval(() => {
        setPromoIndex((prevIndex) => (prevIndex + 1) % promoCount);
    }, 8000); // Increased slightly for better reading time
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
  
  // Persist queue state changes AND Sync across tabs
  useEffect(() => {
      try {
        localStorage.setItem('bpr_queue', JSON.stringify(queueState));
      } catch (e) {
        console.warn("Failed to persist queue state (Storage Full?)");
      }
  }, [queueState]);

  // Listen for changes from other tabs
  useEffect(() => {
      const handleStorageChange = (e: StorageEvent) => {
          if (e.key === 'bpr_queue' && e.newValue) {
              try {
                const newState = JSON.parse(e.newValue);
                setQueueState(newState);
              } catch (err) {
                console.error("Failed to parse synced queue state", err);
              }
          }
      };
      
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
      const handleMouseMove = (event: MouseEvent) => {
          const hotZoneWidth = 100;
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

  // --- Render Specific Views ---
  
  if (viewMode === 'teller') {
    return <StaffQueuePanel role="teller" queueState={queueState} setQueueState={setQueueState} />;
  }
  
  if (viewMode === 'cs') {
    return <StaffQueuePanel role="cs" queueState={queueState} setQueueState={setQueueState} />;
  }

  // --- Standard Digital Signage View ---
  return (
    <div className="bg-[#0a192f] w-screen h-screen relative overflow-hidden font-sans">
      {/* Background Layer */}
      <div className="absolute inset-0 w-full h-full z-0">
        <PromoCarousel 
          images={promoImages.length > 0 ? promoImages : ['https://picsum.photos/1920/1080?grayscale']} 
          currentIndex={promoImages.length > 0 ? promoIndex % promoImages.length : 0} 
        />
      </div>

      {/* Content Layer */}
      <div className="absolute inset-0 w-full h-full flex flex-col z-10">
        <Header logoUrl={logoUrl} />
        <main className="flex-1 grid grid-cols-3 gap-6 px-6 pb-6 min-h-0 pt-4">
            <div className="col-span-2 h-full min-h-0 relative">
                {/* Glassmorphism container for promo */}
                <div className="absolute inset-0 bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                    <PromoContent promo={currentPromo} />
                </div>
            </div>
            <div className="col-span-1 h-full overflow-hidden rounded-2xl shadow-2xl bg-black/40 backdrop-blur-md border border-white/5">
                <Sidebar 
                  currencyRates={economicData.currencyRates} 
                  goldPrice={economicData.goldPrice} 
                  stockData={economicData.stockData}
                  kreditPromos={kreditPromos}
                  savingsRates={savingsRates}
                  depositoRates={depositoRates}
                  queueState={queueState}
                />
            </div>
        </main>
        <NewsTicker items={newsItems} />
      </div>

      {/* Admin Panel */}
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
              queueState={queueState}
              setQueueState={setQueueState}
              logoUrl={logoUrl}
              setLogoUrl={setLogoUrl}
              onClose={() => setIsAdminPanelOpen(false)}
          />
      )}
      
      <button 
        onClick={() => setIsAdminPanelOpen(true)}
        className={`absolute bottom-20 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all duration-300 ease-in-out z-50 ${isSettingsVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'}`}
        aria-label="Buka Pengaturan Konten"
      >
          <SettingsIcon className="w-6 h-6 text-white" />
      </button>

    </div>
  );
};

export default App;
