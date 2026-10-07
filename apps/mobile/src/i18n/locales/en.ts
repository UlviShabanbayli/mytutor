import type { TranslationResource } from './az';

export const en: TranslationResource = {
  common: {
    appName: 'MyTutor',
    loading: 'Loading…',
    retry: 'Try again',
    errorTitle: 'Something went wrong',
    errorDescription: 'Check your internet connection and try again.',
    comingSoon: 'Coming soon',
  },
  tabs: {
    home: 'Home',
    ask: 'Ask',
    profile: 'Profile',
  },
  home: {
    greeting: 'Hi there!',
    subtitle: 'What are we learning today?',
    askTitle: 'Got a question?',
    askDescription: "Snap a photo of a problem you can't solve and get a step-by-step answer.",
    askAction: 'Ask a question',
    recentTitle: 'My questions',
    recentEmptyTitle: 'No questions yet',
    recentEmptyDescription: 'Your questions and their answers will appear here.',
  },
  ask: {
    title: 'Ask a question',
    emptyDescription: "Here you'll photograph a question and get an answer from a teacher.",
  },
  profile: {
    title: 'Profile',
    emptyDescription: 'Your profile will appear here after you sign in.',
  },
};
