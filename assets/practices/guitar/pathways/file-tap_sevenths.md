---
id: file-tap_sevenths
title: Seventh & Diminished Cascade
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 46
---

Generated pathway definition; notes are produced by the existing tapping exercise generator.

```json
{
  "pathway": {
    "goal": "Add the 7th and one more string-crossing: m7 / maj7 / dom7 arpeggios tapped across the neck, the seventh's color turning the triad into a chord with a voice. Harmonic minor hands you the diminished-7th cascade — one symmetric shape you slide up in minor thirds over the dominant, the sound of a shred solo taking flight. Outline the chord, not a scale; a clean tapped 7th is worth more than a fast blur.",
    "scales": [
      "natural_minor",
      "major",
      "harmonic_minor"
    ],
    "formCues": [
      "finger_proximity",
      "light_grip"
    ],
    "base": {
      "practiceType": "tapping",
      "tapArp": true,
      "scale": "natural_minor",
      "chordDepth": "seventh",
      "chordOverride": "auto",
      "progression": "i-VI-III-VII",
      "meter": "4/4",
      "subdivision": "triplet",
      "bpm": 46,
      "bars": 8,
      "direction": "up_down",
      "sequence": "none",
      "advancedMode": true,
      "fretboardSystem": "caged",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "key": "A",
      "shape": "E",
      "fretMin": 0,
      "fretMax": 19
    },
    "vary": [
      {
        "scale": "natural_minor",
        "key": "A"
      },
      {
        "scale": "major",
        "key": "C"
      },
      {
        "scale": "harmonic_minor",
        "key": "A"
      },
      {
        "key": "E"
      },
      {
        "scale": "harmonic_minor",
        "key": "D"
      }
    ],
    "tempoTiers": [
      46,
      58,
      70,
      82
    ]
  }
}
```
