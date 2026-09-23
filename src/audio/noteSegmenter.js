import { hzToSwara } from './notes.js';

const MIN_CLARITY = 0.85;
const MIN_RMS = 0.007;
const MAX_CENTS_TOLERANCE = 45;
const CONFIRM_DURATION_MS = 110; // Must hold pitch steady for at least 110ms
const MAX_GLIDE_GAP_MS = 140; // Pitch drops below clarity for <140ms don't break note

/**
 * Stateful detector that consumes raw pitch frames and generates discrete musical note events.
 */
export function createNoteSegmenter(tonicHz) {
  let currentTonic = tonicHz;
  let candidateSwara = null;
  let candidateStartTime = 0;
  let candidateFrames = 0;

  let activeNote = null; // Currently sounding committed note
  let lastVoicedTime = 0;

  return {
    setTonic(hz) {
      currentTonic = hz;
      this.reset();
    },

    reset() {
      candidateSwara = null;
      candidateStartTime = 0;
      candidateFrames = 0;
      activeNote = null;
      lastVoicedTime = 0;
    },

    /**
     * Process an incoming frame.
     * Returns:
     * - { type: 'note_start', note } when a new note is confirmed.
     * - { type: 'note_hold', note } while sustained.
     * - { type: 'note_end', note } when released.
     * - null if silence / unvoiced.
     */
    processFrame(hz, clarity, rms, now) {
      if (!currentTonic) return null;

      const isVoiced = hz > 65 && clarity >= MIN_CLARITY && rms >= MIN_RMS;

      if (!isVoiced) {
        // Voice is silent or unvoiced
        if (activeNote) {
          // Check if silence exceeded glide tolerance
          if (now - lastVoicedTime > MAX_GLIDE_GAP_MS) {
            const ended = {
              ...activeNote,
              durationMs: Math.round(lastVoicedTime - activeNote.startTime),
              endTime: lastVoicedTime,
            };
            activeNote = null;
            candidateSwara = null;
            return { type: 'note_end', note: ended };
          }
        }
        return null;
      }

      lastVoicedTime = now;
      const swara = hzToSwara(hz, currentTonic);
      if (!swara || Math.abs(swara.cents) > MAX_CENTS_TOLERANCE) {
        // Pitch is too far out of tune to count as a steady swarasthana
        return null;
      }

      // Unique swara key incorporating octave difference
      // e.g. "0:0" is Madhya Sa, "0:1" is Tara Sa, "0:-1" is Mandra Sa
      const swaraKey = `${swara.swarasthanaIndex}:${swara.octaveDiff}`;

      if (candidateSwara === swaraKey) {
        candidateFrames++;
        const heldDuration = now - candidateStartTime;

        if (heldDuration >= CONFIRM_DURATION_MS) {
          if (!activeNote || activeNote.key !== swaraKey) {
            // New note committed!
            let endedNote = null;
            if (activeNote) {
              endedNote = {
                ...activeNote,
                durationMs: Math.round(candidateStartTime - activeNote.startTime),
                endTime: candidateStartTime,
              };
            }

            activeNote = {
              key: swaraKey,
              swarasthanaIndex: swara.swarasthanaIndex,
              octaveDiff: swara.octaveDiff,
              symbol: swara.formattedSymbol,
              rawSymbol: swara.symbol,
              name: swara.name,
              sthayi: swara.sthayi,
              isAchala: swara.isAchala,
              startTime: candidateStartTime,
              hz,
              cents: swara.cents,
            };

            return {
              type: 'note_start',
              note: activeNote,
              previousNote: endedNote,
            };
          } else {
            // Continuous hold of the active note
            activeNote.durationMs = Math.round(now - activeNote.startTime);
            return {
              type: 'note_hold',
              note: activeNote,
            };
          }
        }
      } else {
        // Pitch shifted to a different swara
        candidateSwara = swaraKey;
        candidateStartTime = now;
        candidateFrames = 1;
      }

      if (activeNote) {
        return {
          type: 'note_hold',
          note: activeNote,
        };
      }

      return null;
    },
  };
}
