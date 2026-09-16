# Satya's Symphony of Shapes 🎵💎

> A commercial-quality, modern 2D block-placement puzzle game where shapes, light, resonant frequencies, and strategy harmonize into a living musical symphony.

---

## ✨ Features

- **Procedural Web Audio Symphony Engine**:
  - Dynamically synthesizes real-time musical pitches, chord progressions, and ambient background pads using the native **Web Audio API** (zero external sound files needed).
  - 4 instrument packs: *Crystal Glass Marimba, Grand Acoustic Sonata, Celestial Synth Chimes, and Zen Kalimba*.
  - Scale harmonizations across Pentatonic, Lydian, and Dorian modes.
- **Original Gameplay Enhancements**:
  - **⚡ Energy Chain System**: Consecutive line clears build Energy levels up to Lv.5 (⚡ OVERDRIVE ⚡) with score multipliers from 1.5x up to 5.0x.
  - **🎼 Combo Burst System**: Simultaneous clears (Dual Cadence, Triple Harmony, Quad Symphony) trigger ascending chord arpeggios and screen effects.
  - **💎 Crystal & Harmonic Variants**: Rare luminous shapes that grant bonus Shards, XP, and Harmony boosts.
  - **⚖️ Harmony Meter**: Rewards efficient, tactical board management. Reaching 100% initiates Harmonic Resonance (+50% bonus score & golden bloom).
  - **🔮 Harmonic Crucible (Shape Fusion)**: Clears charge the crucible to transmute awkward shapes into 1x1 **Omni-Prisms**.
  - **✨ Precision Bonuses**: Cross-Clears (+300), Hand-Finishes (+200), and complete Board Wipes (**TABULA RASA! +1,500**).
- **5 Game Modes**:
  1. **Classic Mode**: Endless tactical puzzle mode.
  2. **Journey Mode**: 10 progressive handcrafted campaign stages with 3-star evaluations.
  3. **Zen Mode**: Relaxing endless mode with no game over; gentle harmonic relief waves clear congested areas automatically.
  4. **Rush Mode (120s)**: High-speed trial where every line clear adds bonus time.
  5. **Daily Challenge**: Date-seeded puzzle with identical piece sequences worldwide.
- **Progression & Customization**:
  - Player levels, XP progression, and Harmony Ranks (Novice Harmonizer to Grand Maestro).
  - 100% Fair in-game economy: Earn Shards through gameplay to unlock Living Background Themes, Sound Packs, and Particle Styles.
  - Quests, Achievements, and dynamic simulated Leaderboards.
- **Accessibility**:
  - Full support for Protanopia, Deuteranopia, Tritanopia, and High Contrast modes.
  - Reduced Motion mode and Screen Shake controls.
  - Touch controls with vertical finger offset and tap-to-place fallback.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
npm run preview
```
Open [http://localhost:4173](http://localhost:4173) to preview the production build.

---

## 🧪 Automated Tests
Run the standalone game logic verification suite:
```bash
node test/verify_game_logic.mjs
```

---

## 🛠️ Tech Stack
- **TypeScript** & **Vite**
- **HTML5 High-DPI Canvas 2D**
- **Native Web Audio API**
- **Modern Glassmorphic CSS**

---

## 📜 License
MIT License
