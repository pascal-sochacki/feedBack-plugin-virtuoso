---
id: file-arp_seventh_shapes
title: Seventh Arpeggios
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 90
---

Generated pathway definition; notes are produced by the existing diatonic_arpeggios exercise generator.

```json
{
  "pathway": {
    "goal": "Spell every diatonic seventh chord as an arpeggio — maj7, m7, dom7, m7♭5 — and find each in the CAGED shapes. A seventh arpeggio is the chord laid out one note at a time; learn the shapes and you can outline any chord anywhere on the neck.",
    "scales": [
      "major",
      "natural_minor",
      "dorian"
    ],
    "base": {
      "practiceType": "diatonic_arpeggios",
      "scale": "major",
      "chordDepth": "seventh",
      "chordOverride": "auto",
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
      "key": "C",
      "shape": "E"
    },
    "vary": [
      {
        "shape": "E"
      },
      {
        "shape": "A"
      },
      {
        "shape": "G"
      },
      {
        "shape": "C"
      },
      {
        "shape": "D"
      }
    ],
    "tempoTiers": [
      65,
      90,
      110,
      130
    ]
  }
}
```
