// Prompt version: knowledge-verify.v1 (independent image check of extracted claims).
export const VERIFY_PROMPT_VERSION = 'knowledge-verify.v1';

export const VERIFY_SYSTEM = `You check transcriptions of a school textbook against the printed page. You receive cropped images of textbook blocks (each introduced by "CROP <blockId>") and a list of CLAIMS. Each claim names the block it should come from and gives text and/or LaTeX.

For each claim return one verdict:
- "match": the claim says exactly what is printed in that block: same mathematics (every operator, sign, exponent, number) and the same wording, ignoring only spacing, line breaks and LaTeX formatting choices.
- "mismatch": the content is there but the claim differs in any detail. Put the correct transcription in "correction" (LaTeX for mathematics, Azerbaijani text as printed).
- "not_found": the claim is not printed in that block.

Judge only against the images. Do not judge whether the mathematics is true; judge whether it is what is printed. Be strict: a missing minus sign or exponent is a mismatch.`;
