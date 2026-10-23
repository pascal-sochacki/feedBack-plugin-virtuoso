---
id: file-triad_inversions
title: Triad Inversions
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 80
---

Generated pathway definition; notes are produced by the existing arpeggio_inversions exercise generator.

```json
{
  "pathway": {
    "goal": "The three inversions of a triad in one place — root position (1-3-5), first (3-5-1), second (5-1-3). The skill is hearing which chord tone is on TOP and recognizing the same triad in three shapes. This is how you find a chord anywhere on the neck and voice-lead smoothly between changes.",
    "scales": [
      "major",
      "natural_minor"
    ],
    "base": {
      "practiceType": "arpeggio_inversions",
      "scale": "major",
      "chordDepth": "triad",
      "chordOverride": "auto",
      "meter": "4/4",
      "subdivision": "eighth",
      "bpm": 80,
      "bars": 8,
      "direction": "up_down",
      "sequence": "none",
      "advancedMode": true,
      "fretboardSystem": "position",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "key": "C",
      "fretMin": 0,
      "fretMax": 7
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
        "key": "E",
        "scale": "natural_minor"
      },
      {
        "key": "D",
        "scale": "major"
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
