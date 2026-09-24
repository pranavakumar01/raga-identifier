import { MELAKARTA_RAGAS } from './melakarta.js';

/**
 * Builds the scale sequences (Arohana and Avarohana) for any raga (Melakarta or Janya).
 * Supports arbitrary step counts (Audava 6 steps, Shadava 7 steps, Sampurna 8 steps, Vakra, etc.)
 */
export function buildScaleSequences(raga) {
  if (!raga) return { arohana: [], avarohana: [] };

  const s0 = { swarasthanaIndex: 0, octaveDiff: 0, symbol: 'S', name: 'Shadjam' };
  const sDot = { swarasthanaIndex: 0, octaveDiff: 1, symbol: 'Ṡ', name: 'Tara Shadjam' };

  // If the raga already defines exact arohana and avarohana arrays (like Janya ragas)
  if (raga.arohana && Array.isArray(raga.arohana) && raga.arohana.length > 0 && raga.isJanya) {
    const arohana = raga.arohana.map((sw, idx) => ({
      swarasthanaIndex: sw.index,
      octaveDiff: sw.octaveDiff ?? (sw.symbol === 'Ṡ' ? 1 : 0),
      symbol: sw.symbol,
      name: sw.name,
      stepIndex: idx,
      phase: 'arohanam',
    }));

    const avarohana = raga.avarohana.map((sw, idx) => ({
      swarasthanaIndex: sw.index,
      octaveDiff: sw.octaveDiff ?? (sw.symbol === 'Ṡ' ? 1 : 0),
      symbol: sw.symbol,
      name: sw.name,
      stepIndex: idx,
      phase: 'avarohanam',
    }));

    return { arohana, avarohana };
  }

  // Melakarta 7-swara parent scales: construct canonical 8-step ascent and descent
  const r = raga.swaras[1];
  const g = raga.swaras[2];
  const m = raga.swaras[3];
  const p = raga.swaras[4];
  const d = raga.swaras[5];
  const n = raga.swaras[6];

  const arohana = [
    { ...s0, stepIndex: 0, phase: 'arohanam' },
    { swarasthanaIndex: r.index, octaveDiff: 0, symbol: r.symbol, name: r.name, stepIndex: 1, phase: 'arohanam' },
    { swarasthanaIndex: g.index, octaveDiff: 0, symbol: g.symbol, name: g.name, stepIndex: 2, phase: 'arohanam' },
    { swarasthanaIndex: m.index, octaveDiff: 0, symbol: m.symbol, name: m.name, stepIndex: 3, phase: 'arohanam' },
    { swarasthanaIndex: p.index, octaveDiff: 0, symbol: p.symbol, name: p.name, stepIndex: 4, phase: 'arohanam' },
    { swarasthanaIndex: d.index, octaveDiff: 0, symbol: d.symbol, name: d.name, stepIndex: 5, phase: 'arohanam' },
    { swarasthanaIndex: n.index, octaveDiff: 0, symbol: n.symbol, name: n.name, stepIndex: 6, phase: 'arohanam' },
    { ...sDot, stepIndex: 7, phase: 'arohanam' },
  ];

  const avarohana = [
    { ...sDot, stepIndex: 0, phase: 'avarohanam' },
    { swarasthanaIndex: n.index, octaveDiff: 0, symbol: n.symbol, name: n.name, stepIndex: 1, phase: 'avarohanam' },
    { swarasthanaIndex: d.index, octaveDiff: 0, symbol: d.symbol, name: d.name, stepIndex: 2, phase: 'avarohanam' },
    { swarasthanaIndex: p.index, octaveDiff: 0, symbol: p.symbol, name: p.name, stepIndex: 3, phase: 'avarohanam' },
    { swarasthanaIndex: m.index, octaveDiff: 0, symbol: m.symbol, name: m.name, stepIndex: 4, phase: 'avarohanam' },
    { swarasthanaIndex: g.index, octaveDiff: 0, symbol: g.symbol, name: g.name, stepIndex: 5, phase: 'avarohanam' },
    { swarasthanaIndex: r.index, octaveDiff: 0, symbol: r.symbol, name: r.name, stepIndex: 6, phase: 'avarohanam' },
    { ...s0, stepIndex: 7, phase: 'avarohanam' },
  ];

  return { arohana, avarohana };
}

/**
 * Builds sequence steps for a targeted phrase (Pakad Practice Mode).
 */
export function buildPhraseSequence(phrase) {
  if (!phrase || !phrase.indices) return { steps: [] };

  const steps = phrase.indices.map((idx, stepIdx) => ({
    swarasthanaIndex: idx,
    octaveDiff: phrase.swaras[stepIdx]?.includes('̇') || phrase.swaras[stepIdx] === 'Ṡ' ? 1 : 0,
    symbol: phrase.swaras[stepIdx] || 'S',
    name: `Step ${stepIdx + 1}`,
    stepIndex: stepIdx,
    phase: 'phrase',
  }));

  return { steps };
}

