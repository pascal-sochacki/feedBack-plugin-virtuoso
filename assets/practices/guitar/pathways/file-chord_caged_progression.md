---
id: file-chord_caged_progression
title: Comping the Changes
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 105
genre: all-purpose
skill: intermediate
applicability: guitar
---

Generated pathway definition; notes are produced by the existing strum_comp exercise generator.

```json
{
  "pathway": {
    "goal": "Comp a full progression — four-chord songs, ii–V–I — keeping the changes in time across positions. The skill is voice-economy: finding the nearest grip for each chord so your hand barely moves, the lazy-in-the-best-way rhythm-guitar feel that lets you comp a whole song without thinking about it.",
    "scales": [
      "major",
      "natural_minor"
    ],
    "base": {
      "practiceType": "strum_comp",
      "scale": "major",
      "chordDepth": "triad",
      "chordOverride": "auto",
      "progression": "I-V-vi-IV",
      "strumPattern": "folk_pop_ddu_udu",
      "voicingPosition": "economy",
      "meter": "4/4",
      "subdivision": "eighth",
      "bpm": 105,
      "bars": 8,
      "direction": "up_down",
      "sequence": "none",
      "advancedMode": true,
      "fretboardSystem": "caged",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "key": "G"
    },
    "vary": [
      {
        "progression": "I-V-vi-IV"
      },
      {
        "progression": "vi-IV-I-V",
        "key": "C"
      },
      {
        "progression": "I-vi-IV-V",
        "key": "C"
      },
      {
        "progression": "ii-V-I",
        "key": "C"
      },
      {
        "progression": "I-IV-V",
        "key": "E"
      }
    ],
    "tempoTiers": [
      80,
      105,
      125,
      150
    ]
  }
}
```
