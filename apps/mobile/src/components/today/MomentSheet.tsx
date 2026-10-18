import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

type MomentSheetProps = {
  /** The dialog's name for screen readers. */
  title: string;
  onClose: () => void;
  children: ReactNode;
};

/**
 * A bottom sheet that is a whole route shown over "Bu gün" (a transparent modal screen):
 * scrim, 28pt top corners, grab handle. Unlike the `Sheet` primitive it draws no RN `Modal`,
 * whose web portal sits outside the theme's color variables and loses every color.
 */
export function MomentSheet({ title, onClose, children }: MomentSheetProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 justify-end">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.close')}
        onPress={onClose}
        className="absolute inset-0 bg-scrim"
      />
      <View
        accessibilityViewIsModal
        aria-modal
        role="dialog"
        aria-label={title}
        className="gap-3 rounded-t-3xl bg-surf px-5 pt-2.5"
        // The home indicator inset is device-specific, so it cannot be a static className.
        style={{ paddingBottom: insets.bottom + 20 }}
      >
        <View className="h-[5px] w-10 self-center rounded-full bg-border" />
        {children}
      </View>
    </View>
  );
}
