import {
  centsFromNearestNote,
  hzToMidi,
  hzToSwara,
  midiToName,
  rmsToDb,
} from '../audio/notes.js';

const MINUS = '−';

function formatCents(cents) {
  if (cents === 0) return '0';
  return cents > 0 ? `+${cents}` : `${MINUS}${Math.abs(cents)}`;
}

/** Map RMS in dBFS onto a 0..1 meter, with -60 dB as the floor. */
function levelFraction(rms) {
  const db = rmsToDb(rms);
  return Math.max(0, Math.min(1, (db + 60) / 60));
}

export default function Readout({ hz, clarity, rms, listening, tonicHz }) {
  const voiced = hz > 0;
  const midi = voiced ? hzToMidi(hz) : 0;
  const swara = voiced && tonicHz ? hzToSwara(hz, tonicHz) : null;

  return (
    <div className="readout">
      <div className="readout-primary">
        <span className="readout-hz">{voiced ? hz.toFixed(1) : `${MINUS}${MINUS}${MINUS}.${MINUS}`}</span>
        <span className="readout-unit">Hz</span>
      </div>

      <div className="readout-note">
        <span className="readout-name">{voiced ? midiToName(midi) : '·'}</span>
        <span className="readout-cents">
          {voiced ? `${formatCents(centsFromNearestNote(midi))} cents` : 'no pitch'}
        </span>
      </div>

      {tonicHz ? (
        <div className={`readout-swara ${voiced ? 'active' : 'idle'}`}>
          {voiced && swara ? (
            <>
              <div className="swara-pill">
                <span className="swara-symbol">{swara.formattedSymbol}</span>
                <span className="swara-cents">{formatCents(swara.cents)}c</span>
              </div>
              <span className="swara-desc">
                {swara.name} · <small>{swara.sthayi}</small>
              </span>
            </>
          ) : (
            <span className="swara-hint">Relative to Sa</span>
          )}
        </div>
      ) : null}

      <div className="readout-meters">
        <div className="meter">
          <span className="meter-label">input</span>
          <div className="meter-track">
            <div className="meter-fill" style={{ width: `${levelFraction(rms) * 100}%` }} />
          </div>
        </div>
        <div className="meter">
          <span className="meter-label">clarity</span>
          <div className="meter-track">
            <div
              className="meter-fill meter-fill-clarity"
              style={{ width: `${(voiced ? clarity : 0) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <p className="readout-hint">
        {listening
          ? voiced
            ? swara
              ? `Singing ${swara.name} (${swara.formattedSymbol})`
              : 'Holding a pitch. The line should track your voice.'
            : 'Listening. Sing or hum a steady note.'
          : 'Idle.'}
      </p>
    </div>
  );
}

