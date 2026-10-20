import { useLocalSearchParams } from 'expo-router';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ChatHeader } from '@/components/parent/ChatHeader';
import { ChatThread } from '@/components/parent/ChatThread';
import { QueryView } from '@/components/parent/QueryView';
import { EmptyState } from '@/components/ui';
import { useThread } from '@/features/parent/queries';

/** The parent's conversation with the child's teacher (architecture V3). */
export default function ParentChatScreen() {
  const { t } = useTranslation();
  const { threadId } = useLocalSearchParams<{ threadId: string }>();
  const thread = useThread(threadId);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-page">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ChatHeader contact={thread.data ?? null} />
        <QueryView query={thread}>
          {(found) =>
            found ? (
              <ChatThread thread={found} />
            ) : (
              <EmptyState
                moment="aiThinking"
                title={t('parent.chat.notFoundTitle')}
                description={t('parent.chat.notFoundBody')}
              />
            )
          }
        </QueryView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
