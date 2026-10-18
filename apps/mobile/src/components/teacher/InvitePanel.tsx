import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { phoneNumberSchema } from '@mytutor/schemas';
import { IconButton, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useInviteByPhone } from '@/features/teacher/queries';
import { copyText, inviteLink, shareText } from '@/features/teacher/share';
import type { TeacherClass } from '@/features/teacher/types';
import { useThemeColors } from '@/theme';
import { SmallButton } from './SmallButton';

type InvitePanelProps = { cls: TeacherClass };

/** "Dəvət et": the class code with copy and share, and an invite by phone (SMS from the API). */
export function InvitePanel({ cls }: InvitePanelProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const invite = useInviteByPhone();
  const [copied, setCopied] = useState(false);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const link = inviteLink(cls.inviteCode);

  const send = () => {
    const parsed = phoneNumberSchema.safeParse(phone);
    if (!parsed.success) {
      setError(t('teacher.members.phoneError'));
      return;
    }
    invite.mutate(
      { classId: cls.id, phone: parsed.data },
      {
        onSuccess: () => {
          setSent(parsed.data);
          setPhone('');
        },
      },
    );
  };

  return (
    <View
      accessibilityLabel={t('teacher.members.invite')}
      className="gap-2.5 rounded-xl border border-border bg-surf px-3.5 py-3"
    >
      <View className="flex-row items-center gap-2">
        <View className="min-w-0 flex-1 gap-px">
          <Text variant="overline" tone="muted">
            {t('teacher.members.code')}
          </Text>
          <Text selectable className="font-display-black text-md tracking-[0.7px]">
            {cls.inviteCode}
          </Text>
        </View>
        <SmallButton
          variant="outline"
          label={copied ? t('teacher.members.copied') : t('teacher.members.copy')}
          onPress={() => void copyText(cls.inviteCode).then(setCopied)}
        />
        <IconButton
          icon="link"
          variant="outlined"
          accessibilityLabel={t('teacher.members.shareLink')}
          onPress={() =>
            void shareText(
              t('teacher.classNew.shareMessage', { class: cls.name, code: cls.inviteCode, link }),
            )
          }
        />
      </View>
      <View className="gap-1.5">
        <Text variant="caption" tone="muted" className="font-sans-bold">
          {t('teacher.members.phone')}
        </Text>
        <View className="flex-row gap-2">
          <TextInput
            value={phone}
            onChangeText={(v) => {
              setPhone(v);
              setError(null);
              setSent(null);
            }}
            accessibilityLabel={t('teacher.members.phone')}
            accessibilityHint={error ?? undefined}
            placeholder={t('teacher.members.phonePlaceholder')}
            placeholderTextColor={colors.muted}
            keyboardType="phone-pad"
            autoComplete="tel"
            onSubmitEditing={send}
            className={cn(
              'h-[44px] min-w-0 flex-1 rounded-md border-2 bg-page px-3 font-sans-semibold text-base text-ink',
              error ? 'border-err' : 'border-border',
            )}
          />
          <SmallButton
            label={t('teacher.members.phoneSend')}
            onPress={send}
            disabled={invite.isPending}
          />
        </View>
        {error ? (
          <Text variant="label" tone="err" accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : sent ? (
          <Text variant="label" tone="ok" accessibilityLiveRegion="polite">
            {t('teacher.members.phoneSent', { phone: sent })}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
