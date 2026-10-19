import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { formatDay } from '@/features/me/format';
import type { ParentLinkView } from '@/features/me/types';
import { Hex } from './Hex';

type LinkedParentCardProps = {
  parent: ParentLinkView;
  categories: number;
  onStop: () => void;
};

/** A linked parent: active since when, how many categories they see, and stopping the link. */
export function LinkedParentCard({ parent, categories, onStop }: LinkedParentCardProps) {
  const { t } = useTranslation();

  return (
    <View
      accessibilityLabel={t('me.parentLink.linkedLabel')}
      className="gap-2.5 rounded-[18px] border border-border bg-surf p-3"
    >
      <View className="flex-row items-center gap-3">
        <Hex width={40} fill="ok-bg">
          <Text className="font-sans-black text-base text-ok">{parent.name.charAt(0)}</Text>
        </Hex>
        <View className="flex-1 gap-0.5">
          <View className="flex-row items-center gap-1.5">
            <Text className="font-sans-black text-base">{parent.name}</Text>
            <View className="h-5 flex-row items-center gap-1 rounded-full bg-ok-bg px-[7px]">
              <View className="h-1.5 w-1.5 rounded-full bg-ok" />
              <Text className="font-sans-black text-2xs text-ok">{t('me.parentLink.active')}</Text>
            </View>
          </View>
          <Text tone="muted" className="text-sm">
            {t('me.parentLink.linkedMeta', {
              relation: t(`me.parentLink.relations.${parent.relation}`),
              date: formatDay(t, parent.since),
              count: categories,
            })}
          </Text>
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={onStop}
        className="min-h-11 items-center justify-center rounded-[12px] border-2 border-err-bg active:bg-err-bg"
      >
        <Text className="font-sans-black text-sm text-err">{t('me.parentLink.stop')}</Text>
      </Pressable>
    </View>
  );
}
