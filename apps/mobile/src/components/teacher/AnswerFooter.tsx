import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, IconButton } from '@/components/ui';
import { goBack } from '@/features/teacher/navigation';
import { ConfirmSheet } from './ConfirmSheet';
import { SmallButton } from './SmallButton';
import { SoonSheet } from './SoonSheet';

type AnswerFooterProps = {
  done: boolean;
  canFix: boolean;
  /** The AI is still solving and nothing is written yet: nothing to approve. */
  solving: boolean;
  approving: boolean;
  onFix: () => void;
  /** After the teacher confirmed throwing the AI steps away. */
  onRewrite: () => void;
  onApprove: () => void;
};

/** Fix, rewrite, add a photo, approve — or, once approved, back to the queue. */
export function AnswerFooter({
  done,
  canFix,
  solving,
  approving,
  onFix,
  onRewrite,
  onApprove,
}: AnswerFooterProps) {
  const { t } = useTranslation();
  const [rewriting, setRewriting] = useState(false);
  const [camera, setCamera] = useState(false);

  if (done) return <Button label={t('teacher.answer.back')} onPress={() => goBack('/teacher/inbox')} />;
  return (
    <>
      <View className="flex-row items-center gap-2">
        <SmallButton
          variant="outline"
          icon="edit"
          label={t('teacher.answer.fix')}
          disabled={!canFix}
          onPress={onFix}
          className="flex-1 self-stretch"
        />
        <SmallButton
          variant="outline"
          icon="refresh"
          label={t('teacher.answer.rewrite')}
          onPress={() => setRewriting(true)}
          className="flex-1 self-stretch"
        />
        <IconButton
          icon="camera"
          variant="outlined"
          accessibilityLabel={t('teacher.answer.camera')}
          onPress={() => setCamera(true)}
        />
      </View>
      <Button
        icon="check"
        label={t('teacher.answer.approve')}
        loading={approving}
        disabled={solving}
        onPress={onApprove}
      />
      <ConfirmSheet
        visible={rewriting}
        title={t('teacher.answer.rewriteTitle')}
        body={t('teacher.answer.rewriteBody')}
        confirmLabel={t('teacher.answer.rewriteSubmit')}
        cancelLabel={t('teacher.answer.cancel')}
        onClose={() => setRewriting(false)}
        onConfirm={onRewrite}
      />
      <SoonSheet
        content={
          camera
            ? { title: t('teacher.soon.cameraTitle'), body: t('teacher.soon.cameraBody') }
            : null
        }
        onClose={() => setCamera(false)}
      />
    </>
  );
}
