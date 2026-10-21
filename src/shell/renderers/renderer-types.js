/**
 * The contained renderer boundary, not the host's main-player API. Borrowed
 * renderers may expose additional methods; attachment owns those capabilities.
 * @typedef {Object} RenderNote
 * @property {number} t
 * @property {number} s
 * @property {number} f
 * @property {number} sus
 * @property {boolean} [mt]
 * @property {boolean} [pm]
 * @property {boolean} [ho]
 * @property {boolean} [po]
 * @property {boolean} [tp]
 * @property {boolean} [tr]
 * @property {number} [fg]
 * @property {number} [pkd]
 * @property {number} [rh]
 * @property {boolean} [slap]
 * @property {number} [sl]
 * @property {number} [bn]
 * @property {boolean} [vb]
 * @property {boolean} [hm]
 * @property {boolean} [hp]
 * @property {boolean} [ac]
 *
 * @typedef {Object} RenderBundle
 * @property {RenderNote[]} [notes]
 * @property {{time: number, fret: number, width: number}[]} [anchors]
 * @property {{time: number, measure: number}[]} [beats]
 * @property {number} [currentTime]
 * @property {number} [stringCount]
 * @property {boolean} [inverted]
 * @property {boolean} [lefty]
 * @property {import('../../core/generation-types.js').GenerationConfig} [config]
 * @property {number[]} [openMidis]
 * @property {{title?: string, duration?: number, arrangement?: string}} [songInfo]
 * @property {{t: number, id: number}[]} [chords]
 * @property {{displayName?: string, name?: string}[]} [chordTemplates]
 * @property {{time: number, name?: string}[]} [sections]
 * @property {number} [leadIn]
 * @property {(note: RenderNote) => string | {state: string} | null} [getNoteState]
 *
 * @typedef {Object} Renderer
 * @property {(canvas: HTMLCanvasElement, bundle?: RenderBundle) => void} init
 * @property {(bundle: RenderBundle) => void} draw
 * @property {() => void} [resize]
 * @property {() => void} [destroy]
 *
 * @typedef {() => Renderer} RendererFactory
 * @typedef {{factory: RendererFactory, label: string, kind?: string}} RendererSelection
 *
 * @typedef {Object} RenderTheme
 * @property {string} bg
 * @property {string} bgAlt
 * @property {string} ink
 * @property {string} inkSoft
 * @property {string} dim
 * @property {string} ledger
 * @property {string} noteFill
 * @property {string} noteOutline
 * @property {string} stem
 * @property {string} beam
 * @property {string} keysig
 * @property {string} accidental
 * @property {string} chordName
 * @property {string} sectionLabel
 * @property {string} hopo
 * @property {string} bend
 * @property {string} playhead
 * @property {string} faintLine
 *
 * Live entry-owned preferences, deliberately read at draw time rather than copied.
 * @typedef {{getRenderTheme: () => RenderTheme, handMarksOn: () => boolean}} DisplayPreferences
 * @typedef {{name: string, beats: number, filled: boolean, hasStem: boolean, flags: number}} NoteValue
 * @typedef {{beat: number, notes: RenderNote[]}} BeamGroup
 * @typedef {Renderer & {setMode: (mode: string) => void}} NotationRenderer
 */
export {};
