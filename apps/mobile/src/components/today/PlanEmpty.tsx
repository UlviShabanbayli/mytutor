import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, Card, Text } from '@/components/ui';

/** Nothing planned, nothing to continue: point to the subjects (no mascot; one per screen). */
export function PlanEmpty() {
  const { t } = useTranslation();

  return (
    <Card className="gap-2">
      <Text variant="subheading" accessibilityRole="header">
        {t('today.plan.emptyTitle')}
      </Text>
      <Text tone="muted" className="text-sm">
        {t('today.plan.emptyBody')}
      </Text>
      <Button
        label={t('today.error.toLearn')}
        variant="secondary"
        size="md"
        onPress={() => router.push('/learn')}
        className="mt-1"
      />
    </Card>
  );
}
