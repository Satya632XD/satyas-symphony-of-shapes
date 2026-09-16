// src/audio/SoundPacks.ts - Instrument synthesis profiles for Satya's Symphony of Shapes
import { SoundPackId } from '../core/Types.ts';

export interface InstrumentProfile {
  id: SoundPackId;
  name: string;
  oscillatorType: OscillatorType;
  harmonicsType: OscillatorType;
  harmonicRatio: number;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  filterCutoff: number;
  filterQ: number;
  hasBellOvertone: boolean;
}

export const INSTRUMENT_PROFILES: Record<SoundPackId, InstrumentProfile> = {
  glass_marimba: {
    id: 'glass_marimba',
    name: 'Crystal Glass Marimba',
    oscillatorType: 'sine',
    harmonicsType: 'triangle',
    harmonicRatio: 2.76, // Chime-like glass harmonic ratio
    attack: 0.005,
    decay: 0.35,
    sustain: 0.05,
    release: 0.4,
    filterCutoff: 3800,
    filterQ: 3.5,
    hasBellOvertone: true
  },
  grand_piano: {
    id: 'grand_piano',
    name: 'Grand Acoustic Sonata',
    oscillatorType: 'triangle',
    harmonicsType: 'sine',
    harmonicRatio: 2.0,
    attack: 0.01,
    decay: 0.6,
    sustain: 0.15,
    release: 0.8,
    filterCutoff: 2400,
    filterQ: 1.2,
    hasBellOvertone: false
  },
  ambient_synth: {
    id: 'ambient_synth',
    name: 'Celestial Synth Chimes',
    oscillatorType: 'sawtooth',
    harmonicsType: 'sine',
    harmonicRatio: 1.5,
    attack: 0.02,
    decay: 0.5,
    sustain: 0.25,
    release: 0.7,
    filterCutoff: 1800,
    filterQ: 4.0,
    hasBellOvertone: true
  },
  zen_kalimba: {
    id: 'zen_kalimba',
    name: 'Zen Kalimba',
    oscillatorType: 'sine',
    harmonicsType: 'sine',
    harmonicRatio: 3.0,
    attack: 0.003,
    decay: 0.45,
    sustain: 0.08,
    release: 0.5,
    filterCutoff: 2800,
    filterQ: 2.0,
    hasBellOvertone: false
  }
};
