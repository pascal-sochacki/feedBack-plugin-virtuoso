---
id: file-chord_sevenths
title: Sevenths Around the Neck
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 80
---

Generated pathway definition; notes are produced by the existing strum_comp exercise generator.

```json
{
  "pathway": {
    "goal": "The three seventh-chord QUALITIES as movable barre grips — min7, dom7, maj7 — the colors that make soul, funk and jazz sound like themselves. Grab each as an E-shape and an A-shape barre and move it: a ii–V–I lays all three in a row (Dm7 → G7 → Cmaj7). The seventh is the chord's character; this is the grip that carries it (the Triads ladder spells it one note at a time — here it rings as a chord).",
    "scales": [
      "major"
    ],
    "base": {
      "practiceType": "strum_comp",
      "scale": "major",
      "chordDepth": "seventh",
      "chordOverride": "auto",
      "progression": "ii-V-I",
      "strumPattern": "folk_pop_ddu_udu",
      "voicingPosition": "movable",
      "shape": "E",
      "meter": "4/4",
      "subdivision": "eighth",
      "bpm": 80,
      "bars": 8,
      "direction": "up_down",
      "sequence": "none",
      "advancedMode": true,
      "fretboardSystem": "caged",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "key": "C"
    },
    "vary": [
      {
        "shape": "E"
      },
      {
        "shape": "A"
      },
      {
        "shape": "E",
        "progression": "I-vi-ii-V"
      },
      {
        "shape": "A",
        "progression": "ii-V-I",
        "key": "G"
      },
      {
        "shape": "E",
        "progression": "vi-ii-V-I",
        "key": "A"
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
