---
id: chromatic-warmup
title: Chromatic warm-up
instrument: guitar
tuning: standard
meter: 4/4
referenceTempo: 60
genre: all-purpose
skill: beginner
applicability: guitar
---
# Chromatic warm-up

Build clean finger placement on the low E string. Choose the first-position
or fifth-position variant, one note per beat. Keep your wrist comfortable and
press only as hard as needed.

- Use index, middle, ring and pinky in order if the reach is comfortable.
- Listen for four clear attacks. Release each note before the next attack.
- Start at 60 BPM; use the existing tempo control for a slower or faster pass.

The four-second chart includes the final beat after the fourth attack. Zero
sustain means an attack target, not an inferred one-beat sustain. The reference
tempo stays 60 BPM even when playback tempo changes. No backing is added.

```json
{
  "variants": [
    {
      "id": "first-position",
      "title": "First position — frets 1–4",
      "hint": "Low E: index on fret 1, then middle, ring and pinky. Use a comfortable reach.",
      "duration": 4,
      "notes": [
        { "t": 0, "s": 0, "f": 1, "sus": 0, "fg": 1, "pkd": 0 },
        { "t": 1, "s": 0, "f": 2, "sus": 0, "fg": 2, "pkd": 1 },
        { "t": 2, "s": 0, "f": 3, "sus": 0, "fg": 3, "pkd": 0 },
        { "t": 3, "s": 0, "f": 4, "sus": 0, "fg": 4, "pkd": 1 }
      ]
    },
    {
      "id": "fifth-position",
      "title": "Fifth position — frets 5–8",
      "hint": "Low E: move the same four fingers to frets 5–8. Alternate down and up strokes.",
      "duration": 4,
      "notes": [
        { "t": 0, "s": 0, "f": 5, "sus": 0, "fg": 1, "pkd": 0 },
        { "t": 1, "s": 0, "f": 6, "sus": 0, "fg": 2, "pkd": 1 },
        { "t": 2, "s": 0, "f": 7, "sus": 0, "fg": 3, "pkd": 0 },
        { "t": 3, "s": 0, "f": 8, "sus": 0, "fg": 4, "pkd": 1 }
      ]
    }
  ]
}
```

Original prototype lesson content, 2026 Pascal Sochacki. AGPL-3.0-only.
