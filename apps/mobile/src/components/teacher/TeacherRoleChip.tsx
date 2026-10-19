import { View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { useThemeColors } from '@/theme';

/** The "Müəllim" chip of every teacher screen: inverted spot pill with a small honey cell. */
export function TeacherRoleChip() {
  const { t } = useTranslation();
  const colors = useThemeColors();

  return (
    <View className="h-[26px] flex-row items-center gap-1.5 self-start rounded-[8px] bg-spot pl-2 pr-2.5">
      {/* A decorative shape with no text: nothing for screen readers to announce. */}
      <Svg width={9} height={10}>
        <Polygon points="4.5,0 9,2.5 9,7.5 4.5,10 0,7.5 0,2.5" fill={colors.honey} />
      </Svg>
      <Text className="font-sans-black text-xs text-on-spot">{t('teacher.role')}</Text>
    </View>
  );
}
