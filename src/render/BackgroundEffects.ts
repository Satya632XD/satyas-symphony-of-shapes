// src/render/BackgroundEffects.ts - Dynamic Animated Living Backgrounds
import { ThemeId } from '../core/Types.ts';

interface Mote {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  phase: number;
  color: string;
}

export class BackgroundEffects {
  public theme: ThemeId = 'crystal_sanctuary';
  private motes: Mote[] = [];
  private time: number = 0;
  private width: number = 0;
  private height: number = 0;

  constructor() {
    this.initMotes(60);
  }

  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    if (this.motes.length === 0) {
      this.initMotes(60);
    }
  }

  private initMotes(count: number): void {
    this.motes = [];
    const colors = ['#38bdf8', '#818cf8', '#c084fc', '#34d399', '#facc15'];
    for (let i = 0; i < count; i++) {
      this.motes.push({
        x: Math.random() * (this.width || 800),
        y: Math.random() * (this.height || 1000),
        radius: 1.2 + Math.random() * 2.8,
        speedY: -0.2 - Math.random() * 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        phase: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }

  public update(dt: number): void {
    this.time += dt;

    for (const mote of this.motes) {
      mote.y += mote.speedY * dt * 60;
      mote.x += Math.sin(this.time + mote.phase) * mote.speedX * dt * 60;

      if (mote.y < -10) {
        mote.y = this.height + 10;
        mote.x = Math.random() * this.width;
      }
      if (mote.x < -10) mote.x = this.width + 10;
      if (mote.x > this.width + 10) mote.x = -10;
    }
  }

  public render(ctx: CanvasRenderingContext2D, width: number, height: number, energyLevel: number = 1): void {
    this.width = width;
    this.height = height;

    ctx.save();

    // 1. Draw Theme Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);

    if (this.theme === 'crystal_sanctuary') {
      bgGrad.addColorStop(0, '#091522');
      bgGrad.addColorStop(0.5, '#0d1f33');
      bgGrad.addColorStop(1, '#050c17');
    } else if (this.theme === 'celestial_symphony') {
      bgGrad.addColorStop(0, '#0b0c1e');
      bgGrad.addColorStop(0.5, '#16193b');
      bgGrad.addColorStop(1, '#080812');
    } else if (this.theme === 'energy_temple') {
      bgGrad.addColorStop(0, '#1c1308');
      bgGrad.addColorStop(0.5, '#2b1b08');
      bgGrad.addColorStop(1, '#0f0a04');
    } else if (this.theme === 'harmonic_cyber') {
      bgGrad.addColorStop(0, '#120726');
      bgGrad.addColorStop(0.6, '#1f0d3d');
      bgGrad.addColorStop(1, '#080312');
    } else {
      // velvet_twilight
      bgGrad.addColorStop(0, '#120d24');
      bgGrad.addColorStop(0.5, '#1c1538');
      bgGrad.addColorStop(1, '#0a0714');
    }

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Theme Specific Ambient Layers
    if (this.theme === 'energy_temple') {
      // Rotating sacred geometric mandala in the background
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate(this.time * 0.05);
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.04)';
      ctx.lineWidth = 1.5;

      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.arc(0, 0, 160 + i * 45, 0, Math.PI * 2);
        ctx.stroke();
      }

      for (let i = 0; i < 8; i++) {
        ctx.rotate(Math.PI / 4);
        ctx.strokeRect(-120, -120, 240, 240);
      }
      ctx.restore();
    } else if (this.theme === 'celestial_symphony') {
      // Celestial constellation lines
      ctx.save();
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.06)';
      ctx.lineWidth = 1;
      for (let i = 0; i < Math.min(this.motes.length - 1, 20); i++) {
        const m1 = this.motes[i];
        const m2 = this.motes[i + 1];
        const dist = Math.hypot(m1.x - m2.x, m1.y - m2.y);
        if (dist < 150) {
          ctx.beginPath();
          ctx.moveTo(m1.x, m1.y);
          ctx.lineTo(m2.x, m2.y);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // 3. Energy Chain Ambient Reactive Glow
    if (energyLevel >= 2) {
      const auraIntensity = (energyLevel - 1) * 0.05;
      const radialGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        50,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.7
      );
      radialGrad.addColorStop(0, `rgba(56, 189, 248, ${auraIntensity})`);
      radialGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radialGrad;
      ctx.fillRect(0, 0, width, height);
    }

    // 4. Floating Motes
    for (const mote of this.motes) {
      ctx.save();
      ctx.globalAlpha = 0.3 + Math.sin(this.time * 2 + mote.phase) * 0.2;
      ctx.fillStyle = mote.color;
      ctx.shadowColor = mote.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(mote.x, mote.y, mote.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }
}
