import { useCallback, useEffect, useRef, useState } from 'react';
import { createNoteSegmenter } from './noteSegmenter.js';
import { createScaleRunTracker } from './sequenceMatcher.js';
import { tanpura } from './tanpura.js';

export function useArohanaTracker({ readout, listening, tonicHz, targetRaga }) {
  const segmenterRef = useRef(createNoteSegmenter(tonicHz));
  const trackerRef = useRef(createScaleRunTracker(targetRaga));

  const [runState, setRunState] = useState(() => trackerRef.current.getState());
  const [activeNote, setActiveNote] = useState(null);
  const [tanpuraPlaying, setTanpuraPlaying] = useState(false);

  // Sync tonic changes
  useEffect(() => {
    segmenterRef.current.setTonic(tonicHz);
    tanpura.setTonicFromMic(tonicHz);
  }, [tonicHz]);

  // Subscribe to tanpura state
  useEffect(() => {
    return tanpura.subscribe((st) => {
      setTanpuraPlaying(st.isPlaying);
    });
  }, []);

  // Sync target raga changes
  useEffect(() => {
    trackerRef.current.setRaga(targetRaga);
    setRunState(trackerRef.current.getState());
  }, [targetRaga]);

  // Process live pitch frames
  useEffect(() => {
    if (!listening || !tonicHz || !targetRaga) return;

    const { hz, clarity, rms } = readout;
    const now = performance.now();
    const event = segmenterRef.current.processFrame(hz, clarity, rms, now);

    if (event) {
      if (event.type === 'note_start') {
        setActiveNote(event.note);
        const newState = trackerRef.current.handleNoteEvent(event);
        setRunState({ ...newState });
      } else if (event.type === 'note_hold') {
        setActiveNote(event.note);
      } else if (event.type === 'note_end') {
        setActiveNote(null);
      }
    } else if (activeNote && hz === 0) {
      setActiveNote(null);
    }
  }, [readout, listening, tonicHz, targetRaga, activeNote]);

  const resetRun = useCallback(() => {
    segmenterRef.current.reset();
    trackerRef.current.reset();
    setActiveNote(null);
    setRunState(trackerRef.current.getState());
  }, []);

  const toggleTanpura = useCallback(() => {
    tanpura.toggle();
  }, []);

  // Clean up tanpura if component unmounts
  useEffect(() => {
    return () => {
      tanpura.stop();
    };
  }, []);

  return {
    runState,
    activeNote,
    resetRun,
    tanpuraPlaying,
    toggleTanpura,
  };
}
