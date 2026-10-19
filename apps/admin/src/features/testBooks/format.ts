/** "12,4 MB" in the panel's language. */
export const formatMegabytes = (bytes: number, language: string) =>
  `${new Intl.NumberFormat(language, { maximumFractionDigits: 1 }).format(bytes / 1024 / 1024)} MB`;

/** Day, month and year as numbers: browsers without Azerbaijani month names print "M10". */
export const formatDay = (iso: string, language: string) =>
  new Intl.DateTimeFormat(language, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    new Date(iso),
  );
