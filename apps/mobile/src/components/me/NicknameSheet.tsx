import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Sheet } from '@/components/ui';
import { isValidNickname } from '@/features/me/nickname';
import { useNickname } from '@/features/me/queries';
import { useMeStore } from '@/features/me/store';
import { showToast } from '@/features/transitions/toastStore';

type NicknameSheetProps = { visible: boolean; onClose: () => void };

/** Change the nickname the league and class lists show (never the real name). */
export function NicknameSheet({ visible, onClose }: NicknameSheetProps) {
  const { t } = useTranslation();
  const nickname = useNickname();
  const setNickname = useMeStore((s) => s.setNickname);
  // Null until the student types: the field shows the nickname in use (the world's at first).
  const [typed, setTyped] = useState<string | null>(null);
  const [tried, setTried] = useState(false);
  const value = typed ?? nickname;
  const valid = isValidNickname(value);
  const close = () => {
    setTyped(null);
    setTried(false);
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={close} title={t('me.nickname.title')}>
      <Input
        label={t('me.nickname.label')}
        value={value}
        onChangeText={setTyped}
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={20}
        hint={t('me.nickname.hint')}
        error={tried && !valid ? t('me.nickname.error') : undefined}
      />
      <Button
        label={t('me.nickname.save')}
        size="md"
        onPress={() => {
          setTried(true);
          if (!valid) return;
          setNickname(value);
          close();
          showToast(t('common.saved'));
        }}
      />
    </Sheet>
  );
}
