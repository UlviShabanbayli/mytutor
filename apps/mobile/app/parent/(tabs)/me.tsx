import { View } from 'react-native';
import { KidsLinksCard } from '@/components/parent/KidsLinksCard';
import { NotificationPrefsCard } from '@/components/parent/NotificationPrefsCard';
import { PremiumCard } from '@/components/parent/PremiumCard';
import { ProfileHeader } from '@/components/parent/ProfileHeader';
import { QueryView } from '@/components/parent/QueryView';
import { SettingsTiles } from '@/components/parent/SettingsTiles';
import { Screen } from '@/components/ui';
import { useChildren, useParentProfile } from '@/features/parent/queries';

/** "Mən": links and what each child shares, notifications, subscription, app settings. */
export default function ParentMeScreen() {
  const profile = useParentProfile();
  const children = useChildren();

  return (
    <Screen>
      <ProfileHeader profile={profile.data} />
      <QueryView query={children}>
        {(kids) => {
          const active = kids.filter((k) => k.status === 'active');
          const first = active[0];
          return (
            <View className="gap-2.5">
              <KidsLinksCard kids={kids} />
              <NotificationPrefsCard
                lateAllowedBy={active
                  .filter((k) => k.grants.includes('assignments'))
                  .map((k) => k.name)}
              />
              {first ? <PremiumCard childName={first.name} /> : null}
              <SettingsTiles />
            </View>
          );
        }}
      </QueryView>
    </Screen>
  );
}
