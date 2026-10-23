---
id: file-vl_guide_tones
title: Guide-Tone Lines
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 75
genre: all-purpose
skill: intermediate
applicability: guitar
---

Generated pathway definition; notes are produced by the existing guide_tones exercise generator.

```json
{
  "pathway": {
    "goal": "Drop the root and keep only the 3rd and 7th — the two notes that move the least and say the most. Through a ii–V–I they voice-lead by half-steps (the ♭7→3 resolution is the engine of the cadence). Two notes per chord, and you hear the changes.",
    "scales": [
      "major",
      "dorian",
      "mixolydian"
    ],
    "base": {
      "practiceType": "guide_tones",
      "scale": "major",
      "progression": "ii-V-I",
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
        "voices": "thirds_only"
      },
      {
        "voices": "sevenths_only"
      },
      {
        "voices": "both_alternating"
      },
      {
        "key": "F"
      },
      {
        "key": "Bb"
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
