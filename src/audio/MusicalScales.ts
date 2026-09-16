// src/audio/MusicalScales.ts - Scales and Harmonies for Satya's Symphony of Shapes

// Standard frequencies for note calculations
export const NOTE_FREQS: Record<string, number> = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, 'F#4': 369.99, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, 'F#5': 739.99, G5: 783.99, A5: 880.00, B5: 987.77,
  C6: 1046.50, D6: 1174.66, E6: 1318.51, G6: 1567.98, A6: 1760.00, C7: 2093.00
};

export interface ScaleDefinition {
  name: string;
  notes: string[];
}

export const SCALES: Record<string, ScaleDefinition> = {
  // Crystal Garden - Major Pentatonic (Harmonious, sweet, never dissonant)
  crystal_garden: {
    name: 'Crystal Pentatonic',
    notes: ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'A5', 'C6']
  },
  // Celestial Symphony - Lydian Mode (Airy, luminous, magical)
  celestial: {
    name: 'Celestial Lydian',
    notes: ['C4', 'D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F#5', 'G5']
  },
  // Energy Temple - Dorian Mode (Sacred, ancient, mystical)
  energy_temple: {
    name: 'Temple Dorian',
    notes: ['D3', 'F3', 'G3', 'A3', 'C4', 'D4', 'F4', 'G4', 'A4', 'C5', 'D5']
  },
  // Harmonic Cyber - Synthwave Pentatonic
  harmonic_cyber: {
    name: 'Cyber Wave',
    notes: ['A3', 'C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'A5']
  },
  // Zen Sanctuary - Soothing Kalimba Scale
  zen_peace: {
    name: 'Zen Sanctuary',
    notes: ['C4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'C6']
  }
};

// Chord progressions for ambient pads
export const AMBIENT_CHORDS = [
  ['C3', 'G3', 'C4', 'E4', 'B4'], // Cmaj7
  ['A2', 'E3', 'A3', 'C4', 'G4'], // Am7
  ['F2', 'C3', 'F3', 'A3', 'E4'], // Fmaj7
  ['G2', 'D3', 'G3', 'B3', 'F4']  // G7 / Gsus
];
