# 🌙 Yoru

![License](https://img.shields.io/badge/license-MIT-black)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-charcoal)
![Status](https://img.shields.io/badge/status-active%20development-red)
![Tech](https://img.shields.io/badge/built%20with-React%20Native-blue)
![Privacy](https://img.shields.io/badge/privacy-local--only-success)
![UI](https://img.shields.io/badge/design-minimal%20editorial-lightgrey)

**Yoru** is a minimalist mobile reading app built around  
**RSVP (Rapid Serial Visual Presentation)**.

Instead of scanning lines of text, Yoru displays **one word at a time**, centered on the screen — letting your brain focus on recognition rather than eye movement.

> Calm interface. Serious focus. Fast reading.

---

## Features

- **EPUB + text-based PDF support**
- **RSVP reader**
  - One word at a time
  - Adjustable speed (WPM)
- **Red focus letter (ORP)**
  - Highlights the optimal recognition point in each word
- **Light & Dark themes**
  - Ink & paper aesthetic
- **Organisation**
  - Organize books into custom groups
- **Resume reading**
  - Saves exact position
- **Font switching**
- **Floating radial controls**
  - WPM
  - Font selector
- **Privacy-first**
  - All processing is local

---

## What is RSVP?

**Rapid Serial Visual Presentation** is a speed-reading technique where words appear  
**one at a time in a fixed position**.

This:
- Removes eye saccades
- Reduces fatigue
- Improves focus
- Enables higher reading speeds

Instead of:

```javascript
The quick brown fox jumps...
```

You see:

```javascript
The
quick
brown
fox
jumps
```

---

## Red Focus Letter (ORP)

Yoru uses an **Optimal Recognition Point** system.

Each word has **one highlighted character** (red) where your eye should focus.

This:
- Improves recognition speed
- Keeps your eyes stable
- Reduces cognitive load

Example:

```md
re[a]ding  
sy[s]tem  
dev[e]lopment
```

The position is calculated dynamically based on word length.

---

## Core Philosophy

> **Zero clutter. Distraction-free reading.**

Yoru removes:
- scrolling
- page layout noise
- unnecessary UI

You see **only what matters**:  
the next word.

Everything else stays hidden until you need it.

---

## Tech Overview

- Mobile-first architecture
- Modular components
- Theme tokens (single source of truth)
- Local file parsing:
  - EPUB (HTML parsing)
  - Text-based PDFs
- Offline-first
- No cloud dependency

---

## Roadmap

### v1.0
- EPUB import
- Adjustable WPM
- Chapter navigation
- Light & dark themes
- Shelves & library
- Resume reading
- Font switching
- Radial FAB controls

### v1.1
- RSVP engine
- Advanced pause tuning
- ORP (red focus letter)
- Text-based PDF import

### v1.2
- OCR for scanned PDFs
- Page preview mode
- Reading streaks
- Export stats
- Reading stats

### v2.0
- Cross-device sync (optional)
- Web version
- Plugin system

---

## License

MIT
