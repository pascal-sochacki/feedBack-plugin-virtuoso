---
id: g_app_chord_tone
title: Chord-tone targeting
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 80
genre: all-purpose
skill: intermediate
applicability: guitar
role: application
competency: chord tones inside the scale
---

Workout block definition migrated from the original segment catalog.

```json
{
  "block": {
    "role": "application",
    "label": "Chord-tone targeting",
    "competency": "chord tones inside the scale",
    "band": "intermediate",
    "instrument": "guitar",
    "style": null,
    "kind": "chord_scales",
    "base": {
      "bpm": 80,
      "scale": "major",
      "chordScaleStrategy": "chord_tone_emphasis",
      "chordDepth": "seventh",
      "chordOverride": "auto",
      "meter": "4/4",
      "subdivision": "eighth",
      "bars": 8,
      "direction": "ascending",
      "sequence": "fours",
      "fretboardSystem": "caged",
      "fretMin": 0,
      "fretMax": 7
    },
    "vary": [
      {
        "key": "C",
        "progression": "diatonic"
      },
      {
        "key": "C",
        "progression": "I-IV-V"
      },
      {
        "key": "G",
        "progression": "I-V-vi-IV"
      },
      {
        "key": "D",
        "progression": "I-vi-IV-V"
      },
      {
        "key": "A",
        "progression": "vi-IV-I-V"
      }
    ]
  }
}
```
