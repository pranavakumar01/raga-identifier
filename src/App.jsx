import { useCallback, useEffect, useState } from 'react';
import PitchPlot from './components/PitchPlot.jsx';
import Readout from './components/Readout.jsx';
import RagaMatcher from './components/RagaMatcher.jsx';
import ArohanaRunway from './components/ArohanaRunway.jsx';
import PhraseRecognizer from './components/PhraseRecognizer.jsx';
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
  const [targetPhrase, setTargetPhrase] = useState(null);

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('carnatic_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('carnatic_theme', theme);
  }, [theme]);

  // Sync with OS theme change if user hasn't explicitly set one
  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const saved = localStorage.getItem('carnatic_theme');
      if (!saved) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

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
            Sing, hum, or play into the microphone to identify ragas and practice scales note-by-note in real-time.
          </p>
        </div>
        <div className="header-actions">
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            type="button"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle dark/light theme"
          >
            {theme === 'dark' ? (
              <>
                <span className="theme-toggle-icon">☀️</span>
                <span className="theme-toggle-text">Light</span>
              </>
            ) : (
              <>
                <span className="theme-toggle-icon">🌙</span>
                <span className="theme-toggle-text">Dark</span>
              </>
            )}
          </button>
          <button
            className={`tanpura-mini-btn ${tanpuraPlaying ? 'active' : ''}`}
            onClick={toggleTanpura}
            type="button"
            title="Toggle authentic acoustic Tanpura drone"
          >
            🪕 {tanpuraPlaying ? 'Drone ON' : 'Tanpura'}
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
          <span>🎯 Practice &amp; Sing Along</span>
          <span className="tab-pill">Note-by-Note</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'matcher' ? 'active' : ''}`}
          onClick={() => setActiveTab('matcher')}
          type="button"
        >
          <span>🔍 Identify My Raga</span>
          {matchResult.activeCount > 0 ? (
            <span className="tab-pill gold">{matchResult.activeCount} notes</span>
          ) : (
            <span className="tab-pill">Sing Freely</span>
          )}
        </button>

        <button
          className={`tab-btn ${activeTab === 'phrases' ? 'active' : ''}`}
          onClick={() => setActiveTab('phrases')}
          type="button"
        >
          <span>🎶 Signature Phrases</span>
          {caughtPhrases.length > 0 ? (
            <span className="tab-pill gold">{caughtPhrases.length} caught</span>
          ) : (
            <span className="tab-pill">Famous Hooks</span>
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
