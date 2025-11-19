
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
    // We now use our local Node.js proxy server to avoid CORS and stability issues.
    // Ensure you are running 'node server.js' in a separate terminal.
    const LOCAL_PROXY_URL = 'http://localhost:3001/proxy';

    try {
        const response = await fetch(`${LOCAL_PROXY_URL}?url=${encodeURIComponent(targetUrl)}`);
        
        if (response.ok) {
            return await response.text();
        } else {
            console.warn(`Local proxy returned status ${response.status} for ${targetUrl}`);
        }
    } catch (e) {
        console.warn(`Failed to connect to local proxy at ${LOCAL_PROXY_URL}. Is 'node server.js' running?`, e);
    }

    return null;
};

const fetchBcaRates = async (): Promise<CurrencyRate[] | null> => {
    const targetUrl = 'https://www.bca.co.id/id/informasi/kurs';
    
    const htmlContent = await fetchHtmlFromProxy(targetUrl);

    if (!htmlContent) {
        console.warn("Failed to retrieve BCA content from local proxy. Using mock data.");
        return null;
    }

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        
        const targetCurrencies = ['USD', 'SGD', 'EUR', 'CNY', 'AUD', 'JPY'];
        const scrapedRates: CurrencyRate[] = [];

        // BCA tables are standard HTML. We find rows containing our target currencies.
        const rows = Array.from(doc.querySelectorAll('tr'));

        targetCurrencies.forEach(currency => {
            // Find the row that contains the currency code (e.g., "USD")
            // We look for exact match or close to it to avoid matching "US Dollar" in a different context if possible
            const row = rows.find(r => r.textContent?.includes(currency));
            
            if (row) {
                // Extract all text from cells in the row
                const cells = Array.from(row.querySelectorAll('td'));
                const cellTexts = cells.map(c => c.textContent?.trim() || '');
                
                // Find values that look like currency rates (e.g., "15.850,00" or "10.000")
                // Regex matches: digits, optional dots for thousands, optional comma + digits for decimals
                const numberPattern = /[0-9]{1,3}(\.[0-9]{3})*(,[0-9]{2})?/;
                
                // We filter cells that match the number pattern and are long enough to be rates (ignoring small integers like "1")
                // Also ensure it contains a comma or dot to distinguish from simple integers if needed, though checking length > 3 helps.
                const potentialRates = cellTexts.filter(text => numberPattern.test(text) && text.length > 3);

                // BCA Table usually has: [Currency] ... [e-Rate Buy] [e-Rate Sell] ...
                // We take the first two distinct valid numbers found as Buy and Sell rates.
                if (potentialRates.length >= 2) {
                    const buyStr = potentialRates[0]; // e.g. "15.850,00"
                    const sellStr = potentialRates[1]; // e.g. "15.950,00"

                    // Parse to standard number string "15850.00" for the app state
                    const buy = parseScrapedIDR(buyStr);
                    const sell = parseScrapedIDR(sellStr);

                    if (buy && sell && !isNaN(parseFloat(buy))) {
                         scrapedRates.push({
                            currency,
                            buy, 
                            sell
                        });
                    }
                }
            }
        });

        // Remove duplicates (in case multiple tables exist on the page)
        const uniqueRates = scrapedRates.filter((v, i, a) => a.findIndex(t => t.currency === v.currency) === i);
        
        if (uniqueRates.length > 0) {
            return uniqueRates;
        }
        
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

        // Strategy: Search for "1 Gram" in the table and find the associated price.
        // This is more robust than fixed selectors.
        const allCells = Array.from(doc.querySelectorAll('td, th, div'));
        
        // Find the cell that says "1 Gram" (or variations)
        const weightCell = allCells.find(cell => {
            const text = cell.textContent?.toLowerCase() || '';
            return (text.includes('1 gram') || text.includes('1 gr')) && text.length < 15;
        });

        if (weightCell && weightCell.parentElement) {
            // Get all cells in that specific row
            const rowCells = Array.from(weightCell.parentElement.querySelectorAll('td'));
            
            // Iterate through the cells in that row to find the first valid price
            for (const cell of rowCells) {
                const text = cell.textContent?.trim() || '';
                
                // Skip the weight cell itself
                if (text.toLowerCase().includes('gram')) continue;

                // Check if it looks like a price (contains numbers, dots, maybe Rp)
                // We strip non-numeric characters to check the value
                const cleanNumbers = text.replace(/[^0-9]/g, '');
                
                // Emas Antam price is usually > 1,000,000. Check for reasonable length (e.g., > 5 digits)
                if (cleanNumbers.length > 5) {
                    return {
                        price: parseInt(cleanNumbers, 10),
                        currency: 'IDR'
                    };
                }
            }
        }

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
