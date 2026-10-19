import { Stack } from 'expo-router';

/** Parent screens: the tabs and the screens pushed above them (URLs under /parent). */
export default function ParentLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
