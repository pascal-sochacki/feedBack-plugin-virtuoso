---
id: file-arp_sweeps
title: Sweep Arpeggios
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 65
---

Generated pathway definition; notes are produced by the existing sweep_arpeggios exercise generator.

```json
{
  "pathway": {
    "goal": "The fast application: one chord tone per string, raked low-to-high with a hammer/pull turnaround at the apex, then back down. Sweep picking turns the arpeggio into a fluid cascade. Start slow — sweeps reward clean string-muting and hand-sync over speed.",
    "scales": [
      "natural_minor",
      "harmonic_minor",
      "major"
    ],
    "base": {
      "practiceType": "sweep_arpeggios",
      "scale": "natural_minor",
      "chordDepth": "triad",
      "chordOverride": "auto",
      "progression": "i-VI-III-VII",
      "meter": "4/4",
      "subdivision": "sixteenth",
      "bpm": 65,
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
