import { useEffect, useState } from 'react';
import { PITCH_LIST, VOCAL_PRESETS, tanpura } from '../audio/tanpura.js';

export default function TanpuraControls({ isOpen, onClose, onTonicSync }) {
  const [state, setState] = useState(() => tanpura.getState());

  useEffect(() => {
    return tanpura.subscribe((newState) => {
      setState(newState);
      if (onTonicSync) {
        onTonicSync(newState.effectiveHz);
      }
    });
  }, [onTonicSync]);

  if (!isOpen) return null;

  const {
    isPlaying,
    firstString,
    pauseAfter,
    notation,
    pitchIndex,
    currentPitch,
    effectivePitch,
    effectiveHz,
    pitchSemi,
    pitchCents,
    speed,
    volume,
    isMuted,
    activeString,
  } = state;

  const handleSelectBasePitch = (idx) => {
    tanpura.setPitchIndex(idx);
  };

  const getPitchDisplayName = (p) => {
    if (notation === 'Kattai') {
      return `${p.kattai.replace(' Kattai', '')} (${p.name})`;
    }
    return p.name;
  };

  const getEffectiveDisplayName = () => {
    if (!effectivePitch) return '';
    if (notation === 'Kattai') {
      return `${effectivePitch.kattai} · ${effectivePitch.name}`;
    }
    return `${effectivePitch.name} (${effectivePitch.kattai})`;
  };

  const strings = [
    { num: 1, name: firstString, role: `${firstString} (1st)` },
    { num: 2, name: 'Sa', role: 'Jodi Sa (2nd)' },
    { num: 3, name: 'Sa', role: 'Jodi Sa (3rd)' },
    { num: 4, name: 'Ṡa', role: 'Mandra Sa (4th)' },
  ];

  return (
    <div className="tanpura-modal-backdrop" onClick={onClose}>
      <div className="tanpura-card droid-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="tanpura-card-header">
          <div className="tanpura-card-title-group">
            <span className="tanpura-card-icon">🪕</span>
            <div>
              <h3 className="tanpura-card-title">Tanpura Droid · Acoustic Drone</h3>
              <span className="tanpura-card-sub">Studio Acoustic 4-String Carnatic Tanpura</span>
            </div>
          </div>

          <div className="tanpura-header-actions">
            <button
              className={`droid-power-btn ${isPlaying ? 'on' : ''}`}
              onClick={() => tanpura.toggle()}
              type="button"
              title={isPlaying ? 'Pause Tanpura' : 'Start Tanpura'}
            >
              <span className="power-led" />
              <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </button>
            <button className="tanpura-close-btn" onClick={onClose} type="button" title="Close controls">
              ✕
            </button>
          </div>
        </div>

        {/* 1. Tanpura Droid Animated Strings Bridge Visualizer */}
        <div className="droid-bridge-visualizer">
          <div className="bridge-header">
            <span className="bridge-title">4-String Strumming Cycle</span>
            <span className="bridge-tempo">{Math.round(speed * 100)}% Speed</span>
          </div>

          <div className="droid-strings-grid">
            {strings.map((str, idx) => {
              const isActive = isPlaying && activeString === idx;
              return (
                <div key={str.num} className={`droid-string-col ${isActive ? 'plucking' : ''}`}>
                  <div className={`string-led ${isActive ? 'lit' : ''}`} />
                  <div className="string-wire-track">
                    <div className={`string-wire ${isActive ? 'vibrating' : ''}`} />
                  </div>
                  <div className="string-badge">
                    <strong className="string-note">{str.name}</strong>
                    <span className="string-num">#{str.num}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Sounding Drone LCD Display */}
        <div className="droid-lcd-panel">
          <div className="lcd-left">
            <span className="lcd-label">Sounding Drone Tonic:</span>
            <h2 className="lcd-note-val">{getEffectiveDisplayName()}</h2>
          </div>
          <div className="lcd-right">
            <span className="lcd-hz">{effectiveHz.toFixed(1)} Hz</span>
            <div className="lcd-tuning-tags">
              <span className="tuning-tag">Root: {currentPitch.name}</span>
              {pitchSemi !== 0 && (
                <span className="tuning-tag semi">
                  {pitchSemi > 0 ? `+${pitchSemi}` : pitchSemi} st
                </span>
              )}
              {pitchCents !== 0 && (
                <span className="tuning-tag cents">
                  {pitchCents > 0 ? `+${pitchCents}` : pitchCents}c
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="tanpura-control-rows">
          {/* 3. First String Selection (Pills) */}
          <div className="tanpura-row-group">
            <label className="tanpura-group-label">1. First String (Tuning Mode)</label>
            <div className="droid-pill-row">
              {['Pa', 'Ma', 'Ni', 'Sa'].map((type) => (
                <button
                  key={type}
                  className={`droid-mode-pill ${firstString === type ? 'active' : ''}`}
                  onClick={() => tanpura.setFirstString(type)}
                  type="button"
                >
                  <strong className="pill-name">{type}</strong>
                  <span className="pill-sub">
                    {type === 'Pa'
                      ? 'Panchamam'
                      : type === 'Ma'
                        ? 'Madhyamam'
                        : type === 'Ni'
                          ? 'Nishadham'
                          : 'Shadjam'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Base Pitch 12-Chromatic Grid */}
          <div className="tanpura-row-group">
            <div className="group-header-row">
              <label className="tanpura-group-label">2. Base Pitch (Sruti / Kattai)</label>
              <div className="notation-toggle">
                <button
                  className={`notation-btn ${notation === 'Western' ? 'active' : ''}`}
                  onClick={() => tanpura.setNotation('Western')}
                  type="button"
                >
                  Western
                </button>
                <button
                  className={`notation-btn ${notation === 'Kattai' ? 'active' : ''}`}
                  onClick={() => tanpura.setNotation('Kattai')}
                  type="button"
                >
                  Kattai
                </button>
              </div>
            </div>

            <div className="droid-pitch-grid">
              {PITCH_LIST.map((p, idx) => {
                const isSelected = pitchIndex === idx;
                return (
                  <button
                    key={p.name}
                    className={`droid-pitch-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectBasePitch(idx)}
                    type="button"
                  >
                    <span className="pbtn-name">
                      {notation === 'Kattai' ? p.kattai.replace(' Kattai', '') : p.name}
                    </span>
                    <span className="pbtn-sub">
                      {notation === 'Kattai' ? p.name : `${p.kattai.replace(' Kattai', 'K')}`}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Vocal Presets */}
            <div className="droid-presets-bar">
              <span className="presets-label">Quick Presets:</span>
              <div className="presets-pills">
                {VOCAL_PRESETS.map((vp) => (
                  <button
                    key={vp.label}
                    className={`preset-chip ${vp.type}`}
                    onClick={() => tanpura.applyPreset(vp)}
                    type="button"
                  >
                    {vp.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Dual Tuning Controls: Semitones & Micro Cents */}
          <div className="droid-dual-tuning-row">
            {/* Pitch Semi Stepper */}
            <div className="tuning-box">
              <div className="tuning-box-header">
                <label className="tuning-box-title">Pitch Semi</label>
                <span className="tuning-box-val">
                  {pitchSemi > 0 ? `+${pitchSemi}` : pitchSemi} st
                </span>
              </div>
              <div className="tanpura-stepper">
                <button
                  className="tanpura-step-btn"
                  onClick={() => tanpura.adjustPitchSemi(-1)}
                  type="button"
                  title="Decrease 1 semitone"
                >
                  —
                </button>
                <div className="tanpura-step-display">
                  {pitchSemi > 0 ? `+${pitchSemi}` : pitchSemi}
                </div>
                <button
                  className="tanpura-step-btn"
                  onClick={() => tanpura.adjustPitchSemi(1)}
                  type="button"
                  title="Increase 1 semitone"
                >
                  +
                </button>
              </div>
              <span className="tuning-box-desc">Chromatic half-step shift</span>
            </div>

            {/* Fine Tuning (Micro-Cents) */}
            <div className="tuning-box">
              <div className="tuning-box-header">
                <label className="tuning-box-title">Fine Tune (Cents)</label>
                <span className="tuning-box-val cents-val">
                  {pitchCents > 0 ? `+${pitchCents}` : pitchCents} cents
                </span>
              </div>
              <div className="cents-stepper-row">
                <button
                  className="cents-step-btn"
                  onClick={() => tanpura.adjustPitchCents(-5)}
                  type="button"
                  title="Decrease 5 cents"
                >
                  -5c
                </button>
                <button
                  className="cents-step-btn"
                  onClick={() => tanpura.adjustPitchCents(-1)}
                  type="button"
                  title="Decrease 1 cent"
                >
                  -1c
                </button>
                <button
                  className="cents-reset-btn"
                  onClick={() => tanpura.setPitchCents(0)}
                  type="button"
                  title="Reset fine tuning"
                >
                  Reset (0)
                </button>
                <button
                  className="cents-step-btn"
                  onClick={() => tanpura.adjustPitchCents(1)}
                  type="button"
                  title="Increase 1 cent"
                >
                  +1c
                </button>
                <button
                  className="cents-step-btn"
                  onClick={() => tanpura.adjustPitchCents(5)}
                  type="button"
                  title="Increase 5 cents"
                >
                  +5c
                </button>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                step="1"
                value={pitchCents}
                onChange={(e) => tanpura.setPitchCents(parseInt(e.target.value, 10))}
                className="tanpura-range-slider cents-slider"
              />
            </div>
          </div>

          {/* 6. Pluck Rhythm (Pause After) */}
          <div className="tanpura-row-group">
            <label className="tanpura-group-label">3. Pluck Rhythm (Pause After)</label>
            <div className="droid-rhythm-pills">
              {['First & Last', 'None', 'First', 'Last'].map((opt) => (
                <button
                  key={opt}
                  className={`rhythm-pill ${pauseAfter === opt ? 'active' : ''}`}
                  onClick={() => tanpura.setPauseAfter(opt)}
                  type="button"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 7. Speed & Volume Sliders */}
          <div className="droid-sliders-grid">
            {/* Speed Slider */}
            <div className="slider-card">
              <div className="slider-header-box">
                <span className="s-label">⏱️ Plucking Speed (Tempo)</span>
                <span className="s-val">{Math.round(speed * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.6"
                step="0.05"
                value={speed}
                onChange={(e) => tanpura.setSpeed(parseFloat(e.target.value))}
                className="tanpura-range-slider"
              />
              <div className="slider-sub-labels">
                <span>0.6x (Slow)</span>
                <span>1.0x (Normal)</span>
                <span>1.6x (Fast)</span>
              </div>
            </div>

            {/* Volume Slider */}
            <div className="slider-card">
              <div className="slider-header-box">
                <div className="volume-label-group">
                  <button
                    className={`mute-btn ${isMuted ? 'muted' : ''}`}
                    onClick={() => tanpura.toggleMute()}
                    type="button"
                    title={isMuted ? 'Unmute Drone' : 'Mute Drone'}
                  >
                    {isMuted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
                  </button>
                  <span className="s-label">Master Volume</span>
                </div>
                <span className="s-val">{isMuted ? 'Muted' : `${Math.round(volume * 100)}%`}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={isMuted ? 0 : volume}
                onChange={(e) => tanpura.setVolume(parseFloat(e.target.value))}
                className="tanpura-range-slider"
              />
              <div className="slider-sub-labels">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Master Footer Action */}
        <div className="tanpura-card-footer droid-footer">
          <button
            className={`tanpura-main-play-btn ${isPlaying ? 'playing' : ''}`}
            onClick={() => tanpura.toggle()}
            type="button"
          >
            {isPlaying ? '⏸ Stop Tanpura Drone' : '▶ Start Acoustic Tanpura'}
          </button>
        </div>
      </div>
    </div>
  );
}
