---
id: file-sweep_roll_apex
title: The Roll & Clean Apex
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 50
---

Generated pathway definition; notes are produced by the existing sweep_arpeggios exercise generator.

```json
{
  "pathway": {
    "goal": "The two skills that separate a real sweep from a smear. The fingertip ROLL: where same-fret strings sit under one finger, roll the tip across them joint by joint so only one rings at a time — never a flat barre. And the clean APEX: a hammer-on/pull-off flips the rake at the top with no pick-stroke. If the roll buzzes or two notes blur, drop a tempo tier — the roll is the whole lesson.",
    "scales": [
      "natural_minor",
      "harmonic_minor"
    ],
    "formCues": [
      "roll_dont_barre",
      "light_grip"
    ],
    "base": {
      "practiceType": "sweep_arpeggios",
      "scale": "natural_minor",
      "chordDepth": "triad",
      "chordOverride": "auto",
      "progression": "i-VI-III-VII",
      "meter": "4/4",
      "subdivision": "sixteenth",
      "bpm": 50,
      "bars": 8,
      "direction": "up_down",
      "sequence": "none",
      "advancedMode": true,
      "fretboardSystem": "caged",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "key": "A",
      "shape": "E"
    },
    "vary": [
      {
        "key": "A",
        "shape": "E"
      },
      {
        "key": "E",
        "shape": "E"
      },
      {
        "key": "A",
        "shape": "E",
        "scale": "harmonic_minor"
      },
      {
        "key": "D",
        "shape": "E"
      },
      {
        "key": "G",
        "shape": "E"
      }
    ],
    "tempoTiers": [
      45,
      60,
      75,
      90
    ]
  }
}
```
