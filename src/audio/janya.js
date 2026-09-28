// Carnatic Janya Ragas Database & Characteristic Phrase (Pakad) Library
//
// Janya ragas (derived ragas) are born from the 72 Melakarta parent scales.
// They are categorized by:
// 1. Varja (omission of swaras):
//    - Audava (5 notes)
//    - Shadava (6 notes)
//    - Sampurna (7 notes)
// 2. Vakra (non-linear zig-zag scale progression)
// 3. Bhashanga (incorporating one or more foreign notes / Anyaswaras in special prayogas)
// 4. Upanga (strictly adhering to the swaras of the parent Melakarta)

export const JANYA_TYPES = {
  AUDAVA_AUDAVA: 'Audava-Audava (5/5 notes)',
  AUDAVA_SHADAVA: 'Audava-Shadava (5/6 notes)',
  SHADAVA_AUDAVA: 'Shadava-Audava (6/5 notes)',
  AUDAVA_SAMPURNA: 'Audava-Sampurna (5/7 notes)',
  SHADAVA_SAMPURNA: 'Shadava-Sampurna (6/7 notes)',
  SHADAVA_SHADAVA: 'Shadava-Shadava (6/6 notes)',
  VAKRA: 'Vakra (Zig-zag progression)',
  BHASHANGA: 'Bhashanga (Foreign notes in prayogas)',
};

/**
 * Helper to build swara object
 */
function createSwara(symbol, name, index, octaveDiff = 0) {
  return { symbol, name, index, octaveDiff };
}

// Swara reference objects for common notes
const S = createSwara('S', 'Shadjam', 0);
const R1 = createSwara('R₁', 'Suddha Rishabham', 1);
const R2 = createSwara('R₂', 'Chatusruti Rishabham', 2);
const R3 = createSwara('R₃', 'Shatsruti Rishabham', 3);
const G1 = createSwara('G₁', 'Suddha Gandharam', 2);
const G2 = createSwara('G₂', 'Sadharana Gandharam', 3);
const G3 = createSwara('G₃', 'Antara Gandharam', 4);
const M1 = createSwara('M₁', 'Suddha Madhyamam', 5);
const M2 = createSwara('M₂', 'Prati Madhyamam', 6);
const P = createSwara('P', 'Panchamam', 7);
const D1 = createSwara('D₁', 'Suddha Dhaivatam', 8);
const D2 = createSwara('D₂', 'Chatusruti Dhaivatam', 9);
const D3 = createSwara('D₃', 'Shatsruti Dhaivatam', 10);
const N1 = createSwara('N₁', 'Suddha Nishadham', 9);
const N2 = createSwara('N₂', 'Kaisiki Nishadham', 10);
const N3 = createSwara('N₃', 'Kakali Nishadham', 11);
const S_DOT = createSwara('Ṡ', 'Tara Shadjam', 0, 1);

