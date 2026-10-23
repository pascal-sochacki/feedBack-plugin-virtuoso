---
id: file-power_chord_comping
title: Power-Chord Comping
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 80
genre: all-purpose
skill: intermediate
applicability: guitar
---

Generated pathway definition; notes are produced by the existing pedal_riff exercise generator.

```json
{
  "pathway": {
    "goal": "Power chords as harmony, not metal — root+5th dyads moving through a musical minor progression (i–♭VII–♭VI–♭VII) over a tonic pedal. The skill is changing power-chord shapes cleanly in time and hearing the root motion. Works in any tuning — the riff anchors on your lowest string; this is the chord vocabulary every rock and pop rhythm part is built from.",
    "scales": [
      "natural_minor",
      "minor_pentatonic",
      "major"
    ],
    "base": {
      "practiceType": "pedal_riff",
      "harmonize": false,
      "scale": "natural_minor",
      "anchor": "open_lowest",
      "anchorFret": 0,
      "meter": "4/4",
      "subdivision": "eighth",
      "bpm": 80,
      "bars": 8,
      "direction": "up_down",
      "advancedMode": true,
      "fretboardSystem": "position",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "progression": "i-VII-VI-VII",
      "chordOverride": "5",
      "swing": "straight",
      "drums": "none",
      "fretMin": 0,
      "fretMax": 7
    },
    "vary": [
      {
        "progression": "i-VII-VI-VII"
      },
      {
        "progression": "I-V-vi-IV",
        "scale": "major",
        "anchorFret": 3
      },
      {
        "progression": "i-VI-III-VII"
      },
      {
        "progression": "I-IV-V",
        "scale": "major",
        "anchorFret": 5
      }
    ],
    "tempoTiers": [
      60,
      80,
      100,
      120
    ]
  }
}
```
