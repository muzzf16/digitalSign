import React from 'react';
import type { WithId } from '../../hooks/useAdminForm';

interface AdminCarouselProps {
    images: WithId<{ value: string }>[];
    setImages: (images: WithId<{ value: string }>[]) => void;
}

const AdminCarousel: React.FC<AdminCarouselProps> = ({ images, setImages }) => {
    const handleImageChange = (id: number, value: string) => setImages(images.map(i => i._id === id ? { ...i, value } : i));
    const addImage = () => setImages([...images, { value: '', _id: Date.now() }]);
    const removeImage = (id: number) => setImages(images.filter(i => i._id !== id));

    return (
        <section>
            <h3 className="text-xl font-semibold mb-4 text-amber-400">Gambar Carousel Latar</h3>
            <div className="space-y-4">{images.map((img) => (
                <div key={img._id} className="bg-slate-800/40 p-4 rounded-lg border border-slate-700 flex items-center gap-4">
                    <img src={img.value} alt="Preview" className="w-32 h-20 object-cover rounded-md bg-slate-900" />
                    <input type="text" value={img.value} onChange={(e) => handleImageChange(img._id, e.target.value)} placeholder="URL Gambar" className="flex-1 w-full bg-slate-900 p-2 rounded border border-slate-600" />
                    <button onClick={() => removeImage(img._id)} className="text-red-400 hover:bg-red-400/10 p-2 rounded">Hapus</button>
                </div>))}
            </div>
            <button onClick={addImage} className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-semibold">+ Tambah Gambar</button>
        </section>
    );
};

export default AdminCarousel;
