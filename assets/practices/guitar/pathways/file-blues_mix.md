---
id: file-blues_mix
title: Major / Minor Mix
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 85
---

Generated pathway definition; notes are produced by the existing scale exercise generator.

```json
{
  "pathway": {
    "goal": "The sound of the pros: slipping between minor and major pentatonic over the same blues — the gritty ♭3 over the IV, the sweet major 6th over the I. Mixing the two boxes is what gives blues-rock and Texas blues its vocal, three-dimensional sound.",
    "scales": [
      "major_pentatonic",
      "minor_pentatonic",
      "blues"
    ],
    "base": {
      "practiceType": "scale",
      "scale": "major_pentatonic",
      "meter": "4/4",
      "subdivision": "eighth",
      "bpm": 85,
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
      "backingStyle": "boogie",
      "swing": "shuffle",
      "audioProfile": "blues",
      "key": "A",
      "shape": "E"
    },
    "vary": [
      {
        "scale": "major_pentatonic"
      },
      {
        "scale": "minor_pentatonic"
      },
      {
        "scale": "blues"
      },
      {
        "key": "E",
        "scale": "major_pentatonic"
      },
      {
        "key": "G",
        "scale": "minor_pentatonic"
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
