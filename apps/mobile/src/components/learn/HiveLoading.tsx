import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HiveHeader } from './HiveHeader';
import { HiveSkeleton } from './HiveSkeleton';

const LEGEND = [1, 2, 3, 4, 5];

/** The hive box screen while its data loads (design "Pətək · yüklənir"). */
export function HiveLoading() {
  return (
    <SafeAreaView className="flex-1 bg-page">
      <HiveHeader hive={null} saved={false} onDownload={() => undefined} />
      <View className="flex-row justify-between gap-2.5 px-4 pb-3 pt-3.5">
        {LEGEND.map((n) => (
          <View key={n} className="h-3.5 flex-1 rounded-full bg-wax" />
        ))}
      </View>
      <View className="mx-3 mb-2.5 flex-1 overflow-hidden rounded-2xl bg-box px-2.5 py-3">
        <HiveSkeleton />
      </View>
    </SafeAreaView>
  );
}
