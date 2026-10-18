import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Mascot } from '@/components/mascot/Mascot';
import { Button, Card, Icon, Text } from '@/components/ui';
import { formatWhen } from '@/features/parent/format';
import { useCancelLinkRequest } from '@/features/parent/queries';
import { genitiveAz } from '@/features/parent/text';
import type { LinkRequest } from '@/features/parent/types';
import { LockedNote } from './LockedNote';
import { SectionLabel } from './SectionLabel';
import { ShareCategoryList } from './ShareCategoryList';
import { TextAction } from './TextAction';

type PendingRequestViewProps = { request: LinkRequest };

/** The code was accepted; the child now approves and picks what to share. */
export function PendingRequestView({ request }: PendingRequestViewProps) {
  const { t } = useTranslation();
  const cancel = useCancelLinkRequest();
  const name = request.childName;

  return (
    <View className="flex-1 gap-3.5">
      <Card className="gap-2.5 p-3.5">
        <View className="flex-row items-center gap-3">
          <Mascot mood="ucur" size={76} decorative />
          <View className="min-w-0 flex-1 items-start gap-1.5">
            <View className="h-[26px] flex-row items-center gap-1 rounded-full bg-ok-bg px-2.5">
              <Icon name="check" size={14} color="ok" />
              <Text className="font-sans-black text-xs text-ok">
                {t('parent.pending.accepted')}
              </Text>
            </View>
            <Text variant="heading">{t('parent.pending.heading', { name })}</Text>
          </View>
        </View>
        <Text>{t('parent.pending.body', { name, nameGen: genitiveAz(name) })}</Text>
        <View className="flex-row items-center gap-1.5">
          <Icon name="clock" size={16} color="muted" />
          <Text variant="caption" tone="muted" className="min-w-0 flex-1">
            {t('parent.pending.validity', {
              when: formatWhen(t, new Date(request.sentAt), new Date()),
            })}
          </Text>
        </View>
      </Card>

      <View className="gap-2">
        <SectionLabel>{t('parent.pending.chooseTitle', { name })}</SectionLabel>
        <ShareCategoryList />
        <LockedNote body={t('parent.neverShared')} />
      </View>

      <View className="min-h-4 flex-1" />
      <Button
        variant="secondary"
        icon="refresh"
        label={t('parent.pending.requestAgain')}
        onPress={() => router.replace('/parent/code')}
      />
      <TextAction
        tone="muted"
        label={t('parent.pending.cancel')}
        disabled={cancel.isPending}
        onPress={() =>
          cancel.mutate(undefined, { onSuccess: () => router.replace('/parent/kids') })
        }
      />
    </View>
  );
}
