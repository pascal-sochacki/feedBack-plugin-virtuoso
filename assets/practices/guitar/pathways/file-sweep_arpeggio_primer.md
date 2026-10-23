---
id: file-sweep_arpeggio_primer
title: Sweep Arpeggio Primer
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 70
genre: all-purpose
skill: advanced
applicability: guitar
---

Generated pathway definition; notes are produced by the existing sweep_arpeggios exercise generator.

```json
{
  "pathway": {
    "goal": "One chord tone per string, swept low-to-high with a hammer-on/pull-off turnaround at the apex, then swept back down. Root anchors the bass string. Start slow — sweeps reward cleanliness over speed.",
    "scales": [
      "natural_minor",
      "harmonic_minor",
      "major"
    ],
    "formCues": [
      "roll_dont_barre",
      "light_grip"
    ],
    "base": {
      "practiceType": "sweep_arpeggios",
      "scale": "natural_minor",
      "chordDepth": "triad",
      "chordOverride": "auto",
      "progression": "i-VI-III-VII",
      "meter": "4/4",
      "subdivision": "sixteenth",
      "bpm": 70,
      "bars": 8,
      "direction": "up_down",
      "sequence": "none",
      "advancedMode": true,
      "fretboardSystem": "caged",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "key": "A",
      "shape": "E"
    },
    "vary": [
      {
        "key": "A",
        "shape": "E"
      },
      {
        "key": "A",
        "shape": "A"
      },
      {
        "key": "D",
        "shape": "E"
      },
      {
        "key": "E",
        "shape": "E"
      },
      {
        "key": "G",
        "shape": "G"
      }
    ],
    "tempoTiers": [
      50,
      65,
      80,
      100
    ]
  }
}
```
