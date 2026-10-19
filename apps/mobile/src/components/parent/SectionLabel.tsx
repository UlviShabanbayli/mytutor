import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';

type SectionLabelProps = { children: string; className?: string };

/** 12pt CAPS section title in muted ink ("ÇƏRÇİVƏLƏR"); `Text` writes the capitals. */
export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <Text
      accessibilityRole="header"
      className={cn('font-sans-black text-xs uppercase tracking-[0.9px] text-muted', className)}
    >
      {children}
    </Text>
  );
}
