import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';

type KickerProps = {
  children: string;
  tone?: 'muted' | 'honey';
  className?: string;
};

/** 12pt CAPS line above a title: "4.3 · CƏMİN VƏ FƏRQİN KUBU". */
export function Kicker({ children, tone = 'muted', className }: KickerProps) {
  return (
    <Text variant="overline" tone={tone} className={cn('text-xs', className)}>
      {children}
    </Text>
  );
}
