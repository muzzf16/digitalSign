import React from 'react';
import type { KreditPromo, InterestRate, DepositoRate, QueueState, AudioSettings } from '../types';
import { useAdminForm } from '../hooks/useAdminForm';
import AdminBranding from './admin/AdminBranding';
import AdminQueue from './admin/AdminQueue';
import AdminAudio from './admin/AdminAudio';
import AdminPromos from './admin/AdminPromos';
import AdminCarousel from './admin/AdminCarousel';
import AdminRates from './admin/AdminRates';

interface AdminPanelProps {
    kreditPromos: KreditPromo[];
    savingsRates: InterestRate[];
    depositoRates: DepositoRate[];
    promoImages: string[];
    queueState: QueueState;
    logoUrl: string | null;
    audioSettings: AudioSettings;
    onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = (props) => {
    const { onClose } = props;
    const {
        localPromos, setLocalPromos,
        localSavingsRates, setLocalSavingsRates,
        localDepositoRates, setLocalDepositoRates,
        localImages, setLocalImages,
        localLogo, setLocalLogo,
        localQueue,
        localAudioSettings, setLocalAudioSettings,
        isSaving,
        availableVoices,
        updateQueue,
        recallQueue,
        resetQueue,
        handleSave
    } = useAdminForm(props);

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-[#162842] w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col border border-slate-700">
                <header className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-800/50 rounded-t-2xl">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Panel Admin</h2>
                        <p className="text-slate-400 text-sm">Konfigurasi Konten & Tampilan (Tersinkronisasi)</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-2 hover:bg-white/10 rounded-full transition-all"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </header>
                <main className="flex-1 p-6 overflow-y-auto space-y-8 text-white custom-scrollbar">
                    <AdminBranding logo={localLogo} setLogo={setLocalLogo} />
                    <AdminQueue queue={localQueue} updateQueue={updateQueue} resetQueue={resetQueue} recallQueue={recallQueue} />
                    <AdminAudio audioSettings={localAudioSettings} setAudioSettings={setLocalAudioSettings} availableVoices={availableVoices} testVoice={() => updateQueue('teller', 0)} />
                    <AdminPromos promos={localPromos} setPromos={setLocalPromos} />
                    <AdminCarousel images={localImages} setImages={setLocalImages} />
                    <AdminRates savingsRates={localSavingsRates} setSavingsRates={setLocalSavingsRates} depositoRates={localDepositoRates} setDepositoRates={setLocalDepositoRates} />
                </main>
                <footer className="p-5 border-t border-slate-700 flex justify-between items-center bg-slate-800/50 rounded-b-2xl">
                    <p className="text-xs text-slate-500">Menyimpan data ke server pusat.</p>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-6 py-2 rounded bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors">Batal</button>
                        <button onClick={handleSave} disabled={isSaving} className="px-8 py-2 rounded bg-green-600 hover:bg-green-500 text-white font-bold shadow-lg hover:shadow-green-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                            {isSaving ? (<><svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Menyimpan...</>) : 'Simpan Perubahan'}
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default AdminPanel;
