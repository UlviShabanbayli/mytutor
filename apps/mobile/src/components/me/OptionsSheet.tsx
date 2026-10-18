import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { Icon, type IconName, Sheet, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

export type SheetOption = {
  key: string;
  icon: IconName;
  label: string;
  /** Red row (leave, report). */
  danger?: boolean;
  onPress: () => void;
};

type OptionsSheetProps = {
  visible: boolean;
  title: string;
  options: SheetOption[];
  onClose: () => void;
  /** Shown above the actions, e.g. the message the actions are about. */
  header?: ReactNode;
  /** A quiet note under the actions. */
  note?: string;
};

const SHEET_HANDOFF_MS = 300;

/** A short list of actions in a bottom sheet (class options, message menu). */
export function OptionsSheet({
  visible,
  title,
  options,
  onClose,
  header,
  note,
}: OptionsSheetProps) {
  return (
    <Sheet visible={visible} onClose={onClose} title={title} showTitle={false}>
      {header}
      <View
        accessibilityRole="menu"
        className="overflow-hidden rounded-[18px] border border-border"
      >
        {options.map((o, i) => (
          <Pressable
            key={o.key}
            accessibilityRole="menuitem"
            onPress={() => {
              onClose();
              // Let this sheet slide away first: iOS cannot present a modal while another one
              // is still dismissing, and most options open a second sheet.
              setTimeout(o.onPress, SHEET_HANDOFF_MS);
            }}
            className={cn(
              'min-h-touch flex-row items-center gap-3 px-3.5',
              i > 0 && 'border-t border-border',
              o.danger ? 'bg-err-bg' : 'bg-surf active:bg-wax',
            )}
          >
            <Icon name={o.icon} size={20} color={o.danger ? 'err' : 'ink'} />
            <Text
              className={cn('text-base', o.danger ? 'font-sans-black text-err' : 'font-sans-bold')}
            >
              {o.label}
            </Text>
          </Pressable>
        ))}
      </View>
      {note ? (
        <Text tone="muted" className="text-xs">
          {note}
        </Text>
      ) : null}
    </Sheet>
  );
}
