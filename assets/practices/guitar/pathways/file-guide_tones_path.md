---
id: file-guide_tones_path
title: Guide Tones
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
    "goal": "The 3rds and 7ths are what spell a chord — and they move by the smallest steps through a progression. Voice-lead just those two notes through a ii–V–I and you hear the changes with two notes per chord. The skill is voice leading: connecting chords by their closest tones. The spine of jazz comping and melodic soloing over changes.",
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
        "key": "F",
        "voices": "both_alternating"
      },
      {
        "key": "Bb",
        "voices": "both_alternating"
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
