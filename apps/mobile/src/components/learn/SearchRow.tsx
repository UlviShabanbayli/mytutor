import type { ReactNode } from 'react';
import { Pressable } from 'react-native';

type SearchRowProps = { accessibilityLabel: string; onPress: () => void; children: ReactNode };

/** A tappable search result row. */
export function SearchRow({ accessibilityLabel, onPress, children }: SearchRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className="min-h-[60px] flex-row items-center gap-3 rounded-lg border border-border bg-surf px-3 py-2 active:opacity-80"
    >
      {children}
    </Pressable>
  );
}
