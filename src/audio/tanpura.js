// Authentic Acoustic Carnatic Tanpura Drone Engine
//
// Supports full real-time acoustic controls:
// - First String: Pa (Panchamam), Ma (Madhyamam), Ni (Nishadham)
// - Pause After: First & Last, None, First, Last
// - Pitch selection (C, C#, D, D#, E, F, F#, G, G#, A, A#, B)
// - Pitch Semi: +/- semitone fine pitch shift using authentic acoustic audio files
// - Speed (Tempo slider): 0.6x to 1.6x
// - Volume: 0% to 100%

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

class AcousticTanpuraDrone {
  constructor() {
    this.audioElement = null;
    this.isPlaying = false;
    this.tonicHz = 138.59; // C# default

    // Configurable controls
    this.firstString = 'Pa'; // 'Pa' | 'Ma' | 'Ni'
    this.pauseAfter = 'First & Last'; // 'First & Last' | 'None' | 'First' | 'Last'
    this.notation = 'Western'; // 'Western' | 'Kattai'
    this.pitchIndex = 1; // 1 = C#
    this.pitchSemi = 0; // -6 to +6 semitones offset
    this.speed = 1.0; // 0.6 to 1.6
    this.volume = 0.65; // 0 to 1

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
    // Shift by pitchSemi semitones
    return baseHz * Math.pow(2, this.pitchSemi / 12);
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
      speed: this.speed,
      volume: this.volume,
      effectiveHz: this.getEffectiveHz(),
    };
  }

  getAudioUrl() {
    const base = import.meta.env?.BASE_URL || './';
    const cleanBase = base.endsWith('/') ? base : `${base}/`;
    const folder = this.firstString === 'Ma' ? 'MaSaSaSa' : 'PaSaSaSa';
    // Use the effective pitch audio recording so pitchSemi accurately switches pitch!
    const effectivePInfo = this.getEffectivePitch();
    return `${cleanBase}audio/tanpura/${folder}/tanpura_${effectivePInfo.file}.mp3`;
  }

  initAudio() {
    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.loop = true;
      this.audioElement.preload = 'auto';
    }
  }

  updatePlaybackParameters() {
    if (!this.audioElement) return;
    // Speed slider controls pure playback tempo
    this.audioElement.playbackRate = Math.max(0.5, Math.min(1.8, this.speed));
    this.audioElement.volume = Math.max(0, Math.min(1, this.volume));
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

  // --- Control setters ---

  setFirstString(type) {
    if (['Pa', 'Ma', 'Ni'].includes(type)) {
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

  /**
   * Set base pitch from dropdown.
   * Resets pitchSemi to 0 so the chosen note sounds cleanly at 0 offset.
   */
  setPitchIndex(idx) {
    if (idx >= 0 && idx < PITCH_LIST.length) {
      this.pitchIndex = idx;
      this.pitchSemi = 0; // Reset semitone shift when user selects a new base pitch
      this.applyAudioSource(true);
      this.notify();
    }
  }

  /**
   * Set semitone offset (-6 to +6).
   * Switches audio source to the exact shifted chromatic sample.
   */
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

  setSpeed(spd) {
    this.speed = Math.max(0.5, Math.min(1.8, spd));
    this.updatePlaybackParameters();
    this.notify();
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }
    this.notify();
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
        this.notify();
      }).catch((e) => {
        console.warn('Tanpura autoplay deferred:', e);
        this.isPlaying = false;
        this.notify();
      });
    }
    this.isPlaying = true;
    this.notify();
  }

  stop() {
    this.isPlaying = false;
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
