import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { errorsLabel } from '@/features/exam/labels';
import type { ChainLink } from '@/features/exam/types';
import { cn } from '@/lib/cn';
import { HexTile, toneOfCell } from './HexTile';

type ChainLinkRowProps = {
  link: ChainLink;
  last: boolean;
};

/** One topic on a mistake's trail; the root, where the problem starts, is marked in red words. */
export function ChainLinkRow({ link, last }: ChainLinkRowProps) {
  const { t } = useTranslation();
  const grade = t('common.grade', { count: link.grade, ordinal: true });
  const level = t(`exam.levels.${link.state}`);
  const meta = link.root
    ? t('exam.weak.root')
    : t('exam.weak.linkMeta', { errors: errorsLabel(t, link.errors), level });

  return (
    <View accessible className="flex-row gap-2.5">
      <View className="w-9 items-center">
        <HexTile tone={link.root ? 'err' : toneOfCell(link.state)} size={34} label={link.topic} />
        <View
          className={cn('my-0.5 min-h-2.5 w-0.5 flex-1', last ? 'bg-transparent' : 'bg-border')}
        />
      </View>
      <View
        className={cn(
          'min-w-0 flex-1 gap-0.5',
          link.root ? 'mb-0.5 rounded-sm bg-err-bg px-2.5 py-2' : 'pb-2.5 pt-0.5',
        )}
      >
        <Text className="font-sans-black text-sm">
          {t('exam.weak.linkTitle', { title: link.title, grade })}
        </Text>
        <Text className={cn('font-sans-bold text-xs', link.root ? 'text-err' : 'text-muted')}>
          {meta}
        </Text>
        {link.root && link.rebuildWith ? (
          <Text tone="muted" className="text-xs">
            {t('exam.weak.rootNote', { grade, with: link.rebuildWith })}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
