import { Redirect, router } from 'expo-router';
import { Trans, useTranslation } from 'react-i18next';
import { ClassCard } from '@/components/me/ClassCard';
import { ClassesHint } from '@/components/me/ClassesHint';
import { InfoNote } from '@/components/me/InfoNote';
import { Button, ErrorState, LoadingState, Screen, ScreenHeader, Text } from '@/components/ui';
import { useClasses } from '@/features/me/queries';
import { useMeStore } from '@/features/me/store';

/** "Siniflərim" (architecture Ş10): the student's classes and joining another one by code. */
export default function ClassesScreen() {
  const { t } = useTranslation();
  const guest = useMeStore((s) => s.guest);
  const classes = useClasses();

  if (guest)
    return <Redirect href={{ pathname: '/auth/account', params: { reason: 'classes' } }} />;

  return (
    <Screen className="gap-3">
      <ScreenHeader title={t('me.classes.title')} />
      {classes.isPending ? (
        <LoadingState />
      ) : classes.isError ? (
        <ErrorState onRetry={() => void classes.refetch()} />
      ) : (
        <>
          {classes.data.map((c) => (
            <ClassCard key={c.id} item={c} />
          ))}
          <Button label={t('me.classes.join')} icon="key" onPress={() => router.push('/me/join')} />
          <ClassesHint empty={classes.data.length === 0} />
          <InfoNote icon="shield">
            <Trans
              i18nKey="me.classes.privacy"
              components={{ b: <Text className="font-sans-black text-sm" /> }}
            />
          </InfoNote>
        </>
      )}
    </Screen>
  );
}
