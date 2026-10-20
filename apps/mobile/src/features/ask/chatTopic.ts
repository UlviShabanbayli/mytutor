import { r7, topicById } from '@mytutor/demo-data';

const id = r7('4.3');
const topic = topicById(id);

/**
 * The topic Vızı's scripted chat is about: the student's current lesson in the demo world,
 * 4.3 (the replies talk about cubes). Its title and first page come from the world's table of
 * contents; the lesson's reading time is the chat script's own.
 */
export const CHAT_TOPIC = {
  id,
  number: topic?.number ?? '4.3',
  title: topic?.shortTitle ?? '',
  page: topic?.pages.start ?? 0,
  minutes: 8,
} as const;
