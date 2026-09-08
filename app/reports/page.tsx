import type { Metadata } from "next";
import ReportBrowser from "@/components/ReportBrowser";
import { getAllReportMetas } from "@/lib/reports";

export const metadata: Metadata = { title: "全部报告" };

export default function ReportsPage() {
  const reports = getAllReportMetas();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">全部报告</h1>
        <p className="mt-1 text-sm text-muted">按交易日倒序排列，可按标的与结论筛选。</p>
      </header>
      <ReportBrowser reports={reports} />
    </div>
  );
}
