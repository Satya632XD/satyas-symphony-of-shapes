// src/core/Shapes.ts - Shape Catalog & Definitions for Satya's Symphony of Shapes
import { ShapeDefinition } from './Types.ts';

export const SHAPE_CATALOG: ShapeDefinition[] = [
  // --- Monominos ---
  {
    id: 'dot_1x1',
    name: 'Harmonic Prism',
    matrix: [[1]],
    baseColor: '#38bdf8', // Cyan
    secondaryColor: '#0284c7',
    rarity: 'common',
    description: 'A single point of pure harmonic frequency.'
  },

  // --- Dominos ---
  {
    id: 'domino_1x2',
    name: 'Dual Note H',
    matrix: [[1, 1]],
    baseColor: '#34d399', // Emerald
    secondaryColor: '#059669',
    rarity: 'common'
  },
  {
    id: 'domino_2x1',
    name: 'Dual Note V',
    matrix: [[1], [1]],
    baseColor: '#34d399',
    secondaryColor: '#059669',
    rarity: 'common'
  },

  // --- Triominos ---
  {
    id: 'tri_1x3',
    name: 'Triad Beam H',
    matrix: [[1, 1, 1]],
    baseColor: '#818cf8', // Indigo
    secondaryColor: '#4f46e5',
    rarity: 'common'
  },
  {
    id: 'tri_3x1',
    name: 'Triad Beam V',
    matrix: [[1], [1], [1]],
    baseColor: '#818cf8',
    secondaryColor: '#4f46e5',
    rarity: 'common'
  },
  {
    id: 'tri_corner_tl',
    name: 'Corner Chord TL',
    matrix: [
      [1, 1],
      [1, 0]
    ],
    baseColor: '#fbbf24', // Amber
    secondaryColor: '#d97706',
    rarity: 'common'
  },
  {
    id: 'tri_corner_tr',
    name: 'Corner Chord TR',
    matrix: [
      [1, 1],
      [0, 1]
    ],
    baseColor: '#fbbf24',
    secondaryColor: '#d97706',
    rarity: 'common'
  },
  {
    id: 'tri_corner_bl',
    name: 'Corner Chord BL',
    matrix: [
      [1, 0],
      [1, 1]
    ],
    baseColor: '#fbbf24',
    secondaryColor: '#d97706',
    rarity: 'common'
  },
  {
    id: 'tri_corner_br',
    name: 'Corner Chord BR',
    matrix: [
      [0, 1],
      [1, 1]
    ],
    baseColor: '#fbbf24',
    secondaryColor: '#d97706',
    rarity: 'common'
  },

  // --- Tetraminos ---
  {
    id: 'square_2x2',
    name: 'Harmonic Square',
    matrix: [
      [1, 1],
      [1, 1]
    ],
    baseColor: '#f472b6', // Rose
    secondaryColor: '#db2777',
    rarity: 'common'
  },
  {
    id: 'tetris_1x4',
    name: 'Cadence Beam H',
    matrix: [[1, 1, 1, 1]],
    baseColor: '#22d3ee', // Cyan bright
    secondaryColor: '#0891b2',
    rarity: 'uncommon'
  },
  {
    id: 'tetris_4x1',
    name: 'Cadence Beam V',
    matrix: [[1], [1], [1], [1]],
    baseColor: '#22d3ee',
    secondaryColor: '#0891b2',
    rarity: 'uncommon'
  },
  {
    id: 'tetris_L_normal',
    name: 'Sonata Hook R',
    matrix: [
      [1, 0],
      [1, 0],
      [1, 1]
    ],
    baseColor: '#f97316', // Orange
    secondaryColor: '#c2410c',
    rarity: 'common'
  },
  {
    id: 'tetris_L_flipped',
    name: 'Sonata Hook L',
    matrix: [
      [0, 1],
      [0, 1],
      [1, 1]
    ],
    baseColor: '#f97316',
    secondaryColor: '#c2410c',
    rarity: 'common'
  },
  {
    id: 'tetris_L_horiz_up',
    name: 'Sonata Wing U',
    matrix: [
      [1, 1, 1],
      [0, 0, 1]
    ],
    baseColor: '#f97316',
    secondaryColor: '#c2410c',
    rarity: 'common'
  },
  {
    id: 'tetris_L_horiz_down',
    name: 'Sonata Wing D',
    matrix: [
      [1, 0, 0],
      [1, 1, 1]
    ],
    baseColor: '#f97316',
    secondaryColor: '#c2410c',
    rarity: 'common'
  },
  {
    id: 'tetris_T_down',
    name: 'Resonant Crest D',
    matrix: [
      [1, 1, 1],
      [0, 1, 0]
    ],
    baseColor: '#a855f7', // Purple
    secondaryColor: '#7e22ce',
    rarity: 'common'
  },
  {
    id: 'tetris_T_up',
    name: 'Resonant Crest U',
    matrix: [
      [0, 1, 0],
      [1, 1, 1]
    ],
    baseColor: '#a855f7',
    secondaryColor: '#7e22ce',
    rarity: 'common'
  },
  {
    id: 'tetris_Z',
    name: 'Vibrato Wave Z',
    matrix: [
      [1, 1, 0],
      [0, 1, 1]
    ],
    baseColor: '#ef4444', // Red
    secondaryColor: '#b91c1c',
    rarity: 'common'
  },
  {
    id: 'tetris_S',
    name: 'Vibrato Wave S',
    matrix: [
      [0, 1, 1],
      [1, 1, 0]
    ],
    baseColor: '#ef4444',
    secondaryColor: '#b91c1c',
    rarity: 'common'
  },

  // --- Pentaminos & Special Formations ---
  {
    id: 'cross_plus',
    name: 'Celestial Cross',
    matrix: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0]
    ],
    baseColor: '#eab308', // Gold
    secondaryColor: '#a16207',
    rarity: 'rare',
    description: 'An ancient cruciform resonance symbol.'
  },
  {
    id: 'square_3x3',
    name: 'Great Opus 3x3',
    matrix: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1]
    ],
    baseColor: '#ec4899', // Pink
    secondaryColor: '#9d174d',
    rarity: 'rare',
    description: 'Massive monolithic harmony cluster.'
  },
  {
    id: 'corner_3x3_L',
    name: 'Arch of Sound',
    matrix: [
      [1, 0, 0],
      [1, 0, 0],
      [1, 1, 1]
    ],
    baseColor: '#06b6d4', // Cyan dark
    secondaryColor: '#0e7490',
    rarity: 'uncommon'
  },
  {
    id: 'line_5x1',
    name: 'Symphonic Column',
    matrix: [[1], [1], [1], [1], [1]],
    baseColor: '#10b981', // Mint
    secondaryColor: '#047857',
    rarity: 'rare'
  },
  {
    id: 'line_1x5',
    name: 'Symphonic Row',
    matrix: [[1, 1, 1, 1, 1]],
    baseColor: '#10b981',
    secondaryColor: '#047857',
    rarity: 'rare'
  },
  {
    id: 'diagonal_3',
    name: 'Arpeggio Diagonal',
    matrix: [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ],
    baseColor: '#c084fc', // Lilac
    secondaryColor: '#9333ea',
    rarity: 'rare'
  },
  {
    id: 'u_shape',
    name: 'Harmonic Vessel',
    matrix: [
      [1, 0, 1],
      [1, 1, 1]
    ],
    baseColor: '#f59e0b',
    secondaryColor: '#b45309',
    rarity: 'uncommon'
  },
  {
    id: 'stair_3',
    name: 'Ascending Cadence',
    matrix: [
      [1, 0, 0],
      [1, 1, 0],
      [1, 1, 1]
    ],
    baseColor: '#6366f1',
    secondaryColor: '#4338ca',
    rarity: 'rare'
  }
];

