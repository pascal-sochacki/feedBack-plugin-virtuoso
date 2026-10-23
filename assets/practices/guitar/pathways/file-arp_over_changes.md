---
id: file-arp_over_changes
title: Arpeggios Over Changes
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 90
genre: all-purpose
skill: intermediate
applicability: guitar
---

Generated pathway definition; notes are produced by the existing progression_arpeggios exercise generator.

```json
{
  "pathway": {
    "goal": "Outline a progression: play each chord's arpeggio as the changes move (ii–V–I, then vi–ii–V–I). Chasing the arpeggio of the moment is the most direct way to spell the harmony in a solo — every note is a chord tone, so you're never wrong, only more or less melodic.",
    "scales": [
      "major",
      "dorian"
    ],
    "base": {
      "practiceType": "progression_arpeggios",
      "scale": "major",
      "chordDepth": "seventh",
      "chordOverride": "auto",
      "progression": "ii-V-I",
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
        "progression": "ii-V-I"
      },
      {
        "progression": "vi-ii-V-I"
      },
      {
        "key": "F",
        "progression": "ii-V-I"
      },
      {
        "key": "G",
        "progression": "I-V-vi-IV"
      },
      {
        "key": "A",
        "progression": "vi-IV-I-V"
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
