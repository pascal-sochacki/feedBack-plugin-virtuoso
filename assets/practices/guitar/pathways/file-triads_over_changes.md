---
id: file-triads_over_changes
title: Triads Over Changes
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 90
---

Generated pathway definition; notes are produced by the existing progression_arpeggios exercise generator.

```json
{
  "pathway": {
    "goal": "Now use them: outline each chord with its triad as the progression moves (I-V-vi-IV). Land on the nearest inversion instead of jumping back to the root every bar — the start of real voice-leading. Triads are the skeleton under every solo and comp.",
    "scales": [
      "major",
      "natural_minor"
    ],
    "base": {
      "practiceType": "progression_arpeggios",
      "scale": "major",
      "chordDepth": "triad",
      "chordOverride": "auto",
      "progression": "I-V-vi-IV",
      "meter": "4/4",
      "subdivision": "eighth",
      "bpm": 90,
      "bars": 8,
      "direction": "up_down",
      "sequence": "none",
      "advancedMode": true,
      "fretboardSystem": "caged",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "key": "C",
      "shape": "C"
    },
    "vary": [
      {
        "key": "C",
        "progression": "I-V-vi-IV"
      },
      {
        "key": "C",
        "progression": "I-IV-V"
      },
      {
        "key": "G",
        "progression": "I-V-vi-IV"
      },
      {
        "key": "A",
        "progression": "vi-IV-I-V"
      },
      {
        "key": "D",
        "progression": "I-vi-IV-V"
      }
    ],
    "tempoTiers": [
      70,
      95,
      115,
      140
    ]
  }
}
```
