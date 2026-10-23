---
id: file-rock_pentatonic
title: The Pentatonic Box
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 95
genre: rock
skill: intermediate
applicability: guitar
---

Generated pathway definition; notes are produced by the existing scale exercise generator.

```json
{
  "pathway": {
    "goal": "Home territory for rock lead — minor pentatonic box 1, then the blues scale's ♭5 color, over a I-IV-V. Every classic rock solo lives here. Own the box cold so your hands are free to phrase, not hunt for notes.",
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
      "bpm": 95,
      "bars": 8,
      "direction": "up_down",
      "sequence": "none",
      "advancedMode": true,
      "fretboardSystem": "caged",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "progression": "I-IV-V",
      "chordDepth": "triad",
      "chordOverride": "auto",
      "key": "E",
      "shape": "E"
    },
    "vary": [
      {
        "scale": "minor_pentatonic"
      },
      {
        "scale": "blues"
      },
      {
        "key": "A",
        "scale": "minor_pentatonic"
      },
      {
        "key": "G",
        "scale": "blues"
      },
      {
        "key": "D",
        "scale": "minor_pentatonic"
      }
    ],
    "tempoTiers": [
      70,
      95,
      115,
      140
    ]
  }
}
```
