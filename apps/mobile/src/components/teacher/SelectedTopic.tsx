import { View } from 'react-native';
import { SourceLine, Text } from '@/components/ui';

type SelectedTopicProps = { title: string; source: string };

/** The chosen topic in words with its textbook source. */
export function SelectedTopic({ title, source }: SelectedTopicProps) {
  return (
    <View className="gap-1 rounded-md bg-raised px-3 py-2">
      <Text className="font-sans-black">{title}</Text>
      <SourceLine source={source} />
    </View>
  );
}
