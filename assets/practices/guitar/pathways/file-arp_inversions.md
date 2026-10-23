---
id: file-arp_inversions
title: Arpeggio Inversions
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 85
genre: all-purpose
skill: intermediate
applicability: guitar
---

Generated pathway definition; notes are produced by the existing arpeggio_inversions exercise generator.

```json
{
  "pathway": {
    "goal": "The same seventh chord, started from each chord tone: root, 3rd, 5th, 7th. Inversions let you connect arpeggios up the neck and begin a line on any note — the difference between a stiff up-and-down arpeggio and one that flows into the next chord.",
    "scales": [
      "major",
      "natural_minor"
    ],
    "base": {
      "practiceType": "arpeggio_inversions",
      "scale": "major",
      "chordDepth": "seventh",
      "chordOverride": "auto",
      "meter": "4/4",
      "subdivision": "eighth",
      "bpm": 85,
      "bars": 8,
      "direction": "up_down",
      "sequence": "none",
      "advancedMode": true,
      "fretboardSystem": "position",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "key": "C",
      "fretMin": 0,
      "fretMax": 8
    },
    "vary": [
      {
        "key": "C",
        "scale": "major"
      },
      {
        "key": "A",
        "scale": "natural_minor"
      },
      {
        "key": "G",
        "scale": "major"
      },
      {
        "key": "D",
        "scale": "major"
      },
      {
        "key": "E",
        "scale": "natural_minor"
      }
    ],
    "tempoTiers": [
      60,
      85,
      105,
      125
    ]
  }
}
```
