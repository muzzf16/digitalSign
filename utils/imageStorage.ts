
import type { KreditPromo, InterestRate, DepositoRate } from '../types';

const DB_NAME = 'BPR_Digital_Signage_DB';
const STORE_NAME = 'app_content';

// Keys for different content types
export const KEYS = {
    LOGO: 'branding_logo',
    PROMOS: 'content_promos',
    CAROUSEL: 'content_carousel_images',
    SAVINGS: 'content_savings',
    DEPOSITO: 'content_deposito'
};

const openDB = () => {
    return new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        
        request.onupgradeneeded = (event: any) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };

        request.onsuccess = (event: any) => resolve(event.target.result);
        request.onerror = (event: any) => reject(event.target.error);
    });
};

export const saveContent = async (key: string, data: any): Promise<void> => {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.put(data, key);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error(`Failed to save ${key} to IndexedDB:`, error);
        throw error;
    }
};

export const loadContent = async <T>(key: string): Promise<T | null> => {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.get(key);
            
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error(`Failed to load ${key} from IndexedDB:`, error);
        return null;
    }
};

// Helper specific for initializing app data
export const initAppData = async () => {
    const logo = await loadContent<string>(KEYS.LOGO);
    const promos = await loadContent<KreditPromo[]>(KEYS.PROMOS);
    const carouselImages = await loadContent<string[]>(KEYS.CAROUSEL);
    const savings = await loadContent<InterestRate[]>(KEYS.SAVINGS);
    const deposito = await loadContent<DepositoRate[]>(KEYS.DEPOSITO);
    
    return { logo, promos, carouselImages, savings, deposito };
};
