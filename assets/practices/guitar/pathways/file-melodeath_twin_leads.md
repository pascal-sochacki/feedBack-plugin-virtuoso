---
id: file-melodeath_twin_leads
title: Melodic Death Twin Leads
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 90
genre: all-purpose
skill: intermediate
applicability: guitar
---

Generated pathway definition; notes are produced by the existing scale_thirds exercise generator.

```json
{
  "pathway": {
    "goal": "The Gothenburg signature: two guitars harmonized a 3rd apart, both voices sounding together over a minor key. Play the lower line cleanly first, then let the harmony ring with it. Natural and harmonic minor; tremolo-pick for the full melodeath feel.",
    "scales": [
      "natural_minor",
      "harmonic_minor"
    ],
    "formCues": [
      "roll_dont_barre"
    ],
    "base": {
      "practiceType": "scale_thirds",
      "harmonize": true,
      "tremolo": true,
      "scale": "natural_minor",
      "key": "E",
      "meter": "4/4",
      "subdivision": "eighth",
      "bpm": 90,
      "bars": 8,
      "direction": "up_down",
      "advancedMode": true,
      "fretboardSystem": "caged",
      "shape": "E",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d"
    },
    "vary": [
      {
        "practiceType": "scale_thirds",
        "harmonize": true,
        "scale": "natural_minor"
      },
      {
        "practiceType": "scale_sixths",
        "harmonize": true,
        "scale": "natural_minor"
      },
      {
        "practiceType": "scale_thirds",
        "harmonize": true,
        "scale": "harmonic_minor",
        "key": "D"
      },
      {
        "practiceType": "scale_thirds",
        "harmonize": true,
        "scale": "natural_minor",
        "subdivision": "gallop"
      }
    ],
    "tempoTiers": [
      80,
      100,
      120,
      140
    ]
  }
}
```
