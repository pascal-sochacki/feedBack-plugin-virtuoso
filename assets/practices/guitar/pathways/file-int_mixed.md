---
id: file-int_mixed
title: Interval Workout
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 60
genre: all-purpose
skill: intermediate
applicability: guitar
---

Generated pathway definition; notes are produced by the existing scale exercise generator.

```json
{
  "pathway": {
    "goal": "Own them all, by ear. Cycle thirds → fourths → fifths → sixths → arpeggios over a I-IV-V backing, so you're not just running shapes — you're HEARING each interval against a chord and using it to connect to the next chord tone. This is where the drill becomes music: the intervals you've banked turn into melodies and fills.",
    "scales": [
      "major",
      "natural_minor"
    ],
    "base": {
      "practiceType": "scale",
      "scale": "major",
      "meter": "4/4",
      "subdivision": "eighth",
      "bpm": 60,
      "bars": 8,
      "direction": "up_down",
      "sequence": "thirds",
      "advancedMode": true,
      "fretboardSystem": "caged",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "key": "G",
      "shape": "E",
      "fretMin": 2,
      "fretMax": 7,
      "progression": "I-IV-V",
      "chordDepth": "triad",
      "chordOverride": "auto"
    },
    "vary": [
      {
        "sequence": "thirds"
      },
      {
        "sequence": "fourths"
      },
      {
        "sequence": "fifths"
      },
      {
        "sequence": "sixths"
      },
      {
        "sequence": "broken_triads"
      }
    ],
    "tempoTiers": [
      60,
      75,
      90,
      105
    ],
    "instAgnostic": true
  }
}
```
