import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { KeypadKey } from './KeypadKey';

type MathKeypadProps = {
  /** Letters of the exercise ("a", "b"). */
  variables: string[];
  onKey: (text: string) => void;
};

/** Formula keys next to the system keyboard: powers, signs, brackets and the letters. */
export function MathKeypad({ variables, onKey }: MathKeypadProps) {
  const { t } = useTranslation();
  const keys = [
    { label: 'x²', insert: '²', aria: t('study.lesson.keys.square') },
    { label: 'x³', insert: '³', aria: t('study.lesson.keys.cube') },
    { label: '+', insert: ' + ', aria: t('study.lesson.keys.plus') },
    { label: '−', insert: ' − ', aria: t('study.lesson.keys.minus') },
    { label: '(', insert: '(', aria: t('study.lesson.keys.open') },
    { label: ')', insert: ')', aria: t('study.lesson.keys.close') },
    ...variables.map((v) => ({
      label: v,
      insert: v,
      aria: t('study.lesson.keys.letter', { letter: v }),
    })),
  ];
  const rows = [keys.slice(0, 4), keys.slice(4, 8)];

  return (
    <View
      accessibilityRole="toolbar"
      accessibilityLabel={t('study.lesson.mathKeys')}
      className="gap-2"
    >
      {rows.map((row, r) => (
        <View key={r} className="flex-row gap-2">
          {row.map((key) => (
            <KeypadKey
              key={key.label}
              label={key.label}
              accessibilityLabel={key.aria}
              onPress={() => onKey(key.insert)}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
