---
id: file-blues_bends
title: Bends & Vibrato — the Cry
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 60
genre: blues
skill: intermediate
applicability: guitar
---

Generated pathway definition; notes are produced by the existing bending exercise generator.

```json
{
  "pathway": {
    "goal": "The pitches blues lives on: the ♭3→3 curl, the whole-step cry, wide slow vibrato. Bend up to the target and HOLD it in tune; let the note shake. This is where scale tones become speech — a blues player is recognized by their bends and vibrato before their notes.",
    "scales": [
      "blues",
      "minor_pentatonic"
    ],
    "base": {
      "practiceType": "bending",
      "bendTarget": "mixed",
      "scale": "minor_pentatonic",
      "meter": "4/4",
      "subdivision": "quarter",
      "bpm": 60,
      "bars": 12,
      "direction": "up_down",
      "advancedMode": true,
      "fretboardSystem": "caged",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "progression": "12_bar_blues",
      "chordOverride": "dom7",
      "backingStyle": "boogie",
      "swing": "shuffle",
      "audioProfile": "blues",
      "key": "A",
      "shape": "E"
    },
    "vary": [
      {
        "bendTarget": "whole"
      },
      {
        "bendTarget": "half"
      },
      {
        "bendTarget": "mixed"
      },
      {
        "key": "E",
        "bendTarget": "mixed"
      },
      {
        "key": "G",
        "bendTarget": "whole"
      }
    ],
    "tempoTiers": [
      50,
      65,
      80,
      95
    ]
  }
}
```
