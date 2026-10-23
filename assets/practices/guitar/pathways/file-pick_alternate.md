---
id: file-pick_alternate
title: Alternate Across Strings
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 85
---

Generated pathway definition; notes are produced by the existing scale exercise generator.

```json
{
  "pathway": {
    "goal": "Strict alternate picking through a scale — down-up-down-up across string changes. The hard part is the crossing: keeping the pattern unbroken as the pick moves to a new string. This is the picking discipline that makes scale runs clean at speed.",
    "scales": [
      "major",
      "natural_minor",
      "minor_pentatonic"
    ],
    "formCues": [
      "wrist_neutral",
      "anchor_palm"
    ],
    "base": {
      "practiceType": "scale",
      "strokePolicy": "alternate",
      "scale": "major",
      "meter": "4/4",
      "subdivision": "sixteenth",
      "bpm": 85,
      "bars": 8,
      "direction": "up_down",
      "sequence": "fours",
      "advancedMode": true,
      "fretboardSystem": "3nps",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "key": "C",
      "shape": 1
    },
    "vary": [
      {
        "sequence": "fours"
      },
      {
        "sequence": "none"
      },
      {
        "shape": 2
      },
      {
        "sequence": "triplets",
        "subdivision": "triplet"
      },
      {
        "shape": 3
      }
    ],
    "tempoTiers": [
      65,
      90,
      115,
      140
    ]
  }
}
```
