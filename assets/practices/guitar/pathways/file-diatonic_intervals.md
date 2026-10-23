---
id: file-diatonic_intervals
title: Thirds, Fourths & Fifths
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 55
---

Generated pathway definition; notes are produced by the existing scale exercise generator.

```json
{
  "pathway": {
    "goal": "Play the scale in leaps, not steps: thirds (1-3, 2-4…), then fourths and fifths. Skipping through the scale this way trains your ear to HEAR each interval and your hand to FIND it anywhere in the key — and stacking the diatonic 3rds IS the harmonized scale, every chord in the key. It stays diatonic, so it's locked to the key: change the key and the intervals follow. One leap per key sounds 'spicy' — the tritone (the ♭5 between the 4th and 7th degrees); that's the diatonic truth, not a wrong note. Start slow in one box and keep every leap dead even and in tune — speed comes after the ear does. Works the same on guitar or bass.",
    "scales": [
      "major",
      "natural_minor"
    ],
    "base": {
      "practiceType": "scale",
      "scale": "major",
      "meter": "4/4",
      "subdivision": "eighth",
      "bpm": 55,
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
      "fretMax": 7
    },
    "vary": [
      {
        "sequence": "thirds",
        "key": "G",
        "fretMin": 2,
        "fretMax": 7
      },
      {
        "sequence": "fourths",
        "key": "G",
        "fretMin": 2,
        "fretMax": 7
      },
      {
        "sequence": "fifths",
        "key": "G",
        "fretMin": 2,
        "fretMax": 7
      },
      {
        "sequence": "thirds",
        "key": "E",
        "fretMin": 0,
        "fretMax": 5
      },
      {
        "sequence": "fifths",
        "key": "E",
        "fretMin": 0,
        "fretMax": 5
      }
    ],
    "tempoTiers": [
      50,
      65,
      80,
      95
    ],
    "instAgnostic": true
  }
}
```
