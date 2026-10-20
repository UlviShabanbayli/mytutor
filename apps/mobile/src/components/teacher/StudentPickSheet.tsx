import { Pressable, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Sheet, Text } from '@/components/ui';
import { toggleId } from '@/features/teacher/testBuilder';
import type { RosterEntry } from '@mytutor/types';
import { CheckBox } from './CheckBox';

type StudentPickSheetProps = {
  visible: boolean;
  members: RosterEntry[];
  value: string[];
  onChange: (ids: string[]) => void;
  onClose: () => void;
};

/** "Şagird seç": tick the students an assignment goes to. */
export function StudentPickSheet({
  visible,
  members,
  value,
  onChange,
  onClose,
}: StudentPickSheetProps) {
  const { t } = useTranslation();

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={t('teacher.assign.pickSheet')}
      dragArea="handle"
    >
      <ScrollView className="max-h-[360px]" contentContainerClassName="gap-1">
        {members.map((m) => {
          const on = value.includes(m.personId);
          return (
            <Pressable
              key={m.personId}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              accessibilityLabel={m.name}
              onPress={() => onChange(toggleId(value, m.personId))}
              className="min-h-touch flex-row items-center gap-3 rounded-md px-2 active:bg-raised"
            >
              <CheckBox checked={on} />
              <Text className="flex-1 font-sans-bold">{m.name}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <View>
        <Button
          label={t('teacher.assign.pickDone')}
          disabled={value.length === 0}
          onPress={onClose}
        />
      </View>
    </Sheet>
  );
}
