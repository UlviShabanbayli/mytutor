import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Text } from '@/components/ui';
import type { ParentRequest } from '@/features/me/types';
import { Hex } from './Hex';

type ParentRequestCardProps = {
  request: ParentRequest;
  onApprove: () => void;
  onReject: () => void;
};

/** A parent typed the code: the student approves (with the chosen categories) or rejects. */
export function ParentRequestCard({ request, onApprove, onReject }: ParentRequestCardProps) {
  const { t } = useTranslation();
  const relation = t(`me.parentLink.relations.${request.relation}`);

  return (
    <View
      accessibilityLabel={t('me.parentLink.requestLabel')}
      accessibilityLiveRegion="polite"
      className="gap-2.5 rounded-[18px] border-2 border-honey bg-raised p-3"
    >
      <View className="flex-row items-center gap-3">
        <Hex width={40} fill="honey">
          <Text className="font-sans-black text-base text-on-honey">{request.name.charAt(0)}</Text>
        </Hex>
        <View className="flex-1 gap-0.5">
          <Text variant="overline" tone="honey">
            {t('me.parentLink.requestOverline')}
          </Text>
          <Text className="text-sm">
            {t('me.parentLink.requestBody', { name: request.name, relation })}
          </Text>
        </View>
      </View>
      <View className="flex-row gap-2">
        <View className="flex-1">
          <Button
            label={t('me.parentLink.reject')}
            variant="secondary"
            size="md"
            onPress={onReject}
          />
        </View>
        <View className="flex-1">
          <Button label={t('me.parentLink.approve')} size="md" onPress={onApprove} />
        </View>
      </View>
    </View>
  );
}
