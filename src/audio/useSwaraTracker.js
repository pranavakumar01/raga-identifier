import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { hzToSwara } from './notes.js';
import { matchAllRagas } from './phraseMatcher.js';

const MIN_CLARITY = 0.85;
const MIN_RMS = 0.007;
const MAX_CENTS_TOLERANCE = 45; // Must be within +/- 45 cents of the swarasthana
const UPDATE_THROTTLE_MS = 60;

/**
 * Custom hook to accumulate vocal swara dwell time and evaluate Melakarta & Janya scales in real time.
 */
export function useSwaraTracker({ readout, listening, tonicHz, phraseScores = {} }) {
  const [dwellTimes, setDwellTimes] = useState(() => new Array(12).fill(0));
  const [targetRaga, setTargetRaga] = useState(null); // Selected raga for guided practice
  const [guideMode, setGuideMode] = useState(false); // Practice guide mode toggle

  const dwellRef = useRef(new Array(12).fill(0));
  const lastTimeRef = useRef(performance.now());
  const lastStateUpdateRef = useRef(0);

  // Reset accumulator
  const resetTracker = useCallback(() => {
    dwellRef.current = new Array(12).fill(0);
    setDwellTimes(new Array(12).fill(0));
    lastTimeRef.current = performance.now();
  }, []);

  // Update dwell times as singer produces tones
  useEffect(() => {
    const now = performance.now();
    const dt = Math.min(now - lastTimeRef.current, 250); // Clamp jump if tab was backgrounded
    lastTimeRef.current = now;

    if (!listening || !tonicHz) return;

    const { hz, clarity, rms } = readout;
    if (hz > 65 && clarity >= MIN_CLARITY && rms >= MIN_RMS) {
      const swara = hzToSwara(hz, tonicHz);
      if (swara && Math.abs(swara.cents) <= MAX_CENTS_TOLERANCE) {
        dwellRef.current[swara.swarasthanaIndex] += dt;

        // Throttle React state update to avoid rerendering 60 times/sec
        if (now - lastStateUpdateRef.current >= UPDATE_THROTTLE_MS) {
          lastStateUpdateRef.current = now;
          setDwellTimes([...dwellRef.current]);
        }
      }
    }
  }, [readout, listening, tonicHz]);

  // Compute unified Melakarta + Janya candidate matches incorporating phrase scores
  const matchResult = useMemo(() => {
    return matchAllRagas(dwellTimes, phraseScores, { minDwellMs: 120 });
  }, [dwellTimes, phraseScores]);

  // For Target Raga practice: which notes in the target scale have been sung?
  const targetProgress = useMemo(() => {
    if (!targetRaga || !targetRaga.swaras) return null;
    const hitMap = {};
    let hitCount = 0;
    for (const s of targetRaga.swaras) {
      const isHit = (dwellTimes[s.index] || 0) >= 120;
      hitMap[s.index] = isHit;
      if (isHit) hitCount++;
    }
    return {
      hitMap,
      hitCount,
      totalCount: targetRaga.swaras.length,
      allHit: hitCount === targetRaga.swaras.length,
    };
  }, [targetRaga, dwellTimes]);

  return {
    dwellTimes,
    matchResult,
    targetRaga,
    setTargetRaga,
    guideMode,
    setGuideMode,
    targetProgress,
    resetTracker,
  };
}
