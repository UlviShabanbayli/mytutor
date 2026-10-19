import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NUMERIC_KEYS, type NumericKey } from '@/features/study/numericInput';
import { KeypadKey } from './KeypadKey';

type NumericKeypadProps = {
  onKey: (key: NumericKey) => void;
};

/** 3×4 digit pad: 1–9, minus, 0 and the decimal comma. */
export function NumericKeypad({ onKey }: NumericKeypadProps) {
  const { t } = useTranslation();
  const rows = [0, 3, 6, 9].map((start) => NUMERIC_KEYS.slice(start, start + 3));
  const label = (key: NumericKey) =>
    key === '-' ? t('study.test.minusKey') : key === ',' ? t('study.test.commaKey') : key;

  return (
    <View
      accessibilityRole="toolbar"
      accessibilityLabel={t('study.test.numberPad')}
      className="gap-2"
    >
      {rows.map((row) => (
        <View key={row.join('')} className="flex-row gap-2">
          {row.map((key) => (
            <KeypadKey
              key={key}
              kind="number"
              label={key === '-' ? '−' : key}
              accessibilityLabel={label(key)}
              onPress={() => onKey(key)}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
