import React, { useState } from 'react';
import type { KreditPromo } from '../../types';
import type { WithId } from '../../hooks/useAdminForm';
import { validateRequired, validateRate, validateFileSize, validateImageFile } from '../../utils/validation';
import { Input } from '../ui';

interface AdminPromosProps {
    promos: WithId<KreditPromo>[];
    setPromos: (promos: WithId<KreditPromo>[]) => void;
}

interface PromoErrors {
    [key: number]: {
        title?: string;
        rate?: string;
        description?: string;
        image?: string;
    };
}

/**
 * Admin component for managing promotional items
 * @component
 */
const AdminPromos: React.FC<AdminPromosProps> = ({ promos, setPromos }) => {
    const [errors, setErrors] = useState<PromoErrors>({});

    const handlePromoChange = (id: number, field: keyof KreditPromo, value: string) => {
        setPromos(promos.map(p => p._id === id ? { ...p, [field]: value } : p));
        
        if (errors[id]?.[field]) {
            setErrors(prev => ({
                ...prev,
                [id]: { ...prev[id], [field]: undefined }
            }));
        }
    };

    const validatePromo = (promo: WithId<KreditPromo>): boolean => {
        const newErrors: { title?: string; rate?: string; description?: string } = {};
        
        const titleValidation = validateRequired(promo.title, 'Judul');
        if (!titleValidation.isValid) newErrors.title = titleValidation.error;
        
        const rateValidation = validateRate(promo.rate);
        if (!rateValidation.isValid) newErrors.rate = rateValidation.error;
        
        const descValidation = validateRequired(promo.description, 'Deskripsi');
        if (!descValidation.isValid) newErrors.description = descValidation.error;
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(prev => ({ ...prev, [promo._id]: newErrors }));
            return false;
        }
        
        return true;
    };

    const addPromo = () => {
        setPromos([...promos, { 
            title: 'Promo Baru', 
            rate: '0%', 
            description: 'Deskripsi singkat', 
            backgroundImage: '', 
            _id: Date.now() 
        }]);
    };

    const removePromo = (id: number) => {
        setPromos(promos.filter(p => p._id !== id));
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[id];
            return newErrors;
        });
    };

    const handleImageUpload = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const sizeValidation = validateFileSize(file, 5);
        if (!sizeValidation.isValid) {
            setErrors(prev => ({
                ...prev,
                [id]: { ...prev[id], image: sizeValidation.error }
            }));
            return;
        }

        const typeValidation = validateImageFile(file);
        if (!typeValidation.isValid) {
            setErrors(prev => ({
                ...prev,
                [id]: { ...prev[id], image: typeValidation.error }
            }));
            return;
        }

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            if (loadEvent.target?.result) {
                handlePromoChange(id, 'backgroundImage', loadEvent.target.result as string);
                if (errors[id]?.image) {
                    setErrors(prev => ({
                        ...prev,
                        [id]: { ...prev[id], image: undefined }
                    }));
                }
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <section>
            <h3 className="text-xl font-semibold mb-4 text-amber-400">Daftar Promo Teks & Gambar</h3>
            <div className="space-y-4">{promos.map((promo) => (
                <div key={promo._id} className="bg-slate-800/40 p-4 rounded-lg border border-slate-700">
                    <div className="grid grid-cols-12 gap-4 mb-4">
                        <div className="col-span-3"><input type="text" value={promo.title} onChange={(e) => handlePromoChange(promo._id, 'title', e.target.value)} placeholder="Judul" className="w-full bg-slate-900 p-2 rounded border border-slate-600" /></div>
                        <div className="col-span-5"><input type="text" value={promo.description} onChange={(e) => handlePromoChange(promo._id, 'description', e.target.value)} placeholder="Deskripsi" className="w-full bg-slate-900 p-2 rounded border border-slate-600" /></div>
                        <div className="col-span-2"><input type="text" value={promo.rate} onChange={(e) => handlePromoChange(promo._id, 'rate', e.target.value)} placeholder="Bunga" className="w-full bg-slate-900 p-2 rounded border border-slate-600" /></div>
                        <div className="col-span-2 flex justify-end"><button onClick={() => removePromo(promo._id)} className="text-red-400 hover:bg-red-400/10 p-2 rounded">Hapus</button></div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-24 h-16 bg-slate-900 rounded border border-slate-600 flex items-center justify-center overflow-hidden relative group">
                            {promo.backgroundImage ?
                                <img src={promo.backgroundImage} alt="Preview" className="w-full h-full object-cover" /> :
                                <span className="text-xs text-slate-500">No Image</span>
                            }
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <span className="text-[10px] text-white">Upload</span>
                            </div>
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleImageUpload(promo._id, e)} />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-slate-400">Upload gambar background untuk promo ini (Opsional). Jika ada gambar, teks akan disembunyikan/disesuaikan.</p>
                            {promo.backgroundImage && <button onClick={() => handlePromoChange(promo._id, 'backgroundImage', '')} className="text-xs text-red-400 hover:underline mt-1">Hapus Gambar</button>}
                        </div>
                    </div>
                </div>))}
            </div>
            <button onClick={addPromo} className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-semibold">+ Tambah Promo</button>
        </section>
    );
};

export default AdminPromos;
