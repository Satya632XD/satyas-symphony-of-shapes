// src/ui/UIManager.ts - UI Overlay, Modals, and Interactive Panels
import { GameMode } from '../modes/GameMode.ts';
import { JourneyMode } from '../modes/JourneyMode.ts';
import { RushMode } from '../modes/RushMode.ts';
import { ProfileManager } from '../progression/ProfileManager.ts';
import { AchievementManager } from '../progression/AchievementManager.ts';
import { QuestManager } from '../progression/QuestManager.ts';
import { CosmeticsManager } from '../progression/CosmeticsManager.ts';
import { LeaderboardManager } from '../progression/LeaderboardManager.ts';
import { AccessibilityManager } from './Accessibility.ts';
import { AudioEngine } from '../audio/AudioEngine.ts';
import { CanvasRenderer } from '../render/CanvasRenderer.ts';
import { JOURNEY_STAGES } from '../modes/JourneyMode.ts';
import { GameModeType } from '../core/Types.ts';

export interface UICallbacks {
  onSwitchMode: (modeType: GameModeType, stageNumber?: number) => void;
  onRestartMode: () => void;
  onCrucibleTriggered: () => void;
}

export class UIManager {
  private profile: ProfileManager;
  private achievements: AchievementManager;
  private quests: QuestManager;
  private cosmetics: CosmeticsManager;
  private leaderboards: LeaderboardManager;
  private accessibility: AccessibilityManager;
  private audio: AudioEngine;
  private renderer: CanvasRenderer;
  private callbacks: UICallbacks;

  private currentShopTab: 'theme' | 'sound' | 'particles' = 'theme';
  private currentLbTab: 'global' | 'regional' | 'friends' = 'global';

  constructor(
    profile: ProfileManager,
    achievements: AchievementManager,
    quests: QuestManager,
    cosmetics: CosmeticsManager,
    leaderboards: LeaderboardManager,
    accessibility: AccessibilityManager,
    audio: AudioEngine,
    renderer: CanvasRenderer,
    callbacks: UICallbacks
  ) {
    this.profile = profile;
    this.achievements = achievements;
    this.quests = quests;
    this.cosmetics = cosmetics;
    this.leaderboards = leaderboards;
    this.accessibility = accessibility;
    this.audio = audio;
    this.renderer = renderer;
    this.callbacks = callbacks;

    this.bindHUDButtons();
    this.bindSettings();
  }

  public updateHUD(mode: GameMode): void {
    // 1. Score
    const scoreElem = document.getElementById('hud-score');
    if (scoreElem) scoreElem.textContent = mode.score.toLocaleString();

    // 2. Secondary Value (Best score or Rush timer)
    const secLabel = document.getElementById('hud-secondary-label');
    const secValue = document.getElementById('hud-secondary-value');

    if (mode.type === 'rush') {
      if (secLabel) secLabel.textContent = 'Time';
      if (secValue) {
        const remaining = Math.max(0, Math.ceil((mode as RushMode).timeRemainingSec));
        secValue.textContent = `${remaining}s`;
        secValue.style.color = remaining <= 10 ? '#ef4444' : '#ffffff';
      }
    } else {
      if (secLabel) secLabel.textContent = 'Best';
      if (secValue) {
        secValue.textContent = this.profile.getData().stats.highScore.toLocaleString();
        secValue.style.color = '#ffffff';
      }
    }

    // 3. Energy Chain Badge
    const energyBadge = document.getElementById('hud-energy-badge');
    const energyText = document.getElementById('hud-energy-text');
    const energyLvl = mode.mechanics.energyLevel;

    if (energyText) {
      if (energyLvl >= 5) {
        energyText.textContent = '⚡ OVERDRIVE Lv.5 ⚡';
      } else {
        energyText.textContent = `Energy Lv.${energyLvl} (${mode.mechanics.getEnergyMultiplier()}x)`;
      }
    }

    if (energyBadge) {
      if (energyLvl >= 5) {
        energyBadge.classList.add('level-overdrive');
      } else {
        energyBadge.classList.remove('level-overdrive');
      }
    }

    // 4. Harmony Meter
    const harmonyFill = document.getElementById('hud-harmony-fill');
    const harmonyLabel = document.getElementById('hud-harmony-label');
    const harmonyVal = Math.round(mode.mechanics.harmony);

    if (harmonyFill) harmonyFill.style.width = `${harmonyVal}%`;
    if (harmonyLabel) {
      if (mode.mechanics.isHarmonicResonanceActive()) {
        harmonyLabel.textContent = `RESONANCE (${mode.mechanics.harmonicResonanceTurns} left!)`;
        harmonyLabel.style.color = '#facc15';
      } else {
        harmonyLabel.textContent = `Harmony ${harmonyVal}%`;
        harmonyLabel.style.color = '#c084fc';
      }
    }

    // 5. Crucible Button
    const crucibleBtn = document.getElementById('btn-crucible');
    if (crucibleBtn) {
      const isReady = mode.mechanics.canUseCrucible();
      if (isReady) {
        crucibleBtn.classList.add('ready');
      } else {
        crucibleBtn.classList.remove('ready');
      }
    }

    // 6. Active Mode Label
    const modeLabel = document.getElementById('label-active-mode');
    if (modeLabel) {
      const names: Record<string, string> = {
        classic: 'Classic',
        journey: `Stage ${(mode as JourneyMode).currentStage?.stageNumber || 1}`,
        zen: 'Zen',
        rush: 'Rush',
        daily: 'Daily'
      };
      modeLabel.textContent = names[mode.type] || 'Classic';
    }
  }

