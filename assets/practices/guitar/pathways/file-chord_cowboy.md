---
id: file-chord_cowboy
title: Cowboy Chords
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 85
---

Generated pathway definition; notes are produced by the existing strum_comp exercise generator.

```json
{
  "pathway": {
    "goal": "The open \"cowboy\" chords every song is built from — G, C, D, A, E, Em, Am — changed cleanly and in time over a real strum. The skill is the change itself: getting from one grip to the next without stuttering, and hearing the I–IV–V / I–V–vi–IV root motion (C→Am shares two notes; the open G rings into C). This is rhythm guitar's first language — the bones you take to any campfire.",
    "scales": [
      "major"
    ],
    "base": {
      "practiceType": "strum_comp",
      "scale": "major",
      "chordDepth": "triad",
      "chordOverride": "auto",
      "progression": "I-IV-V",
      "strumPattern": "folk_pop_ddu_udu",
      "voicingPosition": "open",
      "meter": "4/4",
      "subdivision": "eighth",
      "bpm": 85,
      "bars": 8,
      "direction": "up_down",
      "sequence": "none",
      "advancedMode": true,
      "fretboardSystem": "caged",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "key": "G"
    },
    "vary": [
      {
        "progression": "I-IV-V"
      },
      {
        "progression": "I-V-vi-IV"
      },
      {
        "progression": "vi-IV-I-V",
        "key": "C"
      },
      {
        "key": "A",
        "progression": "I-IV-V"
      },
      {
        "key": "D",
        "progression": "I-V-vi-IV"
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
