import { View } from 'react-native';
import { cn } from '@/lib/cn';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

type BadgeTone = 'neutral' | 'honey' | 'ok' | 'err' | 'info' | 'crystal';

const toneClasses: Record<
  BadgeTone,
  {
    box: string;
    text: string;
    icon: 'lock-ink' | 'honey-text' | 'ok' | 'err' | 'info' | 'crystal-ink';
  }
> = {
  neutral: { box: 'bg-wax', text: 'text-lock-ink', icon: 'lock-ink' },
  honey: { box: 'bg-raised', text: 'text-honey-text', icon: 'honey-text' },
  ok: { box: 'bg-ok-bg', text: 'text-ok', icon: 'ok' },
  err: { box: 'bg-err-bg', text: 'text-err', icon: 'err' },
  info: { box: 'bg-info-bg', text: 'text-info', icon: 'info' },
  crystal: { box: 'bg-crystal', text: 'text-crystal-ink', icon: 'crystal-ink' },
};

type BadgeProps = {
  label: string;
  tone?: BadgeTone;
  icon?: IconName;
  className?: string;
};

/** Small rounded label: status, count, "Hazırlanır". */
export function Badge({ label, tone = 'neutral', icon, className }: BadgeProps) {
  const t = toneClasses[tone];
  return (
    <View
      className={cn(
        'flex-row items-center gap-1 self-start rounded-full px-2.5 py-1',
        t.box,
        className,
      )}
    >
      {icon ? <Icon name={icon} size={12} color={t.icon} /> : null}
      <Text className={cn('font-sans-black text-xs', t.text)}>{label}</Text>
    </View>
  );
}