  public showGameOver(mode: GameMode, victory: boolean): void {
    const modal = document.getElementById('modal-gameover');
    if (!modal) return;

    const title = document.getElementById('gameover-title');
    const scoreElem = document.getElementById('gameover-final-score');
    const starsElem = document.getElementById('gameover-stars');
    const shardsElem = document.getElementById('gameover-shards');
    const xpElem = document.getElementById('gameover-xp');

    if (title) {
      title.textContent = victory ? 'Stage Completed!' : 'Symphony Concluded';
    }

    if (scoreElem) {
      scoreElem.textContent = mode.score.toLocaleString();
    }

    if (starsElem) {
      if (mode.type === 'journey') {
        const stars = (mode as JourneyMode).calculateStars();
        starsElem.textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
        starsElem.style.display = 'block';
      } else {
        starsElem.style.display = 'none';
      }
    }

    const earnedShards = Math.floor(mode.score / 500) + (victory ? 30 : 5);
    const earnedXP = Math.floor(mode.score / 80) + (victory ? 100 : 20);

    if (shardsElem) shardsElem.textContent = `+${earnedShards}`;
    if (xpElem) xpElem.textContent = `+${earnedXP}`;

    this.profile.addShards(earnedShards);
    this.profile.addXP(earnedXP);

    modal.classList.add('active');
  }

