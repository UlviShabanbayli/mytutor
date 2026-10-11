/**
 * "riyaziyyat-7-ci-sinif_1.pdf" → "riyaziyyat 7-ci sinif 1": a starting point for the title.
 * Hyphens become spaces except before an ordinal suffix ("7-ci").
 */
export function titleFromFileName(name: string): string {
  return name
    .replace(/\.pdf$/i, '')
    .replace(/_+/g, ' ')
    .replace(/-(?!(?:ci|cı|cu|cü)(?![a-zəıöüğşç]))/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
