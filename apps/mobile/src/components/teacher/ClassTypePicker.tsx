import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

type ClassTypePickerProps = { paid: boolean; onChange: (paid: boolean) => void; verified: boolean };

/** "Növ": free opens at once; paid needs verification (M1) and stays locked until then. */
export function ClassTypePicker({ paid, onChange, verified }: ClassTypePickerProps) {
  const { t } = useTranslation();
  const label = t('teacher.classNew.type');
  const options = [
    { paid: false, title: t('teacher.free'), body: t('teacher.classNew.freeBody'), locked: false },
    {
      paid: true,
      title: t('teacher.paid'),
      body: verified ? t('teacher.classNew.paidBody') : t('teacher.classNew.paidLocked'),
      locked: !verified,
    },
  ];

  return (
    <View className="gap-1.5">
      <Text variant="label" tone="muted">
        {label}
      </Text>
      <View accessibilityRole="radiogroup" accessibilityLabel={label} className="flex-row gap-2.5">
        {options.map((o) => {
          const on = o.paid === paid;
          return (
            <Pressable
              key={o.title}
              accessibilityRole="radio"
              accessibilityLabel={`${o.title}. ${o.body}`}
              accessibilityState={{ checked: on, disabled: o.locked }}
              disabled={o.locked}
              onPress={() => onChange(o.paid)}
              className={cn('flex-1 rounded-lg', on && 'bg-honey-deep pb-[3px]')}
            >
              <View
                className={cn(
                  'min-h-[84px] gap-1 rounded-lg border-2 px-3 py-2.5',
                  on && 'border-honey bg-raised',
                  !on && !o.locked && 'border-border bg-surf',
                  o.locked && 'border-dashed border-border bg-wax',
                )}
              >
                <View className="flex-row items-center gap-1.5">
                  <Text
                    className={cn('flex-1 font-sans-black text-base', o.locked && 'text-lock-ink')}
                  >
                    {o.title}
                  </Text>
                  {on ? (
                    <View className="h-[24px] w-[24px] items-center justify-center rounded-full bg-honey">
                      <Icon name="check" size={16} color="on-honey" />
                    </View>
                  ) : o.locked ? (
                    <Icon name="lock" size={18} color="lock-ink" />
                  ) : null}
                </View>
                <Text
                  variant="caption"
                  className={o.locked ? 'font-sans text-lock-ink' : 'font-sans text-muted'}
                >
                  {o.body}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
