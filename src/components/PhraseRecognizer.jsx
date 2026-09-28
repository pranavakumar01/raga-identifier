import { useMemo, useState } from 'react';
import { ALL_RECOGNIZABLE_PHRASES } from '../audio/janya.js';

export default function PhraseRecognizer({
  noteHistory,
  caughtPhrases,
  phraseScores,
  latestCatch,
  clearHistory,
  onSelectPhraseForRunway,
  onSelectRaga,
  listening,
  tonicHz,
}) {
  const [bankSearch, setBankSearch] = useState('');
  const [bankFilter, setBankFilter] = useState('all'); // 'all' | 'janya' | 'melakarta'

  // Filter phrases in the Phrase Bank
  const filteredPhrases = useMemo(() => {
    return ALL_RECOGNIZABLE_PHRASES.filter((p) => {
      const matchType =
        bankFilter === 'all' ||
        (bankFilter === 'janya' && p.isJanya) ||
        (bankFilter === 'melakarta' && !p.isJanya);

      const matchText =
        bankSearch === '' ||
        p.name.toLowerCase().includes(bankSearch.toLowerCase()) ||
        p.ragaName.toLowerCase().includes(bankSearch.toLowerCase()) ||
        p.swaras.join(' ').toLowerCase().includes(bankSearch.toLowerCase());

      return matchType && matchText;
    });
  }, [bankSearch, bankFilter]);

  return (
    <section className="phrase-panel">
      {/* Header */}
      <div className="phrase-header">
        <div className="phrase-title-group">
          <h2 className="phrase-title">Signature Phrase Detector</h2>
          <span className="phrase-sub">
            Recognizes famous melodic catchphrases (Pakads / signature sequences) as you sing them.
          </span>
        </div>

        <div className="phrase-actions">
          <button
            className="raga-action-btn warning"
            onClick={clearHistory}
            type="button"
            title="Reset note history and phrase catches"
          >
            ↺ Clear History
          </button>
        </div>
      </div>

      {/* Live Singing Tape (Streaming Notes) */}
      <div className="phrase-tape-container">
        <div className="tape-header">
          <span className="tape-label">
            🎙️ Live Singing Stream {listening ? '(Listening)' : '(Mic Idle)'}
          </span>
          <span className="tape-hint">
            {noteHistory.length > 0
              ? `${noteHistory.length} recent swaras captured in sliding buffer`
              : 'Sing notes steadily to see the swara stream...'}
          </span>
        </div>

        <div className="phrase-tape">
          {noteHistory.length === 0 ? (
            <div className="tape-empty">
              <span>Sing or hum continuous notes into your mic to trigger phrase recognition...</span>
            </div>
          ) : (
            noteHistory.map((note, idx) => (
              <div key={`${idx}_${note.arrivedAt}`} className="tape-swara-item">
                <div className={`tape-bubble ${note.isAchala ? 'achala' : ''}`}>
                  <span className="tape-swara-sym">{note.symbol}</span>
                  {note.cents !== 0 && (
                    <span className="tape-swara-cents">
                      {note.cents > 0 ? `+${note.cents}` : note.cents}c
                    </span>
                  )}
                </div>
                <span className="tape-swara-name">{note.name.split(' ')[0]}</span>
                {idx < noteHistory.length - 1 && <span className="tape-arrow">➔</span>}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Live Catch Celebration Banner */}
      {latestCatch && (
        <div className="phrase-catch-banner">
          <div className="catch-badge-pulse">✨ PHRASE IDENTIFIED!</div>
          <div className="catch-body">
            <div className="catch-raga-meta">
              <span className="catch-raga-name">{latestCatch.displayName}</span>
              <span className="catch-category-pill">{latestCatch.category}</span>
              {latestCatch.isJanya && (
                <span className="catch-parent-pill">
                  Derived from #{latestCatch.melakartaNum} {latestCatch.melakartaName}
                </span>
              )}
            </div>

            <h3 className="catch-phrase-title">{latestCatch.phraseName}</h3>

            <div className="catch-swara-sequence">
              {latestCatch.swaras.map((sw, i) => (
                <span key={i} className="catch-swara-chip">
                  {sw}
                </span>
              ))}
            </div>

            <p className="catch-desc">{latestCatch.description}</p>
          </div>

          <div className="catch-actions">
            {onSelectPhraseForRunway && (
              <button
                className="phrase-runway-btn"
                onClick={() => onSelectPhraseForRunway(latestCatch)}
                type="button"
              >
                🛫 Practice on Runway
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Grid: Caught Log vs Phrase Library */}
      <div className="phrase-grid">
        {/* Left Column: Recent Caught Phrases Log */}
        <div className="phrase-col">
          <div className="col-header">
            <h3 className="col-title">
              📜 Captured Phrases in this Session ({caughtPhrases.length})
            </h3>
            {caughtPhrases.length > 0 && (
              <span className="col-badge gold">
                {Object.keys(phraseScores).length} Ragas Triggered
              </span>
            )}
          </div>

          <div className="caught-list">
            {caughtPhrases.length === 0 ? (
              <div className="caught-empty">
                <p>No phrases captured yet in this session.</p>
                <small>
                  Try singing signature motifs like Mohanam&#39;s <strong>G₃ P D₂ P G₃</strong>, Hindolam&#39;s{' '}
                  <strong>S M₁ G₂ M₁</strong>, or Hamsadhwani&#39;s <strong>S R₂ G₃ P</strong>.
                </small>
              </div>
            ) : (
              caughtPhrases.map((catchItem) => (
                <div key={catchItem.id} className="caught-card">
                  <div className="caught-card-top">
                    <div className="caught-raga-chip">
                      <strong>{catchItem.ragaName}</strong>
                      {catchItem.isJanya ? (
                        <span className="chip-sub">Janya (#{catchItem.melakartaNum})</span>
                      ) : (
                        <span className="chip-sub">Melakarta</span>
                      )}
                    </div>
                    <span className="caught-time">{catchItem.timeStr}</span>
                  </div>

                  <div className="caught-phrase-name">{catchItem.phraseName}</div>

                  <div className="caught-sequence-row">
                    {catchItem.swaras.map((s, idx) => (
                      <span key={idx} className="seq-swara">
                        {s}
                      </span>
                    ))}
                    <span className="caught-confidence">({catchItem.confidence}% match)</span>
                  </div>

                  <p className="caught-desc-text">{catchItem.description}</p>

                  <div className="caught-card-actions">
                    {onSelectPhraseForRunway && (
                      <button
                        className="mini-action-btn"
                        onClick={() => onSelectPhraseForRunway(catchItem)}
                        type="button"
                      >
                        🛫 Practice in Runway
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Master Carnatic Phrase & Pakad Library */}
        <div className="phrase-col">
          <div className="col-header">
            <h3 className="col-title">📚 Canonical Carnatic Phrase Library</h3>
            <span className="col-badge">{filteredPhrases.length} Available</span>
          </div>

          {/* Search & Filter Filters */}
          <div className="bank-filter-bar">
            <input
              type="text"
              className="bank-search-input"
              placeholder="Search by raga name or swaras (e.g. Mohanam, G P D P G)..."
              value={bankSearch}
              onChange={(e) => setBankSearch(e.target.value)}
            />

            <div className="bank-pill-row">
              <button
                className={`bank-pill ${bankFilter === 'all' ? 'active' : ''}`}
                onClick={() => setBankFilter('all')}
                type="button"
              >
                All
              </button>
              <button
                className={`bank-pill ${bankFilter === 'janya' ? 'active' : ''}`}
                onClick={() => setBankFilter('janya')}
                type="button"
              >
                Janya Ragas
              </button>
              <button
                className={`bank-pill ${bankFilter === 'melakarta' ? 'active' : ''}`}
                onClick={() => setBankFilter('melakarta')}
                type="button"
              >
                Melakartas
              </button>
            </div>
          </div>

          <div className="bank-list">
            {filteredPhrases.map((phrase) => (
              <div key={phrase.id} className="bank-phrase-card">
                <div className="bank-card-header">
                  <div>
                    <span className="bank-raga-name">{phrase.displayName}</span>
                    <span className="bank-cat-label">{phrase.category}</span>
                  </div>

                  {phrase.isPakad && <span className="pakad-badge">Prime Pakad</span>}
                </div>

                <div className="bank-phrase-title">{phrase.name}</div>

                <div className="bank-swaras">
                  {phrase.swaras.map((sw, idx) => (
                    <span key={idx} className="bank-swara-item">
                      {sw}
                    </span>
                  ))}
                </div>

                <p className="bank-phrase-desc">{phrase.description}</p>

                <div className="bank-card-footer">
                  {onSelectPhraseForRunway && (
                    <button
                      className="bank-practice-btn"
                      onClick={() => onSelectPhraseForRunway(phrase)}
                      type="button"
                      title="Load this phrase into the Runway to practice step-by-step"
                    >
                      🛫 Practice on Runway
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
