---
id: file-rock_classic_changes
title: Classic-Rock Changes
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 100
genre: rock
skill: intermediate
applicability: guitar
---

Generated pathway definition; notes are produced by the existing chord_scales exercise generator.

```json
{
  "pathway": {
    "goal": "The harmonic fingerprint of classic rock — the I-♭VII-IV \"train\" cadence and the i-♭VII-♭VI minor loop — and soloing over them. Run the pentatonic/Mixolydian over the changes, landing chord tones as the progression moves. The ♭VII is the sound that separates rock from pop.",
    "scales": [
      "mixolydian",
      "minor_pentatonic",
      "natural_minor"
    ],
    "base": {
      "practiceType": "chord_scales",
      "chordScaleStrategy": "chord_tone_emphasis",
      "scale": "mixolydian",
      "chordDepth": "triad",
      "chordOverride": "auto",
      "progression": "mixolydian_rock",
      "meter": "4/4",
      "subdivision": "eighth",
      "bpm": 100,
      "bars": 8,
      "direction": "up_down",
      "sequence": "none",
      "advancedMode": true,
      "fretboardSystem": "caged",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "key": "E",
      "fretMin": 0,
      "fretMax": 9
    },
    "vary": [
      {
        "progression": "mixolydian_rock",
        "scale": "mixolydian"
      },
      {
        "progression": "i-VII-VI-VII",
        "scale": "natural_minor"
      },
      {
        "progression": "I-V-vi-IV",
        "scale": "major",
        "key": "G"
      },
      {
        "progression": "mixolydian_rock",
        "key": "A"
      },
      {
        "progression": "i-VI-III-VII",
        "scale": "natural_minor"
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
