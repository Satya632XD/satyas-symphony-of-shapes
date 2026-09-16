// src/progression/SaveManager.ts - LocalStorage Persistence & Version Migration
import { PlayerStats, SettingsState, ThemeId, PaletteId, SoundPackId, ParticleStyleId } from '../core/Types.ts';

export interface GameSaveData {
  version: number;
  lastSavedAt: number;
  playerLevel: number;
  playerXP: number;
  shards: number;
  harmonyRank: string;
  stats: PlayerStats;
  settings: SettingsState;
  equipped: {
    theme: ThemeId;
    palette: PaletteId;
    soundPack: SoundPackId;
    particleStyle: ParticleStyleId;
  };
  unlockedCosmetics: string[];
  claimedAchievements: string[];
  completedQuests: string[];
  journeyProgress: Record<number, number>; // stageNumber -> stars (0-3)
}

const SAVE_STORAGE_KEY = 'satyas_symphony_save_v1';
const CURRENT_VERSION = 1;

export const DEFAULT_SETTINGS: SettingsState = {
  masterVolume: 0.8,
  sfxVolume: 0.8,
  bgmVolume: 0.5,
  screenShake: true,
  reducedMotion: false,
  colorblindMode: 'none',
  touchOffset: 70, // default finger offset in px
  particlesQuality: 'high'
};

export const DEFAULT_STATS: PlayerStats = {
  gamesPlayed: 0,
  highScore: 0,
  totalScore: 0,
  totalLinesCleared: 0,
  highestCombo: 0,
  maxEnergyLevel: 1,
  crystalShapesCleared: 0,
  perfectPlacements: 0,
  boardWipes: 0,
  totalTimePlayedSec: 0,
  fusionsUsed: 0,
  stagesCompleted: 0
};

export class SaveManager {
  public static load(): GameSaveData {
    try {
      const raw = localStorage.getItem(SAVE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as GameSaveData;
        if (parsed && parsed.version === CURRENT_VERSION) {
          return {
            ...parsed,
            stats: { ...DEFAULT_STATS, ...parsed.stats },
            settings: { ...DEFAULT_SETTINGS, ...parsed.settings }
          };
        }
      }
    } catch (err) {
      console.warn('Failed to load save data from localStorage, using defaults', err);
    }

    return SaveManager.createDefaultSave();
  }

  public static save(data: GameSaveData): void {
    try {
      data.lastSavedAt = Date.now();
      localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('Failed to write save data to localStorage', err);
    }
  }

  public static createDefaultSave(): GameSaveData {
    return {
      version: CURRENT_VERSION,
      lastSavedAt: Date.now(),
      playerLevel: 1,
      playerXP: 0,
      shards: 150, // Starting bonus shards
      harmonyRank: 'Novice Harmonizer',
      stats: { ...DEFAULT_STATS },
      settings: { ...DEFAULT_SETTINGS },
      equipped: {
        theme: 'crystal_sanctuary',
        palette: 'gemstone',
        soundPack: 'glass_marimba',
        particleStyle: 'stardust'
      },
      unlockedCosmetics: [
        'crystal_sanctuary',
        'gemstone',
        'glass_marimba',
        'stardust'
      ],
      claimedAchievements: [],
      completedQuests: [],
      journeyProgress: { 1: 0 } // Stage 1 unlocked by default
    };
  }

  public static resetProgress(): GameSaveData {
    const fresh = SaveManager.createDefaultSave();
    SaveManager.save(fresh);
    return fresh;
  }
}
