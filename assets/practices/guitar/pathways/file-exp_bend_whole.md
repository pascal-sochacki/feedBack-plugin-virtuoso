---
id: file-exp_bend_whole
title: Whole-Step Bends
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 55
---

Generated pathway definition; notes are produced by the existing bending exercise generator.

```json
{
  "pathway": {
    "goal": "The staple of blues and rock. Whole-step bends on the top three strings — push up a full tone, land dead in tune, hold, listen. Consistent intonation is the entire point; speed and showmanship come after the pitch is reliable.",
    "scales": [
      "minor_pentatonic",
      "blues",
      "major_pentatonic"
    ],
    "base": {
      "practiceType": "bending",
      "bendTarget": "whole",
      "scale": "minor_pentatonic",
      "meter": "4/4",
      "subdivision": "quarter",
      "bpm": 55,
      "bars": 8,
      "direction": "up_down",
      "advancedMode": false,
      "fretboardSystem": "caged",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "key": "A",
      "shape": "E"
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
        "shape": "A"
      }
    ],
    "tempoTiers": [
      50,
      65,
      80,
      95
    ]
  }
}
```
