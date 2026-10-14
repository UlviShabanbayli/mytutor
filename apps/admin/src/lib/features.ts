/**
 * Official standard sets and their links (the "Standartlar" step) are switched off until after
 * the demo. Their code, data and server routes stay; setting this to true brings back every
 * screen: the sidebar entry, the step in the overview, book and review headers, topic links and
 * the guide sections.
 */
export const STANDARDS_ENABLED = false;

/** Steps from textbook to lesson the panel shows: source, knowledge, review, (standards,) lesson. */
export const PIPELINE_STEPS = STANDARDS_ENABLED ? 5 : 4;
