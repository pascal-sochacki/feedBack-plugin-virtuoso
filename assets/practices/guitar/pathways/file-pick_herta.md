---
id: file-pick_herta
title: Herta Burst
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 60
genre: all-purpose
skill: intermediate
applicability: guitar
---

Generated pathway definition; notes are produced by the existing herta exercise generator.

```json
{
  "pathway": {
    "goal": "The herta on guitar: a four-note rolling burst — pick, hammer-on, pull-off, pick — fired off one string as four even sixteenths, the accent landing on the beat. Borrowed from the drum rudiment of the same name, it's the snapping fill that punctuates fast metal and prog. Start static on one note so it's pure hand coordination — dead-even sixteenths, a clean ringing pull-off, a clear accent — then move the accent around and walk it through the scale. The skill is a relaxed, even burst you can drop into a line at will; a tense hand and a dead pull-off are what kill it, so build the tempo slowly.",
    "scales": [
      "minor_pentatonic",
      "natural_minor",
      "harmonic_minor"
    ],
    "formCues": [
      "light_grip",
      "finger_proximity"
    ],
    "base": {
      "practiceType": "herta",
      "hertaAccent": 0,
      "hertaWalk": false,
      "scale": "minor_pentatonic",
      "meter": "4/4",
      "subdivision": "sixteenth",
      "bpm": 60,
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
        "hertaAccent": 0
      },
      {
        "hertaAccent": 3
      },
      {
        "hertaAccent": 2
      },
      {
        "hertaWalk": true
      },
      {
        "hertaWalk": true,
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
