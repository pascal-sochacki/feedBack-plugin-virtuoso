---
id: file-harmonic_minor_exotic
title: Harmonic Minor Exotic
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 110
genre: all-purpose
skill: advanced
applicability: guitar
---

Generated pathway definition; notes are produced by the existing chord_scales exercise generator.

```json
{
  "pathway": {
    "goal": "The Yngwie / flamenco sound: harmonic minor over a minor progression, mode-of-the-moment with a dom7 on every chord so each bar lands the raised 7th — the leading tone that pulls outside the key. The skill is the exotic color and the V7→i resolution that defines neoclassical and Spanish playing.",
    "scales": [
      "harmonic_minor",
      "phrygian_dominant",
      "natural_minor"
    ],
    "base": {
      "practiceType": "chord_scales",
      "chordScaleStrategy": "mode_of_moment",
      "scale": "harmonic_minor",
      "chordDepth": "seventh",
      "chordOverride": "dom7",
      "progression": "i-VI-III-VII",
      "meter": "4/4",
      "subdivision": "sixteenth",
      "bpm": 110,
      "bars": 8,
      "direction": "up_down",
      "sequence": "fours",
      "advancedMode": true,
      "fretboardSystem": "caged",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "key": "A",
      "shape": "E"
    },
    "vary": [
      {
        "key": "A",
        "shape": "E"
      },
      {
        "key": "E",
        "shape": "E"
      },
      {
        "key": "D",
        "shape": "E"
      },
      {
        "key": "B",
        "shape": "E"
      }
    ],
    "tempoTiers": [
      70,
      95,
      115,
      140
    ]
  }
}
```
