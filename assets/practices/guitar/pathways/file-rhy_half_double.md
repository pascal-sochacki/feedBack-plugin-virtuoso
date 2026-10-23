---
id: file-rhy_half_double
title: Half-Time & Double-Time
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 90
genre: all-purpose
skill: intermediate
applicability: guitar
---

Generated pathway definition; notes are produced by the existing scale exercise generator.

```json
{
  "pathway": {
    "goal": "Same tempo, different feel: the CLICK never changes — your note density does. Play in quarters and the groove leans back into a half-time feel; double it to sixteenths and it drives as double-time. Learning to shift the felt pulse over a steady click — without rushing or dragging the click itself — is how a rhythm section makes a song breathe and surge. The metronome is the constant; the feel is your choice.",
    "scales": [
      "minor_pentatonic",
      "dorian"
    ],
    "base": {
      "practiceType": "scale",
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
        "subdivision": "quarter"
      },
      {
        "subdivision": "eighth"
      },
      {
        "subdivision": "sixteenth"
      },
      {
        "subdivision": "eighth",
        "sequence": "fours"
      },
      {
        "subdivision": "sixteenth",
        "key": "E"
      }
    ],
    "tempoTiers": [
      70,
      85,
      100,
      115
    ]
  }
}
```
