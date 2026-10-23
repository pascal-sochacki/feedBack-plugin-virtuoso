---
id: g_metal_metalcore
title: Metalcore pedal chug
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 80
genre: metal
skill: intermediate
applicability: guitar
role: technique
competency: palm-mute pedal + semitone power chords
---

Workout block definition migrated from the original segment catalog.

```json
{
  "block": {
    "role": "technique",
    "label": "Metalcore pedal chug",
    "competency": "palm-mute pedal + semitone power chords",
    "band": "intermediate",
    "instrument": "guitar",
    "style": "metal",
    "kind": "pedal_riff",
    "base": {
      "bpm": 80,
      "scale": "phrygian",
      "harmonize": false,
      "meter": "4/4",
      "subdivision": "eighth",
      "bars": 8,
      "direction": "up_down",
      "fretboardSystem": "position",
      "progression": "metal_pedal_chromatic",
      "chordOverride": "5",
      "fretMin": 0,
      "fretMax": 7
    },
    "vary": [
      {
        "progression": "metal_pedal_chromatic"
      },
      {
        "progression": "metal_i_bVI_bVII"
      },
      {
        "progression": "metal_pedal_chromatic",
        "scale": "natural_minor"
      },
      {
        "progression": "metal_i_bVI_bVII",
        "subdivision": "gallop"
      }
    ]
  }
}
```
