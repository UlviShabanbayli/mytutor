import { Pressable } from 'react-native';
import { Icon, Text } from '@/components/ui';

type SectionLinkProps = {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
};

/** The honey "Hamısı · 3 ›" link at the end of a section heading. */
export function SectionLink({ label, accessibilityLabel, onPress }: SectionLinkProps) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={6}
      className="-mr-1 min-h-touch flex-row items-center gap-0.5 px-1 active:opacity-70"
    >
      <Text className="font-sans-black text-sm text-honey-text">{label}</Text>
      <Icon name="chevron" size={16} color="honey-text" />
    </Pressable>
  );
}
