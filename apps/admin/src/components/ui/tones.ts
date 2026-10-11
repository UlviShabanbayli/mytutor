/** Semantic tones shared by badges, overlays and stat cards; each maps to theme tokens. */
export type Tone = 'primary' | 'accent' | 'success' | 'destructive' | 'neutral';

export const badgeTone: Record<Tone, string> = {
  primary: 'bg-secondary text-secondary-foreground',
  accent: 'bg-accent-muted text-foreground',
  success: 'bg-success-muted text-success',
  destructive: 'bg-destructive-muted text-destructive',
  neutral: 'bg-muted text-muted-foreground',
};

export const dotTone: Record<Tone, string> = {
  primary: 'bg-primary',
  accent: 'bg-accent',
  success: 'bg-success',
  destructive: 'bg-destructive',
  neutral: 'bg-muted-foreground',
};

/** Region overlays on page images: outline, idle fill and selected fill. */
export const overlayTone: Record<Tone, { idle: string; active: string }> = {
  primary: { idle: 'border-primary/70 hover:bg-primary/10', active: 'bg-primary/20 ring-primary' },
  accent: { idle: 'border-accent/80 hover:bg-accent/10', active: 'bg-accent/25 ring-accent' },
  success: { idle: 'border-success/70 hover:bg-success/10', active: 'bg-success/20 ring-success' },
  destructive: {
    idle: 'border-destructive/70 hover:bg-destructive/10',
    active: 'bg-destructive/20 ring-destructive',
  },
  neutral: {
    idle: 'border-muted-foreground/60 hover:bg-muted-foreground/10',
    active: 'bg-muted-foreground/20 ring-muted-foreground',
  },
};
