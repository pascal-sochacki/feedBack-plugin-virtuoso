---
id: file-chord_tone_targeting
title: Chord Tone Targeting
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 90
---

Generated pathway definition; notes are produced by the existing chord_scales exercise generator.

```json
{
  "pathway": {
    "goal": "Keep the key's scale, but watch the accents shift to chord tones as the progression moves. Trains chord-tone awareness inside familiar scale shapes.",
    "scales": [
      "major",
      "natural_minor",
      "dorian",
      "mixolydian"
    ],
    "base": {
      "practiceType": "chord_scales",
      "chordScaleStrategy": "chord_tone_emphasis",
      "scale": "major",
      "chordDepth": "seventh",
      "chordOverride": "auto",
      "meter": "4/4",
      "subdivision": "eighth",
      "bpm": 90,
      "bars": 8,
      "direction": "ascending",
      "sequence": "fours",
      "advancedMode": true,
      "fretboardSystem": "caged",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
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
