// Carnatic 72 Melakarta (Parent Scales) Database and Matching Engine
//
// The 72 Melakarta ragas are the fundamental parent scales of Carnatic music.
// Systematized by Venkatamakhin in the 17th century and formulated with the Katapayadi
// sankhya naming convention by Govindacharya.

export const CHAKRAS = [
  { index: 1, name: 'Indu', range: [1, 6], r: 'R₁', g: 'G₁', rIndex: 1, gIndex: 2, mType: 'Suddha' },
  { index: 2, name: 'Netra', range: [7, 12], r: 'R₁', g: 'G₂', rIndex: 1, gIndex: 3, mType: 'Suddha' },
  { index: 3, name: 'Agni', range: [13, 18], r: 'R₁', g: 'G₃', rIndex: 1, gIndex: 4, mType: 'Suddha' },
  { index: 4, name: 'Veda', range: [19, 24], r: 'R₂', g: 'G₂', rIndex: 2, gIndex: 3, mType: 'Suddha' },
  { index: 5, name: 'Bana', range: [25, 30], r: 'R₂', g: 'G₃', rIndex: 2, gIndex: 4, mType: 'Suddha' },
  { index: 6, name: 'Ritu', range: [31, 36], r: 'R₃', g: 'G₃', rIndex: 3, gIndex: 4, mType: 'Suddha' },
  { index: 7, name: 'Rishi', range: [37, 42], r: 'R₁', g: 'G₁', rIndex: 1, gIndex: 2, mType: 'Prati' },
  { index: 8, name: 'Vasu', range: [43, 48], r: 'R₁', g: 'G₂', rIndex: 1, gIndex: 3, mType: 'Prati' },
  { index: 9, name: 'Brahma', range: [49, 54], r: 'R₁', g: 'G₃', rIndex: 1, gIndex: 4, mType: 'Prati' },
  { index: 10, name: 'Disi', range: [55, 60], r: 'R₂', g: 'G₂', rIndex: 2, gIndex: 3, mType: 'Prati' },
  { index: 11, name: 'Rudra', range: [61, 66], r: 'R₂', g: 'G₃', rIndex: 2, gIndex: 4, mType: 'Prati' },
  { index: 12, name: 'Aditya', range: [67, 72], r: 'R₃', g: 'G₃', rIndex: 3, gIndex: 4, mType: 'Prati' },
];

const DN_PAIRS = [
  { d: 'D₁', n: 'N₁', dIndex: 8, nIndex: 9 },
  { d: 'D₁', n: 'N₂', dIndex: 8, nIndex: 10 },
  { d: 'D₁', n: 'N₃', dIndex: 8, nIndex: 11 },
  { d: 'D₂', n: 'N₂', dIndex: 9, nIndex: 10 },
  { d: 'D₂', n: 'N₃', dIndex: 9, nIndex: 11 },
  { d: 'D₃', n: 'N₃', dIndex: 10, nIndex: 11 },
];