/**
 * Creates an interactive state machine for tracking singing progress along an Arohana–Avarohana
 * or custom phrase run.
 */
export function createScaleRunTracker(targetRaga, targetPhrase = null) {
  let raga = targetRaga;
  let phraseTarget = targetPhrase;
  let { arohana, avarohana } = buildScaleSequences(raga);

  let phase = 'arohanam'; // 'arohanam' | 'avarohanam' | 'phrase' | 'completed'
  let status = 'waiting_to_start'; // 'waiting_to_start' | 'in_progress' | 'at_apex' | 'completed'
  let currentStepIdx = 0;

  // Initialize step states
  let arohanaSteps = arohana.map((s) => ({ ...s, state: 'pending', hitTime: null, cents: 0 }));
  let avarohanaSteps = avarohana.map((s) => ({ ...s, state: 'pending', hitTime: null, cents: 0 }));
  let phraseSteps = targetPhrase ? buildPhraseSequence(targetPhrase).steps.map((s) => ({ ...s, state: 'pending', hitTime: null, cents: 0 })) : [];

  let alienNotesCount = 0;
  let totalNotesSung = 0;
  let runStartTime = null;
  let runEndTime = null;

  return {
    setRaga(newRaga) {
      raga = newRaga;
      phraseTarget = null;
      const seq = buildScaleSequences(newRaga);
      arohana = seq.arohana;
      avarohana = seq.avarohana;
      this.reset();
    },

    setPhraseTarget(newPhrase) {
      phraseTarget = newPhrase;
      if (newPhrase) {
        phraseSteps = buildPhraseSequence(newPhrase).steps.map((s) => ({ ...s, state: 'pending', hitTime: null, cents: 0 }));
      } else {
        phraseSteps = [];
      }
      this.reset();
    },

    reset() {
      phase = phraseTarget ? 'phrase' : 'arohanam';
      status = 'waiting_to_start';
      currentStepIdx = 0;
      alienNotesCount = 0;
      totalNotesSung = 0;
      runStartTime = null;
      runEndTime = null;

      arohanaSteps = arohana.map((s) => ({ ...s, state: 'pending', hitTime: null, cents: 0 }));
      avarohanaSteps = avarohana.map((s) => ({ ...s, state: 'pending', hitTime: null, cents: 0 }));
      if (phraseTarget) {
        phraseSteps = buildPhraseSequence(phraseTarget).steps.map((s) => ({ ...s, state: 'pending', hitTime: null, cents: 0 }));
      }
    },

    getState() {
      if (phraseTarget && phraseSteps.length > 0) {
        const hits = phraseSteps.filter((s) => s.state === 'hit').length;
        const total = phraseSteps.length;
        const basePercentage = total > 0 ? (hits / total) * 100 : 0;
        const penalty = alienNotesCount * 5;
        const score = Math.max(0, Math.min(100, Math.round(basePercentage - penalty)));

        return {
          raga,
          phraseTarget,
          isPhraseMode: true,
          phase,
          status,
          currentStepIdx,
          phraseSteps,
          arohanaSteps: [],
          avarohanaSteps: [],
          hitsAro: hits,
          hitsAva: 0,
          totalHits: hits,
          totalSteps: total,
          alienNotesCount,
          score,
          durationSec: runStartTime
            ? Math.round(((runEndTime || performance.now()) - runStartTime) / 1000)
            : 0,
        };
      }

      const hitsAro = arohanaSteps.filter((s) => s.state === 'hit').length;
      const hitsAva = avarohanaSteps.filter((s) => s.state === 'hit').length;
      const totalHits = hitsAro + hitsAva;
      const totalSteps = arohanaSteps.length + avarohanaSteps.length;

      // Score calculation
      const basePercentage = totalSteps > 0 ? (totalHits / totalSteps) * 100 : 0;
      const penalty = alienNotesCount * 4;
      const score = Math.max(0, Math.min(100, Math.round(basePercentage - penalty)));

      return {
        raga,
        phraseTarget: null,
        isPhraseMode: false,
        phase,
        status,
        currentStepIdx,
        arohanaSteps,
        avarohanaSteps,
        hitsAro,
        hitsAva,
        totalHits,
        totalSteps,
        alienNotesCount,
        score,
        durationSec: runStartTime
          ? Math.round(((runEndTime || performance.now()) - runStartTime) / 1000)
          : 0,
      };
    },

    /**
     * Process a note event from the segmenter.
     */
    handleNoteEvent(event) {
      if (!event || (!raga && !phraseTarget)) return this.getState();

      const note = event.note;
      totalNotesSung++;

      if (!runStartTime) {
        runStartTime = performance.now();
      }

      // Check if note is an Anyaswara (foreign note)
      const allowedSet = raga ? raga.swarasthanaSet : new Set(phraseSteps.map((s) => s.swarasthanaIndex));
      const isNoteInRaga = allowedSet.has(note.swarasthanaIndex);
      if (!isNoteInRaga) {
        alienNotesCount++;
      }

      // Handle Phrase Practice Mode
      if (phraseTarget && phraseSteps.length > 0) {
        if (currentStepIdx < phraseSteps.length) {
          const expected = phraseSteps[currentStepIdx];
          const matches = note.swarasthanaIndex === expected.swarasthanaIndex;

          if (matches) {
            phraseSteps[currentStepIdx].state = 'hit';
            phraseSteps[currentStepIdx].hitTime = performance.now();
            phraseSteps[currentStepIdx].cents = note.cents;

            status = 'in_progress';
            currentStepIdx++;

            if (currentStepIdx >= phraseSteps.length) {
              phase = 'completed';
              status = 'completed';
              runEndTime = performance.now();
            }
          }
        }
        return this.getState();
      }

      // Handle Arohanam Phase
      if (phase === 'arohanam') {
        if (currentStepIdx < arohanaSteps.length) {
          const expected = arohanaSteps[currentStepIdx];

          const matchesExact =
            note.swarasthanaIndex === expected.swarasthanaIndex &&
            (expected.octaveDiff === 0 ? note.octaveDiff >= 0 : note.octaveDiff === expected.octaveDiff);

          if (matchesExact) {
            arohanaSteps[currentStepIdx].state = 'hit';
            arohanaSteps[currentStepIdx].hitTime = performance.now();
            arohanaSteps[currentStepIdx].cents = note.cents;

            status = 'in_progress';
            currentStepIdx++;

            // Did we reach the end of Arohana (apex)?
            if (currentStepIdx >= arohanaSteps.length) {
              status = 'at_apex';
              phase = 'avarohanam';

              // If the first note of Avarohana is the same note (e.g. Tara Sa), mark it hit
              const lastAro = arohanaSteps[arohanaSteps.length - 1];
              const firstAva = avarohanaSteps[0];
              if (
                firstAva &&
                firstAva.swarasthanaIndex === lastAro.swarasthanaIndex &&
                firstAva.octaveDiff === lastAro.octaveDiff
              ) {
                avarohanaSteps[0].state = 'hit';
                avarohanaSteps[0].hitTime = performance.now();
                avarohanaSteps[0].cents = note.cents;
                currentStepIdx = 1;
              } else {
                currentStepIdx = 0;
              }
            }
          } else {
            // Check if singer skipped forward to a future note in Arohana
            const futureIdx = arohanaSteps.findIndex(
              (s, idx) =>
                idx > currentStepIdx &&
                s.swarasthanaIndex === note.swarasthanaIndex &&
                (s.octaveDiff === 0 ? note.octaveDiff >= 0 : note.octaveDiff === s.octaveDiff)
            );

            if (futureIdx !== -1) {
              for (let i = currentStepIdx; i < futureIdx; i++) {
                arohanaSteps[i].state = 'skipped';
              }
              arohanaSteps[futureIdx].state = 'hit';
              arohanaSteps[futureIdx].hitTime = performance.now();
              arohanaSteps[futureIdx].cents = note.cents;

              currentStepIdx = futureIdx + 1;
              status = 'in_progress';

              if (currentStepIdx >= arohanaSteps.length) {
                status = 'at_apex';
                phase = 'avarohanam';
                currentStepIdx = 1;
                if (avarohanaSteps[0]) avarohanaSteps[0].state = 'hit';
              }
            }
          }
        }
      } else if (phase === 'avarohanam') {
        if (currentStepIdx < avarohanaSteps.length) {
          const expected = avarohanaSteps[currentStepIdx];

          const matchesExact =
            note.swarasthanaIndex === expected.swarasthanaIndex &&
            (expected.octaveDiff === 1 ? note.octaveDiff === 1 : note.octaveDiff <= 0);

          if (matchesExact) {
            avarohanaSteps[currentStepIdx].state = 'hit';
            avarohanaSteps[currentStepIdx].hitTime = performance.now();
            avarohanaSteps[currentStepIdx].cents = note.cents;

            currentStepIdx++;

            if (currentStepIdx >= avarohanaSteps.length) {
              phase = 'completed';
              status = 'completed';
              runEndTime = performance.now();
            }
          } else {
            // Check if singer skipped forward in descent
            const futureIdx = avarohanaSteps.findIndex(
              (s, idx) =>
                idx > currentStepIdx &&
                s.swarasthanaIndex === note.swarasthanaIndex &&
                (s.octaveDiff === 1 ? note.octaveDiff === 1 : note.octaveDiff <= 0)
            );

            if (futureIdx !== -1) {
              for (let i = currentStepIdx; i < futureIdx; i++) {
                avarohanaSteps[i].state = 'skipped';
              }
              avarohanaSteps[futureIdx].state = 'hit';
              avarohanaSteps[futureIdx].hitTime = performance.now();
              avarohanaSteps[futureIdx].cents = note.cents;

              currentStepIdx = futureIdx + 1;

              if (currentStepIdx >= avarohanaSteps.length) {
                phase = 'completed';
                status = 'completed';
                runEndTime = performance.now();
              }
            }
          }
        }
      }

      return this.getState();
    },
  };
}
