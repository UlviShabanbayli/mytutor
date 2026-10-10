import { constants, inflateSync } from 'node:zlib';

/**
 * Reads what pdf.js does not expose: the embedded TrueType programs (glyph count and their own
 * cmap tables), straight from the PDF's objects.
 *
 * Why: many textbook PDFs embed font subsets whose ToUnicode maps cover only some glyphs, so
 * the text layer shows raw glyph ids for the rest. Another subset of the same font in the same
 * file often keeps its cmap, which tells the real character of every glyph id. Nothing here is
 * specific to one book.
 */

export type EmbeddedFont = {
  /** FontDescriptor /FontName, e.g. "GPFMAM+SegoeUI". */
  name: string;
  numGlyphs: number;
  /** Glyph id → Unicode code point, from the font program's own cmap (often empty in subsets). */
  cmap: Map<number, number>;
};

/** What a composite (Type0) font adds to its embedded program. */
export type CompositeFont = {
  /** Code ranges its ToUnicode map sends to the same code point (code 65 → "A"), inclusive. */
  selfMapped: [number, number][];
  /** Glyph id per CID (2 bytes each, big-endian), when the CIDFont has a CIDToGIDMap stream. */
  cidToGid: Buffer | null;
};

export type PdfFontTables = {
  fonts: EmbeddedFont[];
  /** By the descendant font's FontName, the name pdf.js reports for the font. */
  composites: Map<string, CompositeFont>;
  /** An encrypted PDF's streams cannot be read here: no tables, callers keep pdf.js's text. */
  encrypted: boolean;
};

const latin1 = (bytes: Uint8Array) => Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);

function streamData(body: string): Buffer | null {
  const start = /stream\r?\n/.exec(body);
  const end = body.lastIndexOf('endstream');
  if (!start || end < 0) return null;
  let raw = body.slice(start.index + start[0].length, end);
  raw = raw.replace(/\r?\n$/, '');
  const data = Buffer.from(raw, 'latin1');
  if (!/\/FlateDecode/.test(body.slice(0, start.index))) return data;
  try {
    return inflateSync(data, { finishFlush: constants.Z_SYNC_FLUSH });
  } catch {
    return null;
  }
}

/**
 * All indirect objects by number, including those packed into object streams. A PDF saved with
 * incremental updates defines objects more than once; the definition later in the file wins,
 * which is what the newest cross-reference section would say.
 */
function readObjects(text: string): Map<number, string> {
  const found = new Map<number, { body: string; at: number }>();
  const put = (num: number, body: string, at: number) => {
    const known = found.get(num);
    if (!known || at >= known.at) found.set(num, { body, at });
  };
  const streams: { body: string; at: number }[] = [];
  for (const m of text.matchAll(/(\d+)\s+\d+\s+obj\b([\s\S]*?)endobj/g)) {
    const body = m[2] ?? '';
    put(Number(m[1]), body, m.index);
    if (/\/Type\s*\/ObjStm/.test(body)) streams.push({ body, at: m.index });
  }
  for (const { body, at } of streams) {
    const data = streamData(body);
    const first = Number(/\/First\s+(\d+)/.exec(body)?.[1]);
    if (!data || !Number.isFinite(first)) continue;
    const content = data.toString('latin1');
    const header = content.slice(0, first).trim().split(/\s+/).map(Number);
    for (let i = 0; i + 1 < header.length; i += 2) {
      const from = first + (header[i + 1] ?? 0);
      const to = i + 3 < header.length ? first + (header[i + 3] ?? 0) : content.length;
      // Objects in a stream count as defined where the stream is.
      put(header[i] ?? -1, content.slice(from, to), at);
    }
  }
  return new Map([...found].map(([num, { body }]) => [num, body]));
}

type Table = { offset: number; length: number };

