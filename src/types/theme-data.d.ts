// SPDX-License-Identifier: AGPL-3.0-only
export interface CardTone {id: string; label: string; a: string; b: string}
export interface ThemeRecipe {
  id: string; label: string; role: string; mode: string; axes: string[];
  typography: {displayFamily: string; displayCase: string; tracking: string};
  shape: {controlRadius: number; panelRadius: number; borderWeight: number};
  material: {surface: string; treatment: string};
  motion: {ring: string; glow?: string; reducedMotion: string};
  stageFrame: {style: string; animated: boolean};
  preview: {surface: string; frame: string; text: string; a: string; b: string; radius: string; shadow: string};
  tones: CardTone[];
}
