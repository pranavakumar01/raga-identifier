import { useCallback, useEffect, useRef, useState } from 'react';
import {
  KATTAI_PRESETS,
  centsFromNearestNote,
  hzToMidi,
  midiToHz,
  midiToName,
} from '../audio/notes.js';

const REQUIRED_STABLE_FRAMES = 24; // ~400-500ms of sustained pitch
const MAX_SEMITONE_SPREAD = 0.55; // must stay within ~55 cents to count as steady

export default function TonicBar({
  tonicHz,
  onSetTonic,
  readout,
  listening,
  startListening,
}) {
  const [calibrating, setCalibrating] = useState(false);
  const [calibProgress, setCalibProgress] = useState(0); // 0 to 1
  const [calibMessage, setCalibMessage] = useState('');
  const [mode, setMode] = useState('summary'); // 'summary' | 'select'

  const sampleBufferRef = useRef([]);

  const cancelCalibration = useCallback(() => {
    setCalibrating(false);
    setCalibProgress(0);
    sampleBufferRef.current = [];
    setCalibMessage('');
  }, []);

  const startCalibration = useCallback(async () => {
    if (!listening && startListening) {
      await startListening();
    }
    sampleBufferRef.current = [];
    setCalibProgress(0);
    setCalibMessage('Sing a steady "Sa" into your mic...');
    setCalibrating(true);
  }, [listening, startListening]);

  // Monitor pitch when calibrating
  useEffect(() => {
    if (!calibrating) return;

    const { hz, clarity, rms } = readout;
    // Check if singing a clear, audible pitch
    if (hz > 65 && clarity >= 0.88 && rms >= 0.008) {
      const buffer = sampleBufferRef.current;
      buffer.push(hz);

      // Keep recent window
      if (buffer.length > REQUIRED_STABLE_FRAMES) {
        buffer.shift();
      }

      setCalibProgress(buffer.length / REQUIRED_STABLE_FRAMES);

      if (buffer.length >= REQUIRED_STABLE_FRAMES) {
        // Test stability
        const midis = buffer.map(hzToMidi);
        const minMidi = Math.min(...midis);
        const maxMidi = Math.max(...midis);

        if (maxMidi - minMidi <= MAX_SEMITONE_SPREAD) {
          // Stable! Take the median
          const sorted = [...buffer].sort((a, b) => a - b);
          const medianHz = sorted[Math.floor(sorted.length / 2)];
          onSetTonic(medianHz);
          const noteName = midiToName(hzToMidi(medianHz));
          setCalibMessage(`Locked Sa at ${medianHz.toFixed(1)} Hz (${noteName})!`);
          setCalibrating(false);
          setCalibProgress(0);
          sampleBufferRef.current = [];
          return;
        } else {
          // Too much vibrato or moving note, discard oldest half
          buffer.splice(0, Math.floor(REQUIRED_STABLE_FRAMES / 2));
          setCalibMessage('Hold the note steady...');
        }
      }
    } else if (calibrating && sampleBufferRef.current.length > 0) {
      // If voice cuts out, slowly decay buffer
      sampleBufferRef.current.shift();
      setCalibProgress(sampleBufferRef.current.length / REQUIRED_STABLE_FRAMES);
    }
  }, [calibrating, readout, onSetTonic]);

  const handleSelectPreset = (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val > 0) {
      onSetTonic(val);
      setMode('summary');
    }
  };

  const tonicMidi = tonicHz ? hzToMidi(tonicHz) : null;
  const tonicName = tonicMidi ? midiToName(tonicMidi) : 'Not set';
  const tonicCents = tonicMidi ? centsFromNearestNote(tonicMidi) : 0;
  const centsText =
    tonicCents === 0 ? '' : tonicCents > 0 ? ` +${tonicCents}c` : ` ${tonicCents}c`;

  // Find if current tonic matches any kattai preset roughly
  const matchingPreset = tonicHz
    ? KATTAI_PRESETS.find((p) => Math.abs(midiToHz(p.midi) - tonicHz) < 2)
    : null;

  return (
    <div className="tonic-bar">
      <div className="tonic-summary">
        <span className="tonic-badge">Tonic (Sa)</span>
        <div className="tonic-info">
          <strong className="tonic-note">
            {tonicHz ? `${tonicName}${centsText}` : 'Not Calibrated'}
          </strong>
          {tonicHz && (
            <span className="tonic-sub">
              {tonicHz.toFixed(1)} Hz
              {matchingPreset ? ` · ${matchingPreset.kattai} Kattai` : ''}
            </span>
          )}
        </div>
      </div>

      {calibrating ? (
        <div className="tonic-calib-active">
          <div className="calib-progress-bar">
            <div
              className="calib-progress-fill"
              style={{ width: `${Math.round(calibProgress * 100)}%` }}
            />
          </div>
          <span className="calib-text">{calibMessage || 'Listening for steady Sa...'}</span>
          <button className="tonic-btn secondary" onClick={cancelCalibration} type="button">
            Cancel
          </button>
        </div>
      ) : (
        <div className="tonic-actions">
          {mode === 'select' ? (
            <div className="tonic-select-row">
              <select
                className="tonic-dropdown"
                onChange={handleSelectPreset}
                defaultValue={tonicHz ? Math.round(tonicHz) : ''}
              >
                <option value="" disabled>
                  Choose standard Kattai / pitch...
                </option>
                {KATTAI_PRESETS.map((p) => {
                  const hz = midiToHz(p.midi);
                  return (
                    <option key={p.kattai} value={hz}>
                      {p.label}
                    </option>
                  );
                })}
              </select>
              <button
                className="tonic-btn secondary"
                onClick={() => setMode('summary')}
                type="button"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <button
                className="tonic-btn primary"
                onClick={startCalibration}
                type="button"
                title="Sing a sustained Sa note to auto-lock your base pitch"
              >
                🎙️ Sing Sa to Calibrate
              </button>
              <button
                className="tonic-btn secondary"
                onClick={() => setMode('select')}
                type="button"
                title="Select from standard Carnatic Kattai pitches (1, 1.5, 2, 5...)"
              >
                Choose Kattai ▾
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
