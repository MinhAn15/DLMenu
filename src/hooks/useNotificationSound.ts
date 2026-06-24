import { useCallback, useRef, useEffect, useState } from 'react';

export function useNotificationSound() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    // Sync state from localStorage
    const savedState = localStorage.getItem('audio_notification_enabled');
    if (savedState !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsSoundEnabled(savedState === 'true');
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'audio_notification_enabled') {
        setIsSoundEnabled(e.newValue === 'true');
      }
    };
    
    // Custom event for same-window sync
    const handleCustomEvent = (e: Event) => {
      setIsSoundEnabled((e as CustomEvent).detail === 'true');
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('audio-toggle', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('audio-toggle', handleCustomEvent);
    };
  }, []);

  const toggleSound = useCallback(() => {
    const newState = !isSoundEnabled;
    setIsSoundEnabled(newState);
    localStorage.setItem('audio_notification_enabled', String(newState));
    window.dispatchEvent(new CustomEvent('audio-toggle', { detail: String(newState) }));
  }, [isSoundEnabled]);

  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current && isSoundEnabled) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
    };
    
    window.addEventListener('click', initAudio, { once: true });
    window.addEventListener('touchstart', initAudio, { once: true });
    
    return () => {
      window.removeEventListener('click', initAudio);
      window.removeEventListener('touchstart', initAudio);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isSoundEnabled]);

  const playDingDong = useCallback(() => {
    if (!isSoundEnabled || !audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const t = ctx.currentTime;
    
    // First tone (Ding)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, t); // A5
    gain1.gain.setValueAtTime(0, t);
    gain1.gain.linearRampToValueAtTime(0.5, t + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.5);

    // Second tone (Dong)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, t + 0.3); // E5
    gain2.gain.setValueAtTime(0, t + 0.3);
    gain2.gain.linearRampToValueAtTime(0.5, t + 0.35);
    gain2.gain.exponentialRampToValueAtTime(0.01, t + 1.0);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(t + 0.3);
    osc2.stop(t + 1.0);
  }, [isSoundEnabled]);

  return { playDingDong, isSoundEnabled, toggleSound };
}
