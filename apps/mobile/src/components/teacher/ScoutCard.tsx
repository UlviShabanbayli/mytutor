import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Mascot } from '@/components/mascot/Mascot';
import { Text } from '@/components/ui';
import { SmallButton } from './SmallButton';

/** `topic` is the topic's number, "4.2". */
type ScoutCardProps = { topic: string; names: string[]; onAssign: () => void };

/** Vızı's scouting suggestion (M7): who to give a review, turned into an assignment in one tap. */
export function ScoutCard({ topic, names, onAssign }: ScoutCardProps) {
  const { t } = useTranslation();

  return (
    <View
      accessibilityLabel={t('teacher.insights.scout')}
      className="flex-row items-center gap-2 rounded-xl bg-spot py-3 pl-2 pr-3.5"
    >
      <Mascot mood="kesfiyyat" size={76} decorative />
      <View className="min-w-0 flex-1 gap-1">
        <Text variant="overline" className="text-honey">
          {t('teacher.insights.scout')}
        </Text>
        <Text className="font-sans-black text-base text-on-spot">
          {t('teacher.insights.scoutTitle', { count: names.length, topic })}
        </Text>
        <Text variant="caption" className="font-sans text-on-spot opacity-85">
          {t('teacher.insights.scoutBody', { names: names.join(', '), topic })}
        </Text>
        <SmallButton
          icon="plus"
          label={t('teacher.insights.scoutAction')}
          onPress={onAssign}
          className="mt-1"
        />
      </View>
    </View>
  );
}
