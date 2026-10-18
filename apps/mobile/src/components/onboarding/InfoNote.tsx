import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Icon, type IconName, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

type InfoNoteProps = {
  /** `info`: the blue explanation box; `honey`: the warm raised one. */
  tone?: 'info' | 'honey';
  icon?: IconName;
  /** Replaces the icon (the mascot on the age screen). */
  leading?: ReactNode;
  title?: string;
  text: string;
  className?: string;
};

/** A tinted box that explains a rule: "every grade stays open", "under 13…". */
export function InfoNote({
  tone = 'info',
  icon = 'info',
  leading,
  title,
  text,
  className,
}: InfoNoteProps) {
  return (
    <View
      className={cn(
        'flex-row gap-2.5 rounded-lg px-3.5 py-3',
        tone === 'info' ? 'bg-info-bg' : 'bg-raised',
        leading ? 'items-center' : 'items-start',
        className,
      )}
    >
      {leading ?? <Icon name={icon} size={20} color={tone === 'info' ? 'info' : 'honey-text'} />}
      <View className="flex-1 gap-0.5">
        {title ? <Text className="font-sans-black">{title}</Text> : null}
        <Text variant="caption" className={cn('text-ink', title && 'font-sans')}>
          {text}
        </Text>
      </View>
    </View>
  );
}
