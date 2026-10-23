---
id: file-country_pedal_bends
title: Pedal-Steel Bends
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 65
genre: country
skill: intermediate
applicability: guitar
---

Generated pathway definition; notes are produced by the existing bending exercise generator.

```json
{
  "pathway": {
    "goal": "Mimic the pedal steel: slow, controlled bends that ease up into pitch. Country bends are about smooth, vocal intonation, not the aggressive blues-rock push — land the note dead in tune and let it sit. (True oblique double-stop bends, one voice bending while another holds, are a technique enhancement still to come.)",
    "scales": [
      "major_pentatonic",
      "major"
    ],
    "base": {
      "practiceType": "bending",
      "bendTarget": "mixed",
      "scale": "major_pentatonic",
      "meter": "4/4",
      "subdivision": "quarter",
      "bpm": 65,
      "bars": 8,
      "direction": "up_down",
      "advancedMode": true,
      "fretboardSystem": "caged",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "key": "G",
      "shape": "E"
    },
    "vary": [
      {
        "bendTarget": "whole"
      },
      {
        "bendTarget": "half"
      },
      {
        "bendTarget": "mixed"
      },
      {
        "key": "A"
      },
      {
        "key": "D"
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
