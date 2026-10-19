import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { IconButton, Text } from '@/components/ui';
import { genitiveAz } from '@/features/parent/text';
import type { TeacherContact } from '@/features/parent/types';
import { HexAvatar } from './HexAvatar';
import { TeacherBadge } from './TeacherBadge';

type ChatHeaderProps = { contact: TeacherContact | null };

/** Thread header: back, the teacher's hexagon, name, "Müəllim" mark and whose teacher. */
export function ChatHeader({ contact }: ChatHeaderProps) {
  const { t } = useTranslation();
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/parent/messages'));

  return (
    <View className="flex-row items-center gap-2 border-b border-border px-2 pb-2 pt-1">
      <IconButton icon="back" accessibilityLabel={t('common.back')} onPress={goBack} />
      {contact ? (
        <>
          <HexAvatar name={contact.name} tone="info" size={40} />
          <View className="min-w-0 flex-1 gap-0.5">
            <View className="flex-row flex-wrap items-center gap-1.5">
              <Text accessibilityRole="header" className="font-sans-black">
                {contact.name}
              </Text>
              <TeacherBadge />
            </View>
            <Text numberOfLines={1} className="text-xs text-muted">
              {t('parent.messages.teacherOf', {
                classLabel: contact.classLabel,
                child: contact.childName,
                childGen: genitiveAz(contact.childName),
              })}
            </Text>
          </View>
        </>
      ) : null}
    </View>
  );
}
