import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { HexCell, Text } from '@/components/ui';
import { Mascot } from '@/components/mascot/Mascot';
import { cn } from '@/lib/cn';

const FRAMES = ['opacity-90', 'opacity-75', 'opacity-60'];
const LINES = ['w-[63%]', 'w-[52%]', 'w-[42%]'];

/** The hive while it opens: frame placeholders, the flying mascot, an empty comb. */
export function HiveSkeleton() {
  const { t } = useTranslation();

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={t('learn.hive.loading')}
      className="gap-2.5"
    >
      {FRAMES.map((opacity, i) => (
        <View
          key={opacity}
          className={cn(
            'h-14 flex-row items-center gap-2.5 rounded-b-md rounded-t-[6px] border-[1.5px] border-slat-edge bg-slat px-3',
            opacity,
          )}
        >
          <HexCell state="not_started" size={32} />
          <View className="flex-1 gap-2">
            <View className={cn('h-[11px] rounded-full bg-wax', LINES[i])} />
            <View className="h-[9px] w-2/5 rounded-full bg-wax" />
          </View>
        </View>
      ))}
      <View className="flex-row items-center justify-center gap-2.5 py-2">
        <Mascot moment="loading" size={64} decorative />
        <Text tone="muted" className="font-sans-bold">
          {t('learn.hive.loading')}
        </Text>
      </View>
      <View className="items-center rounded-b-md rounded-t-[6px] border-[1.5px] border-slat-edge bg-slat pb-[18px] pt-3.5">
        <View>
          {['top', 'bottom'].map((row) => (
            <View
              key={row}
              className={cn('flex-row gap-1.5', row === 'bottom' && '-mt-3 pl-[35px]')}
            >
              {[0, 1, 2].map((n) => (
                <HexCell key={n} state="not_started" size={64} />
              ))}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
