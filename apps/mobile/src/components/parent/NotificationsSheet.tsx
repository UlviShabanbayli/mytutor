import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Sheet, Text } from '@/components/ui';
import { formatWhen } from '@/features/parent/format';
import { genitiveAz } from '@/features/parent/text';
import type { ParentNotification } from '@/features/parent/types';

type NotificationsSheetProps = {
  visible: boolean;
  onClose: () => void;
  items: ParentNotification[];
};

/** Recent parent notifications (P1 "Valideyn" group); each one opens its exact screen. */
export function NotificationsSheet({ visible, onClose, items }: NotificationsSheetProps) {
  const { t } = useTranslation();
  const now = new Date();

  const open = (n: ParentNotification) => {
    onClose();
    if (n.kind === 'weekly_report') {
      router.push({ pathname: '/parent/report/[childId]', params: { childId: n.childId } });
    } else {
      router.push({ pathname: '/parent/chat/[threadId]', params: { threadId: n.threadId } });
    }
  };

  return (
    <Sheet visible={visible} onClose={onClose} title={t('parent.notifications.title')}>
      {items.length === 0 ? (
        <Text tone="muted">{t('parent.notifications.empty')}</Text>
      ) : (
        <View className="gap-1">
          {items.map((n) => {
            const title =
              n.kind === 'weekly_report'
                ? t('parent.notifications.weeklyReport', {
                    name: n.childName,
                    nameGen: genitiveAz(n.childName),
                  })
                : t('parent.notifications.teacherMessage', { name: n.teacherName });
            const when = formatWhen(t, new Date(n.at), now);
            return (
              <Pressable
                key={n.id}
                accessibilityRole="button"
                accessibilityLabel={`${title}, ${when}`}
                onPress={() => open(n)}
                className="min-h-14 flex-row items-center gap-3 rounded-md px-2 active:bg-wax"
              >
                <View className="h-[36px] w-[36px] items-center justify-center rounded-[11px] bg-raised">
                  <Icon
                    name={n.kind === 'weekly_report' ? 'chart' : 'mail'}
                    size={18}
                    color="honey-text"
                  />
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="font-sans-bold">{title}</Text>
                  <Text variant="caption" tone="muted">
                    {when}
                  </Text>
                </View>
                <Icon name="chevron" size={18} color="muted" />
              </Pressable>
            );
          })}
        </View>
      )}
    </Sheet>
  );
}
