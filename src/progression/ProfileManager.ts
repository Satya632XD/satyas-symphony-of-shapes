// src/progression/ProfileManager.ts - Player Profile, Levels, and Lifetime Statistics
import { GameSaveData, SaveManager } from './SaveManager.ts';
import { GameScoreUpdate } from '../core/Types.ts';

export const HARMONY_RANKS = [
  { level: 1, title: 'Novice Harmonizer' },
  { level: 5, title: 'Cadence Apprentice' },
  { level: 10, title: 'Resonance Scholar' },
  { level: 15, title: 'Crystal Virtuoso' },
  { level: 20, title: 'Harmonic Composer' },
  { level: 30, title: 'Symphony Master' },
  { level: 50, title: 'Grand Maestro of Shapes' }
];

export class ProfileManager {
  private data: GameSaveData;

  constructor() {
    this.data = SaveManager.load();
    this.updateRank();
  }

  public getData(): GameSaveData {
    return this.data;
  }

  public getXPForNextLevel(level: number): number {
    return Math.floor(100 * Math.pow(1.18, level - 1));
  }

  public addXP(amount: number): { leveledUp: boolean; oldLevel: number; newLevel: number } {
    this.data.playerXP += amount;
    const oldLevel = this.data.playerLevel;

    while (this.data.playerXP >= this.getXPForNextLevel(this.data.playerLevel)) {
      this.data.playerXP -= this.getXPForNextLevel(this.data.playerLevel);
      this.data.playerLevel++;
      // Level up reward: Shards!
      this.data.shards += 25 * this.data.playerLevel;
    }

    const leveledUp = this.data.playerLevel > oldLevel;
    if (leveledUp) {
      this.updateRank();
    }

    this.save();
    return { leveledUp, oldLevel, newLevel: this.data.playerLevel };
  }

  public addShards(amount: number): void {
    this.data.shards += amount;
    this.save();
  }

  public spendShards(amount: number): boolean {
    if (this.data.shards >= amount) {
      this.data.shards -= amount;
      this.save();
      return true;
    }
    return false;
  }

  public recordGameResult(score: number, modeTimeSec: number): void {
    const stats = this.data.stats;
    stats.gamesPlayed++;
    stats.totalScore += score;
    stats.totalTimePlayedSec += modeTimeSec;

    if (score > stats.highScore) {
      stats.highScore = score;
    }

    this.save();
  }

  public recordTurnUpdate(update: GameScoreUpdate): void {
    const stats = this.data.stats;
    stats.totalLinesCleared += update.linesCleared;

    if (update.comboCount > stats.highestCombo) {
      stats.highestCombo = update.comboCount;
    }

    if (update.energyLevel > stats.maxEnergyLevel) {
      stats.maxEnergyLevel = update.energyLevel;
    }

    if (update.isCrossClear || update.isHandClear) {
      stats.perfectPlacements++;
    }

    if (update.isBoardWipe) {
      stats.boardWipes++;
    }

    this.addXP(update.xpEarned);
    if (update.shardsEarned > 0) {
      this.addShards(update.shardsEarned);
    }
  }

  private updateRank(): void {
    let currentTitle = HARMONY_RANKS[0].title;
    for (const rank of HARMONY_RANKS) {
      if (this.data.playerLevel >= rank.level) {
        currentTitle = rank.title;
      }
    }
    this.data.harmonyRank = currentTitle;
  }

  public save(): void {
    SaveManager.save(this.data);
  }
}
