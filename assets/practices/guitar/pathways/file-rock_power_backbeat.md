---
id: file-rock_power_backbeat
title: Power Chords & the Backbeat
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 100
---

Generated pathway definition; notes are produced by the existing strum_comp exercise generator.

```json
{
  "pathway": {
    "goal": "The engine of rock: root-5th power chords strummed through a three-chord change, locked to the backbeat. The skill is changing shapes cleanly in time and driving the 2-and-4 — the rhythm guitar every rock song is built on, before a single note of lead.",
    "scales": [
      "major",
      "natural_minor",
      "minor_pentatonic"
    ],
    "base": {
      "practiceType": "strum_comp",
      "scale": "major",
      "chordDepth": "triad",
      "chordOverride": "5",
      "progression": "I-IV-V",
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
      "shape": "E"
    },
    "vary": [
      {
        "progression": "I-IV-V"
      },
      {
        "progression": "I-V-vi-IV",
        "key": "G"
      },
      {
        "progression": "i-VII-VI-VII",
        "scale": "natural_minor"
      },
      {
        "progression": "vi-IV-I-V",
        "key": "A"
      },
      {
        "progression": "I-IV-V",
        "key": "A"
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
