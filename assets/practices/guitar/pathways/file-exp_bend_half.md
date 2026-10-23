---
id: file-exp_bend_half
title: Half-Step Bends
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 55
genre: all-purpose
skill: intermediate
applicability: guitar
---

Generated pathway definition; notes are produced by the existing bending exercise generator.

```json
{
  "pathway": {
    "goal": "The smaller bend, the harder ear. Half-step bends cover the least distance, so intonation is unforgiving — push to exactly a half step and hold it. If you can hear when you're sharp on a half-step bend, every bigger bend gets easier.",
    "scales": [
      "minor_pentatonic",
      "blues",
      "major_pentatonic"
    ],
    "base": {
      "practiceType": "bending",
      "bendTarget": "half",
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
