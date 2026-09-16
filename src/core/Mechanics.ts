// src/core/Mechanics.ts - Original Gameplay Systems for Satya's Symphony of Shapes
import { GameScoreUpdate, ShapeDefinition } from './Types.ts';

export class MechanicsEngine {
  // Energy Chain System
  public energyLevel: number = 1; // 1 to 5
  public consecutiveClears: number = 0;
  public maxEnergyAchieved: number = 1;

  // Combo Burst System
  public currentCombo: number = 0;
  public highestCombo: number = 0;

  // Harmony Meter System (0 - 100)
  public harmony: number = 50; // Starts balanced at 50%
  public harmonicResonanceTurns: number = 0; // Turns remaining in Harmonic Resonance

  // Crucible / Shape Fusion System (0 - 100)
  public crucibleEnergy: number = 0;
  public totalFusionsUsed: number = 0;

  // Multiplier mapping for Energy Levels
  private readonly energyMultipliers: Record<number, number> = {
    1: 1.0,
    2: 1.5,
    3: 2.0,
    4: 3.0,
    5: 5.0
  };

  public reset(): void {
    this.energyLevel = 1;
    this.consecutiveClears = 0;
    this.currentCombo = 0;
    this.harmony = 50;
    this.harmonicResonanceTurns = 0;
    this.crucibleEnergy = 0;
  }

  /**
   * Process a placed shape and any cleared lines to compute score, multipliers, and system updates.
   */
  public evaluateTurn(
    _shape: ShapeDefinition,
    clearedRows: number[],
    clearedCols: number[],
    totalPlacedCells: number,
    isHandFinish: boolean,
    isBoardWipe: boolean,
    crystalsCleared: number
  ): GameScoreUpdate {
    const linesCleared = clearedRows.length + clearedCols.length;
    const isCrossClear = clearedRows.length > 0 && clearedCols.length > 0;

    // 1. Evaluate Energy Chain
    if (linesCleared > 0) {
      this.consecutiveClears++;
      if (this.consecutiveClears >= 4) this.energyLevel = 5;
      else if (this.consecutiveClears === 3) this.energyLevel = 4;
      else if (this.consecutiveClears === 2) this.energyLevel = 3;
      else this.energyLevel = 2;

      this.currentCombo++;
      if (this.currentCombo > this.highestCombo) {
        this.highestCombo = this.currentCombo;
      }
    } else {
      // Soft decay rather than instant drop
      this.consecutiveClears = 0;
      if (this.energyLevel > 1) {
        this.energyLevel--;
      }
      this.currentCombo = 0;
    }

    if (this.energyLevel > this.maxEnergyAchieved) {
      this.maxEnergyAchieved = this.energyLevel;
    }

    // 2. Evaluate Harmony Meter
    if (linesCleared > 0) {
      const harmonyGain = 10 + linesCleared * 5 + (isCrossClear ? 10 : 0);
      this.harmony = Math.min(100, this.harmony + harmonyGain);
    } else {
      // Small reduction for non-clearing moves
      this.harmony = Math.max(0, this.harmony - 4);
    }

    if (this.harmony >= 100 && this.harmonicResonanceTurns === 0) {
      this.harmonicResonanceTurns = 3; // Activate Harmonic Resonance!
    } else if (this.harmonicResonanceTurns > 0) {
      this.harmonicResonanceTurns--;
      if (this.harmonicResonanceTurns === 0 && this.harmony >= 100) {
        this.harmony = 80; // Soft reset from peak
      }
    }

    // 3. Evaluate Crucible / Shape Fusion Energy
    if (linesCleared > 0) {
      const chargeGain = linesCleared * 25;
      this.crucibleEnergy = Math.min(100, this.crucibleEnergy + chargeGain);
    }

    // 4. Calculate Scores
    const baseCellPoints = totalPlacedCells * 10;
    let lineClearPoints = 0;

    if (linesCleared > 0) {
      // Quadratic scaling for simultaneous lines: 1->100, 2->300, 3->600, 4->1000, 5->1500
      lineClearPoints = (linesCleared * (linesCleared + 1) / 2) * 100;
    }

    // Multipliers
    const energyMult = this.energyMultipliers[this.energyLevel] || 1.0;
    const harmonyMult = this.harmonicResonanceTurns > 0 ? 1.5 : (1.0 + (this.harmony / 200)); // up to 1.5x

    // Bonus Points
    let bonusPoints = 0;
    if (isCrossClear) bonusPoints += 300; // Cross-clear precision
    if (isHandFinish && linesCleared > 0) bonusPoints += 200; // Hand finish
    if (isBoardWipe) bonusPoints += 1500; // Perfect board wipe

    const rawTotal = (baseCellPoints + lineClearPoints) * energyMult * harmonyMult + bonusPoints;
    const finalPoints = Math.round(rawTotal);

    // Shards & XP rewards
    let shardsEarned = crystalsCleared * 3;
    if (isBoardWipe) shardsEarned += 10;
    if (isCrossClear) shardsEarned += 2;
    if (this.harmonicResonanceTurns > 0 && linesCleared > 0) shardsEarned += 1;

    let xpEarned = Math.round(finalPoints / 10) + linesCleared * 15 + crystalsCleared * 25;

    return {
      pointsEarned: finalPoints,
      linesCleared,
      comboCount: this.currentCombo,
      energyLevel: this.energyLevel,
      harmonyPercent: this.harmony,
      isCrossClear,
      isBoardWipe,
      isHandClear: isHandFinish && linesCleared > 0,
      shardsEarned,
      xpEarned
    };
  }

  public canUseCrucible(): boolean {
    return this.crucibleEnergy >= 100;
  }

  public consumeCrucible(): void {
    if (this.crucibleEnergy >= 100) {
      this.crucibleEnergy = 0;
      this.totalFusionsUsed++;
    }
  }

  public getEnergyMultiplier(): number {
    return this.energyMultipliers[this.energyLevel] || 1.0;
  }

  public isHarmonicResonanceActive(): boolean {
    return this.harmonicResonanceTurns > 0;
  }
}
