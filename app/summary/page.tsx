import type { Metadata } from "next";
import Link from "next/link";
import Markdown from "@/components/Markdown";
import { getSummaries } from "@/lib/reports";

export const metadata: Metadata = { title: "每日决策汇总" };

export default function SummaryIndexPage() {
  const summaries = getSummaries();
  const [latest, ...rest] = summaries;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">每日决策汇总</h1>
        <p className="mt-1 text-sm text-muted">共 {summaries.length} 期。</p>
      </header>

      {latest ? (
        <section>
          <h2 className="mb-3 text-lg font-semibold tracking-tight">
            最新一期 <span className="font-mono text-sm font-normal text-muted">{latest.date}</span>
          </h2>
          <div className="panel rounded-xl px-5 py-2 sm:px-8">
            <Markdown>{latest.markdown}</Markdown>
          </div>
        </section>
      ) : (
        <div className="panel rounded-xl px-4 py-10 text-center text-sm text-muted">
          暂无汇总
        </div>
      )}

      {rest.length > 0 ? (
        <section>
          <h2 className="mb-3 text-lg font-semibold tracking-tight">往期</h2>
          <div className="panel overflow-hidden rounded-xl">
            {rest.map((s) => (
              <Link
                key={s.date}
                href={`/summary/${s.date}`}
                className="flex items-center justify-between border-b border-line px-4 py-3 transition last:border-b-0 hover:bg-[color:var(--bg)]"
              >
                <span className="font-mono text-sm">{s.date}</span>
                <span className="text-muted">→</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
