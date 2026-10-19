import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FadeOut } from 'react-native-reanimated';
import { RiseIn, Text, TypingHexes } from '@/components/ui';
import { AnimatedView } from '@/components/ui/animated';
import { duration, useReducedMotionPref } from '@/motion';

/**
 * "Vızı düşünür… dərslikdə axtarır" with three pulsing honeycomb cells while the reply is
 * prepared (micro.typing B). The bubble rises in and fades out as the answer takes its place.
 */
export function TypingBubble() {
  const { t } = useTranslation();
  const reduced = useReducedMotionPref();

  return (
    <AnimatedView
      exiting={FadeOut.duration(reduced ? duration.reduced : duration.quick)}
      className="self-start"
    >
      <RiseIn
        from={8}
        className="rounded-xl rounded-bl-[4px] border border-border bg-surf px-3.5 py-3"
      >
        <View
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel={t('ask.chat.thinkingA11y')}
          accessibilityLiveRegion="polite"
          className="flex-row items-center gap-2.5"
        >
          <TypingHexes />
          <Text variant="caption" tone="muted" className="text-sm">
            {t('ask.chat.thinking')}
          </Text>
        </View>
      </RiseIn>
    </AnimatedView>
  );
}
