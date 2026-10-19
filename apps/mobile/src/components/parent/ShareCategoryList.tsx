import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, type IconName, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { SHARE_CATEGORIES, type ShareCategory } from '@/features/parent/types';

const icons: Record<ShareCategory, IconName> = {
  report: 'chart',
  progress: 'learn',
  assignments: 'list',
  exam: 'exam',
};

/** The four things a child may choose to share, with what each one contains. */
export function ShareCategoryList() {
  const { t } = useTranslation();
  return (
    <View
      accessibilityRole="list"
      className="overflow-hidden rounded-[18px] border border-border bg-surf"
    >
      {SHARE_CATEGORIES.map((category, i) => (
        <View
          key={category}
          accessible
          className={cn(
            'flex-row items-center gap-3 px-3 py-2.5',
            i < SHARE_CATEGORIES.length - 1 && 'border-b border-border',
          )}
        >
          <View className="h-[36px] w-[36px] items-center justify-center rounded-[11px] bg-raised">
            <Icon name={icons[category]} size={20} color="honey-text" />
          </View>
          <View className="min-w-0 flex-1 gap-px">
            <Text className="font-sans-black">{t(`parent.categories.${category}.title`)}</Text>
            <Text className="text-xs text-muted">{t(`parent.categories.${category}.body`)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}
