// Authentic Acoustic Carnatic Tanpura Drone Engine
//
// Supports full real-time acoustic controls:
// - First String: Pa (Panchamam), Ma (Madhyamam), Ni (Nishadham)
// - Pause After: First & Last, None, First, Last
// - Pitch selection (C, C#, D, D#, E, F, F#, G, G#, A, A#, B)
// - Pitch Semi: +/- semitone fine pitch shift
// - Speed (Tempo slider): 0.6x to 1.6x
// - Volume: 0% to 100%

import { hzToMidi, midiToHz } from './notes.js';

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

    // Configurable controls matching user's spec
    this.firstString = 'Pa'; // 'Pa' | 'Ma' | 'Ni'
    this.pauseAfter = 'First & Last'; // 'First & Last' | 'None' | 'First' | 'Last'
    this.notation = 'Western'; // 'Western' | 'Kattai'
    this.pitchIndex = 1; // 1 = C#
    this.pitchSemi = 0; // -6 to +6
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
    for (const listener of this.listeners) {
      listener(this.getState());
    }
  }

  getState() {
    return {
      isPlaying: this.isPlaying,
      firstString: this.firstString,
      pauseAfter: this.pauseAfter,
      notation: this.notation,
      pitchIndex: this.pitchIndex,
      currentPitch: PITCH_LIST[this.pitchIndex],
      pitchSemi: this.pitchSemi,
      speed: this.speed,
      volume: this.volume,
      effectiveHz: this.getEffectiveHz(),
    };
  }

  getEffectiveHz() {
    const baseHz = PITCH_LIST[this.pitchIndex].defaultHz;
    // Shift by pitchSemi semitones
    return baseHz * Math.pow(2, this.pitchSemi / 12);
  }

  getAudioUrl() {
    const base = import.meta.env?.BASE_URL || './';
    const cleanBase = base.endsWith('/') ? base : `${base}/`;
    const folder = this.firstString === 'Ma' ? 'MaSaSaSa' : 'PaSaSaSa';
    const pInfo = PITCH_LIST[this.pitchIndex];
    return `${cleanBase}audio/tanpura/${folder}/tanpura_${pInfo.file}.mp3`;
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

    // Total playback rate combines speed setting + semitone shift (+ Ni adjustment)
    let semitoneOffset = this.pitchSemi;
    if (this.firstString === 'Ni') {
      // Nishadham tuning pitch shift on Pa loop
      semitoneOffset += 1;
    }

    const pitchRate = Math.pow(2, semitoneOffset / 12);
    const totalRate = Math.max(0.4, Math.min(2.0, this.speed * pitchRate));

    this.audioElement.playbackRate = totalRate;
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
        this.audioElement.currentTime = prevTime;
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

  setPitchIndex(idx) {
    if (idx >= 0 && idx < PITCH_LIST.length) {
      this.pitchIndex = idx;
      this.applyAudioSource(true);
      this.notify();
    }
  }

  setPitchSemi(semi) {
    this.pitchSemi = Math.max(-6, Math.min(6, semi));
    this.updatePlaybackParameters();
    this.notify();
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

  setTonicFromMic(hz) {
    if (!hz || hz <= 0) return;
    this.tonicHz = hz;
    const midi = hzToMidi(hz);
    const pitchClass = ((Math.round(midi) % 12) + 12) % 12;
    this.pitchIndex = pitchClass;
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
