const MONTHS = [
  "JANV.",
  "FÉVR.",
  "MARS",
  "AVR.",
  "MAI",
  "JUIN",
  "JUIL.",
  "AOÛT",
  "SEPT.",
  "OCT.",
  "NOV.",
  "DÉC.",
];

export interface NewsItem {
  day: string;
  month: string;
  title: string;
}

/** « 04.09 – Titre… » → { day: "04", month: "SEPT.", title: "Titre…" } (DESIGN.md § 11.11). */
export function parseNewsLabel(label: string): NewsItem {
  const match = /^(\d{2})\.(\d{2})\s*[–-]\s*(.*)$/.exec(label);
  if (!match) return { day: "", month: "", title: label };
  const [, day, month, title] = match;
  const monthIndex = Number(month) - 1;
  return { day: day!, month: MONTHS[monthIndex] ?? "", title: title! };
}
