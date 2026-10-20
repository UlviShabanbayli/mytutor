import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, IconButton, Text } from '@/components/ui';
import { materialMeta } from '@/features/me/format';
import type { ClassFeed } from '@/features/me/types';

type MaterialRowProps = {
  item: ClassFeed['materials'][number];
  reported: boolean;
  onOpen: () => void;
  onReport: () => void;
};

/** A material the teacher shared (a file or a lesson link), with "Şikayət et". */
export function MaterialRow({ item, reported, onOpen, onReport }: MaterialRowProps) {
  const { t } = useTranslation();
  const meta = materialMeta(t, item);

  return (
    <View className="flex-row items-center gap-1 rounded-lg border border-border bg-surf pl-3 pr-1">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${item.title}, ${meta}`}
        onPress={onOpen}
        className="min-h-14 flex-1 flex-row items-center gap-2.5"
      >
        <Icon
          name={item.kind === 'file' ? 'file' : item.kind === 'video' ? 'video' : 'book'}
          size={20}
          color="info"
        />
        <View className="flex-1 gap-px">
          <Text className="font-sans-bold text-sm">{item.title}</Text>
          <Text tone="muted" className="text-xs">
            {reported ? `${meta} · ${t('me.chat.reported')}` : meta}
          </Text>
        </View>
      </Pressable>
      <IconButton
        icon="more"
        color="muted"
        accessibilityLabel={t('me.classPage.materialOptions')}
        onPress={onReport}
      />
    </View>
  );
}
