import { ALL_RECOGNIZABLE_PHRASES, JANYA_RAGAS } from './janya.js';
import { MELAKARTA_RAGAS } from './melakarta.js';

const HISTORY_SIZE = 18;
const MIN_PHRASE_DEBOUNCE_MS = 2500; // Don't trigger same phrase catch repeatedly within 2.5s

/**
 * Creates a real-time phrase recognizer that consumes note events
 * and matches them against canonical Carnatic pakads and prayogas.
 */
export function createPhraseRecognizer() {
  let noteBuffer = []; // Circular/sliding buffer of recent note events
  let caughtPhrases = []; // Log of caught phrases
  let phraseScores = {}; // Accumulated phrase count per raga
  let lastCatchTimeMap = {}; // phraseId -> timestamp

  return {
    reset() {
      noteBuffer = [];
      caughtPhrases = [];
      phraseScores = {};
      lastCatchTimeMap = {};
    },

    /**
     * Ingests a new note event (from noteSegmenter).
     * Returns:
     *   { caught: Array of newly detected phrase objects, history: Array of notes }
     */
    addNote(note) {
      if (!note || note.swarasthanaIndex === undefined) {
        return { newlyCaught: [], noteHistory: noteBuffer };
      }

      // Append note with unique timestamp
      noteBuffer.push({
        ...note,
        arrivedAt: performance.now(),
      });

      if (noteBuffer.length > HISTORY_SIZE) {
        noteBuffer.shift();
      }

      // Check for phrase matches
      const newlyCaught = this.evaluateBuffer();
      return {
        newlyCaught,
        noteHistory: [...noteBuffer],
      };
    },

    getHistory() {
      return [...noteBuffer];
    },

    getCaughtPhrases() {
      return [...caughtPhrases];
    },

    getPhraseScores() {
      return { ...phraseScores };
    },

    /**
     * Checks if the recent tail of noteBuffer matches any known phrase.
     */
    evaluateBuffer() {
      if (noteBuffer.length < 3) return [];

      const now = performance.now();
      const newlyCaught = [];
      const bufferIndices = noteBuffer.map((n) => n.swarasthanaIndex);

      for (const phrase of ALL_RECOGNIZABLE_PHRASES) {
        const pLen = phrase.indices.length;
        if (bufferIndices.length < pLen) continue;

        // Check if Debounced
        const lastCatch = lastCatchTimeMap[phrase.id] || 0;
        if (now - lastCatch < MIN_PHRASE_DEBOUNCE_MS) {
          continue;
        }

        // Test exact sequence at the tail
        let exactMatch = true;
        const tailOffset = bufferIndices.length - pLen;
        for (let i = 0; i < pLen; i++) {
          if (bufferIndices[tailOffset + i] !== phrase.indices[i]) {
            exactMatch = false;
            break;
          }
        }

        let isMatch = exactMatch;
        let matchConfidence = 100;
        let matchedSpan = null;

        if (exactMatch) {
          matchedSpan = noteBuffer.slice(tailOffset);
        } else if (pLen >= 4 && bufferIndices.length >= pLen + 1) {
          // Allow 1 intermediate ornament or glide note (subsequence match)
          const windowSpan = noteBuffer.slice(bufferIndices.length - (pLen + 1));
          const windowIndices = windowSpan.map((n) => n.swarasthanaIndex);

          let pIdx = 0;
          for (let w = 0; w < windowIndices.length; w++) {
            if (windowIndices[w] === phrase.indices[pIdx]) {
              pIdx++;
              if (pIdx === pLen) break;
            }
          }

          if (pIdx === pLen) {
            isMatch = true;
            matchConfidence = 85;
            matchedSpan = windowSpan;
          }
        }

        if (isMatch) {
          lastCatchTimeMap[phrase.id] = now;

          const catchEvent = {
            id: `${phrase.id}_${Math.round(now)}`,
            phraseId: phrase.id,
            phraseName: phrase.name,
            swaras: phrase.swaras,
            indices: phrase.indices,
            description: phrase.description,
            isPakad: phrase.isPakad,
            ragaId: phrase.ragaId,
            ragaName: phrase.ragaName,
            displayName: phrase.displayName,
            isJanya: phrase.isJanya,
            category: phrase.category,
            melakartaNum: phrase.melakartaNum,
            melakartaName: phrase.melakartaName,
            confidence: matchConfidence,
            timestamp: now,
            timeStr: new Date().toLocaleTimeString(),
            matchedSpan,
          };

          newlyCaught.push(catchEvent);
          caughtPhrases.unshift(catchEvent);

          // Keep catch log within reasonable size
          if (caughtPhrases.length > 30) {
            caughtPhrases.pop();
          }

          // Accumulate raga phrase bonus
          phraseScores[phrase.ragaId] = (phraseScores[phrase.ragaId] || 0) + (phrase.isPakad ? 2 : 1);
        }
      }

      return newlyCaught;
    },
  };
}

