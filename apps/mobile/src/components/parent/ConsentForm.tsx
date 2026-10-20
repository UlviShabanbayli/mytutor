import { useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { Trans, useTranslation } from 'react-i18next';
import type { ConsentRequest } from '@mytutor/types';
import { Mascot } from '@/components/mascot/Mascot';
import { Banner, Button, Text } from '@/components/ui';
import { ConsentCodeError } from '@/features/parent/errors';
import { genitiveAz } from '@/features/parent/text';
import { useCountdown } from '@/features/parent/useCountdown';
import { useDeclineConsent, useSubmitConsent } from '@/features/parent/writes';
import { CheckboxRow } from './CheckboxRow';
import { CodeBoxes } from './CodeBoxes';
import { ConsentSeeCard } from './ConsentSeeCard';
import { SectionLabel } from './SectionLabel';
import { TextAction } from './TextAction';

const RESEND_SECONDS = 60;
const LENGTH = 6;

type ConsentFormProps = { request: ConsentRequest };

/** SMS code + terms for a child under 13: the account opens with the parent's consent (V1). */
export function ConsentForm({ request }: ConsentFormProps) {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [resent, setResent] = useState(false);
  const { left, restart } = useCountdown(RESEND_SECONDS);
  const submit = useSubmitConsent();
  const decline = useDeclineConsent();
  const name = request.childName;
  const wrong = submit.error instanceof ConsentCodeError;
  const toKids = () => router.dismissTo('/parent/kids');
  const timer = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;

  return (
    <View className="flex-1 gap-3">
      <View className="flex-row items-center gap-2.5">
        <Mascot mood="izah" size={80} decorative />
        <View className="min-w-0 flex-1 gap-1">
          <Text variant="heading" className="text-md">
            {t('parent.consent.heading', { name })}
          </Text>
          <Text variant="caption" tone="muted" className="font-sans">
            {t('parent.consent.body', { name })}
          </Text>
        </View>
      </View>

      <View className="gap-2">
        <SectionLabel>{t('parent.consent.smsLabel')}</SectionLabel>
        <CodeBoxes
          kind="digits"
          value={code}
          onChange={(next) => {
            setCode(next);
            if (submit.isError) submit.reset();
          }}
          label={t('parent.consent.smsField')}
          hint={t('parent.consent.sentTo', { phone: request.phoneMasked })}
          error={wrong}
          length={LENGTH}
        />
        <View className="flex-row items-center justify-between gap-2">
          <Text variant="caption" tone="muted" className="min-w-0 flex-1 font-sans">
            {t('parent.consent.sentTo', { phone: request.phoneMasked })}
          </Text>
          <TextAction
            label={
              left > 0 ? t('parent.consent.resendIn', { time: timer }) : t('parent.consent.resend')
            }
            disabled={left > 0}
            onPress={() => {
              restart();
              setResent(true);
            }}
          />
        </View>
        {wrong ? <Banner kind="error" message={t('parent.consent.wrongCode')} /> : null}
        {resent && !wrong ? <Banner kind="info" message={t('parent.consent.resent')} /> : null}
      </View>

      <ConsentSeeCard name={name} />

      <CheckboxRow
        checked={agreed}
        onChange={setAgreed}
        accessibilityLabel={t('parent.consent.agreeLabel')}
      >
        <Text className="text-sm">
          <Trans
            i18nKey="parent.consent.agree"
            values={{ name, nameGen: genitiveAz(name) }}
            components={{ b: <Text className="font-sans-black text-sm" /> }}
          />
        </Text>
      </CheckboxRow>

      <View className="min-h-2 flex-1" />
      <Button
        label={t('parent.consent.submit')}
        disabled={code.length < LENGTH || !agreed || wrong}
        loading={submit.isPending}
        onPress={() => submit.mutate({ childId: request.childId, code }, { onSuccess: toKids })}
      />
      <TextAction
        tone="muted"
        label={t('parent.consent.decline')}
        disabled={decline.isPending}
        onPress={() => decline.mutate(request.childId, { onSuccess: toKids })}
      />
    </View>
  );
}
