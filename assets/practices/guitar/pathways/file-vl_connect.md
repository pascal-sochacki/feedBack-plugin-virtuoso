---
id: file-vl_connect
title: Connect the Changes
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 80
genre: all-purpose
skill: intermediate
applicability: guitar
---

Generated pathway definition; notes are produced by the existing chord_scales exercise generator.

```json
{
  "pathway": {
    "goal": "Apply it as a line: run each chord's scale, but instead of restarting on the root every bar, land on the nearest guide tone (3rd or 7th) of the NEXT chord. That one habit — aim for the guide tone across the bar line — is what \"playing the changes\" means. The scale becomes a melody that follows the harmony.",
    "scales": [
      "major",
      "dorian",
      "mixolydian"
    ],
    "base": {
      "practiceType": "chord_scales",
      "chordScaleStrategy": "mode_of_moment",
      "scale": "major",
      "progression": "ii-V-I",
      "chordDepth": "seventh",
      "chordOverride": "auto",
      "meter": "4/4",
      "subdivision": "eighth",
      "swing": "swing",
      "audioProfile": "jazz",
      "bpm": 80,
      "bars": 8,
      "direction": "up_down",
      "sequence": "none",
      "advancedMode": true,
      "fretboardSystem": "caged",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "key": "C",
      "fretMin": 0,
      "fretMax": 7
    },
    "vary": [
      {
        "progression": "ii-V-I"
      },
      {
        "progression": "vi-ii-V-I"
      },
      {
        "key": "F",
        "progression": "ii-V-I"
      },
      {
        "key": "G",
        "progression": "I-V-vi-IV"
      },
      {
        "key": "Bb",
        "progression": "vi-ii-V-I"
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
