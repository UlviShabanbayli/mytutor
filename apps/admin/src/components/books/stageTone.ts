import type { TopicStage } from '@/features/progress/stages';

/** Topic cells and step bars: one colour per stage, from "nothing yet" to "approved". */
export const stageFill: Record<TopicStage, string> = {
  none: 'bg-border text-muted-foreground',
  source: 'bg-primary/40 text-foreground',
  knowledge: 'bg-primary/80 text-primary-foreground',
  review: 'bg-accent text-accent-foreground',
  approved: 'bg-success text-success-foreground',
};

export const STAGE_ORDER: TopicStage[] = ['none', 'source', 'knowledge', 'review', 'approved'];
