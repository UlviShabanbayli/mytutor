import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FooterScreen } from '@/components/me/FooterScreen';
import { JoinClassForm } from '@/components/me/JoinClassForm';
import { JoinCodeField } from '@/components/me/JoinCodeField';
import { Banner, Button, Icon, ScreenHeader, Text } from '@/components/ui';
import { CLASS_CODE_LENGTH, normalizeClassCode } from '@/features/me/codes';
import { useClassMembership, useIsOnline, useJoinLookup } from '@/features/me/queries';
import { useMeStore } from '@/features/me/store';

type JoinStatus = 'checking' | 'already' | 'found' | 'notFound';

const STATUS = {
  checking: { icon: 'clock', tone: 'muted', key: 'me.join.checking' },
  already: { icon: 'check', tone: 'ok', key: 'me.join.already' },
  found: { icon: 'check', tone: 'ok', key: 'me.join.found' },
  notFound: { icon: 'x', tone: 'err', key: 'me.join.notFound' },
} as const;

/** Joining a class by the teacher's code (`/me/join?code=…` from a shared link opens it filled). */
export default function JoinClassScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ code?: string }>();
  const [code, setCode] = useState(normalizeClassCode(params.code ?? ''));
  const lookup = useJoinLookup(code);
  const online = useIsOnline();
  const guest = useMeStore((s) => s.guest);
  const { join } = useClassMembership();

  if (guest) return <Redirect href={{ pathname: '/auth/account', params: { reason: 'class' } }} />;

  const complete = code.length === CLASS_CODE_LENGTH;
  const result = complete ? (lookup.data ?? null) : null;
  const found = result?.found ?? null;
  const notFound = complete && lookup.isSuccess && lookup.data === null;
  const already = result?.member === true;
  const status: JoinStatus | null = !complete
    ? null
    : lookup.isFetching
      ? 'checking'
      : already
        ? 'already'
        : found
          ? 'found'
          : notFound
            ? 'notFound'
            : null;
  const shown = status ? STATUS[status] : null;

  return (
    <FooterScreen
      header={<ScreenHeader title={t('me.join.title')} />}
      footer={
        <Button
          label={already ? t('me.join.open') : t('me.join.submit')}
          disabled={found === null}
          onPress={() => {
            if (!found) return;
            if (!already) join(found.id);
            router.replace({ pathname: '/class/[id]', params: { id: found.id } });
          }}
        />
      }
    >
      {!online ? <Banner kind="offline" message={t('me.join.offline')} /> : null}
      <View className="gap-1.5">
        <View className="flex-row items-center justify-between">
          <Text variant="label">{t('me.join.codeLabel')}</Text>
          {shown ? (
            <View accessibilityLiveRegion="polite" className="flex-row items-center gap-1">
              <Icon name={shown.icon} size={16} color={shown.tone} />
              <Text tone={shown.tone} className="font-sans-black text-sm">
                {t(shown.key)}
              </Text>
            </View>
          ) : null}
        </View>
        <JoinCodeField
          value={code}
          onChange={setCode}
          invalid={notFound}
          accessibilityLabel={t('me.join.codeLabel')}
        />
        {notFound || !complete ? (
          <Text tone={notFound ? 'err' : 'muted'} className="text-sm">
            {notFound ? t('me.join.notFoundBody') : t('me.join.hint')}
          </Text>
        ) : null}
      </View>
      {lookup.isError ? (
        <Banner
          kind="error"
          message={t('common.errorDescription')}
          actionLabel={t('common.retry')}
          onAction={() => void lookup.refetch()}
        />
      ) : null}
      {found ? <JoinClassForm found={found} /> : null}
    </FooterScreen>
  );
}
