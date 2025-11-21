import type { KreditPromo, InterestRate, DepositoRate, QueueState, AudioSettings } from '../types';

interface AdminData {
    logo: string | null;
    promos: KreditPromo[];
    carousel: string[];
    savings: InterestRate[];
    deposito: DepositoRate[];
    queue: QueueState;
    audio: AudioSettings;
}

export const saveAdminData = async (data: AdminData): Promise<void> => {
    const apiUrl = `/api/data`;

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`Failed to save data: ${response.statusText}`);
    }
};
