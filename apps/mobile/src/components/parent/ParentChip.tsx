import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

type ParentChipProps = { className?: string };

/** The blue "Valideyn" pill on every parent screen: whose view this is. */
export function ParentChip({ className }: ParentChipProps) {
  const { t } = useTranslation();
  return (
    <View
      className={cn(
        'h-[28px] flex-row items-center gap-1 self-start rounded-full bg-info-bg px-2.5',
        className,
      )}
    >
      <Icon name="users" size={14} color="info" />
      <Text className="font-sans-black text-xs text-info">{t('parent.chip')}</Text>
    </View>
  );
}
