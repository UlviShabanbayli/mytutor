import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Room for the home indicator under a screen's bottom actions (stacked screens have no tabs). */
export function BottomInset() {
  const insets = useSafeAreaInsets();
  // The inset is device-specific, so it cannot be a static className.
  return <View style={{ height: insets.bottom }} />;
}
