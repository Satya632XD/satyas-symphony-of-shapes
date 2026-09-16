// src/modes/ZenMode.ts - Meditative Endless Sanctuary Mode
import { GameScoreUpdate } from '../core/Types.ts';
import { GameMode } from './GameMode.ts';

export class ZenMode extends GameMode {
  public reliefWavesTriggered: number = 0;

  constructor() {
    super('zen', 8);
  }

  protected onTurnCompleted(_update: GameScoreUpdate): void {
    // In Zen mode, the game never abruptly ends.
  }

  protected override handleNoMovesLeft(): void {
    // Instead of Game Over, trigger harmonic relief wave!
    this.board.zenReliefWave();
    this.reliefWavesTriggered++;

    // If still no moves, wipe the board gently
    if (!this.canAnyHandShapeFit()) {
      this.board.reset();
    }

    this.refillHand();
  }
}
