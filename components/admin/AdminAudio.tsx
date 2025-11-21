import React from 'react';
import type { AudioSettings } from '../../types';

interface AdminAudioProps {
    audioSettings: AudioSettings;
    setAudioSettings: (settings: AudioSettings) => void;
    availableVoices: SpeechSynthesisVoice[];
    testVoice: () => void;
}

const AdminAudio: React.FC<AdminAudioProps> = ({ audioSettings, setAudioSettings, availableVoices, testVoice }) => {
    const handleAudioSettingChange = (field: keyof AudioSettings, value: string | number) => {
        setAudioSettings({ ...audioSettings, [field]: Number(value) });
    };

    const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setAudioSettings({ ...audioSettings, voiceURI: e.target.value });
    };

    return (
        <section className="bg-slate-800/40 p-6 rounded-xl border border-slate-700">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-4"><span className="bg-pink-500 w-2 h-6 rounded-full inline-block"></span>Suara Pengumuman</h3>
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-300 mb-1">Suara (Voice)</label>
                        <select className="w-full bg-slate-700 p-2 rounded border border-slate-600" value={audioSettings.voiceURI} onChange={handleVoiceChange}>
                            {availableVoices.map(v => <option key={v.voiceURI} value={v.voiceURI}>{v.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-300 mb-1 flex justify-between"><span>Pitch</span> <span>{audioSettings.pitch}</span></label>
                        <input type="range" min="0.5" max="2" step="0.1" value={audioSettings.pitch} onChange={(e) => handleAudioSettingChange('pitch', e.target.value)} className="w-full accent-pink-500" />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-300 mb-1 flex justify-between"><span>Kecepatan (Rate)</span> <span>{audioSettings.rate}</span></label>
                        <input type="range" min="0.5" max="2" step="0.1" value={audioSettings.rate} onChange={(e) => handleAudioSettingChange('rate', e.target.value)} className="w-full accent-pink-500" />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-300 mb-1 flex justify-between"><span>Volume</span> <span>{audioSettings.volume}</span></label>
                        <input type="range" min="0" max="1" step="0.1" value={audioSettings.volume} onChange={(e) => handleAudioSettingChange('volume', e.target.value)} className="w-full accent-pink-500" />
                    </div>
                </div>
                <div className="flex items-end"><button onClick={testVoice} className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded w-full h-12 font-bold">Test Suara</button></div>
            </div>
        </section>
    );
};

export default AdminAudio;
