import type { EconomicData, CurrencyRate } from '../types';
import { MOCK_CURRENCY_RATES, MOCK_GOLD_PRICE, MOCK_NEWS_ITEMS, MOCK_STOCK_DATA } from '../constants';

// Helper to clean and parse currency strings like "16,688.00" into numbers
const parseCurrency = (rate: string): number => {
    return parseFloat(rate.replace(/,/g, ''));
};


export const fetchEconomicData = async (): Promise<EconomicData> => {
  // To ensure stability and prevent network errors, this function now exclusively uses mock data.
  // The currency rates are processed to remove commas and format them correctly,
  // mimicking the behavior of the previously successful API call. This also fixes
  // a bug where unformatted mock data would cause display issues (e.g., NaN).
  const currencyRates: CurrencyRate[] = MOCK_CURRENCY_RATES.map(rate => ({
      ...rate,
      buy: String(parseCurrency(rate.buy)),
      sell: String(parseCurrency(rate.sell)),
  }));

  return {
    currencyRates,
    goldPrice: MOCK_GOLD_PRICE,
    stockData: MOCK_STOCK_DATA,
    newsItems: MOCK_NEWS_ITEMS,
  };
};
