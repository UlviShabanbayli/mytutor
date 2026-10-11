/** Printed page number for a PDF page; the book's page labels are offset from PDF pages. */
export function printedPage(pdfPage: number, offset: number | null): number {
  return offset === null ? pdfPage : pdfPage - offset;
}

export function bookTitle(book: { title: string | null; file: string }): string {
  return book.title ?? book.file.replace(/\.pdf$/i, '');
}
