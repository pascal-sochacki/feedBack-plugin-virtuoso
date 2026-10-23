---
id: file-sweep_changes
title: Sweeps Over Changes
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 52
genre: all-purpose
skill: advanced
applicability: guitar
---

Generated pathway definition; notes are produced by the existing sweep_arpeggios exercise generator.

```json
{
  "pathway": {
    "goal": "The musical payoff: run the sweep through a progression, re-rooting the box on each chord's bass note in time. One shape slides to the nearest position per change — the skill is landing the new root cleanly on the downbeat, not the fireworks. This is a sweep turned into music.",
    "scales": [
      "natural_minor",
      "major",
      "harmonic_minor"
    ],
    "base": {
      "practiceType": "sweep_arpeggios",
      "scale": "natural_minor",
      "chordDepth": "triad",
      "chordOverride": "auto",
      "progression": "i-VI-III-VII",
      "meter": "4/4",
      "subdivision": "sixteenth",
      "bpm": 52,
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
        "key": "A",
        "shape": "E",
        "progression": "i-VI-III-VII"
      },
      {
        "key": "A",
        "shape": "A",
        "progression": "i-VII-VI-VII"
      },
      {
        "key": "C",
        "shape": "E",
        "scale": "major",
        "progression": "ii-V-I"
      },
      {
        "key": "G",
        "shape": "E",
        "scale": "major",
        "progression": "I-vi-IV-V"
      },
      {
        "key": "A",
        "shape": "E",
        "scale": "harmonic_minor",
        "chordDepth": "seventh",
        "progression": "minor_ii_V_i"
      }
    ],
    "tempoTiers": [
      50,
      60,
      72,
      85
    ]
  }
}
```
