import React, { useState } from 'react';
import type { KreditPromo, InterestRate, DepositoRate } from '../types';

interface AdminPanelProps {
    kreditPromos: KreditPromo[];
    setKreditPromos: React.Dispatch<React.SetStateAction<KreditPromo[]>>;
    savingsRates: InterestRate[];
    setSavingsRates: React.Dispatch<React.SetStateAction<InterestRate[]>>;
    depositoRates: DepositoRate[];
    setDepositoRates: React.Dispatch<React.SetStateAction<DepositoRate[]>>;
    promoImages: string[];
    setPromoImages: React.Dispatch<React.SetStateAction<string[]>>;
    onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = (props) => {
    const { onClose } = props;

    // Local state for form editing
    const [localPromos, setLocalPromos] = useState<KreditPromo[]>(props.kreditPromos);
    const [localSavingsRates, setLocalSavingsRates] = useState<InterestRate[]>(props.savingsRates);
    const [localDepositoRates, setLocalDepositoRates] = useState<DepositoRate[]>(props.depositoRates);
    const [localImages, setLocalImages] = useState<string[]>(props.promoImages);
    
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

    const handleSave = () => {
        props.setKreditPromos(localPromos);
        props.setSavingsRates(localSavingsRates);
        props.setDepositoRates(localDepositoRates);
        props.setPromoImages(localImages.filter(img => img.trim() !== ''));
        
        localStorage.setItem('bpr_kreditPromos', JSON.stringify(localPromos));
        localStorage.setItem('bpr_savingsRates', JSON.stringify(localSavingsRates));
        localStorage.setItem('bpr_depositoRates', JSON.stringify(localDepositoRates));
        localStorage.setItem('bpr_promoImages', JSON.stringify(localImages.filter(img => img.trim() !== '')));

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