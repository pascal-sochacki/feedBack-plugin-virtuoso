---
id: file-rhy_swing
title: Swing & Shuffle
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 90
---

Generated pathway definition; notes are produced by the existing scale exercise generator.

```json
{
  "pathway": {
    "goal": "Same notes, different feel: play a line straight, then swing the eighths, then push to a hard triplet shuffle. Hearing and switching between straight and swung time is a feel skill that unlocks jazz, blues, and half of pop. The pocket is in the ratio.",
    "scales": [
      "minor_pentatonic",
      "major",
      "dorian"
    ],
    "base": {
      "practiceType": "scale",
      "scale": "minor_pentatonic",
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
      "swing": "straight",
      "key": "A",
      "shape": "E"
    },
    "vary": [
      {
        "swing": "straight"
      },
      {
        "swing": "swing"
      },
      {
        "swing": "shuffle"
      },
      {
        "swing": "swing",
        "key": "E"
      },
      {
        "swing": "shuffle",
        "scale": "blues"
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
