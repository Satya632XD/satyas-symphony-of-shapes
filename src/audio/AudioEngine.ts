// src/audio/AudioEngine.ts - Web Audio API Procedural Symphony Synthesizer
import { SoundPackId } from '../core/Types.ts';
import { NOTE_FREQS, SCALES, AMBIENT_CHORDS } from './MusicalScales.ts';
import { INSTRUMENT_PROFILES, InstrumentProfile } from './SoundPacks.ts';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;

  private currentInstrument: InstrumentProfile = INSTRUMENT_PROFILES.glass_marimba;
  private currentScaleKey: string = 'crystal_garden';

  // Volume settings (0.0 to 1.0)
  private masterVol: number = 0.8;
  private sfxVol: number = 0.8;
  private bgmVol: number = 0.5;

  private isAmbientPlaying: boolean = false;
  private ambientChordIndex: number = 0;
  private ambientTimerId: number | null = null;

  public init(): void {
    if (this.ctx) return;

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVol, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVol, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(this.bgmVol, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  public ensureContext(): void {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSoundPack(packId: SoundPackId): void {
    if (INSTRUMENT_PROFILES[packId]) {
      this.currentInstrument = INSTRUMENT_PROFILES[packId];
    }
  }

  public setScale(scaleKey: string): void {
    if (SCALES[scaleKey]) {
      this.currentScaleKey = scaleKey;
    }
  }

  public setVolumes(master: number, sfx: number, bgm: number): void {
    this.masterVol = Math.max(0, Math.min(1, master));
    this.sfxVol = Math.max(0, Math.min(1, sfx));
    this.bgmVol = Math.max(0, Math.min(1, bgm));

    if (this.ctx) {
      const now = this.ctx.currentTime;
      if (this.masterGain) this.masterGain.gain.setValueAtTime(this.masterVol, now);
      if (this.sfxGain) this.sfxGain.gain.setValueAtTime(this.sfxVol, now);
      if (this.bgmGain) this.bgmGain.gain.setValueAtTime(this.bgmVol, now);
    }
  }

  /**
   * Synthesize a note when a shape is placed, mapping (row, col) to harmonic pitches.
   */
  public playPlacementNote(row: number, col: number, isCrystal: boolean = false, isHarmonic: boolean = false): void {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain || this.sfxVol <= 0) return;

    const scale = SCALES[this.currentScaleKey] || SCALES.crystal_garden;
    const noteIndex = Math.abs((row * 2 + col * 3)) % scale.notes.length;
    const noteName = scale.notes[noteIndex];
    const freq = NOTE_FREQS[noteName] || 440;

    const now = this.ctx.currentTime;
    const inst = this.currentInstrument;

    // Primary Voice
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = inst.oscillatorType;
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(inst.filterCutoff, now);
    filter.Q.setValueAtTime(inst.filterQ, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.3, now + inst.attack);
    gain.gain.exponentialRampToValueAtTime(0.001, now + inst.attack + inst.decay + inst.release);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + inst.attack + inst.decay + inst.release + 0.1);

    // Harmonic Voice / Overtone
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = inst.harmonicsType;
    osc2.frequency.setValueAtTime(freq * inst.harmonicRatio, now);

    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.linearRampToValueAtTime(isHarmonic ? 0.25 : 0.1, now + inst.attack);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + inst.decay + 0.1);

    osc2.connect(filter);
    filter.connect(gain2);
    gain2.connect(this.sfxGain);

    osc2.start(now);
    osc2.stop(now + inst.decay + 0.15);

    // If Crystal: sparkling high bell overtone
    if (isCrystal) {
      const crystalOsc = this.ctx.createOscillator();
      const crystalGain = this.ctx.createGain();
      crystalOsc.type = 'sine';
      crystalOsc.frequency.setValueAtTime(freq * 3.5, now);

      crystalGain.gain.setValueAtTime(0.001, now);
      crystalGain.gain.linearRampToValueAtTime(0.2, now + 0.01);
      crystalGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

      crystalOsc.connect(crystalGain);
      crystalGain.connect(this.sfxGain);
      crystalOsc.start(now);
      crystalOsc.stop(now + 0.45);
    }
  }

  /**
   * Synthesize a gorgeous ascending chord flourish for line clears.
   */
  public playLineClearChords(lineCount: number, energyLevel: number = 1): void {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain || this.sfxVol <= 0) return;

    const chordsByLines: Record<number, string[]> = {
      1: ['C4', 'G4', 'C5'],
      2: ['C4', 'E4', 'G4', 'C5'],
      3: ['C4', 'E4', 'G4', 'B4', 'D5'],
      4: ['C4', 'G4', 'C5', 'E5', 'G5', 'C6'],
      5: ['C3', 'G3', 'C4', 'E4', 'G4', 'B4', 'D5', 'G5', 'C6']
    };

    const countKey = Math.min(5, Math.max(1, lineCount));
    const chordNotes = chordsByLines[countKey];
    const now = this.ctx.currentTime;

    // Arpeggiate notes with slight stagger
    chordNotes.forEach((note, index) => {
      const delay = index * 0.07;
      const freq = NOTE_FREQS[note] || 440;

      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const filter = this.ctx!.createBiquadFilter();

      osc.type = index === chordNotes.length - 1 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3200, now + delay);

      const noteDuration = 0.5 + (lineCount * 0.1);
      gain.gain.setValueAtTime(0.001, now + delay);
      gain.gain.linearRampToValueAtTime(0.35, now + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + noteDuration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now + delay);
      osc.stop(now + delay + noteDuration + 0.05);
    });

    // Sub-bass rumble for Energy Chain Overdrive
    if (energyLevel >= 3) {
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(65.41, now); // C2

      subGain.gain.setValueAtTime(0.001, now);
      subGain.gain.linearRampToValueAtTime(0.4, now + 0.05);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

      subOsc.connect(subGain);
      subGain.connect(this.sfxGain);
      subOsc.start(now);
      subOsc.stop(now + 0.85);
    }
  }

  /**
   * Play UI sound effects (click, shard gain, level up, game over).
   */
  public playUI(sound: 'click' | 'whoosh' | 'shard' | 'level_up' | 'game_over' | 'resonance'): void {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain || this.sfxVol <= 0) return;

    const now = this.ctx.currentTime;

    if (sound === 'click') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (sound === 'whoosh') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.15);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.16);
    } else if (sound === 'shard') {
      // Shimmering crystalline chime
      [1567.98, 2093.00, 2637.02].forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.05);
        gain.gain.setValueAtTime(0.001, now + i * 0.05);
        gain.gain.linearRampToValueAtTime(0.2, now + i * 0.05 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.05 + 0.35);
        osc.connect(gain);
        gain.connect(this.sfxGain!);
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.4);
      });
    } else if (sound === 'resonance') {
      // Majestic harmonic wave
      ['C4', 'E4', 'G4', 'B4', 'C5', 'E5'].forEach((note, i) => {
        const freq = NOTE_FREQS[note] || 523;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.04);
        gain.gain.setValueAtTime(0.001, now + i * 0.04);
        gain.gain.linearRampToValueAtTime(0.25, now + i * 0.04 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.04 + 0.8);
        osc.connect(gain);
        gain.connect(this.sfxGain!);
        osc.start(now + i * 0.04);
        osc.stop(now + i * 0.04 + 0.85);
      });
    } else if (sound === 'level_up') {
      ['G4', 'C5', 'E5', 'G5', 'C6'].forEach((n, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(NOTE_FREQS[n], now + idx * 0.09);
        gain.gain.setValueAtTime(0.001, now + idx * 0.09);
        gain.gain.linearRampToValueAtTime(0.3, now + idx * 0.09 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.09 + 0.6);
        osc.connect(gain);
        gain.connect(this.sfxGain!);
        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.65);
      });
    } else if (sound === 'game_over') {
      ['G4', 'E4', 'C4', 'A3'].forEach((n, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(NOTE_FREQS[n], now + idx * 0.18);
        gain.gain.setValueAtTime(0.001, now + idx * 0.18);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.18 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.18 + 0.7);
        osc.connect(gain);
        gain.connect(this.sfxGain!);
        osc.start(now + idx * 0.18);
        osc.stop(now + idx * 0.18 + 0.75);
      });
    }
  }

  /**
   * Start procedural generative background symphony.
   */
  public startAmbientSymphony(): void {
    if (this.isAmbientPlaying) return;
    this.isAmbientPlaying = true;
    this.playNextAmbientChord();
  }

  public stopAmbientSymphony(): void {
    this.isAmbientPlaying = false;
    if (this.ambientTimerId !== null) {
      window.clearTimeout(this.ambientTimerId);
      this.ambientTimerId = null;
    }
  }

  private playNextAmbientChord(): void {
    if (!this.isAmbientPlaying) return;

    this.ensureContext();
    if (this.ctx && this.bgmGain && this.bgmVol > 0) {
      const chord = AMBIENT_CHORDS[this.ambientChordIndex % AMBIENT_CHORDS.length];
      this.ambientChordIndex++;
      const now = this.ctx.currentTime;

      chord.forEach((noteName) => {
        const freq = NOTE_FREQS[noteName];
        if (!freq) return;

        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const filter = this.ctx!.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);

        // Slow, lush ambient swell
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.06, now + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.8);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGain!);

        osc.start(now);
        osc.stop(now + 5.0);
      });
    }

    // Schedule next chord in ~4.5 seconds
    this.ambientTimerId = window.setTimeout(() => {
      this.playNextAmbientChord();
    }, 4500);
  }
}
