import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import type { ChildOverview, LinkRequest } from '@/features/parent/types';
import { ChildCard } from './ChildCard';
import { ChildRequestCard } from './ChildRequestCard';

type KidsListProps = { kids: ChildOverview[]; request: LinkRequest | null };

/** "Uşaqlarım": linked children, children waiting to be linked, and "add a child". */
export function KidsList({ kids, request }: KidsListProps) {
  const { t } = useTranslation();

  return (
    <View className="gap-3">
      {kids.map((child) =>
        child.status === 'active' ? (
          <ChildCard key={child.childId} child={child} />
        ) : (
          <ChildRequestCard
            key={child.childId}
            name={child.name}
            subtitle={t('common.grade', { count: child.grade, ordinal: true })}
            status={t('parent.kids.awaitingConsent')}
            body={t('parent.kids.awaitingConsentBody', { name: child.name })}
            actionLabel={t('parent.kids.giveConsent')}
            onAction={() =>
              router.push({ pathname: '/parent/consent', params: { childId: child.childId } })
            }
          />
        ),
      )}
      {request ? (
        <ChildRequestCard
          name={request.childName}
          status={t('parent.kids.awaitingApproval')}
          body={t('parent.kids.awaitingApprovalBody', { name: request.childName })}
          actionLabel={t('parent.kids.openRequest')}
          onAction={() => router.push('/parent/pending')}
        />
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('parent.kids.addChild')}
        onPress={() => router.push('/parent/code')}
        className="min-h-[52px] flex-row items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border active:bg-wax"
      >
        <Icon name="plus" size={20} />
        <Text className="font-sans-black">{t('parent.kids.addChild')}</Text>
      </Pressable>
    </View>
  );
}
