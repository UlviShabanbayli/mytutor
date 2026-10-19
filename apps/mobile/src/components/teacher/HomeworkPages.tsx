import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Sheet, Text } from '@/components/ui';
import { LinedPage } from './LinedPage';

type HomeworkPagesProps = { name: string; pages: string[][] };

/** The handed-in pages side by side; a tap opens one large. */
export function HomeworkPages({ name, pages }: HomeworkPagesProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState<number | null>(null);
  const total = pages.length;

  return (
    <View accessibilityLabel={t('teacher.grade.pages')} className="flex-row gap-2">
      {pages.map((lines, i) => (
        <Pressable
          key={i}
          accessibilityRole="button"
          accessibilityLabel={t('teacher.grade.pageLabel', { name, index: i + 1 })}
          onPress={() => setOpen(i)}
          className="h-[150px] flex-1 overflow-hidden rounded-md border border-border bg-surf active:opacity-80"
        >
          <LinedPage lines={lines} />
          <View className="absolute bottom-1.5 right-1.5 h-[24px] flex-row items-center gap-1 rounded-[8px] bg-raised px-[7px]">
            <Icon name="search" size={13} color="ink" />
            <Text className="font-sans-black text-2xs">
              {t('teacher.grade.page', { index: i + 1, total })}
            </Text>
          </View>
        </Pressable>
      ))}
      {total === 1 ? <View className="flex-1" /> : null}
      <Sheet
        visible={open !== null}
        onClose={() => setOpen(null)}
        title={t('teacher.grade.pageSheet', { index: (open ?? 0) + 1, total })}
      >
        <View className="rounded-lg border border-border bg-surf pb-3">
          <LinedPage lines={pages[open ?? 0] ?? []} size="large" minLines={6} />
        </View>
      </Sheet>
    </View>
  );
}
