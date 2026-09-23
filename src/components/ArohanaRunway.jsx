import { MELAKARTA_RAGAS } from '../audio/melakarta.js';

export default function ArohanaRunway({
  runState,
  activeNote,
  resetRun,
  targetRaga,
  setTargetRaga,
  tanpuraPlaying,
  toggleTanpura,
  onOpenTanpuraControls,
  listening,
  tonicHz,
}) {
  const {
    phase,
    status,
    currentStepIdx,
    arohanaSteps,
    avarohanaSteps,
    totalHits,
    alienNotesCount,
    score,
    durationSec,
  } = runState;

  const handleSelectRaga = (e) => {
    const num = parseInt(e.target.value, 10);
    if (!isNaN(num) && num > 0) {
      setTargetRaga(MELAKARTA_RAGAS[num - 1]);
    }
  };

  return (
    <section className="runway-panel">
      {/* Runway Header */}
      <div className="runway-header">
        <div className="runway-title-group">
          <div className="runway-step-badge">Step 5</div>
          <h2 className="runway-title">Arohanam–Avarohanam Trajectory Runway</h2>
        </div>

        <div className="runway-controls">
          <button
            className={`tanpura-btn ${tanpuraPlaying ? 'playing' : ''}`}
            onClick={toggleTanpura}
            type="button"
            title="Toggle authentic acoustic Anubodh Tanpura drone"
          >
            <span className="tanpura-icon">🪕</span>
            <span>{tanpuraPlaying ? 'Acoustic Tanpura Playing' : 'Start Acoustic Tanpura'}</span>
            {tanpuraPlaying && <span className="drone-pulse" />}
          </button>

          <button
            className="tanpura-btn secondary"
            onClick={onOpenTanpuraControls}
            type="button"
            title="Open Tanpura Controls (First String, Pitch, Speed, Volume)"
          >
            ⚙️ Controls
          </button>

          <button
            className="raga-action-btn warning"
            onClick={resetRun}
            type="button"
            title="Reset trajectory progress"
          >
            ↺ Restart Run
          </button>
        </div>
      </div>

      {/* Target Raga Selector if none selected */}
      {!targetRaga ? (
        <div className="runway-choose-card">
          <p className="runway-choose-msg">
            Select a Melakarta raga to practice its canonical <strong>Arohanam (Ascent)</strong> and{' '}
            <strong>Avarohanam (Descent)</strong>:
          </p>
          <select className="raga-dropdown" onChange={handleSelectRaga} defaultValue="">
            <option value="" disabled>
              Select Raga to Practice...
            </option>
            {MELAKARTA_RAGAS.map((r) => (
              <option key={r.number} value={r.number}>
                #{r.number} {r.displayName} ({r.chakra})
              </option>
            ))}
          </select>
        </div>
      ) : (
        <>
          {/* Status & Score Banner */}
          <div className="runway-status-banner">
            <div className="runway-status-info">
              <div className="runway-raga-chip">
                <span className="chip-num">#{targetRaga.number}</span>
                <span className="chip-name">{targetRaga.displayName}</span>
              </div>

              <div className="runway-phase-msg">
                {status === 'waiting_to_start' && (
                  <span className="msg-waiting">
                    🎙️ Start singing base <strong>Sa (S)</strong> to begin the Arohanam...
                  </span>
                )}
                {status === 'in_progress' && phase === 'arohanam' && (
                  <span className="msg-ascending">
                    ↗️ <strong>Arohanam (Ascent)</strong>: Progressing towards Tara Ṡ...
                  </span>
                )}
                {status === 'at_apex' && (
                  <span className="msg-apex">
                    ✨ <strong>Apex Reached (Tara Ṡ)!</strong> Now descend smoothly through the Avarohanam...
                  </span>
                )}
                {status === 'in_progress' && phase === 'avarohanam' && (
                  <span className="msg-descending">
                    ↘️ <strong>Avarohanam (Descent)</strong>: Descending back towards base Sa...
                  </span>
                )}
                {status === 'completed' && (
                  <span className="msg-complete">
                    🎉 <strong>Scale Cycle Complete!</strong> Full Arohanam and Avarohanam verified.
                  </span>
                )}
              </div>
            </div>

            <div className="runway-metrics">
              <div className="metric-box">
                <span className="metric-val">{score}%</span>
                <span className="metric-lbl">Accuracy</span>
              </div>
              <div className="metric-box">
                <span className="metric-val">{totalHits}/16</span>
                <span className="metric-lbl">Swaras Hit</span>
              </div>
              {alienNotesCount > 0 && (
                <div className="metric-box warning">
                  <span className="metric-val">-{alienNotesCount * 4}%</span>
                  <span className="metric-lbl">Anyaswara Penalty</span>
                </div>
              )}
            </div>
          </div>

          {/* Active Note Live Floating Feedback */}
          {listening && activeNote && (
            <div className="live-held-note">
              <span className="held-label">Current Vocal Tone:</span>
              <strong className="held-sym">{activeNote.symbol}</strong>
              <span className="held-name">{activeNote.name}</span>
              <span className="held-cents">({activeNote.cents > 0 ? `+${activeNote.cents}` : activeNote.cents}c)</span>
              {!targetRaga.swarasthanaSet.has(activeNote.swarasthanaIndex) && (
                <span className="held-warning">⚠️ Anyaswara (Foreign Note)</span>
              )}
            </div>
          )}

          {/* 1. Arohanam (Ascent) Track */}
          <div className="track-container">
            <div className="track-label-row">
              <span className="track-title">1. Arohanam (Ascending Run)</span>
              <span className="track-direction">S ──&gt; R ──&gt; G ──&gt; M ──&gt; P ──&gt; D ──&gt; N ──&gt; Ṡ</span>
            </div>

            <div className="track-nodes">
              {arohanaSteps.map((step, idx) => {
                const isCurrent = phase === 'arohanam' && currentStepIdx === idx && status !== 'completed';
                return (
                  <div key={idx} className="track-node-wrapper">
                    <div className={`track-node ${step.state} ${isCurrent ? 'current-target' : ''}`}>
                      <span className="node-symbol">{step.symbol}</span>
                      {step.state === 'hit' && <span className="node-check">✓</span>}
                      {step.state === 'skipped' && <span className="node-skip">⤼</span>}
                      {isCurrent && <span className="node-pulse" />}
                    </div>
                    <span className="node-sub">{step.name.split(' ')[0]}</span>
                    {step.cents !== 0 && step.state === 'hit' && (
                      <span className="node-cents">{step.cents > 0 ? `+${step.cents}` : step.cents}c</span>
                    )}
                    {idx < arohanaSteps.length - 1 && (
                      <div className={`node-connector ${step.state === 'hit' ? 'connector-hit' : ''}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Avarohanam (Descent) Track */}
          <div className="track-container">
            <div className="track-label-row">
              <span className="track-title">2. Avarohanam (Descending Run)</span>
              <span className="track-direction">Ṡ ──&gt; N ──&gt; D ──&gt; P ──&gt; M ──&gt; G ──&gt; R ──&gt; S</span>
            </div>

            <div className="track-nodes">
              {avarohanaSteps.map((step, idx) => {
                const isCurrent = phase === 'avarohanam' && currentStepIdx === idx && status !== 'completed';
                return (
                  <div key={idx} className="track-node-wrapper">
                    <div className={`track-node ${step.state} ${isCurrent ? 'current-target' : ''}`}>
                      <span className="node-symbol">{step.symbol}</span>
                      {step.state === 'hit' && <span className="node-check">✓</span>}
                      {step.state === 'skipped' && <span className="node-skip">⤼</span>}
                      {isCurrent && <span className="node-pulse" />}
                    </div>
                    <span className="node-sub">{step.name.split(' ')[0]}</span>
                    {step.cents !== 0 && step.state === 'hit' && (
                      <span className="node-cents">{step.cents > 0 ? `+${step.cents}` : step.cents}c</span>
                    )}
                    {idx < avarohanaSteps.length - 1 && (
                      <div className={`node-connector ${step.state === 'hit' ? 'connector-hit' : ''}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
