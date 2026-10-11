type SemanticColorName =
  | 'background'
  | 'foreground'
  | 'card'
  | 'card-foreground'
  | 'muted'
  | 'muted-foreground'
  | 'border'
  | 'input'
  | 'primary'
  | 'primary-foreground'
  | 'primary-pressed'
  | 'secondary'
  | 'secondary-foreground'
  | 'accent'
  | 'accent-foreground'
  | 'success'
  | 'success-foreground'
  | 'destructive'
  | 'destructive-foreground'
  | 'ring';

export type ColorSchemeName = 'light' | 'dark';
export type SemanticColors = Record<SemanticColorName, string>;

export declare const palette: Record<string, string>;
export declare const colors: Record<ColorSchemeName, SemanticColors>;
export declare const radius: Record<'sm' | 'md' | 'lg' | 'xl' | 'full', number>;
export declare const fontSize: Record<
  'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl',
  [number, number]
>;
export declare const touchTarget: number;
export declare const duration: Record<'fast' | 'normal' | 'slow', number>;
