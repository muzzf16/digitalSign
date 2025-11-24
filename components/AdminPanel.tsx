import React, { useEffect, useCallback } from 'react';
import type { KreditPromo, InterestRate, DepositoRate, QueueState, AudioSettings } from '../types';
import { useAdminForm } from '../hooks/useAdminForm';
import { Button } from './ui';
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

/**
 * Admin Panel component for managing content and display settings
 * @component
 */
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

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape' && !isSaving) {
            onClose();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (!isSaving) {
                handleSave();
            }
        }
    }, [onClose, handleSave, isSaving]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [handleKeyDown]);

    return (
        <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-panel-title"
        >
            <div className="bg-[#162842] w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col border border-slate-700">
                <header className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-800/50 rounded-t-2xl">
                    <div>
                        <h2 id="admin-panel-title" className="text-2xl font-bold text-white">Panel Admin</h2>
                        <p className="text-slate-400 text-sm">
                            Konfigurasi Konten & Tampilan (Tersinkronisasi)
                            <span className="ml-2 text-xs text-blue-400">• ESC untuk tutup • Ctrl+S untuk simpan</span>
                        </p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-white p-2 hover:bg-white/10 rounded-full transition-all"
                        aria-label="Tutup panel admin"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
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
                        <Button 
                            onClick={onClose} 
                            variant="ghost" 
                            size="lg"
                            aria-label="Batal perubahan"
                        >
                            Batal
                        </Button>
                        <Button 
                            onClick={handleSave} 
                            loading={isSaving}
                            disabled={isSaving}
                            variant="primary" 
                            size="lg"
                            aria-label="Simpan semua perubahan"
                        >
                            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default AdminPanel;
