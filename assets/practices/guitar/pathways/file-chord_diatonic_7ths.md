---
id: file-chord_diatonic_7ths
title: The Harmonized Key
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 70
---

Generated pathway definition; notes are produced by the existing strum_comp exercise generator.

```json
{
  "pathway": {
    "goal": "Build the seventh chord on every degree of the key, in order: Imaj7 – ii m7 – iii m7 – IVmaj7 – V7 – vi m7 – vii m7♭5. Comping the whole harmonized scale teaches you which quality each degree wants — the map every progression is carved out of. Take the dorian variant and the IV turns dom7 (the bright modal carrier). Pick the nearest grip each time so the hand barely moves.",
    "scales": [
      "major",
      "dorian"
    ],
    "base": {
      "practiceType": "strum_comp",
      "scale": "major",
      "chordDepth": "seventh",
      "chordOverride": "auto",
      "progression": "diatonic_7ths",
      "strumPattern": "folk_pop_ddu_udu",
      "voicingPosition": "open",
      "meter": "4/4",
      "subdivision": "eighth",
      "bpm": 70,
      "bars": 7,
      "direction": "up_down",
      "sequence": "none",
      "advancedMode": true,
      "fretboardSystem": "caged",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "key": "C"
    },
    "vary": [
      {
        "key": "C"
      },
      {
        "key": "G"
      },
      {
        "scale": "dorian",
        "key": "D"
      },
      {
        "scale": "dorian",
        "key": "A"
      },
      {
        "key": "F"
      }
    ],
    "tempoTiers": [
      55,
      70,
      85,
      100
    ]
  }
}
```
