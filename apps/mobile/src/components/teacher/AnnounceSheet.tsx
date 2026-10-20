import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Input, Sheet } from '@/components/ui';
import type { PostedAnnouncement } from './AnnouncementsPanel';

type AnnounceSheetProps = {
  visible: boolean;
  onClose: () => void;
  onPosted: (item: PostedAnnouncement) => void;
};

let postedSeq = 0;

/** "Elan yaz": one message to the whole class, sent as a notification. */
export function AnnounceSheet({ visible, onClose, onPosted }: AnnounceSheetProps) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [showError, setShowError] = useState(false);

  const send = () => {
    if (text.trim().length === 0) {
      setShowError(true);
      return;
    }
    onPosted({ id: `posted-${++postedSeq}`, text: text.trim(), at: new Date().toISOString() });
    setText('');
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose} title={t('teacher.class.announceSheet')}>
      <View className="gap-3">
        <Input
          label={t('teacher.class.announceLabel')}
          value={text}
          onChangeText={(v) => {
            setText(v);
            setShowError(false);
          }}
          multiline
          error={showError ? t('teacher.class.announceError') : undefined}
        />
        <Button label={t('teacher.class.announceSubmit')} onPress={send} />
      </View>
    </Sheet>
  );
}
