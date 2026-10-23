---
id: file-sweep3_triad
title: Three-String Triad Sweep
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 50
genre: all-purpose
skill: advanced
applicability: guitar
---

Generated pathway definition; notes are produced by the existing sweep_arpeggios exercise generator.

```json
{
  "pathway": {
    "goal": "The raw sweep motion with the least to mute: one rake across the top three strings, down and back. The A-shape minor sliced to its top three strings is a clean descending staircase — one finger per fret, nothing to roll yet. Start dead slow; the lesson is one clean pick-stroke per string, never speed.",
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
      "bpm": 50,
      "bars": 8,
      "direction": "up_down",
      "sequence": "none",
      "advancedMode": true,
      "fretboardSystem": "caged",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "key": "A",
      "shape": "A",
      "sweepStrings": 3
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
        "key": "A",
        "shape": "A",
        "scale": "major"
      },
      {
        "key": "D",
        "shape": "A"
      },
      {
        "key": "C",
        "shape": "A",
        "scale": "major"
      }
    ],
    "tempoTiers": [
      50,
      65,
      85,
      110
    ]
  }
}
```
