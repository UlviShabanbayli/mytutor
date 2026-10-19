import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Switch, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

export type ConsentItem = {
  key: string;
  title: string;
  sub: string;
  /** Undefined: always shared ("Mütləq"); otherwise the student's switch. */
  on?: boolean;
  onChange?: (on: boolean) => void;
};

type ConsentListProps = { items: ConsentItem[]; accessibilityLabel: string };

/** What a teacher or a parent will see: fixed rows with a lock, the rest as switches. */
export function ConsentList({ items, accessibilityLabel }: ConsentListProps) {
  const { t } = useTranslation();

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      className="rounded-[18px] border border-border bg-surf px-3"
    >
      {items.map((item, i) => (
        <View
          key={item.key}
          accessible={item.onChange === undefined}
          accessibilityLabel={
            item.onChange === undefined
              ? t('me.consent.requiredLabel', { title: item.title })
              : undefined
          }
          className={cn(
            'min-h-[54px] flex-row items-center gap-2.5 py-1',
            i > 0 && 'border-t border-border',
          )}
        >
          <View className="flex-1 gap-px">
            <Text className="font-sans-black text-sm">{item.title}</Text>
            <Text tone="muted" className="text-xs">
              {item.sub}
            </Text>
          </View>
          {item.onChange && item.on !== undefined ? (
            <Switch value={item.on} onValueChange={item.onChange} accessibilityLabel={item.title} />
          ) : (
            <View className="h-7 flex-row items-center gap-1 rounded-full bg-wax px-[9px]">
              <Icon name="lock" size={14} color="lock-ink" />
              <Text className="font-sans-black text-xs text-lock-ink">
                {t('me.consent.required')}
              </Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}
