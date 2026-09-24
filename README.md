# Carnatic Raga Identifier 🎵

A real-time web application that listens to a singer humming or singing and automatically identifies Carnatic ragas by tracking vocal pitch, calibrating the singer's tonic (*Sa*), mapping swarasthanas, tracking melodic trajectories, and recognizing characteristic signature phrases (*pakads* / *prayogas*).

---

## 🌟 Features Implemented

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

### 5. Arohanam–Avarohanam Trajectory Runway & Acoustic Tanpura Drone
* **Vocal Note Event Segmentation**: Hysteresis-based note detector converting continuous singing pitch into discrete swaras with octave sthayi awareness ($S$ vs $\dot{S}$).
* **Directional Scale Runway**: Visual ascent and descent runway with live pulsing cursors and step validation checkmarks.
* **Accuracy Scoring & Skipped Note Detection**: Real-time evaluation calculating overall accuracy score, flagging skipped notes, and applying *Anyaswara* penalties.
* **Built-in Web Audio Tanpura Drone**: Authentic acoustic Tanpura audio engine with First String selector ($Pa$ / $Ma$ / $Ni$), fine pitch tuning, tempo control, and volume master.

### 6. Janya Ragas, Dynamic Runways & Phrase (Pakad) Recognizer
* **Comprehensive Janya Ragas Library**: Curated database of famous Carnatic Janya ragas across all families (*Audava-Audava*, *Audava-Shadava*, *Shadava-Shadava*, *Audava-Sampurna*, *Shadava-Sampurna*, *Vakra*, and *Bhashanga*) such as Mohanam, Hindolam, Hamsadhwani, Madhyamavati, Suddha Dhanyasi, Abhogi, Sriranjani, Bilahari, Arabhi, Kambhoji, Bhairavi, Anandabhairavi, Reethigowla, Kapi, Sahana, Begada, Amritavarshini, Hamsanandi, Malahari, and Saveri.
* **Real-Time Sliding Phrase Recognizer**: Real-time buffer evaluating vocal note event sequences against canonical Carnatic *Pakads* and *Vishesha Prayogas* (e.g. Mohanam's $G_3 P D_2 P G_3$, Reethigowla's $M_1 N_2 N_2 \dot{S}$, Hindolam's $S M_1 G_2 M_1$, Hamsadhwani's $S R_2 G_3 P$).
* **Live Singing Tape & Catch Banner**: Streaming swara ribbon displaying recent notes and triggering visual celebrations with raga metadata and aesthetic descriptions when a phrase is captured.
* **Dynamic Step Runway**: Supports arbitrary scale lengths (5, 6, 7, 8+ notes) and includes **Pakad Practice Mode** where singers can select a specific signature phrase to rehearse step-by-step.
* **Unified Melakarta + Janya Matcher**: Combined scoring engine with Audava purity boosts, Anyaswara penalties, Bhashanga tolerance, and phrase catch multipliers.

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
- [x] **Step 6**: Janya ragas and phrase-based (*pakad*) recognition.

---

## 📄 License
MIT
