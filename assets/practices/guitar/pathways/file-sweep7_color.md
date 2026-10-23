---
id: file-sweep7_color
title: Seventh Sweeps
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 48
genre: all-purpose
skill: advanced
applicability: guitar
---

Generated pathway definition; notes are produced by the existing sweep_arpeggios exercise generator.

```json
{
  "pathway": {
    "goal": "Four-note arpeggios — m7, maj7, dom7 — adding the 7th's color and one more string-crossing to the rake. The seventh is what turns a triad sweep into a chord with a voice. The harmonic-minor variation hands you the diminished-7th sweep: the symmetric shape that slides up every minor third.",
    "scales": [
      "natural_minor",
      "major",
      "harmonic_minor"
    ],
    "base": {
      "practiceType": "sweep_arpeggios",
      "scale": "natural_minor",
      "chordDepth": "seventh",
      "chordOverride": "auto",
      "progression": "i-VI-III-VII",
      "meter": "4/4",
      "subdivision": "sixteenth",
      "bpm": 48,
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
        "shape": "E"
      },
      {
        "key": "A",
        "shape": "A"
      },
      {
        "key": "D",
        "shape": "E"
      },
      {
        "key": "A",
        "shape": "E",
        "scale": "major"
      },
      {
        "key": "A",
        "shape": "E",
        "scale": "harmonic_minor"
      }
    ],
    "tempoTiers": [
      45,
      58,
      72,
      88
    ]
  }
}
```
