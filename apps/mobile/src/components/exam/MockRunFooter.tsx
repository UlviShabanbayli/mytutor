import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Icon } from '@/components/ui';
import { cn } from '@/lib/cn';

type MockRunFooterProps = {
  canGoBack: boolean;
  onPrev: () => void;
  onMap: () => void;
  onNext: () => void;
};

/** Previous question, the question map, next question (on the last one, the map to finish). */
export function MockRunFooter({ canGoBack, onPrev, onMap, onNext }: MockRunFooterProps) {
  const { t } = useTranslation();

  return (
    <View
      accessibilityLabel={t('exam.run.navA11y')}
      className="flex-row items-center gap-2 border-t border-border bg-surf px-4 pb-2 pt-2.5"
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('exam.run.prev')}
        accessibilityState={{ disabled: !canGoBack }}
        disabled={!canGoBack}
        onPress={onPrev}
        className={cn(
          'h-14 w-14 items-center justify-center rounded-lg border-2 border-border active:bg-wax',
          !canGoBack && 'opacity-40',
        )}
      >
        <Icon name="back" size={22} color="ink" />
      </Pressable>
      <Button
        variant="secondary"
        icon="grid"
        label={t('exam.run.map')}
        onPress={onMap}
        className="min-w-0 flex-1"
      />
      <Button label={t('exam.run.next')} onPress={onNext} />
    </View>
  );
}
