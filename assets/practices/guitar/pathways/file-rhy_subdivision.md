---
id: file-rhy_subdivision
title: Subdivisions
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 70
---

Generated pathway definition; notes are produced by the existing scale exercise generator.

```json
{
  "pathway": {
    "goal": "The grid under everything: play one scale at each subdivision — quarters, eighths, triplets, sixteenths — staying dead even as they get faster. The skill is internalizing the divisions of the beat so your time is a grid you trust, not a guess. The foundation of every groove. Want the punk version? Drive even eighths with ALL downstrokes — same hand motion every note — and push the tempo until downstrokes physically can't keep up (~the 200 bpm \"wall\"). That breaking point, where the pros switch to alternate picking, is the real lesson.",
    "scales": [
      "minor_pentatonic",
      "major",
      "dorian"
    ],
    "base": {
      "practiceType": "scale",
      "scale": "minor_pentatonic",
      "meter": "4/4",
      "subdivision": "eighth",
      "bpm": 70,
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
        "subdivision": "triplet"
      },
      {
        "subdivision": "sixteenth"
      },
      {
        "subdivision": "eighth",
        "sequence": "fours"
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
