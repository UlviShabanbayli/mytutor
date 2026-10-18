import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Icon, type IconName, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

type ReportTileProps = {
  icon: IconName;
  /** Shown in CAPS ("VAXT"). */
  label: string;
  /** Spoken name of the whole tile. */
  accessibilityLabel: string;
  children: ReactNode;
  className?: string;
};

/** A white report card with a small CAPS label on top. */
export function ReportTile({
  icon,
  label,
  accessibilityLabel,
  children,
  className,
}: ReportTileProps) {
  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      className={cn(
        'min-w-0 gap-1.5 rounded-[18px] border border-border bg-surf px-3 py-2.5',
        className,
      )}
    >
      <View className="flex-row items-center gap-1.5">
        <Icon name={icon} size={14} color="muted" />
        <Text className="min-w-0 flex-1 font-sans-black text-2xs uppercase tracking-[0.9px] text-muted">
          {label}
        </Text>
      </View>
      {children}
    </View>
  );
}

/** The big Unbounded number of a tile ("82%"). */
export function TileValue({ children }: { children: string }) {
  return <Text className="font-display-black text-lg">{children}</Text>;
}