export const JANYA_RAGAS = [
  // 1. MOHANAM
  {
    id: 'mohanam',
    name: 'Mohanam',
    displayName: 'Mohanam',
    melakartaNum: 28,
    melakartaName: 'Harikambhoji',
    type: JANYA_TYPES.AUDAVA_AUDAVA,
    category: 'Audava-Audava',
    isBhashanga: false,
    arohana: [S, R2, G3, P, D2, S_DOT],
    avarohana: [S_DOT, D2, P, G3, R2, S],
    arohanaStr: 'S R₂ G₃ P D₂ Ṡ',
    avarohanaStr: 'Ṡ D₂ P G₃ R₂ S',
    swaras: [S, R2, G3, P, D2],
    swarasthanaIndices: [0, 2, 4, 7, 9],
    swarasthanaSet: new Set([0, 2, 4, 7, 9]),
    varjaIndices: [5, 10], // M and N omitted
    description: 'One of the most universal and radiant pentatonic scales. Characterized by oscillations on Gandharam and vibrant jumps between Panchamam and Dhaivatam.',
    phrases: [
      {
        id: 'moh_pakad_1',
        name: 'Signature Mohanam Gamaka',
        swaras: ['G₃', 'P', 'D₂', 'P', 'G₃'],
        indices: [4, 7, 9, 7, 4],
        description: 'Crucial oscillatory phrase defining Mohanam and distinguishing it from other pentatonics.',
        isPakad: true,
      },
      {
        id: 'moh_prayoga_2',
        name: 'Gandhara-Rishabha Resolution',
        swaras: ['R₂', 'G₃', 'R₂', 'S'],
        indices: [2, 4, 2, 0],
        description: 'Classic cadence resting on base Shadjam with melodic Gamaka on Rishabham.',
        isPakad: true,
      },
      {
        id: 'moh_prayoga_3',
        name: 'Tara Descent Catch',
        swaras: ['Ṡ', 'D₂', 'P', 'G₃', 'R₂', 'S'],
        indices: [0, 9, 7, 4, 2, 0],
        description: 'Unmistakable descent from Tara Sa cascading down the pentatonic ladder.',
        isPakad: false,
      },
      {
        id: 'moh_prayoga_4',
        name: 'Panchama-Dhaivata Leap',
        swaras: ['P', 'D₂', 'Ṡ', 'D₂', 'P'],
        indices: [7, 9, 0, 9, 7],
        description: 'Upper register leap soaring towards Tara Shadjam.',
        isPakad: false,
      },
    ],
  },

  // 2. HAMSADHWANI
  {
    id: 'hamsadhwani',
    name: 'Hamsadhwani',
    displayName: 'Hamsadhwani',
    melakartaNum: 29,
    melakartaName: 'Dhirasankarabharanam',
    type: JANYA_TYPES.AUDAVA_AUDAVA,
    category: 'Audava-Audava',
    isBhashanga: false,
    arohana: [S, R2, G3, P, N3, S_DOT],
    avarohana: [S_DOT, N3, P, G3, R2, S],
    arohanaStr: 'S R₂ G₃ P N₃ Ṡ',
    avarohanaStr: 'Ṡ N₃ P G₃ R₂ S',
    swaras: [S, R2, G3, P, N3],
    swarasthanaIndices: [0, 2, 4, 7, 11],
    swarasthanaSet: new Set([0, 2, 4, 7, 11]),
    varjaIndices: [5, 9], // M and D omitted
    description: 'Created by Ramaswami Dikshitar; auspicious invocatory raga featuring sharp Kakali Nishadham and bright Antara Gandharam, omitting M and D.',
    phrases: [
      {
        id: 'ham_pakad_1',
        name: 'Ascending Cadence',
        swaras: ['S', 'R₂', 'G₃', 'P'],
        indices: [0, 2, 4, 7],
        description: 'Bright ascending sweep landing firmly on Panchamam.',
        isPakad: true,
      },
      {
        id: 'ham_pakad_2',
        name: 'Kakali Nishadha Peak',
        swaras: ['G₃', 'P', 'N₃', 'Ṡ'],
        indices: [4, 7, 11, 0],
        description: 'Signature launch into Tara Shadjam through sharp Kakali Nishadham.',
        isPakad: true,
      },
      {
        id: 'ham_prayoga_3',
        name: 'Hamsadhwani Descent',
        swaras: ['Ṡ', 'N₃', 'P', 'G₃', 'R₂', 'S'],
        indices: [0, 11, 7, 4, 2, 0],
        description: 'Complete symmetrical descending cascade skipping M and D.',
        isPakad: false,
      },
      {
        id: 'ham_prayoga_4',
        name: 'Panchama-Gandhara Glide',
        swaras: ['P', 'G₃', 'R₂', 'G₃', 'P'],
        indices: [7, 4, 2, 4, 7],
        description: 'Characteristic gentle oscillation around Antara Gandharam.',
        isPakad: false,
      },
    ],
  },

  // 3. HINDOLAM
  {
    id: 'hindolam',
    name: 'Hindolam',
    displayName: 'Hindolam',
    melakartaNum: 20,
    melakartaName: 'Natabhairavi',
    type: JANYA_TYPES.AUDAVA_AUDAVA,
    category: 'Audava-Audava',
    isBhashanga: false,
    arohana: [S, G2, M1, D1, N2, S_DOT],
    avarohana: [S_DOT, N2, D1, M1, G2, S],
    arohanaStr: 'S G₂ M₁ D₁ N₂ Ṡ',
    avarohanaStr: 'Ṡ N₂ D₁ M₁ G₂ S',
    swaras: [S, G2, M1, D1, N2],
    swarasthanaIndices: [0, 3, 5, 8, 10],
    swarasthanaSet: new Set([0, 3, 5, 8, 10]),
    varjaIndices: [1, 2, 7], // R and P omitted
    description: 'Profound, meditative audava raga omitting R and P. Deep oscillations on Sadharana Gandharam and Suddha Dhaivatam evoke intense devotion.',
    phrases: [
      {
        id: 'hin_pakad_1',
        name: 'Gandhara-Madhyama Oscillation',
        swaras: ['S', 'M₁', 'G₂', 'M₁'],
        indices: [0, 5, 3, 5],
        description: 'Direct leap from Sa to Suddha Madhyamam oscillating into Sadharana Gandharam.',
        isPakad: true,
      },
      {
        id: 'hin_pakad_2',
        name: 'Dhaivata-Nishadha Sway',
        swaras: ['M₁', 'D₁', 'N₂', 'D₁', 'M₁'],
        indices: [5, 8, 10, 8, 5],
        description: 'Heartbeat phrase of Hindolam weaving between D₁ and N₂.',
        isPakad: true,
      },
      {
        id: 'hin_prayoga_3',
        name: 'Hindolam Tara Descent',
        swaras: ['Ṡ', 'N₂', 'D₁', 'M₁', 'G₂', 'S'],
        indices: [0, 10, 8, 5, 3, 0],
        description: 'Smooth descent skipping Panchamam and Rishabham.',
        isPakad: false,
      },
    ],
  },

  // 4. MADHYAMAVATI
  {
    id: 'madhyamavati',
    name: 'Madhyamavati',
    displayName: 'Madhyamavati',
    melakartaNum: 22,
    melakartaName: 'Kharaharapriya',
    type: JANYA_TYPES.AUDAVA_AUDAVA,
    category: 'Audava-Audava',
    isBhashanga: false,
    arohana: [S, R2, M1, P, N2, S_DOT],
    avarohana: [S_DOT, N2, P, M1, R2, S],
    arohanaStr: 'S R₂ M₁ P N₂ Ṡ',
    avarohanaStr: 'Ṡ N₂ P M₁ R₂ S',
    swaras: [S, R2, M1, P, N2],
    swarasthanaIndices: [0, 2, 5, 7, 10],
    swarasthanaSet: new Set([0, 2, 5, 7, 10]),
    varjaIndices: [3, 4, 8, 9], // G and D omitted
    description: 'The auspicious concluding Mangala raga. Perfectly symmetrical pentatonic omitting Gandharam and Dhaivatam, with poignant oscillations on R₂ and N₂.',
    phrases: [
      {
        id: 'madh_pakad_1',
        name: 'Rishabha-Madhyama-Panchama Wave',
        swaras: ['R₂', 'M₁', 'P', 'N₂', 'P'],
        indices: [2, 5, 7, 10, 7],
        description: 'Distinctive ascending curve caressing Kaisiki Nishadham and settling on Panchamam.',
        isPakad: true,
      },
      {
        id: 'madh_pakad_2',
        name: 'Peaceful Cadence to Sa',
        swaras: ['P', 'M₁', 'R₂', 'S'],
        indices: [7, 5, 2, 0],
        description: 'Soothing descent resting gently on prolonged Chatusruti Rishabham.',
        isPakad: true,
      },
      {
        id: 'madh_prayoga_3',
        name: 'Madhyamavati Tara Lift',
        swaras: ['R₂', 'M₁', 'P', 'N₂', 'Ṡ'],
        indices: [2, 5, 7, 10, 0],
        description: 'Ascending run crowning on Tara Shadjam.',
        isPakad: false,
      },
    ],
  },

  // 5. SUDDHA DHANYASI
  {
    id: 'suddha_dhanyasi',
    name: 'Suddha Dhanyasi',
    displayName: 'Suddha Dhanyasi',
    melakartaNum: 22,
    melakartaName: 'Kharaharapriya',
    type: JANYA_TYPES.AUDAVA_AUDAVA,
    category: 'Audava-Audava',
    isBhashanga: false,
    arohana: [S, G2, M1, P, N2, S_DOT],
    avarohana: [S_DOT, N2, P, M1, G2, S],
    arohanaStr: 'S G₂ M₁ P N₂ Ṡ',
    avarohanaStr: 'Ṡ N₂ P M₁ G₂ S',
    swaras: [S, G2, M1, P, N2],
    swarasthanaIndices: [0, 3, 5, 7, 10],
    swarasthanaSet: new Set([0, 3, 5, 7, 10]),
    varjaIndices: [1, 2, 8, 9], // R and D omitted
    description: 'Vibrant and uplifting pentatonic raga omitting R and D. Shares notes with Udayaravichandrika; produces a bright, yearning emotional color.',
    phrases: [
      {
        id: 'sdh_pakad_1',
        name: 'Gandhara-Madhyama-Panchama Drive',
        swaras: ['S', 'G₂', 'M₁', 'P'],
        indices: [0, 3, 5, 7],
        description: 'Punchy rising motion with pure Sadharana Gandharam.',
        isPakad: true,
      },
      {
        id: 'sdh_pakad_2',
        name: 'Panchama-Nishadha Tara Call',
        swaras: ['P', 'N₂', 'Ṡ', 'N₂', 'P'],
        indices: [7, 10, 0, 10, 7],
        description: 'High energy call reaching to Tara Sa and swinging back to Pa.',
        isPakad: true,
      },
      {
        id: 'sdh_prayoga_3',
        name: 'Full Pentatonic Descent',
        swaras: ['Ṡ', 'N₂', 'P', 'M₁', 'G₂', 'S'],
        indices: [0, 10, 7, 5, 3, 0],
        description: 'Complete flowing descent across all five swarasthanas.',
        isPakad: false,
      },
    ],
  },

  // 6. ABHOGI
  {
    id: 'abhogi',
    name: 'Abhogi',
    displayName: 'Abhogi',
    melakartaNum: 22,
    melakartaName: 'Kharaharapriya',
    type: JANYA_TYPES.AUDAVA_AUDAVA,
    category: 'Audava-Audava',
    isBhashanga: false,
    arohana: [S, R2, G2, M1, D2, S_DOT],
    avarohana: [S_DOT, D2, M1, G2, R2, S],
    arohanaStr: 'S R₂ G₂ M₁ D₂ Ṡ',
    avarohanaStr: 'Ṡ D₂ M₁ G₂ R₂ S',
    swaras: [S, R2, G2, M1, D2],
    swarasthanaIndices: [0, 2, 3, 5, 9],
    swarasthanaSet: new Set([0, 2, 3, 5, 9]),
    varjaIndices: [7, 10, 11], // P and N omitted
    description: 'Crisp, buoyant pentatonic omitting Panchamam and Nishadham. Famous for expansive leaps between Madhyamam and Dhaivatam.',
    phrases: [
      {
        id: 'abh_pakad_1',
        name: 'Madhyama-Dhaivata Leap',
        swaras: ['R₂', 'G₂', 'M₁', 'D₂'],
        indices: [2, 3, 5, 9],
        description: 'Trademark bold leap from Suddha Madhyamam to Chatusruti Dhaivatam.',
        isPakad: true,
      },
      {
        id: 'abh_pakad_2',
        name: 'Abhogi Cadence',
        swaras: ['D₂', 'M₁', 'G₂', 'R₂', 'S'],
        indices: [9, 5, 3, 2, 0],
        description: 'Panchama-less descent cascading directly from Dhaivatam to Madhyamam.',
        isPakad: true,
      },
    ],
  },

  // 7. SRIRANJANI
  {
    id: 'sriranjani',
    name: 'Sriranjani',
    displayName: 'Sriranjani',
    melakartaNum: 22,
    melakartaName: 'Kharaharapriya',
    type: JANYA_TYPES.SHADAVA_SHADAVA,
    category: 'Shadava-Shadava',
    isBhashanga: false,
    arohana: [S, R2, G2, M1, D2, N2, S_DOT],
    avarohana: [S_DOT, N2, D2, M1, G2, R2, S],
    arohanaStr: 'S R₂ G₂ M₁ D₂ N₂ Ṡ',
    avarohanaStr: 'Ṡ N₂ D₂ M₁ G₂ R₂ S',
    swaras: [S, R2, G2, M1, D2, N2],
    swarasthanaIndices: [0, 2, 3, 5, 9, 10],
    swarasthanaSet: new Set([0, 2, 3, 5, 9, 10]),
    varjaIndices: [7], // P omitted
    description: 'Majestic 6-note raga derived by omitting only Panchamam from Kharaharapriya. Expansive, soothing, and intellectually deep.',
    phrases: [
      {
        id: 'sri_pakad_1',
        name: 'Panchama-Free Ascent',
        swaras: ['R₂', 'G₂', 'M₁', 'D₂', 'N₂', 'Ṡ'],
        indices: [2, 3, 5, 9, 10, 0],
        description: 'Soaring ascent through Madhyamam straight to Dhaivatam and Nishadham.',
        isPakad: true,
      },
      {
        id: 'sri_pakad_2',
        name: 'Descending Arc',
        swaras: ['N₂', 'D₂', 'M₁', 'G₂', 'R₂', 'S'],
        indices: [10, 9, 5, 3, 2, 0],
        description: 'Graceful glide bridging the upper tetrarch to the lower without Pa.',
        isPakad: true,
      },
    ],
  },

  // 8. BHAIRAVI
  {
    id: 'bhairavi',
    name: 'Bhairavi',
    displayName: 'Bhairavi',
    melakartaNum: 20,
    melakartaName: 'Natabhairavi',
    type: JANYA_TYPES.BHASHANGA,
    category: 'Bhashanga',
    isBhashanga: true,
    arohana: [S, R2, G2, M1, P, D2, N2, S_DOT], // Takes Chatusruti D2 in ascent
    avarohana: [S_DOT, N2, D1, P, M1, G2, R2, S], // Takes Suddha D1 in descent
    arohanaStr: 'S R₂ G₂ M₁ P D₂ N₂ Ṡ',
    avarohanaStr: 'Ṡ N₂ D₁ P M₁ G₂ R₂ S',
    swaras: [S, R2, G2, M1, P, D1, D2, N2],
    swarasthanaIndices: [0, 2, 3, 5, 7, 8, 9, 10],
    swarasthanaSet: new Set([0, 2, 3, 5, 7, 8, 9, 10]),
    bhashangaNotes: [D2],
    description: 'The crowning queen of Carnatic music. Bhashanga raga taking Chatusruti Dhaivatam (D₂) in ascent and Suddha Dhaivatam (D₁) in descent.',
    phrases: [
      {
        id: 'bhai_pakad_1',
        name: 'Ascending Chatusruti Dhaivata Prayoga',
        swaras: ['G₂', 'M₁', 'P', 'D₂', 'N₂', 'Ṡ'],
        indices: [3, 5, 7, 9, 10, 0],
        description: 'Crucial signature incorporating high D₂ in upward movement.',
        isPakad: true,
      },
      {
        id: 'bhai_pakad_2',
        name: 'Suddha Dhaivata Descent Curve',
        swaras: ['Ṡ', 'N₂', 'D₁', 'P', 'M₁', 'G₂'],
        indices: [0, 10, 8, 7, 5, 3],
        description: 'Poignant cascade taking Suddha Dhaivatam (D₁) in descent.',
        isPakad: true,
      },
      {
        id: 'bhai_prayoga_3',
        name: 'Classic Mandra Sanchara',
        swaras: ['N₂', 'D₁', 'P', 'M₁', 'G₂', 'R₂', 'S'],
        indices: [10, 8, 7, 5, 3, 2, 0],
        description: 'Profound devotional release landing firmly on Shadjam.',
        isPakad: false,
      },
    ],
  },

  // 9. KAMBHOJI
  {
    id: 'kambhoji',
    name: 'Kambhoji',
    displayName: 'Kambhoji',
    melakartaNum: 28,
    melakartaName: 'Harikambhoji',
    type: JANYA_TYPES.SHADAVA_SAMPURNA,
    category: 'Shadava-Sampurna / Bhashanga',
    isBhashanga: true,
    arohana: [S, R2, G3, M1, P, D2, S_DOT],
    avarohana: [S_DOT, N2, D2, P, M1, G3, R2, S],
    arohanaStr: 'S R₂ G₃ M₁ P D₂ Ṡ',
    avarohanaStr: 'Ṡ N₂ D₂ P M₁ G₃ R₂ S',
    swaras: [S, R2, G3, M1, P, D2, N2, N3],
    swarasthanaIndices: [0, 2, 4, 5, 7, 9, 10, 11],
    swarasthanaSet: new Set([0, 2, 4, 5, 7, 9, 10, 11]),
    bhashangaNotes: [N3],
    description: 'Grand monarch of Carnatic ragas. Shadava in ascent (omits N). Famous for the special Vishesha prayoga "S N₃ P D₂ Ṡ" taking Kakali Nishadha (N₃).',
    phrases: [
      {
        id: 'kam_pakad_1',
        name: 'Vishesha Kakali Nishadha Prayoga',
        swaras: ['S', 'N₃', 'P', 'D₂', 'Ṡ'],
        indices: [0, 11, 7, 9, 0],
        description: 'Legendary signature phrase using sharp Kakali Nishadham (N₃).',
        isPakad: true,
      },
      {
        id: 'kam_pakad_2',
        name: 'Ascending Dhaivata Launch',
        swaras: ['M₁', 'P', 'D₂', 'Ṡ'],
        indices: [5, 7, 9, 0],
        description: 'Trademark ascent skipping Nishadham straight from D₂ to Tara Sa.',
        isPakad: true,
      },
      {
        id: 'kam_prayoga_3',
        name: 'Kambhoji Full Descent',
        swaras: ['Ṡ', 'N₂', 'D₂', 'P', 'M₁', 'G₃', 'R₂', 'S'],
        indices: [0, 10, 9, 7, 5, 4, 2, 0],
        description: 'Sampurna descent taking normal Kaisiki Nishadham (N₂).',
        isPakad: false,
      },
    ],
  },

  // 10. BILAHARI
  {
    id: 'bilahari',
    name: 'Bilahari',
    displayName: 'Bilahari',
    melakartaNum: 29,
    melakartaName: 'Dhirasankarabharanam',
    type: JANYA_TYPES.AUDAVA_SAMPURNA,
    category: 'Audava-Sampurna / Bhashanga',
    isBhashanga: true,
    arohana: [S, R2, G3, P, D2, S_DOT],
    avarohana: [S_DOT, N3, D2, P, M1, G3, R2, S],
    arohanaStr: 'S R₂ G₃ P D₂ Ṡ',
    avarohanaStr: 'Ṡ N₃ D₂ P M₁ G₃ R₂ S',
    swaras: [S, R2, G3, M1, P, D2, N2, N3],
    swarasthanaIndices: [0, 2, 4, 5, 7, 9, 10, 11],
    swarasthanaSet: new Set([0, 2, 4, 5, 7, 9, 10, 11]),
    bhashangaNotes: [N2],
    description: 'Bright, celebratory morning raga. Ascends like Mohanam (S R₂ G₃ P D₂ Ṡ) and descends sampurna. Occasionally takes Kaisiki N₂ in "P D₂ N₂ D₂ P".',
    phrases: [
      {
        id: 'bil_pakad_1',
        name: 'Mohana-Style Ascent into Tara Sa',
        swaras: ['G₃', 'P', 'D₂', 'Ṡ'],
        indices: [4, 7, 9, 0],
        description: 'Vigorous rising phrase establishing the pentatonic ascent.',
        isPakad: true,
      },
      {
        id: 'bil_pakad_2',
        name: 'Kakali Nishadha Descent',
        swaras: ['Ṡ', 'N₃', 'D₂', 'P', 'M₁', 'G₃'],
        indices: [0, 11, 9, 7, 5, 4],
        description: 'Sparkling descent revealing full Sankarabharanam lineage.',
        isPakad: true,
      },
      {
        id: 'bil_prayoga_3',
        name: 'Kaisiki Nishadha Vishesha Prayoga',
        swaras: ['P', 'D₂', 'N₂', 'D₂', 'P'],
        indices: [7, 9, 10, 9, 7],
        description: 'Distinctive Bhashanga ornament introducing Kaisiki Nishadham (N₂).',
        isPakad: false,
      },
    ],
  },

  // 11. ANANDABHAIRAVI
  {
    id: 'anandabhairavi',
    name: 'Anandabhairavi',
    displayName: 'Anandabhairavi',
    melakartaNum: 20,
    melakartaName: 'Natabhairavi',
    type: JANYA_TYPES.VAKRA,
    category: 'Vakra / Bhashanga',
    isBhashanga: true,
    arohana: [S, G2, R2, G2, M1, P, D2, P, S_DOT],
    avarohana: [S_DOT, N2, D2, P, M1, G2, R2, S],
    arohanaStr: 'S G₂ R₂ G₂ M₁ P D₂ P Ṡ',
    avarohanaStr: 'Ṡ N₂ D₂ P M₁ G₂ R₂ S',
    swaras: [S, R2, G2, M1, P, D1, D2, N2],
    swarasthanaIndices: [0, 2, 3, 5, 7, 8, 9, 10],
    swarasthanaSet: new Set([0, 2, 3, 5, 7, 8, 9, 10]),
    description: 'Deeply emotive, traditional lullaby raga with gentle zig-zag curves (vakra prayogas) and characteristic oscillations on Gandharam.',
    phrases: [
      {
        id: 'anand_pakad_1',
        name: 'Vakra Gandhara Glide',
        swaras: ['S', 'G₂', 'R₂', 'G₂', 'M₁'],
        indices: [0, 3, 2, 3, 5],
        description: 'Prime identity motif of Anandabhairavi; looping through G₂ and R₂.',
        isPakad: true,
      },
      {
        id: 'anand_pakad_2',
        name: 'Vakra Panchama Turn',
        swaras: ['P', 'D₂', 'P', 'Ṡ'],
        indices: [7, 9, 7, 0],
        description: 'Signature upper phrase looping around Panchamam before touching Tara Sa.',
        isPakad: true,
      },
      {
        id: 'anand_prayoga_3',
        name: 'Madhyama-Gandhara Sway',
        swaras: ['M₁', 'P', 'D₂', 'P', 'M₁', 'G₂', 'R₂', 'S'],
        indices: [5, 7, 9, 7, 5, 3, 2, 0],
        description: 'Tender descending curve resolving with profound sweetness.',
        isPakad: false,
      },
    ],
  },

  // 12. REETHIGOWLA
  {
    id: 'reethigowla',
    name: 'Reethigowla',
    displayName: 'Reethigowla',
    melakartaNum: 20,
    melakartaName: 'Natabhairavi',
    type: JANYA_TYPES.VAKRA,
    category: 'Vakra',
    isBhashanga: false,
    arohana: [S, G2, R2, G2, M1, N2, N2, S_DOT],
    avarohana: [S_DOT, N2, D2, M1, G2, M1, P, M1, G2, R2, S],
    arohanaStr: 'S G₂ R₂ G₂ M₁ N₂ N₂ Ṡ',
    avarohanaStr: 'Ṡ N₂ D₂ M₁ G₂ M₁ P M₁ G₂ R₂ S',
    swaras: [S, R2, G2, M1, P, D2, N2],
    swarasthanaIndices: [0, 2, 3, 5, 7, 9, 10],
    swarasthanaSet: new Set([0, 2, 3, 5, 7, 9, 10]),
    description: 'Mesmerizing vakra raga celebrated for twin Nishadhams (N₂ N₂ Ṡ) and its signature Gandhara-Madhyama loop.',
    phrases: [
      {
        id: 'reethi_pakad_1',
        name: 'Twin Nishadha Tara Catch',
        swaras: ['M₁', 'N₂', 'N₂', 'Ṡ'],
        indices: [5, 10, 10, 0],
        description: 'Unmistakable Reethigowla signature pulse on repeated Kaisiki Nishadha.',
        isPakad: true,
      },
      {
        id: 'reethi_pakad_2',
        name: 'Vakra Gandhara Hook',
        swaras: ['G₂', 'R₂', 'G₂', 'M₁'],
        indices: [3, 2, 3, 5],
        description: 'Essential motif weaving through Sadharana Gandharam.',
        isPakad: true,
      },
      {
        id: 'reethi_prayoga_3',
        name: 'Complex Vakra Descent',
        swaras: ['M₁', 'G₂', 'M₁', 'P', 'M₁', 'G₂', 'R₂', 'S'],
        indices: [5, 3, 5, 7, 5, 3, 2, 0],
        description: 'Subtle weaving around Panchamam and Gandharam.',
        isPakad: false,
      },
    ],
  },

  // 13. ARABHI
  {
    id: 'arabhi',
    name: 'Arabhi',
    displayName: 'Arabhi',
    melakartaNum: 29,
    melakartaName: 'Dhirasankarabharanam',
    type: JANYA_TYPES.AUDAVA_SAMPURNA,
    category: 'Audava-Sampurna',
    isBhashanga: false,
    arohana: [S, R2, M1, P, D2, S_DOT],
    avarohana: [S_DOT, N3, D2, P, M1, G3, R2, S],
    arohanaStr: 'S R₂ M₁ P D₂ Ṡ',
    avarohanaStr: 'Ṡ N₃ D₂ P M₁ G₃ R₂ S',
    swaras: [S, R2, G3, M1, P, D2, N3],
    swarasthanaIndices: [0, 2, 4, 5, 7, 9, 11],
    swarasthanaSet: new Set([0, 2, 4, 5, 7, 9, 11]),
    description: 'Dynamic, heroic morning raga (Vira rasa). Rapid runs without lingering on G₃ or N₃, distinct from Devagandhari.',
    phrases: [
      {
        id: 'ara_pakad_1',
        name: 'Double Dhaivata Call',
        swaras: ['D₂', 'D₂', 'P'],
        indices: [9, 9, 7],
        description: 'Signature percussion-like pulse on Chatusruti Dhaivatam.',
        isPakad: true,
      },
      {
        id: 'ara_pakad_2',
        name: 'Brisk Descent Glide',
        swaras: ['M₁', 'G₃', 'R₂', 'S'],
        indices: [5, 4, 2, 0],
        description: 'Swift passage through G₃ with crisp resolution on Sa.',
        isPakad: true,
      },
      {
        id: 'ara_prayoga_3',
        name: 'Heroic Arohana Sweep',
        swaras: ['R₂', 'M₁', 'P', 'D₂', 'Ṡ'],
        indices: [2, 5, 7, 9, 0],
        description: 'Punchy ascent leaping directly from M₁ to P and D₂.',
        isPakad: false,
      },
    ],
  },

  // 14. KAPI
  {
    id: 'kapi',
    name: 'Kapi',
    displayName: 'Kapi',
    melakartaNum: 22,
    melakartaName: 'Kharaharapriya',
    type: JANYA_TYPES.VAKRA,
    category: 'Vakra / Bhashanga',
    isBhashanga: true,
    arohana: [S, R2, M1, P, N3, S_DOT],
    avarohana: [S_DOT, N2, D2, N2, P, M1, G2, R2, S],
    arohanaStr: 'S R₂ M₁ P N₃ Ṡ',
    avarohanaStr: 'Ṡ N₂ D₂ N₂ P M₁ G₂ R₂ S',
    swaras: [S, R2, G2, G3, M1, P, D1, D2, N2, N3],
    swarasthanaIndices: [0, 2, 3, 4, 5, 7, 8, 9, 10, 11],
    swarasthanaSet: new Set([0, 2, 3, 4, 5, 7, 8, 9, 10, 11]),
    bhashangaNotes: [N3, G3, D1],
    description: 'Expressive, romantic, and devotional raga rich in anyaswaras (Kakali N in ascent, Antara G, and Suddha D).',
    phrases: [
      {
        id: 'kap_pakad_1',
        name: 'Vakra Nishadha Sway',
        swaras: ['N₂', 'D₂', 'N₂', 'P'],
        indices: [10, 9, 10, 7],
        description: 'Quintessential Kapi turnaround floating between N₂ and D₂.',
        isPakad: true,
      },
      {
        id: 'kap_pakad_2',
        name: 'Ascending Kakali Nishadha Leap',
        swaras: ['R₂', 'M₁', 'P', 'N₃', 'Ṡ'],
        indices: [2, 5, 7, 11, 0],
        description: 'Soaring ascent taking sharp Kakali Nishadham to touch Tara Sa.',
        isPakad: true,
      },
      {
        id: 'kap_prayoga_3',
        name: 'Gentle Gandhara Cadence',
        swaras: ['P', 'M₁', 'G₂', 'R₂', 'S'],
        indices: [7, 5, 3, 2, 0],
        description: 'Tearful, melancholic descent resolving into base Sa.',
        isPakad: false,
      },
    ],
  },

  // 15. SAHANA
  {
    id: 'sahana',
    name: 'Sahana',
    displayName: 'Sahana',
    melakartaNum: 28,
    melakartaName: 'Harikambhoji',
    type: JANYA_TYPES.VAKRA,
    category: 'Vakra',
    isBhashanga: false,
    arohana: [S, R2, G3, M1, P, M1, D2, N2, S_DOT],
    avarohana: [S_DOT, N2, S_DOT, D2, P, M1, G3, M1, R2, G3, R2, S],
    arohanaStr: 'S R₂ G₃ M₁ P M₁ D₂ N₂ Ṡ',
    avarohanaStr: 'Ṡ N₂ Ṡ D₂ P M₁ G₃ M₁ R₂ G₃ R₂ S',
    swaras: [S, R2, G3, M1, P, D2, N2],
    swarasthanaIndices: [0, 2, 4, 5, 7, 9, 10],
    swarasthanaSet: new Set([0, 2, 4, 5, 7, 9, 10]),
    description: 'Profoundly moving Karuna (compassionate) raga characterized by endless delicate vakra oscillations around Gandharam and Nishadham.',
    phrases: [
      {
        id: 'sah_pakad_1',
        name: 'Vakra Madhyama Loop',
        swaras: ['R₂', 'G₃', 'M₁', 'P', 'M₁'],
        indices: [2, 4, 5, 7, 5],
        description: 'The soul of Sahana: ascending through Gandharam and looping back from Pa to Ma.',
        isPakad: true,
      },
      {
        id: 'sah_pakad_2',
        name: 'Signature Gandhara-Rishabha Sway',
        swaras: ['M₁', 'G₃', 'M₁', 'R₂', 'G₃', 'R₂', 'S'],
        indices: [5, 4, 5, 2, 4, 2, 0],
        description: 'Delicate vakra resolution that instantly identifies Sahana.',
        isPakad: true,
      },
    ],
  },

  // 16. BEGADA
  {
    id: 'begada',
    name: 'Begada',
    displayName: 'Begada',
    melakartaNum: 29,
    melakartaName: 'Dhirasankarabharanam',
    type: JANYA_TYPES.VAKRA,
    category: 'Vakra',
    isBhashanga: false,
    arohana: [S, G3, R2, G3, M1, P, D2, P, S_DOT],
    avarohana: [S_DOT, N3, D2, P, M1, G3, R2, S],
    arohanaStr: 'S G₃ R₂ G₃ M₁ P D₂ P Ṡ',
    avarohanaStr: 'Ṡ N₃ D₂ P M₁ G₃ R₂ S',
    swaras: [S, R2, G3, M1, P, D2, N3],
    swarasthanaIndices: [0, 2, 4, 5, 7, 9, 11],
    swarasthanaSet: new Set([0, 2, 4, 5, 7, 9, 11]),
    description: 'Noble and assertive raga renowned for its prolonged, highly accented Madhyamam and vakra G₃ turns.',
    phrases: [
      {
        id: 'beg_pakad_1',
        name: 'Characteristic Gandhara Start',
        swaras: ['S', 'G₃', 'R₂', 'G₃', 'M₁'],
        indices: [0, 4, 2, 4, 5],
        description: 'Bold leap to G₃ and prolonged oscillation landing on sharp M₁.',
        isPakad: true,
      },
      {
        id: 'beg_pakad_2',
        name: 'Begada Upper Turn',
        swaras: ['M₁', 'D₂', 'P', 'Ṡ'],
        indices: [5, 9, 7, 0],
        description: 'Upper vakra turn bypassing Nishadha in ascent.',
        isPakad: true,
      },
    ],
  },

  // 17. AMRITAVARSHINI
  {
    id: 'amritavarshini',
    name: 'Amritavarshini',
    displayName: 'Amritavarshini',
    melakartaNum: 65,
    melakartaName: 'Mechakalyani',
    type: JANYA_TYPES.AUDAVA_AUDAVA,
    category: 'Audava-Audava',
    isBhashanga: false,
    arohana: [S, R2, G3, M2, P, N3, S_DOT],
    avarohana: [S_DOT, N3, P, M2, G3, R2, S],
    arohanaStr: 'S R₂ G₃ M₂ P N₃ Ṡ',
    avarohanaStr: 'Ṡ N₃ P M₂ G₃ R₂ S',
    swaras: [S, R2, G3, M2, P, N3],
    swarasthanaIndices: [0, 2, 4, 6, 7, 11],
    swarasthanaSet: new Set([0, 2, 4, 6, 7, 11]),
    varjaIndices: [8, 9, 10], // Dhaivatam omitted
    description: 'Fabled rain-bringing raga created by Muthuswami Dikshitar. Features brilliant Prati Madhyamam (M₂) paired with Antara Gandharam and Kakali Nishadham.',
    phrases: [
      {
        id: 'amr_pakad_1',
        name: 'Prati Madhyama Cascade',
        swaras: ['S', 'G₃', 'M₂', 'P', 'N₃', 'Ṡ'],
        indices: [0, 4, 6, 7, 11, 0],
        description: 'Luminous ascent sparkling with Prati Madhyamam (M₂).',
        isPakad: true,
      },
      {
        id: 'amr_pakad_2',
        name: 'Amritavarshini Descent',
        swaras: ['Ṡ', 'N₃', 'P', 'M₂', 'G₃', 'S'],
        indices: [0, 11, 7, 6, 4, 0],
        description: 'Crystalline descent skipping Dhaivatam.',
        isPakad: true,
      },
    ],
  },

  // 18. HAMSANANDI
  {
    id: 'hamsanandi',
    name: 'Hamsanandi',
    displayName: 'Hamsanandi',
    melakartaNum: 53,
    melakartaName: 'Gamanashrama',
    type: JANYA_TYPES.AUDAVA_SHADAVA,
    category: 'Audava-Shadava',
    isBhashanga: false,
    arohana: [S, R1, G3, M2, D2, N3, S_DOT],
    avarohana: [S_DOT, N3, D2, M2, G3, R1, S],
    arohanaStr: 'S R₁ G₃ M₂ D₂ N₃ Ṡ',
    avarohanaStr: 'Ṡ N₃ D₂ M₂ G₃ R₁ S',
    swaras: [S, R1, G3, M2, D2, N3],
    swarasthanaIndices: [0, 1, 4, 6, 9, 11],
    swarasthanaSet: new Set([0, 1, 4, 6, 9, 11]),
    varjaIndices: [7], // P omitted
    description: 'Evocative twilight raga omitting Panchamam entirely. Features sharp Prati Madhyamam (M₂) alongside Suddha Rishabham (R₁).',
    phrases: [
      {
        id: 'hndi_pakad_1',
        name: 'M2-D2-N3 Upper Tetrarch',
        swaras: ['M₂', 'D₂', 'N₃', 'Ṡ'],
        indices: [6, 9, 11, 0],
        description: 'Luminous upper climb characteristic of late-evening serenity.',
        isPakad: true,
      },
      {
        id: 'hndi_pakad_2',
        name: 'Hamsanandi Descent',
        swaras: ['Ṡ', 'N₃', 'D₂', 'M₂', 'G₃', 'R₁', 'S'],
        indices: [0, 11, 9, 6, 4, 1, 0],
        description: 'Panchama-free descent highlighting the gap between M₂ and G₃.',
        isPakad: true,
      },
    ],
  },

  // 19. MALAHARI
  {
    id: 'malahari',
    name: 'Malahari',
    displayName: 'Malahari',
    melakartaNum: 15,
    melakartaName: 'Mayamalavagowla',
    type: JANYA_TYPES.AUDAVA_SHADAVA,
    category: 'Audava-Shadava',
    isBhashanga: false,
    arohana: [S, R1, M1, P, D1, S_DOT],
    avarohana: [S_DOT, D1, P, M1, G3, R1, S],
    arohanaStr: 'S R₁ M₁ P D₁ Ṡ',
    avarohanaStr: 'Ṡ D₁ P M₁ G₃ R₁ S',
    swaras: [S, R1, G3, M1, P, D1],
    swarasthanaIndices: [0, 1, 4, 5, 7, 8],
    swarasthanaSet: new Set([0, 1, 4, 5, 7, 8]),
    varjaIndices: [10, 11], // N omitted
    description: 'Auspicious morning raga revered for Purandara Dasa’s foundation Pillari Geethams (Sri Gananatha, Kundagoura). Omits G in ascent and N entirely.',
    phrases: [
      {
        id: 'mal_pakad_1',
        name: 'Pillari Geetham Motif',
        swaras: ['M₁', 'P', 'D₁', 'P', 'M₁'],
        indices: [5, 7, 8, 7, 5],
        description: 'The foundation phrase immortalized in beginner Carnatic Geethams.',
        isPakad: true,
      },
      {
        id: 'mal_pakad_2',
        name: 'Malahari Descent Curve',
        swaras: ['D₁', 'P', 'M₁', 'G₃', 'R₁', 'S'],
        indices: [8, 7, 5, 4, 1, 0],
        description: 'Serene resolution through Suddha Rishabham (R₁).',
        isPakad: true,
      },
    ],
  },

  // 20. SAVERI
  {
    id: 'saveri',
    name: 'Saveri',
    displayName: 'Saveri',
    melakartaNum: 15,
    melakartaName: 'Mayamalavagowla',
    type: JANYA_TYPES.AUDAVA_SAMPURNA,
    category: 'Audava-Sampurna',
    isBhashanga: false,
    arohana: [S, R1, M1, P, D1, S_DOT],
    avarohana: [S_DOT, N3, D1, P, M1, G3, R1, S],
    arohanaStr: 'S R₁ M₁ P D₁ Ṡ',
    avarohanaStr: 'Ṡ N₃ D₁ P M₁ G₃ R₁ S',
    swaras: [S, R1, G3, M1, P, D1, N3],
    swarasthanaIndices: [0, 1, 4, 5, 7, 8, 11],
    swarasthanaSet: new Set([0, 1, 4, 5, 7, 8, 11]),
    description: 'Profound devotional and poignant raga. Ascends skipping G and N; descends sampurna with lingering oscillations on R₁ and D₁.',
    phrases: [
      {
        id: 'sav_pakad_1',
        name: 'Dhaivata Oscillation Hook',
        swaras: ['P', 'D₁', 'N₃', 'D₁', 'P'],
        indices: [7, 8, 11, 8, 7],
        description: 'Haunting phrase caressing Kakali N while resting on Suddha Dhaivatam.',
        isPakad: true,
      },
      {
        id: 'sav_pakad_2',
        name: 'Rishabha-Madhyama Ascent',
        swaras: ['R₁', 'M₁', 'P', 'D₁', 'Ṡ'],
        indices: [1, 5, 7, 8, 0],
        description: 'Ascending spine skipping Gandharam.',
        isPakad: true,
      },
    ],
  },
];

