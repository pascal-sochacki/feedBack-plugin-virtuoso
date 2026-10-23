---
id: file-metal_lead_phrygian
title: Phrygian Lead Over a Vamp
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 105
genre: metal
skill: advanced
applicability: guitar
---

Generated pathway definition; notes are produced by the existing scale exercise generator.

```json
{
  "pathway": {
    "goal": "The metal/neoclassical LEAD color: E Phrygian over a static i–♭II vamp. The rhythm guitar pedals a heavy djent sixteenth chug on one tonal center — no changes to track, so pour everything into the MODE. The signature is the ♭2 (F natural): reach for it (and the ♭6, C) as TENSION, then drop a half-step down to the root or 5th — the \"Phrygian drop\" is the whole sound. Same 12th-fret box as the natural-minor rung with the 2nd flattened — one new note, a big new flavor. Stay up in the singing register; let the band stay low and heavy underneath.",
    "scales": [
      "phrygian",
      "harmonic_minor"
    ],
    "base": {
      "practiceType": "scale",
      "scale": "phrygian",
      "key": "E",
      "progression": "phrygian_vamp",
      "chordOverride": "5",
      "backingComp": "metal_pedal_16",
      "backingBass": "root_pump",
      "audioProfile": "djent",
      "meter": "4/4",
      "subdivision": "eighth",
      "bpm": 105,
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
        "scale": "harmonic_minor",
        "key": "E"
      },
      {
        "key": "A"
      },
      {
        "key": "D"
      }
    ],
    "tempoTiers": [
      90,
      105,
      115,
      125
    ]
  }
}
```
