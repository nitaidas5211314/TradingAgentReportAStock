import Link from "next/link";
import DecisionBadge from "@/components/DecisionBadge";
import Markdown from "@/components/Markdown";
import ReportRow from "@/components/ReportRow";
import StatCard from "@/components/StatCard";
import { ASSET_LABELS } from "@/lib/labels";
import { SITE } from "@/lib/site";
import {
  getAllReportMetas,
  getLatestSummary,
  getStats,
  getTickers,
} from "@/lib/reports";

export default function HomePage() {
  const stats = getStats();
  const tickers = getTickers();
  const recent = getAllReportMetas().slice(0, 8);
  const summary = getLatestSummary();

  const decisionMix = [...stats.latestDecisions.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([d, n]) => `${d} ${n}`)
    .join(" · ");

  const hasSummary = summary !== undefined;

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {SITE.heading}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          归档并浏览 TradingAgents 每次跑图产出的完整报告：技术面、新闻宏观、基本面、
          多空辩论、交易员方案与风控最终决定。
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="报告总数" value={stats.totalReports} />
        <StatCard label="覆盖标的" value={stats.totalTickers} />
        <StatCard label="跑图天数" value={stats.tradingDays} />
        <StatCard
          label="最新交易日"
          value={<span className="font-mono text-xl">{stats.latestDate ?? "—"}</span>}
          hint={decisionMix || undefined}
        />
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold tracking-tight">标的最新结论</h2>
          <Link href="/tickers" className="text-sm text-[color:var(--accent)] hover:underline">
            查看全部 →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tickers.map((t) => (
            <Link
              key={t.ticker}
              href={`/tickers/${t.ticker}`}
              className="panel group flex flex-col rounded-xl p-4 transition hover:border-[color:var(--accent)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-mono text-base font-semibold">{t.ticker}</div>
                  <div className="mt-0.5 truncate text-sm text-muted">
                    {t.company ?? "—"}
                  </div>
                </div>
                <DecisionBadge decision={t.latest.decision} size="sm" showEnglish={false} />
              </div>
              {t.sector ?? (t.assetType ? ASSET_LABELS[t.assetType] : undefined) ? (
                <div className="mt-3 truncate text-xs text-muted">
                  {t.sector ?? ASSET_LABELS[t.assetType!]}
                </div>
              ) : null}
              <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-xs text-muted">
                <span className="font-mono tabular-nums">
                  {t.latest.date} {t.latest.timeLabel}
                </span>
                <span>{t.count} 份报告</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className={hasSummary ? "grid gap-8 lg:grid-cols-5" : ""}>
        <div className={hasSummary ? "lg:col-span-3" : ""}>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold tracking-tight">最近报告</h2>
            <Link href="/reports" className="text-sm text-[color:var(--accent)] hover:underline">
              全部报告 →
            </Link>
          </div>
          <div className="panel overflow-hidden rounded-xl">
            {recent.map((r) => (
              <ReportRow key={r.href} report={r} />
            ))}
          </div>
        </div>

        {summary ? (
          <div className="mt-8 lg:col-span-2 lg:mt-0">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-lg font-semibold tracking-tight">最新决策汇总</h2>
              <Link href="/summary" className="text-sm text-[color:var(--accent)] hover:underline">
                历史汇总 →
              </Link>
            </div>
            <div className="panel rounded-xl px-5 py-1">
              <Markdown>{summary.markdown}</Markdown>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
