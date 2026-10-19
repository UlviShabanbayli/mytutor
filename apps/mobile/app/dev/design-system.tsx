import { Redirect } from 'expo-router';
import { ColorsSection } from '@/components/dev/ColorsSection';
import { ControlsSection } from '@/components/dev/ControlsSection';
import { LearningSection } from '@/components/dev/LearningSection';
import { MascotSection } from '@/components/dev/MascotSection';
import { Screen, ScreenHeader } from '@/components/ui';

/**
 * Developer gallery of the arı design system (/dev/design-system). Development builds only:
 * production builds redirect home, so its sample texts never reach students.
 */
export default function DesignSystemScreen() {
  if (!__DEV__) return <Redirect href="/" />;

  return (
    <Screen className="gap-8 pb-16">
      <ScreenHeader title="arı · design system" />
      <ControlsSection />
      <LearningSection />
      <MascotSection />
      <ColorsSection />
    </Screen>
  );
}
