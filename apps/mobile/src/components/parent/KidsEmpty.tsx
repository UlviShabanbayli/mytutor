import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Mascot } from '@/components/mascot/Mascot';
import { Button, Text } from '@/components/ui';
import { HowToLinkCard } from './HowToLinkCard';
import { InfoCard } from './InfoCard';
import { TextAction } from './TextAction';

type KidsEmptyProps = { parentName: string };

/** No child linked yet: Vızı says hello, the three steps, "you only watch", and the code CTA. */
export function KidsEmpty({ parentName }: KidsEmptyProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-1 gap-3">
      <View className="flex-row items-end gap-1.5">
        <Mascot mood="salam" size={96} decorative />
        <View className="mb-3.5 min-w-0 flex-1 rounded-t-[18px] rounded-bl-[4px] rounded-br-[18px] border border-border bg-surf px-3 py-2.5">
          <Text className="font-sans-semibold">
            {t('parent.kids.greeting', { name: parentName })}
          </Text>
        </View>
      </View>
      <HowToLinkCard />
      <InfoCard
        icon="shield"
        title={t('parent.kids.watchOnlyTitle')}
        body={t('parent.kids.watchOnlyBody')}
      />
      <View className="min-h-4 flex-1" />
      <Button
        label={t('parent.kids.enterCode')}
        icon="key"
        onPress={() => router.push('/parent/code')}
      />
      <TextAction
        label={t('parent.kids.consentLink')}
        icon="chevron"
        onPress={() => router.push('/parent/consent')}
      />
    </View>
  );
}
