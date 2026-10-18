import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, type IconName, PressableCard, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { Material, MaterialKind } from '@/features/teacher/types';
import { useTeacherFormat } from '@/features/teacher/useTeacherFormat';

const ICONS: Record<MaterialKind, IconName> = {
  lesson: 'book',
  video: 'video',
  test: 'list',
  question: 'edit',
};
const SIZE_KEYS = {
  lesson: 'teacher.create.sizeLesson',
  video: 'teacher.create.sizeVideo',
  test: 'teacher.create.sizeTest',
  question: 'teacher.create.sizeQuestion',
} as const;

type MaterialRowProps = { material: Material; onPress?: () => void };

/** A draft or a published material with its review state. */
export function MaterialRow({ material: m, onPress }: MaterialRowProps) {
  const { t } = useTranslation();
  const f = useTeacherFormat();
  const updated = new Date(m.updatedAt);
  const when =
    m.state === 'draft'
      ? f.ago(updated)
      : m.views !== undefined
        ? t('teacher.create.views', { count: m.views })
        : t('teacher.create.sentOn', { date: f.date(updated) });
  const meta = [t(`teacher.create.${m.kind}`), t(SIZE_KEYS[m.kind], { count: m.size }), when].join(
    ' · ',
  );
  const pill =
    m.state === 'in_review'
      ? {
          label: t('teacher.create.inReview'),
          icon: 'clock' as const,
          box: 'bg-raised',
          text: 'text-honey-text',
          color: 'honey-text' as const,
        }
      : m.state === 'approved'
        ? {
            label: t('teacher.create.approved'),
            icon: 'check' as const,
            box: 'bg-ok-bg',
            text: 'text-ok',
            color: 'ok' as const,
          }
        : m.state === 'class'
          ? {
              label: t('teacher.create.inClass'),
              icon: 'users' as const,
              box: 'bg-raised',
              text: 'text-honey-text',
              color: 'honey-text' as const,
            }
          : null;
  const body = (
    <>
      <View
        className={cn(
          'h-[38px] w-[38px] items-center justify-center rounded-md',
          m.state === 'draft' ? 'bg-wax' : 'bg-raised',
        )}
      >
        <Icon name={ICONS[m.kind]} size={20} color={m.state === 'draft' ? 'muted' : 'honey-text'} />
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        <Text className="font-sans-black">{m.title}</Text>
        <Text variant="caption" tone="muted" className="font-sans">
          {meta}
        </Text>
      </View>
      {pill ? (
        <View className={cn('h-[26px] flex-row items-center gap-1 rounded-full px-2', pill.box)}>
          <Icon name={pill.icon} size={14} color={pill.color} />
          <Text className={cn('font-sans-black text-xs', pill.text)}>{pill.label}</Text>
        </View>
      ) : (
        <Icon name="chevron" size={18} color="muted" />
      )}
    </>
  );
  const row = 'min-h-[60px] flex-row items-center gap-3 rounded-lg px-3 py-2';

  if (!onPress)
    return (
      <View accessible className={cn(row, 'border border-border bg-surf')}>
        {body}
      </View>
    );
  return (
    <PressableCard
      accessibilityLabel={`${m.title}. ${meta}`}
      onPress={onPress}
      className="rounded-lg"
      contentClassName={row}
    >
      {body}
    </PressableCard>
  );
}
