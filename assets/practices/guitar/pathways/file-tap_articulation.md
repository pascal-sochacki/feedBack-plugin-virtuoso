---
id: file-tap_articulation
title: Tap & Pull-Off
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 60
genre: all-purpose
skill: intermediate
applicability: guitar
---

Generated pathway definition; notes are produced by the existing tapping exercise generator.

```json
{
  "pathway": {
    "goal": "The atom of tapping: the picking-hand finger joins the fretboard, TAPS a note high on the string, then flicks OFF it — a pull-off that sounds the note your fretting hand is already holding. One string, one tapped note, one fretted note. The whole lesson is the pull-off being a sideways flick toward the palm (it plucks the string), not a lift, so the fretted note rings clean instead of dying. Tap on the beat, pull-off on the '&' — a dead-even trill. A click instead of a note is what kills it; build the tempo slowly.",
    "scales": [
      "minor_pentatonic",
      "natural_minor"
    ],
    "formCues": [
      "finger_proximity",
      "light_grip"
    ],
    "base": {
      "practiceType": "tapping",
      "scale": "minor_pentatonic",
      "meter": "4/4",
      "subdivision": "eighth",
      "bpm": 60,
      "bars": 8,
      "direction": "up_down",
      "sequence": "none",
      "advancedMode": true,
      "fretboardSystem": "single_string",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "key": "A"
    },
    "vary": [
      {
        "key": "A"
      },
      {
        "key": "E"
      },
      {
        "key": "D"
      },
      {
        "scale": "natural_minor",
        "key": "A"
      },
      {
        "scale": "natural_minor",
        "key": "E"
      }
    ],
    "tempoTiers": [
      60,
      75,
      90,
      105
    ]
  }
}
```
