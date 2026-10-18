import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, StatusPill, Text } from '@/components/ui';
import { useIsOnline } from '@/features/study/online';
import { writtenAnswer } from '@/features/study/steps';
import type { WrittenStep } from '@/features/study/types';
import { MAX_PHOTOS, useWrittenStore, type WrittenPhoto } from '@/features/study/writtenStore';
import { PhotoTile } from './PhotoTile';

type WrittenAnswerProps = {
  step: WrittenStep;
  checked: boolean;
  onChange: (answer: string) => void;
};

const NO_PHOTOS: WrittenPhoto[] = [];

/** A solution on paper: photos of it, who checks it and who sees it. */
export function WrittenAnswer({ step, checked, onChange }: WrittenAnswerProps) {
  const { t } = useTranslation();
  const online = useIsOnline();
  const photos = useWrittenStore((s) => s.photos[step.id] ?? NO_PHOTOS);
  const { add, retry, remove } = useWrittenStore.getState();
  const failed = photos.findIndex((p) => p.status === 'failed');

  // The session keeps how many photos went through; "Yoxlamaya göndər" needs at least one.
  const update = (change: () => void) => {
    change();
    const list = useWrittenStore.getState().photos[step.id] ?? NO_PHOTOS;
    onChange(writtenAnswer(list.filter((p) => p.status === 'sent').length));
  };

  return (
    <View className="gap-2.5">
      <View className="gap-2.5 rounded-xl border border-border bg-surf p-3">
        <View className="flex-row items-center gap-2">
          <Icon name="edit" size={18} color="honey-text" />
          <Text className="flex-1 font-sans-bold">{t('study.test.writtenTitle')}</Text>
        </View>
        <View className="flex-row flex-wrap gap-2.5">
          {photos.map((photo, i) => (
            <PhotoTile
              key={photo.id}
              photo={photo}
              number={i + 1}
              locked={checked}
              onRetry={() => update(() => retry(step.id, photo.id, online))}
              onRemove={() => update(() => remove(step.id, photo.id))}
            />
          ))}
          {checked || photos.length >= MAX_PHOTOS ? null : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('study.test.addPhoto')}
              onPress={() => update(() => add(step.id, online))}
              className="h-[116px] min-w-[92px] flex-1 items-center justify-center gap-1.5 rounded-md border-2 border-dashed border-border active:bg-wax"
            >
              <Icon name="camera" size={24} color="honey-text" />
              <Text className="font-sans-bold text-sm">{t('study.test.addPhoto')}</Text>
            </Pressable>
          )}
        </View>
        {failed >= 0 ? (
          <View accessibilityRole="alert" className="flex-row gap-2">
            <Icon name="warning" size={16} color="err" />
            <Text className="flex-1 text-sm text-err">
              {t('study.test.photoError', { n: failed + 1 })}
            </Text>
          </View>
        ) : null}
      </View>
      <View className="flex-row gap-2.5 rounded-lg bg-info-bg px-3 py-2.5">
        <Icon name="users" size={20} color="info" />
        <View className="min-w-0 flex-1 gap-1.5">
          <Text className="font-sans-bold text-sm">
            {t('study.test.reviewer', { name: step.reviewer })}
          </Text>
          <StatusPill kind="ai" label={t('study.test.aiPill')} className="bg-surf" />
          <Text variant="caption" tone="muted">
            {t('study.test.privacy', { name: step.reviewer })}
          </Text>
        </View>
      </View>
    </View>
  );
}
