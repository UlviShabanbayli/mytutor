import type { ReactNode } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/components/ui';
import { useChildren } from '@/features/parent/queries';
import type { ShareCategory } from '@mytutor/types';
import type { ChildView } from '@/features/parent/types';
import { LockedNote } from './LockedNote';
import { QueryView } from './QueryView';

type ChildGateProps = {
  childId: string;
  /** The category this screen shows; without the child's permission a calm lock instead. */
  category: ShareCategory;
  children: (child: ChildView) => ReactNode;
};

/** A child's screen opens only for a linked child and a category that child shares. */
export function ChildGate({ childId, category, children }: ChildGateProps) {
  const { t } = useTranslation();
  const query = useChildren();

  return (
    <QueryView query={query}>
      {(list) => {
        const child = list.find((c) => c.childId === childId && c.status === 'active');
        if (!child) {
          return (
            <EmptyState
              moment="aiThinking"
              title={t('parent.state.childMissingTitle')}
              description={t('parent.state.childMissingBody')}
              actionLabel={t('parent.state.toKids')}
              onAction={() => router.replace('/parent/kids')}
            />
          );
        }
        if (!child.grants.includes(category)) {
          return (
            <View className="flex-1 justify-center py-12">
              <LockedNote
                variant="boxed"
                title={t('parent.state.notSharedTitle', { name: child.name })}
                body={t('parent.state.notSharedBody')}
              />
            </View>
          );
        }
        return children(child);
      }}
    </QueryView>
  );
}
