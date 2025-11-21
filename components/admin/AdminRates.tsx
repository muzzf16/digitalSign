import React from 'react';
import type { InterestRate, DepositoRate } from '../../types';
import type { WithId } from '../../hooks/useAdminForm';

interface AdminRatesProps {
    savingsRates: WithId<InterestRate>[];
    setSavingsRates: (rates: WithId<InterestRate>[]) => void;
    depositoRates: WithId<DepositoRate>[];
    setDepositoRates: (rates: WithId<DepositoRate>[]) => void;
}

const AdminRates: React.FC<AdminRatesProps> = ({ savingsRates, setSavingsRates, depositoRates, setDepositoRates }) => {
    const handleSavingsRateChange = (id: number, field: keyof InterestRate, value: string) => setSavingsRates(savingsRates.map(r => r._id === id ? { ...r, [field]: value } : r));
    const addSavingsRate = () => setSavingsRates([...savingsRates, { product: 'Produk Baru', rate: '0%', _id: Date.now() }]);
    const removeSavingsRate = (id: number) => setSavingsRates(savingsRates.filter(r => r._id !== id));

    const handleDepositoChange = (id: number, field: keyof DepositoRate, value: string) => setDepositoRates(depositoRates.map(d => d._id === id ? { ...d, [field]: value } : d));
    const addDeposito = () => setDepositoRates([...depositoRates, { tenor: 'Jangka Waktu Baru', rate: '0% p.a.', _id: Date.now() }]);
    const removeDeposito = (id: number) => setDepositoRates(depositoRates.filter(d => d._id !== id));

    return (
        <div className="grid md:grid-cols-2 gap-8">
            <section>
                <h3 className="text-xl font-semibold mb-4 text-amber-400">Suku Bunga Tabungan</h3>
                <div className="space-y-2">{savingsRates.map((item) => (
                    <div key={item._id} className="flex gap-2">
                        <input className="flex-1 bg-slate-800 p-2 rounded border border-slate-700" value={item.product} onChange={e => handleSavingsRateChange(item._id, 'product', e.target.value)} />
                        <input className="w-24 bg-slate-800 p-2 rounded border border-slate-700" value={item.rate} onChange={e => handleSavingsRateChange(item._id, 'rate', e.target.value)} />
                        <button onClick={() => removeSavingsRate(item._id)} className="text-red-500 px-2">&times;</button>
                    </div>))}
                    <button onClick={addSavingsRate} className="text-xs text-blue-400 mt-2">+ Tambah</button>
                </div>
            </section>
            <section>
                <h3 className="text-xl font-semibold mb-4 text-amber-400">Suku Bunga Deposito</h3>
                <div className="space-y-2">{depositoRates.map((item) => (
                    <div key={item._id} className="flex gap-2">
                        <input className="flex-1 bg-slate-800 p-2 rounded border border-slate-700" value={item.tenor} onChange={e => handleDepositoChange(item._id, 'tenor', e.target.value)} />
                        <input className="w-24 bg-slate-800 p-2 rounded border border-slate-700" value={item.rate} onChange={e => handleDepositoChange(item._id, 'rate', e.target.value)} />
                        <button onClick={() => removeDeposito(item._id)} className="text-red-500 px-2">&times;</button>
                    </div>))}
                    <button onClick={addDeposito} className="text-xs text-blue-400 mt-2">+ Tambah</button>
                </div>
            </section>
        </div>
    );
};

export default AdminRates;