const RAGA_NAMES = [
  { num: 1, name: 'Kanakangi' },
  { num: 2, name: 'Ratnangi' },
  { num: 3, name: 'Ganamurti' },
  { num: 4, name: 'Vanaspati' },
  { num: 5, name: 'Manavati' },
  { num: 6, name: 'Tanarupi' },
  { num: 7, name: 'Senavati' },
  { num: 8, name: 'Hanumatodi', popular: 'Todi' },
  { num: 9, name: 'Dhenuka' },
  { num: 10, name: 'Natakapriya' },
  { num: 11, name: 'Kokilapriya' },
  { num: 12, name: 'Rupavati' },
  { num: 13, name: 'Gayakapriya' },
  { num: 14, name: 'Vakulabharanam' },
  { num: 15, name: 'Mayamalavagowla', popular: 'Mayamalavagowla' },
  { num: 16, name: 'Chakravakam' },
  { num: 17, name: 'Suryakantam' },
  { num: 18, name: 'Hatakambari' },
  { num: 19, name: 'Jhankaradhwani' },
  { num: 20, name: 'Natabhairavi', popular: 'Natabhairavi' },
  { num: 21, name: 'Keeravani', popular: 'Keeravani' },
  { num: 22, name: 'Kharaharapriya', popular: 'Kharaharapriya' },
  { num: 23, name: 'Gaurimanohari' },
  { num: 24, name: 'Varunapriya' },
  { num: 25, name: 'Mararanjani' },
  { num: 26, name: 'Charukesi', popular: 'Charukesi' },
  { num: 27, name: 'Sarasangi' },
  { num: 28, name: 'Harikambhoji', popular: 'Harikambhoji' },
  { num: 29, name: 'Dhirasankarabharanam', popular: 'Sankarabharanam' },
  { num: 30, name: 'Naganandini' },
  { num: 31, name: 'Yagapriya' },
  { num: 32, name: 'Ragavardhini' },
  { num: 33, name: 'Gangeyabhushani' },
  { num: 34, name: 'Vagadheeswari' },
  { num: 35, name: 'Shulini' },
  { num: 36, name: 'Chalanata' },
  { num: 37, name: 'Salagam' },
  { num: 38, name: 'Jalarnavam' },
  { num: 39, name: 'Jhalavarali' },
  { num: 40, name: 'Navaneetam' },
  { num: 41, name: 'Pavani' },
  { num: 42, name: 'Raghupriya' },
  { num: 43, name: 'Gavambhodhi' },
  { num: 44, name: 'Bhavapriya' },
  { num: 45, name: 'Shubhapantuvarali', popular: 'Subhapantuvarali' },
  { num: 46, name: 'Shadvidamargini' },
  { num: 47, name: 'Suvarnangi' },
  { num: 48, name: 'Divyamani' },
  { num: 49, name: 'Dhavalambari' },
  { num: 50, name: 'Namanarayani' },
  { num: 51, name: 'Kamavardhini', popular: 'Pantuvarali' },
  { num: 52, name: 'Ramapriya' },
  { num: 53, name: 'Gamanashrama' },
  { num: 54, name: 'Vishwambhari' },
  { num: 55, name: 'Shyamalangi' },
  { num: 56, name: 'Shanmukhapriya', popular: 'Shanmukhapriya' },
  { num: 57, name: 'Simhendramadhyamam', popular: 'Simhendramadhyamam' },
  { num: 58, name: 'Hemavati' },
  { num: 59, name: 'Dharmavati' },
  { num: 60, name: 'Neetimati' },
  { num: 61, name: 'Kantamani' },
  { num: 62, name: 'Rishabhapriya' },
  { num: 63, name: 'Latangi' },
  { num: 64, name: 'Vachaspati' },
  { num: 65, name: 'Mechakalyani', popular: 'Kalyani' },
  { num: 66, name: 'Chitrambari' },
  { num: 67, name: 'Sucharitra' },
  { num: 68, name: 'Jyotiswarupini' },
  { num: 69, name: 'Dhatuvardhani' },
  { num: 70, name: 'Nasikabhushani' },
  { num: 71, name: 'Kosalam' },
  { num: 72, name: 'Rasikapriya' },
];

/**
 * Builds the full 72 Melakarta database with swarasthana indices and symbols.
 */
