// src/core/ShapeSpawner.ts - Fair, Intelligent Piece Generation for Satya's Symphony of Shapes
import { Board } from './Board.ts';
import { SHAPE_CATALOG, createCrystalVariant, createHarmonicVariant } from './Shapes.ts';
import { HandSlot, ShapeDefinition } from './Types.ts';

export class ShapeSpawner {
  private rngSeed: number = 0;
  private isSeeded: boolean = false;

  constructor(seed?: number) {
    if (seed !== undefined) {
      this.rngSeed = seed;
      this.isSeeded = true;
    }
  }

  public setSeed(seed: number): void {
    this.rngSeed = seed;
    this.isSeeded = true;
  }

  // Simple LCG pseudo-random generator for seeded daily puzzles
  private random(): number {
    if (!this.isSeeded) {
      return Math.random();
    }
    this.rngSeed = (this.rngSeed * 1664525 + 1013904223) % 4294967296;
    return this.rngSeed / 4294967296;
  }

  public getRandomShape(_board?: Board): ShapeDefinition {
    // Pick based on rarity weighting
    const roll = this.random();
    let candidates: ShapeDefinition[];

    if (roll < 0.65) {
      candidates = SHAPE_CATALOG.filter((s) => s.rarity === 'common');
    } else if (roll < 0.90) {
      candidates = SHAPE_CATALOG.filter((s) => s.rarity === 'uncommon');
    } else {
      candidates = SHAPE_CATALOG.filter((s) => s.rarity === 'rare');
    }

    if (candidates.length === 0) {
      candidates = SHAPE_CATALOG;
    }

    const index = Math.floor(this.random() * candidates.length);
    let base = candidates[index];

    // Chance for special variant
    const variantRoll = this.random();
    if (variantRoll < 0.15) {
      return createCrystalVariant(base);
    } else if (variantRoll < 0.30) {
      return createHarmonicVariant(base);
    }

    return { ...base };
  }

  /**
   * Generates 3 pieces for the player's hand.
   * Guaranteed fairness: At least one shape must be placeable on the given board!
   */
  public generateHand(board: Board): HandSlot[] {
    const hand: HandSlot[] = [];

    for (let i = 0; i < 3; i++) {
      let shape = this.getRandomShape(board);
      hand.push({
        id: `hand_${Date.now()}_${i}_${Math.floor(Math.random() * 10000)}`,
        shape,
        slotIndex: i,
        isUsed: false
      });
    }

    // Streak protection: check if at least one shape can fit on the board
    const hasAnyFit = hand.some((slot) => slot.shape && board.canFitAnywhere(slot.shape));

    if (!hasAnyFit) {
      // Find a shape from catalog that fits and replace slot 0
      const fittingShapes = SHAPE_CATALOG.filter((s) => board.canFitAnywhere(s));
      if (fittingShapes.length > 0) {
        const selected = fittingShapes[Math.floor(this.random() * fittingShapes.length)];
        hand[0].shape = { ...selected };
      }
    }

    return hand;
  }
}
