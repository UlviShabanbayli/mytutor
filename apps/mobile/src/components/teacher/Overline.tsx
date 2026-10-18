import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';

type OverlineProps = { children: string; className?: string };

/** 11.5pt caps label above a field group ("NÖV", "KİMƏ"); `Text` writes the caps by language. */
export function Overline({ children, className }: OverlineProps) {
  return (
    <Text variant="overline" tone="muted" className={cn(className)}>
      {children}
    </Text>
  );
}
