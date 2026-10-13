import { colors } from './colors';
import { typography } from './typography';
import { effects } from './effects';
import { spacing, radii } from './spacing';

export const Theme = {
  colors,
  typography,
  effects,
  spacing,
  radii,
} as const;

export type ThemeType = typeof Theme;
