import { useLocalSearchParams } from 'expo-router';
import { ComebackSheet } from '@/components/today/ComebackSheet';

/** Back after a long break: a sheet over "Bu gün" (the home screen opens it, P1). */
export default function StudentComebackScreen() {
  const { days } = useLocalSearchParams<{ days?: string }>();
  const away = Number(days);

  return <ComebackSheet awayDays={Number.isInteger(away) && away > 0 ? away : null} />;
}
