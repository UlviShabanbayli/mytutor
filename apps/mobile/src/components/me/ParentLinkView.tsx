import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Banner, Screen, ScreenHeader, Text } from '@/components/ui';
import { parentCategoryCount } from '@/features/me/privacy';
import { makeParentCode } from '@/features/me/codes';
import {
  useIsOnline,
  useParentCodeSource,
  useParentLinkActions,
  useParents,
} from '@/features/me/queries';
import { useMeStore } from '@/features/me/store';
import type { ParentLinkView as LinkedParent } from '@/features/me/types';
import { ConfirmSheet } from './ConfirmSheet';
import { ConsentList } from './ConsentList';
import { LinkedParentCard } from './LinkedParentCard';
import { ParentCodeCard } from './ParentCodeCard';
import { ParentRequestCard } from './ParentRequestCard';

/**
 * "Valideyn" (architecture V1, student side): show the code a parent types (the world's), answer
 * a parent who asked, choose what parents see, and stop a link. Answers and stops are demo
 * events, so the parent's app follows.
 */
export function ParentLinkView() {
  const { t } = useTranslation();
  const online = useIsOnline();
  const code = useMeStore((s) => s.parentCode);
  const showCode = useMeStore((s) => s.showParentCode);
  const grants = useMeStore((s) => s.grants);
  const setGrant = useMeStore((s) => s.setGrant);
  const worldCode = useParentCodeSource().data;
  const parents = useParents().data;
  const links = parents?.links ?? [];
  const request = parents?.requests[0] ?? null;
  const { approve, unlink } = useParentLinkActions();
  const [stopping, setStopping] = useState<LinkedParent | null>(null);
  const parent = grants.parent;

  return (
    <Screen className="gap-2.5">
      <ScreenHeader title={t('me.parentLink.title')} />
      {!online ? <Banner kind="offline" message={t('me.parentLink.offline')} /> : null}
      <ParentCodeCard
        code={code}
        // The world's code when it has one (K7Q42M for Nərmin), so a parent can type it.
        onGenerate={() => showCode(worldCode ?? makeParentCode())}
        disabled={!online || worldCode === undefined}
      />
      {code ? (
        <Text tone="muted" className="text-sm">
          {t('me.parentLink.instruction')}
        </Text>
      ) : null}
      <View className="gap-px">
        <Text accessibilityRole="header" className="font-sans-black text-md">
          {t('me.parentLink.seeTitle')}
        </Text>
        <Text tone="muted" className="text-sm">
          {t('me.parentLink.seeBody')}
        </Text>
      </View>
      <ConsentList
        accessibilityLabel={t('me.parentLink.consentLabel')}
        items={[
          { key: 'identity', title: t('me.consent.identity'), sub: t('me.consent.identityParent') },
          // Class tasks and results are always visible to a linked parent ("Rollar və icazələr").
          { key: 'tasks', title: t('me.consent.tasks'), sub: t('me.consent.tasksParent') },
          {
            key: 'progress',
            title: t('me.consent.progress'),
            sub: t('me.consent.progressParent'),
            on: parent.progress,
            onChange: (on) => setGrant('parent', 'progress', on),
          },
          {
            key: 'activity',
            title: t('me.consent.activity'),
            sub: t('me.consent.activitySub'),
            on: parent.activity,
            onChange: (on) => setGrant('parent', 'activity', on),
          },
          {
            key: 'examPlan',
            title: t('me.consent.examPlan'),
            sub: t('me.consent.examPlanSub'),
            on: parent.examPlan,
            onChange: (on) => setGrant('parent', 'examPlan', on),
          },
        ]}
      />
      {request ? (
        <ParentRequestCard
          request={request}
          onApprove={() => approve(request.id)}
          onReject={() => unlink(request.id)}
        />
      ) : null}
      {links.length === 0 ? (
        <Text tone="muted" className="text-sm">
          {t('me.parentLink.none')}
        </Text>
      ) : (
        links.map((p) => (
          <LinkedParentCard
            key={p.id}
            parent={p}
            categories={parentCategoryCount(grants)}
            onStop={() => setStopping(p)}
          />
        ))
      )}
      <ConfirmSheet
        visible={stopping !== null}
        title={t('me.parentLink.stopTitle')}
        body={t('me.parentLink.stopBody', { name: stopping?.name ?? '' })}
        confirmLabel={t('me.parentLink.stopConfirm')}
        danger
        onClose={() => setStopping(null)}
        onConfirm={() => stopping && unlink(stopping.id)}
      />
    </Screen>
  );
}
