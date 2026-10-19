import { View } from 'react-native';
import { Icon, Text } from '@/components/ui';
import type { LessonHit } from '@/features/learn/search';
import { useLearnText } from '@/features/learn/useLearnText';
import { Highlighted } from './Highlighted';
import { SearchRow } from './SearchRow';

type LessonHitRowProps = { hit: LessonHit; query: string; onPress: () => void };

/** A board lesson or a teacher's video found by search. */
export function LessonHitRow({ hit, query, onPress }: LessonHitRowProps) {
  const { t } = useLearnText();
  const title = hit.kind === 'teacher' ? hit.material.title : hit.topic.title;
  const meta =
    hit.kind === 'teacher'
      ? t('learn.search.teacherMeta', {
          teacher: hit.material.teacherShort,
          className: hit.material.className,
          duration: hit.material.duration,
        })
      : t('learn.search.boardMeta', { number: hit.topic.number, minutes: hit.minutes });

  return (
    <SearchRow accessibilityLabel={`${title}. ${meta}`} onPress={onPress}>
      <View className="h-[44px] w-[44px] items-center justify-center rounded-[12px] bg-raised">
        <Icon name={hit.kind === 'teacher' ? 'users' : 'video'} size={20} color="honey-text" />
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        <Highlighted text={title} query={query} className="font-sans-black text-sm" />
        <Text className="text-xs" tone="muted">
          {meta}
        </Text>
      </View>
    </SearchRow>
  );
}
