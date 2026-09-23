import { useMemo, useState } from 'react';
import { MELAKARTA_RAGAS } from '../audio/melakarta.js';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterChakra, setFilterChakra] = useState('all');

  const { candidates, sungIndices, activeCount, distinguishingNotes } = matchResult;

  // Filtered ragas list for the selector modal / dropdown
  const filteredRagas = useMemo(() => {
    return MELAKARTA_RAGAS.filter((r) => {
      const matchSearch =
        searchQuery === '' ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.popular && r.popular.toLowerCase().includes(searchQuery.toLowerCase())) ||
        r.number.toString() === searchQuery.trim();
      const matchChakra =
        filterChakra === 'all' ||
        (filterChakra === 'suddha' && r.mType === 'Suddha') ||
        (filterChakra === 'prati' && r.mType === 'Prati') ||
        r.chakra.toLowerCase() === filterChakra.toLowerCase();
      return matchSearch && matchChakra;
    });
  }, [searchQuery, filterChakra]);

  const handleSelectTarget = (e) => {
    const num = parseInt(e.target.value, 10);
    if (!isNaN(num) && num > 0) {
      const selected = MELAKARTA_RAGAS[num - 1];
      setTargetRaga(selected);
      setGuideMode(true);
    } else {
      setTargetRaga(null);
      setGuideMode(false);
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
          <div className="raga-badge">Step 4</div>
          <h2 className="raga-panel-title">Melakarta Raga Identification</h2>
          <span className="raga-panel-count">
            {activeCount > 0 ? `${activeCount} swaras detected` : '72 Parent Scales'}
          </span>
        </div>

        <div className="raga-panel-controls">
          <div className="raga-select-wrapper">
            <select
              className="raga-dropdown"
              value={targetRaga ? targetRaga.number : ''}
              onChange={handleSelectTarget}
            >
              <option value="">Choose Target Raga (Practice Guide)...</option>
              {MELAKARTA_RAGAS.map((r) => (
                <option key={r.number} value={r.number}>
                  #{r.number} {r.displayName} ({r.chakra} / {r.mType} M)
                </option>
              ))}
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
              <span className="target-tag">Target Raga #{targetRaga.number}</span>
              <h3 className="target-name">{targetRaga.displayName}</h3>
              <span className="target-meta">
                Chakra {targetRaga.chakraNumber} ({targetRaga.chakra}) · {targetRaga.mType} Madhyamam
              </span>
            </div>
            <div className="target-arohana">
              <strong>Scale:</strong> <code>{targetRaga.arohana}</code>
            </div>
          </div>

          <div className="target-progress-box">
            <div className="target-progress-label">
              <span>Practice Progress</span>
              <strong>
                {targetProgress ? targetProgress.hitCount : 0} / 7 Notes Sung
              </strong>
            </div>
            <div className="target-progress-track">
              <div
                className="target-progress-bar"
                style={{
                  width: `${((targetProgress ? targetProgress.hitCount : 0) / 7) * 100}%`,
                }}
              />
            </div>
            {targetProgress && targetProgress.allHit && (
              <span className="target-complete-badge">✨ Complete Scale Verified!</span>
            )}
          </div>
        </div>
      )}

      {/* Active 12 Swarasthanas Matrix */}
      <div className="swara-matrix-card">
        <div className="swara-matrix-header">
          <span className="matrix-title">Detected Swaras</span>
          <span className="matrix-subtitle">
            {tonicHz
              ? 'Sustained notes registered relative to your Sa'
              : 'Calibrate your Sa to map swaras'}
          </span>
        </div>

        <div className="swara-matrix-grid">
          {SWARASTHANAS.map((s) => {
            const isSung = (dwellTimes[s.index] || 0) >= 120;
            const dwellSec = ((dwellTimes[s.index] || 0) / 1000).toFixed(1);
            const inTarget = targetRaga ? targetRaga.swarasthanaSet.has(s.index) : null;
            const isAnyaswara = targetRaga && isSung && !inTarget;

            let statusClass = '';
            if (isAnyaswara) {
              statusClass = 'anyaswara';
            } else if (isSung) {
              statusClass = inTarget ? 'hit-target' : 'sung';
            } else if (inTarget) {
              statusClass = 'target-note';
            }

            return (
              <div
                key={s.index}
                className={`swara-cell ${s.isAchala ? 'achala' : ''} ${statusClass}`}
                title={`${s.name} (${s.alias}) - ${dwellSec}s voiced`}
              >
                <div className="swara-cell-top">
                  <span className="swara-cell-sym">{s.symbol}</span>
                  {isSung && <span className="swara-cell-check">✓</span>}
                </div>
                <span className="swara-cell-alias">{s.alias}</span>
                {isSung && <span className="swara-cell-dwell">{dwellSec}s</span>}
                {isAnyaswara && <span className="anyaswara-tag">Anyaswara!</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Disambiguation Guide (if multiple top candidates) */}
      {distinguishingNotes && distinguishingNotes.length > 0 && !targetRaga && (
        <div className="distinguish-bar">
          <span className="distinguish-icon">💡</span>
          <div className="distinguish-text">
            <strong>Disambiguation Tip:</strong> Sing{' '}
            {distinguishingNotes.slice(0, 3).map((d, i) => (
              <span key={d.index} className="distinguish-pill">
                <strong>{d.symbol}</strong>
              </span>
            ))}{' '}
            to distinguish between the top candidate ragas!
          </div>
        </div>
      )}

      {/* Candidate Matches */}
      <div className="candidates-section">
        <div className="candidates-header">
          <h3 className="candidates-title">
            {activeCount === 0
              ? 'Candidate Melakartas'
              : `Matching Ragas (${candidates.length} candidate${candidates.length === 1 ? '' : 's'})`}
          </h3>
          {activeCount > 0 && (
            <span className="candidates-subtitle">
              Ranked by scale compatibility and note coverage
            </span>
          )}
        </div>

        {activeCount === 0 ? (
          <div className="empty-candidates">
            <span className="empty-icon">🎵</span>
            <p className="empty-msg">
              No swaras recorded yet. Sing notes (e.g.{' '}
              <code>S — R — G — M — P — D — N</code>) to identify your raga in real time.
            </p>
          </div>
        ) : candidates.length === 0 ? (
          <div className="no-match-box">
            <span className="no-match-icon">⚠️</span>
            <p>
              No Melakarta scale matches the current combination of swaras (may be a non-Melakarta
              phrase or conflicting swaras were sung). Click <strong>↺ Reset Notes</strong> to try again.
            </p>
          </div>
        ) : (
          <div className="candidate-grid">
            {candidates.map((cand) => {
              const { raga, score, isPure, coveredNotes, missingNotes } = cand;
              const isSelected = targetRaga && targetRaga.number === raga.number;

              return (
                <div
                  key={raga.number}
                  className={`candidate-card ${isPure ? 'pure' : 'mixed'} ${isSelected ? 'selected' : ''}`}
                >
                  <div className="candidate-top">
                    <div className="candidate-info">
                      <div className="candidate-num-badge">#{raga.number}</div>
                      <div>
                        <h4 className="candidate-name">{raga.displayName}</h4>
                        <span className="candidate-chakra">
                          Chakra {raga.chakraNumber} ({raga.chakra}) · {raga.mType} M
                        </span>
                      </div>
                    </div>

                    <div className="candidate-score-box">
                      <span className="candidate-score-num">{score}%</span>
                      <span className="candidate-score-label">Match</span>
                    </div>
                  </div>

                  {/* Arohana / Scale */}
                  <div className="candidate-scale">
                    {raga.swaras.map((sw) => {
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
                      {coveredNotes.length} of 7 swaras verified
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
                          setTargetRaga(raga);
                          setGuideMode(true);
                        }
                      }}
                      type="button"
                    >
                      {isSelected ? '✓ In Practice' : 'Practice Raga'}
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
