---
id: file-rhy_displacement
title: Displacement & Syncopation
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 90
---

Generated pathway definition; notes are produced by the existing rhythmic_displacement exercise generator.

```json
{
  "pathway": {
    "goal": "Break the grid on purpose: start the pattern off the downbeat and let the accents land between the beats. Rhythmic displacement and syncopation are what make a part feel like a groove instead of an exercise — the push and pull that pulls a listener in.",
    "scales": [
      "minor_pentatonic",
      "dorian",
      "major"
    ],
    "base": {
      "practiceType": "rhythmic_displacement",
      "scale": "minor_pentatonic",
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
        "subdivision": "sixteenth"
      },
      {
        "key": "D",
        "scale": "dorian"
      },
      {
        "key": "G",
        "scale": "major"
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
