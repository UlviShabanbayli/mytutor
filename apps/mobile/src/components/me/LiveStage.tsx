import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, SourceLine, Text } from '@/components/ui';
import type { LiveSession } from '@/features/me/types';
import { cn } from '@/lib/cn';
import { Hex } from './Hex';

type LiveStageProps = { session: LiveSession };

/** The teacher's video tile (paused on a weak connection) and the shared board with its source. */
export function LiveStage({ session }: LiveStageProps) {
  const { t } = useTranslation();
  const weak = session.network === 'weak';

  return (
    <>
      <View
        accessible
        accessibilityLabel={`${t('me.live.teacherLabel')}: ${t('me.live.speaking', { name: session.teacher })}${weak ? `, ${t('me.live.videoPaused')}` : ''}`}
        className="h-[138px] items-center justify-center rounded-xl bg-spot"
      >
        <Hex width={64} fill="honey">
          <Text className="font-display-black text-lg text-on-honey">{session.initials}</Text>
        </Hex>
        <View className="absolute bottom-2.5 left-2.5 h-7 flex-row items-center gap-1.5 rounded-full bg-scrim px-2.5">
          <Icon name="volume" size={14} color="honey" />
          <Text className="font-sans-bold text-xs text-on-spot">
            {t('me.live.speaking', { name: session.teacher })}
          </Text>
        </View>
        {weak ? (
          <View className="absolute right-2.5 top-2.5 h-[26px] flex-row items-center gap-1 rounded-full bg-scrim px-2">
            <Icon name="pause" size={12} color="on-spot" />
            <Text className="font-sans-bold text-2xs text-on-spot">{t('me.live.videoPaused')}</Text>
          </View>
        ) : null}
      </View>
      <View
        accessibilityLabel={t('me.live.boardLabel')}
        className="min-h-[220px] flex-1 gap-2.5 rounded-xl border border-border bg-surf px-3.5 py-3"
      >
        <Text variant="overline" tone="muted">
          {t('me.live.board')}
        </Text>
        {session.board.lines.map((line) => (
          <Text
            key={line.text}
            className={cn(
              line.size === 'lg' ? 'font-sans-bold text-lg' : 'font-sans-semibold text-md',
              line.tone === 'honey' && 'text-honey-text',
              line.indent && 'pl-16',
            )}
          >
            {line.text}
          </Text>
        ))}
        <View className="ml-1 h-[3px] w-[120px] rounded-sm bg-honey" />
        <View className="flex-1" />
        <SourceLine source={session.source} />
      </View>
    </>
  );
}
