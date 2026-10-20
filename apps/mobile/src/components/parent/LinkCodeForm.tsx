import { useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Text } from '@/components/ui';
import { LinkCodeError } from '@/features/parent/errors';
import { useLinkChild } from '@/features/parent/writes';
import { CodeBoxes } from './CodeBoxes';
import { CodeWhereCard } from './CodeWhereCard';
import { IconNote } from './IconNote';
import { InfoCard } from './InfoCard';
import { SectionLabel } from './SectionLabel';

const LENGTH = 6;

/**
 * The code the child made, checked by the server; a refused code says why in plain words. An
 * accepted code links the child at once and the parent is back on "Uşaqlarım" with the child.
 */
export function LinkCodeForm() {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const submit = useLinkChild();
  const reason = submit.error instanceof LinkCodeError ? submit.error : null;

  const change = (next: string) => {
    setCode(next);
    if (submit.isError) submit.reset();
  };

  const send = () => submit.mutate(code, { onSuccess: () => router.dismissTo('/parent/kids') });

  const errorText = reason
    ? reason.reason === 'expired'
      ? { title: t('parent.code.expiredTitle'), body: t('parent.code.expiredBody') }
      : reason.reason === 'already_linked'
        ? {
            title: t('parent.code.linkedTitle', { name: reason.childName ?? '' }),
            body: t('parent.code.linkedBody'),
          }
        : { title: t('parent.code.notFoundTitle'), body: t('parent.code.notFoundBody') }
    : submit.isError
      ? { title: t('common.errorTitle'), body: t('common.errorDescription') }
      : null;

  return (
    <View className="flex-1 gap-4">
      <View className="gap-1.5">
        <Text variant="heading" className="font-display-black text-xl">
          {t('parent.code.heading')}
        </Text>
        <Text tone="muted">{t('parent.code.help')}</Text>
      </View>
      <View className="gap-2">
        <SectionLabel>{t('parent.code.label')}</SectionLabel>
        <CodeBoxes
          value={code}
          onChange={change}
          label={t('parent.code.fieldLabel')}
          hint={t('parent.code.help')}
          error={errorText !== null}
          length={LENGTH}
        />
      </View>
      {errorText ? <InfoCard tone="error" icon="warning" {...errorText} /> : null}
      <CodeWhereCard />
      <IconNote icon="shield" text={t('parent.code.safety')} className="px-1" />
      <View className="min-h-4 flex-1" />
      <Button
        label={t('parent.code.submit')}
        disabled={code.length < LENGTH || errorText !== null}
        loading={submit.isPending}
        onPress={send}
      />
    </View>
  );
}
