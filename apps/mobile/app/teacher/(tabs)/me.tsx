import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MarketPreview } from '@/components/teacher/MarketPreview';
import { PrivacySheet } from '@/components/teacher/PrivacySheet';
import { SettingsGroup } from '@/components/teacher/SettingsGroup';
import { type SoonContent, SoonSheet } from '@/components/teacher/SoonSheet';
import { TeacherProfileCard } from '@/components/teacher/TeacherProfileCard';
import { TeacherScreen } from '@/components/teacher/TeacherScreen';
import { TeacherTabHeader } from '@/components/teacher/TeacherTabHeader';
import { ErrorState, Icon, IconButton, LoadingState, Text } from '@/components/ui';
import { useAppStore } from '@/features/app/appStore';
import { ROLE_HOME } from '@/features/app/roleHome';
import { useTeacherClasses, useTeacherProfile } from '@/features/teacher/queries';

/** The teacher's profile (design t-me): verification, market preview, income, roles, settings. */
export default function TeacherMeScreen() {
  const { t } = useTranslation();
  const profile = useTeacherProfile();
  const classes = useTeacherClasses();
  const setRole = useAppStore((s) => s.setRole);
  const [privacy, setPrivacy] = useState(false);
  const [soon, setSoon] = useState<SoonContent | null>(null);
  const openSettings = () => router.push('/me/settings');
  const students = classes.data?.reduce((sum, c) => sum + c.studentCount, 0) ?? 0;
  const p = profile.data;

  return (
    <TeacherScreen
      header={
        <TeacherTabHeader
          title={t('teacher.me.title')}
          action={
            <IconButton
              icon="settings"
              variant="outlined"
              accessibilityLabel={t('teacher.settings')}
              onPress={openSettings}
            />
          }
        />
      }
      contentClassName="gap-2.5"
    >
      {profile.isError ? (
        <ErrorState onRetry={() => void profile.refetch()} />
      ) : !p ? (
        <LoadingState />
      ) : (
        <>
          <TeacherProfileCard profile={p} classes={classes.data?.length ?? 0} students={students} />
          <MarketPreview
            profile={p}
            onEdit={() =>
              setSoon({
                title: t('teacher.soon.profileTitle'),
                body: t('teacher.soon.profileBody'),
              })
            }
          />
          <View className="flex-row gap-2">
            <View
              accessible
              className="min-w-0 flex-1 gap-0.5 rounded-lg border border-border bg-surf px-3 py-2.5"
            >
              <Text variant="overline" tone="muted">
                {t('teacher.me.income')}
              </Text>
              <Text className="font-display-black text-md">
                {p.listing.monthIncome === null
                  ? t('teacher.me.noPrice')
                  : t('teacher.me.price', { price: p.listing.monthIncome })}
              </Text>
              <Text className="font-sans text-2xs text-muted">{t('teacher.me.incomeNote')}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${t('teacher.me.asParent')}. ${t('teacher.me.asParentBody')}`}
              onPress={() => {
                setRole('parent');
                router.replace(ROLE_HOME.parent);
              }}
              className="min-w-0 flex-1 gap-0.5 rounded-lg bg-spot px-3 py-2.5 active:opacity-90"
            >
              <Icon name="users" size={20} color="honey" />
              <Text className="font-sans-black text-sm text-on-spot">
                {t('teacher.me.asParent')}
              </Text>
              <Text className="font-sans text-2xs text-on-spot opacity-80">
                {t('teacher.me.asParentBody')}
              </Text>
            </Pressable>
          </View>
          <SettingsGroup
            items={[
              { icon: 'bell', label: t('teacher.me.notifications'), onPress: openSettings },
              { icon: 'eye', label: t('teacher.me.privacy'), onPress: () => setPrivacy(true) },
              {
                icon: 'info',
                label: t('teacher.me.help'),
                onPress: () =>
                  setSoon({ title: t('teacher.soon.helpTitle'), body: t('teacher.soon.helpBody') }),
              },
            ]}
          />
        </>
      )}
      <PrivacySheet visible={privacy} onClose={() => setPrivacy(false)} />
      <SoonSheet content={soon} onClose={() => setSoon(null)} />
    </TeacherScreen>
  );
}
