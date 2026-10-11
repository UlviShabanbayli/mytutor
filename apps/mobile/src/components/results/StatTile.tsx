import { Card, Text } from '@/components/ui';

type StatTileProps = {
  label: string;
  value: string;
};

export function StatTile({ label, value }: StatTileProps) {
  return (
    <Card className="flex-1 gap-1">
      <Text variant="title">{value}</Text>
      <Text variant="label" tone="muted">
        {label}
      </Text>
    </Card>
  );
}
