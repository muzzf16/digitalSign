
export interface CurrencyRate {
  currency: string;
  buy: string;
  sell: string;
}

export interface BcaApiResponse {
  data: {
    data: {
      rates: CurrencyRate[];
      last_update: string;
    }
  }
}

export interface GoldPrice {
  price: number;
  currency: string;
}

export interface StockData {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
}

export interface NewsItem {
  title: string;
  source: string;
}

export interface InterestRate {
  product: string;
  rate: string;
}

export interface EconomicData {
  currencyRates: CurrencyRate[];
  goldPrice: GoldPrice | null;
  stockData: StockData | null;
  newsItems: NewsItem[];
}

export interface KreditPromo {
  title: string;
  rate: string;
  description: string;
  backgroundImage?: string;
}

export interface DepositoRate {
  tenor: string;
  rate: string;
}

export interface QueueState {
  teller: number;
  cs: number;
}

export interface AudioSettings {
  voiceURI: string;
  pitch: number;
  rate: number;
  volume: number;
}
