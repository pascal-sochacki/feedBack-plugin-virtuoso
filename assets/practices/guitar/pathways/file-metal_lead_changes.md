---
id: file-metal_lead_changes
title: Lead Over the Band
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 100
---

Generated pathway definition; notes are produced by the existing scale exercise generator.

```json
{
  "pathway": {
    "goal": "Stop drilling riffs — SOLO over them. A full metal rhythm section chugs i–♭VI–♭VII (Em–C–D) underneath: double-tracked palm-muted power chords, a locked bass, drums. Your job is the lead — run E natural minor in the 12th-fret box, in time, and HEAR the band move under you. Every note of the box fits all three chords (it IS the key), so you can't hit a wrong note — the skill is phrasing in time and feeling the changes. Then start landing chord tones as each chord arrives (the root or 5th of the chord playing NOW). A clean lead tone over a heavy band is exactly how real metal lead practice sounds: the backing can be as detuned and heavy as you like — your lead stays in standard, up where it sings.",
    "scales": [
      "natural_minor",
      "harmonic_minor"
    ],
    "base": {
      "practiceType": "scale",
      "scale": "natural_minor",
      "key": "E",
      "progression": "metal_i_bVI_bVII",
      "chordOverride": "5",
      "backingComp": "metal_chug_8",
      "backingBass": "root_pump",
      "audioProfile": "metal",
      "meter": "4/4",
      "subdivision": "eighth",
      "bpm": 100,
      "bars": 8,
      "direction": "up_down",
      "sequence": "none",
      "advancedMode": true,
      "fretboardSystem": "position",
      "fretMin": 11,
      "fretMax": 15,
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "swing": "straight"
    },
    "vary": [
      {
        "key": "E"
      },
      {
        "key": "A"
      },
      {
        "scale": "harmonic_minor",
        "key": "E"
      },
      {
        "key": "G"
      }
    ],
    "tempoTiers": [
      80,
      100,
      110,
      120
    ]
  }
}
```