export const MELAKARTA_RAGAS = RAGA_NAMES.map((rInfo) => {
  const num = rInfo.num;
  const chakraIdx = Math.floor((num - 1) / 6); // 0 to 11
  const chakra = CHAKRAS[chakraIdx];
  const dnIdx = (num - 1) % 6; // 0 to 5
  const dn = DN_PAIRS[dnIdx];

  const mSymbol = chakra.mType === 'Suddha' ? 'M₁' : 'M₂';
  const mIndex = chakra.mType === 'Suddha' ? 5 : 6;

  const swaras = [
    { symbol: 'S', name: 'Shadjam', index: 0 },
    { symbol: chakra.r, name: getSwaraName(chakra.r), index: chakra.rIndex },
    { symbol: chakra.g, name: getSwaraName(chakra.g), index: chakra.gIndex },
    { symbol: mSymbol, name: getSwaraName(mSymbol), index: mIndex },
    { symbol: 'P', name: 'Panchamam', index: 7 },
    { symbol: dn.d, name: getSwaraName(dn.d), index: dn.dIndex },
    { symbol: dn.n, name: getSwaraName(dn.n), index: dn.nIndex },
  ];

  const swarasthanaIndices = swaras.map((s) => s.index);
  const swarasthanaSet = new Set(swarasthanaIndices);

  const arohanaStr = `S ${chakra.r} ${chakra.g} ${mSymbol} P ${dn.d} ${dn.n} Ṡ`;

  return {
    number: num,
    name: rInfo.name,
    popular: rInfo.popular || null,
    displayName: rInfo.popular && rInfo.popular !== rInfo.name
      ? `${rInfo.name} (${rInfo.popular})`
      : rInfo.name,
    chakra: chakra.name,
    chakraNumber: chakra.index,
    mType: chakra.mType,
    swaras,
    swarasthanaIndices,
    swarasthanaSet,
    arohana: arohanaStr,
  };
});

function getSwaraName(symbol) {
  switch (symbol) {
    case 'S': return 'Shadjam';
    case 'R₁': return 'Suddha Rishabham';
    case 'R₂': return 'Chatusruti Rishabham';
    case 'R₃': return 'Shatsruti Rishabham';
    case 'G₁': return 'Suddha Gandharam';
    case 'G₂': return 'Sadharana Gandharam';
    case 'G₃': return 'Antara Gandharam';
    case 'M₁': return 'Suddha Madhyamam';
    case 'M₂': return 'Prati Madhyamam';
    case 'P': return 'Panchamam';
    case 'D₁': return 'Suddha Dhaivatam';
    case 'D₂': return 'Chatusruti Dhaivatam';
    case 'D₃': return 'Shatsruti Dhaivatam';
    case 'N₁': return 'Suddha Nishadham';
    case 'N₂': return 'Kaisiki Nishadham';
    case 'N₃': return 'Kakali Nishadham';
    default: return symbol;
  }
}

/**
 * Scale Matching Engine
 *
 * Takes an array of 12 elements representing dwell time (ms or proportional weights)
 * for each swarasthana index (0..11).
 *
 * Evaluates candidate Melakarta ragas based on:
 * 1. Coverage: How many of the raga's 7 swaras have been sung.
 * 2. Alien Penalty: Dwell time on swaras outside the raga.
 * 3. Relative Weight: Weight of correct notes vs foreign notes.
 *
 * Returns sorted list of candidate ragas with match percentage and missing notes.
 */
