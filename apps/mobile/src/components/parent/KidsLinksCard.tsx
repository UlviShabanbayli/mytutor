import { useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { joinList } from '@/features/parent/text';
import type { ChildView } from '@/features/parent/types';
import { useStopLink } from '@/features/parent/writes';
import { HexAvatar } from './HexAvatar';
import { SectionLabel } from './SectionLabel';
import { StopLinkSheet } from './StopLinkSheet';
import { TextAction } from './TextAction';

type KidsLinksCardProps = { kids: ChildView[] };

/** Each link and what the child shares; the parent may stop a link, never change the child's. */
export function KidsLinksCard({ kids }: KidsLinksCardProps) {
  const { t } = useTranslation();
  const stop = useStopLink();
  const [stopping, setStopping] = useState<ChildView | null>(null);
  const rows = kids.length;

  const shares = (child: ChildView) =>
    child.grants.length === 0
      ? t('parent.me.sharesNothing')
      : t('parent.me.shares', {
          list: joinList(
            child.grants.map((g) => t(`parent.categories.${g}.short`)),
            t('parent.report.clauseSeparator'),
            t('parent.report.clauseSeparator'),
          ),
        });

  return (
    <View className="gap-1.5">
      <SectionLabel>{t('parent.me.kids')}</SectionLabel>
      <View className="overflow-hidden rounded-lg border border-border bg-surf">
        {rows === 0 ? (
          <Text tone="muted" className="px-3 py-3">
            {t('parent.me.noKids')}
          </Text>
        ) : null}
        {kids.map((child, i) => (
          <View
            key={child.childId}
            className={cn(
              'flex-row items-center gap-2.5 px-3 py-2.5',
              i < rows - 1 && 'border-b border-border',
            )}
          >
            <HexAvatar
              name={child.name}
              tone={child.status === 'active' ? 'honey' : 'wax'}
              size={36}
            />
            <View className="min-w-0 flex-1 gap-px">
              <Text className="font-sans-black">{child.name}</Text>
              <Text className="text-xs text-muted">
                {child.status === 'active' ? shares(child) : t('parent.me.awaitingConsent')}
              </Text>
            </View>
            {child.status === 'active' ? (
              <TextAction
                tone="err"
                label={t('parent.me.stop')}
                accessibilityLabel={`${t('parent.me.stop')}: ${child.name}`}
                onPress={() => setStopping(child)}
              />
            ) : (
              <TextAction
                label={t('parent.me.giveConsent')}
                accessibilityLabel={`${t('parent.me.giveConsent')}: ${child.name}`}
                onPress={() =>
                  router.push({ pathname: '/parent/consent', params: { childId: child.childId } })
                }
              />
            )}
          </View>
        ))}
      </View>
      <StopLinkSheet
        name={stopping?.name ?? null}
        busy={stop.isPending}
        onClose={() => setStopping(null)}
        onConfirm={() => {
          if (stopping) stop.mutate(stopping.childId, { onSuccess: () => setStopping(null) });
        }}
      />
    </View>
  );
}
