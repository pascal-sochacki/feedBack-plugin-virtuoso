---
id: file-modal_awareness
title: Modal Awareness
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 85
---

Generated pathway definition; notes are produced by the existing chord_scales exercise generator.

```json
{
  "pathway": {
    "goal": "Train your ear to follow the harmony: every chord is voiced as a dom7 so the chord-scale must shift dramatically from bar to bar, and you learn to HEAR the change and re-orient instantly. The skill is per-chord awareness — switching scale color the moment the chord moves, the foundation of playing the changes. (A deliberate ear-training exaggeration; for the true diatonic modes in context, use the modal vamps.)",
    "scales": [
      "major",
      "dorian",
      "phrygian",
      "lydian",
      "mixolydian",
      "natural_minor",
      "locrian"
    ],
    "base": {
      "practiceType": "chord_scales",
      "chordScaleStrategy": "mode_of_moment",
      "scale": "major",
      "chordDepth": "seventh",
      "chordOverride": "dom7",
      "progression": "diatonic",
      "meter": "4/4",
      "subdivision": "eighth",
      "bpm": 85,
      "bars": 8,
      "direction": "up_down",
      "sequence": "none",
      "advancedMode": true,
      "fretboardSystem": "caged",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "fretMin": 0,
      "fretMax": 7
    },
    "vary": [
      {
        "key": "C"
      },
      {
        "key": "G"
      },
      {
        "key": "D"
      },
      {
        "key": "A"
      },
      {
        "key": "F"
      }
    ],
    "tempoTiers": [
      60,
      85,
      105,
      125
    ]
  }
}
```
