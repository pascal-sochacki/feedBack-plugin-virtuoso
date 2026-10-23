---
id: file-rhy_gallop_snap
title: Gallop & Snap
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 80
genre: all-purpose
skill: advanced
applicability: guitar
---

Generated pathway definition; notes are produced by the existing scale exercise generator.

```json
{
  "pathway": {
    "goal": "The galloping picking hand: one rhythmic cell — an eighth plus two sixteenths — repeated until it's automatic, then its mirror (reverse gallop) and the dotted \"skip\" and front-weighted \"snap\" variants. The gallop is the NWOBHM/thrash engine and a pure picking-hand TIME skill: down on the eighth, down-up on the sixteenths, palm-muted. Lock one feel cold, then switch between them by ear — the device is the rhythm cell, not the notes.",
    "scales": [
      "minor_pentatonic",
      "natural_minor",
      "harmonic_minor"
    ],
    "base": {
      "practiceType": "scale",
      "scale": "minor_pentatonic",
      "meter": "4/4",
      "subdivision": "gallop",
      "bpm": 80,
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
        "subdivision": "gallop"
      },
      {
        "subdivision": "reverse_gallop"
      },
      {
        "subdivision": "skip_chug"
      },
      {
        "subdivision": "snap"
      },
      {
        "subdivision": "gallop",
        "scale": "harmonic_minor"
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
