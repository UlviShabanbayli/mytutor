import { Pressable, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import type { WrittenPhoto } from '@/features/study/writtenStore';
import { useThemeColors } from '@/theme';

type PhotoTileProps = {
  photo: WrittenPhoto;
  /** 1-based position, for "Şəkil 2". */
  number: number;
  locked: boolean;
  onRetry: () => void;
  onRemove: () => void;
};

/** A sent page (with a check) or a failed one (with "Yenidən"); both can be removed. */
export function PhotoTile({ photo, number, locked, onRetry, onRemove }: PhotoTileProps) {
  const { t } = useTranslation();
  const c = useThemeColors();
  const remove = locked ? null : (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('study.test.photoRemove', { n: number })}
      onPress={onRemove}
      hitSlop={10}
      className="absolute right-1 top-1 h-6 w-6 items-center justify-center rounded-full bg-spot"
    >
      <Icon name="close" size={14} color="on-spot" />
    </Pressable>
  );

  if (photo.status === 'failed') {
    return (
      <View className="h-[116px] w-[92px] items-center justify-center gap-1.5 rounded-md border-2 border-err bg-err-bg">
        <Icon name="warning" size={22} color="err" />
        <Text className="font-sans-black text-xs text-err">
          {t('study.test.photoFailed', { n: number })}
        </Text>
        {locked ? null : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('study.test.photoRetryAria', { n: number })}
            onPress={onRetry}
            hitSlop={6}
            className="h-8 flex-row items-center gap-1 rounded-sm bg-err px-2.5"
          >
            <Icon name="refresh" size={14} color="err-bg" />
            <Text className="font-sans-black text-xs text-err-bg">
              {t('study.test.photoRetry')}
            </Text>
          </Pressable>
        )}
        {remove}
      </View>
    );
  }

  return (
    <View
      accessible
      accessibilityLabel={t('study.test.photoSent', { n: number })}
      className="h-[116px] w-[92px] overflow-hidden rounded-md border border-border bg-raised"
    >
      {/* A placeholder page until real photos can be taken (demo). */}
      <Svg width={92} height={116} viewBox="0 0 92 116">
        <Rect x={10} y={10} width={72} height={96} rx={3} fill={c.surf} />
        <Path
          d="M17 24c6-3 10 3 16 0s8-3 14 0 8 1 12-1M17 38c5-2 9 2 14 0s8-2 12 0M17 52c7-3 11 2 17 0s9-2 15 1 6 0 10-1M17 66c4-2 8 2 12 0s6-1 10 0M17 82c6-3 10 2 16 0"
          fill="none"
          stroke={c.ink}
          strokeWidth={1.6}
          strokeLinecap="round"
        />
        <Path d="M15 90h40" stroke={c.honey} strokeWidth={2.2} strokeLinecap="round" />
      </Svg>
      <View className="absolute bottom-1.5 right-1.5 h-6 w-6 items-center justify-center rounded-full bg-ok">
        <Icon name="check" size={16} color="ok-bg" />
      </View>
      {remove}
    </View>
  );
}
