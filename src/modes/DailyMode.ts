// src/modes/DailyMode.ts - Date-Seeded Global Daily Challenge
import { GameScoreUpdate } from '../core/Types.ts';
import { GameMode } from './GameMode.ts';

export class DailyMode extends GameMode {
  public dailySeed: number;
  public targetDailyScore: number = 5000;

  constructor() {
    super('daily', 8);
    const today = new Date();
    const dateStr = `${today.getFullYear()}${today.getMonth() + 1}${today.getDate()}`;
    this.dailySeed = parseInt(dateStr, 10);
    this.spawner.setSeed(this.dailySeed);
  }

  public override init(): void {
    const today = new Date();
    const dateStr = `${today.getFullYear()}${today.getMonth() + 1}${today.getDate()}`;
    this.dailySeed = parseInt(dateStr, 10);
    this.spawner.setSeed(this.dailySeed);
    super.init();
  }

  protected onTurnCompleted(_update: GameScoreUpdate): void {
    if (this.score >= this.targetDailyScore) {
      this.isVictory = true;
    }
  }
}