function cmapSubtable(buf: Buffer, at: number, out: Map<number, number>) {
  const format = buf.readUInt16BE(at);
  const set = (gid: number, code: number) => {
    if (gid !== 0 && !out.has(gid)) out.set(gid, code);
  };
  if (format === 4) {
    const segX2 = buf.readUInt16BE(at + 6);
    const ends = at + 14;
    const starts = ends + segX2 + 2;
    const deltas = starts + segX2;
    const ranges = deltas + segX2;
    for (let s = 0; s < segX2 / 2; s++) {
      const end = buf.readUInt16BE(ends + 2 * s);
      const start = buf.readUInt16BE(starts + 2 * s);
      const delta = buf.readInt16BE(deltas + 2 * s);
      const rangeAt = ranges + 2 * s;
      const range = buf.readUInt16BE(rangeAt);
      for (let c = start; c <= end && c !== 0xffff; c++) {
        if (range === 0) set((c + delta) & 0xffff, c);
        else {
          const g = buf.readUInt16BE(rangeAt + range + 2 * (c - start));
          if (g !== 0) set((g + delta) & 0xffff, c);
        }
      }
    }
  } else if (format === 12) {
    const groups = buf.readUInt32BE(at + 12);
    for (let i = 0; i < groups; i++) {
      const g = at + 16 + 12 * i;
      const startChar = buf.readUInt32BE(g);
      const endChar = buf.readUInt32BE(g + 4);
      const startGlyph = buf.readUInt32BE(g + 8);
      for (let c = startChar; c <= endChar; c++) set(startGlyph + (c - startChar), c);
    }
  }
}

/** Glyph count and Unicode cmap of a TrueType/OpenType program; null for anything else (bare CFF). */
export function parseTrueType(
  buf: Buffer,
): { numGlyphs: number; cmap: Map<number, number> } | null {
  try {
    const version = buf.readUInt32BE(0);
    // TrueType (0x00010000, 'true') or OpenType with CFF outlines ('OTTO'): same table layout.
    if (version !== 0x00010000 && version !== 0x74727565 && version !== 0x4f54544f) return null;
    const tables = new Map<string, Table>();
    const count = buf.readUInt16BE(4);
    for (let i = 0; i < count; i++) {
      const rec = 12 + 16 * i;
      tables.set(buf.toString('latin1', rec, rec + 4), {
        offset: buf.readUInt32BE(rec + 8),
        length: buf.readUInt32BE(rec + 12),
      });
    }
    const maxp = tables.get('maxp');
    if (!maxp) return null;
    const numGlyphs = buf.readUInt16BE(maxp.offset + 4);
    const cmap = new Map<number, number>();
    const table = tables.get('cmap');
    if (table) {
      const subtables = buf.readUInt16BE(table.offset + 2);
      for (let i = 0; i < subtables; i++) {
        const rec = table.offset + 4 + 8 * i;
        const platform = buf.readUInt16BE(rec);
        const encoding = buf.readUInt16BE(rec + 2);
        // Unicode subtables only: platform 0, or Windows Unicode BMP (1) / full (10).
        if (platform !== 0 && !(platform === 3 && (encoding === 1 || encoding === 10))) continue;
        cmapSubtable(buf, table.offset + buf.readUInt32BE(rec + 4), cmap);
      }
    }
    return { numGlyphs, cmap };
  } catch {
    return null;
  }
}

const NAME = /\/(?:FontName|BaseFont)\s*\/([^\s/<>[\]()]+)/;

const hex = (token: string) => parseInt(token.slice(1, -1), 16);

/**
 * Code ranges a ToUnicode CMap maps to themselves: `<0041> <0041>` in a bfchar block, or
 * `<0020> <007E> <0020>` in a bfrange block. pdf.js shows an unmapped code as itself too, so
 * only these say that such a glyph really is mapped.
 */
