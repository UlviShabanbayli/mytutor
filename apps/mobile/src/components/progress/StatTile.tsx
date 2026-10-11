import { Card, Text } from '@/components/ui';

type StatTileProps = {
  label: string;
  value: string;
  tone?: 'default' | 'success' | 'destructive';
};

export function StatTile({ label, value, tone = 'default' }: StatTileProps) {
  return (
    <Card className="flex-1 gap-0.5 p-3">
      <Text tone={tone} className="font-sans-black text-xl">
        {value}
      </Text>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
    </Card>
  );
}
