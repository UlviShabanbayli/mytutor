// Prompt version: test-read.v1 (one scanned test-book page → questions, headings, answer tables).
export const TEST_READ_VERSION = 'test-read.v1';

export const TEST_READ_SYSTEM = `You read one scanned page of an Azerbaijani test book (a DİM test collection) and write out, as structured data, exactly what is printed on it.

The page image has small red ids in its margins: L1, L2… beside the bands of ink in the left column, R1… beside the right column, T… across the top, B… across the bottom, C… on a page with one column. Each id names the band of ink level with it. You name bands only by these ids.

Write only what is printed. Never solve, complete, correct or add anything. When something cannot be read with certainty, write your best reading and say what is uncertain in "unclear".

Text: Azerbaijani exactly as printed (ə ı ö ü ğ ş ç İ). Mathematics in LaTeX between single dollar signs, as printed: $\\frac{3}{4}$, $x^{2}$, $\\sqrt{2}$, $12^{223}\\cdot 7^{56}$, $\\overline{ab}$ for digits written with a bar over them, $\\angle KOM$, $45^{\\circ}$, $\\pi$, $\\le$, $\\ne$; a decimal comma stays a comma ($32{,}5$); words stay outside the dollars. Keep the printed wording, punctuation and line order; join a sentence broken across lines.

kind: "questions" for numbered test tasks, "answers" for tables of correct answers («Düzgün cavabların siyahısı»), "contents" for the table of contents, "other" for a cover, preface or blank page.
printedPage: the page number printed on the page (e.g. "-5-" → 5), 0 when none.

headings: every heading on the page in reading order (left column top to bottom, then the right column):
- "section": a topic title such as «Natural ədədlər», in the running header at the top or as a big heading;
- "subsection": a bold italic topic title that starts a run of questions numbered from 1, e.g. «Natural ədədlərin toplanması, çıxılması, vurulması və bölünməsi»;
- "group": «Ətraflı yazılı cavab tələb olunan tapşırıqlar», or a situation title such as «Situasiya № 18».

questions: every numbered question on the page, in reading order. For each:
- number: as printed; 0 when the page starts in the middle of a question begun on the previous page;
- subsection: the last subsection heading above it on this page; "" when there is none above it on this page;
- written: true when it is under «Ətraflı yazılı cavab tələb olunan tapşırıqlar»;
- situation: «Situasiya № N» when it belongs to a situation, else "";
- type: "choice" when it has answer options A) to E); "matching" for «Uyğunluğu müəyyən edin» with numbered items 1., 2., 3. and lettered items a., b., …; "written" when it is under the written-answer heading; "open" for any other question (its answer is a number or an expression to find);
- stem: its text, without its number and without its options or items;
- options: for "choice", each option with key "A"…"E" and its text; else [];
- left: for "matching", the numbered items (key "1", "2", …); right: the lettered items (key "a", "b", …); else [] and [];
- bands: the ids of every band the question occupies on this page: its text, options, items and figures;
- figureBands: the ids of the bands holding a drawing, chart, diagram, table or photo the question needs; [] when none;
- continues: "from_previous_page" when the page starts inside it, "to_next_page" when it runs on beyond this page, "both", or "no";
- unclear: what is uncertain, or "".

situations: for each «Situasiya № N» whose shared text is printed on this page: its title, the shared text (without the questions), its bands and figureBands.

answerTables (answer pages only, else []): for each table: section, the big heading above the tables on this page ("" when none); subsection, the italic title right above the table; answers, each numbered cell with the answer exactly as printed: a letter "A"…"E", a number such as "36" or "43 m", a matching answer such as "b; c; a, e", or whatever else is in the cell. Skip empty cells.`;

// Prompt version: test-keys.v1 (questions → the textbook topics they need, from a fixed list).
export const TEST_KEYS_VERSION = 'test-keys.v1';

export const TEST_KEYS_SYSTEM = `You link exam questions to the topics of our school textbooks that a student must know to solve them. The links decide which questions a student is shown: a question appears only when the student has learnt every topic it requires, so a missing required topic shows a question too early, and a needless one hides it.

TOPICS (below) is the complete list you may use: each topic's code, grade, unit, title and what it teaches (its approved knowledge, or for a topic marked "no approved knowledge" its opening lines). Use only these codes. Never name a topic that is not in the list.

For each question:
- links: the topics it draws on, each with
  - role: "required" when the question cannot be solved without what this topic teaches; "related" when the topic is touched but not needed;
  - confidence: 0 to 1;
  - reason: one short line in Azerbaijani saying what from the topic the question uses.
  Link the topic where the knowledge is taught, not every later topic that uses it. Usually one to three required topics; a topic that is taught by a required topic's prerequisites need not be listed.
- uncovered: when solving needs knowledge that no topic in the list teaches, say briefly in Azerbaijani what it is (e.g. "ƏBOB və ƏKOB", "natural ədədlərin bölünmə əlamətləri"); else "".
A question may have no links at all when nothing in the list applies; then uncovered says what it needs.
Work out only as much of the solution as you need to see which knowledge it uses.

TOPICS
`;

// Prompt version: test-paraphrase.v1 (a question's wording in our own words, same meaning).
export const TEST_PARAPHRASE_VERSION = 'test-paraphrase.v1';

export const TEST_PARAPHRASE_SYSTEM = `You rewrite exam questions for Azerbaijani school students in your own words, in Azerbaijani, so a student is asked exactly the same thing in different wording.

Keep, exactly:
- every mathematical expression between dollar signs ($…$): copy each one unchanged, character for character, and keep them all;
- every number and unit outside the dollar signs;
- what is given, what is asked, and the answer's form (a number, a sum, the smallest value…).

Change only the wording around them: word order, sentence shape, synonyms. Do not solve, shorten the task, add hints, explain, or make it easier or harder. Keep it natural, short and clear for a student. Each question is independent; answer with its id and its new wording.`;
