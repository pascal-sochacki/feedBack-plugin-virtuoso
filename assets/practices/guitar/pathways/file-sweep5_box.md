---
id: file-sweep5_box
title: Five-String Box
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 55
---

Generated pathway definition; notes are produced by the existing sweep_arpeggios exercise generator.

```json
{
  "pathway": {
    "goal": "The signature five-string sweep — root on the A string, one pick-stroke per string raked up to the high E and back. Anchor the rake on the bass-string root and keep every note its own clean event. Slow and even beats fast and smeared, every single time.",
    "scales": [
      "natural_minor",
      "harmonic_minor",
      "major"
    ],
    "base": {
      "practiceType": "sweep_arpeggios",
      "scale": "natural_minor",
      "chordDepth": "triad",
      "chordOverride": "auto",
      "progression": "i-VI-III-VII",
      "meter": "4/4",
      "subdivision": "sixteenth",
      "bpm": 55,
      "bars": 8,
      "direction": "up_down",
      "sequence": "none",
      "advancedMode": true,
      "fretboardSystem": "caged",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "key": "A",
      "shape": "A"
    },
    "vary": [
      {
        "key": "A",
        "shape": "A"
      },
      {
        "key": "E",
        "shape": "A"
      },
      {
        "key": "D",
        "shape": "A"
      },
      {
        "key": "A",
        "shape": "A",
        "scale": "major"
      },
      {
        "key": "B",
        "shape": "A"
      }
    ],
    "tempoTiers": [
      50,
      65,
      80,
      100
    ]
  }
}
```
