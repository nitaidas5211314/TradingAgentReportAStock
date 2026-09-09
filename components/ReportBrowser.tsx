"use client";

import { useMemo, useState } from "react";
import ReportRow from "./ReportRow";
import { ASSET_LABELS } from "@/lib/labels";
import { MARKETS, MARKET_ORDER, type MarketId } from "@/lib/market";
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
  const [assetType, setAssetType] = useState("all");
  const [market, setMarket] = useState("all");

  const tickers = useMemo(
    () =>
      [
        ...new Set(
          reports.filter((r) => market === "all" || r.market === market).map((r) => r.ticker),
        ),
      ].sort(),
    [reports, market],
  );

  // 只在覆盖多个市场（如 A 股 + 港股）时才显示市场筛选
  const markets = useMemo(() => {
    const present = new Set(reports.map((r) => r.market));
    return MARKET_ORDER.filter((m) => present.has(m));
  }, [reports]);

  // 资产类型与市场高度重合（加密既是类型也是市场），
  // 只有当同一个市场里出现多种资产类型（如美股的股票 + ETF）时才值得单独筛选
  const assetTypes = useMemo(() => {
    const byMarket = new Map<string, Set<string>>();
    for (const r of reports) {
      if (!r.assetType) continue;
      const set = byMarket.get(r.market) ?? new Set<string>();
      set.add(r.assetType);
      byMarket.set(r.market, set);
    }
    const useful = [...byMarket.values()].some((set) => set.size > 1);
    return useful
      ? [...new Set(reports.map((r) => r.assetType).filter(Boolean) as string[])].sort()
      : [];
  }, [reports]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reports.filter((r) => {
      if (decision !== "all" && r.decision.toLowerCase() !== decision.toLowerCase())
        return false;
      if (market !== "all" && r.market !== market) return false;
      if (ticker !== "all" && r.ticker !== ticker) return false;
      if (assetType !== "all" && r.assetType !== assetType) return false;
      if (!q) return true;
      return [r.ticker, r.company, r.sector, r.date, r.summary, r.title]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [reports, query, decision, ticker, assetType, market]);

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
        {markets.length > 1 ? (
          <select
            value={market}
            onChange={(e) => {
              setMarket(e.target.value);
              setTicker("all");
            }}
            className={selectCls}
          >
            <option value="all">全部市场</option>
            {markets.map((m) => (
              <option key={m} value={m}>
                {MARKETS[m as MarketId].label}
              </option>
            ))}
          </select>
        ) : null}
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
        {assetTypes.length > 0 ? (
          <select
            value={assetType}
            onChange={(e) => setAssetType(e.target.value)}
            className={selectCls}
          >
            <option value="all">全部类型</option>
            {assetTypes.map((t) => (
              <option key={t} value={t}>
                {ASSET_LABELS[t] ?? t}
              </option>
            ))}
          </select>
        ) : null}
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
