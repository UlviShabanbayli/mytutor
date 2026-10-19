import { Pressable, View } from 'react-native';
import { Button, Icon, Text } from '@/components/ui';
import { Mascot } from '@/components/mascot/Mascot';
import { useLearnStore } from '@/features/learn/store';
import { useLearnText } from '@/features/learn/useLearnText';
import { cn } from '@/lib/cn';

type GradeEmptyProps = {
  grade: number;
  /** The profile's grade to go back to, when it is another one. */
  ownGrade: number | null;
  onBack: (grade: number) => void;
};

/** A grade with no textbooks yet: the thinking mascot, "notify me", back to own grade. */
export function GradeEmpty({ grade, ownGrade, onBack }: GradeEmptyProps) {
  const { t, grade: gradeText } = useLearnText();
  const on = useLearnStore((s) => s.notifyGrades.includes(grade));
  const toggle = useLearnStore((s) => s.toggleNotify);

  return (
    <View className="flex-1 items-center justify-center gap-3 px-2 pb-3">
      <Mascot moment="aiThinking" size={140} />
      <Text variant="heading" className="text-center">
        {t('learn.tab.emptyTitle', { grade: gradeText(grade) })}
      </Text>
      <Text tone="muted" className="text-center">
        {t('learn.tab.emptyBody')}
      </Text>
      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: on }}
        accessibilityLabel={t('learn.tab.notify')}
        accessibilityHint={t('learn.tab.notifyScope', { grade: gradeText(grade) })}
        onPress={() => toggle(grade)}
        className="mt-1.5 min-h-[64px] flex-row items-center gap-3 self-stretch rounded-[18px] border border-border bg-surf py-2.5 pl-3.5 pr-3"
      >
        <View className="h-[40px] w-[40px] items-center justify-center rounded-[12px] bg-raised">
          <Icon name="bell" size={22} color="honey-text" />
        </View>
        <View className="min-w-0 flex-1 gap-0.5">
          <Text className="font-sans-black text-base">{t('learn.tab.notify')}</Text>
          <Text variant="caption" tone="muted">
            {t('learn.tab.notifyScope', { grade: gradeText(grade) })}
          </Text>
        </View>
        <View
          className={cn(
            'h-[32px] w-[52px] justify-center rounded-full p-[3px]',
            on ? 'items-end bg-honey' : 'items-start bg-wax',
          )}
        >
          <View className="h-[26px] w-[26px] rounded-full bg-surf" />
        </View>
      </Pressable>
      {ownGrade !== null && ownGrade !== grade ? (
        <Button
          variant="secondary"
          size="md"
          icon="back"
          label={t('learn.tab.backToMyGrade', { grade: gradeText(ownGrade) })}
          onPress={() => onBack(ownGrade)}
          className="self-stretch"
        />
      ) : null}
    </View>
  );
}
