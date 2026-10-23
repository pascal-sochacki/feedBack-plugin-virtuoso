---
id: file-rhy_accent_displace
title: Accent Displacement
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 70
genre: all-purpose
skill: intermediate
applicability: guitar
---

Generated pathway definition; notes are produced by the existing rhythm_pulse exercise generator.

```json
{
  "pathway": {
    "goal": "Same notes, different groove: play an even stream of sixteenths on one note and move WHERE the accent falls — on the beat, then the \"e\", the \"&\", the \"a\". Relocating the accent turns one rhythm into four feels; it's the highest-leverage groove skill a drummer owns, and it makes your time feel intentional instead of mechanical. Count out loud and let the accent — not the notes — carry the groove (this is the engine under the bluegrass roll, the funk \"one\", the tango marcato).",
    "scales": [
      "minor_pentatonic"
    ],
    "base": {
      "practiceType": "rhythm_pulse",
      "pulseAccent": 0,
      "scale": "minor_pentatonic",
      "anchor": "open_lowest",
      "anchorFret": 5,
      "meter": "4/4",
      "subdivision": "sixteenth",
      "bpm": 70,
      "bars": 8,
      "direction": "up_down",
      "sequence": "none",
      "advancedMode": true,
      "fretboardSystem": "caged",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "shape": "E"
    },
    "vary": [
      {
        "pulseAccent": 0
      },
      {
        "pulseAccent": 1
      },
      {
        "pulseAccent": 2
      },
      {
        "pulseAccent": 3
      },
      {
        "subdivision": "eighth",
        "pulseAccent": 1
      }
    ],
    "tempoTiers": [
      55,
      70,
      85,
      100
    ]
  }
}
```