export function matchMelakarta(dwellTimes, options = {}) {
  const minDwellMs = options.minDwellMs ?? 120; // Ignore accidental voice slips < 120ms
  const maxResults = options.maxResults ?? 8;

  // Identify sung swaras
  let totalDwell = 0;
  const sungIndices = [];
  const sungWeights = new Array(12).fill(0);

  for (let i = 0; i < 12; i++) {
    const ms = dwellTimes[i] || 0;
    if (ms >= minDwellMs) {
      sungIndices.push(i);
      sungWeights[i] = ms;
      totalDwell += ms;
    }
  }

  if (sungIndices.length === 0 || totalDwell === 0) {
    return {
      candidates: [],
      sungIndices: [],
      totalDwellMs: 0,
      activeCount: 0,
    };
  }

  const results = [];

  for (const raga of MELAKARTA_RAGAS) {
    let ragaDwell = 0;
    let alienDwell = 0;
    const coveredNotes = [];
    const missingNotes = [];
    const alienNotes = [];

    // Check each of the 7 swaras in this raga
    for (const swara of raga.swaras) {
      if (dwellTimes[swara.index] >= minDwellMs) {
        coveredNotes.push(swara);
        ragaDwell += dwellTimes[swara.index];
      } else {
        missingNotes.push(swara);
      }
    }

    // Check for any sung swaras outside this raga (Anyaswaras)
    for (const sungIdx of sungIndices) {
      if (!raga.swarasthanaSet.has(sungIdx)) {
        alienDwell += dwellTimes[sungIdx];
        alienNotes.push(sungIdx);
      }
    }

    // Mathematical scoring:
    // - If there are sustained alien notes, compatibility drops drastically.
    // - Compatibility ratio = ragaDwell / (ragaDwell + 2.5 * alienDwell)
    // - Scale coverage = coveredNotes.length / 7
    // - Overall score: weighted combination of compatibility (80%) and coverage (20%)
    const alienPenaltyFactor = 2.5;
    const effectiveTotal = ragaDwell + alienDwell * alienPenaltyFactor;
    const compatibilityRatio = effectiveTotal > 0 ? ragaDwell / effectiveTotal : 0;

    // A raga is fully compatible if no alien notes are sung
    const isPure = alienNotes.length === 0;

    // Score from 0 to 100
    // If pure, base score is high and scales with number of notes covered
    let score = 0;
    if (isPure) {
      // 50% baseline just for zero contradictions + up to 50% for note coverage
      score = 40 + (coveredNotes.length / 7) * 60;
    } else {
      score = compatibilityRatio * 90 * (coveredNotes.length / Math.max(sungIndices.length, 1));
    }

    score = Math.max(0, Math.min(100, Math.round(score)));

    // Only include if score > 15
    if (score >= 15) {
      results.push({
        raga,
        score,
        isPure,
        coveredNotes,
        missingNotes,
        alienNotes,
        ragaDwell,
        alienDwell,
      });
    }
  }

  // Sort by score descending, then by number of covered notes descending
  results.sort((a, b) => {
    if (b.isPure !== a.isPure) return b.isPure ? 1 : -1;
    if (b.score !== a.score) return b.score - a.score;
    return b.coveredNotes.length - a.coveredNotes.length;
  });

  const candidates = results.slice(0, maxResults);

  // Compute distinguishing swaras among top pure candidates
  const topCandidates = candidates.filter((c) => c.isPure).slice(0, 4);
  const distinguishingNotes = findDistinguishingSwara(topCandidates);

  return {
    candidates,
    sungIndices,
    totalDwellMs: totalDwell,
    activeCount: sungIndices.length,
    distinguishingNotes,
  };
}

/**
 * Finds which swaras would disambiguate between the top candidate ragas.
 */
function findDistinguishingSwara(candidates) {
  if (candidates.length < 2) return [];

  // Count occurrence of each swarasthana among candidates
  const indexCounts = {};
  for (const c of candidates) {
    for (const s of c.raga.swaras) {
      indexCounts[s.index] = (indexCounts[s.index] || 0) + 1;
    }
  }

  // A distinguishing swara is present in some candidates but not all
  const distinguishing = [];
  for (let i = 0; i < 12; i++) {
    const count = indexCounts[i] || 0;
    if (count > 0 && count < candidates.length) {
      // Collect swara symbols from ragas having it
      const swaraSymbols = candidates
        .map((c) => c.raga.swaras.find((s) => s.index === i))
        .filter(Boolean)
        .map((s) => s.symbol);
      const symbol = swaraSymbols[0] || '';
      distinguishing.push({
        index: i,
        symbol,
        count,
        total: candidates.length,
      });
    }
  }

  return distinguishing;
}

/**
 * Quick search / lookup helper.
 */
export function getMelakartaByNumber(num) {
  if (num < 1 || num > 72) return null;
  return MELAKARTA_RAGAS[num - 1];
}
