import { Pressable, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Icon, Sheet, Text } from '@/components/ui';
import { ASK_SUBJECT_IDS, type AskSubjectId } from '@/features/ask/subjects';
import { cn } from '@/lib/cn';

type SubjectSheetProps = {
  visible: boolean;
  onClose: () => void;
  subjectId: AskSubjectId;
  grade: number;
  onSubject: (id: AskSubjectId) => void;
  onGrade: (grade: number) => void;
};

/** Every grade (5–11) is open; the profile grade is only where the choice starts. */
const GRADES = [5, 6, 7, 8, 9, 10, 11];

/** Which subject and grade the question belongs to (decides who can answer it). */
export function SubjectSheet({
  visible,
  onClose,
  subjectId,
  grade,
  onSubject,
  onGrade,
}: SubjectSheetProps) {
  const { t } = useTranslation();

  return (
    <Sheet visible={visible} onClose={onClose} title={t('ask.send.subjectSheet')} dragArea="handle">
      <ScrollView className="max-h-[360px]" contentContainerClassName="gap-1">
        <View accessibilityRole="radiogroup" accessibilityLabel={t('ask.send.subject')}>
          {ASK_SUBJECT_IDS.map((id) => {
            const selected = id === subjectId;
            return (
              <Pressable
                key={id}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                onPress={() => onSubject(id)}
                className={cn(
                  'min-h-touch flex-row items-center gap-3 rounded-md px-3',
                  selected ? 'bg-raised' : 'active:bg-wax',
                )}
              >
                <Text className="flex-1 font-sans-bold">{t(`ask.demo.subjects.${id}`)}</Text>
                {selected ? <Icon name="check" size={20} color="honey-text" /> : null}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <View className="gap-2">
        <Text variant="label" tone="muted">
          {t('ask.send.gradeTitle')}
        </Text>
        <View
          accessibilityRole="radiogroup"
          accessibilityLabel={t('ask.send.gradeTitle')}
          className="flex-row flex-wrap gap-2"
        >
          {GRADES.map((g) => {
            const selected = g === grade;
            return (
              <Pressable
                key={g}
                accessibilityRole="radio"
                accessibilityLabel={t('common.grade', { count: g, ordinal: true })}
                accessibilityState={{ checked: selected }}
                onPress={() => onGrade(g)}
                className={cn(
                  'min-h-touch min-w-touch items-center justify-center rounded-md border-2 px-2',
                  selected ? 'border-honey bg-raised' : 'border-border bg-surf',
                )}
              >
                <Text className="font-sans-black">{g}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <Button label={t('ask.send.done')} onPress={onClose} />
    </Sheet>
  );
}
