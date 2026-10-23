---
id: file-diatonic_triad_drill
title: Diatonic Triad Drill
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 100
---

Generated pathway definition; notes are produced by the existing diatonic_arpeggios exercise generator.

```json
{
  "pathway": {
    "goal": "Build the triad of every chord in the key, in order — the 7-chord lap. The skill is spelling each diatonic chord as an arpeggio and hearing the qualities change (minor, diminished, major…). This is how a scale becomes chord tones — the foundation of arpeggio soloing, and the entry to the Triads ladder.",
    "scales": [
      "natural_minor",
      "major",
      "harmonic_minor",
      "melodic_minor"
    ],
    "base": {
      "practiceType": "diatonic_arpeggios",
      "scale": "natural_minor",
      "chordDepth": "triad",
      "chordOverride": "auto",
      "meter": "4/4",
      "subdivision": "eighth",
      "bpm": 100,
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
        "key": "E",
        "shape": "E"
      },
      {
        "key": "D",
        "shape": "E"
      },
      {
        "key": "G",
        "shape": "G"
      },
      {
        "key": "C",
        "shape": "A"
      }
    ],
    "tempoTiers": [
      70,
      100,
      120,
      144
    ]
  }
}
```
