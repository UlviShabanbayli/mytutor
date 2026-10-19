import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Sheet } from '@/components/ui';
import { isValidNickname } from '@/features/me/nickname';
import { useMeStore } from '@/features/me/store';
import { showToast } from '@/features/transitions/toastStore';

type NicknameSheetProps = { visible: boolean; onClose: () => void };

/** Change the nickname the league and class lists show (never the real name). */
export function NicknameSheet({ visible, onClose }: NicknameSheetProps) {
  const { t } = useTranslation();
  const nickname = useMeStore((s) => s.nickname);
  const setNickname = useMeStore((s) => s.setNickname);
  const [value, setValue] = useState(nickname);
  const [tried, setTried] = useState(false);
  const valid = isValidNickname(value);

  return (
    <Sheet visible={visible} onClose={onClose} title={t('me.nickname.title')}>
      <Input
        label={t('me.nickname.label')}
        value={value}
        onChangeText={setValue}
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
          onClose();
          showToast(t('common.saved'));
        }}
      />
    </Sheet>
  );
}
