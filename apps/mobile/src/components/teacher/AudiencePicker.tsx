import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Audience, RosterEntry } from '@mytutor/types';
import type { TeacherClass } from '@/features/teacher/types';
import { ChoiceChip } from './ChoiceChip';
import { Overline } from './Overline';
import { StudentPickSheet } from './StudentPickSheet';

type AudiencePickerProps = {
  cls: TeacherClass;
  members: RosterEntry[];
  value: Audience;
  onChange: (audience: Audience) => void;
};

/** "Kimə": the whole class, one of its groups, or picked students. */
export function AudiencePicker({ cls, members, value, onChange }: AudiencePickerProps) {
  const { t } = useTranslation();
  const [picking, setPicking] = useState(false);
  const picked = value.type === 'students' ? value.ids : [];

  return (
    <View className="gap-1.5">
      <Overline>{t('teacher.assign.to')}</Overline>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        accessibilityRole="radiogroup"
        accessibilityLabel={t('teacher.assign.to')}
        contentContainerClassName="gap-1.5"
      >
        <ChoiceChip
          label={t('teacher.assign.toClass', { class: cls.shortName })}
          selected={value.type === 'class'}
          onPress={() => onChange({ type: 'class' })}
        />
        {cls.groups.map((g) => (
          <ChoiceChip
            key={g.id}
            label={t('teacher.assignment.group', { name: g.name, count: g.memberIds.length })}
            selected={value.type === 'group' && value.groupId === g.id}
            onPress={() => onChange({ type: 'group', groupId: g.id })}
          />
        ))}
        <ChoiceChip
          label={
            picked.length > 0
              ? t('teacher.assignment.picked', { count: picked.length })
              : t('teacher.assign.pick')
          }
          selected={value.type === 'students'}
          onPress={() => setPicking(true)}
        />
      </ScrollView>
      <StudentPickSheet
        visible={picking}
        members={members}
        value={picked}
        onChange={(ids) => onChange({ type: 'students', ids })}
        onClose={() => {
          setPicking(false);
          if (picked.length === 0) onChange({ type: 'class' });
        }}
      />
    </View>
  );
}
