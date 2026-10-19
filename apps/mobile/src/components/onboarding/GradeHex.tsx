import { Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { HexTile } from './HexTile';

type GradeHexProps = {
  grade: number;
  size: number;
  selected: boolean;
  onPress: () => void;
};

/** One cell of the honeycomb grade picker: the number in Unbounded and "sinif" under it. */
export function GradeHex({ grade, size, selected, onPress }: GradeHexProps) {
  const { t } = useTranslation();

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={t('common.grade', { count: grade, ordinal: true })}
      onPress={onPress}
      className="active:opacity-80"
    >
      <HexTile
        size={size}
        ring={selected ? 'honey-deep' : 'border'}
        fill={selected ? 'honey' : 'surf'}
        className="gap-0.5"
      >
        <Text
          className={cn('font-display-black text-2xl', selected ? 'text-on-honey' : 'text-ink')}
        >
          {String(grade)}
        </Text>
        <Text className={cn('font-sans-black text-2xs', selected ? 'text-on-honey' : 'text-muted')}>
          {t('onboarding.grade.cell')}
        </Text>
      </HexTile>
    </Pressable>
  );
}
