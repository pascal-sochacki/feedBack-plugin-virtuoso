---
id: file-pick_economy
title: Economy Crossings
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 75
genre: all-purpose
skill: intermediate
applicability: guitar
---

Generated pathway definition; notes are produced by the existing scale exercise generator.

```json
{
  "pathway": {
    "goal": "Two ways across the strings — and when to use each. Strict alternate picking makes every string change a coin flip: sometimes the pick travels OUTSIDE the two strings (the easy crossing), sometimes it gets trapped INSIDE them (the hard one — name it and you can finally practice it). Economy picking removes the flip: crossing to a new string, the pick keeps moving the SAME direction — two downs in a row ascending, two ups descending — a mini sweep through the crossing. Three-notes-per-string makes every crossing land on the same stroke, so each rep drills the same move. Run the economy steps, then the alternate contrast step, and feel the difference: alternate keeps the metronomic hand, economy glides. Neither school is \"correct\" — the skill is owning the crossing instead of being surprised by it.",
    "scales": [
      "major",
      "natural_minor",
      "dorian"
    ],
    "formCues": [
      "wrist_neutral",
      "light_grip"
    ],
    "base": {
      "practiceType": "scale",
      "strokePolicy": "economy",
      "scale": "major",
      "meter": "4/4",
      "subdivision": "sixteenth",
      "bpm": 75,
      "bars": 8,
      "direction": "up_down",
      "sequence": "none",
      "advancedMode": true,
      "fretboardSystem": "3nps",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "key": "C",
      "shape": 1
    },
    "vary": [
      {
        "strokePolicy": "economy",
        "direction": "ascending"
      },
      {
        "strokePolicy": "economy",
        "direction": "descending"
      },
      {
        "strokePolicy": "economy",
        "direction": "up_down"
      },
      {
        "strokePolicy": "alternate",
        "direction": "up_down"
      },
      {
        "strokePolicy": "economy",
        "shape": 2
      }
    ],
    "tempoTiers": [
      60,
      85,
      110,
      135
    ]
  }
}
```
