import { useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import { GradeHex } from './GradeHex';

const TOP_ROW = [5, 6, 7, 8];
const BOTTOM_ROW = [9, 10, 11];
/** The design's cell width; narrower phones shrink it so four cells and gutters still fit. */
const CELL = 82;
const GAP = 6;
const GUTTERS = 32;

type GradePickerProps = {
  value: number | null;
  onChange: (grade: number) => void;
  accessibilityLabel: string;
};

/**
 * Grades 5–11 as a honeycomb (4 cells over 3, the lower row tucked into the upper one), and
 * university as a locked "coming soon" cell.
 */
export function GradePicker({ value, onChange, accessibilityLabel }: GradePickerProps) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const size = Math.min(CELL, Math.floor((width - GUTTERS - GAP * 3) / TOP_ROW.length));
  const row = (grades: number[]) =>
    grades.map((grade) => (
      <GradeHex
        key={grade}
        grade={grade}
        size={size}
        selected={grade === value}
        onPress={() => onChange(grade)}
      />
    ));

  return (
    <View className="gap-4">
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={accessibilityLabel}
        className="items-center pt-1.5"
      >
        <View className="flex-row gap-1.5">{row(TOP_ROW)}</View>
        {/* The lower row tucks into the upper one by a share of the cell (design: 16 of 82). */}
        <View className="flex-row gap-1.5" style={{ marginTop: -Math.round(size * 0.195) }}>
          {row(BOTTOM_ROW)}
        </View>
      </View>
      <View
        accessibilityRole="button"
        accessibilityState={{ disabled: true }}
        accessibilityLabel={t('onboarding.grade.university')}
        className="h-[52px] flex-row items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-wax"
      >
        <Icon name="lock" size={18} color="lock-ink" />
        <Text className="font-sans-bold" tone="lock">
          {t('onboarding.grade.university')}
        </Text>
      </View>
    </View>
  );
}
