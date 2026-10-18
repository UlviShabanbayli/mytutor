import { View } from 'react-native';
import { Text } from '@/components/ui';
import type { ParentProfile } from '@/features/parent/types';
import { HexAvatar } from './HexAvatar';
import { ParentChip } from './ParentChip';

type ProfileHeaderProps = { profile: ParentProfile | undefined };

/** "Mən" tab top: the parent's hexagon, name and masked phone number. */
export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <View className="flex-row items-center gap-3">
      {profile ? <HexAvatar name={profile.name} tone="raised" /> : null}
      <View className="min-w-0 flex-1 gap-0.5">
        <Text variant="title" className="text-2xl" numberOfLines={1}>
          {profile?.name ?? ''}
        </Text>
        {profile ? (
          <Text variant="caption" tone="muted" className="font-sans">
            {profile.phoneMasked}
          </Text>
        ) : null}
      </View>
      <ParentChip />
    </View>
  );
}
