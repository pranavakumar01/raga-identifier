import { useMemo } from 'react';
import { MELAKARTA_RAGAS } from '../audio/melakarta.js';
import { JANYA_RAGAS } from '../audio/janya.js';

export default function ArohanaRunway({
  runState,
  activeNote,
  resetRun,
  targetRaga,
  setTargetRaga,
  targetPhrase,
  setTargetPhrase,
  tanpuraPlaying,
  toggleTanpura,
  onOpenTanpuraControls,
  listening,
  tonicHz,
}) {
  const {
    isPhraseMode,
    phraseTarget,
    phraseSteps,
    phase,
    status,
    currentStepIdx,
    arohanaSteps,
    avarohanaSteps,
    totalHits,
    totalSteps,
    alienNotesCount,
    score,
    durationSec,
  } = runState;

  // Selected raga phrases if any
  const availablePhrases = useMemo(() => {
    if (!targetRaga) return [];
    if (targetRaga.phrases) return targetRaga.phrases;
    // Check if JANYA_RAGAS has this raga
    const foundJanya = JANYA_RAGAS.find((j) => j.id === targetRaga.id || j.name === targetRaga.name);
    return foundJanya ? foundJanya.phrases : [];
  }, [targetRaga]);

  const handleSelectRagaOrJanya = (e) => {
    const val = e.target.value;
    if (!val) return;

    if (val.startsWith('janya_')) {
      const janyaId = val.replace('janya_', '');
      const found = JANYA_RAGAS.find((j) => j.id === janyaId);
      if (found) {
        setTargetPhrase(null);
        setTargetRaga(found);
      }
    } else {
      const num = parseInt(val, 10);
      if (!isNaN(num) && num > 0) {
        setTargetPhrase(null);
        setTargetRaga(MELAKARTA_RAGAS[num - 1]);
      }
    }
  };

  const handleSelectPhrase = (e) => {
    const pId = e.target.value;
    if (!pId) {
      setTargetPhrase(null);
      return;
    }
    const found = availablePhrases.find((p) => p.id === pId);
    if (found) {
      setTargetPhrase({
        ...found,
        ragaName: targetRaga.name,
        displayName: targetRaga.displayName,
      });
    }
  };

  const clearTarget = () => {
    setTargetPhrase(null);
    setTargetRaga(null);
  };

  return (
    <section className="runway-panel">
      {/* Runway Header */}
      <div className="runway-header">
        <div className="runway-title-group">
          <div className="runway-step-badge">Step 5 &amp; 6</div>
          <h2 className="runway-title">
            {isPhraseMode ? 'Pakad / Phrase Practice Runway' : 'Arohanam–Avarohanam Trajectory Runway'}
          </h2>
        </div>

        <div className="runway-controls">
          <button
            className={`tanpura-btn ${tanpuraPlaying ? 'playing' : ''}`}
            onClick={toggleTanpura}
            type="button"
            title="Toggle authentic acoustic Tanpura drone"
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

      {/* Target Raga & Phrase Selector Row */}
      <div className="runway-selector-bar">
        <div className="runway-selector-item">
          <label className="selector-label">Target Raga:</label>
          <select
            className="raga-dropdown"
            value={
              targetRaga
                ? targetRaga.isJanya
                  ? `janya_${targetRaga.id}`
                  : targetRaga.number
                : ''
            }
            onChange={handleSelectRagaOrJanya}
          >
            <option value="">Choose Scale to Practice...</option>
            <optgroup label="🌟 Famous Carnatic Janya Ragas">
              {JANYA_RAGAS.map((j) => (
                <option key={j.id} value={`janya_${j.id}`}>
                  {j.displayName} ({j.category} · #{j.melakartaNum} {j.melakartaName})
                </option>
              ))}
            </optgroup>
            <optgroup label="🏛️ 72 Melakarta Parent Scales">
              {MELAKARTA_RAGAS.map((r) => (
                <option key={r.number} value={r.number}>
                  #{r.number} {r.displayName} ({r.chakra} / {r.mType} M)
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {targetRaga && availablePhrases.length > 0 && (
          <div className="runway-selector-item">
            <label className="selector-label">Practice Specific Pakad:</label>
            <select
              className="raga-dropdown phrase-select"
              value={targetPhrase ? targetPhrase.id : ''}
              onChange={handleSelectPhrase}
            >
              <option value="">Full Scale (Arohanam - Avarohanam)</option>
              {availablePhrases.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.isPakad ? '★ ' : ''}
                  {p.name}: {p.swaras.join(' ')}
                </option>
              ))}
            </select>
          </div>
        )}

        {targetRaga && (
          <button
            className="raga-action-btn secondary clear-btn"
            onClick={clearTarget}
            type="button"
          >
            Clear Selection
          </button>
        )}
      </div>

      {/* Target Raga Selector Placeholder if none selected */}
      {!targetRaga && !isPhraseMode ? (
        <div className="runway-choose-card">
          <p className="runway-choose-msg">
            Select a <strong>Janya Raga</strong> (such as Mohanam, Hindolam, Hamsadhwani, Bhairavi) or a{' '}
            <strong>72 Melakarta scale</strong> to practice its canonical path:
          </p>
          <div className="runway-quick-pills">
            <span className="pills-title">Quick Picks:</span>
            {['mohanam', 'hindolam', 'hamsadhwani', 'madhyamavati', 'bhairavi', 'kambhoji'].map(
              (id) => {
                const j = JANYA_RAGAS.find((r) => r.id === id);
                if (!j) return null;
                return (
                  <button
                    key={j.id}
                    className="quick-pick-pill"
                    onClick={() => {
                      setTargetPhrase(null);
                      setTargetRaga(j);
                    }}
                    type="button"
                  >
                    {j.name} ({j.category.split(' ')[0]})
                  </button>
                );
              }
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Status & Score Banner */}
          <div className="runway-status-banner">
            <div className="runway-status-info">
              <div className="runway-raga-chip">
                {targetRaga && (
                  <>
                    <span className="chip-num">
                      {targetRaga.isJanya ? `Janya` : `#${targetRaga.number}`}
                    </span>
                    <span className="chip-name">{targetRaga.displayName}</span>
                    {targetRaga.isJanya && (
                      <span className="chip-parent">
                        (Mela #{targetRaga.melakartaNum} {targetRaga.melakartaName})
                      </span>
                    )}
                  </>
                )}
                {isPhraseMode && phraseTarget && (
                  <span className="chip-phrase-badge">Pakad Practice Mode</span>
                )}
              </div>

              <div className="runway-phase-msg">
                {status === 'waiting_to_start' && (
                  <span className="msg-waiting">
                    🎙️ Sing <strong>{isPhraseMode ? phraseSteps[0]?.symbol : 'base Sa (S)'}</strong> to start...
                  </span>
                )}
                {status === 'in_progress' && phase === 'arohanam' && (
                  <span className="msg-ascending">
                    ↗️ <strong>Arohanam (Ascent)</strong>: Progressing towards apex note...
                  </span>
                )}
                {status === 'at_apex' && (
                  <span className="msg-apex">
                    ✨ <strong>Apex Reached!</strong> Now descend smoothly through the Avarohanam...
                  </span>
                )}
                {status === 'in_progress' && phase === 'avarohanam' && (
                  <span className="msg-descending">
                    ↘️ <strong>Avarohanam (Descent)</strong>: Descending back towards base Sa...
                  </span>
                )}
                {status === 'in_progress' && phase === 'phrase' && (
                  <span className="msg-ascending">
                    🎶 <strong>Hitting Phrase Steps</strong>: Advance through the characteristic notes...
                  </span>
                )}
                {status === 'completed' && (
                  <span className="msg-complete">
                    🎉 <strong>{isPhraseMode ? 'Phrase Perfect!' : 'Scale Cycle Complete!'}</strong> Trajectory verified.
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
                <span className="metric-val">
                  {totalHits}/{totalSteps || (isPhraseMode ? phraseSteps.length : 16)}
                </span>
                <span className="metric-lbl">Swaras Hit</span>
              </div>
              {alienNotesCount > 0 && (
                <div className="metric-box warning">
                  <span className="metric-val">-{alienNotesCount * (isPhraseMode ? 5 : 4)}%</span>
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
              <span className="held-cents">
                ({activeNote.cents > 0 ? `+${activeNote.cents}` : activeNote.cents}c)
              </span>
              {targetRaga && !targetRaga.swarasthanaSet.has(activeNote.swarasthanaIndex) && (
                <span className="held-warning">⚠️ Anyaswara (Foreign Note)</span>
              )}
            </div>
          )}

          {/* Phrase Practice Runway Track */}
          {isPhraseMode && phraseSteps && (
            <div className="track-container phrase-track">
              <div className="track-label-row">
                <span className="track-title">
                  🎯 Practice Phrase: {phraseTarget?.name || 'Pakad Run'}
                </span>
                <span className="track-direction">
                  {phraseSteps.map((s) => s.symbol).join(' ──> ')}
                </span>
              </div>

              <div className="track-nodes">
                {phraseSteps.map((step, idx) => {
                  const isCurrent = currentStepIdx === idx && status !== 'completed';
                  return (
                    <div key={idx} className="track-node-wrapper">
                      <div className={`track-node ${step.state} ${isCurrent ? 'current-target' : ''}`}>
                        <span className="node-symbol">{step.symbol}</span>
                        {step.state === 'hit' && <span className="node-check">✓</span>}
                        {isCurrent && <span className="node-pulse" />}
                      </div>
                      <span className="node-sub">Step {idx + 1}</span>
                      {step.cents !== 0 && step.state === 'hit' && (
                        <span className="node-cents">
                          {step.cents > 0 ? `+${step.cents}` : step.cents}c
                        </span>
                      )}
                      {idx < phraseSteps.length - 1 && (
                        <div
                          className={`node-connector ${
                            step.state === 'hit' ? 'connector-hit' : ''
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {phraseTarget?.description && (
                <p className="track-phrase-context">{phraseTarget.description}</p>
              )}
            </div>
          )}

          {/* Standard Scale Runway Tracks (Arohanam & Avarohanam) */}
          {!isPhraseMode && (
            <>
              {/* 1. Arohanam (Ascent) Track */}
              <div className="track-container">
                <div className="track-label-row">
                  <span className="track-title">1. Arohanam (Ascending Run)</span>
                  <span className="track-direction">
                    {targetRaga.arohanaStr
                      ? targetRaga.arohanaStr.split(' ').join(' ──> ')
                      : 'S ──> R ──> G ──> M ──> P ──> D ──> N ──> Ṡ'}
                  </span>
                </div>

                <div className="track-nodes">
                  {arohanaSteps.map((step, idx) => {
                    const isCurrent =
                      phase === 'arohanam' && currentStepIdx === idx && status !== 'completed';
                    return (
                      <div key={idx} className="track-node-wrapper">
                        <div
                          className={`track-node ${step.state} ${
                            isCurrent ? 'current-target' : ''
                          }`}
                        >
                          <span className="node-symbol">{step.symbol}</span>
                          {step.state === 'hit' && <span className="node-check">✓</span>}
                          {step.state === 'skipped' && <span className="node-skip">⤼</span>}
                          {isCurrent && <span className="node-pulse" />}
                        </div>
                        <span className="node-sub">{step.name.split(' ')[0]}</span>
                        {step.cents !== 0 && step.state === 'hit' && (
                          <span className="node-cents">
                            {step.cents > 0 ? `+${step.cents}` : step.cents}c
                          </span>
                        )}
                        {idx < arohanaSteps.length - 1 && (
                          <div
                            className={`node-connector ${
                              step.state === 'hit' ? 'connector-hit' : ''
                            }`}
                          />
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
                  <span className="track-direction">
                    {targetRaga.avarohanaStr
                      ? targetRaga.avarohanaStr.split(' ').join(' ──> ')
                      : 'Ṡ ──> N ──> D ──> P ──> M ──> G ──> R ──> S'}
                  </span>
                </div>

                <div className="track-nodes">
                  {avarohanaSteps.map((step, idx) => {
                    const isCurrent =
                      phase === 'avarohanam' && currentStepIdx === idx && status !== 'completed';
                    return (
                      <div key={idx} className="track-node-wrapper">
                        <div
                          className={`track-node ${step.state} ${
                            isCurrent ? 'current-target' : ''
                          }`}
                        >
                          <span className="node-symbol">{step.symbol}</span>
                          {step.state === 'hit' && <span className="node-check">✓</span>}
                          {step.state === 'skipped' && <span className="node-skip">⤼</span>}
                          {isCurrent && <span className="node-pulse" />}
                        </div>
                        <span className="node-sub">{step.name.split(' ')[0]}</span>
                        {step.cents !== 0 && step.state === 'hit' && (
                          <span className="node-cents">
                            {step.cents > 0 ? `+${step.cents}` : step.cents}c
                          </span>
                        )}
                        {idx < avarohanaSteps.length - 1 && (
                          <div
                            className={`node-connector ${
                              step.state === 'hit' ? 'connector-hit' : ''
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
