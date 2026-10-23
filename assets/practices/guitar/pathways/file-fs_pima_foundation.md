---
id: file-fs_pima_foundation
title: p-i-m-a Foundation
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 55
---

Generated pathway definition; notes are produced by the existing fingerstyle_arp exercise generator.

```json
{
  "pathway": {
    "goal": "The fingerstyle hand, named: thumb is p, index i, middle m, ring a — each finger owns its string (thumb on the bass, i-m-a on G, B and E). Hold an open chord and run the pattern, free stroke, letting every note ring into the next — the arpeggio-study tradition every classical method starts from. The skill is independence and evenness: four equal voices from four different fingers, no pick anywhere.",
    "scales": [
      "major"
    ],
    "formCues": [
      "light_grip"
    ],
    "base": {
      "practiceType": "fingerstyle_arp",
      "pimaPattern": "pima",
      "scale": "major",
      "chordDepth": "triad",
      "chordOverride": "auto",
      "progression": "I-IV-V",
      "voicingPosition": "open",
      "meter": "4/4",
      "subdivision": "quarter",
      "bpm": 55,
      "bars": 4,
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
        "pimaPattern": "pima"
      },
      {
        "pimaPattern": "pami"
      },
      {
        "pimaPattern": "pimami"
      },
      {
        "pimaPattern": "pmim"
      },
      {
        "pimaPattern": "pima",
        "key": "C"
      },
      {
        "pimaPattern": "pami",
        "key": "G",
        "progression": "I-vi-IV-V"
      }
    ],
    "tempoTiers": [
      55,
      65,
      80,
      95
    ],
    "tempoTierSubdivs": [
      "quarter",
      "eighth",
      "eighth",
      "eighth"
    ],
    "tempoTierBars": [
      4,
      8,
      8,
      8
    ]
  }
}
```
