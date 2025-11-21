
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import NewsTicker from './components/NewsTicker';
import AdminPanel from './components/AdminPanel';
import StaffQueuePanel from './components/StaffQueuePanel';
import SettingsIcon from './components/icons/SettingsIcon';
import PromoCarousel from './components/PromoCarousel';
import PromoContent from './components/PromoContent';
import { useAppData } from './hooks/useAppData';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'standard' | 'teller' | 'cs'>('standard');
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    if (mode === 'teller') setViewMode('teller');
    else if (mode === 'cs') setViewMode('cs');
    else setViewMode('standard');
  }, []);

  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);

  const {
    economicData,
    newsItems,
    logoUrl,
    kreditPromos,
    savingsRates,
    depositoRates,
    promoImages,
    queueState,
    audioSettings
  } = useAppData(isAdminPanelOpen);

  const [promoIndex, setPromoIndex] = useState(0);

  // --- Promo Carousel Logic ---
  useEffect(() => {
    if (kreditPromos.length === 0) return;
    const timer = setInterval(() => setPromoIndex(prev => (prev + 1) % kreditPromos.length), 8000);
    return () => clearInterval(timer);
  }, [kreditPromos.length]);

  // --- Settings Button Visibility ---
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const hotZoneWidth = 100;
      const shouldBeVisible = window.innerWidth - event.clientX < hotZoneWidth;
      if (shouldBeVisible !== isSettingsVisible) setIsSettingsVisible(shouldBeVisible);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isSettingsVisible]);

  const currentPromo = kreditPromos.length > 0 ? kreditPromos[promoIndex] : null;

  // --- Render Specific Views ---
  if (viewMode === 'teller') {
    return <StaffQueuePanel role="teller" allData={{ logo: logoUrl, promos: kreditPromos, carousel: promoImages, savings: savingsRates, deposito: depositoRates, queue: queueState, audio: audioSettings }} />;
  }
  if (viewMode === 'cs') {
    return <StaffQueuePanel role="cs" allData={{ logo: logoUrl, promos: kreditPromos, carousel: promoImages, savings: savingsRates, deposito: depositoRates, queue: queueState, audio: audioSettings }} />;
  }

  // --- Standard Digital Signage View ---
  return (
    <div className="bg-[#0a192f] w-screen h-screen relative overflow-hidden font-sans">
      <div className="absolute inset-0 w-full h-full z-0">
        <PromoCarousel images={promoImages.length > 0 ? promoImages : ['https://picsum.photos/1920/1080?grayscale']} currentIndex={promoImages.length > 0 ? promoIndex % promoImages.length : 0} />
      </div>
      <div className="absolute inset-0 w-full h-full flex flex-col z-10">
        <Header logoUrl={logoUrl} />
        <main className="flex-1 grid grid-cols-3 gap-6 px-6 pb-6 min-h-0 pt-4">
          <div className="col-span-2 h-full min-h-0 relative">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
              <PromoContent promo={currentPromo} />
            </div>
          </div>
          <div className="col-span-1 h-full overflow-hidden rounded-2xl shadow-2xl bg-black/40 backdrop-blur-md border border-white/5">
            <Sidebar currencyRates={economicData.currencyRates} goldPrice={economicData.goldPrice} kreditPromos={kreditPromos} savingsRates={savingsRates} depositoRates={depositoRates} queueState={queueState} />
          </div>
        </main>
        <NewsTicker items={newsItems} />
      </div>
      {isAdminPanelOpen && (
        <AdminPanel
          kreditPromos={kreditPromos}
          savingsRates={savingsRates}
          depositoRates={depositoRates}
          promoImages={promoImages}
          queueState={queueState}
          logoUrl={logoUrl}
          audioSettings={audioSettings}
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
