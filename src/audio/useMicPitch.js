import { useCallback, useEffect, useRef, useState } from 'react';
import { PitchDetector } from 'pitchy';
import { createTrace } from './trace.js';

// 2048 samples is ~43 ms at 48 kHz. That is long enough to hold several periods
// of a low male voice (~80 Hz) so the detector stays stable, but short enough
// that a gamaka's oscillation is not smeared into a single average pitch.
const FFT_SIZE = 2048;

// Frames below these thresholds are treated as "no pitch" rather than being
// plotted. Without the gate, room tone and consonants produce a jittering line
// that looks like real melodic movement.
const CLARITY_FLOOR = 0.85;
const RMS_FLOOR = 0.006;

// Roughly C2..D6 — covers every singing voice while rejecting both low rumble
// and the octave errors that pitch detectors throw into the high register.
const MIN_HZ = 65;
const MAX_HZ = 1200;

// The trace redraws at 60 fps from a ref, but the numeric readout is React
// state. Throttling it keeps re-renders at ~12/s instead of 60/s.
const READOUT_INTERVAL_MS = 80;

// pitchy returns [pitch, clarity] in v3/v4. Reading it through this helper means
// a future version that returns { pitch, clarity } would not break the loop.
function readPitch(detector, buffer, sampleRate) {
  const result = detector.findPitch(buffer, sampleRate);
  return Array.isArray(result)
    ? { hz: result[0], clarity: result[1] }
    : { hz: result.pitch, clarity: result.clarity };
}

function describeError(err) {
  switch (err?.name) {
    case 'InsecureContextError':
      return 'The microphone needs a secure page. Open this at http://localhost rather than as a file:// path.';
    case 'NotAllowedError':
    case 'SecurityError':
      return 'Microphone access is blocked. Allow it from the icon in the address bar, then start again.';
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return 'No microphone found. Connect one and start again.';
    case 'NotReadableError':
    case 'TrackStartError':
      return 'Another app is holding the microphone. Close it and start again.';
    case 'OverconstrainedError':
      return 'This microphone rejected the requested settings. Pick a different input device in your system sound settings.';
    default:
      return err?.message || 'The microphone could not be opened.';
  }
}

export function useMicPitch() {
  const [status, setStatus] = useState('idle'); // idle | starting | listening | error
  const [error, setError] = useState(null);
  const [device, setDevice] = useState(null); // { label, sampleRate }
  const [readout, setReadout] = useState({ hz: 0, clarity: 0, rms: 0 });

  const traceRef = useRef(createTrace(900));
  const audioRef = useRef({});

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio.raf) cancelAnimationFrame(audio.raf);
    if (audio.stream) audio.stream.getTracks().forEach((track) => track.stop());
    if (audio.ctx && audio.ctx.state !== 'closed') audio.ctx.close();
    audioRef.current = {};
    setReadout({ hz: 0, clarity: 0, rms: 0 });
    setDevice(null);
    setStatus((current) => (current === 'error' ? current : 'idle'));
  }, []);

  const tick = useCallback(() => {
    const audio = audioRef.current;
    if (!audio.analyser) return;
    audio.raf = requestAnimationFrame(tick);

    audio.analyser.getFloatTimeDomainData(audio.buffer);

    let sumSquares = 0;
    for (let i = 0; i < audio.buffer.length; i++) {
      sumSquares += audio.buffer[i] * audio.buffer[i];
    }
    const rms = Math.sqrt(sumSquares / audio.buffer.length);

    let hz = 0;
    let clarity = 0;
    if (rms >= RMS_FLOOR) {
      const detected = readPitch(audio.detector, audio.buffer, audio.ctx.sampleRate);
      if (
        detected.clarity >= CLARITY_FLOOR &&
        detected.hz >= MIN_HZ &&
        detected.hz <= MAX_HZ
      ) {
        hz = detected.hz;
        clarity = detected.clarity;
      }
    }

    const now = performance.now();
    traceRef.current.push(now, hz, clarity, rms);

    if (now - audio.lastReadout >= READOUT_INTERVAL_MS) {
      audio.lastReadout = now;
      setReadout({ hz, clarity, rms });
    }
  }, []);

  const start = useCallback(async () => {
    setError(null);
    setStatus('starting');
    try {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        throw new DOMException('Insecure context', 'InsecureContextError');
      }

      // Browser voice processing is tuned for speech calls and actively damages
      // pitch content: AGC rides the level, noise suppression eats sustained
      // tones, echo cancellation notches frequencies. All three stay off.
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          channelCount: 1,
        },
      });

      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') await ctx.resume();

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyser.smoothingTimeConstant = 0; // raw frames; smoothing would blur gamakas
      source.connect(analyser);
      // Deliberately not connected to ctx.destination — routing the mic to the
      // speakers would feed back into itself.

      const detector = PitchDetector.forFloat32Array(analyser.fftSize);
      const buffer = new Float32Array(detector.inputLength);

      traceRef.current.clear();
      audioRef.current = { stream, ctx, source, analyser, detector, buffer, lastReadout: 0 };

      setDevice({
        label: stream.getAudioTracks()[0]?.label || 'Default input',
        sampleRate: ctx.sampleRate,
      });
      setStatus('listening');
      tick();
    } catch (err) {
      setError(describeError(err));
      setStatus('error');
      const audio = audioRef.current;
      if (audio.stream) audio.stream.getTracks().forEach((track) => track.stop());
      if (audio.ctx && audio.ctx.state !== 'closed') audio.ctx.close();
      audioRef.current = {};
    }
  }, [tick]);

  // Release the mic if the component unmounts while listening.
  useEffect(() => stop, [stop]);

  return { status, error, device, readout, traceRef, start, stop };
}
