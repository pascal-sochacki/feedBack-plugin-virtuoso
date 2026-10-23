---
id: file-tap_changes
title: Tapping the Changes
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 50
genre: all-purpose
skill: advanced
applicability: guitar
---

Generated pathway definition; notes are produced by the existing tapping exercise generator.

```json
{
  "pathway": {
    "goal": "The musical payoff: run the tapped cascade through a progression, re-rooting the shape on each chord in time. One figure slides to the nearest position per change — the skill is landing the new root's first tap cleanly on the downbeat, not the fireworks. This is tapping turned into a line, not a trick.",
    "scales": [
      "natural_minor",
      "major",
      "harmonic_minor"
    ],
    "formCues": [
      "finger_proximity",
      "light_grip"
    ],
    "base": {
      "practiceType": "tapping",
      "tapArp": true,
      "scale": "natural_minor",
      "chordDepth": "triad",
      "chordOverride": "auto",
      "progression": "i-VI-III-VII",
      "meter": "4/4",
      "subdivision": "triplet",
      "bpm": 50,
      "bars": 8,
      "direction": "up_down",
      "sequence": "none",
      "advancedMode": true,
      "fretboardSystem": "caged",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "key": "A",
      "shape": "E",
      "fretMin": 0,
      "fretMax": 17
    },
    "vary": [
      {
        "progression": "i-VI-III-VII",
        "key": "A"
      },
      {
        "progression": "i-VII-VI-VII",
        "key": "A"
      },
      {
        "scale": "major",
        "key": "C",
        "progression": "ii-V-I"
      },
      {
        "scale": "major",
        "key": "G",
        "progression": "I-vi-IV-V"
      },
      {
        "scale": "harmonic_minor",
        "chordDepth": "seventh",
        "progression": "minor_ii_V_i",
        "key": "A"
      }
    ],
    "tempoTiers": [
      50,
      60,
      70,
      80
    ]
  }
}
```
