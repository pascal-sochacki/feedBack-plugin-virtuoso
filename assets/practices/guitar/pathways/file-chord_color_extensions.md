---
id: file-chord_color_extensions
title: Color: 9ths, 11ths & 13ths
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 78
---

Generated pathway definition; notes are produced by the existing strum_comp exercise generator.

```json
{
  "pathway": {
    "goal": "The extension grips that add color over a seventh: the funk dom9 (E9/A9), the neo-soul min9 and min11, and the big-band dom13. Each lives on the top strings — the low strings keep the root and 5th. One honest lesson baked in: a guitar \"11 chord\" is really a min11 or a 9sus (a true dominant 11th drops the 3rd), so we label the funk grip dom9, never \"11\".",
    "scales": [
      "mixolydian",
      "dorian"
    ],
    "base": {
      "practiceType": "strum_comp",
      "scale": "mixolydian",
      "chordDepth": "seventh",
      "chordOverride": "dom9",
      "progression": "I-IV-V",
      "strumPattern": "folk_pop_ddu_udu",
      "voicingPosition": "open",
      "meter": "4/4",
      "subdivision": "eighth",
      "bpm": 78,
      "bars": 8,
      "direction": "up_down",
      "sequence": "none",
      "advancedMode": true,
      "fretboardSystem": "caged",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "key": "C"
    },
    "vary": [
      {
        "chordOverride": "dom9",
        "scale": "mixolydian",
        "progression": "I-IV-V",
        "key": "C"
      },
      {
        "chordOverride": "dom13",
        "scale": "mixolydian",
        "progression": "I-IV-V",
        "key": "C"
      },
      {
        "chordOverride": "min9",
        "scale": "dorian",
        "progression": "static_i",
        "key": "C"
      },
      {
        "chordOverride": "min11",
        "scale": "dorian",
        "progression": "static_i",
        "key": "A"
      },
      {
        "chordOverride": "sus4",
        "scale": "major",
        "progression": "I-IV-V",
        "key": "D"
      }
    ],
    "tempoTiers": [
      60,
      78,
      95,
      110
    ]
  }
}
```
