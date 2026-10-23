---
id: file-pulse_muting
title: Pulse & Muting
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 60
genre: all-purpose
skill: intermediate
applicability: guitar
---

Generated pathway definition; notes are produced by the existing pedal_riff exercise generator.

```json
{
  "pathway": {
    "goal": "The foundation under everything: lock to the click and control the mute. A palm-muted pedal on your open lowest string chugs the beat while a tight power chord (root+5th) lands on each downbeat — straight feel first. The skill is the metronome relationship and both-hand muting (palm-mute + left-hand dampening), not the notes. The later steps move the pedal to a FRETTED root — a different mute: your fretting finger owns the note length. Own this and every riff sits in the pocket.",
    "scales": [
      "natural_minor",
      "minor_pentatonic"
    ],
    "base": {
      "practiceType": "pedal_riff",
      "harmonize": false,
      "scale": "natural_minor",
      "anchor": "open_lowest",
      "anchorFret": 0,
      "meter": "4/4",
      "subdivision": "eighth",
      "bpm": 60,
      "bars": 8,
      "direction": "up_down",
      "advancedMode": true,
      "fretboardSystem": "position",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "progression": "static_i",
      "chordOverride": "5",
      "swing": "straight",
      "drums": "none",
      "fretMin": 0,
      "fretMax": 5
    },
    "vary": [
      {
        "progression": "static_i",
        "subdivision": "eighth"
      },
      {
        "progression": "static_i",
        "anchorFret": 5
      },
      {
        "progression": "static_i",
        "anchorFret": 3
      },
      {
        "progression": "static_i",
        "subdivision": "sixteenth"
      }
    ],
    "tempoTiers": [
      50,
      65,
      80,
      95
    ]
  }
}
```
