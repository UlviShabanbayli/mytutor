import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import { SmallButton } from './SmallButton';

type RaisedHandRowProps = {
  name: string;
  when: string;
  first: boolean;
  speaking: boolean;
  onToggle: () => void;
};

/** A raised hand; the first in line gets the honey "Söz ver". */
export function RaisedHandRow({ name, when, first, speaking, onToggle }: RaisedHandRowProps) {
  const { t } = useTranslation();

  return (
    <View className="min-h-[52px] flex-row items-center gap-2.5 rounded-md border border-border bg-surf py-1 pl-3 pr-1">
      <Icon name="hand" size={20} color="honey-text" />
      <View accessible className="min-w-0 flex-1">
        <Text className="font-sans-black">{name}</Text>
        <Text className="font-sans text-xs text-muted">
          {speaking
            ? t('teacher.live.speaking', { name })
            : first
              ? t('teacher.live.first', { when })
              : when}
        </Text>
      </View>
      <SmallButton
        variant={first && !speaking ? 'honey' : 'outline'}
        label={speaking ? t('teacher.live.take') : t('teacher.live.give')}
        accessibilityLabel={`${speaking ? t('teacher.live.take') : t('teacher.live.give')}: ${name}`}
        onPress={onToggle}
      />
    </View>
  );
}
