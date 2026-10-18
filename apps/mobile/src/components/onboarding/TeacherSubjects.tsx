import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { SubjectId } from '@mytutor/types';
import { Text } from '@/components/ui';
import { ToggleChip } from './ToggleChip';

/** The subjects the design offers on the teacher's first step, in its order. */
const SUBJECTS = [
  'riyaziyyat',
  'fizika',
  'azerbaycan-dili',
  'ingilis-dili',
  'kimya',
  'biologiya',
  'tarix',
  'cografiya',
] as const satisfies readonly SubjectId[];

type TeacherSubjectsProps = {
  value: SubjectId[];
  onChange: (subjects: SubjectId[]) => void;
};

/** "Fənlər · bir neçəsini seç": the subjects a teacher teaches, any number of them. */
export function TeacherSubjects({ value, onChange }: TeacherSubjectsProps) {
  const { t } = useTranslation();
  const toggle = (id: SubjectId) =>
    onChange(value.includes(id) ? value.filter((s) => s !== id) : [...value, id]);

  return (
    <View className="gap-2">
      <Text variant="overline" tone="muted" className="text-xs">
        {t('onboarding.teacherStart.subjects')}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {SUBJECTS.map((id) => (
          <ToggleChip
            key={id}
            role="checkbox"
            label={t(`onboarding.teacherStart.subject.${id}`)}
            selected={value.includes(id)}
            onPress={() => toggle(id)}
          />
        ))}
      </View>
    </View>
  );
}
