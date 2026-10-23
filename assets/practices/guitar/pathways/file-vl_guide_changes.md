---
id: file-vl_guide_changes
title: Guide Tones Through Changes
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 75
---

Generated pathway definition; notes are produced by the existing guide_tones exercise generator.

```json
{
  "pathway": {
    "goal": "Take the guide-tone line off the single cadence and through a full progression (vi–ii–V–I, then the Rhythm-Changes A section). Same skill — nearest-tone voice leading — sustained across a tune. This is what makes a solo or comp follow the changes instead of running scales over them.",
    "scales": [
      "major",
      "dorian"
    ],
    "base": {
      "practiceType": "guide_tones",
      "scale": "major",
      "progression": "vi-ii-V-I",
      "chordDepth": "seventh",
      "voices": "both_alternating",
      "meter": "4/4",
      "subdivision": "quarter",
      "bpm": 75,
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
        "progression": "vi-ii-V-I"
      },
      {
        "progression": "rhythm_changes_a"
      },
      {
        "key": "F",
        "progression": "vi-ii-V-I"
      },
      {
        "key": "Bb",
        "progression": "rhythm_changes_a"
      },
      {
        "key": "G",
        "progression": "vi-ii-V-I"
      }
    ],
    "tempoTiers": [
      55,
      75,
      95,
      115
    ]
  }
}
```
