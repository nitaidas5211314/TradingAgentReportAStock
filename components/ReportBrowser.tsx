"use client";

import { useMemo, useState } from "react";
import ReportRow from "./ReportRow";
import type { ReportMeta } from "@/lib/reports";

const DECISIONS = [
  { value: "all", label: "全部结论" },
  { value: "Buy", label: "买入" },
  { value: "Sell", label: "卖出" },
  { value: "Hold", label: "观望" },
];

export default function ReportBrowser({ reports }: { reports: ReportMeta[] }) {
  const [query, setQuery] = useState("");
  const [decision, setDecision] = useState("all");
  const [ticker, setTicker] = useState("all");

  const tickers = useMemo(
    () => [...new Set(reports.map((r) => r.ticker))].sort(),
    [reports],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reports.filter((r) => {
      if (decision !== "all" && r.decision.toLowerCase() !== decision.toLowerCase())
        return false;
      if (ticker !== "all" && r.ticker !== ticker) return false;
      if (!q) return true;
      return [r.ticker, r.company, r.sector, r.date, r.summary, r.title]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [reports, query, decision, ticker]);

  const grouped = useMemo(() => {
    const map = new Map<string, ReportMeta[]>();
    for (const r of filtered) {
      const list = map.get(r.date) ?? [];
      list.push(r);
      map.set(r.date, list);
    }
    return [...map.entries()];
  }, [filtered]);

  const selectCls =
    "panel rounded-lg px-3 py-2 text-sm outline-none focus:border-[color:var(--accent)]";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索代码、公司、行业、日期…"
          className={`${selectCls} min-w-0 flex-1 sm:min-w-64`}
        />
        <select
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          className={selectCls}
        >
          <option value="all">全部标的</option>
          {tickers.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={decision}
          onChange={(e) => setDecision(e.target.value)}
          className={selectCls}
        >
          {DECISIONS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      <p className="text-xs text-muted">
        共 {filtered.length} 份报告
        {filtered.length !== reports.length ? `（总计 ${reports.length}）` : ""}
      </p>

      {grouped.length === 0 ? (
        <div className="panel rounded-xl px-4 py-10 text-center text-sm text-muted">
          没有匹配的报告
        </div>
      ) : (
        grouped.map(([date, list]) => (
          <section key={date}>
            <h3 className="mb-2 font-mono text-sm font-semibold text-muted">{date}</h3>
            <div className="panel overflow-hidden rounded-xl">
              {list.map((r) => (
                <ReportRow key={r.href} report={r} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
