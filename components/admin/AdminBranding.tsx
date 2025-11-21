import React from 'react';

interface AdminBrandingProps {
    logo: string | null;
    setLogo: (logo: string | null) => void;
}

const AdminBranding: React.FC<AdminBrandingProps> = ({ logo, setLogo }) => {
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { alert("Ukuran gambar terlalu besar (Max 5MB)."); return; }
            const reader = new FileReader();
            reader.onload = (loadEvent) => { if (loadEvent.target?.result) setLogo(loadEvent.target.result as string); };
            reader.readAsDataURL(file);
        }
    };

    return (
        <section className="bg-slate-800/40 p-6 rounded-xl border border-slate-700">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-4"><span className="bg-purple-500 w-2 h-6 rounded-full inline-block"></span>Branding & Logo</h3>
            <div className="flex items-start gap-6">
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-600 border-dashed w-48 h-32 flex items-center justify-center relative group overflow-hidden">
                    {logo ? <img src={logo} alt="Logo Preview" className="max-w-full max-h-full object-contain" /> : <div className="text-slate-500 text-center text-sm"><p>Belum ada logo</p></div>}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><p className="text-white text-xs font-semibold">Ganti Logo</p></div>
                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={handleFileUpload} />
                </div>
                <div className="flex-1">
                    <p className="text-sm text-slate-300 mb-2">Upload logo perusahaan. Format PNG Transparan.</p>
                    {logo && <button onClick={() => setLogo(null)} className="text-red-400 text-sm hover:text-red-300 underline">Hapus Logo</button>}
                </div>
            </div>
        </section>
    );
};

export default AdminBranding;
