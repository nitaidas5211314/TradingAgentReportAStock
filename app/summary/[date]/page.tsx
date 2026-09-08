import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "@/components/Markdown";
import { getSummaries, getSummary } from "@/lib/reports";

type Params = { params: Promise<{ date: string }> };

export function generateStaticParams() {
  return getSummaries().map((s) => ({ date: s.date }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { date } = await params;
  return { title: `决策汇总 ${date}` };
}

export default async function SummaryPage({ params }: Params) {
  const { date } = await params;
  const summary = getSummary(decodeURIComponent(date));
  if (!summary) notFound();

  return (
    <div className="space-y-6">
      <nav className="text-sm text-muted">
        <Link href="/summary" className="hover:underline">
          每日汇总
        </Link>
        <span className="mx-2">/</span>
        <span className="font-mono">{summary.date}</span>
      </nav>
      <article className="panel rounded-xl px-5 py-2 sm:px-8 sm:py-4">
        <Markdown>{summary.markdown}</Markdown>
      </article>
    </div>
  );
}
