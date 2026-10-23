---
id: file-pick_string_skip
title: String Skipping
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 80
---

Generated pathway definition; notes are produced by the existing string_skipping exercise generator.

```json
{
  "pathway": {
    "goal": "Skip a string mid-run — the pick has to clear the string between, and the fretting hand has to leap. String skipping builds picking accuracy and the wide-interval vocabulary that makes a line sound less scalar and more angular.",
    "scales": [
      "major",
      "minor_pentatonic",
      "natural_minor"
    ],
    "formCues": [
      "anchor_palm"
    ],
    "base": {
      "practiceType": "string_skipping",
      "scale": "major",
      "meter": "4/4",
      "subdivision": "eighth",
      "bpm": 80,
      "bars": 8,
      "direction": "up_down",
      "sequence": "none",
      "advancedMode": true,
      "fretboardSystem": "caged",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "key": "C",
      "shape": "E"
    },
    "vary": [
      {
        "key": "C",
        "shape": "E"
      },
      {
        "key": "A",
        "scale": "minor_pentatonic"
      },
      {
        "key": "G",
        "shape": "E"
      },
      {
        "key": "E",
        "scale": "natural_minor"
      },
      {
        "key": "D",
        "shape": "E"
      }
    ],
    "tempoTiers": [
      60,
      80,
      100,
      120
    ]
  }
}
```
