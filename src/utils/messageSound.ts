// ============================================================================
//  Messenger-style notification sound using Web Audio API
//  Syntetyczny dzwiek "pop" podobny do Messengera — bez plikow audio
// ============================================================================

let audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  try {
    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // Resume if suspended (autoplay policy)
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
};

/**
 * Plays a short, pleasant "pop" notification sound similar to Messenger.
 * Uses two layered oscillators for a rich, recognizable tone.
 */
export const playMessageReceivedSound = (): void => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // ── Master gain ──
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.3, now);
  master.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
  master.connect(ctx.destination);

  // ── Tone 1: Main "pop" (higher pitch) ──
  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(880, now);          // A5
  osc1.frequency.exponentialRampToValueAtTime(587, now + 0.08); // slide down to D5

  const gain1 = ctx.createGain();
  gain1.gain.setValueAtTime(0.4, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  osc1.connect(gain1);
  gain1.connect(master);
  osc1.start(now);
  osc1.stop(now + 0.15);

  // ── Tone 2: Harmonic body (lower, warmer) ──
  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(587, now + 0.03);   // D5, slight delay
  osc2.frequency.exponentialRampToValueAtTime(440, now + 0.12); // slide to A4

  const gain2 = ctx.createGain();
  gain2.gain.setValueAtTime(0.25, now + 0.03);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

  osc2.connect(gain2);
  gain2.connect(master);
  osc2.start(now + 0.03);
  osc2.stop(now + 0.22);
};

/**
 * Plays a subtle "sent" sound — shorter and quieter than received.
 */
export const playMessageSentSound = (): void => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, now);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.06);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.08);
};
