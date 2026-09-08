import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import DecisionBadge from "@/components/DecisionBadge";
import ReportRow from "@/components/ReportRow";
import { getTicker, getTickers } from "@/lib/reports";

type Params = { params: Promise<{ ticker: string }> };

export function generateStaticParams() {
  return getTickers().map((t) => ({ ticker: t.ticker }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { ticker } = await params;
  const info = getTicker(decodeURIComponent(ticker));
  if (!info) return { title: ticker };
  return {
    title: info.company ? `${info.ticker} ${info.company}` : info.ticker,
    description: `${info.ticker} 的历史研究报告（共 ${info.count} 份）`,
  };
}

export default async function TickerPage({ params }: Params) {
  const info = getTicker(decodeURIComponent((await params).ticker));
  if (!info) notFound();

  const latest = info.latest;

  return (
    <div className="space-y-8">
      <nav className="text-sm text-muted">
        <Link href="/tickers" className="hover:underline">
          标的
        </Link>
        <span className="mx-2">/</span>
        <span className="font-mono">{info.ticker}</span>
      </nav>

      <header className="panel rounded-xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-mono text-2xl font-semibold tracking-tight">{info.ticker}</h1>
            <p className="mt-1 text-lg">{info.company ?? "—"}</p>
            <p className="mt-1 text-sm text-muted">
              {[info.sector, info.exchange].filter(Boolean).join(" · ") || "—"}
            </p>
          </div>
          <div className="text-right">
            <DecisionBadge decision={latest.decision} size="lg" />
            <p className="mt-2 font-mono text-xs tabular-nums text-muted">
              {latest.date} {latest.timeLabel}
            </p>
          </div>
        </div>

        {latest.summary ? (
          <p className="mt-5 border-t border-line pt-4 text-sm leading-relaxed text-muted">
            {latest.summary}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted">
          {latest.entryPrice ? <span>参考买入价：{latest.entryPrice}</span> : null}
          {latest.stopLoss ? <span>止损：{latest.stopLoss}</span> : null}
          {latest.timeHorizon ? <span>周期：{latest.timeHorizon}</span> : null}
        </div>

        <Link
          href={latest.href}
          className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-[color:var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          阅读最新完整报告 →
        </Link>
      </header>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">
          历史报告 <span className="text-sm font-normal text-muted">（{info.count} 份）</span>
        </h2>
        <div className="panel overflow-hidden rounded-xl">
          {info.reports.map((r) => (
            <ReportRow key={r.href} report={r} showTicker={false} />
          ))}
        </div>
      </section>
    </div>
  );
}