  private bindHUDButtons(): void {
    // Crucible Button
    document.getElementById('btn-crucible')?.addEventListener('click', () => {
      this.audio.playUI('click');
      this.callbacks.onCrucibleTriggered();
    });

    // Mode Selector Modal
    document.getElementById('btn-open-modes')?.addEventListener('click', () => {
      this.audio.playUI('whoosh');
      this.openModal('modal-modes');
    });

    document.querySelectorAll('.mode-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        const mode = (e.currentTarget as HTMLElement).getAttribute('data-mode') as GameModeType;
        if (mode) {
          this.audio.playUI('click');
          this.closeAllModals();
          this.callbacks.onSwitchMode(mode);
        }
      });
    });

    // Journey Map Modal
    document.getElementById('btn-open-journey')?.addEventListener('click', () => {
      this.audio.playUI('whoosh');
      this.renderJourneyStages();
      this.openModal('modal-journey');
    });

    // Shop Modal
    document.getElementById('btn-open-shop')?.addEventListener('click', () => {
      this.audio.playUI('whoosh');
      this.renderShop();
      this.openModal('modal-shop');
    });

    // Shop Tabs
    document.querySelectorAll('[data-shop-tab]').forEach((tab) => {
      tab.addEventListener('click', (e) => {
        document.querySelectorAll('[data-shop-tab]').forEach((t) => t.classList.remove('active'));
        (e.currentTarget as HTMLElement).classList.add('active');
        this.currentShopTab = (e.currentTarget as HTMLElement).getAttribute('data-shop-tab') as 'theme' | 'sound' | 'particles';
        this.renderShop();
      });
    });

    // Achievements Modal
    document.getElementById('btn-open-achievements')?.addEventListener('click', () => {
      this.audio.playUI('whoosh');
      this.renderAchievements();
      this.openModal('modal-achievements');
    });

    // Quests Modal
    document.getElementById('btn-open-quests')?.addEventListener('click', () => {
      this.audio.playUI('whoosh');
      this.renderQuests();
      this.openModal('modal-quests');
    });

    // Leaderboards Modal
    document.getElementById('btn-open-leaderboard')?.addEventListener('click', () => {
      this.audio.playUI('whoosh');
      this.renderLeaderboard();
      this.openModal('modal-leaderboard');
    });

    // Leaderboard Tabs
    document.querySelectorAll('[data-lb-tab]').forEach((tab) => {
      tab.addEventListener('click', (e) => {
        document.querySelectorAll('[data-lb-tab]').forEach((t) => t.classList.remove('active'));
        (e.currentTarget as HTMLElement).classList.add('active');
        this.currentLbTab = (e.currentTarget as HTMLElement).getAttribute('data-lb-tab') as 'global' | 'regional' | 'friends';
        this.renderLeaderboard();
      });
    });

    // Profile & Stats Modal
    document.getElementById('btn-open-profile')?.addEventListener('click', () => {
      this.audio.playUI('whoosh');
      this.renderProfile();
      this.openModal('modal-profile');
    });

    // Settings Modal
    document.getElementById('btn-open-settings')?.addEventListener('click', () => {
      this.audio.playUI('whoosh');
      this.openModal('modal-settings');
    });

    // Modal Close Buttons
    document.querySelectorAll('.modal-close').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.audio.playUI('click');
        this.closeAllModals();
      });
    });

    // Game Over Restart
    document.getElementById('btn-gameover-restart')?.addEventListener('click', () => {
      this.audio.playUI('click');
      this.closeAllModals();
      this.callbacks.onRestartMode();
    });
  }

  private bindSettings(): void {
    const data = this.profile.getData().settings;

    const masterInput = document.getElementById('setting-master-vol') as HTMLInputElement;
    const sfxInput = document.getElementById('setting-sfx-vol') as HTMLInputElement;
    const bgmInput = document.getElementById('setting-bgm-vol') as HTMLInputElement;
    const shakeInput = document.getElementById('setting-screenshake') as HTMLInputElement;
    const motionInput = document.getElementById('setting-reduced-motion') as HTMLInputElement;
    const cbSelect = document.getElementById('setting-colorblind') as HTMLSelectElement;
    const offsetInput = document.getElementById('setting-touch-offset') as HTMLInputElement;

    if (masterInput) {
      masterInput.value = data.masterVolume.toString();
      masterInput.addEventListener('input', () => {
        data.masterVolume = parseFloat(masterInput.value);
        this.audio.setVolumes(data.masterVolume, data.sfxVolume, data.bgmVolume);
        this.profile.save();
      });
    }

    if (sfxInput) {
      sfxInput.value = data.sfxVolume.toString();
      sfxInput.addEventListener('input', () => {
        data.sfxVolume = parseFloat(sfxInput.value);
        this.audio.setVolumes(data.masterVolume, data.sfxVolume, data.bgmVolume);
        this.profile.save();
      });
    }

    if (bgmInput) {
      bgmInput.value = data.bgmVolume.toString();
      bgmInput.addEventListener('input', () => {
        data.bgmVolume = parseFloat(bgmInput.value);
        this.audio.setVolumes(data.masterVolume, data.sfxVolume, data.bgmVolume);
        this.profile.save();
      });
    }

    if (shakeInput) {
      shakeInput.checked = data.screenShake;
      shakeInput.addEventListener('change', () => {
        data.screenShake = shakeInput.checked;
        this.profile.save();
      });
    }

    if (motionInput) {
      motionInput.checked = data.reducedMotion;
      motionInput.addEventListener('change', () => {
        data.reducedMotion = motionInput.checked;
        this.accessibility.updateSettings(data);
        this.profile.save();
      });
    }

    if (cbSelect) {
      cbSelect.value = data.colorblindMode;
      cbSelect.addEventListener('change', () => {
        data.colorblindMode = cbSelect.value as any;
        this.accessibility.updateSettings(data);
        this.profile.save();
      });
    }

    if (offsetInput) {
      offsetInput.value = data.touchOffset.toString();
      offsetInput.addEventListener('input', () => {
        data.touchOffset = parseInt(offsetInput.value, 10);
        this.profile.save();
      });
    }
  }

  public openModal(modalId: string): void {
    this.closeAllModals();
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  }

  public closeAllModals(): void {
    document.querySelectorAll('.modal-backdrop').forEach((m) => m.classList.remove('active'));
  }

  private renderJourneyStages(): void {
    const container = document.getElementById('journey-stages-container');
    if (!container) return;
    container.innerHTML = '';

    const progress = this.profile.getData().journeyProgress;

    JOURNEY_STAGES.forEach((st) => {
      const isUnlocked = st.stageNumber === 1 || progress[st.stageNumber] !== undefined || progress[st.stageNumber - 1] !== undefined;
      const stars = progress[st.stageNumber] || 0;

      const card = document.createElement('div');
      card.className = `stage-card ${isUnlocked ? '' : 'locked'}`;
      card.innerHTML = `
        <div>
          <div style="font-weight: 800; font-size: 15px; color: ${isUnlocked ? '#ffffff' : '#64748b'};">
            Stage ${st.stageNumber}: ${st.title}
          </div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
            ${st.subtitle} (Target: ${st.targetScore.toLocaleString()} pts)
          </div>
        </div>
        <div class="stage-stars">
          ${isUnlocked ? ('★'.repeat(stars) + '☆'.repeat(3 - stars)) : '🔒'}
        </div>
      `;

      if (isUnlocked) {
        card.addEventListener('click', () => {
          this.audio.playUI('click');
          this.closeAllModals();
          this.callbacks.onSwitchMode('journey', st.stageNumber);
        });
      }

      container.appendChild(card);
    });
  }

  private renderShop(): void {
    const balanceElem = document.getElementById('shop-shards-balance');
    if (balanceElem) balanceElem.textContent = this.profile.getData().shards.toLocaleString();

    const container = document.getElementById('shop-items-container');
    if (!container) return;
    container.innerHTML = '';

    const items = this.cosmetics.getItems().filter((item) => item.type === this.currentShopTab);
    const equipped = this.cosmetics.getEquipped();

    items.forEach((item) => {
      const isEquipped =
        (item.type === 'theme' && equipped.theme === item.id) ||
        (item.type === 'sound' && equipped.soundPack === item.id) ||
        (item.type === 'particles' && equipped.particleStyle === item.id);

      const card = document.createElement('div');
      card.className = 'item-card';
      card.innerHTML = `
        <div class="item-preview" style="background: ${item.previewColor};">
          ${item.type === 'sound' ? '🎵' : item.type === 'theme' ? '🎨' : '✨'}
        </div>
        <div class="item-name">${item.name}</div>
        <div class="item-desc">${item.description}</div>
        <button class="btn-glass" style="width: 100%; margin-top: auto; font-size: 11px;">
          ${
            isEquipped
              ? '✓ Equipped'
              : item.isUnlocked
              ? 'Equip'
              : `💎 ${item.costShards}`
          }
        </button>
      `;

      const btn = card.querySelector('button');
      btn?.addEventListener('click', () => {
        if (isEquipped) return;

        if (item.isUnlocked) {
          this.cosmetics.equip(item.type as any, item.id);
          this.audio.playUI('click');
          this.applyCosmetics();
          this.renderShop();
        } else {
          if (this.cosmetics.unlockItem(item.id)) {
            this.audio.playUI('shard');
            this.cosmetics.equip(item.type as any, item.id);
            this.applyCosmetics();
            this.renderShop();
          } else {
            alert('Not enough Shards! Play games and complete quests to earn more.');
          }
        }
      });

      container.appendChild(card);
    });
  }

  public applyCosmetics(): void {
    const eq = this.cosmetics.getEquipped();
    this.renderer.backgroundEffects.theme = eq.theme;
    this.audio.setSoundPack(eq.soundPack);
    this.renderer.particleSystem.style = eq.particleStyle;
  }

  private renderAchievements(): void {
    const container = document.getElementById('achievements-container');
    if (!container) return;
    container.innerHTML = '';

    const list = this.achievements.getAchievements();

    list.forEach((ach) => {
      const card = document.createElement('div');
      card.className = 'stage-card';
      const isComplete = ach.progress >= ach.maxProgress;

      card.innerHTML = `
        <div style="display: flex; gap: 12px; align-items: center;">
          <div style="font-size: 28px;">${ach.icon}</div>
          <div>
            <div style="font-weight: 800; font-size: 14px; color: #ffffff;">${ach.title}</div>
            <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">
              ${ach.description} (${ach.progress}/${ach.maxProgress})
            </div>
          </div>
        </div>
        <div>
          ${
            ach.isClaimed
              ? '<span style="font-size: 12px; color: #10b981; font-weight: 700;">Claimed</span>'
              : isComplete
              ? `<button class="btn-glass" style="background: #10b981; font-size: 12px;">Claim +${ach.shardReward}💎</button>`
              : `<span style="font-size: 12px; color: var(--text-secondary);">${ach.progress}/${ach.maxProgress}</span>`
          }
        </div>
      `;

      if (isComplete && !ach.isClaimed) {
        card.querySelector('button')?.addEventListener('click', () => {
          this.achievements.claimAchievement(ach.id);
          this.audio.playUI('level_up');
          this.renderAchievements();
        });
      }

      container.appendChild(card);
    });
  }

  private renderQuests(): void {
    const container = document.getElementById('quests-container');
    if (!container) return;
    container.innerHTML = '';

    const list = this.quests.getQuests();

    list.forEach((q) => {
      const card = document.createElement('div');
      card.className = 'stage-card';

      card.innerHTML = `
        <div style="display: flex; gap: 12px; align-items: center;">
          <div style="font-size: 28px;">${q.icon}</div>
          <div>
            <div style="font-weight: 800; font-size: 14px; color: #ffffff;">${q.title}</div>
            <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">
              ${q.description}
            </div>
          </div>
        </div>
        <div>
          ${
            q.isClaimed
              ? '<span style="font-size: 12px; color: #10b981; font-weight: 700;">Claimed</span>'
              : q.isCompleted
              ? `<button class="btn-glass" style="background: #10b981; font-size: 12px;">Claim +${q.rewardShards}💎</button>`
              : `<span style="font-size: 12px; color: var(--text-secondary);">${q.progress}/${q.goal}</span>`
          }
        </div>
      `;

      if (q.isCompleted && !q.isClaimed) {
        card.querySelector('button')?.addEventListener('click', () => {
          this.quests.claimQuest(q.id);
          this.audio.playUI('shard');
          this.renderQuests();
        });
      }

      container.appendChild(card);
    });
  }

  private renderLeaderboard(): void {
    const container = document.getElementById('leaderboard-container');
    if (!container) return;
    container.innerHTML = '';

    const leaders = this.leaderboards.getLeaderboard(this.currentLbTab);

    leaders.forEach((entry) => {
      const row = document.createElement('div');
      row.className = 'stage-card';
      if (entry.isPlayer) {
        row.style.borderColor = '#38bdf8';
        row.style.background = 'rgba(56, 189, 248, 0.15)';
      }

      row.innerHTML = `
        <div style="display: flex; gap: 12px; align-items: center;">
          <div style="font-weight: 800; width: 24px; color: ${entry.rank <= 3 ? '#facc15' : 'var(--text-secondary)'};">
            #${entry.rank}
          </div>
          <div style="font-size: 20px;">${entry.avatar}</div>
          <div>
            <div style="font-weight: 700; font-size: 14px; color: #ffffff;">${entry.name}</div>
            <div style="font-size: 11px; color: var(--text-secondary);">${entry.title}</div>
          </div>
        </div>
        <div style="font-weight: 800; font-size: 15px; color: #38bdf8;">
          ${entry.score.toLocaleString()}
        </div>
      `;

      container.appendChild(row);
    });
  }

  private renderProfile(): void {
    const rankTitle = document.getElementById('profile-rank-title');
    if (rankTitle) rankTitle.textContent = this.profile.getData().harmonyRank;

    const container = document.getElementById('profile-stats-container');
    if (!container) return;

    const stats = this.profile.getData().stats;
    const level = this.profile.getData().playerLevel;
    const xp = this.profile.getData().playerXP;
    const nextXP = this.profile.getXPForNextLevel(level);

    container.innerHTML = `
      <div class="hud-badge" style="width: 100%; border-radius: 16px; padding: 14px; align-items: flex-start;">
        <div style="display: flex; justify-content: space-between; width: 100%; font-weight: 700;">
          <span>Player Level ${level}</span>
          <span>${xp} / ${nextXP} XP</span>
        </div>
        <div class="meter-track" style="margin-top: 8px; width: 100%;">
          <div class="meter-fill" style="width: ${(xp / nextXP) * 100}%;"></div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 8px;">
        <div class="hud-badge" style="align-items: flex-start;">
          <span class="hud-label">Games Played</span>
          <span class="hud-value">${stats.gamesPlayed}</span>
        </div>
        <div class="hud-badge" style="align-items: flex-start;">
          <span class="hud-label">High Score</span>
          <span class="hud-value">${stats.highScore.toLocaleString()}</span>
        </div>
        <div class="hud-badge" style="align-items: flex-start;">
          <span class="hud-label">Lines Cleared</span>
          <span class="hud-value">${stats.totalLinesCleared}</span>
        </div>
        <div class="hud-badge" style="align-items: flex-start;">
          <span class="hud-label">Highest Combo</span>
          <span class="hud-value">${stats.highestCombo}x</span>
        </div>
        <div class="hud-badge" style="align-items: flex-start;">
          <span class="hud-label">Crystals Cleared</span>
          <span class="hud-value">${stats.crystalShapesCleared}</span>
        </div>
        <div class="hud-badge" style="align-items: flex-start;">
          <span class="hud-label">Shape Fusions</span>
          <span class="hud-value">${stats.fusionsUsed}</span>
        </div>
      </div>
    `;
  }
}
