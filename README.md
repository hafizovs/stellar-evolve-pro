## Live demo

https://hafizovs.github.io/stellar-evolve-pro/

# StellarEvolve Pro

**StellarEvolve Pro** is an interactive star-evolution and Hertzsprung–Russell diagram simulator on Angular 22+. The app uses a parametric model (scaling relations, Stefan–Boltzmann, a stage machine), and **not** a full MESA / 1D hydro code.

## About

StellarEvolve Pro is an interactive simulator of stellar evolution and the Hertzsprung–Russell diagram, built with Angular 22+. Evolution is a parametric model: scaling relations, the Stefan–Boltzmann law, and a stage machine, not a full MESA or 1D hydro code. You pick a mass, play the star’s life, and open a core cross-section.

## Capabilities

- Educational parametric tracks: main sequence, giants, supernova / planetary nebula, and remnants (white dwarf, neutron star, black hole)
- Chandrasekhar and Oppenheimer–Volkoff limits
- Mass presets: 0.2, 1, 8, and 25 solar masses
- Play/pause, reset, core cross-section, and a canvas screenshot
- Dark/light theme and RU/EN

## Functionality

- Press Space to play or pause, and `R` to reset
- Load a mass with `1`–`4` (0.2 / 1 / 8 / 25 M☉) and watch the parametric track
- Toggle the core cross-section with `C` and screenshot the canvas with `S`
- Switch dark/light (`T`) and RU/EN (`G`), open hotkey help (`H`), and close overlays with Esc

## Install and run

```bash
npm install
npm start
```

Open `http://localhost:4200/`.

## Tests and build

```bash
npm test
npm run build
```

## Hotkeys

| Key | Action |
|---------|----------|
| Space | Play / Pause |
| R | Reset |
| C | Core cross-section |
| 1–4 | Mass presets (0.2 / 1 / 8 / 25 M☉) |
| S | Canvas screenshot |
| T | Theme dark/light |
| G | Language RU/EN |
| H | Hotkey help |
| Esc | Close overlay |

## Model

Educational parametric evolution: main sequence, giants, supernova / planetary nebula, and remnants (WD/NS/BH), using the Chandrasekhar and Oppenheimer–Volkoff limits. Numbers and thresholds are set in `docs/` of the parent `stellar_evolve_pro` package.

**Disclaimer:** this is a simplified parametric model for visualization and teaching, not a replacement for MESA or other 1D stellar evolution codes.
