import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Sheet, Text } from '@/components/ui';

type LeaderboardSettingsSheetProps = {
  visible: boolean;
  nick: string;
  onClose: () => void;
  onLeave: () => void;
};

/** Who sees what on the leaderboard, and the way out of it. */
export function LeaderboardSettingsSheet({
  visible,
  nick,
  onClose,
  onLeave,
}: LeaderboardSettingsSheetProps) {
  const { t } = useTranslation();

  return (
    <Sheet visible={visible} onClose={onClose} title={t('exam.board.settings')}>
      <View className="gap-1 rounded-lg bg-raised px-3.5 py-3">
        <Text variant="overline" tone="muted" className="text-xs">
          {t('exam.board.nickLabel')}
        </Text>
        <Text className="font-sans-black text-md">{nick}</Text>
      </View>
      <Text tone="muted" className="text-sm">
        {t('exam.board.sheetBody')}
      </Text>
      <Button variant="secondary" label={t('exam.board.leave')} onPress={onLeave} />
    </Sheet>
  );
}
