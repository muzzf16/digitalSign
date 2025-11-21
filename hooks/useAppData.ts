import { useState, useEffect } from 'react';
import { fetchEconomicData } from '../services/economicDataService';
import type { EconomicData, KreditPromo, InterestRate, DepositoRate, QueueState, AudioSettings } from '../types';
import { MOCK_CURRENCY_RATES, MOCK_GOLD_PRICE, MOCK_NEWS_ITEMS, KREDIT_PROMOS, PROMO_IMAGES, SAVINGS_RATES, MOCK_DEPOSITO_RATES } from '../constants';

const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
    voiceURI: '',
    pitch: 1.1,
    rate: 0.85,
    volume: 1.0
};

export const useAppData = (isAdminPanelOpen: boolean) => {
    // State for external (scraped) data
    const [economicData, setEconomicData] = useState<Omit<EconomicData, 'newsItems'>>({ currencyRates: MOCK_CURRENCY_RATES, goldPrice: MOCK_GOLD_PRICE });
    const [newsItems, setNewsItems] = useState(MOCK_NEWS_ITEMS);

    // State for admin-managed content, now loaded from server
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [kreditPromos, setKreditPromos] = useState<KreditPromo[]>(KREDIT_PROMOS);
    const [savingsRates, setSavingsRates] = useState<InterestRate[]>(SAVINGS_RATES);
    const [depositoRates, setDepositoRates] = useState<DepositoRate[]>(MOCK_DEPOSITO_RATES);
    const [promoImages, setPromoImages] = useState<string[]>(PROMO_IMAGES);
    const [queueState, setQueueState] = useState<QueueState>({ teller: 0, cs: 0 });
    const [audioSettings, setAudioSettings] = useState<AudioSettings>(DEFAULT_AUDIO_SETTINGS);

    // --- Load all app data from the server and poll for updates ---
    useEffect(() => {
        const apiUrl = `/api/data`;

        const loadData = async () => {
            try {
                const response = await fetch(apiUrl);
                if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
                const data = await response.json();

                setLogoUrl(data.logo || null);
                setKreditPromos(data.promos || KREDIT_PROMOS);
                setPromoImages(data.carousel || PROMO_IMAGES);
                setSavingsRates(data.savings || SAVINGS_RATES);
                setDepositoRates(data.deposito || MOCK_DEPOSITO_RATES);
                setQueueState(data.queue || { teller: 0, cs: 0 });
                setAudioSettings(data.audio || DEFAULT_AUDIO_SETTINGS);

            } catch (error) {
                console.error("Failed to load app data from server:", error);
            }
        };

        // Do not poll when the admin panel is open, to prevent overwriting user edits.
        if (isAdminPanelOpen) {
            return;
        }

        loadData(); // Load data initially and when panel is closed.
        const intervalId = setInterval(loadData, 3000);

        return () => clearInterval(intervalId);
    }, [isAdminPanelOpen]);

    // --- Fetch external economic data periodically ---
    useEffect(() => {
        const getData = async () => {
            const data = await fetchEconomicData();
            setEconomicData({ currencyRates: data.currencyRates, goldPrice: data.goldPrice });
            setNewsItems(data.newsItems);
        };
        getData();
        const intervalId = setInterval(getData, 15 * 60 * 1000);
        return () => clearInterval(intervalId);
    }, []);

    return {
        economicData,
        newsItems,
        logoUrl,
        kreditPromos,
        savingsRates,
        depositoRates,
        promoImages,
        queueState,
        audioSettings
    };
};
