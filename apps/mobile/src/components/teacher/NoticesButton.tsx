import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Sheet, Text } from '@/components/ui';
import { useReadNotices } from '@/features/teacher/mutations';
import { useNotices } from '@/features/teacher/queries';
import { useTeacherFormat } from '@/features/teacher/useTeacherFormat';
import type { TeacherNotice } from '@/features/teacher/types';

/**
 * The bell of the teacher tabs: a red dot while something is unread; the list opens in a sheet
 * and marks what it shows as read.
 */
export function NoticesButton() {
  const { t } = useTranslation();
  const f = useTeacherFormat();
  const notices = useNotices();
  const read = useReadNotices();
  const [open, setOpen] = useState(false);
  const items = notices.data ?? [];
  const unread = items.filter((n) => !n.read);

  const text = (n: TeacherNotice) => {
    switch (n.kind) {
      case 'question':
        return t('teacher.notifications.question', { name: n.name });
      case 'homework':
        return t('teacher.notifications.homework', { topic: n.topic, count: n.count });
      case 'verification':
        return t('teacher.notifications.verification');
    }
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('teacher.notifications.label', { count: unread.length })}
        onPress={() => {
          setOpen(true);
          if (unread.length > 0) read.mutate(unread.map((n) => n.id));
        }}
        className="h-[44px] w-[44px] items-center justify-center rounded-md border border-border bg-surf active:bg-wax"
      >
        <Icon name="bell" size={22} color="ink" />
        {unread.length > 0 ? (
          <View className="absolute right-2.5 top-2 h-[9px] w-[9px] rounded-full border-2 border-surf bg-err" />
        ) : null}
      </Pressable>
      <Sheet visible={open} onClose={() => setOpen(false)} title={t('teacher.notifications.title')}>
        <View className="gap-2">
          {items.length === 0 ? (
            <Text tone="muted">{t('teacher.notifications.empty')}</Text>
          ) : (
            items.map((n) => (
              <View
                key={n.id}
                accessible
                className="flex-row items-center gap-3 rounded-lg border border-border bg-page px-3 py-2.5"
              >
                <Icon
                  name={n.kind === 'question' ? 'chat' : n.kind === 'homework' ? 'edit' : 'shield'}
                  size={20}
                  color="honey-text"
                />
                <View className="min-w-0 flex-1">
                  <Text className="font-sans-bold">{text(n)}</Text>
                  <Text variant="caption" tone="muted">
                    {f.ago(new Date(n.at))}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </Sheet>
    </>
  );
}
