import Link from "next/link";
import DecisionBadge from "./DecisionBadge";
import type { ReportMeta } from "@/lib/reports";

export default function ReportRow({
  report,
  showTicker = true,
}: {
  report: ReportMeta;
  showTicker?: boolean;
}) {
  return (
    <Link
      href={report.href}
      className="group flex items-center gap-4 border-b border-line px-4 py-3 transition last:border-b-0 hover:bg-[color:var(--bg)]"
    >
      <DecisionBadge decision={report.decision} size="sm" showEnglish={false} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          {showTicker ? (
            <span className="font-mono text-sm font-semibold">{report.ticker}</span>
          ) : null}
          {report.company ? (
            <span className="truncate text-sm text-muted">{report.company}</span>
          ) : null}
        </div>
        {report.summary ? (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted">{report.summary}</p>
        ) : null}
      </div>
      <div className="shrink-0 text-right text-xs text-muted">
        <div className="font-mono tabular-nums">{report.date}</div>
        <div className="font-mono tabular-nums opacity-70">{report.timeLabel}</div>
      </div>
      <span className="shrink-0 text-muted transition group-hover:translate-x-0.5">→</span>
    </Link>
  );
}
