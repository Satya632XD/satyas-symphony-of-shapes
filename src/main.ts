// src/main.ts - Main Entrypoint & Game Orchestrator for Satya's Symphony of Shapes
import { AudioEngine } from './audio/AudioEngine.ts';
import { CanvasRenderer } from './render/CanvasRenderer.ts';
import { TouchController } from './ui/TouchController.ts';
import { UIManager } from './ui/UIManager.ts';
import { AccessibilityManager } from './ui/Accessibility.ts';
import { ProfileManager } from './progression/ProfileManager.ts';
import { AchievementManager } from './progression/AchievementManager.ts';
import { QuestManager } from './progression/QuestManager.ts';
import { CosmeticsManager } from './progression/CosmeticsManager.ts';
import { LeaderboardManager } from './progression/LeaderboardManager.ts';
import { ClassicMode } from './modes/ClassicMode.ts';
import { JourneyMode } from './modes/JourneyMode.ts';
import { ZenMode } from './modes/ZenMode.ts';
import { RushMode } from './modes/RushMode.ts';
import { DailyMode } from './modes/DailyMode.ts';
import { GameMode } from './modes/GameMode.ts';
import { GameModeType } from './core/Types.ts';
import { FUSION_SHAPES } from './core/Shapes.ts';

class SatyaGame {
  private canvas: HTMLCanvasElement;
  private audio: AudioEngine;
  private renderer: CanvasRenderer;
  private profile: ProfileManager;
  private achievements: AchievementManager;
  private quests: QuestManager;
  private cosmetics: CosmeticsManager;
  private leaderboards: LeaderboardManager;
  private accessibility: AccessibilityManager;
  private ui: UIManager;
  private controller: TouchController;

  private activeMode: GameMode;
  private modes: Record<GameModeType, GameMode>;
  private lastTime: number = 0;
  private isAudioStarted: boolean = false;

  constructor() {
    const canvasElem = document.getElementById('game-canvas') as HTMLCanvasElement;
    if (!canvasElem) throw new Error('Could not find canvas element');
    this.canvas = canvasElem;

    // Progression & Managers
    this.profile = new ProfileManager();
    this.achievements = new AchievementManager(this.profile);
    this.quests = new QuestManager(this.profile);
    this.cosmetics = new CosmeticsManager(this.profile);
    this.leaderboards = new LeaderboardManager(this.profile);
    this.accessibility = new AccessibilityManager(this.profile.getData().settings);

    // Audio & Render
    this.audio = new AudioEngine();
    this.renderer = new CanvasRenderer(this.canvas);

    // Modes
    this.modes = {
      classic: new ClassicMode(),
      journey: new JourneyMode(1),
      zen: new ZenMode(),
      rush: new RushMode(),
      daily: new DailyMode()
    };
    this.activeMode = this.modes.classic;
    this.activeMode.init();

    // UI Manager
    this.ui = new UIManager(
      this.profile,
      this.achievements,
      this.quests,
      this.cosmetics,
      this.leaderboards,
      this.accessibility,
      this.audio,
      this.renderer,
      {
        onSwitchMode: this.switchMode.bind(this),
        onRestartMode: this.restartCurrentMode.bind(this),
        onCrucibleTriggered: this.activateCrucible.bind(this)
      }
    );

    // Touch & Mouse Controller
    this.controller = new TouchController(
      this.canvas,
      this.renderer,
      this.activeMode,
      {
        onPiecePlaced: this.handlePiecePlaced.bind(this),
        onCrucibleActivated: this.activateCrucible.bind(this)
      }
    );

    this.init();
  }

  private init(): void {
    // Apply equipped cosmetics
    this.ui.applyCosmetics();

    // Apply saved settings
    const settings = this.profile.getData().settings;
    this.audio.setVolumes(settings.masterVolume, settings.sfxVolume, settings.bgmVolume);
    this.controller.touchOffsetY = settings.touchOffset;

    // Window resize handler
    window.addEventListener('resize', () => {
      this.renderer.resize();
    });

    // Start AudioContext upon first user interaction
    const startAudio = () => {
      if (!this.isAudioStarted) {
        this.audio.init();
        this.audio.ensureContext();
        this.audio.startAmbientSymphony();
        this.isAudioStarted = true;
      }
    };
    window.addEventListener('pointerdown', startAudio, { once: true });
    window.addEventListener('keydown', startAudio, { once: true });

    // Initial HUD update
    this.ui.updateHUD(this.activeMode);

    // Start animation loop
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }

  private loop(currentTime: number): void {
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    // Update active game mode
    this.activeMode.update(dt);

    // Check game over / victory
    if (this.activeMode.isGameOver || this.activeMode.isVictory) {
      if (!document.getElementById('modal-gameover')?.classList.contains('active')) {
        this.handleGameFinished();
      }
    }

    // Render Canvas
    this.renderer.render(
      this.activeMode.board,
      this.activeMode.hand,
      this.controller.dragState,
      this.activeMode.mechanics.energyLevel,
      this.activeMode.mechanics.crucibleEnergy,
      dt
    );

    // Update HUD values
    this.ui.updateHUD(this.activeMode);

    requestAnimationFrame(this.loop.bind(this));
  }

