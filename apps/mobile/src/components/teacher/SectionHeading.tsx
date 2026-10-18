import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';

type SectionHeadingProps = { children: string; className?: string };

/** 17–18pt Unbounded section title ("Siniflərim", "Bu gün", "Qaralamalar"). */
export function SectionHeading({ children, className }: SectionHeadingProps) {
  return (
    <Text variant="heading" className={cn('text-md', className)}>
      {children}
    </Text>
  );
}
