import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import DecisionBadge from "@/components/DecisionBadge";
import Markdown from "@/components/Markdown";
import Toc from "@/components/Toc";
import { assetLabel } from "@/lib/labels";
import { getAllReports, getReport } from "@/lib/reports";

type Params = { params: Promise<{ ticker: string; date: string; slug: string }> };

export function generateStaticParams() {
  return getAllReports().map((r) => ({
    ticker: r.ticker,
    date: r.date,
    slug: r.slug,
  }));
}

async function resolve(params: Params["params"]) {
  const p = await params;
  return getReport(
    decodeURIComponent(p.ticker),
    decodeURIComponent(p.date),
    decodeURIComponent(p.slug),
  );
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const report = await resolve(params);
  if (!report) return { title: "报告未找到" };
  return {
    title: `${report.ticker} ${report.date} ${report.timeLabel}`,
    description: report.summary?.slice(0, 150) ?? report.title,
  };
}

/** 元信息小项 */
function Meta({ label, value }: { label: string; value?: React.ReactNode }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm">{value}</dd>
    </div>
  );
}

export default async function ReportPage({ params }: Params) {
  const report = await resolve(params);
  if (!report) notFound();

  // 同一标的的相邻报告（列表已按时间倒序）
  const siblings = getAllReports().filter((r) => r.ticker === report.ticker);
  const index = siblings.findIndex((r) => r.href === report.href);
  const newer = index > 0 ? siblings[index - 1] : undefined;
  const older = index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : undefined;

  // 正文去掉首行大标题与元信息列表，改由页面头部结构化展示
  const body = report.markdown.replace(/^#[^\n]*\n(?:\s*-[^\n]*\n)*/, "");

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <Link href="/reports" className="hover:underline">
          全部报告
        </Link>
        <span>/</span>
        <Link href={`/tickers/${report.ticker}`} className="font-mono hover:underline">
          {report.ticker}
        </Link>
        <span>/</span>
        <span className="font-mono">
          {report.date} {report.timeLabel}
        </span>
      </nav>

      <header className="panel rounded-xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-mono text-xl font-semibold tracking-tight sm:text-2xl">
              {report.ticker}
            </h1>
            <p className="mt-1 text-base">{report.company ?? report.title}</p>
            {report.sector ? (
              <p className="mt-0.5 text-sm text-muted">{report.sector}</p>
            ) : null}
          </div>
          <DecisionBadge decision={report.decision} size="lg" />
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-5 sm:grid-cols-3 lg:grid-cols-4">
          <Meta label="交易日" value={<span className="font-mono">{report.date}</span>} />
          <Meta label="生成时间" value={report.startedAtLabel ?? report.timeLabel} />
          <Meta label="资产类型" value={assetLabel(report.assetType)} />
          <Meta label="跑图耗时" value={report.duration} />
          <Meta
            label="分析师"
            value={report.analysts.length ? report.analysts.join("、") : undefined}
          />
          <Meta label="市场时区" value={report.marketTimezone} />
          <Meta label="模型" value={<span className="font-mono text-xs">{report.model}</span>} />
          <Meta label="参考买入价" value={report.entryPrice} />
          <Meta label="止损" value={report.stopLoss} />
          <Meta label="持有周期" value={report.timeHorizon} />
        </dl>

        {report.summary ? (
          <div className="mt-5 rounded-lg border border-line bg-[color:var(--bg)] p-4">
            <div className="text-xs font-semibold text-muted">风控执行摘要</div>
            <p className="mt-1.5 text-sm leading-relaxed">{report.summary}</p>
          </div>
        ) : null}
      </header>

      <div className="lg:grid lg:grid-cols-[1fr_15rem] lg:gap-8">
        <article className="panel min-w-0 rounded-xl px-5 py-2 sm:px-8 sm:py-4">
          <Markdown>{body}</Markdown>
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-8">
            <Toc items={report.sections} />
          </div>
        </aside>
      </div>

      <nav className="grid gap-3 sm:grid-cols-2">
        {older ? (
          <Link href={older.href} className="panel rounded-xl p-4 transition hover:border-[color:var(--accent)]">
            <div className="text-xs text-muted">← 更早一份</div>
            <div className="mt-1 font-mono text-sm">
              {older.date} {older.timeLabel}
            </div>
          </Link>
        ) : (
          <div />
        )}
        {newer ? (
          <Link
            href={newer.href}
            className="panel rounded-xl p-4 text-right transition hover:border-[color:var(--accent)]"
          >
            <div className="text-xs text-muted">更新一份 →</div>
            <div className="mt-1 font-mono text-sm">
              {newer.date} {newer.timeLabel}
            </div>
          </Link>
        ) : null}
      </nav>
    </div>
  );
}
