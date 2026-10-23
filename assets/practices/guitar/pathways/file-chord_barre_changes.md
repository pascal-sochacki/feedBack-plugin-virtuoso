---
id: file-chord_barre_changes
title: Barre Chords
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 90
genre: all-purpose
skill: intermediate
applicability: guitar
---

Generated pathway definition; notes are produced by the existing strum_comp exercise generator.

```json
{
  "pathway": {
    "goal": "Lock the E-shape and A-shape barres and play a progression in any key, up the neck, with no open strings. The skill is the movable barre: one shape becomes every chord just by sliding it to the root — and it unlocks the keys the open \"cowboy\" chords can't reach.",
    "scales": [
      "major",
      "natural_minor"
    ],
    "base": {
      "practiceType": "strum_comp",
      "scale": "major",
      "chordDepth": "triad",
      "chordOverride": "auto",
      "progression": "I-IV-V",
      "strumPattern": "folk_pop_ddu_udu",
      "voicingPosition": "movable",
      "shape": "E",
      "meter": "4/4",
      "subdivision": "eighth",
      "bpm": 90,
      "bars": 8,
      "direction": "up_down",
      "sequence": "none",
      "advancedMode": true,
      "fretboardSystem": "caged",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "key": "F"
    },
    "vary": [
      {
        "shape": "E",
        "key": "F"
      },
      {
        "shape": "A",
        "key": "C"
      },
      {
        "shape": "E",
        "progression": "I-V-vi-IV",
        "key": "G"
      },
      {
        "shape": "A",
        "progression": "I-IV-V",
        "key": "D"
      },
      {
        "shape": "E",
        "progression": "vi-IV-I-V",
        "key": "A"
      }
    ],
    "tempoTiers": [
      65,
      85,
      105,
      125
    ]
  }
}
```
