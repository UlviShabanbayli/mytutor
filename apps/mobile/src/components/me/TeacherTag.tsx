import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import { Hex } from './Hex';

type TeacherTagProps = {
  name: string;
  initials: string;
  /** Muted line under the name ("Elan · Bu gün 09:12"). */
  meta?: string;
  size?: 'sm' | 'md';
};

/** A teacher's hexagon initials, name and the green "Müəllim" mark. */
export function TeacherTag({ name, initials, meta, size = 'md' }: TeacherTagProps) {
  const { t } = useTranslation();
  return (
    <View className="flex-1 flex-row items-center gap-2.5">
      <Hex width={size === 'sm' ? 30 : 36} fill="spot">
        <Text className="font-sans-black text-xs text-honey">{initials}</Text>
      </Hex>
      <View className="flex-1 gap-px">
        <View className="flex-row flex-wrap items-center gap-1.5">
          <Text className="font-sans-black text-sm">{name}</Text>
          <View className="h-5 flex-row items-center gap-[3px] rounded-full bg-ok-bg px-1.5">
            <Icon name="check" size={12} color="ok" />
            <Text className="font-sans-black text-2xs text-ok">{t('me.shared.teacher')}</Text>
          </View>
        </View>
        {meta ? (
          <Text tone="muted" className="text-xs">
            {meta}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
