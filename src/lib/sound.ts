"use client";

/**
 * Web Audio API Sound Synthesizer — Zero External Assets Required
 * Produces crystal clear, instant, offline-capable chimes and bells.
 * 
 * User-Gesture Guard: AudioContext is created lazily but also pre-unlocked
 * via the first user interaction on the page, preventing silent failures
 * on iOS Safari and Chrome autoplay policy.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private unlocked = false;

  constructor() {
    // Register a one-time gesture listener to pre-warm AudioContext
    // This resolves the iOS Safari / Chrome "autoplay blocked" issue entirely
    if (typeof window !== "undefined") {
      const unlock = () => {
        if (this.unlocked) return;
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        try {
          if (!this.ctx) {
            this.ctx = new AudioCtx();
          }
          // Resume if suspended — required on iOS after page load
          if (this.ctx.state === "suspended") {
            this.ctx.resume().then(() => {
              this.unlocked = true;
            }).catch(() => {});
          } else {
            this.unlocked = true;
          }
          // Create and immediately stop a silent buffer to fully unlock the context
          const buffer = this.ctx.createBuffer(1, 1, 22050);
          const source = this.ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(this.ctx.destination);
          source.start(0);
          source.stop(0.001);
        } catch (e) {
          // Silently fail — audio is a nice-to-have enhancement
        }
      };

      // Listen on the first user gesture across all common event types
      const gestureEvents = ["touchstart", "touchend", "mousedown", "keydown", "click"];
      gestureEvents.forEach((evt) => {
        window.addEventListener(evt, unlock, { once: true, passive: true });
      });
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    // Always attempt resume in case it got suspended again
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Pleasant 2-Tone Airport/Hospital Chime (Ding-Dong) for Token Call
   * Frequencies: E5 (659.25 Hz) → C5 (523.25 Hz)
   */
  public playChime() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Note 1: E5 (659.25 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.0, now);
      gain1.gain.linearRampToValueAtTime(0.45, now + 0.01); // Soft attack to avoid click
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 1.2);

      // Note 2: C5 (523.25 Hz) - Slightly delayed for "ding-dong" feel
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(523.25, now + 0.35);
      gain2.gain.setValueAtTime(0.0, now + 0.35);
      gain2.gain.linearRampToValueAtTime(0.5, now + 0.36);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.35);
      osc2.stop(now + 1.8);
    } catch (e) {
      console.warn("Audio play blocked or unavailable", e);
    }
  }

  /**
   * Soft Reception Bell Ring for New Check-in / Booking
   * Frequency: C6 (1046.5 Hz) — bright, attention-grabbing but pleasant
   */
  public playBell() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1046.5, now); // C6
      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.005); // Sharp attack
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.8);
    } catch (e) {
      console.warn("Bell audio blocked", e);
    }
  }

  /**
   * Urgent 3-pulse alert for "Your Turn NOW" scenarios
   * Used when turn_called status fires
   */
  public playUrgentAlert() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      [0, 0.3, 0.6].forEach((offset) => {
        const now = ctx.currentTime + offset;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(880, now); // A5
        gain.gain.setValueAtTime(0.0, now);
        gain.gain.linearRampToValueAtTime(0.4, now + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      });
    } catch (e) {
      console.warn("Urgent alert audio blocked", e);
    }
  }

  /**
   * Device Vibration Pattern
   * @param pattern - Array of [on, off, on...] durations in milliseconds
   */
  public vibrate(pattern: number[] = [300, 100, 300]) {
    if (typeof window !== "undefined" && "navigator" in window && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  }
}

export const soundEngine = new SoundEngine();
