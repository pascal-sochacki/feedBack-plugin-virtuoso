---
id: file-rhy_single_string
title: Single-String Pulse
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 80
genre: all-purpose
skill: intermediate
applicability: guitar
---

Generated pathway definition; notes are produced by the existing rhythm_pulse exercise generator.

```json
{
  "pathway": {
    "goal": "Strip everything away: ONE palm-muted note on a low string, struck in a steady pulse against the click. With no fretting-hand variable, your picking hand IS the metronome — the most direct way to build rock-solid time. Quarters, then eighths, then sixteenths; keep every strike even and relaxed. Then tap a world-rhythm on the same one note — the tresillo (3-3-2), the son clave — and feel its TIME (a single line teaches the time of a feel, not the whole band). Or shift the pulse onto the upbeats for the reggae skank: play only the \"&\" and trust the empty downbeat — the hardest, most useful time skill is feeling the beat you do NOT play.",
    "scales": [
      "minor_pentatonic"
    ],
    "base": {
      "practiceType": "rhythm_pulse",
      "pulseAccent": 0,
      "pulseOffbeat": false,
      "scale": "minor_pentatonic",
      "anchor": "open_lowest",
      "anchorFret": 5,
      "meter": "4/4",
      "subdivision": "eighth",
      "bpm": 80,
      "bars": 8,
      "direction": "up_down",
      "sequence": "none",
      "advancedMode": true,
      "fretboardSystem": "caged",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "shape": "E"
    },
    "vary": [
      {
        "subdivision": "quarter"
      },
      {
        "subdivision": "eighth"
      },
      {
        "subdivision": "sixteenth"
      },
      {
        "subdivision": "tresillo"
      },
      {
        "subdivision": "son_clave"
      },
      {
        "subdivision": "quarter",
        "pulseOffbeat": true
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
