
import type { AudioSettings } from '../types';

const DEFAULT_SETTINGS: AudioSettings = {
  voiceURI: '',
  pitch: 1.1, // Default Flight Attendant Pitch
  rate: 0.85, // Default Flight Attendant Rate
  volume: 1.0
};

export const getAudioSettings = (): AudioSettings => {
  try {
    const stored = localStorage.getItem('bpr_audio_settings');
    if (stored) {
      // Merge stored settings with default to ensure all fields exist
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error("Error reading audio settings", e);
  }
  return DEFAULT_SETTINGS;
};

export const saveAudioSettings = (settings: AudioSettings) => {
  try {
      localStorage.setItem('bpr_audio_settings', JSON.stringify(settings));
      console.log("Audio settings saved:", settings);
  } catch (e) {
      console.error("Failed to save audio settings", e);
  }
};

export const playChime = async (): Promise<void> => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;

  const ctx = new AudioContext();
  const t = ctx.currentTime;

  // Helper to play a tone
  const playTone = (freq: number, startTime: number, duration: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;
    
    // Envelope (Fade in - Sustain - Fade out)
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.5, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  // Play "Ding-Dong" (High G5 -> Low E5)
  // Nada 1: G5 (783.99 Hz)
  playTone(783.99, t, 1.2);
  // Nada 2: E5 (659.25 Hz) delayed by 0.6s
  playTone(659.25, t + 0.6, 1.5);

  // Return promise that resolves when chime finishes (approx 1.5s)
  return new Promise(resolve => setTimeout(resolve, 1800));
};

/**
 * Helper to wait for voices to be loaded by the browser.
 * Chrome requires onvoiceschanged, otherwise getVoices() returns empty array initially.
 */
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
        
        // Fallback timeout if onvoiceschanged never fires
        setTimeout(() => {
             resolve(window.speechSynthesis.getVoices());
        }, 2000);
    });
};

export const announceQueue = async (prefix: string, number: number, location: string, testSettings?: AudioSettings) => {
  // 1. Play Chime first
  await playChime();

  if (!('speechSynthesis' in window)) return;

  // 2. Wait for voices to load properly
  const voices = await waitForVoices();

  // 3. Prepare Text
  // Format pengucapan yang natural: "Nomor Antrian... A... Seratus Dua... Silakan ke... Loket Satu"
  const text = `Nomor Antrian... ${prefix} ... ${number} ... Silakan menuju ... ${location}`;

  const utterance = new SpeechSynthesisUtterance(text);
  
  // 4. Load Settings (Use provided test settings OR load from storage)
  // IMPORTANT: We fetch fresh settings here to ensure we use the latest saved value
  const settings = testSettings || getAudioSettings();

  utterance.lang = 'id-ID';
  utterance.rate = settings.rate;
  utterance.pitch = settings.pitch;
  utterance.volume = settings.volume;

  // 5. Find Voice based on URI
  let selectedVoice = null;

  // Try to find the specific voice saved in settings
  if (settings.voiceURI) {
    selectedVoice = voices.find(v => v.voiceURI === settings.voiceURI);
  }

  // Fallback logic if saved voice is missing or not set
  if (!selectedVoice) {
     // Priority: Google Indo -> Microsoft Indo -> Any Indo -> First available
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
