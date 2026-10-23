---
id: file-leg_runs
title: Legato Runs (3NPS)
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 85
---

Generated pathway definition; notes are produced by the existing legato exercise generator.

```json
{
  "pathway": {
    "goal": "Slurred runs across the neck — three-notes-per-string legato where you pick once per string and hammer/pull the rest. The 3NPS layout is built for this. The skill is endurance and evenness: a flowing, vocal line with no pick attack on every note.",
    "scales": [
      "natural_minor",
      "major",
      "dorian"
    ],
    "formCues": [
      "finger_proximity",
      "light_grip"
    ],
    "base": {
      "practiceType": "legato",
      "scale": "natural_minor",
      "meter": "4/4",
      "subdivision": "sixteenth",
      "bpm": 85,
      "bars": 8,
      "direction": "up_down",
      "sequence": "none",
      "advancedMode": true,
      "fretboardSystem": "3nps",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "key": "A",
      "shape": 1
    },
    "vary": [
      {
        "shape": 1
      },
      {
        "shape": 2
      },
      {
        "shape": 3
      },
      {
        "scale": "major",
        "key": "C"
      },
      {
        "shape": 5
      }
    ],
    "tempoTiers": [
      65,
      90,
      115,
      140
    ]
  }
}
```
