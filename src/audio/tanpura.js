// Authentic Acoustic Carnatic Tanpura Drone Engine - Tanpura Droid Edition
//
// Features:
// - Authentic acoustic recordings across all 12 chromatic pitches (PaSaSaSa & MaSaSaSa)
// - First String Selection: Pa (Panchama), Ma (Madhyama), Ni (Nishadha), Sa (Shadja)
// - Base Pitch selection: C, C#, D, D#, E, F, F#, G, G#, A, A#, B
// - Pitch Semi: +/- semitone transposition (-6 to +6) with automatic audio file switching
// - Pitch Fine (Micro-tuning in Cents): -50 to +50 cents fine detuning
// - Pause After plucking rhythm: 'First & Last', 'None', 'First', 'Last'
// - Plucking Speed / Tempo: 0.6x to 1.6x
// - Master Volume & Mute toggle: 0% to 100%
// - Real-time active string pluck tracking (Strings 1, 2, 3, 4)
// - Presets for male (1 to 2.5 Kattai) and female (5 to 6.5 Kattai) vocal ranges

import { hzToMidi } from './notes.js';

export const PITCH_LIST = [
  { name: 'C', file: 'C', kattai: '1 Kattai', midi: 48, defaultHz: 130.81 },
  { name: 'C#', file: 'Ccis', kattai: '1.5 Kattai', midi: 49, defaultHz: 138.59 },
  { name: 'D', file: 'D', kattai: '2 Kattai', midi: 50, defaultHz: 146.83 },
  { name: 'D#', file: 'Dcis', kattai: '2.5 Kattai', midi: 51, defaultHz: 155.56 },
  { name: 'E', file: 'E', kattai: '3 Kattai', midi: 52, defaultHz: 164.81 },
  { name: 'F', file: 'F', kattai: '4 Kattai', midi: 53, defaultHz: 174.61 },
  { name: 'F#', file: 'Fcis', kattai: '4.5 Kattai', midi: 54, defaultHz: 185.00 },
  { name: 'G', file: 'G', kattai: '5 Kattai', midi: 55, defaultHz: 196.00 },
  { name: 'G#', file: 'Gcis', kattai: '5.5 Kattai', midi: 56, defaultHz: 207.65 },
  { name: 'A', file: 'A', kattai: '6 Kattai', midi: 57, defaultHz: 220.00 },
  { name: 'A#', file: 'Acis', kattai: '6.5 Kattai', midi: 58, defaultHz: 233.08 },
  { name: 'B', file: 'B', kattai: '7 Kattai', midi: 59, defaultHz: 246.94 },
];

export const VOCAL_PRESETS = [
  { label: 'Male C (1)', pitchName: 'C', pitchSemi: 0, pitchCents: 0, type: 'male' },
  { label: 'Male C# (1.5)', pitchName: 'C#', pitchSemi: 0, pitchCents: 0, type: 'male' },
  { label: 'Male D (2)', pitchName: 'D', pitchSemi: 0, pitchCents: 0, type: 'male' },
  { label: 'Male D# (2.5)', pitchName: 'D#', pitchSemi: 0, pitchCents: 0, type: 'male' },
  { label: 'Female G (5)', pitchName: 'G', pitchSemi: 0, pitchCents: 0, type: 'female' },
  { label: 'Female G# (5.5)', pitchName: 'G#', pitchSemi: 0, pitchCents: 0, type: 'female' },
  { label: 'Female A (6)', pitchName: 'A', pitchSemi: 0, pitchCents: 0, type: 'female' },
  { label: 'Female A# (6.5)', pitchName: 'A#', pitchSemi: 0, pitchCents: 0, type: 'female' },
];