// --- Special Crystal Infusions ---
export function createCrystalVariant(baseShape: ShapeDefinition): ShapeDefinition {
  return {
    ...baseShape,
    id: `${baseShape.id}_crystal`,
    name: `Crystal ${baseShape.name}`,
    rarity: 'crystal',
    isCrystal: true,
    baseColor: '#e0f2fe', // Shimmering light crystal cyan
    secondaryColor: '#38bdf8',
    description: 'Infused with rare celestial crystals. Clears award Shards and bonus XP!'
  };
}

// --- Special Harmonic Resonant Variants ---
export function createHarmonicVariant(baseShape: ShapeDefinition): ShapeDefinition {
  return {
    ...baseShape,
    id: `${baseShape.id}_harmonic`,
    name: `Harmonic ${baseShape.name}`,
    rarity: 'harmonic',
    isHarmonic: true,
    baseColor: '#fdf4ff', // Luminous pearlescent violet
    secondaryColor: '#c084fc',
    description: 'Resonates with musical overtone. Placing increases Harmony Meter significantly.'
  };
}

// --- Special Fusion Pieces (Harmonic Crucible) ---
export const FUSION_SHAPES: ShapeDefinition[] = [
  {
    id: 'fusion_omni_prism',
    name: 'Omni-Prism',
    matrix: [[1]],
    baseColor: '#ffffff',
    secondaryColor: '#facc15',
    rarity: 'crystal',
    isCrystal: true,
    isHarmonic: true,
    description: 'Crafted in the Crucible. Fits anywhere to trigger immediate line clears!'
  },
  {
    id: 'fusion_cleanser_2x2',
    name: 'Symphonic Core 2x2',
    matrix: [
      [1, 1],
      [1, 1]
    ],
    baseColor: '#38bdf8',
    secondaryColor: '#c084fc',
    rarity: 'harmonic',
    isCrystal: true,
    isHarmonic: true,
    description: 'Radiates immense energy, clearing adjacent cells upon placement!'
  }
];
