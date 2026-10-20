import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Input, Sheet } from '@/components/ui';
import { usePostAnnouncement } from '@/features/teacher/mutations';

type AnnounceSheetProps = {
  classId: string;
  visible: boolean;
  onClose: () => void;
  onPosted: () => void;
};

/** "Elan yaz": one message to the whole class (the demo event `announcement.posted`). */
export function AnnounceSheet({ classId, visible, onClose, onPosted }: AnnounceSheetProps) {
  const { t } = useTranslation();
  const post = usePostAnnouncement();
  const [text, setText] = useState('');
  const [showError, setShowError] = useState(false);

  const send = () => {
    if (text.trim().length === 0) {
      setShowError(true);
      return;
    }
    post.mutate({ classId, text });
    onPosted();
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
