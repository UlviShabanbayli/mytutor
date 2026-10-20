import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CodeFlash, CopyButton, Icon, Text } from '@/components/ui';
import { inviteLink, shareText } from '@/features/teacher/share';
import type { TeacherClass } from '@/features/teacher/types';

type InviteCodeCardProps = { cls: TeacherClass };

/** The new class's invite code on the inverted spot card: copy it or share the link. */
export function InviteCodeCard({ cls }: InviteCodeCardProps) {
  const { t } = useTranslation();
  const [flash, setFlash] = useState(0);
  const link = inviteLink(cls.inviteCode);
  const message = t('teacher.classNew.shareMessage', {
    class: cls.name,
    code: cls.inviteCode,
    link,
  });

  return (
    <View
      accessibilityLabel={t('teacher.classNew.codeLabel')}
      className="gap-2.5 rounded-xl bg-spot px-4 pb-4 pt-3.5"
    >
      <View className="flex-row items-center gap-2">
        <Icon name="check" size={16} color="honey" />
        <Text className="font-sans-black text-xs uppercase tracking-[0.9px] text-honey">
          {t('teacher.classNew.readyTitle')}
        </Text>
      </View>
      <CodeFlash flash={flash}>
        <Text
          selectable
          className="font-display-black text-[26px] leading-[32px] tracking-[1.3px] text-on-spot"
        >
          {cls.inviteCode}
        </Text>
      </CodeFlash>
      <View className="flex-row items-center gap-1.5 opacity-85">
        <Icon name="link" size={16} color="on-spot" />
        <Text selectable numberOfLines={1} className="flex-1 font-sans text-sm text-on-spot">
          {link}
        </Text>
      </View>
      <View className="flex-row gap-2">
        <CopyButton
          text={cls.inviteCode}
          label={t('teacher.classNew.copy')}
          copiedLabel={t('teacher.classNew.copied')}
          onCopied={() => setFlash((n) => n + 1)}
          className="flex-1"
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => void shareText(message)}
          className="h-[44px] flex-1 flex-row items-center justify-center gap-1.5 rounded-md border-2 border-spot-line active:opacity-70"
        >
          <Icon name="send" size={18} color="on-spot" />
          <Text className="font-sans-black text-sm text-on-spot">
            {t('teacher.classNew.shareLink')}
          </Text>
        </Pressable>
      </View>
      <Text variant="caption" className="font-sans text-on-spot opacity-80">
        {t('teacher.classNew.readyNote')}
      </Text>
    </View>
  );
}
