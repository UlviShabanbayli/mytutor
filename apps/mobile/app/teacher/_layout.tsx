import { Stack } from 'expo-router';

/** Teacher screens: the tabs and the screens pushed above them (URLs under /teacher). */
export default function TeacherLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
