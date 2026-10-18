import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Icon, IconButton, ListRow, Sheet, StatusPill, Text } from '@/components/ui';
import type { TeacherMaterial } from '@/features/learn/types';
import { useLearnText } from '@/features/learn/useLearnText';

type MaterialCardProps = {
  material: TeacherMaterial;
  onOpen: () => void;
};

/** A teacher's video for the topic, with the teacher's name and a way to report it. */
export function MaterialCard({ material, onOpen }: MaterialCardProps) {
  const { t } = useLearnText();
  const [menu, setMenu] = useState(false);

  return (
    <View accessibilityLabel={t('learn.topic.materialGroup')} className="gap-2">
      <Text variant="overline" tone="muted" className="text-xs">
        {t('learn.topic.material', {
          teacher: material.teacherShort,
          className: material.className,
        })}
      </Text>
      <View className="flex-row items-center gap-3 rounded-lg border border-border bg-surf p-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('learn.topic.videoAria', {
            title: material.title,
            duration: material.duration,
          })}
          onPress={onOpen}
          className="h-[60px] w-[88px] items-center justify-center rounded-[12px] bg-spot active:opacity-80"
        >
          <Icon name="play" size={24} color="honey" />
          <Text className="absolute bottom-1 right-1.5 font-sans-black text-[10px] text-on-spot">
            {material.duration}
          </Text>
        </Pressable>
        <View className="min-w-0 flex-1 gap-0.5">
          <Text className="font-sans-black text-sm">{material.title}</Text>
          <Text className="text-xs" tone="muted">
            {t('learn.topic.materialMeta', {
              teacher: material.teacher,
              count: material.addedDaysAgo,
            })}
          </Text>
        </View>
        <IconButton
          icon="more"
          color="muted"
          accessibilityLabel={t('learn.topic.materialMore')}
          onPress={() => setMenu(true)}
        />
      </View>
      <Sheet visible={menu} onClose={() => setMenu(false)} title={t('learn.topic.materialSheet')}>
        {/* Reporting needs moderation (architecture P6); until then the row says "soon". */}
        <View accessible accessibilityState={{ disabled: true }} className="opacity-70">
          <ListRow
            icon="report"
            label={t('learn.topic.report')}
            accessory={<StatusPill kind="soon" label={t('learn.topic.reportSoon')} />}
          />
        </View>
      </Sheet>
    </View>
  );
}
