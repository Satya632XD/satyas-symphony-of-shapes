// src/progression/LeaderboardManager.ts - Simulated Active Leaderboards
import { LeaderboardEntry } from '../core/Types.ts';
import { ProfileManager } from './ProfileManager.ts';

const MOCK_LEADERS: Array<{ name: string; avatar: string; score: number; title: string }> = [
  { name: 'SymphonyGod', avatar: '👑', score: 48920, title: 'Grand Maestro' },
  { name: 'Aria_V', avatar: '🌸', score: 42100, title: 'Symphony Master' },
  { name: 'ChronoCadence', avatar: '⚡', score: 36850, title: 'Symphony Master' },
  { name: 'CrystalEcho', avatar: '💎', score: 29400, title: 'Harmonic Composer' },
  { name: 'ZenMasterKen', avatar: '🧘', score: 24750, title: 'Harmonic Composer' },
  { name: 'NovaPulse', avatar: '✨', score: 21300, title: 'Crystal Virtuoso' },
  { name: 'PrismKnight', avatar: '🛡️', score: 18900, title: 'Crystal Virtuoso' },
  { name: 'Lumina', avatar: '🌙', score: 14200, title: 'Resonance Scholar' },
  { name: 'VibeCheck', avatar: '🎵', score: 9800, title: 'Cadence Apprentice' },
  { name: 'HarmonicBeats', avatar: '🎧', score: 6200, title: 'Novice Harmonizer' }
];

export class LeaderboardManager {
  private profile: ProfileManager;

  constructor(profile: ProfileManager) {
    this.profile = profile;
  }

  public getLeaderboard(type: 'global' | 'regional' | 'friends'): LeaderboardEntry[] {
    const data = this.profile.getData();
    const playerEntry: LeaderboardEntry = {
      rank: 1,
      name: 'You (Satya)',
      avatar: '🌟',
      score: data.stats.highScore,
      title: data.harmonyRank,
      isPlayer: true
    };

    let baseList = [...MOCK_LEADERS];
    if (type === 'regional') {
      baseList = baseList.slice(2, 8);
    } else if (type === 'friends') {
      baseList = baseList.slice(4, 9);
    }

    const combined = [...baseList, playerEntry].sort((a, b) => b.score - a.score);

    return combined.map((item, index) => ({
      ...item,
      rank: index + 1
    }));
  }
}
