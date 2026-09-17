export interface AnchorNavItem {
  id: string;
  label: string;
  count?: number;
}

/** Aside « Thèmes » (FAQ longue, DESIGN.md § 11.9) : ancres vers les groupes + compteurs. */
export function AnchorNav({ title = "Thèmes", items }: { title?: string; items: AnchorNavItem[] }) {
  if (items.length === 0) return null;
  return (
    <nav aria-label={title} className="rounded-card border border-border-default p-5">
      <p className="mb-3 text-sm font-bold text-neutral-700">{title}</p>
      <ul role="list" className="space-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="-mx-2 flex min-h-9 items-center justify-between gap-2 rounded-md px-2 text-[0.9375rem] font-semibold text-ink hover:bg-surface-muted hover:text-link"
            >
              <span>{item.label}</span>
              {item.count !== undefined && (
                <span className="text-sm font-normal text-muted">{item.count}</span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
