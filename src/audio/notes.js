// Pitch <-> note helpers.
//
// Everything here works in MIDI-style semitone space rather than raw Hz, because
// musical distance is a ratio, not a difference: 100->200 Hz and 400->800 Hz are
// both one octave. Converting to semitones once, up front, means every later
// stage (tonic calibration, swara mapping, raga matching) can use plain
// subtraction instead of logarithms.

export const A4_HZ = 440;
export const A4_MIDI = 69;

const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/** Pitch classes with no accidental: C D E F G A B. */
export const NATURAL_PITCH_CLASSES = new Set([0, 2, 4, 5, 7, 9, 11]);

/** Hz -> fractional MIDI number. 440 Hz -> 69.0 */
export function hzToMidi(hz) {
  return A4_MIDI + 12 * Math.log2(hz / A4_HZ);
}

/** Fractional MIDI number -> Hz. */
export function midiToHz(midi) {
  return A4_HZ * Math.pow(2, (midi - A4_MIDI) / 12);
}

/** Fractional MIDI -> nearest note name with octave, e.g. 69.2 -> "A4". */
export function midiToName(midi) {
  const n = Math.round(midi);
  return NAMES[((n % 12) + 12) % 12] + (Math.floor(n / 12) - 1);
}

/** How far the pitch sits from the nearest equal-tempered note, in cents. */
export function centsFromNearestNote(midi) {
  return Math.round((midi - Math.round(midi)) * 100);
}

/** True if the nearest note is a natural (used to decide which gridlines get labels). */
export function isNaturalNote(midi) {
  const n = Math.round(midi);
  return NATURAL_PITCH_CLASSES.has(((n % 12) + 12) % 12);
}

/** Linear amplitude (0..1) -> decibels full scale. Silence clamps to -100. */
export function rmsToDb(rms) {
  return rms > 0 ? Math.max(-100, 20 * Math.log10(rms)) : -100;
}

/**
 * 12 Carnatic Swarasthanas (0 to 11 semitones from Sa).
 */
export const SWARASTHANAS = [
  { index: 0, symbol: 'S', name: 'Shadjam', alias: 'S', isAchala: true },
  { index: 1, symbol: 'R₁', name: 'Suddha Rishabham', alias: 'R1', isAchala: false },
  { index: 2, symbol: 'R₂', name: 'Chatusruti Rishabham', altSymbol: 'G₁', altName: 'Suddha Gandharam', alias: 'R2/G1', isAchala: false },
  { index: 3, symbol: 'G₂', name: 'Sadharana Gandharam', altSymbol: 'R₃', altName: 'Shatsruti Rishabham', alias: 'G2/R3', isAchala: false },
  { index: 4, symbol: 'G₃', name: 'Antara Gandharam', alias: 'G3', isAchala: false },
  { index: 5, symbol: 'M₁', name: 'Suddha Madhyamam', alias: 'M1', isAchala: false },
  { index: 6, symbol: 'M₂', name: 'Prati Madhyamam', alias: 'M2', isAchala: false },
  { index: 7, symbol: 'P', name: 'Panchamam', alias: 'P', isAchala: true },
  { index: 8, symbol: 'D₁', name: 'Suddha Dhaivatam', alias: 'D1', isAchala: false },
  { index: 9, symbol: 'D₂', name: 'Chatusruti Dhaivatam', altSymbol: 'N₁', altName: 'Suddha Nishadham', alias: 'D2/N1', isAchala: false },
  { index: 10, symbol: 'N₂', name: 'Kaisiki Nishadham', altSymbol: 'D₃', altName: 'Shatsruti Dhaivatam', alias: 'N2/D3', isAchala: false },
  { index: 11, symbol: 'N₃', name: 'Kakali Nishadham', alias: 'N3', isAchala: false },
];

/** Standard Carnatic Kattai (Sruti) definitions relative to octave 3. */
export const KATTAI_PRESETS = [
  { kattai: '1', note: 'C', octave: 3, midi: 48, label: '1 Kattai (C3, 130.8 Hz) - Male' },
  { kattai: '1.5', note: 'C#', octave: 3, midi: 49, label: '1.5 Kattai (C#3, 138.6 Hz) - Male' },
  { kattai: '2', note: 'D', octave: 3, midi: 50, label: '2 Kattai (D3, 146.8 Hz) - Male' },
  { kattai: '2.5', note: 'D#', octave: 3, midi: 51, label: '2.5 Kattai (D#3, 155.6 Hz) - Male' },
  { kattai: '3', note: 'E', octave: 3, midi: 52, label: '3 Kattai (E3, 164.8 Hz)' },
  { kattai: '4', note: 'F', octave: 3, midi: 53, label: '4 Kattai (F3, 174.6 Hz) - Female' },
  { kattai: '4.5', note: 'F#', octave: 3, midi: 54, label: '4.5 Kattai (F#3, 185.0 Hz) - Female' },
  { kattai: '5', note: 'G', octave: 3, midi: 55, label: '5 Kattai (G3, 196.0 Hz) - Female' },
  { kattai: '5.5', note: 'G#', octave: 3, midi: 56, label: '5.5 Kattai (G#3, 207.7 Hz) - Female' },
  { kattai: '6', note: 'A', octave: 3, midi: 57, label: '6 Kattai (A3, 220.0 Hz)' },
  { kattai: '6.5', note: 'A#', octave: 3, midi: 58, label: '6.5 Kattai (A#3, 233.1 Hz)' },
  { kattai: '7', note: 'B', octave: 3, midi: 59, label: '7 Kattai (B3, 246.9 Hz)' },
];

/** Exact cents distance between any Hz and tonic. */
export function hzToCentsFromTonic(hz, tonicHz) {
  if (!hz || !tonicHz) return 0;
  return 1200 * Math.log2(hz / tonicHz);
}

/** Sthayi (octave register) symbols and names */
export function getSthayi(octaveDiff) {
  if (octaveDiff < 0) return { name: 'Mandra', prefix: '', suffix: '̣', symbolModifier: (s) => `${s}̣` };
  if (octaveDiff > 0) return { name: 'Tara', prefix: '', suffix: '̇', symbolModifier: (s) => `${s}̇` };
  return { name: 'Madhya', prefix: '', suffix: '', symbolModifier: (s) => s };
}

/**
 * Given current Hz and calibrated tonic Hz, returns the nearest Carnatic swara,
 * sthayi (octave), and deviation in cents.
 */
export function hzToSwara(hz, tonicHz) {
  if (!hz || !tonicHz) return null;
  const semitonesFromTonic = 12 * Math.log2(hz / tonicHz);
  const rounded = Math.round(semitonesFromTonic);
  const cents = Math.round((semitonesFromTonic - rounded) * 100);

  const octaveDiff = Math.floor(rounded / 12);
  const swarasthanaIndex = ((rounded % 12) + 12) % 12;
  const sthana = SWARASTHANAS[swarasthanaIndex];
  const sthayi = getSthayi(octaveDiff);

  return {
    swarasthanaIndex,
    symbol: sthana.symbol,
    formattedSymbol: sthayi.symbolModifier(sthana.symbol),
    name: sthana.name,
    altSymbol: sthana.altSymbol,
    isAchala: sthana.isAchala,
    cents,
    sthayi: sthayi.name,
    octaveDiff,
  };
}

