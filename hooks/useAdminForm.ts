import { useState, useEffect } from 'react';
import type { KreditPromo, InterestRate, DepositoRate, QueueState, AudioSettings } from '../types';
import { announceQueue } from '../utils/audio';
import { saveAdminData } from '../services/adminService';

// Helper types to add a temporary unique ID for React keys
export type WithId<T> = T & { _id: number };

// Function to add unique IDs to array items
export const addIds = <T,>(arr: T[]): WithId<T>[] => arr.map((item, index) => ({ ...item, _id: Math.random() * 1000000 + index }));
// A simpler version for string arrays
export const addIdsToStrings = (arr: string[]): WithId<{ value: string }>[] => arr.map((item, index) => ({ value: item, _id: Math.random() * 1000000 + index }));

interface UseAdminFormProps {
    kreditPromos: KreditPromo[];
    savingsRates: InterestRate[];
    depositoRates: DepositoRate[];
    promoImages: string[];
    queueState: QueueState;
    logoUrl: string | null;
    audioSettings: AudioSettings;
    onClose: () => void;
}

export const useAdminForm = (props: UseAdminFormProps) => {
    // Local state for form editing, with unique IDs for stable keys
    const [localPromos, setLocalPromos] = useState<WithId<KreditPromo>[]>(addIds(props.kreditPromos));
    const [localSavingsRates, setLocalSavingsRates] = useState<WithId<InterestRate>[]>(addIds(props.savingsRates));
    const [localDepositoRates, setLocalDepositoRates] = useState<WithId<DepositoRate>[]>(addIds(props.depositoRates));
    const [localImages, setLocalImages] = useState<WithId<{ value: string }>[]>(addIdsToStrings(props.promoImages));
    const [localLogo, setLocalLogo] = useState<string | null>(props.logoUrl);
    const [localQueue, setLocalQueue] = useState<QueueState>(props.queueState);
    const [localAudioSettings, setLocalAudioSettings] = useState<AudioSettings>(props.audioSettings);

    const [isSaving, setIsSaving] = useState(false);
    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

    // This effect now correctly re-initializes the local state (with new IDs) if the underlying props change
    useEffect(() => {
        setLocalPromos(addIds(props.kreditPromos));
        setLocalSavingsRates(addIds(props.savingsRates));
        setLocalDepositoRates(addIds(props.depositoRates));
        setLocalImages(addIdsToStrings(props.promoImages));
        setLocalLogo(props.logoUrl);
        setLocalQueue(props.queueState);
        setLocalAudioSettings(props.audioSettings);
    }, [props.kreditPromos, props.savingsRates, props.depositoRates, props.promoImages, props.logoUrl, props.queueState, props.audioSettings]);

    useEffect(() => {
        const updateVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            setAvailableVoices(voices);
            if (voices.length > 0 && !localAudioSettings.voiceURI) {
                const indoVoice = voices.find(v => v.lang === 'id-ID' && v.name.includes('Google')) || voices.find(v => v.lang === 'id-ID');
                if (indoVoice) setLocalAudioSettings(prev => ({ ...prev, voiceURI: indoVoice.voiceURI }));
            }
        };
        updateVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) window.speechSynthesis.onvoiceschanged = updateVoices;
    }, [localAudioSettings.voiceURI]);

    const updateQueue = (type: 'teller' | 'cs', delta: number) => {
        const currentVal = localQueue[type];
        const newVal = Math.max(0, currentVal + delta);
        const newQueueState = { ...localQueue, [type]: newVal };
        setLocalQueue(newQueueState);

        const prefix = newQueueState.teller > newQueueState.cs ? 'A' : 'B';
        const location = newQueueState.teller > newQueueState.cs ? 'Loket Satu' : 'Meja Customer Service';

        if (delta > 0) announceQueue(prefix, newVal, location, localAudioSettings);
    };

    const recallQueue = (type: 'teller' | 'cs') => {
        const currentVal = localQueue[type];
        const prefix = localQueue.teller > localQueue.cs ? 'A' : 'B';
        const location = localQueue.teller > localQueue.cs ? 'Loket Satu' : 'Meja Customer Service';
        if (currentVal > 0) announceQueue(prefix, currentVal, location, localAudioSettings);
    };

    const resetQueue = (type: 'teller' | 'cs') => {
        if (confirm(`Reset antrian ${type === 'teller' ? 'Teller' : 'CS'} ke 0?`)) {
            setLocalQueue(prev => ({ ...prev, [type]: 0 }));
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const dataToSave = {
                logo: localLogo,
                promos: localPromos.map(({ _id, ...rest }) => rest), // Strip temporary _id before saving
                carousel: localImages.map(i => i.value).filter(img => img.trim() !== ''),
                savings: localSavingsRates.map(({ _id, ...rest }) => rest),
                deposito: localDepositoRates.map(({ _id, ...rest }) => rest),
                queue: localQueue,
                audio: localAudioSettings,
            };
            await saveAdminData(dataToSave);
            alert("Data berhasil disimpan di server!");
            props.onClose();
        } catch (error) {
            console.error("Save failed:", error);
            alert("Terjadi kesalahan saat menyimpan data ke server.");
        } finally {
            setIsSaving(false);
        }
    };

    return {
        localPromos, setLocalPromos,
        localSavingsRates, setLocalSavingsRates,
        localDepositoRates, setLocalDepositoRates,
        localImages, setLocalImages,
        localLogo, setLocalLogo,
        localQueue, setLocalQueue,
        localAudioSettings, setLocalAudioSettings,
        isSaving,
        availableVoices,
        updateQueue,
        recallQueue,
        resetQueue,
        handleSave
    };
};
