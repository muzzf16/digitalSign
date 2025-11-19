
import type { EconomicData, CurrencyRate, GoldPrice } from '../types';
import { MOCK_CURRENCY_RATES, MOCK_GOLD_PRICE, MOCK_NEWS_ITEMS } from '../constants';

// Helper to clean and parse mock currency strings (US Format: "16,688" -> 16688)
const parseMockCurrency = (rate: string): number => {
    return parseFloat(rate.replace(/,/g, ''));
};

// Helper to parse scraped Indonesian currency strings (ID Format: "15.850,00" -> 15850.00)
const parseScrapedIDR = (rate: string): string => {
    // Remove dots (thousands separator) and replace comma with dot (decimal separator)
    // Example: "15.850,00" -> "15850.00"
    // Only match valid number characters to avoid issues with text
    const cleanStr = rate.replace(/[^0-9,.]/g, '');
    return cleanStr.replace(/\./g, '').replace(',', '.');
};

const fetchHtmlFromProxy = async (targetUrl: string): Promise<string | null> => {
    const localProxyUrl = `http://localhost:3001/proxy?url=${encodeURIComponent(targetUrl)}`;

    try {
        const response = await fetch(localProxyUrl);
        if (response.ok) {
            const content = await response.text();
            if (content && content.length > 100) {
                console.log(`Successfully fetched ${targetUrl} via local proxy.`);
                return content;
            }
        } else {
            console.error(`Local proxy server returned status ${response.status} for ${targetUrl}`);
        }
    } catch (e) {
        console.error(`Failed to fetch from local proxy for ${targetUrl}:`, e);
        console.error('Please ensure the proxy server is running. Start it with "npm run start-proxy" in a separate terminal.');
    }

    return null;
};

const fetchBcaRates = async (): Promise<CurrencyRate[] | null> => {
    const targetUrl = 'https://www.bca.co.id/id/informasi/kurs';
    
    const htmlContent = await fetchHtmlFromProxy(targetUrl);

    if (!htmlContent) {
        console.warn("Failed to retrieve BCA content from all proxies. Using mock data.");
        return null;
    }

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        
        // Map app currency codes to website codes if they differ
        const currencyMap: { [key: string]: string } = {
            'USD': 'USD',
            'SGD': 'SGD',
            'EUR': 'EUR',
            'CNY': 'CNH', // App uses CNY, website uses CNH
            'AUD': 'AUD',
            'JPY': 'JPY'
        };
        const targetCurrencies = Object.keys(currencyMap);
        const scrapedRates: CurrencyRate[] = [];

        targetCurrencies.forEach(appCurrency => {
            const siteCurrency = currencyMap[appCurrency];
            
            // Use robust selectors to find the specific rate cells based on site's currency code.
            const buyCell = doc.querySelector(`tr[code="${siteCurrency}"] [rate-type="eRate-buy"] p`);
            const sellCell = doc.querySelector(`tr[code="${siteCurrency}"] [rate-type="eRate-sell"] p`);

            if (buyCell && sellCell) {
                const buyStr = buyCell.textContent?.trim() || '';
                const sellStr = sellCell.textContent?.trim() || '';

                const buy = parseScrapedIDR(buyStr);
                const sell = parseScrapedIDR(sellStr);

                if (buy && sell && !isNaN(parseFloat(buy))) {
                     scrapedRates.push({
                        currency: appCurrency, // Use the app's currency code
                        buy, 
                        sell
                    });
                }
            }
        });
        
        if (scrapedRates.length > 0) {
            return scrapedRates;
        }
        
        console.warn("Could not scrape any rates from BCA. The site structure may have changed.");
        return null;

    } catch (error) {
        console.error("Error parsing scraped BCA data:", error);
        return null;
    }
};

const fetchGoldPrice = async (): Promise<GoldPrice | null> => {
    const targetUrl = 'https://emasantam.id/harga-emas-antam-harian';
    const htmlContent = await fetchHtmlFromProxy(targetUrl);

    if (!htmlContent) {
        console.warn("Failed to retrieve Gold Price content. Using mock data.");
        return null;
    }

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');

        // Strategy: Find the summary box for "Harga Emas 1 gram" and extract the price.
        const priceElement = doc.querySelector('.widget-harga-emas .harga-hari-ini');

        if (priceElement) {
            const text = priceElement.textContent?.trim() || '';
            
            // The text is "Rp. 2.343.000"
            const cleanNumbers = text.replace(/[^0-9]/g, '');
            
            // Price is usually > 1,000,000. Check for reasonable length.
            if (cleanNumbers.length > 5) {
                return {
                    price: parseInt(cleanNumbers, 10),
                    currency: 'IDR'
                };
            }
        }
        
        console.warn("Could not scrape gold price from emasantam.id. The site structure may have changed.");
        return null;
    } catch (error) {
        console.error("Error parsing Gold data:", error);
        return null;
    }
};

export const fetchEconomicData = async (): Promise<EconomicData> => {
  // 1. Attempt to fetch live data via scraping (Parallel requests)
  const [liveRates, liveGold] = await Promise.all([
      fetchBcaRates(),
      fetchGoldPrice()
  ]);

  // 2. Prepare Currency Rates
  let currencyRates: CurrencyRate[];

  if (liveRates && liveRates.length > 0) {
      currencyRates = liveRates;
  } else {
      // Fallback to mock constants if scraping fails
      // We parse the mock data to match the number format expected by the app
      currencyRates = MOCK_CURRENCY_RATES.map(rate => ({
          ...rate,
          buy: String(parseMockCurrency(rate.buy)),
          sell: String(parseMockCurrency(rate.sell)),
      }));
  }

  return {
    currencyRates,
    goldPrice: liveGold || MOCK_GOLD_PRICE,
    newsItems: MOCK_NEWS_ITEMS,
  };
};
