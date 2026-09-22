import { useEffect, useRef } from 'react';
import {
  SWARASTHANAS,
  getSthayi,
  hzToMidi,
  isNaturalNote,
  midiToName,
} from '../audio/notes.js';

const WINDOW_MS = 10000; // seconds of history across the full width
const VIEW_SEMITONES = 24; // two octaves top to bottom
const DEFAULT_CENTER = hzToMidi(220); // A3
const FOLLOW_EASING = 0.05;

const INK = '#F2EDE4';
const BRASS = '#C9A227';
const BRASS_GLOW = 'rgba(201, 162, 39, 0.75)';
const PA_GLOW = 'rgba(201, 162, 39, 0.38)';
const PLOT_GROUND = '#181B3A';

/**
 * Live pitch trace with Carnatic Swara grid lines and Western note references.
 */
export default function PitchPlot({ traceRef, active, tonicHz }) {
  const canvasRef = useRef(null);
  const centerRef = useRef(DEFAULT_CENTER);
  const activeRef = useRef(active);
  const tonicRef = useRef(tonicHz);

  useEffect(() => {
    activeRef.current = active;
    tonicRef.current = tonicHz;
    if (!active) {
      centerRef.current = tonicHz ? hzToMidi(tonicHz) + 6 : DEFAULT_CENTER;
    }
  }, [active, tonicHz]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (!width || !height) return;

      const trace = traceRef.current;
      const now = performance.now();
      const tonic = tonicRef.current;
      const tonicMidi = tonic ? hzToMidi(tonic) : null;

      // Ease the viewport toward where the voice actually is.
      const recent = [];
      trace.forEach((time, hz) => {
        if (hz > 0 && now - time < 2500) recent.push(hzToMidi(hz));
      });
      if (recent.length > 8) {
        recent.sort((a, b) => a - b);
        const median = recent[recent.length >> 1];
        centerRef.current += (median - centerRef.current) * FOLLOW_EASING;
      }

      const low = centerRef.current - VIEW_SEMITONES / 2;
      const high = centerRef.current + VIEW_SEMITONES / 2;
      const yFor = (midi) => height - ((midi - low) / (high - low)) * height;

      ctx.fillStyle = PLOT_GROUND;
      ctx.fillRect(0, 0, width, height);

      // Grid drawing
      ctx.textBaseline = 'middle';
      for (let midi = Math.ceil(low); midi <= Math.floor(high); midi++) {
        const y = Math.round(yFor(midi)) + 0.5;
        const pitchClass = ((midi % 12) + 12) % 12;
        const natural = isNaturalNote(midi);
        const isOctaveC = pitchClass === 0;

        let isSa = false;
        let isPa = false;
        let swaraObj = null;

        if (tonicMidi !== null) {
          const semitonesFromTonic = Math.round(midi - tonicMidi);
          const swaraIndex = ((semitonesFromTonic % 12) + 12) % 12;
          const octaveDiff = Math.floor(semitonesFromTonic / 12);
          const sthayi = getSthayi(octaveDiff);
          isSa = swaraIndex === 0;
          isPa = swaraIndex === 7;
          swaraObj = {
            symbol: sthayi.symbolModifier(SWARASTHANAS[swaraIndex].symbol),
            name: SWARASTHANAS[swaraIndex].name,
            isAchala: isSa || isPa,
            isSa,
            isPa,
          };
        }

        // Line styles
        if (isSa) {
          ctx.strokeStyle = BRASS_GLOW;
          ctx.lineWidth = 1.75;
        } else if (isPa) {
          ctx.strokeStyle = PA_GLOW;
          ctx.lineWidth = 1.25;
        } else if (tonicMidi !== null) {
          ctx.strokeStyle = 'rgba(242, 237, 228, 0.055)';
          ctx.lineWidth = 1;
        } else {
          ctx.strokeStyle = isOctaveC
            ? 'rgba(242, 237, 228, 0.20)'
            : natural
              ? 'rgba(242, 237, 228, 0.10)'
              : 'rgba(242, 237, 228, 0.045)';
          ctx.lineWidth = 1;
        }

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();

        // Labels
        if (tonicMidi !== null && swaraObj) {
          if (swaraObj.isAchala) {
            // Emphasize Sa and Pa
            ctx.fillStyle = isSa ? BRASS : 'rgba(201, 162, 39, 0.85)';
            ctx.font = `600 13px "IBM Plex Sans", system-ui, sans-serif`;
            ctx.fillText(swaraObj.symbol, 12, y);

            // Western note reference alongside
            ctx.fillStyle = 'rgba(242, 237, 228, 0.38)';
            ctx.font = '400 10px "IBM Plex Sans", system-ui, sans-serif';
            ctx.fillText(midiToName(midi), 38, y);
          } else {
            // Other swaras
            ctx.fillStyle = 'rgba(242, 237, 228, 0.42)';
            ctx.font = '400 11px "IBM Plex Sans", system-ui, sans-serif';
            ctx.fillText(swaraObj.symbol, 12, y);
          }
        } else if (natural) {
          ctx.fillStyle = isOctaveC ? 'rgba(242, 237, 228, 0.62)' : 'rgba(242, 237, 228, 0.32)';
          ctx.font = `${isOctaveC ? 500 : 400} 11px "IBM Plex Sans", system-ui, sans-serif`;
          ctx.fillText(midiToName(midi), 10, y);
        }
      }


      // The trace itself. Unvoiced frames lift the pen so silences read as
      // gaps instead of straight lines between unrelated notes.
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.25;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();

      let penDown = false;
      let headX = null;
      let headY = null;

      trace.forEach((time, hz) => {
        const age = now - time;
        if (age > WINDOW_MS || age < 0) return;
        if (hz <= 0) {
          penDown = false;
          return;
        }
        const x = width - (age / WINDOW_MS) * width;
        const y = yFor(hzToMidi(hz));
        if (penDown) {
          ctx.lineTo(x, y);
        } else {
          ctx.moveTo(x, y);
          penDown = true;
        }
        headX = x;
        headY = y;
      });
      ctx.stroke();

      // Leading edge marker, so it is obvious the plot is live.
      ctx.strokeStyle = 'rgba(201, 162, 39, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(width - 0.5, 0);
      ctx.lineTo(width - 0.5, height);
      ctx.stroke();

      if (headX !== null) {
        ctx.fillStyle = BRASS;
        ctx.beginPath();
        ctx.arc(headX, headY, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!activeRef.current) {
        ctx.fillStyle = 'rgba(242, 237, 228, 0.45)';
        ctx.font = '400 14px "IBM Plex Sans", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Start listening, then sing a sustained note.', width / 2, height / 2);
        ctx.textAlign = 'start';
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [traceRef]);

  return <canvas ref={canvasRef} className="plot" />;
}
