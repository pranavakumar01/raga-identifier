import { useCallback, useState } from 'react';
import PitchPlot from './components/PitchPlot.jsx';
import Readout from './components/Readout.jsx';
import TonicBar from './components/TonicBar.jsx';
import { useMicPitch } from './audio/useMicPitch.js';

export default function App() {
  const { status, error, device, readout, traceRef, start, stop } = useMicPitch();
  const listening = status === 'listening';
  const busy = status === 'starting';

  const [tonicHz, setTonicHz] = useState(() => {
    const saved = localStorage.getItem('carnatic_tonic_hz');
    return saved ? parseFloat(saved) : 138.59; // Default to 1.5 Kattai (C#3)
  });

  const handleSetTonic = useCallback((hz) => {
    setTonicHz(hz);
    if (hz) {
      localStorage.setItem('carnatic_tonic_hz', hz.toString());
    } else {
      localStorage.removeItem('carnatic_tonic_hz');
    }
  }, []);

  return (
    <div className="app">
      <header className="bar">
        <div className="bar-headings">
          <h1 className="title">Carnatic Raga Identifier</h1>
          <p className="purpose">
            Step 2: Calibrate your <strong>Sa</strong>, sing swaras, and observe the live swara tracking.
          </p>
        </div>
        <button
          className="action"
          onClick={listening ? stop : start}
          disabled={busy}
          aria-busy={busy}
        >
          {busy ? 'Opening microphone' : listening ? 'Stop listening' : 'Start listening'}
        </button>
      </header>

      {error && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}

      <TonicBar
        tonicHz={tonicHz}
        onSetTonic={handleSetTonic}
        readout={readout}
        listening={listening}
        startListening={start}
      />

      <Readout
        hz={readout.hz}
        clarity={readout.clarity}
        rms={readout.rms}
        listening={listening}
        tonicHz={tonicHz}
      />

      <main className="plot-frame">
        <PitchPlot traceRef={traceRef} active={listening} tonicHz={tonicHz} />
      </main>

      <footer className="foot">
        {device ? (
          <span>
            {device.label} at {(device.sampleRate / 1000).toFixed(1)} kHz
          </span>
        ) : (
          <span>No input open</span>
        )}
        <span className="foot-scale">10s history · S & P marked in gold</span>
      </footer>
    </div>
  );
}

