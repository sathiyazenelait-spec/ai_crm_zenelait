/**
 * 100% Free Web Audio API Synthetic Chime & Desktop Notification Generator
 * Zero external audio files, Zero network requests, 100% Client-Side.
 */

// Play a pleasant dual-tone harmonic notification chime
export function playNotificationChime(type = 'success') {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (type === 'lead_qualified') {
      // Harmonic alert: D5 (587.33 Hz) -> A5 (880 Hz) -> D6 (1174.66 Hz)
      osc1.frequency.setValueAtTime(587.33, now);
      osc1.frequency.exponentialRampToValueAtTime(880.00, now + 0.15);
      osc1.frequency.exponentialRampToValueAtTime(1174.66, now + 0.35);

      osc2.frequency.setValueAtTime(739.99, now);
      osc2.frequency.exponentialRampToValueAtTime(1108.73, now + 0.25);
    } else {
      // Soft gentle chime: C5 (523.25 Hz) -> G5 (783.99 Hz)
      osc1.frequency.setValueAtTime(523.25, now);
      osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.15);
      osc2.frequency.setValueAtTime(659.25, now + 0.05);
    }

    gainNode.gain.setValueAtTime(0.01, now);
    gainNode.gain.linearRampToValueAtTime(0.35, now + 0.08);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.85);
    osc2.stop(now + 0.85);
  } catch (err) {
    console.warn('AudioContext playback error:', err);
  }
}

// Request and trigger native OS desktop notifications
export async function sendDesktopAlert(title, body, icon = '🔔') {
  if (!('Notification' in window)) return false;

  let permission = Notification.permission;
  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }

  if (permission === 'granted') {
    playNotificationChime('lead_qualified');
    new Notification(`${icon} ${title}`, {
      body: body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200]
    });
    return true;
  }
  return false;
}
