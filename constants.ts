
import type { InterestRate, NewsItem, GoldPrice, StockData, CurrencyRate, KreditPromo, DepositoRate } from './types';

export const PROMO_IMAGES: string[] = [
  'https://picsum.photos/1920/1080?random=1',
  'https://picsum.photos/1920/1080?random=2',
  'https://picsum.photos/1920/1080?random=3',
];

export const SAVINGS_RATES: InterestRate[] = [{ product: 'Tabungan', rate: '0%' }];

export const KREDIT_PROMOS: KreditPromo[] = [
    { title: 'Kredit Usaha Mikro', rate: '8.5% p.a.', description: 'Suku bunga mulai', backgroundImage: 'https://picsum.photos/1920/1080?random=1' },
    { title: 'Kredit Kendaraan', rate: '7.2% p.a.', description: 'DP ringan mulai 10%', backgroundImage: 'https://picsum.photos/1920/1080?random=2' },
    { title: 'Kredit Rumah', rate: '6.9% p.a.', description: 'Fixed 3 tahun', backgroundImage: 'https://picsum.photos/1920/1080?random=3' },
];

export const MOCK_DEPOSITO_RATES: DepositoRate[] = [
    { tenor: '1 Bulan', rate: '3.50% p.a.' },
    { tenor: '3 Bulan', rate: '4.00% p.a.' },
    { tenor: '6 Bulan', rate: '4.25% p.a.' },
    { tenor: '12 Bulan', rate: '4.50% p.a.' },
];


export const MOCK_CURRENCY_RATES: CurrencyRate[] = [
    { currency: 'USD', buy: '16,688', sell: '16,788' },
    { currency: 'SGD', buy: '12,807.74', sell: '12,907.74' },
];

export const MOCK_GOLD_PRICE: GoldPrice = {
  price: 1200000,
  currency: 'IDR',
};

export const MOCK_NEWS_ITEMS: NewsItem[] = [
  { title: '3.000%, Investor Diberi Peringatan — Market', source: 'CNBC Indonesia' },
  { title: 'Berita Terkini Market, Saham, Reksadana', source: 'CNBC Indonesia' },
  { title: 'Futura Energi Global (FUTR) Tunjuk Mantan Kapolri Sutant', source: 'CNBC Indonesia' },
  { title: 'BI Rate Diprediksi Tahan Suku Bunga Acuan', source: 'Kontan'},
];
