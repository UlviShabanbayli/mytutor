import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, ErrorState, HexCell, LoadingState, Sheet, Text } from '@/components/ui';
import { Mascot } from '@/components/mascot/Mascot';
import { leaveToToday } from '@/features/today/hooks';
import { useComeback } from '@/features/today/queries';

type ComebackSheetProps = {
  /** Days away as the home screen counted them; the server's count otherwise. */
  awayDays: number | null;
};

/** Back after a long break: what crystallized meanwhile and a short review to fix it. */
export function ComebackSheet({ awayDays }: ComebackSheetProps) {
  const { t } = useTranslation();
  const comeback = useComeback();
  const data = comeback.data;

  return (
    <Sheet visible onClose={leaveToToday} title={t('today.comeback.title')} showTitle={false}>
      {comeback.isPending ? (
        <LoadingState />
      ) : !data ? (
        <ErrorState onRetry={() => void comeback.refetch()} />
      ) : (
        <View className="items-center gap-3 px-1">
          <Mascot mood="salam" size={128} decorative />
          <Text variant="heading" className="text-center font-display-black text-xl">
            {t('today.comeback.title')}
          </Text>
          <Text tone="muted" className="text-center">
            {`${t('today.comeback.away', { count: awayDays ?? data.awayDays })} ${t(
              'today.comeback.crystals',
              { count: data.crystals.length, minutes: data.reviewMinutes },
            )}`}
          </Text>
          <View className="flex-row justify-center gap-2 py-1">
            {data.crystals.map((c) => (
              <View
                key={c.topicId}
                accessible
                accessibilityLabel={t('today.comeback.cellLabel', { code: c.code, title: c.title })}
                className="w-[90px] items-center gap-1"
              >
                <HexCell state="needs_practice" size={56} label={c.code} />
                <Text className="text-center font-sans-bold text-2xs text-muted">{c.title}</Text>
              </View>
            ))}
          </View>
          <Button
            label={t('today.comeback.review', { minutes: data.reviewMinutes })}
            onPress={() => router.replace('/review')}
            className="self-stretch"
          />
          <Pressable
            accessibilityRole="button"
            onPress={leaveToToday}
            className="min-h-touch self-stretch items-center justify-center rounded-lg active:bg-wax"
          >
            <Text className="font-sans-bold text-muted">{t('today.comeback.later')}</Text>
          </Pressable>
        </View>
      )}
    </Sheet>
  );
}
