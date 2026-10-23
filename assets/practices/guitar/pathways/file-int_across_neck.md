---
id: file-int_across_neck
title: Across the Neck
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 60
---

Generated pathway definition; notes are produced by the existing scale exercise generator.

```json
{
  "pathway": {
    "goal": "Take the intervals off-island. Play thirds through one key, but shift the SAME interval up the neck through the five CAGED zones — C, A, G, E, D — until you can find a third (or any interval) anywhere, not just in one shape. This is the 'up and down the fretboard' skill: the interval is the constant, the CAGED position is the variable.",
    "scales": [
      "major",
      "natural_minor"
    ],
    "base": {
      "practiceType": "scale",
      "scale": "major",
      "meter": "4/4",
      "subdivision": "eighth",
      "bpm": 60,
      "bars": 8,
      "direction": "up_down",
      "sequence": "thirds",
      "advancedMode": true,
      "fretboardSystem": "caged",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "key": "G",
      "shape": "E"
    },
    "vary": [
      {
        "shape": "G"
      },
      {
        "shape": "E"
      },
      {
        "shape": "D"
      },
      {
        "shape": "C"
      },
      {
        "shape": "A"
      }
    ],
    "tempoTiers": [
      55,
      70,
      85,
      100
    ]
  }
}
```
