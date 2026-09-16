// src/progression/CosmeticsManager.ts - Cosmetics Catalog and Unlock Engine
import { CosmeticItem, ThemeId, PaletteId, SoundPackId, ParticleStyleId } from '../core/Types.ts';
import { ProfileManager } from './ProfileManager.ts';

export const COSMETICS_CATALOG: CosmeticItem[] = [
  // --- Themes ---
  {
    id: 'crystal_sanctuary',
    name: 'Crystal Sanctuary',
    type: 'theme',
    costShards: 0, // default unlocked
    isUnlocked: true,
    previewColor: '#0d1f33',
    description: 'Emerald and cyan crystalline garden with floating bioluminescent motes.'
  },
  {
    id: 'celestial_symphony',
    name: 'Celestial Symphony',
    type: 'theme',
    costShards: 150,
    isUnlocked: false,
    previewColor: '#16193b',
    description: 'Deep cosmic starlight with connecting constellation nodes.'
  },
  {
    id: 'energy_temple',
    name: 'Energy Temple',
    type: 'theme',
    costShards: 250,
    isUnlocked: false,
    previewColor: '#2b1b08',
    description: 'Ancient sacred geometry with slowly rotating amber mandalas.'
  },
  {
    id: 'harmonic_cyber',
    name: 'Harmonic Cyber',
    type: 'theme',
    costShards: 350,
    isUnlocked: false,
    previewColor: '#1f0d3d',
    description: 'High-energy synthwave dimension with reactive neon pulse waves.'
  },
  {
    id: 'velvet_twilight',
    name: 'Velvet Twilight',
    type: 'theme',
    costShards: 200,
    isUnlocked: false,
    previewColor: '#1c1538',
    description: 'Peaceful twilight garden with gentle violet starlight.'
  },

  // --- Sound Packs ---
  {
    id: 'glass_marimba',
    name: 'Crystal Glass Marimba',
    type: 'sound',
    costShards: 0, // default
    isUnlocked: true,
    previewColor: '#38bdf8',
    description: 'Crisp, bell-like glass chimes resonating across the board.'
  },
  {
    id: 'grand_piano',
    name: 'Grand Acoustic Sonata',
    type: 'sound',
    costShards: 180,
    isUnlocked: false,
    previewColor: '#fbbf24',
    description: 'Warm acoustic grand piano tones creating a living classical concert.'
  },
  {
    id: 'ambient_synth',
    name: 'Celestial Synth Chimes',
    type: 'sound',
    costShards: 240,
    isUnlocked: false,
    previewColor: '#a855f7',
    description: 'Lush synthesized frequency pads and futuristic arpeggiations.'
  },
  {
    id: 'zen_kalimba',
    name: 'Zen Kalimba Sanctuary',
    type: 'sound',
    costShards: 180,
    isUnlocked: false,
    previewColor: '#34d399',
    description: 'Gentle wooden thumb piano notes crafted for meditative relaxation.'
  },

  // --- Particle Styles ---
  {
    id: 'stardust',
    name: 'Stardust Shimmer',
    type: 'particles',
    costShards: 0,
    isUnlocked: true,
    previewColor: '#facc15',
    description: 'Ethereal glowing motes and sparkling clear trails.'
  },
  {
    id: 'crystal_spark',
    name: 'Prismatic Shards',
    type: 'particles',
    costShards: 120,
    isUnlocked: false,
    previewColor: '#38bdf8',
    description: 'Faceted geometric shards that shatter and tumble with real physics.'
  },
  {
    id: 'sonic_ring',
    name: 'Harmonic Shockwaves',
    type: 'particles',
    costShards: 160,
    isUnlocked: false,
    previewColor: '#ec4899',
    description: 'Concentric acoustic rings expanding across the grid on every clear.'
  }
];

export class CosmeticsManager {
  private profile: ProfileManager;

  constructor(profile: ProfileManager) {
    this.profile = profile;
  }

  public getItems(): CosmeticItem[] {
    const unlocked = new Set(this.profile.getData().unlockedCosmetics);
    return COSMETICS_CATALOG.map((item) => ({
      ...item,
      isUnlocked: unlocked.has(item.id) || item.costShards === 0
    }));
  }

  public unlockItem(id: string): boolean {
    const item = COSMETICS_CATALOG.find((c) => c.id === id);
    if (!item) return false;

    const data = this.profile.getData();
    if (data.unlockedCosmetics.includes(id)) return true;

    if (this.profile.spendShards(item.costShards)) {
      data.unlockedCosmetics.push(id);
      this.profile.save();
      return true;
    }
    return false;
  }

  public equip(type: 'theme' | 'palette' | 'sound' | 'particles', id: string): boolean {
    const data = this.profile.getData();
    if (!data.unlockedCosmetics.includes(id)) {
      const item = COSMETICS_CATALOG.find((c) => c.id === id);
      if (item && item.costShards === 0) {
        data.unlockedCosmetics.push(id);
      } else {
        return false;
      }
    }

    if (type === 'theme') data.equipped.theme = id as ThemeId;
    else if (type === 'palette') data.equipped.palette = id as PaletteId;
    else if (type === 'sound') data.equipped.soundPack = id as SoundPackId;
    else if (type === 'particles') data.equipped.particleStyle = id as ParticleStyleId;

    this.profile.save();
    return true;
  }

  public getEquipped(): {
    theme: ThemeId;
    palette: PaletteId;
    soundPack: SoundPackId;
    particleStyle: ParticleStyleId;
  } {
    return this.profile.getData().equipped;
  }
}
