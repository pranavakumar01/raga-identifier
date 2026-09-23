import { useEffect, useState } from 'react';
import { PITCH_LIST, tanpura } from '../audio/tanpura.js';

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
    pitchSemi,
    speed,
    volume,
  } = state;

  const handlePitchChange = (e) => {
    const idx = parseInt(e.target.value, 10);
    tanpura.setPitchIndex(idx);
  };

  const getPitchLabel = (item) => {
    if (notation === 'Kattai') {
      return `${item.kattai} (${item.name})`;
    }
    return item.name;
  };

  return (
    <div className="tanpura-modal-backdrop" onClick={onClose}>
      <div className="tanpura-card" onClick={(e) => e.stopPropagation()}>
        {/* Header with Title and Close button */}
        <div className="tanpura-card-header">
          <div className="tanpura-card-title-group">
            <span className="tanpura-card-icon">🪕</span>
            <h3 className="tanpura-card-title">Acoustic Tanpura Controls</h3>
          </div>
          <button className="tanpura-close-btn" onClick={onClose} type="button" title="Close controls">
            ✕
          </button>
        </div>

        <div className="tanpura-control-rows">
          {/* 1. First String */}
          <div className="tanpura-row">
            <label className="tanpura-row-label">First String</label>
            <div className="tanpura-select-box">
              <select
                value={firstString}
                onChange={(e) => tanpura.setFirstString(e.target.value)}
                className="tanpura-native-select"
              >
                <option value="Pa">Pa (Panchamam - Standard)</option>
                <option value="Ma">Ma (Madhyamam)</option>
                <option value="Ni">Ni (Nishadham)</option>
              </select>
            </div>
          </div>

          {/* 2. Pause After */}
          <div className="tanpura-row">
            <label className="tanpura-row-label">Pause After</label>
            <div className="tanpura-select-box">
              <select
                value={pauseAfter}
                onChange={(e) => tanpura.setPauseAfter(e.target.value)}
                className="tanpura-native-select"
              >
                <option value="First & Last">First & Last</option>
                <option value="None">None</option>
                <option value="First">First</option>
                <option value="Last">Last</option>
              </select>
            </div>
          </div>

          {/* 3. Notation */}
          <div className="tanpura-row">
            <label className="tanpura-row-label">Notation</label>
            <div className="tanpura-select-box">
              <select
                value={notation}
                onChange={(e) => tanpura.setNotation(e.target.value)}
                className="tanpura-native-select"
              >
                <option value="Western">Western</option>
                <option value="Kattai">Kattai (Carnatic)</option>
              </select>
            </div>
          </div>

          {/* 4. Pitch */}
          <div className="tanpura-row">
            <label className="tanpura-row-label">Pitch</label>
            <div className="tanpura-select-box">
              <select
                value={pitchIndex}
                onChange={handlePitchChange}
                className="tanpura-native-select"
              >
                {PITCH_LIST.map((p, idx) => (
                  <option key={p.name} value={idx}>
                    {getPitchLabel(p)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 5. Pitch Semi */}
          <div className="tanpura-row">
            <label className="tanpura-row-label">Pitch Semi</label>
            <div className="tanpura-stepper">
              <button
                className="tanpura-step-btn"
                onClick={() => tanpura.adjustPitchSemi(-1)}
                type="button"
                title="Decrease semitone"
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
                title="Increase semitone"
              >
                +
              </button>
            </div>
          </div>

          {/* 6. Speed */}
          <div className="tanpura-row slider-row">
            <div className="tanpura-slider-header">
              <label className="tanpura-row-label">Speed</label>
              <span className="tanpura-slider-val">{Math.round(speed * 100)}%</span>
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
          </div>

          {/* 7. Volume */}
          <div className="tanpura-row slider-row">
            <div className="tanpura-slider-header">
              <label className="tanpura-row-label">Volume</label>
              <span className="tanpura-slider-val">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={volume}
              onChange={(e) => tanpura.setVolume(parseFloat(e.target.value))}
              className="tanpura-range-slider"
            />
          </div>
        </div>

        {/* Master Play / Pause Action Button */}
        <div className="tanpura-card-footer">
          <button
            className={`tanpura-main-play-btn ${isPlaying ? 'playing' : ''}`}
            onClick={() => tanpura.toggle()}
            type="button"
          >
            {isPlaying ? '⏸ Stop Tanpura' : '▶ Play Tanpura'}
          </button>
        </div>
      </div>
    </div>
  );
}
