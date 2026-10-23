---
id: file-chord_caged_shapes
title: The Five CAGED Shapes
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 80
---

Generated pathway definition; notes are produced by the existing strum_comp exercise generator.

```json
{
  "pathway": {
    "goal": "The same chord, five ways up the neck — one pass WALKS all five CAGED shapes in order, climbing from the open-position grip toward the 12th fret (each chord box names its shape). E and A are the workhorse movable barres; C, G and D are the partial/anchor grips — the movable G rings as its standard partial grab, the honest form real players use. Learn the ladder and you stop being trapped at the nut: any chord, any region. The key variations re-walk the same ladder from new frets — that is the proof the SHAPES are what you own, not one set of fret numbers. (Minor keys walk the shapes that exist as real grips — the movable G and C minor forms do not, so the minor ladder is shorter on purpose.)",
    "scales": [
      "major",
      "natural_minor"
    ],
    "base": {
      "practiceType": "strum_comp",
      "scale": "major",
      "chordDepth": "triad",
      "chordOverride": "auto",
      "progression": "static_i",
      "strumPattern": "folk_pop_ddu_udu",
      "voicingPosition": "movable",
      "shapeWalk": true,
      "meter": "4/4",
      "subdivision": "eighth",
      "bpm": 80,
      "bars": 10,
      "direction": "up_down",
      "sequence": "none",
      "advancedMode": true,
      "fretboardSystem": "position",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "key": "G"
    },
    "vary": [
      {
        "key": "G"
      },
      {
        "key": "C"
      },
      {
        "key": "A"
      },
      {
        "key": "D"
      },
      {
        "key": "E"
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
