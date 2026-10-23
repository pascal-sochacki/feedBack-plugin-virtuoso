---
id: file-country_train
title: The Train & Soloing
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 100
---

Generated pathway definition; notes are produced by the existing chord_scales exercise generator.

```json
{
  "pathway": {
    "goal": "The ♭VII \"train\" change — the I-♭VII-IV move that gives country-rock its drive — and soloing over it. Run major pentatonic and Mixolydian over the changes, landing chord tones as the ♭VII passes. The ♭VII is the chord that turns country into Southern rock.",
    "scales": [
      "mixolydian",
      "major_pentatonic",
      "major"
    ],
    "base": {
      "practiceType": "chord_scales",
      "chordScaleStrategy": "mode_of_moment",
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
      "key": "G",
      "fretMin": 0,
      "fretMax": 9
    },
    "vary": [
      {
        "progression": "mixolydian_rock"
      },
      {
        "progression": "I-IV-V",
        "scale": "major_pentatonic"
      },
      {
        "key": "A",
        "progression": "mixolydian_rock"
      },
      {
        "key": "D",
        "progression": "I-V-vi-IV",
        "scale": "major"
      },
      {
        "progression": "mixolydian_rock",
        "key": "E"
      }
    ],
    "tempoTiers": [
      80,
      100,
      120,
      145
    ]
  }
}
```
