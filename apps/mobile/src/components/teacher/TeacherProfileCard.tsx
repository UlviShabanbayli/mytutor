import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { initials } from '@/features/teacher/people';
import type { TeacherProfileView } from '@/features/teacher/types';
import { HexBadge } from './HexBadge';

type TeacherProfileCardProps = { profile: TeacherProfileView; classes: number; students: number };

/** The teacher's name, subject and the "Doğrulanıb" badge (dashed while under review). */
export function TeacherProfileCard({ profile, classes, students }: TeacherProfileCardProps) {
  const { t } = useTranslation();
  const v = profile.verification;
  const badge =
    v === 'verified'
      ? t('teacher.me.badgeVerified')
      : v === 'pending'
        ? t('teacher.me.badgePending')
        : t('teacher.me.badgeNone');

  return (
    <View className="flex-row items-center gap-3.5">
      <HexBadge
        size={64}
        tone="honey"
        label={initials(profile.name)}
        labelClassName="font-display-black text-lg"
      />
      <View className="min-w-0 flex-1 gap-1">
        <Text className="font-display-black text-md">{profile.name}</Text>
        <Text variant="caption" tone="muted" className="font-sans">
          {t('teacher.me.meta', {
            subject: profile.subject,
            grade: t('common.grade', { count: profile.grade, ordinal: true }),
            classes: t('teacher.classCount', { count: classes }),
            students: t('teacher.students', { count: students }),
          })}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={badge}
          disabled={v === 'verified'}
          onPress={() => router.push('/teacher/verify')}
          className={cn(
            'h-[30px] flex-row items-center gap-[5px] self-start rounded-full px-2.5',
            v === 'verified' ? 'bg-ok-bg' : 'border-[1.5px] border-dashed border-lock-ink',
          )}
        >
          <Icon name="shield" size={14} color={v === 'verified' ? 'ok' : 'lock-ink'} />
          <Text
            className={cn(
              'font-sans-black text-xs',
              v === 'verified' ? 'text-ok' : 'text-lock-ink',
            )}
          >
            {badge}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
