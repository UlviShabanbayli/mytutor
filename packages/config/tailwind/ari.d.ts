export type AriColorName =
  | 'page'
  | 'surf'
  | 'raised'
  | 'box'
  | 'slat'
  | 'slat-edge'
  | 'ink'
  | 'muted'
  | 'border'
  | 'honey'
  | 'honey-deep'
  | 'honey-text'
  | 'nectar'
  | 'on-nectar'
  | 'wax'
  | 'cap'
  | 'on-honey'
  | 'lock-ink'
  | 'info'
  | 'info-bg'
  | 'ok'
  | 'ok-bg'
  | 'err'
  | 'err-bg'
  | 'crystal'
  | 'crystal-ink'
  | 'sealed'
  | 'on-sealed'
  | 'spot'
  | 'on-spot'
  | 'spot-line'
  | 'shadow'
  | 'scrim';

export type ColorSchemeName = 'light' | 'dark';
export type AriColors = Record<AriColorName, string>;

/** The Tailwind preset (theme.extend with the tokens above). */
declare const preset: { theme: { extend: Record<string, unknown> } };
export default preset;

export declare const palette: Record<ColorSchemeName, AriColors>;
export declare const radius: Record<
  'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full',
  number
>;
export declare const fontSize: Record<
  '2xs' | 'xs' | 'sm' | 'base' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl',
  [number, number]
>;
export declare const fontFamily: Record<
  | 'regular'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'black'
  | 'display'
  | 'display-bold'
  | 'display-black',
  string
>;
export declare const touchTarget: number;
export declare const duration: Record<'fast' | 'normal' | 'slow' | 'celebrate', number>;
export declare function themeVars(scheme: ColorSchemeName): Record<string, string>;
