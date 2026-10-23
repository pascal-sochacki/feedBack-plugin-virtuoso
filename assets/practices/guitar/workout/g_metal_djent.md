---
id: g_metal_djent
title: Djent polymeter chug
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 80
genre: djent
skill: advanced
applicability: guitar
role: technique
competency: 3+3+2 against the count
---

Workout block definition migrated from the original segment catalog.

```json
{
  "block": {
    "role": "technique",
    "label": "Djent polymeter chug",
    "competency": "3+3+2 against the count",
    "band": "advanced",
    "instrument": "guitar",
    "style": "djent",
    "kind": "pedal_riff",
    "base": {
      "bpm": 80,
      "scale": "phrygian",
      "harmonize": false,
      "meter": "8/8:3+3+2",
      "subdivision": "eighth",
      "bars": 8,
      "direction": "up_down",
      "fretboardSystem": "position",
      "progression": "metal_pedal_chromatic",
      "chordOverride": "5oct",
      "fretMin": 0,
      "fretMax": 7
    },
    "vary": [
      {
        "scale": "phrygian"
      },
      {
        "scale": "natural_minor"
      },
      {
        "progression": "metal_pedal_chromatic"
      },
      {
        "scale": "phrygian",
        "progression": "metal_pedal_chromatic"
      }
    ]
  }
}
```