class AcousticTanpuraDrone {
  constructor() {
    this.audioElement = null;
    this.isPlaying = false;
    this.tonicHz = 138.59; // C# default

    // Configurable controls
    this.firstString = 'Pa'; // 'Pa' | 'Ma' | 'Ni' | 'Sa'
    this.pauseAfter = 'First & Last'; // 'First & Last' | 'None' | 'First' | 'Last'
    this.notation = 'Western'; // 'Western' | 'Kattai'
    this.pitchIndex = 1; // 1 = C#
    this.pitchSemi = 0; // -6 to +6 semitones offset
    this.pitchCents = 0; // -50 to +50 fine cents tuning
    this.speed = 1.0; // 0.6 to 1.6
    this.volume = 0.75; // 0 to 1
    this.isMuted = false;

    // Real-time string plucking animation tracker
    this.activeString = 0; // 0: First (Pa/Ma/Ni/Sa), 1: Sa, 2: Sa, 3: Mandra Sa
    this.pluckAnimationTimer = null;

    this.currentUrl = '';
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    const st = this.getState();
    for (const listener of this.listeners) {
      listener(st);
    }
  }

  getEffectivePitchIndex() {
    return ((this.pitchIndex + this.pitchSemi) % 12 + 12) % 12;
  }

  getEffectivePitch() {
    return PITCH_LIST[this.getEffectivePitchIndex()];
  }

  getEffectiveHz() {
    const baseHz = PITCH_LIST[this.pitchIndex].defaultHz;
    // Shift by semitones and micro-cents
    const totalCents = this.pitchSemi * 100 + this.pitchCents;
    return baseHz * Math.pow(2, totalCents / 1200);
  }

  getState() {
    return {
      isPlaying: this.isPlaying,
      firstString: this.firstString,
      pauseAfter: this.pauseAfter,
      notation: this.notation,
      pitchIndex: this.pitchIndex,
      currentPitch: PITCH_LIST[this.pitchIndex],
      effectivePitch: this.getEffectivePitch(),
      effectivePitchIndex: this.getEffectivePitchIndex(),
      pitchSemi: this.pitchSemi,
      pitchCents: this.pitchCents,
      speed: this.speed,
      volume: this.volume,
      isMuted: this.isMuted,
      effectiveHz: this.getEffectiveHz(),
      activeString: this.activeString,
    };
  }

  getAudioUrl() {
    const base = import.meta.env?.BASE_URL || './';
    const cleanBase = base.endsWith('/') ? base : `${base}/`;
    const folder = this.firstString === 'Ma' ? 'MaSaSaSa' : 'PaSaSaSa';
    const effectivePInfo = this.getEffectivePitch();
    return `${cleanBase}audio/tanpura/${folder}/tanpura_${effectivePInfo.file}.mp3`;
  }

