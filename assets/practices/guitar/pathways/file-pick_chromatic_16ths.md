---
id: file-pick_chromatic_16ths
title: Chromatic Sixteenths
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 60
genre: all-purpose
skill: intermediate
applicability: guitar
---

Generated pathway definition; notes are produced by the existing chromatic exercise generator.

```json
{
  "pathway": {
    "goal": "The 1-2-3-4 warmup grown into a picking workout — strict alternate sixteenths across all six strings, four notes per click. Your hands already know the pattern from the Chromatic Warmup; now the pick leads: down-up unbroken through every string crossing, evenness before speed. The endurance builder fast scale runs ride on.",
    "scales": [],
    "formCues": [
      "wrist_neutral",
      "finger_proximity"
    ],
    "base": {
      "practiceType": "chromatic",
      "chromaticPattern": "1234",
      "strokePolicy": "alternate",
      "meter": "4/4",
      "subdivision": "sixteenth",
      "bpm": 60,
      "bars": 8,
      "direction": "up_down",
      "advancedMode": false,
      "fretboardSystem": "position",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "fretMin": 1,
      "fretMax": 4
    },
    "vary": [
      {
        "chromaticPattern": "1234",
        "fretMin": 1,
        "fretMax": 4
      },
      {
        "chromaticPattern": "4321",
        "fretMin": 1,
        "fretMax": 4
      },
      {
        "chromaticPattern": "1324",
        "fretMin": 1,
        "fretMax": 4
      },
      {
        "chromaticPattern": "1342",
        "fretMin": 1,
        "fretMax": 4
      },
      {
        "chromaticPattern": "1234",
        "fretMin": 5,
        "fretMax": 8
      },
      {
        "chromaticPattern": "1234",
        "fretMin": 9,
        "fretMax": 12
      }
    ],
    "tempoTiers": [
      60,
      75,
      90,
      105
    ]
  }
}
```
