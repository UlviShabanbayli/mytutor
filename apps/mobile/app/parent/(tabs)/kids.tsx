import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { KidsEmpty } from '@/components/parent/KidsEmpty';
import { KidsList } from '@/components/parent/KidsList';
import { NotificationsBell } from '@/components/parent/NotificationsBell';
import { ParentTabHeader } from '@/components/parent/ParentTabHeader';
import { QueryView } from '@/components/parent/QueryView';
import { Screen } from '@/components/ui';
import { useChildren, useParentProfile } from '@/features/parent/queries';

/** "Uşaqlarım": the parent's home; the first-time state until a child is linked. */
export default function ParentKidsScreen() {
  const { t } = useTranslation();
  const children = useChildren();
  const profile = useParentProfile();
  const empty = children.data?.length === 0;

  return (
    <Screen>
      {empty ? (
        <ParentTabHeader title={t('parent.kids.title')} />
      ) : (
        <ParentTabHeader title={t('parent.kids.title')} chipAbove action={<NotificationsBell />} />
      )}
      <QueryView query={children}>
        {(kids) =>
          empty ? (
            <KidsEmpty parentName={profile.data?.name ?? ''} />
          ) : (
            <View className="flex-1">
              <KidsList kids={kids} />
            </View>
          )
        }
      </QueryView>
    </Screen>
  );
}