  initAudio() {
    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.loop = true;
      this.audioElement.preload = 'auto';
      // Disable pitch preservation so micro-cent playbackRate changes accurately detune the drone
      this.audioElement.preservesPitch = false;
      if ('mozPreservesPitch' in this.audioElement) this.audioElement.mozPreservesPitch = false;
      if ('webkitPreservesPitch' in this.audioElement) this.audioElement.webkitPreservesPitch = false;
    }
  }

  updatePlaybackParameters() {
    if (!this.audioElement) return;

    // Detune slightly by micro-cents using playbackRate
    const centFactor = Math.pow(2, this.pitchCents / 1200);
    const totalRate = Math.max(0.4, Math.min(2.0, this.speed * centFactor));

    this.audioElement.playbackRate = totalRate;
    this.audioElement.volume = this.isMuted ? 0 : Math.max(0, Math.min(1, this.volume));
  }

  applyAudioSource(preserveTime = true) {
    if (!this.audioElement) return;
    const targetUrl = this.getAudioUrl();

    if (this.currentUrl !== targetUrl) {
      this.currentUrl = targetUrl;
      const prevTime = preserveTime ? this.audioElement.currentTime : 0;
      this.audioElement.src = targetUrl;
      this.updatePlaybackParameters();

      if (this.isPlaying) {
        const onLoaded = () => {
          if (preserveTime && prevTime > 0 && prevTime < this.audioElement.duration) {
            try {
              this.audioElement.currentTime = prevTime;
            } catch (_) {}
          }
          this.audioElement.play().catch(() => {});
        };

        this.audioElement.addEventListener('loadedmetadata', onLoaded, { once: true });
        this.audioElement.load();
        this.audioElement.play().catch(() => {});
      }
    } else {
      this.updatePlaybackParameters();
    }
  }

  // Pluck animation loop tracking active string in the 4-string cycle
  startPluckTracker() {
    this.stopPluckTracker();
    const cycleDuration = 5.64 / this.speed; // Typical acoustic cycle duration (~5.64s)
    const pluckDuration = cycleDuration / 4;

    this.pluckAnimationTimer = setInterval(() => {
      if (!this.audioElement || !this.isPlaying) return;
      const t = this.audioElement.currentTime;
      const cycleTime = t % cycleDuration;
      const newActive = Math.floor(cycleTime / pluckDuration) % 4;

      if (newActive !== this.activeString) {
        this.activeString = newActive;
        this.notify();
      }
    }, 120);
  }

  stopPluckTracker() {
    if (this.pluckAnimationTimer) {
      clearInterval(this.pluckAnimationTimer);
      this.pluckAnimationTimer = null;
    }
    this.activeString = 0;
  }

  // --- Control setters ---

  setFirstString(type) {
    if (['Pa', 'Ma', 'Ni', 'Sa'].includes(type)) {
      this.firstString = type;
      this.applyAudioSource(true);
      this.notify();
    }
  }

  setPauseAfter(val) {
    this.pauseAfter = val;
    this.notify();
  }

  setNotation(val) {
    this.notation = val;
    this.notify();
  }

  setPitchIndex(idx) {
    if (idx >= 0 && idx < PITCH_LIST.length) {
      this.pitchIndex = idx;
      this.pitchSemi = 0; // Reset semitone shift on new base pitch selection
      this.pitchCents = 0; // Reset cents
      this.applyAudioSource(true);
      this.notify();
    }
  }

  setPitchSemi(semi) {
    const clamped = Math.max(-6, Math.min(6, semi));
    if (this.pitchSemi !== clamped) {
      this.pitchSemi = clamped;
      this.applyAudioSource(true);
      this.notify();
    }
  }

  adjustPitchSemi(delta) {
    this.setPitchSemi(this.pitchSemi + delta);
  }

  setPitchCents(cents) {
    const clamped = Math.max(-50, Math.min(50, cents));
    if (this.pitchCents !== clamped) {
      this.pitchCents = clamped;
      this.updatePlaybackParameters();
      this.notify();
    }
  }

  adjustPitchCents(delta) {
    this.setPitchCents(this.pitchCents + delta);
  }

  setSpeed(spd) {
    this.speed = Math.max(0.5, Math.min(1.8, spd));
    this.updatePlaybackParameters();
    this.notify();
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    this.isMuted = false;
    this.updatePlaybackParameters();
    this.notify();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.updatePlaybackParameters();
    this.notify();
  }

  applyPreset(preset) {
    const pIdx = PITCH_LIST.findIndex((p) => p.name === preset.pitchName);
    if (pIdx !== -1) {
      this.pitchIndex = pIdx;
      this.pitchSemi = preset.pitchSemi || 0;
      this.pitchCents = preset.pitchCents || 0;
      this.applyAudioSource(true);
      this.notify();
    }
  }

  /**
   * Sync tonic from external microphone or TonicBar.
   * If the incoming Hz is already within 0.25 Hz of our effectiveHz, ignore to prevent circular feedback!
   */
  setTonicFromMic(hz) {
    if (!hz || hz <= 0) return;
    if (Math.abs(hz - this.getEffectiveHz()) < 0.25) {
      return;
    }
    this.tonicHz = hz;
    const midi = hzToMidi(hz);
    const pitchClass = ((Math.round(midi) % 12) + 12) % 12;
    this.pitchIndex = pitchClass;
    this.pitchSemi = 0;
    this.pitchCents = 0;
    this.applyAudioSource(true);
    this.notify();
  }

  start() {
    this.initAudio();
    this.applyAudioSource(false);
    this.updatePlaybackParameters();

    const p = this.audioElement.play();
    if (p !== undefined) {
      p.then(() => {
        this.isPlaying = true;
        this.startPluckTracker();
        this.notify();
      }).catch((e) => {
        console.warn('Tanpura autoplay deferred:', e);
        this.isPlaying = false;
        this.notify();
      });
    }
    this.isPlaying = true;
    this.startPluckTracker();
    this.notify();
  }

  stop() {
    this.isPlaying = false;
    this.stopPluckTracker();
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    this.notify();
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }
}

export const tanpura = new AcousticTanpuraDrone();
