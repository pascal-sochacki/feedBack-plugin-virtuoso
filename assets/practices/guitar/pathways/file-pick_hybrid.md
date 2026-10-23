---
id: file-pick_hybrid
title: Hybrid Picking
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 85
---

Generated pathway definition; notes are produced by the existing hybrid_picking exercise generator.

```json
{
  "pathway": {
    "goal": "Pick and fingers together: the flatpick plays the low note, the middle and ring fingers pluck the higher strings. Hybrid picking unlocks wide string-spanning licks, snappy double-stops, and the country/fusion vocabulary you can't get with a pick alone.",
    "scales": [
      "major",
      "major_pentatonic",
      "mixolydian"
    ],
    "base": {
      "practiceType": "hybrid_picking",
      "scale": "major",
      "meter": "4/4",
      "subdivision": "eighth",
      "bpm": 85,
      "bars": 8,
      "direction": "up_down",
      "sequence": "none",
      "advancedMode": true,
      "fretboardSystem": "caged",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "key": "G",
      "shape": "E"
    },
    "vary": [
      {
        "key": "G",
        "shape": "E"
      },
      {
        "key": "C",
        "shape": "E"
      },
      {
        "scale": "major_pentatonic"
      },
      {
        "key": "A",
        "scale": "mixolydian"
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
