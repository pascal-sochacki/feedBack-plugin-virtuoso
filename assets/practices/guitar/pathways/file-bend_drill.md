---
id: file-bend_drill
title: Bending Drill
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 60
---

Generated pathway definition; notes are produced by the existing bending exercise generator.

```json
{
  "pathway": {
    "goal": "Whole-step bends on the upper three strings. Bend up to the target pitch, hold, listen. Consistent intonation is the entire point — if you can't hear when you're sharp, slow down. Classic blues and rock vocabulary.",
    "scales": [
      "minor_pentatonic",
      "blues",
      "major_pentatonic",
      "major"
    ],
    "formCues": [
      "pinky_bend_support",
      "thumb_over"
    ],
    "base": {
      "practiceType": "bending",
      "bendTarget": "whole",
      "scale": "minor_pentatonic",
      "meter": "4/4",
      "subdivision": "quarter",
      "bpm": 60,
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
        "shape": "E",
        "bendTarget": "whole"
      },
      {
        "key": "A",
        "shape": "E",
        "bendTarget": "half"
      },
      {
        "key": "E",
        "shape": "E",
        "bendTarget": "whole"
      },
      {
        "key": "A",
        "shape": "E",
        "bendTarget": "mixed"
      },
      {
        "key": "D",
        "shape": "E",
        "bendTarget": "whole"
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
