---
id: file-melodic_metal_gallop
title: Melodic Metal Gallop
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 120
---

Generated pathway definition; notes are produced by the existing pedal_riff exercise generator.

```json
{
  "pathway": {
    "goal": "Galloping power chords (eighth + two sixteenths) over a minor/harmonic-minor key — the NWOBHM / power-metal engine. The gallop lives in the picking hand: down on the eighth, down-up on the sixteenths, palm muted. i–♭VI–♭VII root motion.",
    "scales": [
      "harmonic_minor",
      "natural_minor"
    ],
    "base": {
      "practiceType": "pedal_riff",
      "harmonize": false,
      "scale": "harmonic_minor",
      "anchor": "open_lowest",
      "anchorFret": 5,
      "meter": "4/4",
      "subdivision": "gallop",
      "bpm": 120,
      "bars": 8,
      "direction": "up_down",
      "advancedMode": true,
      "fretboardSystem": "position",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "progression": "metal_i_bVI_bVII",
      "chordOverride": "5",
      "fretMin": 0,
      "fretMax": 9
    },
    "vary": [
      {
        "subdivision": "gallop",
        "progression": "metal_i_bVI_bVII"
      },
      {
        "subdivision": "reverse_gallop",
        "progression": "metal_i_bVI_bVII"
      },
      {
        "scale": "natural_minor",
        "subdivision": "gallop"
      },
      {
        "progression": "metal_i_bVII_bVI_V",
        "subdivision": "gallop"
      }
    ],
    "tempoTiers": [
      90,
      120,
      150,
      180
    ]
  }
}
```
