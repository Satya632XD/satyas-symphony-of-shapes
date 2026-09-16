// src/core/Types.ts - Type Definitions for Satya's Symphony of Shapes

export type CellState = {
  filled: boolean;
  color: string;
  secondaryColor?: string;
  isCrystal?: boolean;
  isHarmonic?: boolean;
  clearAnimation?: number; // 0 to 1 for dissolving
  shimmerOffset?: number;
  shapeId?: string;
};

export type BoardMatrix = CellState[][];

export interface ShapeDefinition {
  id: string;
  name: string;
  matrix: number[][]; // 1s and 0s
  baseColor: string;
  secondaryColor: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'crystal' | 'harmonic';
  isCrystal?: boolean;
  isHarmonic?: boolean;
  description?: string;
}

export interface HandSlot {
  shape: ShapeDefinition | null;
  slotIndex: number;
  isUsed: boolean;
  id: string;
}

export type GameModeType = 'classic' | 'journey' | 'zen' | 'rush' | 'daily';

export interface GameScoreUpdate {
  pointsEarned: number;
  linesCleared: number;
  comboCount: number;
  energyLevel: number;
  harmonyPercent: number;
  isCrossClear: boolean;
  isBoardWipe: boolean;
  isHandClear: boolean;
  shardsEarned: number;
  xpEarned: number;
}

export interface PlayerStats {
  gamesPlayed: number;
  highScore: number;
  totalScore: number;
  totalLinesCleared: number;
  highestCombo: number;
  maxEnergyLevel: number;
  crystalShapesCleared: number;
  perfectPlacements: number;
  boardWipes: number;
  totalTimePlayedSec: number;
  fusionsUsed: number;
  stagesCompleted: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'mastery' | 'harmony' | 'combo' | 'collection' | 'endurance';
  tier: 1 | 2 | 3;
  progress: number;
  maxProgress: number;
  isClaimed: boolean;
  shardReward: number;
  xpReward: number;
  icon: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly';
  progress: number;
  goal: number;
  isCompleted: boolean;
  isClaimed: boolean;
  rewardShards: number;
  rewardXP: number;
  icon: string;
}

export interface JourneyStage {
  stageNumber: number;
  title: string;
  subtitle: string;
  targetScore: number;
  targetLines: number;
  maxMoves?: number;
  specialCondition?: 'no_waste' | 'reach_energy_3' | 'crystal_clears' | 'combo_3' | 'crucible_fusion';
  conditionGoal?: number;
  conditionDescription?: string;
  starsEarned: number; // 0 to 3
  isUnlocked: boolean;
  shardReward: number;
}

export type ThemeId = 'crystal_sanctuary' | 'celestial_symphony' | 'energy_temple' | 'harmonic_cyber' | 'velvet_twilight';
export type PaletteId = 'gemstone' | 'pastel_sonata' | 'solar_flare' | 'prismatic_neon' | 'mystic_amethyst';
export type SoundPackId = 'glass_marimba' | 'grand_piano' | 'ambient_synth' | 'zen_kalimba';
export type ParticleStyleId = 'stardust' | 'crystal_spark' | 'sonic_ring' | 'golden_flare';

export interface CosmeticItem {
  id: string;
  name: string;
  type: 'theme' | 'palette' | 'sound' | 'particles';
  costShards: number;
  isUnlocked: boolean;
  previewColor: string;
  description: string;
}

export interface SettingsState {
  masterVolume: number; // 0 to 1
  sfxVolume: number;
  bgmVolume: number;
  screenShake: boolean;
  reducedMotion: boolean;
  colorblindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'high_contrast';
  touchOffset: number; // Pixels above finger for dragging on mobile
  particlesQuality: 'high' | 'medium' | 'low';
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  score: number;
  title: string;
  isPlayer?: boolean;
}
