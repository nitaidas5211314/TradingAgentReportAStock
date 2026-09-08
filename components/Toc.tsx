"use client";

import { useEffect, useState } from "react";

export interface TocItem {
  id: string;
  title: string;
  level: number;
}

export default function Toc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    const targets = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="目录" className="text-sm">
      <div className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">
        目录
      </div>
      <ul className="space-y-0.5 border-l border-line">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`block truncate border-l-2 py-1 transition ${
                item.level === 3 ? "pl-5 text-xs" : "pl-3"
              } ${
                active === item.id
                  ? "border-[color:var(--accent)] text-[color:var(--accent)] font-medium"
                  : "border-transparent text-muted hover:text-[color:var(--fg)]"
              }`}
              style={{ marginLeft: -1 }}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