  private handlePiecePlaced(slotIndex: number, row: number, col: number): void {
    const result = this.activeMode.makeMove(slotIndex, row, col);
    if (!result.success || !result.placedShape || !result.scoreUpdate) return;

    const { placedShape, scoreUpdate, clearedRows, clearedCols } = result;

    // 1. Audio note for placement
    this.audio.playPlacementNote(row, col, placedShape.isCrystal, placedShape.isHarmonic);

    // 2. Clear effects
    if (scoreUpdate.linesCleared > 0) {
      const { cellSize } = this.renderer.layout;

      // Line clear particles
      if (clearedRows) {
        clearedRows.forEach((r) => {
          for (let c = 0; c < this.activeMode.board.size; c++) {
            const pos = this.renderer.getCellCoords(r, c);
            this.renderer.particleSystem.emitCellClear(
              pos.x + cellSize / 2,
              pos.y + cellSize / 2,
              placedShape.baseColor,
              !!placedShape.isCrystal
            );
          }
        });
      }

      if (clearedCols) {
        clearedCols.forEach((c) => {
          for (let r = 0; r < this.activeMode.board.size; r++) {
            const pos = this.renderer.getCellCoords(r, c);
            this.renderer.particleSystem.emitCellClear(
              pos.x + cellSize / 2,
              pos.y + cellSize / 2,
              placedShape.baseColor,
              !!placedShape.isCrystal
            );
          }
        });
      }

      // Screen shake (if enabled)
      if (this.profile.getData().settings.screenShake && !this.accessibility.isReducedMotion()) {
        this.renderer.triggerScreenShake(scoreUpdate.linesCleared * 4);
      }

      // Line clear chord arpeggio
      this.audio.playLineClearChords(scoreUpdate.linesCleared, scoreUpdate.energyLevel);

      // Kinetic floating text celebration
      const textX = this.renderer.layout.boardX + this.renderer.layout.boardWidth / 2;
      const textY = this.renderer.layout.boardY + this.renderer.layout.boardHeight / 2 - 20;

      let label = `+${scoreUpdate.pointsEarned.toLocaleString()}`;
      if (scoreUpdate.linesCleared === 2) label = 'DUAL CADENCE! ' + label;
      else if (scoreUpdate.linesCleared === 3) label = 'TRIPLE HARMONY! ' + label;
      else if (scoreUpdate.linesCleared >= 4) label = 'QUAD SYMPHONY! ' + label;

      if (scoreUpdate.isCrossClear) label = 'CROSS RESONANCE! ' + label;
      if (scoreUpdate.energyLevel >= 4) label = `OVERDRIVE x${scoreUpdate.energyLevel}! ` + label;

      this.renderer.particleSystem.emitFloatingText(label, textX, textY);
    }

    // 3. Board Wipe / Tabula Rasa Celebration
    if (scoreUpdate.isBoardWipe) {
      this.audio.playUI('resonance');
      this.renderer.particleSystem.emitConfettiBurst(this.canvas.clientWidth, this.canvas.clientHeight);
      const textX = this.renderer.layout.boardX + this.renderer.layout.boardWidth / 2;
      const textY = this.renderer.layout.boardY + this.renderer.layout.boardHeight / 2;
      this.renderer.particleSystem.emitFloatingText('TABULA RASA! +1500', textX, textY, '#facc15', '#f59e0b');
    }

    // 4. Record progression stats
    this.profile.recordTurnUpdate(scoreUpdate);
  }

  private activateCrucible(): void {
    if (!this.activeMode.mechanics.canUseCrucible()) {
      return;
    }

    // Find first unused hand piece and transmute it!
    const slot = this.activeMode.hand.find((s) => !s.isUsed && s.shape);
    if (slot) {
      this.activeMode.mechanics.consumeCrucible();
      slot.shape = { ...FUSION_SHAPES[0] }; // Omni-Prism 1x1

      this.audio.playUI('resonance');
      const textX = this.renderer.layout.boardX + this.renderer.layout.boardWidth / 2;
      const textY = this.renderer.layout.boardY + this.renderer.layout.boardHeight / 2;
      this.renderer.particleSystem.emitFloatingText('SHAPE FUSION TRANSLATED!', textX, textY, '#38bdf8', '#0284c7');
    }
  }

  private handleGameFinished(): void {
    const isVictory = this.activeMode.isVictory;
    this.profile.recordGameResult(this.activeMode.score, Math.floor(this.activeMode.timeElapsedSec));

    if (isVictory) {
      this.audio.playUI('level_up');
      this.renderer.particleSystem.emitConfettiBurst(this.canvas.clientWidth, this.canvas.clientHeight);

      if (this.activeMode.type === 'journey') {
        const jm = this.activeMode as JourneyMode;
        const stars = jm.calculateStars();
        this.profile.getData().journeyProgress[jm.currentStage.stageNumber] = stars;
        // Unlock next stage
        this.profile.getData().journeyProgress[jm.currentStage.stageNumber + 1] = 0;
        this.profile.save();
      }
    } else {
      this.audio.playUI('game_over');
    }

    this.ui.showGameOver(this.activeMode, isVictory);
  }

  public switchMode(modeType: GameModeType, stageNumber?: number): void {
    if (modeType === 'journey' && stageNumber) {
      (this.modes.journey as JourneyMode).setStage(stageNumber);
    }
    this.activeMode = this.modes[modeType];
    this.activeMode.init();
    this.controller.setMode(this.activeMode);
    this.ui.updateHUD(this.activeMode);
  }

  public restartCurrentMode(): void {
    this.activeMode.init();
    this.controller.setMode(this.activeMode);
    this.ui.updateHUD(this.activeMode);
  }
}

// Bootstrap once DOM content is ready
window.addEventListener('DOMContentLoaded', () => {
  new SatyaGame();
});
