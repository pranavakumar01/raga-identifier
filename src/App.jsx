import { useCallback, useState } from 'react';
import PitchPlot from './components/PitchPlot.jsx';
import Readout from './components/Readout.jsx';
import RagaMatcher from './components/RagaMatcher.jsx';
import ArohanaRunway from './components/ArohanaRunway.jsx';
import TanpuraControls from './components/TanpuraControls.jsx';
import TonicBar from './components/TonicBar.jsx';
import { useMicPitch } from './audio/useMicPitch.js';
import { useSwaraTracker } from './audio/useSwaraTracker.js';
import { useArohanaTracker } from './audio/useArohanaTracker.js';

export default function App() {
  const { status, error, device, readout, traceRef, start, stop } = useMicPitch();
  const listening = status === 'listening';
  const busy = status === 'starting';

  const [activeTab, setActiveTab] = useState('runway'); // 'runway' | 'matcher'
  const [showTanpuraControls, setShowTanpuraControls] = useState(false);

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

  const {
    dwellTimes,
    matchResult,
    targetRaga,
    setTargetRaga,
    guideMode,
    setGuideMode,
    targetProgress,
    resetTracker,
  } = useSwaraTracker({ readout, listening, tonicHz });

  const {
    runState,
    activeNote,
    resetRun,
    tanpuraPlaying,
    toggleTanpura,
  } = useArohanaTracker({ readout, listening, tonicHz, targetRaga });

  return (
    <div className="app">
      <header className="bar">
        <div className="bar-headings">
          <h1 className="title">Carnatic Raga Identifier</h1>
          <p className="purpose">
            Step 5: Practice and verify canonical <strong>Arohanam–Avarohanam trajectories</strong>, or identify Melakarta parent scales.
          </p>
        </div>
        <div className="header-actions">
          <button
            className={`tanpura-mini-btn ${tanpuraPlaying ? 'active' : ''}`}
            onClick={toggleTanpura}
            type="button"
            title="Toggle authentic acoustic Tanpura drone"
          >
            🪕 {tanpuraPlaying ? 'Drone ON' : 'Tanpura'}
          </button>
          <button
            className="tanpura-mini-btn secondary"
            onClick={() => setShowTanpuraControls(true)}
            type="button"
            title="Open Tanpura Controls (First String, Pitch, Speed, Volume)"
          >
            ⚙️ Controls
          </button>
          <button
            className="action"
            onClick={listening ? stop : start}
            disabled={busy}
            aria-busy={busy}
          >
            {busy ? 'Opening microphone' : listening ? 'Stop listening' : 'Start listening'}
          </button>
        </div>
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
        targetRaga={targetRaga}
      />

      <main className="plot-frame">
        <PitchPlot
          traceRef={traceRef}
          active={listening}
          tonicHz={tonicHz}
          targetRaga={targetRaga}
        />
      </main>

      {/* Mode / Feature Switcher */}
      <div className="tab-bar">
        <button
          className={`tab-btn ${activeTab === 'runway' ? 'active' : ''}`}
          onClick={() => setActiveTab('runway')}
          type="button"
        >
          <span>🛫 Arohanam–Avarohanam Runway</span>
          <span className="tab-pill">Step 5</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'matcher' ? 'active' : ''}`}
          onClick={() => setActiveTab('matcher')}
          type="button"
        >
          <span>🎯 72 Melakarta Scale Matcher</span>
          {matchResult.activeCount > 0 && (
            <span className="tab-pill gold">{matchResult.activeCount} notes</span>
          )}
        </button>
      </div>

      {activeTab === 'runway' ? (
        <ArohanaRunway
          runState={runState}
          activeNote={activeNote}
          resetRun={resetRun}
          targetRaga={targetRaga}
          setTargetRaga={setTargetRaga}
          tanpuraPlaying={tanpuraPlaying}
          toggleTanpura={toggleTanpura}
          onOpenTanpuraControls={() => setShowTanpuraControls(true)}
          listening={listening}
          tonicHz={tonicHz}
        />
      ) : (
        <RagaMatcher
          dwellTimes={dwellTimes}
          matchResult={matchResult}
          targetRaga={targetRaga}
          setTargetRaga={setTargetRaga}
          guideMode={guideMode}
          setGuideMode={setGuideMode}
          targetProgress={targetProgress}
          resetTracker={resetTracker}
          tonicHz={tonicHz}
        />
      )}

      {/* Modal / Controls Card */}
      <TanpuraControls
        isOpen={showTanpuraControls}
        onClose={() => setShowTanpuraControls(false)}
        onTonicSync={handleSetTonic}
      />

      <footer className="foot">
        {device ? (
          <span>
            {device.label} at {(device.sampleRate / 1000).toFixed(1)} kHz
          </span>
        ) : (
          <span>No input open</span>
        )}
        <span className="foot-scale">10s history · Arohanam-Avarohanam trajectory engine active</span>
      </footer>
    </div>
  );
}

