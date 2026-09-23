import { MELAKARTA_RAGAS } from './melakarta.js';

/**
 * Builds the canonical 8-step Arohana and 8-step Avarohana sequences for a Melakarta raga.
 */
export function buildScaleSequences(raga) {
  if (!raga) return { arohana: [], avarohana: [] };

  const s0 = { swarasthanaIndex: 0, octaveDiff: 0, symbol: 'S', name: 'Shadjam' };
  const r = raga.swaras[1];
  const g = raga.swaras[2];
  const m = raga.swaras[3];
  const p = raga.swaras[4];
  const d = raga.swaras[5];
  const n = raga.swaras[6];
  const sDot = { swarasthanaIndex: 0, octaveDiff: 1, symbol: 'Ṡ', name: 'Tara Shadjam' };

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
 * Creates an interactive state machine for tracking singing progress along an Arohana–Avarohana run.
 */
export function createScaleRunTracker(targetRaga) {
  let raga = targetRaga;
  let { arohana, avarohana } = buildScaleSequences(raga);

  let phase = 'arohanam'; // 'arohanam' | 'avarohanam' | 'completed'
  let status = 'waiting_to_start'; // 'waiting_to_start' | 'in_progress' | 'at_apex' | 'completed'
  let currentStepIdx = 0;

  // Initialize step states
  let arohanaSteps = arohana.map((s) => ({ ...s, state: 'pending', hitTime: null, cents: 0 }));
  let avarohanaSteps = avarohana.map((s) => ({ ...s, state: 'pending', hitTime: null, cents: 0 }));

  let alienNotesCount = 0;
  let totalNotesSung = 0;
  let runStartTime = null;
  let runEndTime = null;

  return {
    setRaga(newRaga) {
      raga = newRaga;
      const seq = buildScaleSequences(newRaga);
      arohana = seq.arohana;
      avarohana = seq.avarohana;
      this.reset();
    },

    reset() {
      phase = 'arohanam';
      status = 'waiting_to_start';
      currentStepIdx = 0;
      alienNotesCount = 0;
      totalNotesSung = 0;
      runStartTime = null;
      runEndTime = null;

      arohanaSteps = arohana.map((s) => ({ ...s, state: 'pending', hitTime: null, cents: 0 }));
      avarohanaSteps = avarohana.map((s) => ({ ...s, state: 'pending', hitTime: null, cents: 0 }));
    },

    getState() {
      const hitsAro = arohanaSteps.filter((s) => s.state === 'hit').length;
      const hitsAva = avarohanaSteps.filter((s) => s.state === 'hit').length;
      const totalHits = hitsAro + hitsAva;

      // Score calculation
      const basePercentage = (totalHits / 16) * 100;
      const penalty = alienNotesCount * 4;
      const score = Math.max(0, Math.min(100, Math.round(basePercentage - penalty)));

      return {
        raga,
        phase,
        status,
        currentStepIdx,
        arohanaSteps,
        avarohanaSteps,
        hitsAro,
        hitsAva,
        totalHits,
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
      if (!event || !raga) return this.getState();

      const note = event.note;
      totalNotesSung++;

      if (!runStartTime) {
        runStartTime = performance.now();
      }

      // Check if note is an Anyaswara (foreign note)
      const isNoteInRaga = raga.swarasthanaSet.has(note.swarasthanaIndex);
      if (!isNoteInRaga) {
        alienNotesCount++;
      }

      if (phase === 'arohanam') {
        const expected = arohanaSteps[currentStepIdx];

        // Is this the expected note?
        // Note matches if same swarasthanaIndex and matching octave
        const matchesExact =
          note.swarasthanaIndex === expected.swarasthanaIndex &&
          (expected.octaveDiff === 0 ? note.octaveDiff >= 0 : note.octaveDiff === expected.octaveDiff);

        if (matchesExact) {
          arohanaSteps[currentStepIdx].state = 'hit';
          arohanaSteps[currentStepIdx].hitTime = performance.now();
          arohanaSteps[currentStepIdx].cents = note.cents;

          status = 'in_progress';
          currentStepIdx++;

          // Did we reach the Tara Sa (apex)?
          if (currentStepIdx >= 8) {
            status = 'at_apex';
            phase = 'avarohanam';
            currentStepIdx = 1; // Start descent from the second note (N) since Tara Sa was just hit

            // Mark Tara Sa as hit in Avarohana as well
            avarohanaSteps[0].state = 'hit';
            avarohanaSteps[0].hitTime = performance.now();
            avarohanaSteps[0].cents = note.cents;
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
            // Mark skipped notes
            for (let i = currentStepIdx; i < futureIdx; i++) {
              arohanaSteps[i].state = 'skipped';
            }
            arohanaSteps[futureIdx].state = 'hit';
            arohanaSteps[futureIdx].hitTime = performance.now();
            arohanaSteps[futureIdx].cents = note.cents;

            currentStepIdx = futureIdx + 1;
            status = 'in_progress';

            if (currentStepIdx >= 8) {
              status = 'at_apex';
              phase = 'avarohanam';
              currentStepIdx = 1;
              avarohanaSteps[0].state = 'hit';
            }
          }
        }
      } else if (phase === 'avarohanam') {
        const expected = avarohanaSteps[currentStepIdx];

        const matchesExact =
          note.swarasthanaIndex === expected.swarasthanaIndex &&
          (expected.octaveDiff === 1 ? note.octaveDiff === 1 : note.octaveDiff <= 0);

        if (matchesExact) {
          avarohanaSteps[currentStepIdx].state = 'hit';
          avarohanaSteps[currentStepIdx].hitTime = performance.now();
          avarohanaSteps[currentStepIdx].cents = note.cents;

          currentStepIdx++;

          // Did we complete the descent back to base Sa?
          if (currentStepIdx >= 8) {
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

            if (currentStepIdx >= 8) {
              phase = 'completed';
              status = 'completed';
              runEndTime = performance.now();
            }
          }
        }
      }

      return this.getState();
    },
  };
}
