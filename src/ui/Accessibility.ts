// src/ui/Accessibility.ts - Accessibility, Colorblindness, and Reduced Motion Support
import { SettingsState } from '../core/Types.ts';

export class AccessibilityManager {
  private settings: SettingsState;

  constructor(settings: SettingsState) {
    this.settings = settings;
    this.applySettings();
  }

  public updateSettings(settings: SettingsState): void {
    this.settings = settings;
    this.applySettings();
  }

  public applySettings(): void {
    const root = document.documentElement;

    // 1. Colorblind filters
    root.classList.remove('cb-protanopia', 'cb-deuteranopia', 'cb-tritanopia', 'cb-high-contrast');
    if (this.settings.colorblindMode !== 'none') {
      root.classList.add(`cb-${this.settings.colorblindMode.replace('_', '-')}`);
    }

    // 2. Reduced Motion
    if (this.settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
  }

  public isReducedMotion(): boolean {
    return (
      this.settings.reducedMotion ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }
}
