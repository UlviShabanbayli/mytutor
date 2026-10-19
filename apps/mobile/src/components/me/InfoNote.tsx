import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Icon, type IconName, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { ColorName } from '@/theme';

type InfoNoteTone = 'info' | 'ok' | 'raised';

const tones: Record<InfoNoteTone, { box: string; icon: ColorName }> = {
  info: { box: 'bg-info-bg', icon: 'info' },
  ok: { box: 'bg-ok-bg', icon: 'ok' },
  raised: { box: 'bg-raised', icon: 'honey-text' },
};

type InfoNoteProps = {
  icon: IconName;
  tone?: InfoNoteTone;
  /** Bold first sentence (design: "İrəliləyişin bu telefonda saxlanır."). */
  lead?: string;
  /** The rest of the note, or rich text (Trans) when it has bold words inside. */
  children?: ReactNode;
  /** A quiet second line under the note. */
  caption?: string;
  /** Polite announcement for notes that report a state (privacy, plan). */
  status?: boolean;
  className?: string;
};

/** A soft tinted note with an icon: privacy promises, plan status, anonymous comparison. */
export function InfoNote({
  icon,
  tone = 'info',
  lead,
  children,
  caption,
  status = false,
  className,
}: InfoNoteProps) {
  const t = tones[tone];
  return (
    <View
      accessible
      accessibilityRole={status ? 'summary' : undefined}
      className={cn('flex-row items-center gap-2.5 rounded-lg px-3 py-2.5', t.box, className)}
    >
      <Icon name={icon} size={22} color={t.icon} />
      <View className="flex-1 gap-0.5">
        <Text className="text-sm leading-[19px] text-ink">
          {lead ? <Text className="font-sans-black text-sm text-ink">{lead}</Text> : null}
          {children}
        </Text>
        {caption ? (
          <Text variant="caption" tone="muted" className="text-xs">
            {caption}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
