import { useMemo, useState } from 'react';
import { MELAKARTA_RAGAS } from '../audio/melakarta.js';
import { JANYA_RAGAS } from '../audio/janya.js';
import { SWARASTHANAS } from '../audio/notes.js';

export default function RagaMatcher({
  dwellTimes,
  matchResult,
  targetRaga,
  setTargetRaga,
  guideMode,
  setGuideMode,
  targetProgress,
  resetTracker,
  tonicHz,
}) {
  const [filterType, setFilterType] = useState('all'); // 'all' | 'janya' | 'melakarta'

  const { candidates, sungIndices, activeCount, disambiguation } = matchResult;

  // Filter candidates by type
  const displayedCandidates = useMemo(() => {
    if (!candidates) return [];
    if (filterType === 'all') return candidates;
    if (filterType === 'janya') return candidates.filter((c) => c.isJanya);
    if (filterType === 'melakarta') return candidates.filter((c) => !c.isJanya);
    return candidates;
  }, [candidates, filterType]);

  const handleSelectTarget = (e) => {
    const val = e.target.value;
    if (!val) {
      setTargetRaga(null);
      setGuideMode(false);
      return;
    }

    if (val.startsWith('janya_')) {
      const jId = val.replace('janya_', '');
      const found = JANYA_RAGAS.find((j) => j.id === jId);
      if (found) {
        setTargetRaga(found);
        setGuideMode(true);
      }
    } else {
      const num = parseInt(val, 10);
      if (!isNaN(num) && num > 0) {
        const selected = MELAKARTA_RAGAS[num - 1];
        setTargetRaga(selected);
        setGuideMode(true);
      }
    }
  };

  const clearTarget = () => {
    setTargetRaga(null);
    setGuideMode(false);
  };

  return (
    <section className="raga-panel">
      {/* Panel Header */}
      <div className="raga-panel-header">
        <div className="raga-panel-title-group">
          <div className="raga-badge">Step 4 &amp; 6</div>
          <h2 className="raga-panel-title">Melakarta &amp; Janya Raga Identification</h2>
          <span className="raga-panel-count">
            {activeCount > 0 ? `${activeCount} swaras detected` : 'Melakartas & Janya Scales'}
          </span>
        </div>

        <div className="raga-panel-controls">
          <div className="raga-select-wrapper">
            <select
              className="raga-dropdown"
              value={
                targetRaga
                  ? targetRaga.isJanya
                    ? `janya_${targetRaga.id}`
                    : targetRaga.number
                  : ''
              }
              onChange={handleSelectTarget}
            >
              <option value="">Choose Target Scale (Practice Guide)...</option>
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

          {targetRaga && (
            <button
              className="raga-action-btn secondary"
              onClick={clearTarget}
              type="button"
              title="Clear Target Raga"
            >
              Clear Target
            </button>
          )}

          <button
            className="raga-action-btn warning"
            onClick={resetTracker}
            disabled={activeCount === 0}
            type="button"
            title="Reset accumulated sung swaras"
          >
            ↺ Reset Notes
          </button>
        </div>
      </div>

      {/* Target Raga Guided Practice Banner (if target selected) */}
      {targetRaga && (
        <div className="target-banner">
          <div className="target-banner-info">
            <div className="target-banner-heading">
              <span className="target-tag">
                {targetRaga.isJanya ? `Janya Raga` : `Melakarta #${targetRaga.number}`}
              </span>
              <h3 className="target-name">{targetRaga.displayName}</h3>
              <span className="target-meta">
                {targetRaga.isJanya
                  ? `${targetRaga.category} · Derived from #${targetRaga.melakartaNum} ${targetRaga.melakartaName}`
                  : `Chakra ${targetRaga.chakraNumber} (${targetRaga.chakra}) · ${targetRaga.mType} Madhyamam`}
              </span>
            </div>
            <div className="target-arohana">
              <strong>Scale:</strong> <code>{targetRaga.arohanaStr || targetRaga.arohana}</code>
            </div>
          </div>

          <div className="target-progress-box">
            <div className="target-progress-label">
              <span>Practice Progress</span>
              <strong>
                {targetProgress ? targetProgress.hitCount : 0} /{' '}
                {targetProgress ? targetProgress.totalCount : targetRaga.swaras.length} Notes Sung
              </strong>
            </div>
            <div className="target-progress-track">
              <div
                className="target-progress-fill"
                style={{
                  width: `${
                    targetProgress && targetProgress.totalCount > 0
                      ? Math.round((targetProgress.hitCount / targetProgress.totalCount) * 100)
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 12 Swarasthana Sung Heatmap Grid */}
      <div className="swara-matrix-section">
        <div className="matrix-header">
          <span className="matrix-title">12 Swarasthana Vocal Accumulator</span>
          <span className="matrix-subtitle">
            Dwell duration across swarasthanas relative to base Sa
          </span>
        </div>

        <div className="swara-matrix-grid">
          {SWARASTHANAS.map((sw, idx) => {
            const ms = dwellTimes[idx] || 0;
            const sec = (ms / 1000).toFixed(1);
            const isSung = ms >= 120;
            const isInTarget = targetRaga ? targetRaga.swarasthanaSet.has(idx) : false;

            return (
              <div
                key={idx}
                className={`matrix-node ${isSung ? 'active' : ''} ${sw.isAchala ? 'achala' : ''} ${
                  targetRaga && isInTarget ? 'in-target' : ''
                } ${targetRaga && !isInTarget && isSung ? 'anyaswara' : ''}`}
              >
                <div className="node-top">
                  <span className="node-symbol">{sw.symbol}</span>
                  <span className="node-semitone">{idx} st</span>
                </div>
                <span className="node-name">{sw.alias || sw.symbol}</span>
                <span className="node-dwell">{isSung ? `${sec}s` : '—'}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Disambiguation Helper Banner if top matches are close */}
      {disambiguation && (
        <div className="distinguishing-alert">
          <div className="alert-icon">💡</div>
          <div className="alert-body">
            <strong>Disambiguation Insight:</strong> {disambiguation.message}{' '}
            <span>{disambiguation.actionHint}</span>
          </div>
        </div>
      )}

      {/* Candidate Matches */}
      <div className="candidates-section">
        <div className="candidates-header">
          <div className="candidates-title-box">
            <h3 className="candidates-title">
              {activeCount === 0
                ? 'Candidate Ragas'
                : `Matching Ragas (${displayedCandidates.length} candidate${displayedCandidates.length === 1 ? '' : 's'})`}
            </h3>
            {activeCount > 0 && (
              <span className="candidates-subtitle">
                Ranked by scale coverage, anyaswara penalties, and phrase matches
              </span>
            )}
          </div>

          {/* Filter Pills: All / Janya / Melakarta */}
          <div className="filter-pill-group">
            <button
              className={`filter-pill ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
              type="button"
            >
              All
            </button>
            <button
              className={`filter-pill ${filterType === 'janya' ? 'active' : ''}`}
              onClick={() => setFilterType('janya')}
              type="button"
            >
              Janya Ragas
            </button>
            <button
              className={`filter-pill ${filterType === 'melakarta' ? 'active' : ''}`}
              onClick={() => setFilterType('melakarta')}
              type="button"
            >
              Melakartas
            </button>
          </div>
        </div>

        {activeCount === 0 ? (
          <div className="empty-candidates">
            <span className="empty-icon">🎵</span>
            <p className="empty-msg">
              No swaras recorded yet. Sing notes (e.g.{' '}
              <code>S — R — G — M — P — D — N</code>) to identify your raga in real time.
            </p>
          </div>
        ) : displayedCandidates.length === 0 ? (
          <div className="no-match-box">
            <span className="no-match-icon">⚠️</span>
            <p>
              No ragas match the current combination of swaras with the selected filter. Click{' '}
              <strong>↺ Reset Notes</strong> or switch the filter to <strong>All</strong>.
            </p>
          </div>
        ) : (
          <div className="candidate-grid">
            {displayedCandidates.map((cand) => {
              const {
                id,
                name,
                displayName,
                isJanya,
                category,
                melakartaNum,
                melakartaName,
                chakra,
                mType,
                score,
                isPure,
                coveredNotes,
                missingNotes,
                swaras,
                rawRaga,
                phraseBonus,
              } = cand;

              const isSelected =
                targetRaga &&
                (targetRaga.id === id || (!isJanya && targetRaga.number === cand.number));

              return (
                <div
                  key={id}
                  className={`candidate-card ${isPure ? 'pure' : 'mixed'} ${isSelected ? 'selected' : ''}`}
                >
                  <div className="candidate-top">
                    <div className="candidate-info">
                      <div className={`candidate-num-badge ${isJanya ? 'janya' : ''}`}>
                        {isJanya ? 'Janya' : `#${cand.number}`}
                      </div>
                      <div>
                        <h4 className="candidate-name">{displayName}</h4>
                        <span className="candidate-chakra">
                          {isJanya
                            ? `${category} · Parent: #${melakartaNum} ${melakartaName}`
                            : `${chakra} · ${mType} M`}
                        </span>
                      </div>
                    </div>

                    <div className="candidate-score-box">
                      <span className="candidate-score-num">{score}%</span>
                      <span className="candidate-score-label">Match</span>
                      {phraseBonus > 0 && <span className="phrase-bonus-tag">+{phraseBonus}% Pakad</span>}
                    </div>
                  </div>

                  {/* Arohana / Scale Swaras */}
                  <div className="candidate-scale">
                    {swaras.map((sw) => {
                      const isSung = (dwellTimes[sw.index] || 0) >= 120;
                      return (
                        <span
                          key={sw.index}
                          className={`scale-swara-pill ${isSung ? 'sung' : 'missing'}`}
                          title={`${sw.name} (${isSung ? 'Sung' : 'Not yet sung'})`}
                        >
                          {sw.symbol}
                          {isSung ? ' ✓' : ''}
                        </span>
                      );
                    })}
                  </div>

                  <div className="candidate-footer">
                    <span className="candidate-summary">
                      {coveredNotes.length} of {swaras.length} swaras verified
                      {missingNotes.length > 0
                        ? ` · missing: ${missingNotes.map((m) => m.symbol).join(', ')}`
                        : ' · complete scale!'}
                    </span>

                    <button
                      className={`candidate-target-btn ${isSelected ? 'active' : ''}`}
                      onClick={() => {
                        if (isSelected) {
                          clearTarget();
                        } else {
                          setTargetRaga(rawRaga);
                          setGuideMode(true);
                        }
                      }}
                      type="button"
                    >
                      {isSelected ? '✓ In Practice' : 'Practice Scale'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
