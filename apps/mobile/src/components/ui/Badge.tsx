import { View } from 'react-native';
import { cn } from '@/lib/cn';
import { Text } from './Text';

type BadgeTone = 'neutral' | 'primary' | 'accent' | 'success' | 'destructive';

const toneClasses: Record<BadgeTone, { box: string; text: string }> = {
  neutral: { box: 'bg-muted', text: 'text-muted-foreground' },
  primary: { box: 'bg-secondary', text: 'text-secondary-foreground' },
  accent: { box: 'bg-accent-muted', text: 'text-foreground' },
  success: { box: 'bg-success-muted', text: 'text-success' },
  destructive: { box: 'bg-destructive-muted', text: 'text-destructive' },
};

type BadgeProps = {
  label: string;
  tone?: BadgeTone;
  className?: string;
};

export function Badge({ label, tone = 'neutral', className }: BadgeProps) {
  const t = toneClasses[tone];
  return (
    <View className={cn('self-start rounded-full px-2.5 py-1', t.box, className)}>
      <Text variant="caption" className={cn('font-sans-bold', t.text)}>
        {label}
      </Text>
    </View>
  );
}
