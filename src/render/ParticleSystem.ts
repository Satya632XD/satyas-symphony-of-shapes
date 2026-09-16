// src/render/ParticleSystem.ts - High Performance Particle & Floating FX Engine
import { ParticleStyleId } from '../core/Types.ts';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  rotation?: number;
  vRot?: number;
  isShard?: boolean;
  isRing?: boolean;
  radius?: number;
  maxRadius?: number;
  ringWidth?: number;
}

export interface FloatingText {
  text: string;
  x: number;
  y: number;
  vy: number;
  alpha: number;
  scale: number;
  color: string;
  glowColor: string;
  duration: number;
  elapsed: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];
  public style: ParticleStyleId = 'stardust';

  public reset(): void {
    this.particles = [];
    this.floatingTexts = [];
  }

  public update(dt: number): void {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      if (p.isRing) {
        p.radius = (p.radius || 0) + (p.vx * dt * 60);
        p.alpha -= p.decay * dt * 60;
        if (p.alpha <= 0 || (p.radius && p.maxRadius && p.radius >= p.maxRadius)) {
          this.particles.splice(i, 1);
        }
        continue;
      }

      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.vy += 0.08 * dt * 60; // gentle gravity
      p.vx *= 0.98;
      p.alpha -= p.decay * dt * 60;

      if (p.rotation !== undefined && p.vRot !== undefined) {
        p.rotation += p.vRot * dt * 60;
      }

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.elapsed += dt;
      ft.y += ft.vy * dt * 60;
      ft.vy *= 0.95;

      const progress = ft.elapsed / ft.duration;
      if (progress < 0.2) {
        ft.scale = 0.6 + (progress / 0.2) * 0.6; // Pop scale
      } else {
        ft.scale = 1.2;
      }

      if (progress > 0.6) {
        ft.alpha = 1 - (progress - 0.6) / 0.4;
      }

      if (ft.elapsed >= ft.duration) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Render particles
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);

      if (p.isRing) {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.ringWidth || 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius || 10, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.isShard) {
        ctx.translate(p.x, p.y);
        if (p.rotation !== undefined) ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(-p.size, -p.size / 2);
        ctx.lineTo(p.size, -p.size);
        ctx.lineTo(p.size / 2, p.size);
        ctx.lineTo(-p.size / 2, p.size / 2);
        ctx.closePath();
        ctx.fill();
      } else {
        // Star or circle particle
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // Render floating texts
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.translate(ft.x, ft.y);
      ctx.scale(ft.scale, ft.scale);

      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.shadowColor = ft.glowColor;
      ctx.shadowBlur = 12;

      ctx.fillStyle = '#0f172a';
      ctx.fillText(ft.text, 1, 1); // Drop shadow text

      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, 0, 0);

      ctx.restore();
    }

    ctx.restore();
  }

  public emitCellClear(x: number, y: number, color: string, isCrystal: boolean): void {
    const count = isCrystal ? 22 : 12;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.0,
        size: isCrystal ? 3 + Math.random() * 4 : 2 + Math.random() * 3,
        color: isCrystal ? (Math.random() > 0.5 ? '#ffffff' : '#38bdf8') : color,
        alpha: 1,
        decay: 0.02 + Math.random() * 0.02,
        isShard: isCrystal,
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.2
      });
    }

    // Shockwave ring
    this.particles.push({
      x,
      y,
      vx: 4.5,
      vy: 0,
      size: 0,
      color: isCrystal ? '#e0f2fe' : color,
      alpha: 0.8,
      decay: 0.035,
      isRing: true,
      radius: 5,
      maxRadius: 45,
      ringWidth: isCrystal ? 4 : 2
    });
  }

  public emitFloatingText(text: string, x: number, y: number, color: string = '#facc15', glowColor: string = '#f59e0b'): void {
    this.floatingTexts.push({
      text,
      x,
      y,
      vy: -1.8,
      alpha: 1,
      scale: 0.8,
      color,
      glowColor,
      duration: 1.1,
      elapsed: 0
    });
  }

  public emitConfettiBurst(width: number, height: number): void {
    const colors = ['#f43f5e', '#ec4899', '#a855f7', '#6366f1', '#3b82f6', '#10b981', '#facc15', '#f97316'];
    for (let i = 0; i < 75; i++) {
      const x = width / 2 + (Math.random() - 0.5) * 200;
      const y = height / 2;
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.5;
      const speed = 4 + Math.random() * 8;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: 0.012 + Math.random() * 0.01,
        isShard: true,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.3
      });
    }
  }
}
