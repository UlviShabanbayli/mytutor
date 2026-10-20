import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Badge, Icon, type IconName, Text, useRaisedPress } from '@/components/ui';
import { minutesLabel } from '@/features/exam/labels';
import { stepHref } from '@/features/exam/links';
import type { PlanStep, StepKind } from '@/features/exam/types';
import { cn } from '@/lib/cn';
import { HexTile, type HexTone } from './HexTile';
import { StepReasonText } from './StepReasonText';

const kindIcon: Record<StepKind, IconName> = { review: 'refresh', lesson: 'play', test: 'list' };
const kindTone: Record<StepKind, HexTone> = { review: 'crystal', lesson: 'nectar', test: 'raised' };

type StepRowProps = {
  step: PlanStep;
  /** Show why the tutor chose the step (the plan screen does, the home preview does not). */
  showReason?: boolean;
  /** Offline, a downloaded step says so instead of offering to start. */
  offline?: boolean;
};

/** One plan step: type and minutes, the topic, and its state; a tap opens the work itself. */
export function StepRow({ step, showReason = false, offline = false }: StepRowProps) {
  const press = useRaisedPress({ depth: 2 });
  const { t } = useTranslation();
  const minutes = minutesLabel(t, step.minutes);
  const type = t(`exam.steps.name.${step.kind}`);
  const done = step.state === 'done';
  const saved = offline && step.saved && !done;
  const now = step.state === 'now' && !saved;
  const a11y = done ? 'exam.steps.a11yDone' : saved ? 'exam.steps.a11ySaved' : 'exam.steps.a11y';

  return (
    <Pressable
      onPressIn={press.pressIn}
      onPressOut={press.pressOut}
      accessibilityRole="button"
      accessibilityLabel={t(a11y, { type, title: step.title, minutes })}
      onPress={() => router.push(stepHref(step.target))}
      className={cn('rounded-lg pb-0.5', now ? 'bg-honey-deep' : 'bg-border')}
    >
      <Animated.View style={press.faceStyle}>
        <View
          className={cn(
            'min-h-[52px] flex-row items-center gap-2.5 rounded-lg px-2.5 py-1.5',
            now ? 'border-2 border-honey bg-raised' : 'border border-border bg-surf',
          )}
        >
          <HexTile
            tone={kindTone[step.kind]}
            size={38}
            icon={(ink) => <Icon name={kindIcon[step.kind]} size={18} color={ink} />}
          />
          <View className="min-w-0 flex-1 gap-0.5">
            <Text variant="overline" tone="muted">
              {`${t(`exam.steps.type.${step.kind}`)} · ${minutes}`}
            </Text>
            <Text className="font-sans-black text-sm">{step.title}</Text>
            {showReason ? <StepReasonText reason={step.reason} /> : null}
          </View>
          {done ? (
            <Badge tone="ok" icon="check" label={t('exam.steps.done')} className="self-center" />
          ) : null}
          {saved ? (
            <Badge
              tone="info"
              icon="download"
              label={t('exam.steps.saved')}
              className="self-center"
            />
          ) : null}
          {now ? (
            <View className="h-10 w-10 items-center justify-center rounded-md bg-honey">
              <Icon name="play" size={18} color="on-honey" />
            </View>
          ) : null}
          {step.state === 'next' && !saved ? <Icon name="chevron" size={20} color="muted" /> : null}
        </View>
      </Animated.View>
    </Pressable>
  );
}
