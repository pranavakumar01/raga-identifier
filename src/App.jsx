import { useCallback, useState } from 'react';
import PitchPlot from './components/PitchPlot.jsx';
import Readout from './components/Readout.jsx';
import RagaMatcher from './components/RagaMatcher.jsx';
import ArohanaRunway from './components/ArohanaRunway.jsx';
import PhraseRecognizer from './components/PhraseRecognizer.jsx';
import TanpuraControls from './components/TanpuraControls.jsx';
import TonicBar from './components/TonicBar.jsx';
import { useMicPitch } from './audio/useMicPitch.js';
import { useSwaraTracker } from './audio/useSwaraTracker.js';
import { useArohanaTracker } from './audio/useArohanaTracker.js';
import { usePhraseTracker } from './audio/usePhraseTracker.js';
import { JANYA_RAGAS } from './audio/janya.js';
import { MELAKARTA_RAGAS } from './audio/melakarta.js';

export default function App() {
  const { status, error, device, readout, traceRef, start, stop } = useMicPitch();
  const listening = status === 'listening';
  const busy = status === 'starting';

  const [activeTab, setActiveTab] = useState('runway'); // 'runway' | 'matcher' | 'phrases'
  const [showTanpuraControls, setShowTanpuraControls] = useState(false);
  const [targetPhrase, setTargetPhrase] = useState(null);

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

  // Real-time characteristic phrase & pakad detector
  const {
    noteHistory,
    caughtPhrases,
    phraseScores,
    latestCatch,
    clearHistory,
  } = usePhraseTracker({ readout, listening, tonicHz });

  // Real-time Swara & Raga matching engine (Melakartas + Janyas)
  const {
    dwellTimes,
    matchResult,
    targetRaga,
    setTargetRaga,
    guideMode,
    setGuideMode,
    targetProgress,
    resetTracker,
  } = useSwaraTracker({ readout, listening, tonicHz, phraseScores });

  // Interactive trajectory runway (Scale Arohana/Avarohana & Pakad runs)
  const {
    runState,
    activeNote,
    resetRun,
    tanpuraPlaying,
    toggleTanpura,
  } = useArohanaTracker({ readout, listening, tonicHz, targetRaga, targetPhrase });

  // Jump from Phrase Recognizer to Runway with a chosen phrase
  const handleSelectPhraseForRunway = useCallback((phrase) => {
    setTargetPhrase(phrase);

    // If the phrase has associated raga, sync targetRaga
    if (phrase.ragaId) {
      const janya = JANYA_RAGAS.find((j) => j.id === phrase.ragaId);
      if (janya) {
        setTargetRaga(janya);
      } else if (phrase.melakartaNum) {
        const mela = MELAKARTA_RAGAS[phrase.melakartaNum - 1];
        if (mela) setTargetRaga(mela);
      }
    }

    setActiveTab('runway');
  }, [setTargetRaga]);

  return (
    <div className="app">
      <header className="bar">
        <div className="bar-headings">
          <h1 className="title">Carnatic Raga Identifier</h1>
          <p className="purpose">
            Step 6: Real-time <strong>Janya Ragas</strong>, dynamic <strong>Arohana–Avarohana runways</strong>, and signature phrase (<strong>Pakad</strong>) recognition.
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
          <span>🛫 Scale &amp; Phrase Runway</span>
          <span className="tab-pill">Step 5 &amp; 6</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'matcher' ? 'active' : ''}`}
          onClick={() => setActiveTab('matcher')}
          type="button"
        >
          <span>🎯 Raga Matcher (Melakarta &amp; Janya)</span>
          {matchResult.activeCount > 0 && (
            <span className="tab-pill gold">{matchResult.activeCount} notes</span>
          )}
        </button>

        <button
          className={`tab-btn ${activeTab === 'phrases' ? 'active' : ''}`}
          onClick={() => setActiveTab('phrases')}
          type="button"
        >
          <span>🎶 Phrase &amp; Pakad Recognizer</span>
          {caughtPhrases.length > 0 ? (
            <span className="tab-pill gold">{caughtPhrases.length} caught</span>
          ) : (
            <span className="tab-pill new">Step 6</span>
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
          targetPhrase={targetPhrase}
          setTargetPhrase={setTargetPhrase}
          tanpuraPlaying={tanpuraPlaying}
          toggleTanpura={toggleTanpura}
          onOpenTanpuraControls={() => setShowTanpuraControls(true)}
          listening={listening}
          tonicHz={tonicHz}
        />
      ) : activeTab === 'matcher' ? (
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
      ) : (
        <PhraseRecognizer
          noteHistory={noteHistory}
          caughtPhrases={caughtPhrases}
          phraseScores={phraseScores}
          latestCatch={latestCatch}
          clearHistory={clearHistory}
          onSelectPhraseForRunway={handleSelectPhraseForRunway}
          onSelectRaga={setTargetRaga}
          listening={listening}
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
        <span className="foot-scale">10s history · Real-time Janya &amp; Pakad engine active</span>
      </footer>
    </div>
  );
}
