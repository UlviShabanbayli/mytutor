import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';

type ReportButtonProps = { isNew: boolean; onPress: () => void };

/** The child card's raised honey "Hesabat" button with a "Yeni" pill for an unread report. */
export function ReportButton({ isNew, onPress }: ReportButtonProps) {
  const { t } = useTranslation();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isNew ? t('parent.kids.reportButtonNew') : t('parent.kids.reportButton')}
      onPress={onPress}
      className="flex-1 rounded-md bg-honey-deep pb-[3px]"
    >
      {({ pressed }) => (
        <View
          className={cn(
            'h-[48px] flex-row items-center justify-center gap-1.5 rounded-md bg-honey px-2',
            pressed && 'translate-y-[3px]',
          )}
        >
          <Text className="font-sans-black text-sm text-on-honey">
            {t('parent.kids.reportButton')}
          </Text>
          {isNew ? (
            // The design's light overlay on honey (allowed by the spec: rgba white 0.45).
            <View className="h-[20px] justify-center rounded-full bg-white/45 px-[7px]">
              <Text className="font-sans-black text-2xs text-on-honey">
                {t('parent.kids.newBadge')}
              </Text>
            </View>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}
