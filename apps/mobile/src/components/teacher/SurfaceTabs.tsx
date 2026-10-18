import { Pressable, View } from 'react-native';
import { Icon, type IconName, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

export type SurfaceTab<T extends string> = {
  value: T;
  label: string;
  icon?: IconName;
  /** Locked choice (e.g. "Ümumi növbə" before verification): shown with a lock, not pressable. */
  locked?: boolean;
};

type SurfaceTabsProps<T extends string> = {
  tabs: readonly SurfaceTab<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
  /** `tab` for sections of a screen, `radio` for a form choice. */
  role?: 'tab' | 'radio';
  className?: string;
};

/**
 * The design's segmented track: wax ground, the chosen segment raised in white with a 2pt edge.
 * (The shared SegmentedControl fills the choice with honey; this is the calmer teacher variant.)
 */
export function SurfaceTabs<T extends string>({
  tabs,
  value,
  onChange,
  accessibilityLabel,
  role = 'tab',
  className,
}: SurfaceTabsProps<T>) {
  return (
    <View
      accessibilityRole={role === 'tab' ? 'tablist' : 'radiogroup'}
      accessibilityLabel={accessibilityLabel}
      className={cn('flex-row gap-1 rounded-lg bg-wax p-1', className)}
    >
      {tabs.map((tab) => {
        const selected = tab.value === value;
        return (
          <Pressable
            key={tab.value}
            accessibilityRole={role}
            accessibilityLabel={tab.label}
            accessibilityState={
              role === 'tab'
                ? { selected, disabled: tab.locked === true }
                : { checked: selected, disabled: tab.locked === true }
            }
            disabled={tab.locked === true}
            onPress={() => onChange(tab.value)}
            className={cn(
              'min-h-[44px] flex-1 flex-row items-center justify-center gap-1.5 rounded-md px-1 py-0.5',
              selected && 'bg-surf shadow-sm shadow-border',
            )}
          >
            {tab.locked ? <Icon name="lock" size={16} color="lock-ink" /> : null}
            {tab.icon && !tab.locked ? (
              <Icon name={tab.icon} size={18} color={selected ? 'ink' : 'muted'} />
            ) : null}
            <Text
              numberOfLines={2}
              className={cn(
                'text-center text-sm',
                selected ? 'font-sans-black text-ink' : 'font-sans-bold text-muted',
                tab.locked && 'text-lock-ink',
              )}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
