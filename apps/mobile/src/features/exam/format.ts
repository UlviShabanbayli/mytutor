/** "1 248": thousands joined by a no-break space (platform Intl data for `az` is often missing). */
export function groupThousands(value: number): string {
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
