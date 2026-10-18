import { View } from 'react-native';
import { Icon, type IconName, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

type InfoCardProps = {
  icon: IconName;
  title?: string;
  body: string;
  /** `info`: a blue note; `error`: the plain reason something did not work (an alert). */
  tone?: 'info' | 'error';
  className?: string;
};

/** A soft-coloured card with an icon, a bold line and a short explanation. */
export function InfoCard({ icon, title, body, tone = 'info', className }: InfoCardProps) {
  const error = tone === 'error';
  return (
    <View
      accessibilityRole={error ? 'alert' : undefined}
      accessibilityLiveRegion={error ? 'assertive' : 'none'}
      className={cn(
        'flex-row items-start gap-3 rounded-lg px-3.5 py-3',
        error ? 'bg-err-bg' : 'bg-info-bg',
        className,
      )}
    >
      <Icon name={icon} size={22} color={error ? 'err' : 'info'} />
      <View className="min-w-0 flex-1 gap-0.5">
        {title ? (
          <Text className={cn('font-sans-black', error ? 'text-err' : 'text-ink')}>{title}</Text>
        ) : null}
        <Text variant="caption" className={cn('font-sans', error ? 'text-ink' : 'text-muted')}>
          {body}
        </Text>
      </View>
    </View>
  );
}
