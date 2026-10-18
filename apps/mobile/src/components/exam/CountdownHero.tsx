import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Mascot } from '@/components/mascot/Mascot';
import { Text } from '@/components/ui';

type CountdownHeroProps = {
  /** "142 gün" */
  days: string;
  /** "Hədəf 75%+ · gündə 40 dəq" */
  plan: string;
  /** Where the date comes from, or when the offline copy was saved. */
  note: string;
  /** Vızı is left out offline: the offline notice already shows him. */
  showMascot: boolean;
};

/** The days left until the exam on the inverted `spot` card. */
export function CountdownHero({ days, plan, note, showMascot }: CountdownHeroProps) {
  const { t } = useTranslation();

  return (
    <View
      accessible
      accessibilityLabel={`${t('exam.home.heroA11y', { days })}. ${plan}. ${note}`}
      className="flex-row items-center gap-2 rounded-xl bg-spot py-2.5 pl-4 pr-2.5"
    >
      <View className="min-w-0 flex-1 gap-0.5 py-1">
        <Text variant="overline" className="text-xs text-honey">
          {t('exam.home.heroLabel')}
        </Text>
        <Text className="font-display-black text-4xl text-on-spot">{days}</Text>
        <Text className="text-sm text-on-spot opacity-85">{plan}</Text>
        <Text className="text-xs text-on-spot opacity-70">{note}</Text>
      </View>
      {showMascot ? <Mascot moment="focus" size={76} decorative /> : null}
    </View>
  );
}
