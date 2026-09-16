// src/progression/QuestManager.ts - Daily and Weekly Challenge Objectives
import { Quest } from '../core/Types.ts';
import { ProfileManager } from './ProfileManager.ts';

export class QuestManager {
  private profile: ProfileManager;

  constructor(profile: ProfileManager) {
    this.profile = profile;
  }

  public getQuests(): Quest[] {
    const stats = this.profile.getData().stats;
    const completed = new Set(this.profile.getData().completedQuests);

    return [
      {
        id: 'daily_lines_15',
        title: 'Daily Cadence',
        description: 'Clear 15 lines today in any game mode.',
        type: 'daily',
        progress: Math.min(15, stats.totalLinesCleared % 30),
        goal: 15,
        isCompleted: (stats.totalLinesCleared % 30) >= 15,
        isClaimed: completed.has('daily_lines_15'),
        rewardShards: 35,
        rewardXP: 100,
        icon: '☀️'
      },
      {
        id: 'daily_score_2000',
        title: 'Score Seeker',
        description: 'Score at least 2,000 points in a single match.',
        type: 'daily',
        progress: Math.min(2000, stats.highScore),
        goal: 2000,
        isCompleted: stats.highScore >= 2000,
        isClaimed: completed.has('daily_score_2000'),
        rewardShards: 40,
        rewardXP: 120,
        icon: '🎯'
      },
      {
        id: 'daily_energy_3',
        title: 'Energy Conductor',
        description: 'Attain Energy Chain Level 3.',
        type: 'daily',
        progress: Math.min(3, stats.maxEnergyLevel),
        goal: 3,
        isCompleted: stats.maxEnergyLevel >= 3,
        isClaimed: completed.has('daily_energy_3'),
        rewardShards: 50,
        rewardXP: 150,
        icon: '⚡'
      },
      {
        id: 'weekly_combos_10',
        title: 'Weekly Maestro Symphony',
        description: 'Achieve 10 multi-line or chain combos this week.',
        type: 'weekly',
        progress: Math.min(10, stats.highestCombo * 2),
        goal: 10,
        isCompleted: stats.highestCombo * 2 >= 10,
        isClaimed: completed.has('weekly_combos_10'),
        rewardShards: 120,
        rewardXP: 400,
        icon: '🏆'
      }
    ];
  }

  public claimQuest(id: string): boolean {
    const quests = this.getQuests();
    const q = quests.find((item) => item.id === id);
    if (!q) return false;

    if (q.isCompleted && !q.isClaimed) {
      this.profile.getData().completedQuests.push(id);
      this.profile.addShards(q.rewardShards);
      this.profile.addXP(q.rewardXP);
      this.profile.save();
      return true;
    }
    return false;
  }
}
