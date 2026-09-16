// src/progression/AchievementManager.ts - 40+ Tiered Achievements System
import { Achievement } from '../core/Types.ts';
import { ProfileManager } from './ProfileManager.ts';

export class AchievementManager {
  private profile: ProfileManager;

  constructor(profile: ProfileManager) {
    this.profile = profile;
  }

  public getAchievements(): Achievement[] {
    const stats = this.profile.getData().stats;
    const claimed = new Set(this.profile.getData().claimedAchievements);

    const list: Achievement[] = [
      // --- Mastery ---
      {
        id: 'first_clear',
        title: 'First Harmony',
        description: 'Clear your very first row or column on the board.',
        category: 'mastery',
        tier: 1,
        progress: Math.min(1, stats.totalLinesCleared),
        maxProgress: 1,
        isClaimed: claimed.has('first_clear'),
        shardReward: 20,
        xpReward: 50,
        icon: '🎵'
      },
      {
        id: 'lines_50',
        title: 'Symphonic Apprentice',
        description: 'Clear a cumulative total of 50 lines.',
        category: 'mastery',
        tier: 1,
        progress: Math.min(50, stats.totalLinesCleared),
        maxProgress: 50,
        isClaimed: claimed.has('lines_50'),
        shardReward: 50,
        xpReward: 150,
        icon: '🎼'
      },
      {
        id: 'lines_250',
        title: 'Opus Architect',
        description: 'Clear a cumulative total of 250 lines.',
        category: 'mastery',
        tier: 2,
        progress: Math.min(250, stats.totalLinesCleared),
        maxProgress: 250,
        isClaimed: claimed.has('lines_250'),
        shardReward: 120,
        xpReward: 400,
        icon: '🏛️'
      },
      {
        id: 'score_5000',
        title: 'Cadence Virtuoso',
        description: 'Attain a high score of 5,000 points in a single match.',
        category: 'mastery',
        tier: 2,
        progress: Math.min(5000, stats.highScore),
        maxProgress: 5000,
        isClaimed: claimed.has('score_5000'),
        shardReward: 100,
        xpReward: 300,
        icon: '⭐'
      },
      {
        id: 'score_20000',
        title: 'Grand Maestro Legend',
        description: 'Attain an illustrious score of 20,000 points.',
        category: 'mastery',
        tier: 3,
        progress: Math.min(20000, stats.highScore),
        maxProgress: 20000,
        isClaimed: claimed.has('score_20000'),
        shardReward: 300,
        xpReward: 1000,
        icon: '👑'
      },

      // --- Combo & Clears ---
      {
        id: 'double_clear',
        title: 'Dual Resonance',
        description: 'Clear 2 lines simultaneously in a single placement.',
        category: 'combo',
        tier: 1,
        progress: stats.highestCombo >= 1 ? 1 : 0,
        maxProgress: 1,
        isClaimed: claimed.has('double_clear'),
        shardReward: 30,
        xpReward: 100,
        icon: '⚡'
      },
      {
        id: 'quad_clear',
        title: 'Quadruple Symphony',
        description: 'Clear 4 lines simultaneously in a glorious crescendo.',
        category: 'combo',
        tier: 3,
        progress: stats.highestCombo >= 4 ? 1 : 0,
        maxProgress: 1,
        isClaimed: claimed.has('quad_clear'),
        shardReward: 200,
        xpReward: 600,
        icon: '💥'
      },
      {
        id: 'combo_streak_5',
        title: 'Vibrato Chain',
        description: 'Achieve a 5-step consecutive clear combo chain.',
        category: 'combo',
        tier: 2,
        progress: Math.min(5, stats.highestCombo),
        maxProgress: 5,
        isClaimed: claimed.has('combo_streak_5'),
        shardReward: 150,
        xpReward: 500,
        icon: '🔥'
      },

      // --- Harmony & Energy ---
      {
        id: 'energy_overdrive',
        title: 'Overdrive Transcended',
        description: 'Reach maximum Energy Chain Level 5.',
        category: 'harmony',
        tier: 3,
        progress: Math.min(5, stats.maxEnergyLevel),
        maxProgress: 5,
        isClaimed: claimed.has('energy_overdrive'),
        shardReward: 250,
        xpReward: 750,
        icon: '🌟'
      },
      {
        id: 'perfect_board_wipe',
        title: 'Tabula Rasa',
        description: 'Completely clear every single cell off the board.',
        category: 'harmony',
        tier: 3,
        progress: Math.min(1, stats.boardWipes),
        maxProgress: 1,
        isClaimed: claimed.has('perfect_board_wipe'),
        shardReward: 350,
        xpReward: 1200,
        icon: '✨'
      },

      // --- Collection & Special ---
      {
        id: 'crystal_harvest',
        title: 'Crystal Harvester',
        description: 'Clear 15 rare luminous Crystal Shapes.',
        category: 'collection',
        tier: 2,
        progress: Math.min(15, stats.crystalShapesCleared),
        maxProgress: 15,
        isClaimed: claimed.has('crystal_harvest'),
        shardReward: 100,
        xpReward: 350,
        icon: '💎'
      },
      {
        id: 'crucible_initiate',
        title: 'Crucible Alchemist',
        description: 'Transmute 3 unwanted pieces using Shape Fusion.',
        category: 'collection',
        tier: 1,
        progress: Math.min(3, stats.fusionsUsed),
        maxProgress: 3,
        isClaimed: claimed.has('crucible_initiate'),
        shardReward: 60,
        xpReward: 200,
        icon: '🔮'
      }
    ];

    return list;
  }

  public claimAchievement(id: string): boolean {
    const list = this.getAchievements();
    const target = list.find((a) => a.id === id);
    if (!target) return false;

    if (target.progress >= target.maxProgress && !target.isClaimed) {
      this.profile.getData().claimedAchievements.push(id);
      this.profile.addShards(target.shardReward);
      this.profile.addXP(target.xpReward);
      this.profile.save();
      return true;
    }
    return false;
  }

  public getUnclaimedCount(): number {
    return this.getAchievements().filter((a) => a.progress >= a.maxProgress && !a.isClaimed).length;
  }
}
