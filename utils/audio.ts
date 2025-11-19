
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

export const announceQueue = async (prefix: string, number: number, location: string) => {
  // 1. Play Chime first
  await playChime();

  if (!('speechSynthesis' in window)) return;

  // 2. Prepare Text
  // Menggunakan ejaan fonetik dan tanda baca untuk jeda alami
  const numberString = String(number).split('').join(' '); // "1 2 3" instead of "seratus..." for clear digit reading, or use normal reading:
  
  // Format pengucapan yang natural: "Nomor Antrian... A... Seratus Dua... Silakan ke... Loket Satu"
  const text = `Nomor Antrian... ${prefix} ... ${number} ... Silakan menuju ... ${location}`;

  const utterance = new SpeechSynthesisUtterance(text);
  
  // 3. Configure Voice (Flight Attendant Style)
  utterance.lang = 'id-ID';
  utterance.rate = 0.85; // Agak lambat, berwibawa
  utterance.pitch = 1.1; // Sedikit lebih tinggi (feminin)
  utterance.volume = 1.0;

  // 4. Find the best "Female" Indonesian voice
  const voices = window.speechSynthesis.getVoices();
  
  // Prioritas: Google Bahasa Indonesia (Chrome) -> Microsoft Gadis (Edge/Windows) -> Default id-ID
  const preferredVoice = voices.find(v => v.lang === 'id-ID' && v.name.includes('Google')) || 
                         voices.find(v => v.lang === 'id-ID' && v.name.includes('Gadis')) ||
                         voices.find(v => v.lang === 'id-ID');

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  window.speechSynthesis.speak(utterance);
};
