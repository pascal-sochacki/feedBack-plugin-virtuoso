---
id: file-fs_spider_adjacent
title: Spider — Middle Strings
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 60
---

Generated pathway definition; notes are produced by the existing spider exercise generator.

```json
{
  "pathway": {
    "goal": "The fingerstyle spider (a teacher-handed warmup from our beta thread): one finger per fret, but EVERY note crosses between the D and G strings — first the treble string leads, then the bar mirrors and the bass string leads. Thumb takes every D-string note, index every G-string note, and everything RINGS — the crossing only counts if the previous note keeps sounding. The frame walks up the neck one fret per cycle and back. Start at the 5th fret where the stretches are kind.",
    "scales": [],
    "formCues": [
      "finger_proximity",
      "light_grip"
    ],
    "base": {
      "practiceType": "spider",
      "spiderPair": "adjacent",
      "chromaticPattern": "1342",
      "meter": "4/4",
      "subdivision": "quarter",
      "bpm": 60,
      "bars": 8,
      "direction": "up_down",
      "advancedMode": false,
      "fretboardSystem": "position",
      "stringSetup": "guitar_6_standard",
      "renderer": "highway_3d",
      "fretMin": 5,
      "fretMax": 12
    },
    "vary": [
      {
        "spiderPair": "adjacent",
        "chromaticPattern": "1342",
        "fretMin": 5,
        "fretMax": 12
      },
      {
        "spiderPair": "adjacent",
        "chromaticPattern": "1234",
        "fretMin": 5,
        "fretMax": 12
      },
      {
        "spiderPair": "adjacent",
        "chromaticPattern": "1324",
        "fretMin": 5,
        "fretMax": 12
      },
      {
        "spiderPair": "adjacent",
        "chromaticPattern": "4321",
        "fretMin": 5,
        "fretMax": 12
      },
      {
        "spiderPair": "adjacent",
        "chromaticPattern": "1342",
        "fretMin": 1,
        "fretMax": 8
      }
    ],
    "tempoTiers": [
      60,
      75,
      90,
      105
    ],
    "tempoTierSubdivs": [
      "quarter",
      "quarter",
      "quarter",
      "eighth"
    ]
  }
}
```
