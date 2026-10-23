---
id: file-rock_pedal_riff
title: Riff-Building with Pedal Tones
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 90
genre: rock
skill: intermediate
applicability: guitar
---

Generated pathway definition; notes are produced by the existing pedal_riff exercise generator.

```json
{
  "pathway": {
    "goal": "Where rock becomes architecture: a low pedal tone alternating with power-chord stabs, looser than a metal gallop, locked to the backbeat. The skill is building a RIFF — a repeating rhythmic-harmonic hook — not running a scale. The DNA of the rock song.",
    "scales": [
      "natural_minor",
      "minor_pentatonic"
    ],
    "base": {
      "practiceType": "pedal_riff",
      "harmonize": false,
      "scale": "natural_minor",
      "key": "E",
      "meter": "4/4",
      "subdivision": "eighth",
      "bpm": 90,
      "bars": 8,
      "direction": "up_down",
      "advancedMode": true,
      "fretboardSystem": "position",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "progression": "i-VII-VI-VII",
      "chordOverride": "5",
      "swing": "straight",
      "fretMin": 0,
      "fretMax": 7
    },
    "vary": [
      {
        "progression": "i-VII-VI-VII"
      },
      {
        "progression": "mixolydian_rock",
        "scale": "mixolydian"
      },
      {
        "progression": "i-VI-III-VII"
      },
      {
        "progression": "I-IV-V",
        "scale": "major",
        "key": "A"
      },
      {
        "progression": "i-VII-VI-VII",
        "key": "A"
      }
    ],
    "tempoTiers": [
      70,
      90,
      110,
      130
    ]
  }
}
```
