
import React, { useState, useEffect } from 'react';
import type { KreditPromo, InterestRate, DepositoRate, QueueState, AudioSettings } from '../types';
import { announceQueue, getAudioSettings, saveAudioSettings } from '../utils/audio';

interface AdminPanelProps {
    kreditPromos: KreditPromo[];
    setKreditPromos: React.Dispatch<React.SetStateAction<KreditPromo[]>>;
    savingsRates: InterestRate[];
    setSavingsRates: React.Dispatch<React.SetStateAction<InterestRate[]>>;
    depositoRates: DepositoRate[];
    setDepositoRates: React.Dispatch<React.SetStateAction<DepositoRate[]>>;
    promoImages: string[];
    setPromoImages: React.Dispatch<React.SetStateAction<string[]>>;
    queueState: QueueState;
    setQueueState: React.Dispatch<React.SetStateAction<QueueState>>;
    onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = (props) => {
    const { onClose, setQueueState, queueState } = props;

    // Local state for form editing
    const [localPromos, setLocalPromos] = useState<KreditPromo[]>(props.kreditPromos);
    const [localSavingsRates, setLocalSavingsRates] = useState<InterestRate[]>(props.savingsRates);
    const [localDepositoRates, setLocalDepositoRates] = useState<DepositoRate[]>(props.depositoRates);
    const [localImages, setLocalImages] = useState<string[]>(props.promoImages);
    
    // Audio Settings State
    const [audioSettings, setAudioSettings] = useState<AudioSettings>(getAudioSettings());
    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

    // Load voices on mount
    useEffect(() => {
        const updateVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            setAvailableVoices(voices);
            // If no voice is selected yet, try to pick a default Indo voice
            if (!audioSettings.voiceURI) {
                 const indoVoice = voices.find(v => v.lang === 'id-ID');
                 if (indoVoice) {
                     setAudioSettings(prev => ({...prev, voiceURI: indoVoice.voiceURI}));
                 }
            }
        };

        updateVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = updateVoices;
        }
    }, []);


    // Queue Logic
    const updateQueue = (type: 'teller' | 'cs', delta: number) => {
        // Calculate new value based on current props to ensure sync
        const currentVal = queueState[type];
        const newVal = Math.max(0, currentVal + delta);

        setQueueState(prev => ({ ...prev, [type]: newVal }));

        // Only announce if we are moving forward (Calling next)
        if (delta > 0) {
            const prefix = type === 'teller' ? 'A' : 'B';
            const location = type === 'teller' ? 'Loket Satu' : 'Meja Customer Service';
            announceQueue(prefix, newVal, location);
        }
    };
    
    const recallQueue = (type: 'teller' | 'cs') => {
        const currentVal = queueState[type];
        if (currentVal > 0) {
            const prefix = type === 'teller' ? 'A' : 'B';
            const location = type === 'teller' ? 'Loket Satu' : 'Meja Customer Service';
            announceQueue(prefix, currentVal, location);
        }
    };
    
    const resetQueue = (type: 'teller' | 'cs') => {
        if(confirm(`Reset antrian ${type === 'teller' ? 'Teller' : 'CS'} ke 0?`)) {
             setQueueState(prev => ({ ...prev, [type]: 0 }));
        }
    };

    const handlePromoChange = (index: number, field: keyof KreditPromo, value: string) => {
        const updatedPromos = [...localPromos];
        updatedPromos[index] = { ...updatedPromos[index], [field]: value };
        setLocalPromos(updatedPromos);
    };

    const handlePromoImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                const base64String = loadEvent.target?.result as string;
                if (base64String) {
                    handlePromoChange(index, 'backgroundImage', base64String);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const addPromo = () => {
        setLocalPromos([...localPromos, { title: 'Promo Baru', rate: '0%', description: 'Deskripsi singkat', backgroundImage: '' }]);
    };

    const removePromo = (index: number) => {
        setLocalPromos(localPromos.filter((_, i) => i !== index));
    };

    const handleSavingsRateChange = (index: number, field: keyof InterestRate, value: string) => {
        const updatedRates = [...localSavingsRates];
        updatedRates[index] = { ...updatedRates[index], [field]: value };
        setLocalSavingsRates(updatedRates);
    };

    const addSavingsRate = () => {
        setLocalSavingsRates([...localSavingsRates, { product: 'Produk Baru', rate: '0%' }]);
    };

    const removeSavingsRate = (index: number) => {
        setLocalSavingsRates(localSavingsRates.filter((_, i) => i !== index));
    };
    
    const handleDepositoChange = (index: number, field: keyof DepositoRate, value: string) => {
        const updatedDepositos = [...localDepositoRates];
        updatedDepositos[index] = { ...updatedDepositos[index], [field]: value };
        setLocalDepositoRates(updatedDepositos);
    };

    const addDeposito = () => {
        setLocalDepositoRates([...localDepositoRates, { tenor: 'Jangka Waktu Baru', rate: '0% p.a.' }]);
    };

    const removeDeposito = (index: number) => {
        setLocalDepositoRates(localDepositoRates.filter((_, i) => i !== index));
    };

    const handleImageChange = (index: number, value: string) => {
        const updatedImages = [...localImages];
        updatedImages[index] = value;
        setLocalImages(updatedImages);
    };

    const addImage = () => {
        setLocalImages([...localImages, '']);
    };

    const removeImage = (index: number) => {
        setLocalImages(localImages.filter((_, i) => i !== index));
    };
    
    // Audio Settings Handler
    const handleAudioSettingChange = (field: keyof AudioSettings, value: string | number) => {
        setAudioSettings(prev => ({ ...prev, [field]: value }));
    };

    const testVoice = () => {
        announceQueue('A', 123, 'Loket Tes', audioSettings);
    };

    const handleSave = () => {
        props.setKreditPromos(localPromos);
        props.setSavingsRates(localSavingsRates);
        props.setDepositoRates(localDepositoRates);
        props.setPromoImages(localImages.filter(img => img.trim() !== ''));
        
        localStorage.setItem('bpr_kreditPromos', JSON.stringify(localPromos));
        localStorage.setItem('bpr_savingsRates', JSON.stringify(localSavingsRates));
        localStorage.setItem('bpr_depositoRates', JSON.stringify(localDepositoRates));
        localStorage.setItem('bpr_promoImages', JSON.stringify(localImages.filter(img => img.trim() !== '')));
        
        // Save audio settings
        saveAudioSettings(audioSettings);

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-[#162842] w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col">
                <header className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">Panel Admin Konten</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-3xl leading-none">&times;</button>
                </header>
                
                <main className="flex-1 p-6 overflow-y-auto space-y-8 text-white">
                    
                    {/* Queue Control Section */}
                    <section className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                <span className="bg-amber-500 w-2 h-6 rounded-full inline-block"></span>
                                Kontrol Antrian (Manual)
                            </h3>
                            
                            {/* Quick Access Links for Staff Views */}
                            <div className="flex gap-2">
                                <a 
                                    href="/?mode=teller" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-xs bg-blue-900/40 text-blue-300 border border-blue-700/50 px-3 py-1.5 rounded hover:bg-blue-800 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                                        <path fillRule="evenodd" d="M15.75 2.25H21a.75.75 0 01.75.75v5.25a.75.75 0 01-1.5 0V4.81L8.03 17.03a.75.75 0 01-1.06-1.06L19.19 3.75h-3.44a.75.75 0 010-1.5zm-10.5 4.5a1.5 1.5 0 00-1.5 1.5v10.5a1.5 1.5 0 001.5 1.5h10.5a1.5 1.5 0 001.5-1.5V10.5a.75.75 0 011.5 0v8.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V8.25a3 3 0 013-3h8.25a.75.75 0 010 1.5H5.25z" clipRule="evenodd" />
                                    </svg>
                                    Buka Panel Teller
                                </a>
                                <a 
                                    href="/?mode=cs" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-xs bg-emerald-900/40 text-emerald-300 border border-emerald-700/50 px-3 py-1.5 rounded hover:bg-emerald-800 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                                        <path fillRule="evenodd" d="M15.75 2.25H21a.75.75 0 01.75.75v5.25a.75.75 0 01-1.5 0V4.81L8.03 17.03a.75.75 0 01-1.06-1.06L19.19 3.75h-3.44a.75.75 0 010-1.5zm-10.5 4.5a1.5 1.5 0 00-1.5 1.5v10.5a1.5 1.5 0 001.5 1.5h10.5a1.5 1.5 0 001.5-1.5V10.5a.75.75 0 011.5 0v8.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V8.25a3 3 0 013-3h8.25a.75.75 0 010 1.5H5.25z" clipRule="evenodd" />
                                    </svg>
                                    Buka Panel CS
                                </a>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Teller Control */}
                            <div className="bg-slate-700/50 p-4 rounded-lg flex flex-col items-center relative">
                                <span className="text-slate-400 text-sm uppercase tracking-wider mb-2">Antrian Teller (A)</span>
                                <div className="text-5xl font-bold text-white mb-4">A-{String(props.queueState.teller).padStart(3, '0')}</div>
                                <div className="flex gap-2 w-full">
                                     <button onClick={() => updateQueue('teller', -1)} className="w-12 bg-slate-600 hover:bg-slate-500 py-2 rounded text-white font-bold">-</button>
                                     <button onClick={() => updateQueue('teller', 1)} className="flex-1 bg-blue-600 hover:bg-blue-500 py-2 rounded text-white font-bold flex items-center justify-center gap-2">
                                        <span>Panggil Berikutnya</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                          <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                                          <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
                                        </svg>
                                     </button>
                                </div>
                                <div className="flex justify-between w-full mt-3">
                                    <button onClick={() => resetQueue('teller')} className="text-xs text-red-400 hover:text-red-300 underline">Reset</button>
                                    <button onClick={() => recallQueue('teller')} className="text-xs text-amber-400 hover:text-amber-300 underline flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                                            <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.919z" clipRule="evenodd" />
                                        </svg>
                                        Panggil Ulang
                                    </button>
                                </div>
                            </div>
                             {/* CS Control */}
                             <div className="bg-slate-700/50 p-4 rounded-lg flex flex-col items-center relative">
                                <span className="text-slate-400 text-sm uppercase tracking-wider mb-2">Antrian CS (B)</span>
                                <div className="text-5xl font-bold text-white mb-4">B-{String(props.queueState.cs).padStart(3, '0')}</div>
                                <div className="flex gap-2 w-full">
                                     <button onClick={() => updateQueue('cs', -1)} className="w-12 bg-slate-600 hover:bg-slate-500 py-2 rounded text-white font-bold">-</button>
                                     <button onClick={() => updateQueue('cs', 1)} className="flex-1 bg-emerald-600 hover:bg-emerald-500 py-2 rounded text-white font-bold flex items-center justify-center gap-2">
                                        <span>Panggil Berikutnya</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                          <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                                          <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
                                        </svg>
                                     </button>
                                </div>
                                <div className="flex justify-between w-full mt-3">
                                    <button onClick={() => resetQueue('cs')} className="text-xs text-red-400 hover:text-red-300 underline">Reset</button>
                                    <button onClick={() => recallQueue('cs')} className="text-xs text-amber-400 hover:text-amber-300 underline flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                                            <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.919z" clipRule="evenodd" />
                                        </svg>
                                        Panggil Ulang
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Audio Settings Section (NEW) */}
                    <section className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                         <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
                            <span className="bg-pink-500 w-2 h-6 rounded-full inline-block"></span>
                            Konfigurasi Suara Pengumuman
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-slate-300 mb-1">Pilih Suara (Voice)</label>
                                    <select 
                                        className="w-full bg-slate-700 text-white p-2 rounded border border-slate-600 focus:border-blue-500 outline-none"
                                        value={audioSettings.voiceURI}
                                        onChange={(e) => handleAudioSettingChange('voiceURI', e.target.value)}
                                    >
                                        {availableVoices.length === 0 && <option value="">Memuat daftar suara...</option>}
                                        {availableVoices.map(v => (
                                            <option key={v.voiceURI} value={v.voiceURI}>
                                                {v.name} ({v.lang})
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Tips: Pilih suara yang berlabel "Google" atau "Microsoft" Bahasa Indonesia untuk hasil terbaik.
                                    </p>
                                </div>
                                <button 
                                    onClick={testVoice}
                                    className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded flex items-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                                    </svg>
                                    Test Suara Sekarang
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <label className="text-slate-300">Kecepatan Bicara (Rate)</label>
                                        <span className="text-amber-400">{audioSettings.rate}</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0.5" 
                                        max="2.0" 
                                        step="0.05"
                                        value={audioSettings.rate}
                                        onChange={(e) => handleAudioSettingChange('rate', parseFloat(e.target.value))}
                                        className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-xs text-slate-500 px-1">
                                        <span>Lambat</span>
                                        <span>Cepat</span>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <label className="text-slate-300">Nada Suara (Pitch)</label>
                                        <span className="text-amber-400">{audioSettings.pitch}</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0.5" 
                                        max="2.0" 
                                        step="0.1"
                                        value={audioSettings.pitch}
                                        onChange={(e) => handleAudioSettingChange('pitch', parseFloat(e.target.value))}
                                        className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-xs text-slate-500 px-1">
                                        <span>Berat</span>
                                        <span>Tinggi</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Promo Kredit Section */}
                    <section>
                        <h3 className="text-xl font-semibold mb-4 text-amber-400">Manajemen Promo</h3>
                        <div className="space-y-4">
                            {localPromos.map((promo, index) => (
                                <div key={index} className="bg-slate-800/50 p-3 rounded-lg">
                                    <div className="grid grid-cols-12 gap-3 items-center">
                                        <input type="text" value={promo.title} onChange={(e) => handlePromoChange(index, 'title', e.target.value)} placeholder="Judul" className="col-span-4 bg-slate-700 p-2 rounded" />
                                        <input type="text" value={promo.description} onChange={(e) => handlePromoChange(index, 'description', e.target.value)} placeholder="Deskripsi" className="col-span-5 bg-slate-700 p-2 rounded" />
                                        <input type="text" value={promo.rate} onChange={(e) => handlePromoChange(index, 'rate', e.target.value)} placeholder="Suku Bunga" className="col-span-2 bg-slate-700 p-2 rounded" />
                                        <button onClick={() => removePromo(index)} className="bg-red-600 hover:bg-red-700 p-2 rounded">Hapus</button>
                                    </div>
                                    <div className="mt-2 flex items-center gap-4">
                                        {promo.backgroundImage ? (
                                            <>
                                                <img src={promo.backgroundImage} alt="Preview" className="w-24 h-14 object-cover rounded" />
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm cursor-pointer text-center">
                                                        Ganti Gambar
                                                        <input 
                                                            type="file" 
                                                            className="hidden" 
                                                            accept="image/*"
                                                            onChange={(e) => handlePromoImageUpload(e, index)}
                                                        />
                                                    </label>
                                                    <button 
                                                        onClick={() => handlePromoChange(index, 'backgroundImage', '')} 
                                                        className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm"
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer">
                                                Upload Gambar Promo
                                                <input 
                                                    type="file" 
                                                    className="hidden" 
                                                    accept="image/*"
                                                    onChange={(e) => handlePromoImageUpload(e, index)}
                                                />
                                            </label>
                                        )}
                                    </div>
                                     <p className="text-xs text-slate-400 pt-2">
                                        Tips: Jika gambar diupload, teks di atas (judul, deskripsi, dll) akan diabaikan dan hanya gambar poster yang akan ditampilkan.
                                    </p>
                                </div>
                            ))}
                        </div>
                        <button onClick={addPromo} className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">Tambah Promo</button>
                    </section>
                    
                     {/* Background Images Section */}
                    <section>
                        <h3 className="text-xl font-semibold mb-4 text-amber-400">Gambar Latar Belakang Carousel</h3>
                        <p className="text-sm text-slate-400 mb-2">Gambar ini akan digunakan sebagai latar belakang slideshow utama di belakang konten promo. Masukkan URL gambar.</p>
                        <div className="space-y-2">
                            {localImages.map((url, index) => (
                                <div key={index} className="flex items-center gap-2 bg-slate-800/50 p-2 rounded-lg">
                                    <input 
                                        type="text" 
                                        value={url} 
                                        onChange={(e) => handleImageChange(index, e.target.value)} 
                                        placeholder="https://example.com/image.jpg" 
                                        className="flex-1 bg-slate-700 p-2 rounded" 
                                    />
                                    <button onClick={() => removeImage(index)} className="bg-red-600 hover:bg-red-700 p-2 rounded">Hapus</button>
                                </div>
                            ))}
                        </div>
                        <button onClick={addImage} className="mt-2 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm">Tambah Gambar</button>
                    </section>
                    
                    {/* Suku Bunga Tabungan Section */}
                    <section>
                        <h3 className="text-xl font-semibold mb-4 text-amber-400">Suku Bunga Tabungan</h3>
                         <div className="space-y-4">
                            {localSavingsRates.map((rate, index) => (
                                <div key={index} className="grid grid-cols-8 gap-3 items-center bg-slate-800/50 p-3 rounded-lg">
                                    <input 
                                        type="text" 
                                        value={rate.product} 
                                        onChange={(e) => handleSavingsRateChange(index, 'product', e.target.value)} 
                                        placeholder="Nama Produk" 
                                        className="col-span-4 bg-slate-700 p-2 rounded"
                                    />
                                    <input 
                                        type="text" 
                                        value={rate.rate} 
                                        onChange={(e) => handleSavingsRateChange(index, 'rate', e.target.value)} 
                                        placeholder="Suku Bunga" 
                                        className="col-span-3 bg-slate-700 p-2 rounded" 
                                    />
                                    <button onClick={() => removeSavingsRate(index)} className="bg-red-600 hover:bg-red-700 p-2 rounded">Hapus</button>
                                </div>
                            ))}
                        </div>
                        <button onClick={addSavingsRate} className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">Tambah Tabungan</button>
                    </section>

                     {/* Suku Bunga Deposito Section */}
                    <section>
                        <h3 className="text-xl font-semibold mb-4 text-amber-400">Suku Bunga Deposito</h3>
                        <div className="space-y-4">
                            {localDepositoRates.map((deposito, index) => (
                                <div key={index} className="grid grid-cols-8 gap-3 items-center bg-slate-800/50 p-3 rounded-lg">
                                    <input 
                                        type="text" 
                                        value={deposito.tenor} 
                                        onChange={(e) => handleDepositoChange(index, 'tenor', e.target.value)} 
                                        placeholder="Jangka Waktu" 
                                        className="col-span-4 bg-slate-700 p-2 rounded" 
                                    />
                                    <input 
                                        type="text" 
                                        value={deposito.rate} 
                                        onChange={(e) => handleDepositoChange(index, 'rate', e.target.value)} 
                                        placeholder="Suku Bunga" 
                                        className="col-span-3 bg-slate-700 p-2 rounded" 
                                    />
                                    <button onClick={() => removeDeposito(index)} className="bg-red-600 hover:bg-red-700 p-2 rounded">Hapus</button>
                                </div>
                            ))}
                        </div>
                        <button onClick={addDeposito} className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">Tambah Deposito</button>
                    </section>

                </main>
                
                <footer className="p-4 border-t border-slate-700 flex justify-end gap-4">
                    <button onClick={onClose} className="px-6 py-2 rounded bg-slate-600 hover:bg-slate-700 transition-colors">Batal</button>
                    <button onClick={handleSave} className="px-6 py-2 rounded bg-green-600 hover:bg-green-700 transition-colors">Simpan Perubahan</button>
                </footer>
            </div>
        </div>
    );
};

export default AdminPanel;
