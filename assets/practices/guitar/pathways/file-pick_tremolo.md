---
id: file-pick_tremolo
title: Tremolo Picking
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 90
genre: all-purpose
skill: intermediate
applicability: guitar
---

Generated pathway definition; notes are produced by the existing tremolo_picking exercise generator.

```json
{
  "pathway": {
    "goal": "The pick-hand engine: rapid alternate picking on a single note, kept even and relaxed. Tremolo builds the speed, endurance, and wrist motion every fast passage rides on. Start slow — evenness first, speed second; tension is the enemy.",
    "scales": [
      "minor_pentatonic",
      "natural_minor",
      "harmonic_minor"
    ],
    "formCues": [
      "wrist_neutral",
      "anchor_palm"
    ],
    "base": {
      "practiceType": "tremolo_picking",
      "scale": "minor_pentatonic",
      "meter": "4/4",
      "subdivision": "sixteenth",
      "bpm": 90,
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
        "scale": "natural_minor"
      },
      {
        "key": "D",
        "shape": "E"
      },
      {
        "scale": "harmonic_minor",
        "key": "A"
      }
    ],
    "tempoTiers": [
      70,
      95,
      120,
      150
    ]
  }
}
```
