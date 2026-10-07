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
  | 'primary-shadow'
  | 'secondary'
  | 'secondary-foreground'
  | 'accent'
  | 'accent-foreground'
  | 'accent-muted'
  | 'success'
  | 'success-foreground'
  | 'success-muted'
  | 'success-shadow'
  | 'destructive'
  | 'destructive-foreground'
  | 'destructive-muted'
  | 'destructive-shadow'
  | 'ring';

export type ColorSchemeName = 'light' | 'dark';
export type SemanticColors = Record<SemanticColorName, string>;

export declare const colors: Record<ColorSchemeName, SemanticColors>;
export declare const radius: Record<'sm' | 'md' | 'lg' | 'xl' | 'full', number>;
export declare const fontSize: Record<
  'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl',
  [number, number]
>;
export declare const fontFamily: Record<'regular' | 'medium' | 'bold' | 'black', string>;
export declare const touchTarget: number;
export declare const duration: Record<'fast' | 'normal' | 'slow', number>;
