# Carnatic Raga Identifier 🎵

A real-time web application that listens to a singer humming or singing and automatically identifies Carnatic ragas by tracking vocal pitch, calibrating the singer's tonic (*Sa*), and mapping swarasthanas.

---

## 🌟 Features Implemented So Far

### 1. Real-Time Audio & Pitch Detection
* Direct raw microphone capture via the **Web Audio API** with browser audio mangling disabled (`echoCancellation`, `noiseSuppression`, and `autoGainControl` turned off) to preserve singing tones, steady notes, and continuous ornaments (*gamakas*).
* Pitch detection using `pitchy` (YIN algorithm) with RMS and clarity gating to discard ambient noise and unvoiced frames.
* Allocation-free ring buffer for smooth, zero-stutter 60 FPS canvas rendering.

### 2. Manual & Auto "Sa" (Tonic) Calibration
* **"Sing Sa" Auto-Calibration**: Sing a steady sustained base note into your microphone; the detector validates vocal stability and clarity to lock in your *Adhara Shadja* ($Sa$).
* **Kattai Presets**: Quick dropdown selector for standard Carnatic srutis (1 Kattai / C up to 7 Kattai / B).
* Persists your calibrated base pitch across sessions.

### 3. Swara Mapping & Live Visualizer
* **12 Carnatic Swarasthanas**: Automatically maps frequencies to $S, R_1, R_2/G_1, R_3/G_2, G_3, M_1, M_2, P, D_1, D_2/N_1, D_3/N_2, N_3$.
* **Sthayi Detection**: Identifies *Mandra* ($\underset{\cdot}{S}$), *Madhya* ($S$), and *Tara* ($\dot{S}$) octave registers.
* **Canvas Pitch Trace**: 10-second rolling visualizer with gold emphasis on *Achala* (immovable) anchor swaras $S$ and $P$.
* **Live Readout**: Displays the active swara name, deviation in cents, and Western note.

### 4. 72 Melakarta Raga Database & Scale Matching Engine
* **Complete 72 Melakarta Database**: Full matrix across 12 Chakras (*Indu* through *Aditya*), Katapayadi numbering, Suddha/Prati Madhyamam division, and exact swarasthanas.
* **Real-Time Swara Accumulator**: Tracks sustained vocal swaras (dwell time) using RMS and clarity gating to discard brief glissandos or ambient noise.
* **Scale Compatibility Scoring**: Live mathematical matching against all 72 Melakartas, penalizing sustained out-of-scale notes (*anyaswaras*) and ranking candidates by percentage.
* **Disambiguation Guidance**: Identifies and recommends the specific swaras needed to differentiate between top matching candidates.
### 5. Arohanam–Avarohanam Trajectory Runway & Tanpura Drone
* **Vocal Note Event Segmentation**: Hysteresis-based note detector converting continuous singing pitch into discrete swaras with octave sthayi awareness ($S$ vs $\dot{S}$).
* **Directional Scale Runway**: Visual 8-step ascent runway ($S \to R \to G \to M \to P \to D \to N \to \dot{S}$) and 8-step descent runway ($\dot{S} \to N \to D \to P \to M \to G \to R \to S$) with live pulsing cursors and step validation checkmarks.
* **Accuracy Scoring & Skipped Note Detection**: Real-time evaluation calculating overall accuracy score, flagging skipped notes, and applying *Anyaswara* penalties.
* **Built-in Web Audio Tanpura Drone**: Synthesized 4-string Carnatic Tanpura ($Pa - Sa - Sa - \underset{\cdot}{Sa}$) with rich overtones and *javari* shimmer tuned to your calibrated $Sa$.

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* npm (bundled with Node.js)

### Installation
```bash
# Clone repository
git clone https://github.com/pranavakumar01/raga-identifier.git
cd raga-identifier

# Install dependencies
npm install
```

### Running Locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production
```bash
npm run build
```

---

## 🗺️ Roadmap
- [x] **Step 1**: Microphone capture and 60 FPS live continuous pitch visualizer.
- [x] **Step 2**: Manual & auto "Sa" tonic calibration.
- [x] **Step 3**: Real-time Swara mapping and canvas swara overlays.
- [x] **Step 4**: 72 Melakarta raga database & scale matching engine.
- [x] **Step 5**: Arohanam–Avarohanam singing detection and similarity scoring.
- [ ] **Step 6**: Janya ragas and phrase-based (*pakad*) recognition.

---

## 📄 License
MIT

