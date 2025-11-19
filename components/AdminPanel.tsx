
import React, { useState, useEffect } from 'react';
import type { KreditPromo, InterestRate, DepositoRate, QueueState, AudioSettings } from '../types';
import { announceQueue, getAudioSettings, saveAudioSettings } from '../utils/audio';
import { saveContent, KEYS } from '../utils/imageStorage';

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
    logoUrl: string | null;
    setLogoUrl: React.Dispatch<React.SetStateAction<string | null>>;
    onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = (props) => {
    const { onClose, setQueueState, queueState } = props;

    // Local state for form editing
    const [localPromos, setLocalPromos] = useState<KreditPromo[]>(props.kreditPromos);
    const [localSavingsRates, setLocalSavingsRates] = useState<InterestRate[]>(props.savingsRates);
    const [localDepositoRates, setLocalDepositoRates] = useState<DepositoRate[]>(props.depositoRates);
    const [localImages, setLocalImages] = useState<string[]>(props.promoImages);
    const [localLogo, setLocalLogo] = useState<string | null>(props.logoUrl);
    
    const [isSaving, setIsSaving] = useState(false);
    
    // Audio Settings State
    const [audioSettings, setAudioSettings] = useState<AudioSettings>(getAudioSettings());
    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

    // Load voices
    useEffect(() => {
        const updateVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            setAvailableVoices(voices);
            
            if (voices.length > 0 && !audioSettings.voiceURI) {
                 const indoVoice = voices.find(v => v.lang === 'id-ID' && v.name.includes('Google')) || 
                                   voices.find(v => v.lang === 'id-ID');
                 if (indoVoice) {
                     setAudioSettings(prev => ({...prev, voiceURI: indoVoice.voiceURI}));
                 }
            }
        };

        updateVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = updateVoices;
        }
    }, [audioSettings.voiceURI]);

    // Queue Logic
    const updateQueue = (type: 'teller' | 'cs', delta: number) => {
        const currentVal = queueState[type];
        const newVal = Math.max(0, currentVal + delta);
        setQueueState(prev => ({ ...prev, [type]: newVal }));
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

    // Generic File to Base64 Handler
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
        const file = e.target.files?.[0];
        if (file) {
            // Limit 2MB for IndexedDB logic (safe zone)
            if (file.size > 2 * 1024 * 1024) {
                alert("Ukuran gambar terlalu besar (Max 2MB). Mohon kompres gambar terlebih dahulu.");
                return;
            }

            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                const base64String = loadEvent.target?.result as string;
                if (base64String) {
                    callback(base64String);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePromoChange = (index: number, field: keyof KreditPromo, value: string) => {
        const updatedPromos = [...localPromos];
        updatedPromos[index] = { ...updatedPromos[index], [field]: value };
        setLocalPromos(updatedPromos);
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
    
    const handleAudioSettingChange = (field: keyof AudioSettings, value: string | number) => {
        setAudioSettings(prev => ({ ...prev, [field]: value }));
    };

    const testVoice = () => {
        announceQueue('A', 123, 'Loket Tes', audioSettings);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // 1. Update React State (Immediate UI feedback)
            props.setKreditPromos(localPromos);
            props.setSavingsRates(localSavingsRates);
            props.setDepositoRates(localDepositoRates);
            props.setPromoImages(localImages.filter(img => img.trim() !== ''));
            props.setLogoUrl(localLogo);
            
            // 2. Save Audio Settings (LocalStorage is fine for small config)
            saveAudioSettings(audioSettings);

            // 3. Save Content to IndexedDB (The "Heavy Folder")
            await Promise.all([
                saveContent(KEYS.LOGO, localLogo),
                saveContent(KEYS.PROMOS, localPromos),
                saveContent(KEYS.CAROUSEL, localImages.filter(img => img.trim() !== '')),
                saveContent(KEYS.SAVINGS, localSavingsRates),
                saveContent(KEYS.DEPOSITO, localDepositoRates)
            ]);
            
            alert("Semua data berhasil disimpan di Database Lokal Browser (Unlimited)!");
            onClose();
        } catch (error) {
            console.error("Save failed:", error);
            alert("Terjadi kesalahan saat menyimpan data ke database.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-[#162842] w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col border border-slate-700">
                <header className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-800/50 rounded-t-2xl">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Panel Admin</h2>
                        <p className="text-slate-400 text-sm">Konfigurasi Konten & Tampilan</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-2 hover:bg-white/10 rounded-full transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>
                
                <main className="flex-1 p-6 overflow-y-auto space-y-8 text-white custom-scrollbar">
                    
                    {/* Branding Section (New) */}
                    <section className="bg-slate-800/40 p-6 rounded-xl border border-slate-700">
                         <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
                            <span className="bg-purple-500 w-2 h-6 rounded-full inline-block"></span>
                            Branding & Logo
                        </h3>
                        <div className="flex items-start gap-6">
                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-600 border-dashed w-48 h-32 flex items-center justify-center relative group overflow-hidden">
                                {localLogo ? (
                                    <img src={localLogo} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                                ) : (
                                    <div className="text-slate-500 text-center text-sm">
                                        <p>Belum ada logo</p>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-white text-xs font-semibold">Ganti Logo</p>
                                </div>
                                <input 
                                    type="file" 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e, (base64) => setLocalLogo(base64))}
                                />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-slate-300 mb-2">Upload logo perusahaan Anda. Format disarankan: PNG Transparan.</p>
                                {localLogo && (
                                    <button 
                                        onClick={() => setLocalLogo(null)} 
                                        className="text-red-400 text-sm hover:text-red-300 underline"
                                    >
                                        Hapus Logo
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Queue Control Section */}
                    <section className="bg-slate-800/40 p-6 rounded-xl border border-slate-700">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                <span className="bg-blue-500 w-2 h-6 rounded-full inline-block"></span>
                                Kontrol Antrian
                            </h3>
                            <div className="flex gap-2">
                                <a href="/?mode=teller" target="_blank" className="px-3 py-1.5 text-xs bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded hover:bg-blue-600/40">Panel Teller</a>
                                <a href="/?mode=cs" target="_blank" className="px-3 py-1.5 text-xs bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 rounded hover:bg-emerald-600/40">Panel CS</a>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Teller */}
                            <div className="bg-slate-700/30 p-4 rounded-lg text-center border border-slate-600">
                                <div className="text-4xl font-bold mb-3">A-{String(props.queueState.teller).padStart(3, '0')}</div>
                                <div className="flex gap-2 justify-center mb-3">
                                     <button onClick={() => updateQueue('teller', -1)} className="bg-slate-600 p-2 rounded">-</button>
                                     <button onClick={() => updateQueue('teller', 1)} className="bg-blue-600 px-4 py-2 rounded flex items-center gap-2">Panggil <span className="font-bold">+1</span></button>
                                </div>
                                <div className="flex justify-center gap-4 text-xs underline cursor-pointer">
                                    <span onClick={() => resetQueue('teller')} className="text-red-400">Reset</span>
                                    <span onClick={() => recallQueue('teller')} className="text-amber-400">Panggil Ulang</span>
                                </div>
                            </div>
                             {/* CS */}
                             <div className="bg-slate-700/30 p-4 rounded-lg text-center border border-slate-600">
                                <div className="text-4xl font-bold mb-3">B-{String(props.queueState.cs).padStart(3, '0')}</div>
                                <div className="flex gap-2 justify-center mb-3">
                                     <button onClick={() => updateQueue('cs', -1)} className="bg-slate-600 p-2 rounded">-</button>
                                     <button onClick={() => updateQueue('cs', 1)} className="bg-emerald-600 px-4 py-2 rounded flex items-center gap-2">Panggil <span className="font-bold">+1</span></button>
                                </div>
                                <div className="flex justify-center gap-4 text-xs underline cursor-pointer">
                                     <span onClick={() => resetQueue('cs')} className="text-red-400">Reset</span>
                                    <span onClick={() => recallQueue('cs')} className="text-amber-400">Panggil Ulang</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Audio Settings */}
                    <section className="bg-slate-800/40 p-6 rounded-xl border border-slate-700">
                         <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
                            <span className="bg-pink-500 w-2 h-6 rounded-full inline-block"></span>
                            Suara Pengumuman
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm text-slate-300 mb-1">Suara (Voice)</label>
                                <select 
                                    className="w-full bg-slate-700 p-2 rounded border border-slate-600"
                                    value={audioSettings.voiceURI}
                                    onChange={(e) => handleAudioSettingChange('voiceURI', e.target.value)}
                                >
                                    {availableVoices.map(v => <option key={v.voiceURI} value={v.voiceURI}>{v.name}</option>)}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button onClick={testVoice} className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded w-full">Test Suara</button>
                            </div>
                        </div>
                    </section>

                    {/* Promo List */}
                    <section>
                        <h3 className="text-xl font-semibold mb-4 text-amber-400">Daftar Promo</h3>
                        <div className="space-y-4">
                            {localPromos.map((promo, index) => (
                                <div key={index} className="bg-slate-800/40 p-4 rounded-lg border border-slate-700">
                                    <div className="grid grid-cols-12 gap-4">
                                        <div className="col-span-3">
                                            <input type="text" value={promo.title} onChange={(e) => handlePromoChange(index, 'title', e.target.value)} placeholder="Judul" className="w-full bg-slate-900 p-2 rounded border border-slate-600" />
                                        </div>
                                        <div className="col-span-5">
                                            <input type="text" value={promo.description} onChange={(e) => handlePromoChange(index, 'description', e.target.value)} placeholder="Deskripsi" className="w-full bg-slate-900 p-2 rounded border border-slate-600" />
                                        </div>
                                         <div className="col-span-2">
                                            <input type="text" value={promo.rate} onChange={(e) => handlePromoChange(index, 'rate', e.target.value)} placeholder="Bunga" className="w-full bg-slate-900 p-2 rounded border border-slate-600" />
                                        </div>
                                        <div className="col-span-2 flex justify-end">
                                            <button onClick={() => removePromo(index)} className="text-red-400 hover:bg-red-400/10 p-2 rounded">Hapus</button>
                                        </div>
                                    </div>
                                    <div className="mt-3 border-t border-slate-700 pt-3 flex items-center gap-4">
                                         {promo.backgroundImage ? (
                                            <div className="relative group w-32 h-20 bg-black rounded overflow-hidden border border-slate-600">
                                                <img src={promo.backgroundImage} alt="Preview" className="w-full h-full object-cover" />
                                                <button onClick={() => handlePromoChange(index, 'backgroundImage', '')} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">Hapus</button>
                                            </div>
                                        ) : (
                                            <label className="cursor-pointer bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded text-sm flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                Upload Poster
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, (b64) => handlePromoChange(index, 'backgroundImage', b64))} />
                                            </label>
                                        )}
                                        <p className="text-xs text-slate-500 italic">Jika poster diupload, teks tidak akan ditampilkan.</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={addPromo} className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-semibold">+ Tambah Promo Baru</button>
                    </section>
                    
                    {/* Savings & Deposito Sections (Simplified Layout) */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <section>
                             <h3 className="text-xl font-semibold mb-4 text-amber-400">Tabungan</h3>
                             <div className="space-y-2">
                                {localSavingsRates.map((item, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input className="flex-1 bg-slate-800 p-2 rounded border border-slate-700" value={item.product} onChange={e => handleSavingsRateChange(idx, 'product', e.target.value)} />
                                        <input className="w-24 bg-slate-800 p-2 rounded border border-slate-700" value={item.rate} onChange={e => handleSavingsRateChange(idx, 'rate', e.target.value)} />
                                        <button onClick={() => removeSavingsRate(idx)} className="text-red-500 px-2">&times;</button>
                                    </div>
                                ))}
                                <button onClick={addSavingsRate} className="text-xs text-blue-400 mt-2">+ Tambah</button>
                             </div>
                        </section>
                         <section>
                             <h3 className="text-xl font-semibold mb-4 text-amber-400">Deposito</h3>
                             <div className="space-y-2">
                                {localDepositoRates.map((item, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input className="flex-1 bg-slate-800 p-2 rounded border border-slate-700" value={item.tenor} onChange={e => handleDepositoChange(idx, 'tenor', e.target.value)} />
                                        <input className="w-24 bg-slate-800 p-2 rounded border border-slate-700" value={item.rate} onChange={e => handleDepositoChange(idx, 'rate', e.target.value)} />
                                        <button onClick={() => removeDeposito(idx)} className="text-red-500 px-2">&times;</button>
                                    </div>
                                ))}
                                <button onClick={addDeposito} className="text-xs text-blue-400 mt-2">+ Tambah</button>
                             </div>
                        </section>
                    </div>

                </main>
                
                <footer className="p-5 border-t border-slate-700 flex justify-between items-center bg-slate-800/50 rounded-b-2xl">
                    <p className="text-xs text-slate-500">Penyimpanan Database Lokal Aktif (Max 500MB)</p>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-6 py-2 rounded bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors">Batal</button>
                        <button 
                            onClick={handleSave} 
                            disabled={isSaving}
                            className="px-8 py-2 rounded bg-green-600 hover:bg-green-500 text-white font-bold shadow-lg hover:shadow-green-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Menyimpan...
                                </>
                            ) : 'Simpan Perubahan'}
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default AdminPanel;
