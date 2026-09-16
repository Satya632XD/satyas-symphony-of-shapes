// src/modes/JourneyMode.ts - Handcrafted Campaign Stages with Objectives
import { GameScoreUpdate, JourneyStage } from '../core/Types.ts';
import { GameMode } from './GameMode.ts';

export const JOURNEY_STAGES: JourneyStage[] = [
  {
    stageNumber: 1,
    title: 'Awakening of Sound',
    subtitle: 'Learn the harmony of basic lines',
    targetScore: 600,
    targetLines: 4,
    maxMoves: 25,
    starsEarned: 0,
    isUnlocked: true,
    shardReward: 30
  },
  {
    stageNumber: 2,
    title: 'Dual Cadence',
    subtitle: 'Perform simultaneous double line clears',
    targetScore: 1200,
    targetLines: 8,
    specialCondition: 'combo_3',
    conditionGoal: 1,
    conditionDescription: 'Perform at least 1 multi-clear',
    maxMoves: 30,
    starsEarned: 0,
    isUnlocked: false,
    shardReward: 40
  },
  {
    stageNumber: 3,
    title: 'Crystal Resonance',
    subtitle: 'Harvest luminous crystal shapes',
    targetScore: 1800,
    targetLines: 10,
    specialCondition: 'crystal_clears',
    conditionGoal: 2,
    conditionDescription: 'Clear 2 Crystal Shapes',
    maxMoves: 35,
    starsEarned: 0,
    isUnlocked: false,
    shardReward: 50
  },
  {
    stageNumber: 4,
    title: 'Flow of Energy',
    subtitle: 'Maintain consecutive clears to build momentum',
    targetScore: 2500,
    targetLines: 12,
    specialCondition: 'reach_energy_3',
    conditionGoal: 3,
    conditionDescription: 'Reach Energy Level 3',
    maxMoves: 35,
    starsEarned: 0,
    isUnlocked: false,
    shardReward: 60
  },
  {
    stageNumber: 5,
    title: 'The Crucible Chamber',
    subtitle: 'Charge and activate Shape Fusion',
    targetScore: 3200,
    targetLines: 14,
    specialCondition: 'crucible_fusion',
    conditionGoal: 1,
    conditionDescription: 'Charge and activate Crucible Fusion',
    maxMoves: 40,
    starsEarned: 0,
    isUnlocked: false,
    shardReward: 80
  },
  {
    stageNumber: 6,
    title: 'Prismatic Sonata',
    subtitle: 'Strategic line planning in limited turns',
    targetScore: 4000,
    targetLines: 16,
    maxMoves: 38,
    starsEarned: 0,
    isUnlocked: false,
    shardReward: 90
  },
  {
    stageNumber: 7,
    title: 'Harmonic Equilibrium',
    subtitle: 'Keep board clear and rhythm high',
    targetScore: 5000,
    targetLines: 18,
    maxMoves: 42,
    starsEarned: 0,
    isUnlocked: false,
    shardReward: 100
  },
  {
    stageNumber: 8,
    title: 'Temple of the Sun',
    subtitle: 'Harness high energy clears',
    targetScore: 6000,
    targetLines: 20,
    specialCondition: 'reach_energy_3',
    conditionGoal: 4,
    conditionDescription: 'Reach Energy Level 4',
    maxMoves: 45,
    starsEarned: 0,
    isUnlocked: false,
    shardReward: 120
  },
  {
    stageNumber: 9,
    title: 'Celestial Convergence',
    subtitle: 'Chain combos across rows and columns',
    targetScore: 7500,
    targetLines: 22,
    maxMoves: 48,
    starsEarned: 0,
    isUnlocked: false,
    shardReward: 150
  },
  {
    stageNumber: 10,
    title: 'Grand Symphony of Shapes',
    subtitle: 'The ultimate maestro trial',
    targetScore: 10000,
    targetLines: 26,
    maxMoves: 55,
    starsEarned: 0,
    isUnlocked: false,
    shardReward: 250
  }
];

export class JourneyMode extends GameMode {
  public currentStage: JourneyStage;
  public totalLinesClearedInStage: number = 0;
  public crystalClearedInStage: number = 0;
  public crucibleUsedInStage: number = 0;

  constructor(stageNumber: number = 1) {
    super('journey', 8);
    const stage = JOURNEY_STAGES.find((s) => s.stageNumber === stageNumber) || JOURNEY_STAGES[0];
    this.currentStage = { ...stage };
  }

  public setStage(stageNumber: number): void {
    const stage = JOURNEY_STAGES.find((s) => s.stageNumber === stageNumber) || JOURNEY_STAGES[0];
    this.currentStage = { ...stage };
    this.init();
    this.totalLinesClearedInStage = 0;
    this.crystalClearedInStage = 0;
    this.crucibleUsedInStage = 0;
  }

  protected onTurnCompleted(update: GameScoreUpdate): void {
    this.totalLinesClearedInStage += update.linesCleared;
    if (update.shardsEarned > 0) {
      this.crystalClearedInStage += 1;
    }

    // Check Victory conditions
    const metScore = this.score >= this.currentStage.targetScore;
    const metLines = this.totalLinesClearedInStage >= this.currentStage.targetLines;
    let metSpecial = true;

    if (this.currentStage.specialCondition === 'reach_energy_3') {
      metSpecial = this.mechanics.energyLevel >= (this.currentStage.conditionGoal || 3);
    } else if (this.currentStage.specialCondition === 'crystal_clears') {
      metSpecial = this.crystalClearedInStage >= (this.currentStage.conditionGoal || 2);
    } else if (this.currentStage.specialCondition === 'combo_3') {
      metSpecial = update.comboCount >= (this.currentStage.conditionGoal || 1);
    } else if (this.currentStage.specialCondition === 'crucible_fusion') {
      metSpecial = this.crucibleUsedInStage >= (this.currentStage.conditionGoal || 1);
    }

    if (metScore && metLines && metSpecial) {
      this.isVictory = true;
    }

    // Check move limit failure
    if (this.currentStage.maxMoves && this.moves >= this.currentStage.maxMoves && !this.isVictory) {
      this.isGameOver = true;
    }
  }

  public calculateStars(): number {
    if (!this.isVictory) return 0;
    let stars = 1;
    // 2 stars for exceeding target score by 25%
    if (this.score >= this.currentStage.targetScore * 1.25) stars = 2;
    // 3 stars for beating with moves to spare
    if (this.currentStage.maxMoves && this.moves <= this.currentStage.maxMoves * 0.75) {
      stars = 3;
    }
    return stars;
  }
}
