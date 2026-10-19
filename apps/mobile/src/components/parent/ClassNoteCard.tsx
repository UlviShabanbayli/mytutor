import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import { formatWhen } from '@/features/parent/format';
import type { ClassNote } from '@/features/parent/types';

type ClassNoteCardProps = { note: ClassNote };

/** A note the teacher sent to the whole class's parents ("Sinif qeydi · 7B"). */
export function ClassNoteCard({ note }: ClassNoteCardProps) {
  const { t } = useTranslation();
  const label = t('parent.messages.classNote', { className: note.className });
  const when = formatWhen(t, new Date(note.at), new Date());

  return (
    <View
      accessible
      accessibilityLabel={`${label}, ${when}: ${note.text}`}
      className="gap-1 rounded-lg bg-raised px-3 py-2.5"
    >
      <View className="flex-row items-center gap-1.5">
        <Icon name="users" size={14} color="honey-text" />
        <Text className="min-w-0 flex-1 font-sans-black text-2xs uppercase tracking-[0.9px] text-honey-text">
          {label}
        </Text>
        <Text className="font-sans-bold text-2xs text-muted">{when}</Text>
      </View>
      <Text className="text-sm leading-5">{note.text}</Text>
    </View>
  );
}
