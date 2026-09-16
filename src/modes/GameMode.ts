// src/modes/GameMode.ts - Base Game Mode Controller
import { Board } from '../core/Board.ts';
import { MechanicsEngine } from '../core/Mechanics.ts';
import { ShapeSpawner } from '../core/ShapeSpawner.ts';
import { GameModeType, GameScoreUpdate, HandSlot, ShapeDefinition } from '../core/Types.ts';

export interface GameModeState {
  mode: GameModeType;
  score: number;
  moves: number;
  timeElapsedSec: number;
  isGameOver: boolean;
  isVictory: boolean;
  hand: HandSlot[];
}

export abstract class GameMode {
  public type: GameModeType;
  public board: Board;
  public mechanics: MechanicsEngine;
  public spawner: ShapeSpawner;

  public score: number = 0;
  public moves: number = 0;
  public timeElapsedSec: number = 0;
  public isGameOver: boolean = false;
  public isVictory: boolean = false;
  public hand: HandSlot[] = [];

  constructor(type: GameModeType, boardSize: number = 8) {
    this.type = type;
    this.board = new Board(boardSize);
    this.mechanics = new MechanicsEngine();
    this.spawner = new ShapeSpawner();
  }

  public init(): void {
    this.board.reset();
    this.mechanics.reset();
    this.score = 0;
    this.moves = 0;
    this.timeElapsedSec = 0;
    this.isGameOver = false;
    this.isVictory = false;
    this.refillHand();
  }

  public update(dt: number): void {
    if (!this.isGameOver && !this.isVictory) {
      this.timeElapsedSec += dt;
    }
  }

  public refillHand(): void {
    this.hand = this.spawner.generateHand(this.board);
  }

  public canAnyHandShapeFit(): boolean {
    return this.hand.some((slot) => !slot.isUsed && slot.shape && this.board.canFitAnywhere(slot.shape));
  }

  public isHandEmpty(): boolean {
    return this.hand.every((slot) => slot.isUsed || !slot.shape);
  }

  /**
   * Place a shape from hand at (row, col)
   */
  public makeMove(
    slotIndex: number,
    startRow: number,
    startCol: number
  ): {
    success: boolean;
    placedShape?: ShapeDefinition;
    scoreUpdate?: GameScoreUpdate;
    clearedRows?: number[];
    clearedCols?: number[];
  } {
    const slot = this.hand[slotIndex];
    if (!slot || slot.isUsed || !slot.shape) {
      return { success: false };
    }

    if (!this.board.canPlace(slot.shape, startRow, startCol)) {
      return { success: false };
    }

    const shape = slot.shape;
    const { placedCoords } = this.board.placeShape(shape, startRow, startCol);
    slot.isUsed = true;
    this.moves++;

    // Check completed lines
    const { rows, cols } = this.board.getCompletedLines();
    const isHandFinish = this.isHandEmpty();
    const isBoardWipe = this.board.isBoardCompletelyEmpty();

    // Clear completed lines
    const clearResult = this.board.clearLines(rows, cols);

    // Compute scores & mechanics
    const scoreUpdate = this.mechanics.evaluateTurn(
      shape,
      rows,
      cols,
      placedCoords.length,
      isHandFinish,
      isBoardWipe,
      clearResult.crystalCount
    );

    this.score += scoreUpdate.pointsEarned;

    // Post-turn hook for mode-specific conditions
    this.onTurnCompleted(scoreUpdate);

    // Refill hand if all 3 placed
    if (this.isHandEmpty()) {
      this.refillHand();
    }

    // Check Game Over condition
    if (!this.canAnyHandShapeFit()) {
      this.handleNoMovesLeft();
    }

    return {
      success: true,
      placedShape: shape,
      scoreUpdate,
      clearedRows: rows,
      clearedCols: cols
    };
  }

  protected abstract onTurnCompleted(update: GameScoreUpdate): void;

  protected handleNoMovesLeft(): void {
    this.isGameOver = true;
  }
}
