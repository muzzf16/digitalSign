import type { AudioSettings } from '../types';

export const playChime = async (): Promise<void> => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;

  const ctx = new AudioContext();
  const t = ctx.currentTime;

  const playTone = (freq: number, startTime: number, duration: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.5, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  playTone(783.99, t, 1.2);
  playTone(659.25, t + 0.6, 1.5);

  return new Promise(resolve => setTimeout(resolve, 1800));
};

const waitForVoices = (): Promise<SpeechSynthesisVoice[]> => {
    return new Promise((resolve) => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            resolve(voices);
            return;
        }
        window.speechSynthesis.onvoiceschanged = () => {
            const updatedVoices = window.speechSynthesis.getVoices();
            resolve(updatedVoices);
        };
        setTimeout(() => resolve(window.speechSynthesis.getVoices()), 2000);
    });
};

export const announceQueue = async (prefix: string, number: number, location: string, settings: AudioSettings) => {
  await playChime();

  if (!('speechSynthesis' in window)) return;

  const voices = await waitForVoices();
  const text = `Nomor Antrian... ${prefix} ... ${number} ... Silakan menuju ... ${location}`;
  const utterance = new SpeechSynthesisUtterance(text);
  
  utterance.lang = 'id-ID';
  utterance.rate = settings.rate;
  utterance.pitch = settings.pitch;
  utterance.volume = settings.volume;

  let selectedVoice = null;
  if (settings.voiceURI) {
    selectedVoice = voices.find(v => v.voiceURI === settings.voiceURI);
  }
  if (!selectedVoice) {
     selectedVoice = voices.find(v => v.lang === 'id-ID' && v.name.includes('Google')) || 
                     voices.find(v => v.lang === 'id-ID' && v.name.includes('Microsoft')) ||
                     voices.find(v => v.lang === 'id-ID');
  }

  if (selectedVoice) {
    utterance.voice = selectedVoice;
    console.log(`Announcing using voice: ${selectedVoice.name}`);
  } else {
    console.warn("No suitable voice found, using system default.");
  }

  window.speechSynthesis.speak(utterance);
};
