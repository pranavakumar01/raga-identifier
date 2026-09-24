import { useCallback, useEffect, useRef, useState } from 'react';
import { createNoteSegmenter } from './noteSegmenter.js';
import { createPhraseRecognizer } from './phraseMatcher.js';

export function usePhraseTracker({ readout, listening, tonicHz }) {
  const segmenterRef = useRef(createNoteSegmenter(tonicHz));
  const recognizerRef = useRef(createPhraseRecognizer());

  const [noteHistory, setNoteHistory] = useState([]);
  const [caughtPhrases, setCaughtPhrases] = useState([]);
  const [phraseScores, setPhraseScores] = useState({});
  const [latestCatch, setLatestCatch] = useState(null);

  // Sync tonic changes
  useEffect(() => {
    segmenterRef.current.setTonic(tonicHz);
  }, [tonicHz]);

  const clearHistory = useCallback(() => {
    segmenterRef.current.reset();
    recognizerRef.current.reset();
    setNoteHistory([]);
    setCaughtPhrases([]);
    setPhraseScores({});
    setLatestCatch(null);
  }, []);

  // Process live frames
  useEffect(() => {
    if (!listening || !tonicHz) return;

    const { hz, clarity, rms } = readout;
    const now = performance.now();
    const event = segmenterRef.current.processFrame(hz, clarity, rms, now);

    if (event && event.type === 'note_start') {
      const { newlyCaught, noteHistory: updatedHistory } = recognizerRef.current.addNote(event.note);

      setNoteHistory(updatedHistory);

      if (newlyCaught && newlyCaught.length > 0) {
        setCaughtPhrases(recognizerRef.current.getCaughtPhrases());
        setPhraseScores(recognizerRef.current.getPhraseScores());
        setLatestCatch(newlyCaught[0]);
      }
    }
  }, [readout, listening, tonicHz]);

  // Auto-expire latestCatch banner after 5 seconds
  useEffect(() => {
    if (!latestCatch) return;
    const timer = setTimeout(() => {
      setLatestCatch(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [latestCatch]);

  return {
    noteHistory,
    caughtPhrases,
    phraseScores,
    latestCatch,
    clearHistory,
  };
}
