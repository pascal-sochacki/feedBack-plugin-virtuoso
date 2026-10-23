---
id: file-tap_cascade
title: Tapped Arpeggio Cascade
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 50
genre: all-purpose
skill: intermediate
applicability: guitar
---

Generated pathway definition; notes are produced by the existing tapping exercise generator.

```json
{
  "pathway": {
    "goal": "Move the cell across the strings and a whole arpeggio pours down the neck — tap→pull→hammer on one string hands off to the next, outlining a triad through octaves you could never sweep cleanly. The lesson is the string change: a gap-free hand-off with no doubled note, each string muted the instant it's done. Learn the shape as one cell per beat, then let it double into the rolling cascade — the density jump IS the rung.",
    "scales": [
      "natural_minor",
      "harmonic_minor",
      "major"
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
      "sweepStrings": 3,
      "fretMin": 5,
      "fretMax": 17
    },
    "vary": [
      {
        "sweepStrings": 3,
        "key": "A"
      },
      {
        "sweepStrings": 5,
        "key": "E"
      },
      {
        "sweepStrings": 5,
        "key": "A"
      },
      {
        "sweepStrings": 6,
        "key": "D"
      },
      {
        "sweepStrings": 6,
        "key": "A",
        "scale": "harmonic_minor"
      }
    ],
    "tempoTiers": [
      50,
      62,
      66,
      74
    ],
    "tempoTierSubdivs": [
      "triplet",
      "triplet",
      "sixteenth_triplet",
      "sixteenth_triplet"
    ]
  }
}
```
