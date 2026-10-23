---
id: file-pent_foundation
title: Pentatonic Foundation
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 80
---

Generated pathway definition; notes are produced by the existing scale exercise generator.

```json
{
  "pathway": {
    "goal": "Play minor pentatonic box 1 over a 12-bar blues. The single most useful guitar drill — every rock and blues solo lives in this combination.",
    "scales": [
      "minor_pentatonic",
      "blues",
      "major_pentatonic"
    ],
    "base": {
      "practiceType": "scale",
      "scale": "minor_pentatonic",
      "meter": "4/4",
      "subdivision": "eighth",
      "bpm": 80,
      "bars": 12,
      "direction": "up_down",
      "sequence": "none",
      "advancedMode": true,
      "fretboardSystem": "caged",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "progression": "12_bar_blues",
      "chordDepth": "seventh",
      "chordOverride": "dom7",
      "drums": "none"
    },
    "vary": [
      {
        "key": "A",
        "shape": "E"
      },
      {
        "key": "E",
        "shape": "E"
      },
      {
        "key": "D",
        "shape": "E"
      },
      {
        "key": "G",
        "shape": "E"
      },
      {
        "key": "C",
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
