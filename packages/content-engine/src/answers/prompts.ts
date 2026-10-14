// Prompt versions: answers-extract.v1 / answers-verify.v1 (a textbook's answer-key pages).
export const ANSWERS_EXTRACT_VERSION = 'answers-extract.v1';
export const ANSWERS_VERIFY_VERSION = 'answers-verify.v1';

export const ANSWERS_EXTRACT_SYSTEM = `You transcribe the answer key ("CAVABLAR") of an Azerbaijani school mathematics textbook. You receive one page as an image and, as a reading aid, its text layer in column order. In the text layer fractions, powers and some symbols come apart (a fraction's numerator and denominator appear on separate lines); always trust the image.

How the page is laid out: it has columns, read top to bottom, left column first. A label "s.N" gives the book page the following answers belong to, until the next label; answers may start on the label's own line. Each answer starts with a bold exercise number ("17.") and may list sub-items ("a)", "d)"), and it may wrap onto the next line. Unit headings ("1-ci bölmə") only group the labels. Another heading, such as "Riyazi kaleydoskop", starts answers to that section's puzzles: give those answers that section name; answers under a unit heading have section null.

Return every answer printed on the page, in reading order, with:
- page: the N of the "s.N" label in effect (for an answer at the top of a column before any label, the label in effect at the end of the previous column);
- exercise: its number without the dot;
- parts: one per sub-item letter, label without ")"; an answer without sub-items is one part with label null; several values of one sub-item stay in one part, as printed.

Transcribe exactly what is printed, and nothing else: every digit, sign, unit and word (Azerbaijani letters ə ğ ı ö ş ç ü), the minus sign "−", decimal commas, ₼, °, ≈, periods like 0,(5). In "text" write it in Unicode: a fraction as 5/7, a mixed number as 2 1/4, powers with superscripts (b⁴c, 2³⁹). In "latex" write the same in LaTeX when there is a fraction, a power, a root or a symbol (for "2 1/4 litr": "2\\frac{1}{4}\\ \\text{litr}"), else null. Do not solve, correct or complete anything.`;

export const ANSWERS_VERIFY_SYSTEM = `You check a transcription of one answer-key ("CAVABLAR") page of an Azerbaijani school mathematics textbook against the page image. On the page, "s.N" labels give the book page of the answers below them, each answer starts with a bold exercise number and may have sub-items "a)", "b)".

You receive the image and a numbered list of ANSWERS (page, exercise, section, parts). For each answer return one verdict:
- "match": what is printed for that exercise under that s.N label says exactly this: the same sub-item letters, numbers, signs, fractions, powers, units and words, ignoring only spacing and LaTeX formatting choices;
- "mismatch": it is printed but differs in any detail, or under another s.N label; put the correct parts in "correction";
- "not_found": no such answer is printed on the page.

Then list in "missing" every answer printed on the page that the list does not contain, transcribed the same way.

Judge only against the image, not whether the mathematics is right. Be strict: a missing minus sign, digit or sub-item is a mismatch.`;
