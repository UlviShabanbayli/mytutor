import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import { formatWhen } from '@/features/me/format';
import type { AssignmentDetail } from '@/features/me/types';

type SubmissionPreviewProps = { submission: AssignmentDetail['submission'] };

/** What the student handed in: photo thumbnails (lined paper until files load) and the time. */
export function SubmissionPreview({ submission }: SubmissionPreviewProps) {
  const { t } = useTranslation();

  return (
    <View className="gap-1.5">
      <View className="flex-row items-baseline justify-between">
        <Text accessibilityRole="header" className="font-sans-black text-base">
          {t('me.assignment.answerTitle')}
        </Text>
        {submission ? (
          <Text tone="muted" className="text-xs">
            {t('me.assignment.sentAt', { when: formatWhen(t, submission.sentAt) })}
          </Text>
        ) : null}
      </View>
      {submission ? (
        <View className="flex-row gap-2">
          {Array.from({ length: submission.photos }, (_, i) => (
            <View
              key={i}
              accessible
              accessibilityRole="image"
              accessibilityLabel={t('me.assignment.photo', { n: i + 1 })}
              className="h-[88px] w-[72px] justify-between overflow-hidden rounded-[12px] border border-border bg-surf p-1"
            >
              <View className="gap-2.5 pt-2.5">
                {[0, 1, 2, 3, 4].map((line) => (
                  <View key={line} className="h-px bg-border" />
                ))}
              </View>
              <View className="self-end">
                <Icon name="image" size={16} color="muted" />
              </View>
            </View>
          ))}
          <Text tone="muted" className="flex-1 self-center pl-1 text-sm">
            {t('me.assignment.photosNote', { count: submission.photos })}
          </Text>
        </View>
      ) : (
        <Text tone="muted" className="text-sm">
          {t('me.assignment.notSent')}
        </Text>
      )}
    </View>
  );
}
