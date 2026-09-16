// src/modes/ClassicMode.ts - Infinite High-Score Strategy Mode
import { GameScoreUpdate } from '../core/Types.ts';
import { GameMode } from './GameMode.ts';

export class ClassicMode extends GameMode {
  constructor() {
    super('classic', 8);
  }

  protected onTurnCompleted(_update: GameScoreUpdate): void {
    // Classic mode is pure high-score chase.
    // Difficulty subtly scales by spawner weights as moves advance.
  }
}
