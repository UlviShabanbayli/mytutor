// VIEW types of the ask area (photo question → AI → teacher, and the Vızı chat) for the demo.
// The real schemas come with the ask and AI APIs (architecture Ş8, Ş9) in packages/schemas.

/** Where a photo question is: queued on the device → sent → AI draft → teacher → answered. */
export type AskStatus = 'queued' | 'sent' | 'teacher_checking' | 'answered';

/** Who answers: the student's own class teacher, or the shared queue of verified teachers. */
export type AskQueue = 'teacher' | 'general';

export type SolutionStep = {
  /** What the step does, in the student's language. */
  text: string;
  /** The maths of the step, e.g. "(a + b)³ = a³ + 3a²b + 3ab² + b³". */
  formula: string;
};

export type AskTopicRef = {
  id: string;
  /** Topic number in the textbook, e.g. "4.3". */
  number: string;
  title: string;
  lessonId: string;
  lessonMinutes: number;
};

export type SimilarQuestion = {
  id: string;
  text: string;
  /** Source line text without the "Mənbə:" prefix. */
  source: string;
  topicId: string;
};

export type AskQuestion = {
  id: string;
  /** Short description of the question (written by the AI or the teacher). */
  title: string;
  /** A few characters of maths drawn on the paper thumbnail when there is no photo. */
  mark: string;
  photoUri: string | null;
  /** E.g. "Riyaziyyat 7". */
  subjectLabel: string;
  queue: AskQueue;
  /** "Lalə müəllim" for the class queue; null for the general queue. */
  teacherName: string | null;
  note: string;
  sentAt: string;
  aiSolvedAt: string | null;
  answeredAt: string | null;
  status: AskStatus;
  /** The AI's first pass: shown marked as AI until a teacher approves it. */
  aiDraft: { answer: string; steps: SolutionStep[] } | null;
  answer: {
    steps: SolutionStep[];
    /** Full name of the approving teacher. */
    teacherName: string;
    /** What the teacher changed, if anything. */
    teacherNote: string | null;
    correctedAi: boolean;
  } | null;
  /** Source line text without the "Mənbə:" prefix; null until the question is linked. */
  source: string | null;
  topic: AskTopicRef | null;
  similar: SimilarQuestion[];
};

/** Today's free-plan allowance (the server counts it by plan; P4). */
export type AskUsage = {
  photoUsed: number;
  photoLimit: number;
  chatUsed: number;
  chatLimit: number;
};

export type AskSubject = { id: string; name: string };

/** Crop rectangle as fractions (0–1) of the shown photo area. */
export type CropRect = { x: number; y: number; w: number; h: number };

export type Rotation = 0 | 90 | 180 | 270;

export type PhotoDraft = {
  uri: string;
  width: number;
  height: number;
  rotation: Rotation;
  crop: CropRect | null;
};

// ---- Vızı chat ----

/** What the student asked for; buttons send a known intent, typed text is classified. */
export type ChatIntent =
  | 'greeting'
  | 'cubeWhy'
  | 'anotherHint'
  | 'fullSolution'
  | 'cubeMinus'
  | 'explainTopic'
  | 'practice'
  | 'practiceAnswer'
  | 'mistakes'
  | 'unsure'
  | 'offtopic';

/** How Vızı answered; decides the AI label and what follows the bubble. */
export type ChatReplyKind =
  | 'welcome'
  | 'hint'
  | 'solution'
  | 'explain'
  | 'practice'
  | 'praise'
  | 'mistakes'
  | 'offtopic'
  | 'unsure';

export type ChatFollowUp = 'hintActions' | 'suggestions' | 'handoff' | 'mistakesLink' | null;

export type ChatSourceChip = { label: string; lessonId: string };

export type ChatMessage =
  | { id: string; role: 'student'; text: string }
  | {
      id: string;
      role: 'vizi';
      kind: ChatReplyKind;
      /** Paragraphs; `**…**` marks bold maths. */
      paragraphs: string[];
      sources: ChatSourceChip[];
      /** Source line text (without "Mənbə:"); null when the reply has no textbook content. */
      source: string | null;
      followUp: ChatFollowUp;
      suggestions: string[];
    };

export type ChatOrigin = 'lesson' | 'test' | 'topic' | 'ask';
