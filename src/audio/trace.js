// Fixed-size ring buffer for pitch frames.
//
// The detection loop writes ~60 frames a second and the canvas reads the whole
// buffer every frame. Using parallel typed arrays with a write cursor keeps both
// sides allocation-free, so neither one creates garbage for the collector to
// sweep mid-performance.

export function createTrace(capacity = 900) {
  const time = new Float64Array(capacity);
  const hz = new Float32Array(capacity);
  const clarity = new Float32Array(capacity);
  const rms = new Float32Array(capacity);
  let written = 0;

  return {
    capacity,

    get size() {
      return Math.min(written, capacity);
    },

    push(timeValue, hzValue, clarityValue, rmsValue) {
      const i = written % capacity;
      time[i] = timeValue;
      hz[i] = hzValue;
      clarity[i] = clarityValue;
      rms[i] = rmsValue;
      written++;
    },

    /**
     * Walk frames oldest -> newest.
     * fn(time, hz, clarity, rms)
     */
    forEach(fn) {
      const size = Math.min(written, capacity);
      const start = written > capacity ? written % capacity : 0;
      for (let k = 0; k < size; k++) {
        const i = (start + k) % capacity;
        fn(time[i], hz[i], clarity[i], rms[i]);
      }
    },

    clear() {
      written = 0;
    },
  };
}
