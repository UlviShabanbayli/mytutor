import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, SwitchTrack, Text } from '@/components/ui';
import {
  AUDIENCES,
  type GrantKey,
  type PrivacyCategory,
  type PrivacyCell,
} from '@/features/me/privacy';
import { playCue } from '@/lib/cues';
import { cn } from '@/lib/cn';

const fixed = {
  yes: { box: 'bg-ok-bg', text: 'text-ok', icon: 'check', color: 'ok' },
  no: { box: 'bg-wax', text: 'text-lock-ink', icon: 'x', color: 'lock-ink' },
  part: { box: 'bg-raised', text: 'text-honey-text', icon: 'eye', color: 'honey-text' },
} as const;

type PrivacyRowProps = {
  category: PrivacyCategory;
  cells: PrivacyCell[];
  onToggle: (who: 'teacher' | 'parent', grant: GrantKey, on: boolean) => void;
};

/** One data category: what the teacher, a parent and other students see (fixed or a switch). */
export function PrivacyRow({ category, cells, onToggle }: PrivacyRowProps) {
  const { t } = useTranslation();
  const title = t(`me.privacy.categories.${category}`);

  return (
    <View
      accessibilityLabel={title}
      className="gap-1.5 rounded-lg border border-border bg-surf px-2.5 pb-2.5 pt-2"
    >
      <Text className="pl-0.5 font-sans-black text-sm">{title}</Text>
      <View className="flex-row gap-1.5">
        {cells.map((cell, j) => {
          const who = AUDIENCES[j] ?? 'students';
          const whoCaps = t(`me.privacy.who.${who}`);
          const whoName = t(`me.privacy.whoName.${who}`);
          if (cell.kind === 'switch') {
            const target = who === 'parent' ? 'parent' : 'teacher';
            return (
              <Pressable
                key={who}
                accessibilityRole="switch"
                accessibilityState={{ checked: cell.on }}
                accessibilityLabel={t('me.privacy.switchLabel', { category: title, who: whoName })}
                onPress={() => {
                  playCue('press');
                  onToggle(target, cell.grant, !cell.on);
                }}
                className={cn(
                  'min-h-touch flex-1 justify-center gap-0.5 rounded-[12px] border-2 bg-surf px-2 py-1',
                  cell.on ? 'border-honey' : 'border-border',
                )}
              >
                <Text className="font-sans-black text-[10px] tracking-[0.6px] opacity-85">
                  {whoCaps}
                </Text>
                <View className="flex-row items-center justify-between gap-1">
                  <Text
                    className={cn('font-sans-black text-xs', cell.on ? 'text-ink' : 'text-muted')}
                  >
                    {cell.on ? t('me.privacy.on') : t('me.privacy.off')}
                  </Text>
                  <SwitchTrack on={cell.on} size="mini" />
                </View>
              </Pressable>
            );
          }
          const s = fixed[cell.kind];
          const value = t(`me.privacy.words.${cell.word}`);
          return (
            <View
              key={who}
              accessible
              accessibilityLabel={t('me.privacy.cellLabel', {
                category: title,
                who: whoName,
                value,
              })}
              className={cn(
                'min-h-touch flex-1 justify-center gap-0.5 rounded-[12px] px-2 py-1',
                s.box,
              )}
            >
              <Text
                className={cn('font-sans-black text-[10px] tracking-[0.6px] opacity-85', s.text)}
              >
                {whoCaps}
              </Text>
              <View className="flex-row items-center gap-[3px]">
                <Icon name={s.icon} size={13} color={s.color} />
                <Text className={cn('flex-1 font-sans-black text-xs leading-[14px]', s.text)}>
                  {value}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