export function selfMappedCodes(cmap: string): [number, number][] {
  const ranges: [number, number][] = [];
  // A one-unit UTF-16 destination; longer ones (ligatures, surrogates) never equal a code.
  const single = (token: string) => token.length <= 6;
  for (const [, body = ''] of cmap.matchAll(/beginbfchar([\s\S]*?)endbfchar/g)) {
    const t = body.match(/<[0-9a-fA-F]+>/g) ?? [];
    for (let i = 0; i + 1 < t.length; i += 2) {
      const [src = '', dst = ''] = [t[i], t[i + 1]];
      if (single(dst) && hex(dst) === hex(src)) ranges.push([hex(src), hex(src)]);
    }
  }
  for (const [, body = ''] of cmap.matchAll(/beginbfrange([\s\S]*?)endbfrange/g)) {
    // Each entry is <lo> <hi> followed by one destination or an array of them.
    const t = body.match(/<[0-9a-fA-F]+>|\[[^\]]*\]/g) ?? [];
    for (let i = 0; i + 2 < t.length; i += 3) {
      const [lo = '', hi = '', dst = ''] = [t[i], t[i + 1], t[i + 2]];
      if (dst.startsWith('<') && single(dst) && hex(dst) === hex(lo))
        ranges.push([hex(lo), hex(hi)]);
    }
  }
  return ranges;
}

const refTo = (body: string, key: string) =>
  new RegExp(`/${key}\\s*(\\d+)\\s+\\d+\\s+R`).exec(body)?.[1];

/** Type0 fonts by their descendant's FontName: self-mapped codes and the CID → glyph id map. */
function readComposites(objects: Map<number, string>): Map<string, CompositeFont> {
  const composites = new Map<string, CompositeFont>();
  const get = (ref: string | undefined) => (ref ? objects.get(Number(ref)) : undefined);
  for (const body of objects.values()) {
    if (!/\/Subtype\s*\/Type0\b/.test(body)) continue;
    // /DescendantFonts [12 0 R], or a reference to an object holding that array.
    const list = /\/DescendantFonts\s*(\[[^\]]*\]|\d+\s+\d+\s+R)/.exec(body)?.[1] ?? '';
    const array = list.startsWith('[') ? list : (get(/^(\d+)/.exec(list)?.[1]) ?? '');
    const cidFont = get(/(\d+)\s+\d+\s+R/.exec(array)?.[1]);
    const name = cidFont ? NAME.exec(get(refTo(cidFont, 'FontDescriptor')) ?? '')?.[1] : undefined;
    if (!cidFont || !name) continue;
    const toUnicode = get(refTo(body, 'ToUnicode'));
    const cmap = toUnicode ? streamData(toUnicode)?.toString('latin1') : undefined;
    const gidMap = get(refTo(cidFont, 'CIDToGIDMap'));
    const known = composites.get(name);
    // Several Type0 fonts may share one descendant, each with its own ToUnicode map.
    composites.set(name, {
      selfMapped: [...(known?.selfMapped ?? []), ...(cmap ? selfMappedCodes(cmap) : [])],
      cidToGid: known?.cidToGid ?? (gidMap ? streamData(gidMap) : null),
    });
  }
  return composites;
}

export function readPdfFontTables(bytes: Uint8Array): PdfFontTables {
  const text = latin1(bytes).toString('latin1');
  // The trailer (or cross-reference stream) dictionary itself is never encrypted.
  if (/\/Encrypt\s*(?:\d+\s+\d+\s+R|<<)/.test(text))
    return { fonts: [], composites: new Map(), encrypted: true };
  const objects = readObjects(text);
  const fonts: EmbeddedFont[] = [];
  for (const body of objects.values()) {
    if (/\/Type\s*\/FontDescriptor/.test(body)) {
      const name = NAME.exec(body)?.[1];
      const ref = /\/FontFile[23]\s+(\d+)\s+\d+\s+R/.exec(body)?.[1];
      const program = ref ? objects.get(Number(ref)) : undefined;
      const data = program ? streamData(program) : null;
      const parsed = data ? parseTrueType(data) : null;
      if (name && parsed) fonts.push({ name, ...parsed });
    }
  }
  return { fonts, composites: readComposites(objects), encrypted: false };
}
