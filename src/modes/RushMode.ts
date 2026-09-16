// src/modes/RushMode.ts - 120-Second High-Tempo Speed Trial
import { GameScoreUpdate } from '../core/Types.ts';
import { GameMode } from './GameMode.ts';

export class RushMode extends GameMode {
  public timeRemainingSec: number = 120;
  public totalBonusTimeAwarded: number = 0;

  constructor() {
    super('rush', 8);
    this.timeRemainingSec = 120;
  }

  public override init(): void {
    super.init();
    this.timeRemainingSec = 120;
    this.totalBonusTimeAwarded = 0;
  }

  public override update(dt: number): void {
    super.update(dt);
    if (!this.isGameOver && !this.isVictory) {
      this.timeRemainingSec -= dt;
      if (this.timeRemainingSec <= 0) {
        this.timeRemainingSec = 0;
        this.isGameOver = true;
      }
    }
  }

  protected onTurnCompleted(update: GameScoreUpdate): void {
    if (update.linesCleared > 0) {
      // Bonus time reward: 3s per line + extra for high energy
      const bonus = update.linesCleared * 3 + (update.energyLevel >= 4 ? 4 : 0);
      this.timeRemainingSec = Math.min(180, this.timeRemainingSec + bonus);
      this.totalBonusTimeAwarded += bonus;
    }
  }
}