// Ensure all Janya ragas have explicit isJanya flag and number matching parent
JANYA_RAGAS.forEach((j) => {
  j.isJanya = true;
  j.number = j.melakartaNum;
});

/**
 * Famous Melakarta Signature Phrases (Pakads)
 * Even for parent scales, knowing the signature phrases allows dynamic phrase recognition!
 */
export const MELAKARTA_PHRASES = [
  {
    melakartaNum: 29,
    ragaName: 'Sankarabharanam',
    id: 'sank_pakad_1',
    name: 'Grand Ascent',
    swaras: ['S', 'R₂', 'G₃', 'M₁', 'P'],
    indices: [0, 2, 4, 5, 7],
    description: 'Pure diatonic major tetrachord of Sankarabharanam.',
    isPakad: true,
  },
  {
    melakartaNum: 29,
    ragaName: 'Sankarabharanam',
    id: 'sank_pakad_2',
    name: 'Upper Tetrachord Launch',
    swaras: ['P', 'D₂', 'N₃', 'Ṡ'],
    indices: [7, 9, 11, 0],
    description: 'Clear, steady progression to Tara Shadjam.',
    isPakad: true,
  },
  {
    melakartaNum: 65,
    ragaName: 'Kalyani',
    id: 'kal_pakad_1',
    name: 'Prati Madhyama Glow',
    swaras: ['G₃', 'M₂', 'P', 'D₂', 'N₃', 'Ṡ'],
    indices: [4, 6, 7, 9, 11, 0],
    description: 'The radiant, majestic signature climb of Mechakalyani.',
    isPakad: true,
  },
  {
    melakartaNum: 65,
    ragaName: 'Kalyani',
    id: 'kal_pakad_2',
    name: 'Descending Cadence',
    swaras: ['Ṡ', 'N₃', 'D₂', 'P', 'M₂', 'G₃'],
    indices: [0, 11, 9, 7, 6, 4],
    description: 'Graceful descent highlighting Prati Madhyamam.',
    isPakad: true,
  },
  {
    melakartaNum: 15,
    ragaName: 'Mayamalavagowla',
    id: 'mmg_pakad_1',
    name: 'Lower Semitone Pair',
    swaras: ['S', 'R₁', 'G₃', 'M₁'],
    indices: [0, 1, 4, 5],
    description: 'The foundation lesson scale: S-R₁ (semitone) and G₃-M₁ (semitone).',
    isPakad: true,
  },
  {
    melakartaNum: 15,
    ragaName: 'Mayamalavagowla',
    id: 'mmg_pakad_2',
    name: 'Upper Semitone Pair',
    swaras: ['P', 'D₁', 'N₃', 'Ṡ'],
    indices: [7, 8, 11, 0],
    description: 'The symmetrical upper half: P-D₁ (semitone) and N₃-Ṡ (semitone).',
    isPakad: true,
  },
  {
    melakartaNum: 22,
    ragaName: 'Kharaharapriya',
    id: 'khp_pakad_1',
    name: 'Dorian Tetrachord',
    swaras: ['R₂', 'G₂', 'M₁', 'P', 'D₂'],
    indices: [2, 3, 5, 7, 9],
    description: 'The pure, resonant spine of Kharaharapriya.',
    isPakad: true,
  },
  {
    melakartaNum: 8,
    ragaName: 'Hanumatodi',
    id: 'todi_pakad_1',
    name: 'Todi Gamaka Rishabham',
    swaras: ['M₁', 'G₂', 'R₁', 'S'],
    indices: [5, 3, 1, 0],
    description: 'Heavy oscillatory Gandhara and low Suddha Rishabha descent.',
    isPakad: true,
  },
  {
    melakartaNum: 56,
    ragaName: 'Shanmukhapriya',
    id: 'shan_pakad_1',
    name: 'Prati Madhyama - Suddha Dhaivata Leap',
    swaras: ['R₂', 'G₂', 'M₂', 'P', 'D₁'],
    indices: [2, 3, 6, 7, 8],
    description: 'Characteristic tense emotional color of Shanmukhapriya.',
    isPakad: true,
  },
  {
    melakartaNum: 21,
    ragaName: 'Keeravani',
    id: 'ker_pakad_1',
    name: 'Harmonic Minor Rise',
    swaras: ['M₁', 'P', 'D₁', 'N₃', 'Ṡ'],
    indices: [5, 7, 8, 11, 0],
    description: 'Signature leap from Suddha Dhaivatam to sharp Kakali Nishadham.',
    isPakad: true,
  },
  {
    melakartaNum: 26,
    ragaName: 'Charukesi',
    id: 'char_pakad_1',
    name: 'Major Third to Minor Sixth',
    swaras: ['G₃', 'M₁', 'P', 'D₁', 'N₂'],
    indices: [4, 5, 7, 8, 10],
    description: 'Emotional shift bridging major lower tetrachord to minor upper.',
    isPakad: true,
  },
];

/**
 * Master collection of all recognizable characteristic phrases (Pakads + Prayogas).
 */
export const ALL_RECOGNIZABLE_PHRASES = [
  ...JANYA_RAGAS.flatMap((j) =>
    j.phrases.map((p) => ({
      ...p,
      ragaId: j.id,
      ragaName: j.name,
      displayName: j.displayName,
      isJanya: true,
      category: j.category,
      melakartaNum: j.melakartaNum,
      melakartaName: j.melakartaName,
    }))
  ),
  ...MELAKARTA_PHRASES.map((p) => ({
    ...p,
    ragaId: `mela_${p.melakartaNum}`,
    displayName: `${p.ragaName} (#${p.melakartaNum})`,
    isJanya: false,
    category: 'Melakarta (Parent Scale)',
    melakartaName: p.ragaName,
  })),
];