/**
 * Unified Raga Matching Engine
 *
 * Simultaneously evaluates:
 * 1. 72 Melakarta parent scales
 * 2. Famous Carnatic Janya ragas (Audava, Shadava, Vakra, Bhashanga)
 * 3. Recent characteristic phrase (Pakad) catches
 */
export function matchAllRagas(dwellTimes, phraseHits = {}, options = {}) {
  const minDwellMs = options.minDwellMs ?? 120;
  const maxResults = options.maxResults ?? 10;

  // Identify sung swaras
  let totalDwell = 0;
  const sungIndices = [];

  for (let i = 0; i < 12; i++) {
    const ms = dwellTimes[i] || 0;
    if (ms >= minDwellMs) {
      sungIndices.push(i);
      totalDwell += ms;
    }
  }

  if (sungIndices.length === 0 || totalDwell === 0) {
    return {
      candidates: [],
      sungIndices: [],
      totalDwellMs: 0,
      activeCount: 0,
      disambiguation: null,
    };
  }

  const results = [];

  // 1. Evaluate 72 Melakartas
  for (const mela of MELAKARTA_RAGAS) {
    let ragaDwell = 0;
    let alienDwell = 0;
    const coveredNotes = [];
    const missingNotes = [];
    const alienNotes = [];

    for (const swara of mela.swaras) {
      if ((dwellTimes[swara.index] || 0) >= minDwellMs) {
        coveredNotes.push(swara);
        ragaDwell += dwellTimes[swara.index];
      } else {
        missingNotes.push(swara);
      }
    }

    for (const sungIdx of sungIndices) {
      if (!mela.swarasthanaSet.has(sungIdx)) {
        alienDwell += dwellTimes[sungIdx];
        alienNotes.push(sungIdx);
      }
    }

    const alienPenaltyFactor = 2.5;
    const effectiveTotal = ragaDwell + alienDwell * alienPenaltyFactor;
    const compatibilityRatio = effectiveTotal > 0 ? ragaDwell / effectiveTotal : 0;
    const isPure = alienNotes.length === 0;

    let baseScore = Math.round(
      compatibilityRatio * 75 + (coveredNotes.length / 7) * 25
    );

    // Apply phrase bonus if any pakad was caught for this Melakarta
    const pBonus = (phraseHits[`mela_${mela.number}`] || 0) * 12;
    const finalScore = Math.min(100, baseScore + pBonus);

    if (finalScore >= 35 || isPure) {
      results.push({
        id: `mela_${mela.number}`,
        number: mela.number,
        name: mela.name,
        displayName: mela.displayName,
        chakra: mela.chakra,
        mType: mela.mType,
        isJanya: false,
        category: `Melakarta #${mela.number}`,
        swaras: mela.swaras,
        swarasthanaSet: mela.swarasthanaSet,
        swarasthanaIndices: mela.swarasthanaIndices,
        arohana: mela.arohana,
        avarohana: mela.arohana,
        arohanaStr: mela.arohana,
        avarohanaStr: mela.arohana,
        score: finalScore,
        compatibilityRatio: Math.round(compatibilityRatio * 100),
        coveredNotes,
        missingNotes,
        alienNotes,
        isPure,
        ragaDwellMs: Math.round(ragaDwell),
        phraseBonus: pBonus,
        rawRaga: mela,
      });
    }
  }

  // 2. Evaluate Janya Ragas
  for (const janya of JANYA_RAGAS) {
    let ragaDwell = 0;
    let alienDwell = 0;
    const coveredNotes = [];
    const missingNotes = [];
    const alienNotes = [];

    // Check each swara defined in this Janya raga
    for (const swara of janya.swaras) {
      if ((dwellTimes[swara.index] || 0) >= minDwellMs) {
        coveredNotes.push(swara);
        ragaDwell += dwellTimes[swara.index];
      } else {
        missingNotes.push(swara);
      }
    }

    // Alien check: notes sung that do not belong to this Janya raga
    for (const sungIdx of sungIndices) {
      if (!janya.swarasthanaSet.has(sungIdx)) {
        // If it's a Bhashanga raga and this is its recognized bhashanga note, treat softly
        const isRecognizedBhashanga = janya.isBhashanga && janya.bhashangaNotes?.some((b) => b.index === sungIdx);
        if (isRecognizedBhashanga) {
          ragaDwell += dwellTimes[sungIdx] * 0.8;
        } else {
          alienDwell += dwellTimes[sungIdx];
          alienNotes.push(sungIdx);
        }
      }
    }

    const alienPenaltyFactor = 2.8;
    const effectiveTotal = ragaDwell + alienDwell * alienPenaltyFactor;
    const compatibilityRatio = effectiveTotal > 0 ? ragaDwell / effectiveTotal : 0;
    const isPure = alienNotes.length === 0;

    // For Janya ragas, coverage ratio is based on its specific note count (e.g. 5 for Audava)
    const janyaNoteCount = janya.swaras.length;
    const coverageRatio = coveredNotes.length / janyaNoteCount;

    let baseScore = Math.round(compatibilityRatio * 75 + coverageRatio * 25);

    // If all Janya notes are sung cleanly with zero alien notes, it gets an Audava/Shadava purity bonus!
    if (isPure && coverageRatio >= 0.8) {
      baseScore = Math.min(100, baseScore + 10);
    }

    // Apply phrase bonus if any pakad was caught for this Janya raga
    const pBonus = (phraseHits[janya.id] || 0) * 16;
    const finalScore = Math.min(100, baseScore + pBonus);

    if (finalScore >= 35 || isPure) {
      results.push({
        id: janya.id,
        number: janya.melakartaNum,
        name: janya.name,
        displayName: janya.displayName,
        melakartaNum: janya.melakartaNum,
        melakartaName: janya.melakartaName,
        isJanya: true,
        category: janya.category,
        type: janya.type,
        swaras: janya.swaras,
        swarasthanaSet: janya.swarasthanaSet,
        swarasthanaIndices: janya.swarasthanaIndices,
        arohana: janya.arohana,
        avarohana: janya.avarohana,
        arohanaStr: janya.arohanaStr,
        avarohanaStr: janya.avarohanaStr,
        description: janya.description,
        score: finalScore,
        compatibilityRatio: Math.round(compatibilityRatio * 100),
        coveredNotes,
        missingNotes,
        alienNotes,
        isPure,
        ragaDwellMs: Math.round(ragaDwell),
        phraseBonus: pBonus,
        rawRaga: janya,
      });
    }
  }

  // Sort candidates by score descending, then by pure status, then coverage
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.isPure !== a.isPure) return b.isPure ? 1 : -1;
    return b.coveredNotes.length - a.coveredNotes.length;
  });

  const candidates = results.slice(0, maxResults);

  // Generate intelligent disambiguation guidance between top candidates
  let disambiguation = null;
  if (candidates.length >= 2 && candidates[0].score >= 60) {
    const top = candidates[0];
    const second = candidates[1];

    // Find notes in top not in second, and in second not in top
    const inTopNotSecond = top.swarasthanaIndices.filter((idx) => !second.swarasthanaSet.has(idx));
    const inSecondNotTop = second.swarasthanaIndices.filter((idx) => !top.swarasthanaSet.has(idx));

    if (top.isJanya && !second.isJanya && top.melakartaNum === second.number) {
      // Janya vs Parent Melakarta (e.g. Mohanam vs Harikambhoji)
      disambiguation = {
        type: 'parent_janya',
        message: `Notes sung match both **${top.displayName}** (${top.category}) and its parent **${second.displayName}**.`,
        actionHint: `Sing ${inSecondNotTop.map(formatSwaraIdx).join(' or ')} to explore parent ${second.name}, or sing characteristic ${top.name} phrases.`,
      };
    } else if (inSecondNotTop.length > 0 || inTopNotSecond.length > 0) {
      disambiguation = {
        type: 'differentiation',
        message: `Close competition between **${top.displayName}** (${top.score}%) and **${second.displayName}** (${second.score}%).`,
        actionHint: inSecondNotTop.length > 0
          ? `Sing **${formatSwaraIdx(inSecondNotTop[0])}** to differentiate toward ${second.name}.`
          : `Sing characteristic pakad phrases of ${top.name}.`,
      };
    }
  }

  return {
    candidates,
    sungIndices,
    totalDwellMs: Math.round(totalDwell),
    activeCount: sungIndices.length,
    disambiguation,
  };
}

function formatSwaraIdx(idx) {
  const map = ['S', 'R₁', 'R₂/G₁', 'G₂/R₃', 'G₃', 'M₁', 'M₂', 'P', 'D₁', 'D₂/N₁', 'N₂/D₃', 'N₃'];
  return map[idx] || `Swara ${idx}`;
}
