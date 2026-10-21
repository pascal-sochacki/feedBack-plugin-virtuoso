// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Christian Cowan
/** @type {Record<'guitar' | 'bass', Record<string, string>>} */
export const FORM_CUES = {
  guitar: {
    thumb_back: 'Thumb low on the back of the neck — it frees the fingers to arch onto their tips.',
    thumb_over: 'Let the thumb hook over the top — it anchors the grip a bend pushes against.',
    one_finger_per_fret: 'One finger per fret — let each finger own its fret instead of crawling.',
    light_grip: 'Press just hard enough for a clean note, then back off 10% — speed lives in a light grip.',
    finger_proximity: 'Keep idle fingers hovering low over the strings — distance is wasted time.',
    wrist_neutral: 'Keep the picking wrist straight and loose — the motion comes from the wrist, not the elbow.',
    anchor_palm: 'Rest the palm edge lightly at the bridge — an anchor, not a clamp.',
    pinky_bend_support: 'Bend with the ring finger and stack index + middle behind it — never the pinky alone.',
    guide_finger: 'On the shift, let a finger glide along the string — a rail, not a leap.',
    shoulder_drop: 'Check your shoulders — drop them and breathe; tension creeps up at speed.',
    barre_roll: 'Roll the barre finger slightly onto its bony edge — it takes less pressure than the flat pad.',
    roll_dont_barre: "Across same-fret strings, roll one fingertip joint by joint — don't flatten a barre."
  },
  bass: {
    one_two_four: 'Down low, finger 1-2-4 and skip the ring — the frets are too wide for one-per-fret.',
    floating_thumb: 'Let the thumb float and mute the strings it passes — the skipped string must stay silent.',
    strict_im: 'Alternate index and middle strictly — ghosts included; the motor never stops.',
    rake_descent: "Dropping to a lower string, let the same finger rake through — don't force the alternation.",
    bridge_neck_tone: 'Pluck near the bridge for punch, near the neck for fat — choose the tone on purpose.',
    pivot_dont_jump: 'Shift by pivoting the hand, not jumping it — and let an open string buy the move.',
    full_value: 'Hold every note its full length — a walking line breathes in the note-ends.',
    thumb_bounce: "Bounce the thumb off the string, don't bury it — the slap rings, the thud chokes.",
    pop_hook: 'Hook the popping finger lightly under the string — the snap comes from wrist rotation, not pulling.',
    relax_forearm: 'If the plucking forearm tightens, drop a tier — relaxation is the skill.'
  }
};
/** @type {Record<string, string[]>} */
export const FORM_CUE_RUNGS = {
  bend_drill:['pinky_bend_support','thumb_over'],
  sweep_arpeggio_primer:['roll_dont_barre','light_grip'],
  sweep_roll_apex:['roll_dont_barre','light_grip'], melodeath_twin_leads:['roll_dont_barre'],
  pick_tremolo:['wrist_neutral','anchor_palm'], pick_alternate:['wrist_neutral','anchor_palm'],
  pick_chromatic_16ths:['wrist_neutral','finger_proximity'], pick_economy:['wrist_neutral','light_grip'],
  pick_string_skip:['anchor_palm'], pick_herta:['light_grip','finger_proximity'], djent_herta_chug:['wrist_neutral','light_grip'],
  fs_pima_foundation:['light_grip'], fs_spider_adjacent:['finger_proximity','light_grip'],
  fs_spider_skip:['finger_proximity','light_grip'], fs_spider_wide:['finger_proximity','light_grip'],
  leg_hopo:['finger_proximity','light_grip'], leg_runs:['finger_proximity','light_grip'],
  tap_articulation:['finger_proximity','light_grip'], tap_cell:['finger_proximity','light_grip'],
  tap_cascade:['finger_proximity','light_grip'], tap_sevenths:['finger_proximity','light_grip'], tap_changes:['finger_proximity','light_grip'],
  major_scale_caged:['guide_finger'], whole_neck_freedom:['guide_finger']
};
/** @type {Record<string, string>} */
export const FORM_CUE_BANDS = {
  core_beginner:'light_grip', concept_picking:'wrist_neutral', concept_legato:'finger_proximity',
  concept_tapping:'finger_proximity', concept_rhythm:'anchor_palm'
};
